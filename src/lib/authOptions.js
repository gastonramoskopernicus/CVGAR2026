import GoogleProvider from 'next-auth/providers/google'

/**
 * Cuenta autorizada exclusiva según Directiva V2.2 (Sección G).
 * Permite sobreescritura por variable de entorno AUTHORIZED_EMAIL en QA,
 * manteniendo siempre la validación estricta en servidor.
 */
export const DEFAULT_AUTHORIZED_EMAIL = 'gaston.alejandro.ramos@gmail.com'

export function getAuthorizedEmails() {
  const envEmail = (process.env.AUTHORIZED_EMAIL || '').toLowerCase().trim()
  const allowed = new Set([DEFAULT_AUTHORIZED_EMAIL])
  if (envEmail) {
    allowed.add(envEmail)
  }
  return allowed
}

export function isEmailAuthorized(email) {
  if (!email || typeof email !== 'string') return false
  const normalized = email.toLowerCase().trim()
  return getAuthorizedEmails().has(normalized)
}

const useSecureCookies = process.env.NODE_ENV === 'production'
const cookiePrefix = useSecureCookies ? '__Secure-' : ''

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      checks: ['pkce', 'state', 'nonce'],
      authorization: {
        params: {
          prompt: 'select_account',
          access_type: 'online',
          response_type: 'code',
          scope: 'openid email profile',
        },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 8, // 8 horas de sesión máxima
  },
  cookies: {
    sessionToken: {
      name: `${cookiePrefix}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: useSecureCookies,
      },
    },
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== 'google') {
        return false
      }

      // Verificar email confirmado en el token OIDC de Google
      const emailVerified = profile?.email_verified === true
      const incomingEmail = (profile?.email || user?.email || '').toLowerCase().trim()
      const googleSub = profile?.sub || account?.providerAccountId

      if (!emailVerified || !googleSub || !isEmailAuthorized(incomingEmail)) {
        console.warn(`[Security Audit] Acceso OAuth denegado para: ${incomingEmail || 'desconocido'}`)
        return false
      }

      // Si existe GOOGLE_AUTHORIZED_SUB configurado, verificar coincidencia exacta del identificador estable
      const expectedSub = (process.env.GOOGLE_AUTHORIZED_SUB || '').trim()
      if (expectedSub && googleSub !== expectedSub) {
        console.warn(`[Security Audit] Sub OIDC no coincide para: ${incomingEmail}`)
        return false
      }

      return true
    },

    async jwt({ token, account, profile }) {
      // No almacenar access_token ni refresh_token de OAuth en el JWT
      if (account && profile) {
        token.sub = profile.sub || token.sub
        token.email = (profile.email || token.email || '').toLowerCase().trim()
        token.emailVerified = profile.email_verified === true
        token.authorized = isEmailAuthorized(token.email) && token.emailVerified
      } else if (token?.email) {
        token.authorized = isEmailAuthorized(token.email) && token.emailVerified === true
      }
      delete token.accessToken
      delete token.refreshToken
      return token
    },

    async session({ session, token }) {
      if (!token?.authorized || !isEmailAuthorized(token?.email)) {
        return null
      }
      return {
        ...session,
        user: {
          name: session.user?.name || 'Gastón Alejandro Ramos',
          email: token.email,
          image: session.user?.image || null,
          googleSub: token.sub || null,
          authorized: true,
        },
      }
    },
  },
  debug: false,
}
