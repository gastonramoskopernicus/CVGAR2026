import Head from 'next/head';
import styles from '@/styles/Aplicaciones.module.css';
import { privateApps } from '@/data/privateApps';

export default function AplicacionesPage({ apps, accessDenied }) {
  if (accessDenied) {
    return (
      <section className="container">
        <div className={styles.unauthorizedBox}>
          <h2 style={{color: '#ef4444', marginBottom: '1rem', fontSize: '1.5rem'}}>Acceso Denegado</h2>
          <p style={{color: '#94a3b8'}}>No tienes los privilegios necesarios para acceder a este workspace.</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <Head>
        <title>Workspace Privado | GAR</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <section className={styles.workspaceContainer}>
        
        <div className={styles.workspaceHeader}>
          <h1>Workspace Privado</h1>
          <p>Accesos a plataformas operativas, de gestión y proyectos personales.</p>
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
                  {/* General Icon mapping using SVG path from data */}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width="24" height="24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={app.iconPath} />
                  </svg>
                </div>
                {app.category && (
                  <span className={styles.categoryBadge}>{app.category}</span>
                )}
              </div>
              
              <h3 className={styles.cardTitle}>{app.name}</h3>
              <p className={styles.cardDesc}>{app.description}</p>
              
              <div className={styles.cardAction}>
                <span>Abrir plataforma</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" width="16" height="16">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </a>
          ))}
        </div>

      </section>
    </>
  );
}

// Server Side protection
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/authOptions"

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions)

  if (!session) {
    return {
      redirect: {
        destination: '/api/auth/signin?callbackUrl=/aplicaciones',
        permanent: false,
      },
    }
  }

  const authorized = (process.env.AUTHORIZED_EMAIL || "").toLowerCase().trim();
  const incoming = (session.user?.email || "").toLowerCase().trim();

  // Double check authorization on page render
  if (incoming !== authorized || authorized === "") {
    return {
      props: {
        accessDenied: true
      }
    }
  }

  return {
    props: {
      apps: privateApps
    },
  }
}
