import crypto from 'crypto'

/**
 * Servicio determinista de validación, seguridad y despacho de doble correo para el
 * formulario de contacto GAR (gastonramos.com.ar), reutilizando el patrón productivo
 * `CloudflareEmailProvider` de `InspeXiona/src/lib/notifications/EmailNotificationProvider.ts`:
 *
 * 1. Correo Interno (Prioridad 1):
 *    - From: info@gastonramos.com.ar
 *    - To:   info@gastonramos.com.ar
 *    - Reply-To: email validado del visitante
 *    - Sin CC ni BCC (sin copias a Gmail ni Kopernicus)
 *
 * 2. Confirmación Automática al Visitante (Prioridad 2, Desacoplada):
 *    - From: info@gastonramos.com.ar
 *    - To:   email validado del visitante
 *    - Reply-To: info@gastonramos.com.ar
 *    - Asunto: Gracias por contactarme — Gastón Ramos
 *    - Sin incluir el mensaje original del visitante, sin enlaces promocionales ni adjuntos.
 */

export const FIELD_LIMITS = {
  nombre: 120,
  email: 254,
  empresa: 150,
  telefono: 40,
  mensaje: 3000,
}

export const MAX_PAYLOAD_BYTES = 16 * 1024 // 16 KB máximo total por solicitud
export const MAX_CONCURRENT_DISPATCHES = Number(process.env.CONTACT_MAX_CONCURRENCY || 3)

export const DEFAULT_INTERNAL_MAILBOX = 'info@gastonramos.com.ar'

/**
 * Extrae una dirección de correo limpia desde CLOUDFLARE_EMAIL_FROM (ej. "info@gastonramos.com.ar"
 * o "GAR <info@gastonramos.com.ar>"), asegurando que pertenezca al dominio autorizado o
 * utilizando por defecto info@gastonramos.com.ar.
 */
export function resolveInternalMailbox() {
  const raw = process.env.CLOUDFLARE_EMAIL_FROM?.trim()
  if (!raw || raw === '[SENSITIVE]') return DEFAULT_INTERNAL_MAILBOX
  const match = raw.match(/<([^>]+)>/)
  const candidate = (match ? match[1] : raw).trim().toLowerCase()
  if (candidate === DEFAULT_INTERNAL_MAILBOX) {
    return candidate
  }
  return DEFAULT_INTERNAL_MAILBOX
}

export const INTERNAL_MAILBOX = resolveInternalMailbox()
export const INTERNAL_FROM_NAME = 'GAR | gastonramos.com.ar'
export const AUTOREPLY_FROM_NAME = 'Gastón Alejandro Ramos'
export const EMAIL_SUBJECT = 'GAR — Nueva consulta desde el sitio web'
export const AUTOREPLY_SUBJECT = 'Gracias por contactarme — Gastón Ramos'
export const EMAIL_ORIGIN = 'gastonramos.com.ar'
export const CANONICAL_SITE_URL = 'https://gastonramos.com.ar'

const FORBIDDEN_OVERRIDE_FIELDS = [
  'to',
  'cc',
  'bcc',
  'from',
  'replyTo',
  'reply_to',
  'subject',
  'template',
  'html',
  'text',
  'apiKey',
  'api_key',
  'smtp',
  'headers',
]

const FORBIDDEN_ATTACHMENT_FIELDS = ['attachments', 'attachment', 'files', 'file', 'blob']

/**
 * Escapa caracteres HTML especiales para prevenir XSS / inyección HTML en clientes de correo.
 */
export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Elimina caracteres de control y saltos de línea para impedir Header Injection (CRLF).
 */
export function sanitizeHeaderValue(value) {
  return String(value ?? '').replace(/[\r\n\0]+/g, ' ').trim()
}

/**
 * Valida una dirección de email según RFC 5321 / RFC 5322 ASCII estricto.
 */
export function validateEmailAddress(rawEmail) {
  if (typeof rawEmail !== 'string') {
    return { valid: false, reason: 'EMPTY_OR_INVALID_TYPE' }
  }

  const trimmed = rawEmail.trim()
  if (!trimmed) {
    return { valid: false, reason: 'EMPTY' }
  }

  if (trimmed.length > FIELD_LIMITS.email) {
    return { valid: false, reason: 'TOO_LONG' }
  }

  if (/[\r\n\0]/.test(trimmed)) {
    return { valid: false, reason: 'HEADER_INJECTION_DETECTED' }
  }

  const parts = trimmed.split('@')
  if (parts.length !== 2) {
    return { valid: false, reason: 'MISSING_OR_MULTIPLE_AT' }
  }

  const [localPart, domainPart] = parts
  if (!localPart || !domainPart || localPart.length > 64) {
    return { valid: false, reason: 'INVALID_PART_LENGTH' }
  }

  if (/[^\x00-\x7F]/.test(localPart)) {
    return {
      valid: false,
      reason: 'NON_ASCII_LOCAL_PART',
      detail: 'La parte local contiene caracteres no-ASCII.',
    }
  }

  if (/[^\x00-\x7F]/.test(domainPart)) {
    return {
      valid: false,
      reason: 'NON_ASCII_DOMAIN',
      detail: 'El dominio contiene caracteres no-ASCII.',
    }
  }

  const asciiEmailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/

  if (!asciiEmailRegex.test(trimmed)) {
    return { valid: false, reason: 'INVALID_FORMAT' }
  }

  return { valid: true, normalized: trimmed.toLowerCase(), raw: trimmed }
}

/**
 * Resuelve la configuración fija de destinatario y remitente interno (`info@gastonramos.com.ar`),
 * garantizando ausencia total de CC y BCC.
 */
export function resolveConfiguredRecipients() {
  return {
    from: INTERNAL_MAILBOX,
    to: INTERNAL_MAILBOX,
    cc: null,
    bcc: null,
    toStatus: {
      configured: INTERNAL_MAILBOX,
      valid: true,
      reason: 'OK',
    },
    ccStatus: {
      configured: null,
      valid: false,
      reason: 'DISABLED_BY_DIRECTIVE',
      includedInSend: false,
    },
  }
}

/**
 * Valida y sanitiza la entrada del formulario en el servidor.
 */
export function validateAndSanitizeContactInput(body = {}) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { valid: false, errorCode: 'INVALID_PAYLOAD' }
  }

  try {
    const byteLength = Buffer.byteLength(JSON.stringify(body), 'utf8')
    if (byteLength > MAX_PAYLOAD_BYTES) {
      return { valid: false, errorCode: 'PAYLOAD_TOO_LARGE' }
    }
  } catch {
    return { valid: false, errorCode: 'INVALID_PAYLOAD' }
  }

  for (const field of FORBIDDEN_ATTACHMENT_FIELDS) {
    if (field in body && body[field] !== undefined && body[field] !== null) {
      return { valid: false, errorCode: 'ATTACHMENTS_FORBIDDEN' }
    }
  }

  for (const field of FORBIDDEN_OVERRIDE_FIELDS) {
    if (field in body) {
      return { valid: false, errorCode: 'RECIPIENT_OVERRIDE_FORBIDDEN' }
    }
  }

  const rawNombre = typeof body.nombre === 'string' ? body.nombre.trim() : ''
  const rawEmail = typeof body.email === 'string' ? body.email.trim() : ''
  const rawEmpresa = typeof body.empresa === 'string' ? body.empresa.trim() : ''
  const rawTelefono = typeof body.telefono === 'string' ? body.telefono.trim() : ''
  const rawMensaje = typeof body.mensaje === 'string' ? body.mensaje.trim() : ''

  if (
    /[\r\n\0]/.test(rawNombre) ||
    /[\r\n\0]/.test(rawEmail) ||
    /[\r\n\0]/.test(rawEmpresa) ||
    /[\r\n\0]/.test(rawTelefono)
  ) {
    return { valid: false, errorCode: 'HEADER_INJECTION_DETECTED' }
  }

  if (!rawNombre || !rawEmail || !rawMensaje) {
    return { valid: false, errorCode: 'MISSING_REQUIRED_FIELDS' }
  }

  if (
    rawNombre.length > FIELD_LIMITS.nombre ||
    rawEmail.length > FIELD_LIMITS.email ||
    rawEmpresa.length > FIELD_LIMITS.empresa ||
    rawTelefono.length > FIELD_LIMITS.telefono ||
    rawMensaje.length > FIELD_LIMITS.mensaje
  ) {
    return { valid: false, errorCode: 'FIELD_LENGTH_EXCEEDED' }
  }

  const emailValidation = validateEmailAddress(rawEmail)
  if (!emailValidation.valid) {
    return {
      valid: false,
      errorCode: 'INVALID_EMAIL',
      emailReason: emailValidation.reason,
    }
  }

  if (rawTelefono && !/^[0-9+\-() .\s]{1,40}$/.test(rawTelefono)) {
    return { valid: false, errorCode: 'INVALID_PHONE' }
  }

  const timestamp = new Date().toLocaleString('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    dateStyle: 'short',
    timeStyle: 'medium',
  })

  return {
    valid: true,
    data: {
      nombre: sanitizeHeaderValue(rawNombre),
      email: emailValidation.raw,
      empresa: rawEmpresa ? sanitizeHeaderValue(rawEmpresa) : 'No especificada',
      telefono: rawTelefono ? sanitizeHeaderValue(rawTelefono) : 'No especificado',
      mensaje: rawMensaje.replace(/\0/g, ''),
      timestamp,
      origin: EMAIL_ORIGIN,
    },
  }
}

/**
 * Construye el Correo 1 (Notificación interna a info@gastonramos.com.ar).
 */
export function buildContactEmailContent(data) {
  const safeNombre = escapeHtml(data.nombre)
  const safeEmail = escapeHtml(data.email)
  const safeEmpresa = escapeHtml(data.empresa)
  const safeTelefono = escapeHtml(data.telefono)
  const safeMensaje = escapeHtml(data.mensaje)
  const safeTimestamp = escapeHtml(data.timestamp)
  const safeOrigin = escapeHtml(data.origin || EMAIL_ORIGIN)

  const text = [
    'Nueva consulta recibida desde el sitio personal GAR',
    '',
    `Nombre: ${data.nombre}`,
    `Email: ${data.email}`,
    `Empresa: ${data.empresa}`,
    `Teléfono: ${data.telefono}`,
    `Mensaje: ${data.mensaje}`,
    `Fecha y hora: ${data.timestamp}`,
    `Origen: ${data.origin || EMAIL_ORIGIN}`,
  ].join('\n')

  const html = `<!DOCTYPE html>
<html lang="es-AR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(EMAIL_SUBJECT)}</title>
</head>
<body style="margin: 0; padding: 28px 14px; background-color: #0d0e11; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f5f2eb;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #14161b; border: 1px solid #262932; border-radius: 14px; overflow: hidden;">
    <tr>
      <td style="padding: 24px 32px; background-color: #0d0e11; border-bottom: 2px solid #f5b727;">
        <span style="font-size: 22px; font-weight: 800; letter-spacing: -0.03em; color: #f5f2eb;">GAR<span style="color: #f5b727;">.</span></span>
        <p style="margin: 6px 0 0 0; font-size: 13px; color: #9ca3af;">Nueva consulta recibida desde el sitio personal GAR</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 28px 32px;">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #262932; color: #9ca3af; width: 130px; vertical-align: top;">Nombre:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #262932; color: #f5f2eb; font-weight: 600;">${safeNombre}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #262932; color: #9ca3af; vertical-align: top;">Email:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #262932; color: #f5b727;"><a href="mailto:${safeEmail}" style="color: #f5b727; text-decoration: none;">${safeEmail}</a></td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #262932; color: #9ca3af; vertical-align: top;">Empresa:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #262932; color: #f5f2eb;">${safeEmpresa}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #262932; color: #9ca3af; vertical-align: top;">Teléfono:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #262932; color: #f5f2eb;">${safeTelefono}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #262932; color: #9ca3af; vertical-align: top;">Mensaje:</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #262932; color: #f5f2eb; white-space: pre-line; line-height: 1.6;">${safeMensaje}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #262932; color: #9ca3af; vertical-align: top;">Fecha y hora:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #262932; color: #d1d5db;">${safeTimestamp}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #9ca3af; vertical-align: top;">Origen:</td>
            <td style="padding: 10px 0; color: #d1d5db;">${safeOrigin}</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  return { subject: EMAIL_SUBJECT, text, html }
}

/**
 * Construye el Correo 2 (Confirmación automática personalizada al visitante).
 * Regla de seguridad: NUNCA incluye el mensaje original del visitante ni enlaces promocionales.
 */
export function buildVisitorAutoReplyContent({ nombre }) {
  const cleanNombre = sanitizeHeaderValue(nombre || 'Visitante')
  const safeNombre = escapeHtml(cleanNombre)

  const text = [
    `Hola ${cleanNombre},`,
    '',
    'Gracias por contactarme y por tu interés.',
    '',
    'Recibí correctamente tu mensaje y a la brevedad me pondré en contacto con vos para conocer mejor tu consulta y evaluar cómo puedo ayudarte.',
    '',
    'Saludos,',
    'Gastón Alejandro Ramos',
    'Estrategia · Tecnología · Transformación',
    CANONICAL_SITE_URL,
  ].join('\n')

  const html = `<!DOCTYPE html>
<html lang="es-AR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(AUTOREPLY_SUBJECT)}</title>
</head>
<body style="margin: 0; padding: 28px 14px; background-color: #0d0e11; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f5f2eb;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; margin: 0 auto; background-color: #14161b; border: 1px solid #262932; border-radius: 14px; overflow: hidden;">
    <tr>
      <td style="padding: 24px 32px; background-color: #0d0e11; border-bottom: 2px solid #f5b727;">
        <span style="font-size: 22px; font-weight: 800; letter-spacing: -0.03em; color: #f5f2eb;">GAR<span style="color: #f5b727;">.</span></span>
      </td>
    </tr>
    <tr>
      <td style="padding: 32px 32px 28px 32px; font-size: 15px; line-height: 1.7; color: #e5e7eb;">
        <p style="margin: 0 0 18px 0; font-size: 16px; font-weight: 600; color: #f5f2eb;">Hola ${safeNombre},</p>
        <p style="margin: 0 0 16px 0; color: #d1d5db;">Gracias por contactarme y por tu interés.</p>
        <p style="margin: 0 0 26px 0; color: #d1d5db;">Recibí correctamente tu mensaje y a la brevedad me pondré en contacto con vos para conocer mejor tu consulta y evaluar cómo puedo ayudarte.</p>
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="border-top: 1px solid #262932; padding-top: 20px;">
          <tr>
            <td style="padding-top: 20px;">
              <p style="margin: 0 0 6px 0; font-size: 14px; color: #9ca3af;">Saludos,</p>
              <p style="margin: 0 0 4px 0; font-size: 16px; font-weight: 700; color: #f5f2eb;">Gastón Alejandro Ramos</p>
              <p style="margin: 0 0 10px 0; font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #f5b727;">Estrategia &middot; Tecnología &middot; Transformación</p>
              <p style="margin: 0; font-size: 13px;"><a href="${CANONICAL_SITE_URL}" style="color: #d1d5db; text-decoration: none;">${CANONICAL_SITE_URL}</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  return { subject: AUTOREPLY_SUBJECT, text, html }
}

function isPlaceholderCredential(val) {
  if (!val || typeof val !== 'string') return true
  const clean = val.trim()
  if (!clean || clean === '[SENSITIVE]') return true
  if (clean.includes('tu-cuenta@') || clean.includes('tu_email') || /^x+(\s+x+)*$/i.test(clean)) {
    return true
  }
  return false
}

let activeDispatches = 0

export function getActiveDispatchCount() {
  return activeDispatches
}

/**
 * Función interna de bajo nivel que despacha un único mensaje de correo (sin CC ni BCC)
 * priorizando Cloudflare Email Sending REST API -> Resend REST API -> SMTP.
 */
async function sendEmailViaConfiguredProvider(
  { fromName, fromAddress, toAddress, replyToAddress, subject, html, text },
  { timeoutMs = 10000, fetchImpl = global.fetch, qaSimOutcome = null } = {}
) {
  if (process.env.NODE_ENV !== 'production' && qaSimOutcome) {
    if (qaSimOutcome === 'slow_ok') {
      await new Promise((r) => setTimeout(r, 120))
      return {
        ok: true,
        providerAccepted: true,
        provider: 'CLOUDFLARE_QA_DOUBLE',
        messageId: `qa-msg-${Date.now()}`,
        envelope: { from: fromAddress, to: toAddress, replyTo: replyToAddress, cc: null, bcc: null },
      }
    }
    if (qaSimOutcome === 'ok') {
      return {
        ok: true,
        providerAccepted: true,
        provider: 'CLOUDFLARE_QA_DOUBLE',
        messageId: `qa-msg-${Date.now()}`,
        envelope: { from: fromAddress, to: toAddress, replyTo: replyToAddress, cc: null, bcc: null },
      }
    }
    if (qaSimOutcome === 'fail_503') {
      return {
        ok: false,
        providerAccepted: false,
        provider: 'CLOUDFLARE_QA_DOUBLE',
        errorCode: 'PROVIDER_HTTP_503',
        envelope: { from: fromAddress, to: toAddress, replyTo: replyToAddress, cc: null, bcc: null },
      }
    }
    if (qaSimOutcome === 'timeout') {
      return {
        ok: false,
        providerAccepted: false,
        provider: 'CLOUDFLARE_QA_DOUBLE',
        errorCode: 'PROVIDER_TIMEOUT',
        envelope: { from: fromAddress, to: toAddress, replyTo: replyToAddress, cc: null, bcc: null },
      }
    }
  }

  const cfAccountId = process.env.CLOUDFLARE_ACCOUNT_ID?.trim()
  const cfApiToken = process.env.CLOUDFLARE_EMAIL_API_TOKEN?.trim()

  // 1. Proveedor Primario: Cloudflare Email Sending REST API
  if (!isPlaceholderCredential(cfAccountId) && !isPlaceholderCredential(cfApiToken)) {
    const endpoint = `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/email/sending/send`

    // Estricto: From info@gastonramos.com.ar, sin CC ni BCC
    const payload = {
      from: {
        address: fromAddress,
        name: fromName,
      },
      to: toAddress,
      reply_to: replyToAddress,
      subject,
      html,
      text,
    }

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const response = await fetchImpl(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${cfApiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        const cfCode = errData?.errors?.[0]?.code
        return {
          ok: false,
          providerAccepted: false,
          provider: 'CLOUDFLARE',
          errorCode: cfCode
            ? `PROVIDER_HTTP_${response.status}_CF_${cfCode}`
            : `PROVIDER_HTTP_${response.status}`,
        }
      }

      const resData = await response.json().catch(() => ({}))
      const isBounced = resData?.result?.permanent_bounces?.includes(toAddress)
      if (isBounced) {
        return {
          ok: false,
          providerAccepted: false,
          provider: 'CLOUDFLARE',
          errorCode: 'PERMANENT_BOUNCE',
        }
      }

      const messageId = resData?.result?.id || resData?.result?.message_id || null
      return {
        ok: true,
        providerAccepted: true,
        provider: 'CLOUDFLARE',
        messageId,
        envelope: { from: fromAddress, to: toAddress, replyTo: replyToAddress, cc: null, bcc: null },
      }
    } catch (err) {
      const isTimeout = err?.name === 'AbortError'
      return {
        ok: false,
        providerAccepted: false,
        provider: 'CLOUDFLARE',
        errorCode: isTimeout ? 'PROVIDER_TIMEOUT' : 'PROVIDER_NETWORK_ERROR',
      }
    } finally {
      clearTimeout(timer)
    }
  }

  // 2. Proveedor Secundario (Fallback idéntico a InspeXiona EmailNotificationProvider.ts): Resend REST API
  const resendApiKey = process.env.RESEND_API_KEY?.trim()
  if (!isPlaceholderCredential(resendApiKey)) {
    const resendPayload = {
      from: `${fromName} <${fromAddress}>`,
      to: [toAddress],
      reply_to: replyToAddress,
      subject,
      html,
      text,
    }

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const response = await fetchImpl('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resendPayload),
        signal: controller.signal,
      })

      if (!response.ok) {
        return {
          ok: false,
          providerAccepted: false,
          provider: 'RESEND',
          errorCode: `PROVIDER_HTTP_${response.status}`,
        }
      }

      const resData = await response.json().catch(() => ({}))
      return {
        ok: true,
        providerAccepted: true,
        provider: 'RESEND',
        messageId: resData?.id || null,
        envelope: { from: fromAddress, to: toAddress, replyTo: replyToAddress, cc: null, bcc: null },
      }
    } catch (err) {
      const isTimeout = err?.name === 'AbortError'
      return {
        ok: false,
        providerAccepted: false,
        provider: 'RESEND',
        errorCode: isTimeout ? 'PROVIDER_TIMEOUT' : 'PROVIDER_NETWORK_ERROR',
      }
    } finally {
      clearTimeout(timer)
    }
  }

  return {
    ok: false,
    providerAccepted: false,
    provider: 'UNCONFIGURED',
    errorCode: 'PROVIDER_CREDENTIALS_MISSING',
  }
}

/**
 * Envía el Correo 1 (Notificación interna obligatoria a info@gastonramos.com.ar).
 * From: info@gastonramos.com.ar | To: info@gastonramos.com.ar | Reply-To: visitante | Sin CC/BCC.
 */
export async function dispatchContactEmail(
  sanitizedData,
  { timeoutMs = 10000, fetchImpl = global.fetch, qaMockMode = null } = {}
) {
  const recipients = resolveConfiguredRecipients()
  const { subject, text, html } = buildContactEmailContent(sanitizedData)

  if (activeDispatches >= MAX_CONCURRENT_DISPATCHES) {
    return {
      ok: false,
      providerAccepted: false,
      provider: 'CONCURRENCY_GUARD',
      errorCode: 'CONCURRENCY_LIMIT_EXCEEDED',
      recipientsStatus: recipients,
    }
  }

  activeDispatches += 1
  try {
    let qaSimOutcome = null
    if (process.env.NODE_ENV !== 'production' && qaMockMode) {
      if (qaMockMode === 'slow_success') qaSimOutcome = 'slow_ok'
      else if (qaMockMode === 'unavailable') qaSimOutcome = 'fail_503'
      else if (qaMockMode === 'timeout') qaSimOutcome = 'timeout'
      else if (qaMockMode === 'success' || qaMockMode === 'internal_ok_autoreply_fail') {
        qaSimOutcome = 'ok'
      }
    }

    const res = await sendEmailViaConfiguredProvider(
      {
        fromName: INTERNAL_FROM_NAME,
        fromAddress: INTERNAL_MAILBOX,
        toAddress: INTERNAL_MAILBOX,
        replyToAddress: sanitizedData.email,
        subject,
        html,
        text,
      },
      { timeoutMs, fetchImpl, qaSimOutcome }
    )

    return {
      ...res,
      recipientsStatus: recipients,
    }
  } finally {
    activeDispatches = Math.max(0, activeDispatches - 1)
  }
}

/**
 * Envía el Correo 2 (Confirmación automática al visitante).
 * Solo debe invocarse DESPUÉS de que dispatchContactEmail (Correo 1) haya sido aceptado.
 * From: info@gastonramos.com.ar | To: visitante | Reply-To: info@gastonramos.com.ar | Sin CC/BCC.
 */
export async function dispatchVisitorAutoReplyEmail(
  { nombre, email },
  { timeoutMs = 10000, fetchImpl = global.fetch, qaMockMode = null } = {}
) {
  const { subject, text, html } = buildVisitorAutoReplyContent({ nombre })

  let qaSimOutcome = null
  if (process.env.NODE_ENV !== 'production' && qaMockMode) {
    if (qaMockMode === 'internal_ok_autoreply_fail' || qaMockMode === 'unavailable') {
      qaSimOutcome = 'fail_503'
    } else if (qaMockMode === 'timeout') {
      qaSimOutcome = 'timeout'
    } else if (qaMockMode === 'success' || qaMockMode === 'slow_success') {
      qaSimOutcome = 'ok'
    }
  }

  return sendEmailViaConfiguredProvider(
    {
      fromName: AUTOREPLY_FROM_NAME,
      fromAddress: INTERNAL_MAILBOX,
      toAddress: email,
      replyToAddress: INTERNAL_MAILBOX,
      subject,
      html,
      text,
    },
    { timeoutMs, fetchImpl, qaSimOutcome }
  )
}

/**
 * Calcula una huella no reversible (SHA-256) para prevenir doble clic / envíos duplicados
 * sin almacenar datos personales en memoria.
 */
export function computeSubmissionFingerprint(ip, email, mensaje) {
  return crypto
    .createHash('sha256')
    .update(`${ip || 'unknown'}|${String(email || '').toLowerCase()}|${String(mensaje || '').trim()}`)
    .digest('hex')
}
