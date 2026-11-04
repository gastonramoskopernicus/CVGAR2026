import crypto from 'crypto'
import nodemailer from 'nodemailer'

/**
 * Servicio determinista de validación, seguridad y envío de correo para el formulario de contacto GAR.
 * Reutiliza el patrón arquitectónico de CloudflareEmailProvider implementado en InspeXiona
 * (`https://api.cloudflare.com/client/v4/accounts/{accountId}/email/sending/send`).
 */

export const FIELD_LIMITS = {
  nombre: 120,
  email: 254,
  empresa: 160,
  telefono: 40,
  mensaje: 4000,
}

export const DEFAULT_TO_EMAIL = 'gaston.alejandro.ramos@gmail.com'
export const DEFAULT_CC_EMAIL = 'ramos.gastón@kopernicus.tech'
export const EMAIL_SUBJECT = 'GAR | Nueva consulta desde gastonramos.com.ar'
export const EMAIL_ORIGIN = 'gastonramos.com.ar'

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
 * Valida una dirección de email según RFC 5321 / RFC 5322 y verifica si contiene
 * caracteres internacionales no-ASCII en la parte local o dominio.
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

  // Protección contra inyección de encabezados SMTP (CR / LF / NULL)
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

  // Detectar caracteres no-ASCII (ej. tilde 'ó' en 'ramos.gastón@kopernicus.tech')
  if (/[^\x00-\x7F]/.test(localPart)) {
    return {
      valid: false,
      reason: 'NON_ASCII_LOCAL_PART',
      detail:
        'La parte local contiene caracteres internacionales no-ASCII (ej. tilde), no admitidos por RFC 5321/5322 estándar ni Cloudflare Email API sin SMTPUTF8.',
    }
  }

  if (/[^\x00-\x7F]/.test(domainPart)) {
    return {
      valid: false,
      reason: 'NON_ASCII_DOMAIN',
      detail: 'El dominio contiene caracteres no-ASCII sin codificación Punycode.',
    }
  }

  // Validación estricta ASCII RFC 5322
  const asciiEmailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/

  if (!asciiEmailRegex.test(trimmed)) {
    return { valid: false, reason: 'INVALID_FORMAT' }
  }

  return { valid: true, normalized: trimmed.toLowerCase(), raw: trimmed }
}

/**
 * Resuelve y valida los destinatarios configurados del lado servidor.
 * Nunca permite que el frontend determine o sobrescriba destinatarios.
 * No sustituye automáticamente direcciones inválidas (ej. 'ramos.gastón@kopernicus.tech').
 */
export function resolveConfiguredRecipients() {
  const configuredTo = (process.env.CONTACT_TO_EMAIL || DEFAULT_TO_EMAIL).trim()
  const configuredCc = (
    process.env.CONTACT_CC_EMAIL !== undefined ? process.env.CONTACT_CC_EMAIL : DEFAULT_CC_EMAIL
  ).trim()

  const toCheck = validateEmailAddress(configuredTo)
  const ccCheck = configuredCc ? validateEmailAddress(configuredCc) : { valid: false, reason: 'NONE' }

  return {
    to: toCheck.valid ? toCheck.raw : DEFAULT_TO_EMAIL,
    toStatus: {
      configured: configuredTo,
      valid: toCheck.valid,
      reason: toCheck.reason || 'OK',
    },
    cc: ccCheck.valid ? ccCheck.raw : null,
    ccStatus: {
      configured: configuredCc,
      valid: ccCheck.valid,
      reason: ccCheck.reason || 'OK',
      detail: ccCheck.detail || null,
      includedInSend: ccCheck.valid,
    },
  }
}

/**
 * Valida y sanitiza la entrada del formulario en el servidor.
 */
export function validateAndSanitizeContactInput(body = {}) {
  if (!body || typeof body !== 'object') {
    return { valid: false, errorCode: 'INVALID_PAYLOAD' }
  }

  // rechazar cualquier intento de inyectar destinatarios desde el cliente
  if ('to' in body || 'cc' in body || 'bcc' in body) {
    return { valid: false, errorCode: 'RECIPIENT_OVERRIDE_FORBIDDEN' }
  }

  const rawNombre = typeof body.nombre === 'string' ? body.nombre.trim() : ''
  const rawEmail = typeof body.email === 'string' ? body.email.trim() : ''
  const rawEmpresa = typeof body.empresa === 'string' ? body.empresa.trim() : ''
  const rawTelefono = typeof body.telefono === 'string' ? body.telefono.trim() : ''
  const rawMensaje = typeof body.mensaje === 'string' ? body.mensaje.trim() : ''

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

  if (/[\r\n\0]/.test(rawNombre) || /[\r\n\0]/.test(rawEmpresa) || /[\r\n\0]/.test(rawTelefono)) {
    return { valid: false, errorCode: 'HEADER_INJECTION_DETECTED' }
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
 * Construye el correo en formato HTML (identidad GAR) y alternativa de texto plano.
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

function parseFromHeader(fromVal) {
  const raw = String(fromVal || '').trim()
  const match = raw.match(/^(.*)<([^>]+)>$/)
  if (match) {
    return {
      name: match[1].trim().replace(/^["']|["']$/g, '') || 'GAR | gastonramos.com.ar',
      address: match[2].trim(),
    }
  }
  return {
    name: process.env.CLOUDFLARE_EMAIL_FROM_NAME || 'GAR | gastonramos.com.ar',
    address: raw || 'notificaciones@mail.inspexiona.com.ar',
  }
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

/**
 * Envía el correo utilizando el patrón CloudflareEmailProvider de InspeXiona
 * (`https://api.cloudflare.com/client/v4/accounts/{accountId}/email/sending/send`).
 * Incluye control de timeout (`AbortController`), Reply-To seguro al visitante y From institucional.
 */
export async function dispatchContactEmail(
  sanitizedData,
  { timeoutMs = 10000, fetchImpl = global.fetch } = {}
) {
  const recipients = resolveConfiguredRecipients()
  const { subject, text, html } = buildContactEmailContent(sanitizedData)

  const cfAccountId = process.env.CLOUDFLARE_ACCOUNT_ID?.trim()
  const cfApiToken = process.env.CLOUDFLARE_EMAIL_API_TOKEN?.trim()
  const rawFrom =
    process.env.CLOUDFLARE_EMAIL_FROM ||
    process.env.CLOUDFLARE_EMAIL_FROM_ADDRESS ||
    'GAR | gastonramos.com.ar <notificaciones@mail.inspexiona.com.ar>'
  const { address: fromAddress, name: fromName } = parseFromHeader(rawFrom)

  // 1. Proveedor Primario: Cloudflare Email Sending REST API (Patrón InspeXiona)
  if (!isPlaceholderCredential(cfAccountId) && !isPlaceholderCredential(cfApiToken)) {
    const endpoint = `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/email/sending/send`

    const payload = {
      from: {
        address: fromAddress,
        name: fromName,
      },
      to: recipients.to,
      reply_to: sanitizedData.email,
      subject,
      html,
      text,
    }

    if (recipients.cc) {
      payload.cc = recipients.cc
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
        return {
          ok: false,
          providerAccepted: false,
          provider: 'CLOUDFLARE',
          errorCode: `PROVIDER_HTTP_${response.status}`,
          recipientsStatus: recipients,
        }
      }

      const resData = await response.json().catch(() => ({}))
      const isBounced = resData?.result?.permanent_bounces?.includes(recipients.to)
      if (isBounced) {
        return {
          ok: false,
          providerAccepted: false,
          provider: 'CLOUDFLARE',
          errorCode: 'PERMANENT_BOUNCE',
          recipientsStatus: recipients,
        }
      }

      const messageId = resData?.result?.id || resData?.result?.message_id || null
      return {
        ok: true,
        providerAccepted: true,
        provider: 'CLOUDFLARE',
        messageId,
        recipientsStatus: recipients,
      }
    } catch (err) {
      const isTimeout = err?.name === 'AbortError'
      return {
        ok: false,
        providerAccepted: false,
        provider: 'CLOUDFLARE',
        errorCode: isTimeout ? 'PROVIDER_TIMEOUT' : 'PROVIDER_NETWORK_ERROR',
        recipientsStatus: recipients,
      }
    } finally {
      clearTimeout(timer)
    }
  }

  // 2. Fallback secundario: SMTP (solo si existen credenciales reales, no placeholders)
  const smtpUser = process.env.SMTP_USER?.trim()
  const smtpPass = process.env.SMTP_PASS?.trim()
  if (!isPlaceholderCredential(smtpUser) && !isPlaceholderCredential(smtpPass)) {
    try {
      const transporter = nodemailer.createTransport({
        service: process.env.SMTP_SERVICE || 'gmail',
        auth: { user: smtpUser, pass: smtpPass },
        connectionTimeout: timeoutMs,
        greetingTimeout: timeoutMs,
        socketTimeout: timeoutMs,
      })

      const mailOptions = {
        from: `"GAR | gastonramos.com.ar" <${smtpUser}>`,
        to: recipients.to,
        replyTo: sanitizedData.email,
        subject,
        text,
        html,
      }
      if (recipients.cc) {
        mailOptions.cc = recipients.cc
      }

      const info = await transporter.sendMail(mailOptions)
      return {
        ok: true,
        providerAccepted: true,
        provider: 'SMTP',
        messageId: info?.messageId || null,
        recipientsStatus: recipients,
      }
    } catch (err) {
      const isTimeout = err?.code === 'ETIMEDOUT' || err?.message?.includes('Timeout')
      return {
        ok: false,
        providerAccepted: false,
        provider: 'SMTP',
        errorCode: isTimeout ? 'PROVIDER_TIMEOUT' : 'SMTP_SEND_ERROR',
        recipientsStatus: recipients,
      }
    }
  }

  // 3. Sin credenciales válidas configuradas (Fail-Closed honesto)
  return {
    ok: false,
    providerAccepted: false,
    provider: 'UNCONFIGURED',
    errorCode: 'PROVIDER_CREDENTIALS_MISSING',
    recipientsStatus: recipients,
  }
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
