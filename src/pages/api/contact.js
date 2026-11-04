import {
  validateAndSanitizeContactInput,
  dispatchContactEmail,
  computeSubmissionFingerprint,
} from '@/lib/contactEmailService'

const USER_SAFE_ERROR_MSG =
  'No pudimos enviar tu mensaje en este momento. Por favor, intentá nuevamente.'

// Rate limit en memoria por IP (máximo 5 envíos por hora por origen)
const rateLimitMap = new Map()
// Mapa de huellas SHA-256 para prevenir envíos duplicados por doble clic (ventana de 60 segundos)
const recentSubmissionsMap = new Map()

export function resetContactRateLimitsForTests() {
  rateLimitMap.clear()
  recentSubmissionsMap.clear()
}

function resolveClientIp(req) {
  const forwarded = req.headers?.['x-forwarded-for']
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim()
  }
  return req.socket?.remoteAddress || 'unknown'
}

function checkRateLimit(ip) {
  const now = Date.now()
  const windowMs = 60 * 60 * 1000 // 1 hora
  const maxRequests = Number(process.env.CONTACT_RATE_LIMIT_MAX || 5)

  const entry = rateLimitMap.get(ip)
  if (!entry || now - entry.start > windowMs) {
    rateLimitMap.set(ip, { count: 1, start: now })
    return true
  }

  if (entry.count >= maxRequests) {
    return false
  }

  entry.count += 1
  return true
}

function isDuplicateSubmission(fingerprint) {
  const now = Date.now()
  const duplicateWindowMs = 60 * 1000 // 60 segundos
  const lastSeen = recentSubmissionsMap.get(fingerprint)
  if (lastSeen && now - lastSeen < duplicateWindowMs) {
    return true
  }
  recentSubmissionsMap.set(fingerprint, now)
  return false
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private')

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ ok: false, error: USER_SAFE_ERROR_MSG })
  }

  const body = req.body && typeof req.body === 'object' ? req.body : {}

  // Honeypot antispam — si un bot completa el campo oculto, descartar silenciosamente sin enviar correo ni disparar lead
  if (body._trap && String(body._trap).trim() !== '') {
    return res.status(200).json({ ok: true, providerAccepted: false, spamFiltered: true })
  }

  // Validación y sanitización server-side (antes de consumir cuota de rate limit por errores de tipeo)
  const validation = validateAndSanitizeContactInput(body)
  if (!validation.valid) {
    return res.status(400).json({
      ok: false,
      providerAccepted: false,
      code: validation.errorCode,
      error: USER_SAFE_ERROR_MSG,
    })
  }

  const ip = resolveClientIp(req)

  // Prevención de doble clic / reenvío idéntico en ventana corta
  const fingerprint = computeSubmissionFingerprint(
    ip,
    validation.data.email,
    validation.data.mensaje
  )
  if (isDuplicateSubmission(fingerprint)) {
    return res.status(409).json({
      ok: false,
      providerAccepted: false,
      code: 'DUPLICATE_SUBMISSION',
      error: USER_SAFE_ERROR_MSG,
    })
  }

  // Rate limit por origen
  if (!checkRateLimit(ip)) {
    recentSubmissionsMap.delete(fingerprint)
    return res.status(429).json({
      ok: false,
      providerAccepted: false,
      code: 'RATE_LIMITED',
      error: USER_SAFE_ERROR_MSG,
    })
  }

  const sendResult = await dispatchContactEmail(validation.data)

  if (!sendResult.ok || !sendResult.providerAccepted) {
    // Si falló el proveedor, liberar la huella para permitir que el usuario reintente legítimamente
    recentSubmissionsMap.delete(fingerprint)

    // Log seguro sin datos personales (sin nombre, email, teléfono ni mensaje)
    console.error('[api/contact] Fallo en despacho de correo:', {
      provider: sendResult.provider,
      errorCode: sendResult.errorCode,
      ccValid: sendResult.recipientsStatus?.ccStatus?.valid ?? false,
      timestamp: new Date().toISOString(),
    })

    const status =
      sendResult.errorCode === 'PROVIDER_TIMEOUT'
        ? 504
        : sendResult.errorCode === 'PROVIDER_CREDENTIALS_MISSING'
        ? 503
        : 502

    return res.status(status).json({
      ok: false,
      providerAccepted: false,
      code: sendResult.errorCode,
      error: USER_SAFE_ERROR_MSG,
    })
  }

  return res.status(200).json({
    ok: true,
    providerAccepted: true,
    provider: sendResult.provider,
    messageId: sendResult.messageId || null,
  })
}
