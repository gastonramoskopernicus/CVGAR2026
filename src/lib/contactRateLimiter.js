import crypto from 'crypto'
import fs from 'fs'
import os from 'os'
import path from 'path'

/**
 * Controles de frecuencia best-effort en instancia local (`/tmp/gar-contact-security` en Vercel)
 * sin requerir bases de datos adicionales (sin D1, Redis ni KV obligatorios).
 *
 * Alcance técnico documentado:
 * - En Vercel Serverless, `/tmp` persiste mientras la instancia (contenedor) permanece caliente,
 *   pero no constituye un rate limiting global distribuido entre múltiples instancias paralelas.
 * - Funciona en conjunto con Cloudflare Turnstile (verificado en servidor), Honeypot,
 *   validación estricta de campos, bloqueo de doble envío en UI y semáforo de concurrencia.
 */

const LOCAL_TMP_DIR = process.env.VERCEL
  ? path.join(os.tmpdir(), 'gar-contact-security')
  : path.join(process.cwd(), '.storage', 'security')

function resolveStoreFile() {
  if (process.env.CONTACT_CENTRAL_STORE_FILE) {
    return process.env.CONTACT_CENTRAL_STORE_FILE
  }
  return path.join(LOCAL_TMP_DIR, 'contact-rate-limits.json')
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

    email24hLimit: Number(process.env.CONTACT_RL_EMAIL_24H || 3),
    email24hWindowMs: 24 * 60 * 60 * 1000,

    global24hLimit: Number(process.env.CONTACT_RL_GLOBAL_24H || 40),
    global24hWindowMs: 24 * 60 * 60 * 1000,

    globalEmails24hLimit: Number(process.env.CONTACT_RL_GLOBAL_EMAILS_24H || 80),
    globalEmails24hWindowMs: 24 * 60 * 60 * 1000,

    autoReplyCooldownMs: Number(process.env.CONTACT_AUTOREPLY_COOLDOWN_MIN || 60) * 60 * 1000,
    autoReply24hLimit: Number(process.env.CONTACT_AUTOREPLY_24H_MAX || 2),
    autoReply24hWindowMs: 24 * 60 * 60 * 1000,

    duplicateWindowMs: Number(process.env.CONTACT_DUPLICATE_TTL_MIN || 30) * 60 * 1000,
    turnstileTokenTtlMs: 15 * 60 * 1000,
    autoReplyTicketTtlMs: 24 * 60 * 60 * 1000,
  }
}

let inProcessMutex = Promise.resolve()

async function withAtomicFileLock(filePath, fn) {
  const prev = inProcessMutex
  let releaseInProcess
  inProcessMutex = new Promise((resolve) => {
    releaseInProcess = resolve
  })

  await prev
  const dir = path.dirname(filePath)
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
  } catch {}

  const lockFile = `${filePath}.lock`
  let lockFd = null

  try {
    for (let attempt = 0; attempt < 60; attempt++) {
      try {
        lockFd = fs.openSync(lockFile, 'wx')
        break
      } catch (err) {
        if (err?.code === 'EEXIST') {
          try {
            const stat = fs.statSync(lockFile)
            if (Date.now() - stat.mtimeMs > 4000) {
              fs.unlinkSync(lockFile)
              continue
            }
          } catch {}
          await new Promise((r) => setTimeout(r, 15))
          continue
        }
        break
      }
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
  try {
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
  } catch {
    return createEmptyStore()
  }
}

function writeStoreSync(filePath, store) {
  try {
    const dir = path.dirname(filePath)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    const tmpFile = `${filePath}.${process.pid}.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`
    fs.writeFileSync(tmpFile, JSON.stringify(store), 'utf8')
    fs.renameSync(tmpFile, filePath)
  } catch (err) {
    console.error('[contact-rate-limiter] Error escribiendo store:', err?.message)
  }
}

export function resetRateLimiterStoreForTests() {
  const filePath = resolveStoreFile()
  writeStoreSync(filePath, createEmptyStore())
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

/**
 * Verifica y marca un token de Turnstile como consumido (Single-Use) en la instancia actual.
 */
export async function checkAndConsumeTurnstileToken(rawToken, now = Date.now()) {
  if (!rawToken || typeof rawToken !== 'string') {
    return { reused: false }
  }

  const tokenHash = crypto
    .createHash('sha256')
    .update(`gar-turnstile-token|${rawToken.trim()}`)
    .digest('hex')
  const { turnstileTokenTtlMs } = getRateLimitConfig()
  const expiresAt = now + turnstileTokenTtlMs
  const filePath = resolveStoreFile()

  return withAtomicFileLock(filePath, async () => {
    const store = readStoreSync(filePath, now)
    if (store.consumedTokens[tokenHash] && store.consumedTokens[tokenHash] > now) {
      return { reused: true, tokenHash }
    }
    store.consumedTokens[tokenHash] = expiresAt
    writeStoreSync(filePath, store)
    return { reused: false, tokenHash }
  })
}

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
 * Evalúa los controles de frecuencia disponibles en la instancia antes de invocar Cloudflare Email Sending,
 * sin requerir servicios de base de datos adicionales.
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

  const effectiveIpMinIntervalMs =
    process.env.NODE_ENV !== 'production' &&
    req?.headers?.['x-qa-test-suite'] === 'gar-antispam-qa' &&
    req?.headers?.['x-qa-bypass-ip-interval'] === 'true'
      ? 0
      : cfg.ipMinIntervalMs

  const filePath = resolveStoreFile()

  return withAtomicFileLock(filePath, async () => {
    const store = readStoreSync(filePath, now)

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

    writeStoreSync(filePath, store)
    return {
      allowed: true,
      statusCode: 200,
      code: 'OK',
      messageHash,
      cleanIdemKey,
      reservationKeys: { ipIntKey, ip15mKey, ip24hKey, email24hKey, global24hKey, globalEmails24hKey },
    }
  })
}

/**
 * Evalúa si corresponde enviar la confirmación automática al visitante:
 * - Máximo 1 confirmación automática por email cada 60 minutos.
 * - Máximo 2 confirmaciones automáticas por email cada 24 horas.
 */
export async function evaluateAndConsumeAutoReplyQuota({
  email,
  now = Date.now(),
}) {
  const cfg = getRateLimitConfig()
  const cooldownKey = hashKeyIdentifier('ar_cd', email)
  const dailyKey = hashKeyIdentifier('ar_24h', email)
  const globalEmails24hKey = 'global24h:emails'
  const filePath = resolveStoreFile()

  return withAtomicFileLock(filePath, async () => {
    const store = readStoreSync(filePath, now)

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

    writeStoreSync(filePath, store)
    return { allowed: true, reason: 'OK', cooldownKey }
  })
}

export async function releaseAutoReplyCooldownOnFailure({ cooldownKey }) {
  if (!cooldownKey) return
  const filePath = resolveStoreFile()
  await withAtomicFileLock(filePath, async () => {
    const store = readStoreSync(filePath)
    delete store.autoReplyRecipients[cooldownKey]
    writeStoreSync(filePath, store)
  })
}

export async function registerFailedAutoReplyTicket({
  requestId,
  nombre,
  email,
  errorCode,
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

  const filePath = resolveStoreFile()
  await withAtomicFileLock(filePath, async () => {
    const store = readStoreSync(filePath, now)
    store.autoReplyTickets[requestId] = ticket
    writeStoreSync(filePath, store)
  })
  return ticket
}

export async function getAutoReplyTicket(requestId, now = Date.now()) {
  if (!requestId) return null
  const filePath = resolveStoreFile()
  return withAtomicFileLock(filePath, async () => {
    const store = readStoreSync(filePath, now)
    return store.autoReplyTickets[requestId] || null
  })
}

export async function updateAutoReplyTicketStatus(
  requestId,
  { status, messageId = null, errorCode = null },
  now = Date.now()
) {
  if (!requestId) return null
  const filePath = resolveStoreFile()
  return withAtomicFileLock(filePath, async () => {
    const store = readStoreSync(filePath, now)
    const ticket = store.autoReplyTickets[requestId]
    if (!ticket) return null
    ticket.status = status
    ticket.attempts = (ticket.attempts || 1) + 1
    ticket.updatedAt = new Date(now).toISOString()
    if (messageId) ticket.messageId = messageId
    if (errorCode) ticket.lastErrorCode = errorCode
    store.autoReplyTickets[requestId] = ticket
    writeStoreSync(filePath, store)
    return ticket
  })
}

export async function releaseDuplicateLockOnFailure({ messageHash, cleanIdemKey, reservationKeys }) {
  const filePath = resolveStoreFile()
  await withAtomicFileLock(filePath, async () => {
    const store = readStoreSync(filePath)
    if (messageHash) delete store.duplicates[messageHash]
    if (cleanIdemKey) delete store.idempotencyKeys[cleanIdemKey]
    if (reservationKeys?.ipIntKey) delete store.buckets[reservationKeys.ipIntKey]
    writeStoreSync(filePath, store)
  })
}
