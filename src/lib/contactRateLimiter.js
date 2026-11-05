import crypto from 'crypto'
import fs from 'fs'
import os from 'os'
import path from 'path'

/**
 * Sistema de Rate Limiting Distribuido, Prevención de Duplicados (30 min),
 * Protección Anti-Abuso de Respuestas Automáticas por Destinatario, Cuota Global
 * del Conjunto de Correos y Cola Idempotente de Reintento de Confirmaciones.
 */

const STORAGE_DIR = process.env.VERCEL
  ? path.join(os.tmpdir(), 'gar-contact-security')
  : path.join(process.cwd(), '.storage', 'security')
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

    // Cuota global sobre el conjunto total de correos (internos + respuestas automáticas)
    globalEmails60mLimit: Number(process.env.CONTACT_RL_GLOBAL_EMAILS_60M || 60),
    globalEmails60mWindowMs: 60 * 60 * 1000,

    // Límites específicos de respuesta automática por dirección de destinatario (anti-backscatter)
    autoReplyCooldownMs: Number(process.env.CONTACT_AUTOREPLY_COOLDOWN_MIN || 60) * 60 * 1000,
    autoReply24hLimit: Number(process.env.CONTACT_AUTOREPLY_24H_MAX || 2),
    autoReply24hWindowMs: 24 * 60 * 60 * 1000,

    duplicateWindowMs: Number(process.env.CONTACT_DUPLICATE_TTL_MIN || 30) * 60 * 1000,
    turnstileTokenTtlMs: 15 * 60 * 1000,
    autoReplyTicketTtlMs: 24 * 60 * 60 * 1000,
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
    autoReplyRecipients: {},
    autoReplyTickets: {},
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
      autoReplyRecipients: parsed.autoReplyRecipients || {},
      autoReplyTickets: parsed.autoReplyTickets || {},
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
  for (const [key, expiresAt] of Object.entries(store.autoReplyRecipients)) {
    if (!expiresAt || expiresAt <= now) {
      delete store.autoReplyRecipients[key]
    }
  }
  for (const [key, ticket] of Object.entries(store.autoReplyTickets)) {
    if (!ticket || ticket.expiresAt <= now) {
      delete store.autoReplyTickets[key]
    }
  }
}

export function resetRateLimiterStoreForTests() {
  writePersistentStore(createEmptyStore())
}

/**
 * Extrae la IP del cliente únicamente de encabezados confiables de plataforma
 * (Cloudflare / Vercel) y evita confiar en encabezados arbitrarios manipulables.
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

  const redisRes = await executeUpstashPipeline([
    ['SET', `gar:ts:${tokenHash}`, '1', 'PX', String(turnstileTokenTtlMs), 'NX'],
  ])
  if (Array.isArray(redisRes) && redisRes[0]) {
    const wasSet = redisRes[0].result === 'OK'
    return { reused: !wasSet, tokenHash }
  }

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
  const globalEmails60mKey = 'global_emails_60m:all'
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

  // 5. Límite Global de consultas (30 / 60 min) o cuota global del conjunto de correos (60 / 60 min)
  if (
    getBucketCount(global60mKey) >= cfg.global60mLimit ||
    getBucketCount(globalEmails60mKey) >= cfg.globalEmails60mLimit
  ) {
    return {
      allowed: false,
      statusCode: 429,
      code: 'RATE_LIMIT_GLOBAL_60M',
      limitCategory: 'global_60m',
      globalQuotaAlert: true,
      messageHash,
    }
  }

  const incrementBucket = (key, windowMs, delta = 1) => {
    const existing = store.buckets[key]
    if (!existing || existing.expiresAt <= now) {
      store.buckets[key] = { count: delta, expiresAt: now + windowMs }
    } else {
      existing.count += delta
    }
  }

  incrementBucket(ip15mKey, cfg.ip15mWindowMs, 1)
  incrementBucket(ip24hKey, cfg.ip24hWindowMs, 1)
  incrementBucket(email60mKey, cfg.email60mWindowMs, 1)
  incrementBucket(global60mKey, cfg.global60mWindowMs, 1)
  // Contabilizar el correo interno en la cuota global del conjunto de correos
  incrementBucket(globalEmails60mKey, cfg.globalEmails60mWindowMs, 1)

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
 * Evalúa si corresponde enviar la confirmación automática al visitante para prevenir
 * abuso de respuestas automáticas a terceros (backscatter spam):
 * - Máximo 1 confirmación automática cada 60 minutos a la misma dirección.
 * - Máximo 2 confirmaciones automáticas cada 24 horas a la misma dirección.
 * - Verifica que el conjunto total de correos (`global_emails_60m:all`) no supere la cuota global.
 */
export function evaluateAndConsumeAutoReplyQuota({ email, now = Date.now() }) {
  const cfg = getRateLimitConfig()
  const store = readPersistentStore(now)

  const cooldownKey = hashKeyIdentifier('ar_cd', email)
  const dailyKey = hashKeyIdentifier('ar_24h', email)
  const globalEmails60mKey = 'global_emails_60m:all'

  // 1. Verificar ventana corta de enfriamiento por destinatario (60 min)
  if (store.autoReplyRecipients[cooldownKey] && store.autoReplyRecipients[cooldownKey] > now) {
    return {
      allowed: false,
      reason: 'AUTOREPLY_RECIPIENT_COOLDOWN_60M',
    }
  }

  // 2. Verificar tope diario de respuestas automáticas por destinatario (2 / 24h)
  const dailyBucket = store.buckets[dailyKey]
  const dailyCount = dailyBucket && dailyBucket.expiresAt > now ? dailyBucket.count : 0
  if (dailyCount >= cfg.autoReply24hLimit) {
    return {
      allowed: false,
      reason: 'AUTOREPLY_RECIPIENT_DAILY_LIMIT',
    }
  }

  // 3. Verificar cuota global del conjunto de correos (internos + respuestas automáticas)
  const globalEmailBucket = store.buckets[globalEmails60mKey]
  const globalEmailCount =
    globalEmailBucket && globalEmailBucket.expiresAt > now ? globalEmailBucket.count : 0
  if (globalEmailCount >= cfg.globalEmails60mLimit) {
    return {
      allowed: false,
      reason: 'AUTOREPLY_GLOBAL_EMAIL_QUOTA_EXCEEDED',
    }
  }

  // Reservar cuota de respuesta automática
  store.autoReplyRecipients[cooldownKey] = now + cfg.autoReplyCooldownMs
  if (!dailyBucket || dailyBucket.expiresAt <= now) {
    store.buckets[dailyKey] = { count: 1, expiresAt: now + cfg.autoReply24hWindowMs }
  } else {
    store.buckets[dailyKey].count += 1
  }

  if (!globalEmailBucket || globalEmailBucket.expiresAt <= now) {
    store.buckets[globalEmails60mKey] = { count: 1, expiresAt: now + cfg.globalEmails60mWindowMs }
  } else {
    store.buckets[globalEmails60mKey].count += 1
  }

  writePersistentStore(store)
  return {
    allowed: true,
    reason: 'OK',
    cooldownKey,
  }
}

export function releaseAutoReplyCooldownOnFailure({ cooldownKey }) {
  if (!cooldownKey) return
  const store = readPersistentStore()
  delete store.autoReplyRecipients[cooldownKey]
  writePersistentStore(store)
}

/**
 * Registra un ticket separado e idempotente cuando el correo interno a info@gastonramos.com.ar
 * fue aceptado pero falló el envío de la respuesta automática al visitante, permitiendo
 * gestionar un único reintento de la confirmación sin repetir la notificación interna.
 * No almacena el mensaje original del visitante.
 */
export function registerFailedAutoReplyTicket({
  requestId,
  nombre,
  email,
  errorCode,
  now = Date.now(),
}) {
  if (!requestId || !email) return null
  const cfg = getRateLimitConfig()
  const store = readPersistentStore(now)

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

  store.autoReplyTickets[requestId] = ticket
  writePersistentStore(store)
  return ticket
}

export function getAutoReplyTicket(requestId, now = Date.now()) {
  if (!requestId) return null
  const store = readPersistentStore(now)
  return store.autoReplyTickets[requestId] || null
}

export function updateAutoReplyTicketStatus(requestId, { status, messageId = null, errorCode = null }, now = Date.now()) {
  if (!requestId) return null
  const store = readPersistentStore(now)
  const ticket = store.autoReplyTickets[requestId]
  if (!ticket) return null

  ticket.status = status
  ticket.attempts = (ticket.attempts || 1) + 1
  ticket.updatedAt = new Date(now).toISOString()
  if (messageId) ticket.messageId = messageId
  if (errorCode) ticket.lastErrorCode = errorCode

  store.autoReplyTickets[requestId] = ticket
  writePersistentStore(store)
  return ticket
}

/**
 * Si el correo interno falla por razones técnicas, libera el bloqueo de mensaje duplicado
 * para que el usuario legítimo pueda volver a intentar enviar su consulta.
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
