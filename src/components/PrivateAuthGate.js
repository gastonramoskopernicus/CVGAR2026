import React from 'react'
import Link from 'next/link'
import { signIn, signOut } from 'next-auth/react'
import Monogram from './Monogram'
import GARIcon from './GARIcon'
import styles from './PrivateAuthGate.module.css'

export function PrivateSessionBar({ user, activeSection = 'aplicaciones' }) {
  if (!user) return null

  return (
    <div className={styles.sessionBar}>
      <div className={styles.sessionLeft}>
        <span className={styles.verifiedDot} aria-hidden="true" />
        <span className={styles.sessionEmail}>{user.email}</span>
        <span className={styles.sessionBadge}>Sesión verificada</span>
      </div>

      <div className={styles.sessionRight}>
        <nav className={styles.privateNav} aria-label="Navegación privada">
          <Link
            href="/aplicaciones"
            className={`${styles.privateNavLink} ${
              activeSection === 'aplicaciones' ? styles.privateNavActive : ''
            }`}
          >
            Aplicaciones
          </Link>
          <Link
            href="/showcase"
            className={`${styles.privateNavLink} ${
              activeSection === 'showcase' ? styles.privateNavActive : ''
            }`}
          >
            Showcase
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/' })}
          className={styles.logoutBtn}
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}

export default function PrivateAuthGate({
  sectionTitle = 'Espacio Privado',
  sectionSubtitle = 'Este módulo requiere autenticación con la cuenta Google autorizada.',
  callbackUrl = '/aplicaciones',
  accessDenied = false,
  oauthConfigured = true,
}) {
  return (
    <section className={styles.gateSection}>
      <div className="container">
        <div className={styles.gateCard}>
          <div className={styles.gateTop}>
            <Monogram variant="header" />
            <span className={styles.securityBadge}>
              <GARIcon name="architecture" size={18} />
              Acceso Restringido · OAuth 2.0 / OIDC
            </span>
          </div>

          <h1 className={styles.gateTitle}>
            {accessDenied ? 'Acceso no autorizado' : sectionTitle}
          </h1>

          <p className={styles.gateDescription}>
            {accessDenied
              ? 'La cuenta utilizada no posee permisos para acceder a este entorno privado. Este espacio está restringido exclusivamente al titular autorizado.'
              : sectionSubtitle}
          </p>

          {!oauthConfigured && (
            <div className={styles.configNotice}>
              <strong>Entorno QA pendiente de credenciales OAuth:</strong> Configure{' '}
              <code>GOOGLE_CLIENT_ID</code>, <code>GOOGLE_CLIENT_SECRET</code>,{' '}
              <code>NEXTAUTH_SECRET</code> y <code>AUTHORIZED_EMAIL</code> en variables de entorno
              del proyecto para habilitar el inicio de sesión con Google.
            </div>
          )}

          <div className={styles.gateActions}>
            {accessDenied ? (
              <>
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl })}
                  className={styles.primaryAuthBtn}
                >
                  Cambiar de cuenta
                </button>
                <Link href="/" className={styles.secondaryAuthBtn}>
                  Volver al inicio
                </Link>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => signIn('google', { callbackUrl })}
                  className={styles.primaryAuthBtn}
                  disabled={!oauthConfigured}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M21.35 11.1h-9.17v2.73h6.51c-.33 1.81-1.5 3.34-3.2 4.37v3.62h5.18c3.03-2.79 4.78-6.9 4.78-11.82 0-.62-.06-1.22-.1-1.9z" />
                    <path d="M12.18 22c4.32 0 7.95-1.43 10.6-3.88l-5.18-3.62c-1.43.96-3.26 1.53-5.42 1.53-4.17 0-7.7-2.81-8.96-6.6H-2.1v3.73C.54 18.4 5.95 22 12.18 22z" />
                  </svg>
                  Iniciar sesión con Google
                </button>
                <Link href="/" className={styles.secondaryAuthBtn}>
                  Volver al inicio
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
