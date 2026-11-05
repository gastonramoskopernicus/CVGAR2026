import crypto from 'crypto'
import fs from 'fs'
import os from 'os'
import path from 'path'

/**
 * Sistema de Rate Limiting Atómico Centralizado (Fail-Closed) + Defensas Complementarias:
 *
 * Política obligatoria (evaluada atómicamente ANTES de invocar Cloudflare Email Sending):
 * - Intervalo mínimo de 60 segundos entre solicitudes aceptadas desde la misma IP.
 * - Máximo 3 consultas por IP cada 15 minutos.
 * - Máximo 10 consultas por IP cada 24 horas.
 * - Máximo 3 consultas por dirección de email cada 24 horas.
 * - Máximo 1 confirmación automática por email cada 60 minutos.
 * - Bloqueo de mensajes duplicados durante 30 minutos.
 * - Máximo global de 40 consultas aceptadas por día (24h), equivalentes a un máximo de 80 correos salientes.
 *
 * Motores centralizados soportados (sin requerir servicios pagos adicionales):
 * 1. Cloudflare D1 SQLite REST API (`CLOUDFLARE_D1_DATABASE_ID` + `CLOUDFLARE_ACCOUNT_ID` + token con D1:Edit, incluido en Workers Paid).
 * 2. Upstash Redis / Vercel KV REST API (`UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` o `KV_REST_API_URL` + `KV_REST_API_TOKEN`) mediante script Lua atómico (`EVAL`).
 * 3. Almacén central compartido con bloqueo inter-proceso (`.lock` atómico + cola mutex) exclusivamente para pruebas aisladas/multi-instancia en QA/desarrollo (`NODE_ENV !== 'production'` y fuera de Vercel).
 *
 * Comportamiento Fail-Closed:
 * - Si el almacenamiento centralizado no está configurado en producción/Vercel o falla/no responde,
 *   se bloquean temporalmente nuevos envíos (`HTTP 503`, `CENTRAL_RATE_LIMIT_STORE_UNAVAILABLE`)
 *   sin permitir que `/tmp` ni cookies HMAC autoricen el envío.
 */

const LOCAL_TMP_DIR = process.env.VERCEL
  ? path.join(os.tmpdir(), 'gar-contact-security')
  : path.join(process.cwd(), '.storage', 'security')

function resolveCentralDevStoreFile() {
  if (process.env.CONTACT_CENTRAL_STORE_FILE) {
    return process.env.CONTACT_CENTRAL_STORE_FILE
  }
  return path.join(LOCAL_TMP_DIR, 'contact-central-rate-limits.json')
}

export function getRateLimitConfig() {
  return {
    ipMinIntervalMs:
      process.env.CONTACT_RL_IP_MIN_INTERVAL_SEC !== undefined
        ? Number(process.env.CONTACT_RL_IP_MIN_INTERVAL_SEC) * 1000
        : 60 * 1000,

    ip15mLimit: Number(process.env.CONTACT_RL_IP_15M || 3),
    ip15mWindowMs: 15 * 60 * 1000,

    ip24hLimit: Number(process.env.CONTACT_RL_IP_24H || 10),
    ip24hWindowMs: 24 * 60 * 60 * 1000,

    email24hLimit: Number(process.env.CONTACT_RL_EMAIL_24H || process.env.CONTACT_RL_EMAIL_60M || 3),
    email24hWindowMs: 24 * 60 * 60 * 1000,

    global24hLimit: Number(process.env.CONTACT_RL_GLOBAL_24H || process.env.CONTACT_RL_GLOBAL_60M || 40),
    global24hWindowMs: 24 * 60 * 60 * 1000,

    globalEmails24hLimit: Number(
      process.env.CONTACT_RL_GLOBAL_EMAILS_24H || process.env.CONTACT_RL_GLOBAL_EMAILS_60M || 80
    ),
    globalEmails24hWindowMs: 24 * 60 * 60 * 1000,

    autoReplyCooldownMs: Number(process.env.CONTACT_AUTOREPLY_COOLDOWN_MIN || 60) * 60 * 1000,
    autoReply24hLimit: Number(process.env.CONTACT_AUTOREPLY_24H_MAX || 2),
    autoReply24hWindowMs: 24 * 60 * 60 * 1000,

    duplicateWindowMs: Number(process.env.CONTACT_DUPLICATE_TTL_MIN || 30) * 60 * 1000,
    turnstileTokenTtlMs: 15 * 60 * 1000,
    autoReplyTicketTtlMs: 24 * 60 * 60 * 1000,
  }
}

/**
 * Determina qué backend centralizado está configurado y disponible.
 * En Vercel / Producción NO se acepta el filesystem local `/tmp` como backend centralizado.
 */
export function resolveCentralStoreBackend(req = null) {
  const simFailHeader =
    process.env.NODE_ENV !== 'production' &&
    req?.headers?.['x-qa-test-suite'] === 'gar-antispam-qa' &&
    req?.headers?.['x-qa-simulate-store-failure'] === 'true'

  if (simFailHeader || process.env.CONTACT_SIMULATE_STORE_FAILURE === 'true') {
    return { type: 'UNAVAILABLE', reason: 'SIMULATED_CENTRAL_STORE_FAILURE' }
  }

  const redisUrl = (
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.KV_REST_API_URL ||
    ''
  ).trim()
  const redisToken = (
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.KV_REST_API_TOKEN ||
    ''
  ).trim()

  if (redisUrl && redisToken && redisToken !== '[SENSITIVE]') {
    return { type: 'REDIS_REST', url: redisUrl.replace(/\/$/, ''), token: redisToken }
  }

  const cfAccountId = (process.env.CLOUDFLARE_ACCOUNT_ID || '').trim()
  const cfD1DbId = (process.env.CLOUDFLARE_D1_DATABASE_ID || '').trim()
  const cfD1Token = (
    process.env.CLOUDFLARE_D1_API_TOKEN ||
    process.env.CLOUDFLARE_EMAIL_API_TOKEN ||
    ''
  ).trim()

  if (
    cfAccountId &&
    cfD1DbId &&
    cfD1Token &&
    cfAccountId !== '[SENSITIVE]' &&
    cfD1DbId !== '[SENSITIVE]' &&
    cfD1Token !== '[SENSITIVE]'
  ) {
    return {
      type: 'CLOUDFLARE_D1',
      accountId: cfAccountId,
      databaseId: cfD1DbId,
      token: cfD1Token,
    }
  }

  // En entorno Serverless de Vercel o Producción real, /tmp NO es compartido entre instancias:
  // si no hay Redis/KV ni D1 configurado, operar en FAIL-CLOSED estricto.
  const isServerlessOrProd =
    Boolean(process.env.VERCEL) ||
    process.env.NODE_ENV === 'production' ||
    process.env.CONTACT_REQUIRE_EXTERNAL_CENTRAL_STORE === 'true'

  if (isServerlessOrProd) {
    return {
      type: 'UNAVAILABLE',
      reason: 'CENTRAL_STORE_NOT_CONFIGURED_IN_PRODUCTION',
    }
  }

  // Solo en entorno local/QA controlado (fuera de Vercel) se permite el archivo central con lock atómico
  return {
    type: 'QA_SHARED_LOCK_STORE',
    filePath: resolveCentralDevStoreFile(),
  }
}

// Cola mutex en proceso + archivo .lock inter-proceso para garantizar atomicidad estricta
let inProcessMutex = Promise.resolve()

async function withAtomicFileLock(filePath, fn) {
  const prev = inProcessMutex
  let releaseInProcess
  inProcessMutex = new Promise((resolve) => {
    releaseInProcess = resolve
  })

  await prev
  const dir = path.dirname(filePath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  const lockFile = `${filePath}.lock`
  let lockFd = null

  try {
    for (let attempt = 0; attempt < 100; attempt++) {
      try {
        lockFd = fs.openSync(lockFile, 'wx')
        break
      } catch (err) {
        if (err?.code === 'EEXIST') {
          try {
            const stat = fs.statSync(lockFile)
            if (Date.now() - stat.mtimeMs > 5000) {
              fs.unlinkSync(lockFile)
              continue
            }
          } catch {}
          await new Promise((r) => setTimeout(r, 15))
          continue
        }
        throw err
      }
    }
    if (lockFd === null) {
      throw new Error('LOCK_ACQUISITION_TIMEOUT')
    }
    return await fn()
  } finally {
    if (lockFd !== null) {
      try {
        fs.closeSync(lockFd)
      } catch {}
      try {
        fs.unlinkSync(lockFile)
      } catch {}
    }
    releaseInProcess()
  }
}

function createEmptyStore() {
  return {
    buckets: {},
    duplicates: {},
    consumedTokens: {},
    idempotencyKeys: {},
    autoReplyRecipients: {},
    autoReplyTickets: {},
  }
}

function pruneExpiredEntries(store, now) {
  for (const [key, entry] of Object.entries(store.buckets)) {
    if (!entry || entry.expiresAt <= now) delete store.buckets[key]
  }
  for (const [key, expiresAt] of Object.entries(store.duplicates)) {
    if (!expiresAt || expiresAt <= now) delete store.duplicates[key]
  }
  for (const [key, expiresAt] of Object.entries(store.consumedTokens)) {
    if (!expiresAt || expiresAt <= now) delete store.consumedTokens[key]
  }
  for (const [key, expiresAt] of Object.entries(store.idempotencyKeys)) {
    if (!expiresAt || expiresAt <= now) delete store.idempotencyKeys[key]
  }
  for (const [key, expiresAt] of Object.entries(store.autoReplyRecipients)) {
    if (!expiresAt || expiresAt <= now) delete store.autoReplyRecipients[key]
  }
  for (const [key, ticket] of Object.entries(store.autoReplyTickets)) {
    if (!ticket || ticket.expiresAt <= now) delete store.autoReplyTickets[key]
  }
}

function readStoreSync(filePath, now = Date.now()) {
  if (!fs.existsSync(filePath)) return createEmptyStore()
  const raw = fs.readFileSync(filePath, 'utf8')
  const parsed = JSON.parse(raw)
  const store = {
    buckets: parsed?.buckets || {},
    duplicates: parsed?.duplicates || {},
    consumedTokens: parsed?.consumedTokens || {},
    idempotencyKeys: parsed?.idempotencyKeys || {},
    autoReplyRecipients: parsed?.autoReplyRecipients || {},
    autoReplyTickets: parsed?.autoReplyTickets || {},
  }
  pruneExpiredEntries(store, now)
  return store
}

function writeStoreSync(filePath, store) {
  const dir = path.dirname(filePath)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  const tmpFile = `${filePath}.${process.pid}.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`
  fs.writeFileSync(tmpFile, JSON.stringify(store), 'utf8')
  fs.renameSync(tmpFile, filePath)
}

export function resetRateLimiterStoreForTests() {
  const filePath = resolveCentralDevStoreFile()
  try {
    writeStoreSync(filePath, createEmptyStore())
  } catch {}
}

/**
 * Extrae la IP del cliente únicamente de encabezados confiables de plataforma (Cloudflare / Vercel).
 */
export function resolveTrustedClientIp(req) {
  const headers = req?.headers || {}

  if (
    process.env.NODE_ENV !== 'production' &&
    headers['x-qa-test-suite'] === 'gar-antispam-qa' &&
    typeof headers['x-qa-test-ip'] === 'string' &&
    headers['x-qa-test-ip'].trim()
  ) {
    return headers['x-qa-test-ip'].trim()
  }

  if (typeof headers['cf-connecting-ip'] === 'string' && headers['cf-connecting-ip'].trim()) {
    return headers['cf-connecting-ip'].trim()
  }

  if (
    typeof headers['x-vercel-forwarded-for'] === 'string' &&
    headers['x-vercel-forwarded-for'].trim()
  ) {
    return headers['x-vercel-forwarded-for'].split(',')[0].trim()
  }

  if (typeof headers['x-real-ip'] === 'string' && headers['x-real-ip'].trim()) {
    return headers['x-real-ip'].trim()
  }

  if (typeof headers['x-forwarded-for'] === 'string' && headers['x-forwarded-for'].trim()) {
    const hops = headers['x-forwarded-for']
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    if (hops.length > 0) {
      return hops[hops.length - 1]
    }
  }

  return req?.socket?.remoteAddress || '127.0.0.1'
}

export function computeNormalizedMessageHash({ email, nombre, mensaje }) {
  const normEmail = String(email || '')
    .trim()
    .toLowerCase()
  const normNombre = String(nombre || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
  const normMensaje = String(mensaje || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')

  return crypto
    .createHash('sha256')
    .update(`gar-dup-v1|${normEmail}|${normNombre}|${normMensaje}`)
    .digest('hex')
}

export function hashKeyIdentifier(prefix, rawValue) {
  const digest = crypto
    .createHash('sha256')
    .update(`gar-rl-v1|${prefix}|${String(rawValue || '').trim().toLowerCase()}`)
    .digest('hex')
    .slice(0, 32)
  return `${prefix}:${digest}`
}

async function executeUpstashPipeline(backend, commands) {
  const res = await fetch(`${backend.url}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${backend.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(commands),
  })
  if (!res.ok) {
    throw new Error(`UPSTASH_HTTP_${res.status}`)
  }
  const data = await res.json()
  if (!Array.isArray(data)) {
    throw new Error('UPSTASH_INVALID_RESPONSE')
  }
  return data
}

let d1SchemaInitialized = false

async function executeCloudflareD1Query(backend, sql, params = []) {
  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${backend.accountId}/d1/database/${backend.databaseId}/query`
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${backend.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sql, params }),
  })
  if (!res.ok) {
    throw new Error(`D1_HTTP_${res.status}`)
  }
  const data = await res.json()
  if (!data?.success) {
    throw new Error(`D1_API_ERROR_${data?.errors?.[0]?.code || 'UNKNOWN'}`)
  }
  return data.result?.[0]?.results || []
}

async function ensureD1Schema(backend) {
  if (d1SchemaInitialized) return
  await executeCloudflareD1Query(
    backend,
    `CREATE TABLE IF NOT EXISTS gar_rate_limits (
      k TEXT PRIMARY KEY,
      cnt INTEGER NOT NULL,
      exp INTEGER NOT NULL,
      meta TEXT
    );`
  )
  d1SchemaInitialized = true
}

/**
 * Verifica y marca un token de Turnstile como consumido (Single-Use) en el almacén central.
 * Si el almacén central no está disponible, opera en fail-closed (`storeError: true`).
 */
export async function checkAndConsumeTurnstileToken(rawToken, now = Date.now(), req = null) {
  if (!rawToken || typeof rawToken !== 'string') {
    return { reused: false }
  }

  const backend = resolveCentralStoreBackend(req)
  if (backend.type === 'UNAVAILABLE') {
    return { reused: false, storeUnavailable: true, reason: backend.reason }
  }

  const tokenHash = crypto
    .createHash('sha256')
    .update(`gar-turnstile-token|${rawToken.trim()}`)
    .digest('hex')
  const key = `ts:${tokenHash}`
  const { turnstileTokenTtlMs } = getRateLimitConfig()
  const expiresAt = now + turnstileTokenTtlMs

  try {
    if (backend.type === 'REDIS_REST') {
      const redisRes = await executeUpstashPipeline(backend, [
        ['SET', `gar:${key}`, '1', 'PX', String(turnstileTokenTtlMs), 'NX'],
      ])
      const wasSet = redisRes[0]?.result === 'OK'
      return { reused: !wasSet, tokenHash }
    }

    if (backend.type === 'CLOUDFLARE_D1') {
      await ensureD1Schema(backend)
      const rows = await executeCloudflareD1Query(
        backend,
        `INSERT INTO gar_rate_limits (k, cnt, exp) VALUES (?1, 1, ?2)
         ON CONFLICT(k) DO UPDATE SET cnt = CASE WHEN gar_rate_limits.exp <= ?3 THEN 1 ELSE gar_rate_limits.cnt + 1 END,
                                      exp = CASE WHEN gar_rate_limits.exp <= ?3 THEN ?2 ELSE gar_rate_limits.exp END
         RETURNING cnt;`,
        [key, expiresAt, now]
      )
      const cnt = Number(rows?.[0]?.cnt || 1)
      return { reused: cnt > 1, tokenHash }
    }

    return await withAtomicFileLock(backend.filePath, async () => {
      const store = readStoreSync(backend.filePath, now)
      if (store.consumedTokens[tokenHash] && store.consumedTokens[tokenHash] > now) {
        return { reused: true, tokenHash }
      }
      store.consumedTokens[tokenHash] = expiresAt
      writeStoreSync(backend.filePath, store)
      return { reused: false, tokenHash }
    })
  } catch (err) {
    return {
      reused: false,
      storeUnavailable: true,
      reason: err?.message || 'CENTRAL_STORE_ERROR',
    }
  }
}

/**
 * Script Lua atómico para Upstash Redis / Vercel KV:
 * Evalúa las 8 condiciones y, solo si todas pasan, incrementa atómicamente los contadores.
 */
const REDIS_EVALUATE_LUA = `
local idemKey = KEYS[1]
local dupKey = KEYS[2]
local ipIntKey = KEYS[3]
local ip15mKey = KEYS[4]
local ip24hKey = KEYS[5]
local email24hKey = KEYS[6]
local globalConsKey = KEYS[7]
local globalEmailsKey = KEYS[8]

local hasIdem = tonumber(ARGV[1])
local dupTtl = tonumber(ARGV[2])
local ipIntTtl = tonumber(ARGV[3])
local ip15mLimit = tonumber(ARGV[4])
local ip15mTtl = tonumber(ARGV[5])
local ip24hLimit = tonumber(ARGV[6])
local ip24hTtl = tonumber(ARGV[7])
local email24hLimit = tonumber(ARGV[8])
local email24hTtl = tonumber(ARGV[9])
local globalConsLimit = tonumber(ARGV[10])
local globalConsTtl = tonumber(ARGV[11])
local globalEmailsLimit = tonumber(ARGV[12])
local globalEmailsTtl = tonumber(ARGV[13])

if hasIdem == 1 and redis.call('EXISTS', idemKey) == 1 then
  return 'DUPLICATE_IDEMPOTENCY_KEY'
end
if redis.call('EXISTS', dupKey) == 1 then
  return 'DUPLICATE_MESSAGE_30M'
end
if ipIntTtl > 0 and redis.call('EXISTS', ipIntKey) == 1 then
  return 'RATE_LIMIT_IP_MIN_INTERVAL_60S'
end
if tonumber(redis.call('GET', ip15mKey) or '0') >= ip15mLimit then
  return 'RATE_LIMIT_IP_15M'
end
if tonumber(redis.call('GET', ip24hKey) or '0') >= ip24hLimit then
  return 'RATE_LIMIT_IP_24H'
end
if tonumber(redis.call('GET', email24hKey) or '0') >= email24hLimit then
  return 'RATE_LIMIT_EMAIL_24H'
end
if tonumber(redis.call('GET', globalConsKey) or '0') >= globalConsLimit then
  return 'RATE_LIMIT_GLOBAL_24H'
end
if tonumber(redis.call('GET', globalEmailsKey) or '0') >= globalEmailsLimit then
  return 'RATE_LIMIT_GLOBAL_24H'
end

local function incrWithTtl(k, ttl)
  local v = redis.call('INCR', k)
  if v == 1 then
    redis.call('PEXPIRE', k, ttl)
  end
  return v
end

if hasIdem == 1 then
  redis.call('SET', idemKey, '1', 'PX', dupTtl)
end
redis.call('SET', dupKey, '1', 'PX', dupTtl)
if ipIntTtl > 0 then
  redis.call('SET', ipIntKey, '1', 'PX', ipIntTtl)
end
incrWithTtl(ip15mKey, ip15mTtl)
incrWithTtl(ip24hKey, ip24hTtl)
incrWithTtl(email24hKey, email24hTtl)
incrWithTtl(globalConsKey, globalConsTtl)
incrWithTtl(globalEmailsKey, globalEmailsTtl)

return 'OK'
`

function mapRateLimitCodeToFailure(code, messageHash) {
  const categoryMap = {
    DUPLICATE_IDEMPOTENCY_KEY: 'duplicate_30m',
    DUPLICATE_MESSAGE_30M: 'duplicate_30m',
    RATE_LIMIT_IP_MIN_INTERVAL_60S: 'ip_interval_60s',
    RATE_LIMIT_IP_15M: 'ip_15m',
    RATE_LIMIT_IP_24H: 'ip_24h',
    RATE_LIMIT_EMAIL_24H: 'email_24h',
    RATE_LIMIT_GLOBAL_24H: 'global_24h',
  }
  return {
    allowed: false,
    statusCode: 429,
    code,
    limitCategory: categoryMap[code] || 'rate_limit',
    globalQuotaAlert: code === 'RATE_LIMIT_GLOBAL_24H',
    messageHash,
  }
}

/**
 * Evalúa y reserva atómicamente los límites del lado servidor ANTES de invocar Cloudflare Email Sending.
 * Opera en modo FAIL-CLOSED (`statusCode: 503`) si el almacenamiento centralizado no está disponible.
 */
export async function evaluateContactRateLimits({
  ip,
  email,
  nombre,
  mensaje,
  idempotencyKey = '',
  req = null,
  now = Date.now(),
}) {
  const cfg = getRateLimitConfig()
  const messageHash = computeNormalizedMessageHash({ email, nombre, mensaje })
  const ipIntKey = hashKeyIdentifier('ip_int60s', ip)
  const ip15mKey = hashKeyIdentifier('ip15m', ip)
  const ip24hKey = hashKeyIdentifier('ip24h', ip)
  const email24hKey = hashKeyIdentifier('email24h', email)
  const global24hKey = 'global24h:consultations'
  const globalEmails24hKey = 'global24h:emails'
  const cleanIdemKey =
    typeof idempotencyKey === 'string' &&
    idempotencyKey.trim().length > 0 &&
    idempotencyKey.trim().length <= 128
      ? hashKeyIdentifier('idem', idempotencyKey.trim())
      : null

  const backend = resolveCentralStoreBackend(req)
  if (backend.type === 'UNAVAILABLE') {
    return {
      allowed: false,
      statusCode: 503,
      code: 'CENTRAL_RATE_LIMIT_STORE_UNAVAILABLE',
      limitCategory: 'fail_closed_store_unavailable',
      failClosed: true,
      technicalDetail: backend.reason,
      messageHash,
    }
  }

  const effectiveIpMinIntervalMs =
    process.env.NODE_ENV !== 'production' &&
    req?.headers?.['x-qa-test-suite'] === 'gar-antispam-qa' &&
    req?.headers?.['x-qa-bypass-ip-interval'] === 'true'
      ? 0
      : cfg.ipMinIntervalMs

  try {
    if (backend.type === 'REDIS_REST') {
      const keys = [
        `gar:${cleanIdemKey || 'idem:none'}`,
        `gar:dup:${messageHash}`,
        `gar:${ipIntKey}`,
        `gar:${ip15mKey}`,
        `gar:${ip24hKey}`,
        `gar:${email24hKey}`,
        `gar:${global24hKey}`,
        `gar:${globalEmails24hKey}`,
      ]
      const args = [
        cleanIdemKey ? '1' : '0',
        String(cfg.duplicateWindowMs),
        String(effectiveIpMinIntervalMs),
        String(cfg.ip15mLimit),
        String(cfg.ip15mWindowMs),
        String(cfg.ip24hLimit),
        String(cfg.ip24hWindowMs),
        String(cfg.email24hLimit),
        String(cfg.email24hWindowMs),
        String(cfg.global24hLimit),
        String(cfg.global24hWindowMs),
        String(cfg.globalEmails24hLimit),
        String(cfg.globalEmails24hWindowMs),
      ]
      const res = await executeUpstashPipeline(backend, [
        ['EVAL', REDIS_EVALUATE_LUA, String(keys.length), ...keys, ...args],
      ])
      const outcome = res?.[0]?.result
      if (!outcome || res?.[0]?.error) {
        throw new Error(res?.[0]?.error || 'REDIS_EVAL_FAILED')
      }
      if (outcome !== 'OK') {
        return mapRateLimitCodeToFailure(outcome, messageHash)
      }
      return {
        allowed: true,
        statusCode: 200,
        code: 'OK',
        messageHash,
        cleanIdemKey,
        reservationKeys: { ipIntKey, ip15mKey, ip24hKey, email24hKey, global24hKey, globalEmails24hKey },
      }
    }

    if (backend.type === 'CLOUDFLARE_D1') {
      await ensureD1Schema(backend)
      const checkKeys = [
        cleanIdemKey || 'idem:none',
        `dup:${messageHash}`,
        ipIntKey,
        ip15mKey,
        ip24hKey,
        email24hKey,
        global24hKey,
        globalEmails24hKey,
      ]
      const rows = await executeCloudflareD1Query(
        backend,
        `SELECT k, cnt, exp FROM gar_rate_limits WHERE k IN (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8) AND exp > ?9;`,
        [...checkKeys, now]
      )
      const map = {}
      for (const r of rows) {
        map[r.k] = Number(r.cnt || 0)
      }
      if (cleanIdemKey && map[cleanIdemKey] > 0) {
        return mapRateLimitCodeToFailure('DUPLICATE_IDEMPOTENCY_KEY', messageHash)
      }
      if (map[`dup:${messageHash}`] > 0) {
        return mapRateLimitCodeToFailure('DUPLICATE_MESSAGE_30M', messageHash)
      }
      if (effectiveIpMinIntervalMs > 0 && map[ipIntKey] > 0) {
        return mapRateLimitCodeToFailure('RATE_LIMIT_IP_MIN_INTERVAL_60S', messageHash)
      }
      if ((map[ip15mKey] || 0) >= cfg.ip15mLimit) {
        return mapRateLimitCodeToFailure('RATE_LIMIT_IP_15M', messageHash)
      }
      if ((map[ip24hKey] || 0) >= cfg.ip24hLimit) {
        return mapRateLimitCodeToFailure('RATE_LIMIT_IP_24H', messageHash)
      }
      if ((map[email24hKey] || 0) >= cfg.email24hLimit) {
        return mapRateLimitCodeToFailure('RATE_LIMIT_EMAIL_24H', messageHash)
      }
      if (
        (map[global24hKey] || 0) >= cfg.global24hLimit ||
        (map[globalEmails24hKey] || 0) >= cfg.globalEmails24hLimit
      ) {
        return mapRateLimitCodeToFailure('RATE_LIMIT_GLOBAL_24H', messageHash)
      }

      const upserts = [
        [`dup:${messageHash}`, now + cfg.duplicateWindowMs],
        [ip15mKey, now + cfg.ip15mWindowMs],
        [ip24hKey, now + cfg.ip24hWindowMs],
        [email24hKey, now + cfg.email24hWindowMs],
        [global24hKey, now + cfg.global24hWindowMs],
        [globalEmails24hKey, now + cfg.globalEmails24hWindowMs],
      ]
      if (effectiveIpMinIntervalMs > 0) {
        upserts.push([ipIntKey, now + effectiveIpMinIntervalMs])
      }
      if (cleanIdemKey) {
        upserts.push([cleanIdemKey, now + cfg.duplicateWindowMs])
      }
      for (const [k, exp] of upserts) {
        await executeCloudflareD1Query(
          backend,
          `INSERT INTO gar_rate_limits (k, cnt, exp) VALUES (?1, 1, ?2)
           ON CONFLICT(k) DO UPDATE SET cnt = CASE WHEN gar_rate_limits.exp <= ?3 THEN 1 ELSE gar_rate_limits.cnt + 1 END,
                                        exp = CASE WHEN gar_rate_limits.exp <= ?3 THEN ?2 ELSE gar_rate_limits.exp END;`,
          [k, exp, now]
        )
      }
      return {
        allowed: true,
        statusCode: 200,
        code: 'OK',
        messageHash,
        cleanIdemKey,
        reservationKeys: { ipIntKey, ip15mKey, ip24hKey, email24hKey, global24hKey, globalEmails24hKey },
      }
    }

    // Backend QA_SHARED_LOCK_STORE (serializado atómicamente entre procesos/instancias de prueba)
    return await withAtomicFileLock(backend.filePath, async () => {
      const store = readStoreSync(backend.filePath, now)

      const getBucketCount = (key) => {
        const entry = store.buckets[key]
        if (!entry || entry.expiresAt <= now) return 0
        return entry.count
      }

      if (cleanIdemKey && store.idempotencyKeys[cleanIdemKey] > now) {
        return mapRateLimitCodeToFailure('DUPLICATE_IDEMPOTENCY_KEY', messageHash)
      }
      if (store.duplicates[messageHash] && store.duplicates[messageHash] > now) {
        return mapRateLimitCodeToFailure('DUPLICATE_MESSAGE_30M', messageHash)
      }
      if (effectiveIpMinIntervalMs > 0 && getBucketCount(ipIntKey) >= 1) {
        return mapRateLimitCodeToFailure('RATE_LIMIT_IP_MIN_INTERVAL_60S', messageHash)
      }
      if (getBucketCount(ip15mKey) >= cfg.ip15mLimit) {
        return mapRateLimitCodeToFailure('RATE_LIMIT_IP_15M', messageHash)
      }
      if (getBucketCount(ip24hKey) >= cfg.ip24hLimit) {
        return mapRateLimitCodeToFailure('RATE_LIMIT_IP_24H', messageHash)
      }
      if (getBucketCount(email24hKey) >= cfg.email24hLimit) {
        return mapRateLimitCodeToFailure('RATE_LIMIT_EMAIL_24H', messageHash)
      }
      if (
        getBucketCount(global24hKey) >= cfg.global24hLimit ||
        getBucketCount(globalEmails24hKey) >= cfg.globalEmails24hLimit
      ) {
        return mapRateLimitCodeToFailure('RATE_LIMIT_GLOBAL_24H', messageHash)
      }

      const incrementBucket = (key, windowMs, delta = 1) => {
        const existing = store.buckets[key]
        if (!existing || existing.expiresAt <= now) {
          store.buckets[key] = { count: delta, expiresAt: now + windowMs }
        } else {
          existing.count += delta
        }
      }

      if (effectiveIpMinIntervalMs > 0) {
        store.buckets[ipIntKey] = { count: 1, expiresAt: now + effectiveIpMinIntervalMs }
      }
      incrementBucket(ip15mKey, cfg.ip15mWindowMs, 1)
      incrementBucket(ip24hKey, cfg.ip24hWindowMs, 1)
      incrementBucket(email24hKey, cfg.email24hWindowMs, 1)
      incrementBucket(global24hKey, cfg.global24hWindowMs, 1)
      incrementBucket(globalEmails24hKey, cfg.globalEmails24hWindowMs, 1)

      store.duplicates[messageHash] = now + cfg.duplicateWindowMs
      if (cleanIdemKey) {
        store.idempotencyKeys[cleanIdemKey] = now + cfg.duplicateWindowMs
      }

      writeStoreSync(backend.filePath, store)
      return {
        allowed: true,
        statusCode: 200,
        code: 'OK',
        messageHash,
        cleanIdemKey,
        reservationKeys: { ipIntKey, ip15mKey, ip24hKey, email24hKey, global24hKey, globalEmails24hKey },
      }
    })
  } catch (err) {
    // Fail-closed ante cualquier error de comunicación o bloqueo del almacén centralizado
    return {
      allowed: false,
      statusCode: 503,
      code: 'CENTRAL_RATE_LIMIT_STORE_UNAVAILABLE',
      limitCategory: 'fail_closed_store_unavailable',
      failClosed: true,
      technicalDetail: err?.message || 'CENTRAL_STORE_EXCEPTION',
      messageHash,
    }
  }
}

/**
 * Evalúa y consume atómicamente la cuota de respuesta automática al visitante:
 * - Máximo 1 confirmación automática por email cada 60 minutos.
 * - Máximo 2 confirmaciones automáticas por email cada 24 horas.
 * - Verifica que el conjunto total de correos salientes no supere 80 por día (`global24h:emails`).
 */
export async function evaluateAndConsumeAutoReplyQuota({
  email,
  req = null,
  now = Date.now(),
}) {
  const cfg = getRateLimitConfig()
  const cooldownKey = hashKeyIdentifier('ar_cd', email)
  const dailyKey = hashKeyIdentifier('ar_24h', email)
  const globalEmails24hKey = 'global24h:emails'

  const backend = resolveCentralStoreBackend(req)
  if (backend.type === 'UNAVAILABLE') {
    return { allowed: false, reason: 'CENTRAL_RATE_LIMIT_STORE_UNAVAILABLE' }
  }

  try {
    if (backend.type === 'REDIS_REST') {
      const lua = `
        if redis.call('EXISTS', KEYS[1]) == 1 then return 'AUTOREPLY_RECIPIENT_COOLDOWN_60M' end
        if tonumber(redis.call('GET', KEYS[2]) or '0') >= tonumber(ARGV[2]) then return 'AUTOREPLY_RECIPIENT_DAILY_LIMIT' end
        if tonumber(redis.call('GET', KEYS[3]) or '0') >= tonumber(ARGV[4]) then return 'AUTOREPLY_GLOBAL_EMAIL_QUOTA_EXCEEDED' end
        redis.call('SET', KEYS[1], '1', 'PX', tonumber(ARGV[1]))
        local d = redis.call('INCR', KEYS[2])
        if d == 1 then redis.call('PEXPIRE', KEYS[2], tonumber(ARGV[3])) end
        local g = redis.call('INCR', KEYS[3])
        if g == 1 then redis.call('PEXPIRE', KEYS[3], tonumber(ARGV[5])) end
        return 'OK'
      `
      const res = await executeUpstashPipeline(backend, [
        [
          'EVAL',
          lua,
          '3',
          `gar:${cooldownKey}`,
          `gar:${dailyKey}`,
          `gar:${globalEmails24hKey}`,
          String(cfg.autoReplyCooldownMs),
          String(cfg.autoReply24hLimit),
          String(cfg.autoReply24hWindowMs),
          String(cfg.globalEmails24hLimit),
          String(cfg.globalEmails24hWindowMs),
        ],
      ])
      const outcome = res?.[0]?.result
      if (outcome !== 'OK') {
        return { allowed: false, reason: outcome || 'CENTRAL_STORE_ERROR' }
      }
      return { allowed: true, reason: 'OK', cooldownKey }
    }

    if (backend.type === 'CLOUDFLARE_D1') {
      await ensureD1Schema(backend)
      const rows = await executeCloudflareD1Query(
        backend,
        `SELECT k, cnt FROM gar_rate_limits WHERE k IN (?1, ?2, ?3) AND exp > ?4;`,
        [cooldownKey, dailyKey, globalEmails24hKey, now]
      )
      const map = {}
      for (const r of rows) map[r.k] = Number(r.cnt || 0)

      if (map[cooldownKey] > 0) {
        return { allowed: false, reason: 'AUTOREPLY_RECIPIENT_COOLDOWN_60M' }
      }
      if ((map[dailyKey] || 0) >= cfg.autoReply24hLimit) {
        return { allowed: false, reason: 'AUTOREPLY_RECIPIENT_DAILY_LIMIT' }
      }
      if ((map[globalEmails24hKey] || 0) >= cfg.globalEmails24hLimit) {
        return { allowed: false, reason: 'AUTOREPLY_GLOBAL_EMAIL_QUOTA_EXCEEDED' }
      }

      for (const [k, exp] of [
        [cooldownKey, now + cfg.autoReplyCooldownMs],
        [dailyKey, now + cfg.autoReply24hWindowMs],
        [globalEmails24hKey, now + cfg.globalEmails24hWindowMs],
      ]) {
        await executeCloudflareD1Query(
          backend,
          `INSERT INTO gar_rate_limits (k, cnt, exp) VALUES (?1, 1, ?2)
           ON CONFLICT(k) DO UPDATE SET cnt = CASE WHEN gar_rate_limits.exp <= ?3 THEN 1 ELSE gar_rate_limits.cnt + 1 END,
                                        exp = CASE WHEN gar_rate_limits.exp <= ?3 THEN ?2 ELSE gar_rate_limits.exp END;`,
          [k, exp, now]
        )
      }
      return { allowed: true, reason: 'OK', cooldownKey }
    }

    return await withAtomicFileLock(backend.filePath, async () => {
      const store = readStoreSync(backend.filePath, now)

      if (store.autoReplyRecipients[cooldownKey] && store.autoReplyRecipients[cooldownKey] > now) {
        return { allowed: false, reason: 'AUTOREPLY_RECIPIENT_COOLDOWN_60M' }
      }
      const dailyBucket = store.buckets[dailyKey]
      const dailyCount = dailyBucket && dailyBucket.expiresAt > now ? dailyBucket.count : 0
      if (dailyCount >= cfg.autoReply24hLimit) {
        return { allowed: false, reason: 'AUTOREPLY_RECIPIENT_DAILY_LIMIT' }
      }
      const globalEmailBucket = store.buckets[globalEmails24hKey]
      const globalEmailCount =
        globalEmailBucket && globalEmailBucket.expiresAt > now ? globalEmailBucket.count : 0
      if (globalEmailCount >= cfg.globalEmails24hLimit) {
        return { allowed: false, reason: 'AUTOREPLY_GLOBAL_EMAIL_QUOTA_EXCEEDED' }
      }

      store.autoReplyRecipients[cooldownKey] = now + cfg.autoReplyCooldownMs
      if (!dailyBucket || dailyBucket.expiresAt <= now) {
        store.buckets[dailyKey] = { count: 1, expiresAt: now + cfg.autoReply24hWindowMs }
      } else {
        store.buckets[dailyKey].count += 1
      }
      if (!globalEmailBucket || globalEmailBucket.expiresAt <= now) {
        store.buckets[globalEmails24hKey] = { count: 1, expiresAt: now + cfg.globalEmails24hWindowMs }
      } else {
        store.buckets[globalEmails24hKey].count += 1
      }

      writeStoreSync(backend.filePath, store)
      return { allowed: true, reason: 'OK', cooldownKey }
    })
  } catch {
    return { allowed: false, reason: 'CENTRAL_RATE_LIMIT_STORE_UNAVAILABLE' }
  }
}

export async function releaseAutoReplyCooldownOnFailure({ cooldownKey, req = null }) {
  if (!cooldownKey) return
  const backend = resolveCentralStoreBackend(req)
  try {
    if (backend.type === 'REDIS_REST') {
      await executeUpstashPipeline(backend, [['DEL', `gar:${cooldownKey}`]])
    } else if (backend.type === 'CLOUDFLARE_D1') {
      await executeCloudflareD1Query(backend, `DELETE FROM gar_rate_limits WHERE k = ?1;`, [cooldownKey])
    } else if (backend.type === 'QA_SHARED_LOCK_STORE') {
      await withAtomicFileLock(backend.filePath, async () => {
        const store = readStoreSync(backend.filePath)
        delete store.autoReplyRecipients[cooldownKey]
        writeStoreSync(backend.filePath, store)
      })
    }
  } catch {}
}

export async function registerFailedAutoReplyTicket({
  requestId,
  nombre,
  email,
  errorCode,
  req = null,
  now = Date.now(),
}) {
  if (!requestId || !email) return null
  const cfg = getRateLimitConfig()
  const ticket = {
    requestId,
    nombre: String(nombre || '').slice(0, 120),
    email: String(email || '').slice(0, 254),
    status: 'PENDING_RETRY',
    lastErrorCode: errorCode || 'AUTOREPLY_DISPATCH_FAILED',
    attempts: 1,
    maxAttempts: 2,
    createdAt: new Date(now).toISOString(),
    expiresAt: now + cfg.autoReplyTicketTtlMs,
  }

  const backend = resolveCentralStoreBackend(req)
  try {
    if (backend.type === 'REDIS_REST') {
      await executeUpstashPipeline(backend, [
        ['SET', `gar:ticket:${requestId}`, JSON.stringify(ticket), 'PX', String(cfg.autoReplyTicketTtlMs)],
      ])
    } else if (backend.type === 'CLOUDFLARE_D1') {
      await ensureD1Schema(backend)
      await executeCloudflareD1Query(
        backend,
        `INSERT OR REPLACE INTO gar_rate_limits (k, cnt, exp, meta) VALUES (?1, 1, ?2, ?3);`,
        [`ticket:${requestId}`, ticket.expiresAt, JSON.stringify(ticket)]
      )
    } else if (backend.type === 'QA_SHARED_LOCK_STORE') {
      await withAtomicFileLock(backend.filePath, async () => {
        const store = readStoreSync(backend.filePath, now)
        store.autoReplyTickets[requestId] = ticket
        writeStoreSync(backend.filePath, store)
      })
    }
  } catch {}
  return ticket
}

export async function getAutoReplyTicket(requestId, now = Date.now(), req = null) {
  if (!requestId) return null
  const backend = resolveCentralStoreBackend(req)
  try {
    if (backend.type === 'REDIS_REST') {
      const res = await executeUpstashPipeline(backend, [['GET', `gar:ticket:${requestId}`]])
      const raw = res?.[0]?.result
      return raw ? JSON.parse(raw) : null
    }
    if (backend.type === 'CLOUDFLARE_D1') {
      await ensureD1Schema(backend)
      const rows = await executeCloudflareD1Query(
        backend,
        `SELECT meta FROM gar_rate_limits WHERE k = ?1 AND exp > ?2;`,
        [`ticket:${requestId}`, now]
      )
      return rows?.[0]?.meta ? JSON.parse(rows[0].meta) : null
    }
    if (backend.type === 'QA_SHARED_LOCK_STORE') {
      return await withAtomicFileLock(backend.filePath, async () => {
        const store = readStoreSync(backend.filePath, now)
        return store.autoReplyTickets[requestId] || null
      })
    }
  } catch {}
  return null
}

export async function updateAutoReplyTicketStatus(
  requestId,
  { status, messageId = null, errorCode = null },
  now = Date.now(),
  req = null
) {
  if (!requestId) return null
  const backend = resolveCentralStoreBackend(req)
  try {
    const ticket = await getAutoReplyTicket(requestId, now, req)
    if (!ticket) return null
    ticket.status = status
    ticket.attempts = (ticket.attempts || 1) + 1
    ticket.updatedAt = new Date(now).toISOString()
    if (messageId) ticket.messageId = messageId
    if (errorCode) ticket.lastErrorCode = errorCode

    if (backend.type === 'REDIS_REST') {
      const ttl = Math.max(1000, (ticket.expiresAt || now + 3600000) - now)
      await executeUpstashPipeline(backend, [
        ['SET', `gar:ticket:${requestId}`, JSON.stringify(ticket), 'PX', String(ttl)],
      ])
    } else if (backend.type === 'CLOUDFLARE_D1') {
      await executeCloudflareD1Query(
        backend,
        `UPDATE gar_rate_limits SET meta = ?1 WHERE k = ?2;`,
        [JSON.stringify(ticket), `ticket:${requestId}`]
      )
    } else if (backend.type === 'QA_SHARED_LOCK_STORE') {
      await withAtomicFileLock(backend.filePath, async () => {
        const store = readStoreSync(backend.filePath, now)
        store.autoReplyTickets[requestId] = ticket
        writeStoreSync(backend.filePath, store)
      })
    }
    return ticket
  } catch {
    return null
  }
}

export async function releaseDuplicateLockOnFailure({ messageHash, cleanIdemKey, reservationKeys, req = null }) {
  const backend = resolveCentralStoreBackend(req)
  try {
    if (backend.type === 'REDIS_REST') {
      const cmds = []
      if (messageHash) cmds.push(['DEL', `gar:dup:${messageHash}`])
      if (cleanIdemKey) cmds.push(['DEL', `gar:${cleanIdemKey}`])
      if (reservationKeys?.ipIntKey) cmds.push(['DEL', `gar:${reservationKeys.ipIntKey}`])
      if (cmds.length > 0) await executeUpstashPipeline(backend, cmds)
    } else if (backend.type === 'CLOUDFLARE_D1') {
      const keysToDelete = [
        messageHash ? `dup:${messageHash}` : null,
        cleanIdemKey || null,
        reservationKeys?.ipIntKey || null,
      ].filter(Boolean)
      for (const k of keysToDelete) {
        await executeCloudflareD1Query(backend, `DELETE FROM gar_rate_limits WHERE k = ?1;`, [k])
      }
    } else if (backend.type === 'QA_SHARED_LOCK_STORE') {
      await withAtomicFileLock(backend.filePath, async () => {
        const store = readStoreSync(backend.filePath)
        if (messageHash) delete store.duplicates[messageHash]
        if (cleanIdemKey) delete store.idempotencyKeys[cleanIdemKey]
        if (reservationKeys?.ipIntKey) delete store.buckets[reservationKeys.ipIntKey]
        writeStoreSync(backend.filePath, store)
      })
    }
  } catch {}
}
