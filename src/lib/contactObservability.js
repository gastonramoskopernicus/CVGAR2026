import crypto from 'crypto'
import fs from 'fs'
import path from 'path'

/**
 * Módulo de observabilidad y auditoría sin PII para el formulario de contacto GAR.
 * Registra eventos estructurados y contadores agregados distinguiendo:
 * - Solicitudes legítimas (legitimateRequests)
 * - Solicitudes bloqueadas por controles antiabuso (blockedRequests)
 * - Fallas de entrega del proveedor (deliveryFailures)
 * - Límites alcanzados por categoría (limitsReached)
 *
 * Cumple estrictamente:
 * - Cero mensajes completos en logs
 * - Cero tokens de Turnstile ni secretos en logs
 * - Minimización de PII (hashes SHA-256 truncados con sal de aplicación)
 */

const STORAGE_DIR = path.join(process.cwd(), '.storage', 'security')
const OBSERVABILITY_FILE = path.join(STORAGE_DIR, 'contact-observability.json')
const MAX_RECENT_EVENTS = 200

function ensureStorageDir() {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true })
  }
}

export function generateRequestId() {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return crypto.randomBytes(16).toString('hex')
}

export function hashIdentifierForAudit(value) {
  if (!value || typeof value !== 'string') return 'none'
  const salt = process.env.CONTACT_AUDIT_SALT || 'gar-contact-audit-v1'
  return crypto
    .createHash('sha256')
    .update(`${salt}:${value.trim().toLowerCase()}`)
    .digest('hex')
    .slice(0, 12)
}

function createInitialState() {
  return {
    updatedAt: new Date().toISOString(),
    counters: {
      totalRequests: 0,
      legitimateRequests: 0,
      blockedRequests: 0,
      deliveryFailures: 0,
      rejectedCount: 0,
      limitsReached: {
        ip_15m: 0,
        ip_24h: 0,
        email_60m: 0,
        global_60m: 0,
        duplicate_30m: 0,
        concurrency: 0,
      },
      reasons: {},
    },
    alerts: [],
    recentEvents: [],
  }
}

export function readObservabilityState() {
  try {
    ensureStorageDir()
    if (!fs.existsSync(OBSERVABILITY_FILE)) {
      return createInitialState()
    }
    const raw = fs.readFileSync(OBSERVABILITY_FILE, 'utf8')
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || !parsed.counters) {
      return createInitialState()
    }
    return parsed
  } catch {
    return createInitialState()
  }
}

function writeObservabilityState(state) {
  try {
    ensureStorageDir()
    const tmpFile = `${OBSERVABILITY_FILE}.${process.pid}.tmp`
    fs.writeFileSync(tmpFile, JSON.stringify(state, null, 2), 'utf8')
    fs.renameSync(tmpFile, OBSERVABILITY_FILE)
  } catch (err) {
    console.error('[contact-observability] Error persistiendo métricas:', err?.message)
  }
}

export function resetObservabilityForTests() {
  writeObservabilityState(createInitialState())
}

/**
 * Registra un evento de auditoría seguro (sin PII, sin mensaje, sin tokens).
 *
 * @param {Object} params
 * @param {string} params.requestId - Identificador único de solicitud
 * @param {string} params.validationResult - 'PASS' | 'BLOCKED_TURNSTILE' | 'BLOCKED_HONEYPOT' | 'BLOCKED_RATE_LIMIT' | 'BLOCKED_DUPLICATE' | 'BLOCKED_VALIDATION' | 'BLOCKED_PAYLOAD' | 'BLOCKED_CONCURRENCY'
 * @param {boolean} params.accepted - Si el envío fue finalmente aceptado y despachado
 * @param {string} params.technicalReason - Código técnico interno
 * @param {string} params.providerResult - Estado del proveedor ('CLOUDFLARE_OK', 'SMTP_OK', 'SKIPPED', 'PROVIDER_ERROR', etc.)
 * @param {string} [params.ip] - IP del cliente (se almacena solo hash truncado)
 * @param {string} [params.email] - Email declarado (se almacena solo hash truncado)
 * @param {string} [params.limitCategory] - Si alcanzó un rate limit ('ip_15m' | 'ip_24h' | 'email_60m' | 'global_60m' | 'duplicate_30m' | 'concurrency')
 * @param {boolean} [params.globalQuotaAlert] - Si debe dispararse alerta de cuota global alcanzada
 */
export function recordContactSecurityEvent({
  requestId,
  validationResult,
  accepted,
  technicalReason,
  providerResult = 'SKIPPED',
  ip = '',
  email = '',
  limitCategory = null,
  globalQuotaAlert = false,
}) {
  const timestamp = new Date().toISOString()
  const state = readObservabilityState()

  state.updatedAt = timestamp
  state.counters.totalRequests += 1

  if (accepted) {
    state.counters.legitimateRequests += 1
  } else {
    state.counters.rejectedCount += 1
    if (validationResult === 'PASS') {
      // Pasó todas las validaciones antiabuso pero falló el proveedor de correo
      state.counters.deliveryFailures += 1
    } else {
      // Bloqueado por controles antispam / antiabuso / validación
      state.counters.blockedRequests += 1
    }
  }

  if (limitCategory && state.counters.limitsReached[limitCategory] !== undefined) {
    state.counters.limitsReached[limitCategory] += 1
  }

  const reasonKey = technicalReason || 'UNKNOWN'
  state.counters.reasons[reasonKey] = (state.counters.reasons[reasonKey] || 0) + 1

  const safeEvent = {
    timestamp,
    requestId: requestId || generateRequestId(),
    validationResult,
    accepted: Boolean(accepted),
    technicalReason: reasonKey,
    providerResult,
    ipRef: hashIdentifierForAudit(ip),
    emailRef: hashIdentifierForAudit(email),
  }

  if (globalQuotaAlert) {
    const alertEntry = {
      timestamp,
      requestId: safeEvent.requestId,
      alertCode: 'GLOBAL_CONTACT_QUOTA_REACHED',
      detail: 'Se alcanzó el límite global de envíos del formulario (30/60m).',
    }
    state.alerts.unshift(alertEntry)
    state.alerts = state.alerts.slice(0, 50)
    console.warn('[SECURITY_ALERT][api/contact]', JSON.stringify(alertEntry))
  }

  state.recentEvents.unshift(safeEvent)
  if (state.recentEvents.length > MAX_RECENT_EVENTS) {
    state.recentEvents = state.recentEvents.slice(0, MAX_RECENT_EVENTS)
  }

  writeObservabilityState(state)

  // Log estructurado en servidor (sin PII ni contenido del mensaje ni tokens)
  const logLine = JSON.stringify({
    service: 'gar-contact-security',
    ...safeEvent,
  })
  if (accepted) {
    console.info('[api/contact][ACCEPTED]', logLine)
  } else if (validationResult === 'PASS') {
    console.error('[api/contact][DELIVERY_FAILURE]', logLine)
  } else {
    console.warn('[api/contact][BLOCKED]', logLine)
  }

  return safeEvent
}
