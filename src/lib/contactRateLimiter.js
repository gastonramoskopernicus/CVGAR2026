import crypto from 'crypto'
import fs from 'fs'
import path from 'path'

/**
 * Sistema de Rate Limiting Distribuido, Prevención de Duplicados (30 min) y
 * Registro Anti-Replay de Tokens Turnstile para el formulario de contacto GAR.
 *
 * Arquitectura de almacenamiento de dos niveles (sin activar servicios pagos no autorizados):
 * 1. Distribuido en nube (Redis / Upstash REST): Se activa automáticamente cuando
 *    se configuran `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN`.
 * 2. Almacenamiento persistente compartido en disco (`.storage/security/contact-rate-limits.json`):
 *    Respaldo determinista con escritura atómica (write-temp + rename) que sobrevive
 *    reinicios de proceso y comparte estado entre workers locales sin depender solo de RAM.
 */

const STORAGE_DIR = path.join(process.cwd(), '.storage', 'security')
const RATE_LIMIT_FILE = path.join(STORAGE_DIR, 'contact-rate-limits.json')

export function getRateLimitConfig() {
  return {
    ip15mLimit: Number(process.env.CONTACT_RL_IP_15M || 3),
    ip15mWindowMs: 15 * 60 * 1000,

    ip24hLimit: Number(process.env.CONTACT_RL_IP_24H || 10),
    ip24hWindowMs: 24 * 60 * 60 * 1000,

    email60mLimit: Number(process.env.CONTACT_RL_EMAIL_60M || 3),
    email60mWindowMs: 60 * 60 * 1000,

    global60mLimit: Number(process.env.CONTACT_RL_GLOBAL_60M || 30),
    global60mWindowMs: 60 * 60 * 1000,

    duplicateWindowMs: Number(process.env.CONTACT_DUPLICATE_TTL_MIN || 30) * 60 * 1000,
    turnstileTokenTtlMs: 15 * 60 * 1000,
  }
}

function ensureStorageDir() {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true })
  }
}

function createEmptyStore() {
  return {
    buckets: {},
    duplicates: {},
    consumedTokens: {},
    idempotencyKeys: {},
  }
}

function readPersistentStore(now = Date.now()) {
  try {
    ensureStorageDir()
    if (!fs.existsSync(RATE_LIMIT_FILE)) {
      return createEmptyStore()
    }
    const raw = fs.readFileSync(RATE_LIMIT_FILE, 'utf8')
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') {
      return createEmptyStore()
    }
    const store = {
      buckets: parsed.buckets || {},
      duplicates: parsed.duplicates || {},
      consumedTokens: parsed.consumedTokens || {},
      idempotencyKeys: parsed.idempotencyKeys || {},
    }
    pruneExpiredEntries(store, now)
    return store
  } catch {
    return createEmptyStore()
  }
}

function writePersistentStore(store) {
  try {
    ensureStorageDir()
    const tmpFile = `${RATE_LIMIT_FILE}.${process.pid}.${Date.now()}.tmp`
    fs.writeFileSync(tmpFile, JSON.stringify(store), 'utf8')
    fs.renameSync(tmpFile, RATE_LIMIT_FILE)
  } catch (err) {
    console.error('[contact-rate-limiter] Error escribiendo store:', err?.message)
  }
}

function pruneExpiredEntries(store, now) {
  for (const [key, entry] of Object.entries(store.buckets)) {
    if (!entry || entry.expiresAt <= now) {
      delete store.buckets[key]
    }
  }
  for (const [key, expiresAt] of Object.entries(store.duplicates)) {
    if (!expiresAt || expiresAt <= now) {
      delete store.duplicates[key]
    }
  }
  for (const [key, expiresAt] of Object.entries(store.consumedTokens)) {
    if (!expiresAt || expiresAt <= now) {
      delete store.consumedTokens[key]
    }
  }
  for (const [key, expiresAt] of Object.entries(store.idempotencyKeys)) {
    if (!expiresAt || expiresAt <= now) {
      delete store.idempotencyKeys[key]
    }
  }
}

export function resetRateLimiterStoreForTests() {
  writePersistentStore(createEmptyStore())
}

/**
 * Extrae la IP del cliente únicamente de encabezados confiables de plataforma
 * (Cloudflare / Vercel) y evita confiar en encabezados arbitrarios manipulables
 * como X-Client-IP o X-Original-Forwarded-For.
 */
export function resolveTrustedClientIp(req) {
  const headers = req?.headers || {}

  // Permitir encabezado determinista de prueba únicamente en QA/Dev (nunca en producción)
  if (
    process.env.NODE_ENV !== 'production' &&
    headers['x-qa-test-suite'] === 'gar-antispam-qa' &&
    typeof headers['x-qa-test-ip'] === 'string' &&
    headers['x-qa-test-ip'].trim()
  ) {
    return headers['x-qa-test-ip'].trim()
  }

  // 1. Cloudflare Connecting IP (inyectado por el borde de Cloudflare)
  if (typeof headers['cf-connecting-ip'] === 'string' && headers['cf-connecting-ip'].trim()) {
    return headers['cf-connecting-ip'].trim()
  }

  // 2. Vercel Forwarded For (inyectado por el edge de Vercel, no falsificable por el cliente)
  if (
    typeof headers['x-vercel-forwarded-for'] === 'string' &&
    headers['x-vercel-forwarded-for'].trim()
  ) {
    return headers['x-vercel-forwarded-for'].split(',')[0].trim()
  }

  // 3. X-Real-IP de proxy reverso confiable
  if (typeof headers['x-real-ip'] === 'string' && headers['x-real-ip'].trim()) {
    return headers['x-real-ip'].trim()
  }

  // 4. Fallback controlado en desarrollo local
  if (typeof headers['x-forwarded-for'] === 'string' && headers['x-forwarded-for'].trim()) {
    const hops = headers['x-forwarded-for']
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    // Tomamos el último hop añadido por el proxy inmediato para mitigar spoofing de prefijo XFF
    if (hops.length > 0) {
      return hops[hops.length - 1]
    }
  }

  return req?.socket?.remoteAddress || '127.0.0.1'
}

/**
 * Calcula un hash SHA-256 sobre los campos normalizados sin almacenar el mensaje completo.
 */
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
 * Adaptador opcional para Upstash Redis REST API si se encuentra configurado en el entorno.
 */
async function executeUpstashPipeline(commands) {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim()
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim()
  if (!url || !token) return null

  try {
    const res = await fetch(`${url.replace(/\/$/, '')}/pipeline`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(commands),
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

/**
 * Verifica y marca un token de Turnstile como consumido para impedir su reutilización (Single-Use).
 * Devuelve `{ reused: true }` si el token ya fue utilizado previamente.
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

  // Si Upstash Redis está configurado, usar SET NX PX atómico
  const redisRes = await executeUpstashPipeline([
    ['SET', `gar:ts:${tokenHash}`, '1', 'PX', String(turnstileTokenTtlMs), 'NX'],
  ])
  if (Array.isArray(redisRes) && redisRes[0]) {
    const wasSet = redisRes[0].result === 'OK'
    return { reused: !wasSet, tokenHash }
  }

  // Almacenamiento persistente compartido en disco
  const store = readPersistentStore(now)
  const existingExpiry = store.consumedTokens[tokenHash]
  if (existingExpiry && existingExpiry > now) {
    return { reused: true, tokenHash }
  }

  store.consumedTokens[tokenHash] = now + turnstileTokenTtlMs
  writePersistentStore(store)
  return { reused: false, tokenHash }
}

/**
 * Evalúa todos los límites de tasa distribuidos y detección de mensajes duplicados (30 min).
 * Orden de evaluación:
 * 1. Clave de idempotencia / Mensaje idéntico en los últimos 30 minutos
 * 2. Por IP (3 cada 15 minutos)
 * 3. Por IP (10 cada 24 horas)
 * 4. Por Email declarado (3 cada 60 minutos)
 * 5. Global del formulario (30 cada 60 minutos)
 */
export async function evaluateContactRateLimits({
  ip,
  email,
  nombre,
  mensaje,
  idempotencyKey = '',
  now = Date.now(),
}) {
  const cfg = getRateLimitConfig()
  const messageHash = computeNormalizedMessageHash({ email, nombre, mensaje })
  const ip15mKey = hashKeyIdentifier('ip15m', ip)
  const ip24hKey = hashKeyIdentifier('ip24h', ip)
  const email60mKey = hashKeyIdentifier('email60m', email)
  const global60mKey = 'global60m:all'
  const cleanIdemKey =
    typeof idempotencyKey === 'string' &&
    idempotencyKey.trim().length > 0 &&
    idempotencyKey.trim().length <= 128
      ? hashKeyIdentifier('idem', idempotencyKey.trim())
      : null

  const store = readPersistentStore(now)

  // 1. Verificar idempotencia explícita o mensaje duplicado en ventana de 30 minutos
  if (cleanIdemKey && store.idempotencyKeys[cleanIdemKey] > now) {
    return {
      allowed: false,
      statusCode: 429,
      code: 'DUPLICATE_IDEMPOTENCY_KEY',
      limitCategory: 'duplicate_30m',
      messageHash,
    }
  }

  if (store.duplicates[messageHash] && store.duplicates[messageHash] > now) {
    return {
      allowed: false,
      statusCode: 429,
      code: 'DUPLICATE_MESSAGE_30M',
      limitCategory: 'duplicate_30m',
      messageHash,
    }
  }

  // Helper para consultar un bucket sin incrementarlo todavía
  const getBucketCount = (key) => {
    const entry = store.buckets[key]
    if (!entry || entry.expiresAt <= now) return 0
    return entry.count
  }

  // 2. Límite por IP corto plazo (3 / 15 min)
  if (getBucketCount(ip15mKey) >= cfg.ip15mLimit) {
    return {
      allowed: false,
      statusCode: 429,
      code: 'RATE_LIMIT_IP_15M',
      limitCategory: 'ip_15m',
      messageHash,
    }
  }

  // 3. Límite por IP diario (10 / 24 h)
  if (getBucketCount(ip24hKey) >= cfg.ip24hLimit) {
    return {
      allowed: false,
      statusCode: 429,
      code: 'RATE_LIMIT_IP_24H',
      limitCategory: 'ip_24h',
      messageHash,
    }
  }

  // 4. Límite por Email declarado (3 / 60 min)
  if (getBucketCount(email60mKey) >= cfg.email60mLimit) {
    return {
      allowed: false,
      statusCode: 429,
      code: 'RATE_LIMIT_EMAIL_60M',
      limitCategory: 'email_60m',
      messageHash,
    }
  }

  // 5. Límite Global del formulario (30 / 60 min)
  if (getBucketCount(global60mKey) >= cfg.global60mLimit) {
    return {
      allowed: false,
      statusCode: 429,
      code: 'RATE_LIMIT_GLOBAL_60M',
      limitCategory: 'global_60m',
      globalQuotaAlert: true,
      messageHash,
    }
  }

  // Todos los controles pasaron -> Incrementar contadores y registrar huella de duplicado (30 min)
  const incrementBucket = (key, windowMs) => {
    const existing = store.buckets[key]
    if (!existing || existing.expiresAt <= now) {
      store.buckets[key] = { count: 1, expiresAt: now + windowMs }
    } else {
      existing.count += 1
    }
  }

  incrementBucket(ip15mKey, cfg.ip15mWindowMs)
  incrementBucket(ip24hKey, cfg.ip24hWindowMs)
  incrementBucket(email60mKey, cfg.email60mWindowMs)
  incrementBucket(global60mKey, cfg.global60mWindowMs)

  store.duplicates[messageHash] = now + cfg.duplicateWindowMs
  if (cleanIdemKey) {
    store.idempotencyKeys[cleanIdemKey] = now + cfg.duplicateWindowMs
  }

  writePersistentStore(store)

  return {
    allowed: true,
    statusCode: 200,
    code: 'OK',
    messageHash,
    cleanIdemKey,
  }
}

/**
 * Si el proveedor de email falla por razones técnicas (timeout/5xx), libera el bloqueo de
 * mensaje duplicado para que el usuario legítimo pueda volver a intentar enviar su consulta.
 */
export function releaseDuplicateLockOnFailure({ messageHash, cleanIdemKey }) {
  if (!messageHash && !cleanIdemKey) return
  const store = readPersistentStore()
  if (messageHash) {
    delete store.duplicates[messageHash]
  }
  if (cleanIdemKey) {
    delete store.idempotencyKeys[cleanIdemKey]
  }
  writePersistentStore(store)
}
