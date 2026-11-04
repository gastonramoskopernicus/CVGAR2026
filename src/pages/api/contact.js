import {
  validateAndSanitizeContactInput,
  dispatchContactEmail,
  MAX_PAYLOAD_BYTES,
} from '@/lib/contactEmailService'
import { verifyTurnstileToken, EXPECTED_TURNSTILE_ACTION } from '@/lib/turnstileVerify'
import {
  resolveTrustedClientIp,
  evaluateContactRateLimits,
  releaseDuplicateLockOnFailure,
  resetRateLimiterStoreForTests,
} from '@/lib/contactRateLimiter'
import {
  generateRequestId,
  recordContactSecurityEvent,
  readObservabilityState,
  resetObservabilityForTests,
} from '@/lib/contactObservability'

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '16kb',
    },
  },
}

export const USER_SAFE_ERROR_MSG = 'No pudimos enviar tu mensaje. Intentá nuevamente.'
export const USER_RATE_LIMIT_MSG =
  'Se realizaron demasiados intentos. Por favor, volvé a probar más tarde.'

export function resetContactRateLimitsForTests() {
  resetRateLimiterStoreForTests()
  resetObservabilityForTests()
}

export default async function handler(req, res) {
  const requestId = generateRequestId()
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private')
  res.setHeader('X-Request-Id', requestId)

  // En entorno QA/Desarrollo, permitir comandos de soporte del arnés de pruebas automatizadas
  const isQaHarness =
    process.env.NODE_ENV !== 'production' && req.headers?.['x-qa-test-suite'] === 'gar-antispam-qa'

  if (isQaHarness && req.headers?.['x-qa-action'] === 'reset-state') {
    resetContactRateLimitsForTests()
    return res.status(200).json({ ok: true, reset: true })
  }

  if (isQaHarness && req.headers?.['x-qa-action'] === 'read-observability') {
    return res.status(200).json({ ok: true, observability: readObservabilityState() })
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ ok: false, error: USER_SAFE_ERROR_MSG })
  }

  const ip = resolveTrustedClientIp(req)
  const body = req.body && typeof req.body === 'object' ? req.body : {}

  // 1. Verificar tamaño máximo del payload (16 KB)
  try {
    const rawSize = Buffer.byteLength(JSON.stringify(body), 'utf8')
    if (rawSize > MAX_PAYLOAD_BYTES) {
      recordContactSecurityEvent({
        requestId,
        validationResult: 'BLOCKED_PAYLOAD',
        accepted: false,
        technicalReason: 'PAYLOAD_TOO_LARGE',
        providerResult: 'SKIPPED',
        ip,
      })
      return res.status(413).json({
        ok: false,
        providerAccepted: false,
        error: USER_SAFE_ERROR_MSG,
      })
    }
  } catch {
    recordContactSecurityEvent({
      requestId,
      validationResult: 'BLOCKED_PAYLOAD',
      accepted: false,
      technicalReason: 'INVALID_PAYLOAD',
      providerResult: 'SKIPPED',
      ip,
    })
    return res.status(400).json({
      ok: false,
      providerAccepted: false,
      error: USER_SAFE_ERROR_MSG,
    })
  }

  // 2. Honeypot antispam — si está completo, bloquear envío sin llamar al proveedor y registrar evento
  if (body._trap && String(body._trap).trim() !== '') {
    recordContactSecurityEvent({
      requestId,
      validationResult: 'BLOCKED_HONEYPOT',
      accepted: false,
      technicalReason: 'HONEYPOT_TRIGGERED',
      providerResult: 'SKIPPED',
      ip,
      email: typeof body.email === 'string' ? body.email : '',
    })
    return res.status(400).json({
      ok: false,
      providerAccepted: false,
      error: USER_SAFE_ERROR_MSG,
    })
  }

  // 3. Validación estricta de contenido, campos prohibidos (to, cc, bcc, from, template, attachments) y CRLF
  const validation = validateAndSanitizeContactInput(body)
  if (!validation.valid) {
    recordContactSecurityEvent({
      requestId,
      validationResult: 'BLOCKED_VALIDATION',
      accepted: false,
      technicalReason: validation.errorCode || 'VALIDATION_FAILED',
      providerResult: 'SKIPPED',
      ip,
      email: typeof body.email === 'string' ? body.email : '',
    })
    return res.status(400).json({
      ok: false,
      providerAccepted: false,
      error: USER_SAFE_ERROR_MSG,
    })
  }

  // 4. Validación server-side de Cloudflare Turnstile (Siteverify + Single-Use Token Ledger)
  const turnstileToken =
    typeof body.turnstileToken === 'string'
      ? body.turnstileToken
      : typeof body['cf-turnstile-response'] === 'string'
      ? body['cf-turnstile-response']
      : ''

  const turnstileCheck = await verifyTurnstileToken({
    token: turnstileToken,
    remoteip: ip,
    expectedAction: EXPECTED_TURNSTILE_ACTION,
  })

  if (!turnstileCheck.success) {
    recordContactSecurityEvent({
      requestId,
      validationResult: 'BLOCKED_TURNSTILE',
      accepted: false,
      technicalReason: turnstileCheck.errorCode || 'TURNSTILE_VERIFICATION_FAILED',
      providerResult: 'SKIPPED',
      ip,
      email: validation.data.email,
    })
    // No exponer detalles internos de validación de Turnstile al navegador
    return res.status(400).json({
      ok: false,
      providerAccepted: false,
      error: USER_SAFE_ERROR_MSG,
    })
  }

  // 5. Rate Limiting Distribuido (IP 15m, IP 24h, Email 60m, Global 60m) + Duplicados (30m)
  const idempotencyKey =
    typeof req.headers?.['x-idempotency-key'] === 'string'
      ? req.headers['x-idempotency-key']
      : typeof body.idempotencyKey === 'string'
      ? body.idempotencyKey
      : ''

  const rateLimitResult = await evaluateContactRateLimits({
    ip,
    email: validation.data.email,
    nombre: validation.data.nombre,
    mensaje: validation.data.mensaje,
    idempotencyKey,
  })

  if (!rateLimitResult.allowed) {
    const isDuplicate = rateLimitResult.limitCategory === 'duplicate_30m'
    recordContactSecurityEvent({
      requestId,
      validationResult: isDuplicate ? 'BLOCKED_DUPLICATE' : 'BLOCKED_RATE_LIMIT',
      accepted: false,
      technicalReason: rateLimitResult.code,
      providerResult: 'SKIPPED',
      ip,
      email: validation.data.email,
      limitCategory: rateLimitResult.limitCategory,
      globalQuotaAlert: Boolean(rateLimitResult.globalQuotaAlert),
    })

    return res.status(429).json({
      ok: false,
      providerAccepted: false,
      error: USER_RATE_LIMIT_MSG,
    })
  }

  // 6. Despacho seguro hacia el proveedor de email (con control de concurrencia y timeout)
  const qaMockMode = isQaHarness ? req.headers?.['x-qa-mock-provider'] || null : null
  const sendResult = await dispatchContactEmail(validation.data, { qaMockMode })

  if (!sendResult.ok || !sendResult.providerAccepted) {
    // Liberar bloqueo de mensaje duplicado cuando el fallo es del proveedor para permitir reintento legítimo
    releaseDuplicateLockOnFailure({
      messageHash: rateLimitResult.messageHash,
      cleanIdemKey: rateLimitResult.cleanIdemKey,
    })

    const isConcurrencyLimit = sendResult.errorCode === 'CONCURRENCY_LIMIT_EXCEEDED'

    recordContactSecurityEvent({
      requestId,
      validationResult: isConcurrencyLimit ? 'BLOCKED_CONCURRENCY' : 'PASS',
      accepted: false,
      technicalReason: sendResult.errorCode || 'PROVIDER_FAILURE',
      providerResult: `${sendResult.provider || 'UNKNOWN'}_${sendResult.errorCode || 'ERROR'}`,
      ip,
      email: validation.data.email,
      limitCategory: isConcurrencyLimit ? 'concurrency' : null,
    })

    if (isConcurrencyLimit) {
      return res.status(429).json({
        ok: false,
        providerAccepted: false,
        error: USER_RATE_LIMIT_MSG,
      })
    }

    const status =
      sendResult.errorCode === 'PROVIDER_TIMEOUT'
        ? 504
        : sendResult.errorCode === 'PROVIDER_CREDENTIALS_MISSING'
        ? 503
        : 502

    return res.status(status).json({
      ok: false,
      providerAccepted: false,
      error: USER_SAFE_ERROR_MSG,
    })
  }

  // 7. Éxito verificado -> Registrar evento legítimo aceptado
  recordContactSecurityEvent({
    requestId,
    validationResult: 'PASS',
    accepted: true,
    technicalReason: 'OK',
    providerResult: `${sendResult.provider}_OK`,
    ip,
    email: validation.data.email,
  })

  return res.status(200).json({
    ok: true,
    providerAccepted: true,
    requestId,
  })
}
