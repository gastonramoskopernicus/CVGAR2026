import Head from 'next/head'
import styles from '@/styles/Aplicaciones.module.css'
import ToolStack from '@/components/ToolStack'
import PrivateAuthGate, { PrivateSessionBar } from '@/components/PrivateAuthGate'
import { getAuthorizedSession } from '@/lib/requireAuthorizedUser'
import { privateApps } from '@/data/privateApps'

export default function AplicacionesPage({
  apps = [],
  authenticated = false,
  authorized = false,
  oauthConfigured = true,
  user = null,
}) {
  if (!authenticated || !authorized) {
    return (
      <>
        <Head>
          <title>Acceso Privado — Aplicaciones | GAR.</title>
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        <PrivateAuthGate
          variant="default"
          badgeLabel="ACCESO PRIVADO"
          sectionTitle="Mis Aplicaciones / Plataformas Propias"
          sectionSubtitle="Espacio privado y seguro de acceso a mis aplicaciones y plataformas. Iniciá sesión con tu cuenta Google autorizada para continuar."
          callbackUrl="/aplicaciones"
          accessDenied={authenticated && !authorized}
          oauthConfigured={oauthConfigured}
        />
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Mis Aplicaciones / Plataformas Propias | GAR.</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <section className={styles.workspaceContainer}>
        <PrivateSessionBar user={user} activeSection="aplicaciones" />

        <div className={styles.workspaceHeader}>
          <h1>Mis Aplicaciones / Plataformas Propias</h1>
          <p>Espacio privado y seguro de acceso a mis aplicaciones y plataformas.</p>
        </div>

        <div className={styles.appsGrid}>
          {apps.map((app) => (
            <a
              key={app.id}
              href={app.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.card}
              style={{ '--app-color': app.color }}
            >
              <div className={styles.cardHeader}>
                <div className={styles.iconWrapper}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    width="24"
                    height="24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d={app.iconPath} />
                  </svg>
                </div>
                {app.category && <span className={styles.categoryBadge}>{app.category}</span>}
              </div>

              <h3 className={styles.cardTitle}>{app.name}</h3>
              <p className={styles.cardDesc}>{app.description}</p>

              <div className={styles.cardAction}>
                <span>Abrir plataforma</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  width="16"
                  height="16"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                  />
                </svg>
              </div>
            </a>
          ))}
        </div>

        <ToolStack />
      </section>
    </>
  )
}

export async function getServerSideProps(context) {
  context.res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private')
  const auth = await getAuthorizedSession(context.req, context.res)

  if (!auth.authenticated || !auth.authorized) {
    return {
      props: {
        apps: [],
        authenticated: auth.authenticated,
        authorized: false,
        oauthConfigured: auth.oauthConfigured,
        user: null,
      },
    }
  }

  return {
    props: {
      apps: privateApps,
      authenticated: true,
      authorized: true,
      oauthConfigured: true,
      user: auth.user,
    },
  }
}
