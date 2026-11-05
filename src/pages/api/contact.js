import {
  validateAndSanitizeContactInput,
  dispatchContactEmail,
  dispatchVisitorAutoReplyEmail,
  MAX_PAYLOAD_BYTES,
} from '@/lib/contactEmailService'
import { verifyTurnstileToken, EXPECTED_TURNSTILE_ACTION } from '@/lib/turnstileVerify'
import {
  resolveTrustedClientIp,
  evaluateContactRateLimits,
  evaluateAndConsumeAutoReplyQuota,
  releaseAutoReplyCooldownOnFailure,
  registerFailedAutoReplyTicket,
  getAutoReplyTicket,
  updateAutoReplyTicketStatus,
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

  // Gestión separada e idempotente de reintento de confirmación automática (sin repetir notificación interna)
  const retryTicketId = req.headers?.['x-autoreply-retry-id']
  if (typeof retryTicketId === 'string' && retryTicketId.trim()) {
    const ticket = getAutoReplyTicket(retryTicketId.trim())
    if (!ticket) {
      return res.status(404).json({ ok: false, error: USER_SAFE_ERROR_MSG })
    }
    if (ticket.status === 'SENT') {
      return res.status(200).json({
        ok: true,
        alreadySent: true,
        autoReplyStatus: 'SENT',
        requestId: ticket.requestId,
      })
    }
    if ((ticket.attempts || 1) >= (ticket.maxAttempts || 2)) {
      return res.status(429).json({ ok: false, error: USER_RATE_LIMIT_MSG })
    }

    const qaMockMode = isQaHarness ? req.headers?.['x-qa-mock-provider'] || null : null
    const retryRes = await dispatchVisitorAutoReplyEmail(
      { nombre: ticket.nombre, email: ticket.email },
      { qaMockMode }
    )

    if (!retryRes.ok || !retryRes.providerAccepted) {
      updateAutoReplyTicketStatus(ticket.requestId, {
        status: 'RETRY_FAILED',
        errorCode: retryRes.errorCode || 'AUTOREPLY_RETRY_FAILED',
      })
      return res.status(502).json({ ok: false, error: USER_SAFE_ERROR_MSG })
    }

    updateAutoReplyTicketStatus(ticket.requestId, {
      status: 'SENT',
      messageId: retryRes.messageId || null,
    })
    return res.status(200).json({
      ok: true,
      autoReplyStatus: 'SENT',
      requestId: ticket.requestId,
    })
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

  // 2. Honeypot antispam — si está completo, bloquear envío sin llamar al proveedor
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

  // 3. Validación estricta de contenido, campos prohibidos y CRLF
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
    return res.status(400).json({
      ok: false,
      providerAccepted: false,
      error: USER_SAFE_ERROR_MSG,
    })
  }

  // 5. Rate Limiting Distribuido (IP 15m, IP 24h, Email 60m, Global 60m, Global Emails 60m) + Duplicados (30m)
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
    req,
    res,
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

  // 6. PRIORIDAD 1: Despacho del Correo Interno a info@gastonramos.com.ar (sin CC ni BCC)
  const qaMockMode = isQaHarness ? req.headers?.['x-qa-mock-provider'] || null : null
  const internalResult = await dispatchContactEmail(validation.data, { qaMockMode })

  if (!internalResult.ok || !internalResult.providerAccepted) {
    // Si el correo interno falla, liberar bloqueo de duplicado y NO generar confirmación al visitante
    releaseDuplicateLockOnFailure({
      messageHash: rateLimitResult.messageHash,
      cleanIdemKey: rateLimitResult.cleanIdemKey,
    })

    const isConcurrencyLimit = internalResult.errorCode === 'CONCURRENCY_LIMIT_EXCEEDED'

    recordContactSecurityEvent({
      requestId,
      validationResult: isConcurrencyLimit ? 'BLOCKED_CONCURRENCY' : 'PASS',
      accepted: false,
      technicalReason: internalResult.errorCode || 'PROVIDER_FAILURE',
      providerResult: `${internalResult.provider || 'UNKNOWN'}_${internalResult.errorCode || 'ERROR'}`,
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
      internalResult.errorCode === 'PROVIDER_TIMEOUT'
        ? 504
        : internalResult.errorCode === 'PROVIDER_CREDENTIALS_MISSING'
        ? 503
        : 502

    return res.status(status).json({
      ok: false,
      providerAccepted: false,
      error: USER_SAFE_ERROR_MSG,
    })
  }

  // 7. PRIORIDAD 2: Confirmación Automática al Visitante (solo tras aceptación del correo interno)
  let autoReplyStatus = 'SKIPPED'
  let autoReplyMessageId = null
  let autoReplyDeliveryState = null
  const autoReplyQuota = evaluateAndConsumeAutoReplyQuota({
    email: validation.data.email,
    ip,
    messageHash: rateLimitResult.messageHash,
    cleanIdemKey: rateLimitResult.cleanIdemKey,
    req,
    res,
  })

  if (!autoReplyQuota.allowed) {
    // No enviar respuesta automática repetida en ventana corta para proteger a terceros
    autoReplyStatus = autoReplyQuota.reason
  } else {
    const autoReplyRes = await dispatchVisitorAutoReplyEmail(
      {
        nombre: validation.data.nombre,
        email: validation.data.email,
      },
      { qaMockMode }
    )

    if (autoReplyRes.ok && autoReplyRes.providerAccepted) {
      autoReplyStatus = 'SENT'
      autoReplyMessageId = autoReplyRes.messageId || null
      autoReplyDeliveryState = autoReplyRes.deliveryState || 'API_ACCEPTED'
    } else {
      // Si falla la respuesta automática: NO repetir la notificación interna, registrar el error
      // y guardar ticket idempotente para permitir reintentar la confirmación por separado.
      autoReplyStatus = 'FAILED_PENDING_RETRY'
      releaseAutoReplyCooldownOnFailure({ cooldownKey: autoReplyQuota.cooldownKey })
      registerFailedAutoReplyTicket({
        requestId,
        nombre: validation.data.nombre,
        email: validation.data.email,
        errorCode: autoReplyRes.errorCode || 'AUTOREPLY_FAILED',
      })
    }
  }

  recordContactSecurityEvent({
    requestId,
    validationResult: 'PASS',
    accepted: true,
    technicalReason: autoReplyStatus === 'FAILED_PENDING_RETRY' ? 'INTERNAL_OK_AUTOREPLY_FAILED' : 'OK',
    providerResult: `${internalResult.provider}_INTERNAL_${internalResult.deliveryState || 'OK'}_AUTOREPLY_${autoReplyStatus}`,
    ip,
    email: validation.data.email,
  })

  // Mostrar éxito al visitante cuando su consulta fue aceptada para entrega a GAR, aunque falle la respuesta automática
  return res.status(200).json({
    ok: true,
    providerAccepted: true,
    internalDeliveryState: internalResult.deliveryState || 'API_ACCEPTED',
    internalMessageId: internalResult.messageId || null,
    autoReplyStatus,
    autoReplyDeliveryState,
    autoReplyMessageId,
    requestId,
  })
}
