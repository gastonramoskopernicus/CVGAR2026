import { getServerSession } from 'next-auth/next'
import { authOptions, isEmailAuthorized } from './authOptions'

/**
 * Valida la sesión en el servidor (SSR o API Route).
 * Nunca confía en parámetros enviados desde el navegador.
 */
export async function getAuthorizedSession(req, res) {
  if (!process.env.NEXTAUTH_SECRET || !process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return {
      authenticated: false,
      authorized: false,
      oauthConfigured: false,
      user: null,
    }
  }

  const session = await getServerSession(req, res, authOptions)
  if (!session || !session.user) {
    return {
      authenticated: false,
      authorized: false,
      oauthConfigured: true,
      user: null,
    }
  }

  const email = (session.user.email || '').toLowerCase().trim()
  const authorized = Boolean(session.user.authorized && isEmailAuthorized(email))

  // Si está definido GOOGLE_AUTHORIZED_SUB en servidor, exigir coincidencia exacta
  const expectedSub = (process.env.GOOGLE_AUTHORIZED_SUB || '').trim()
  if (expectedSub && session.user.googleSub !== expectedSub) {
    return {
      authenticated: true,
      authorized: false,
      oauthConfigured: true,
      user: null,
    }
  }

  return {
    authenticated: true,
    authorized,
    oauthConfigured: true,
    user: authorized ? session.user : null,
  }
}

/**
 * Middleware de autorización para endpoints API privados (/api/showcase/*).
 * Rechaza con HTTP 401/403 cualquier solicitud no autenticada o no autorizada.
 */
export async function requireApiAuth(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private')
  const auth = await getAuthorizedSession(req, res)

  if (!auth.authenticated) {
    res.status(401).json({
      error: 'No autenticado. Inicie sesión con la cuenta Google autorizada.',
    })
    return null
  }

  if (!auth.authorized || !auth.user) {
    res.status(403).json({
      error: 'Acceso denegado. Su cuenta no posee permisos para este recurso.',
    })
    return null
  }

  return auth.user
}

