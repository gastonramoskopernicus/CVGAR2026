import { checkAndConsumeTurnstileToken } from '@/lib/contactRateLimiter'

/**
 * Verificación server-side de Cloudflare Turnstile (Siteverify).
 * Basado en el patrón arquitectónico de InspeXiona (`src/lib/security/verify-turnstile.ts`),
 * extendido con prevención determinista de reutilización de tokens (Single-Use Token Ledger),
 * verificación de expiración (`challenge_ts`), `hostname` y `action`.
 *
 * Claves de prueba oficiales de Cloudflare para QA / Desarrollo:
 * - Site Key (Always Pass Managed): 1x00000000000000000000AA
 * - Secret Key (Always Pass):       1x0000000000000000000000000000000AA
 * - Secret Key (Always Fail):       2x0000000000000000000000000000000AA
 * - Secret Key (Token Spent):       3x0000000000000000000000000000000AA
 */

export const TURNSTILE_SITEVERIFY_URL =
  'https://challenges.cloudflare.com/turnstile/v0/siteverify'

export const QA_DEFAULT_TURNSTILE_SITE_KEY = '1x00000000000000000000AA'
export const QA_DEFAULT_TURNSTILE_SECRET_KEY = '1x0000000000000000000000000000000AA'

export const EXPECTED_TURNSTILE_ACTION = 'contact_submit'
export const MAX_CHALLENGE_AGE_MS = 5 * 60 * 1000 // 5 minutos

const DEFAULT_ALLOWED_HOSTNAMES = [
  'gastonramos.com.ar',
  'www.gastonramos.com.ar',
  'localhost',
  '127.0.0.1',
  'gaston-portfolio.vercel.app',
  'example.com', // Hostname devuelto por la clave oficial de prueba de Cloudflare (1x0000...AA)
]

export function getAllowedTurnstileHostnames() {
  const custom = process.env.TURNSTILE_ALLOWED_HOSTNAMES
  if (custom && typeof custom === 'string') {
    return custom
      .split(',')
      .map((h) => h.trim().toLowerCase())
      .filter(Boolean)
  }
  return DEFAULT_ALLOWED_HOSTNAMES
}

export function isAllowedTurnstileHostname(hostname) {
  if (!hostname || typeof hostname !== 'string') return false
  const clean = hostname.trim().toLowerCase()
  const allowed = getAllowedTurnstileHostnames()
  if (allowed.includes(clean)) return true
  // Permitir subdominios de preview de Vercel del proyecto en QA
  if (
    process.env.NODE_ENV !== 'production' &&
    (clean.endsWith('.vercel.app') || clean.endsWith('.gastonramos.com.ar'))
  ) {
    return true
  }
  return false
}

export function resolveTurnstileSecretKey() {
  const configured = process.env.TURNSTILE_SECRET_KEY?.trim()
  if (configured) return configured
  if (process.env.NODE_ENV !== 'production') {
    return QA_DEFAULT_TURNSTILE_SECRET_KEY
  }
  return ''
}

/**
 * Valida un token de Cloudflare Turnstile exclusivamente en el servidor.
 *
 * @param {Object} params
 * @param {string} params.token - Token enviado por el widget Turnstile
 * @param {string} [params.remoteip] - IP del visitante
 * @param {string} [params.expectedAction] - Acción esperada ('contact_submit')
 * @param {Function} [params.fetchImpl] - Implementación fetch (permite dobles de prueba en QA)
 * @param {number} [params.now] - Timestamp actual en ms
 */
export async function verifyTurnstileToken({
  token,
  remoteip = '',
  expectedAction = EXPECTED_TURNSTILE_ACTION,
  fetchImpl = global.fetch,
  now = Date.now(),
} = {}) {
  if (!token || typeof token !== 'string' || !token.trim()) {
    return {
      success: false,
      errorCode: 'TURNSTILE_MISSING_TOKEN',
    }
  }

  const trimmedToken = token.trim()
  if (trimmedToken.length > 2048) {
    return {
      success: false,
      errorCode: 'TURNSTILE_TOKEN_TOO_LONG',
    }
  }

  const secretKey = resolveTurnstileSecretKey()
  if (!secretKey) {
    return {
      success: false,
      errorCode: 'TURNSTILE_SECRET_NOT_CONFIGURED',
    }
  }

  // 1. Verificar en nuestro registro persistente que el token NO haya sido utilizado antes (Single-Use)
  const replayCheck = await checkAndConsumeTurnstileToken(trimmedToken, now)
  if (replayCheck.reused) {
    return {
      success: false,
      errorCode: 'TURNSTILE_REUSED_TOKEN',
    }
  }

  // 2. En entorno QA/Desarrollo, soportar tokens deterministas de simulación de fallos de Siteverify
  // para que la batería de pruebas automatizadas verifique cada rama sin enviar spam real
  if (process.env.NODE_ENV !== 'production') {
    if (trimmedToken === 'QA_INVALID_TURNSTILE_TOKEN') {
      return { success: false, errorCode: 'TURNSTILE_INVALID_TOKEN' }
    }
    if (trimmedToken === 'QA_EXPIRED_TURNSTILE_TOKEN') {
      return { success: false, errorCode: 'TURNSTILE_EXPIRED_TOKEN' }
    }
    if (trimmedToken === 'QA_WRONG_ACTION_TURNSTILE_TOKEN') {
      return { success: false, errorCode: 'TURNSTILE_ACTION_MISMATCH' }
    }
    if (trimmedToken === 'QA_WRONG_HOSTNAME_TURNSTILE_TOKEN') {
      return { success: false, errorCode: 'TURNSTILE_HOSTNAME_MISMATCH' }
    }
  }

  // 3. Llamar al endpoint oficial Siteverify de Cloudflare Turnstile
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 6000)

  try {
    const formData = new URLSearchParams()
    formData.append('secret', secretKey)
    formData.append('response', trimmedToken)
    if (remoteip) {
      formData.append('remoteip', remoteip)
    }

    const response = await fetchImpl(TURNSTILE_SITEVERIFY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
      signal: controller.signal,
    })

    if (!response.ok) {
      return {
        success: false,
        errorCode: `TURNSTILE_HTTP_${response.status}`,
      }
    }

    const result = await response.json().catch(() => ({}))
    const errorCodes = Array.isArray(result['error-codes']) ? result['error-codes'] : []

    if (!result.success) {
      if (errorCodes.includes('timeout-or-duplicate')) {
        return {
          success: false,
          errorCode: 'TURNSTILE_EXPIRED_TOKEN',
        }
      }
      return {
        success: false,
        errorCode: 'TURNSTILE_INVALID_TOKEN',
      }
    }

    // 4. Verificar antigüedad del challenge (si Cloudflare devuelve challenge_ts)
    if (result.challenge_ts) {
      const challengeTime = Date.parse(result.challenge_ts)
      if (!Number.isNaN(challengeTime) && now - challengeTime > MAX_CHALLENGE_AGE_MS) {
        return {
          success: false,
          errorCode: 'TURNSTILE_EXPIRED_TOKEN',
        }
      }
    }

    // 5. Verificar hostname devuelto por Siteverify
    if (result.hostname && !isAllowedTurnstileHostname(result.hostname)) {
      return {
        success: false,
        errorCode: 'TURNSTILE_HOSTNAME_MISMATCH',
      }
    }

    // 6. Verificar acción esperada ('contact_submit') cuando Siteverify informa action
    // Nota: La clave dummy de prueba de Cloudflare ('1x0000...AA') devuelve action: ""
    if (result.action && expectedAction && result.action !== expectedAction) {
      return {
        success: false,
        errorCode: 'TURNSTILE_ACTION_MISMATCH',
      }
    }

    return {
      success: true,
      errorCode: 'OK',
      hostname: result.hostname || 'verified',
      action: result.action || expectedAction,
    }
  } catch (err) {
    const isTimeout = err?.name === 'AbortError'
    return {
      success: false,
      errorCode: isTimeout ? 'TURNSTILE_VERIFY_TIMEOUT' : 'TURNSTILE_VERIFY_NETWORK_ERROR',
    }
  } finally {
    clearTimeout(timer)
  }
}
