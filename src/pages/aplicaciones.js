import Head from 'next/head';
import { getSession } from 'next-auth/react';
import styles from '@/styles/Aplicaciones.module.css';
import { privateApps, AUTHORIZED_EMAIL } from '@/data/privateApps';

export default function AplicacionesPage({ apps, accessDenied }) {
  if (accessDenied) {
    return (
      <section className="container">
        <div className={styles.unauthorizedBox}>
          <h2 style={{color: '#ef4444', marginBottom: '1rem'}}>Acceso Denegado</h2>
          <p style={{color: '#94a3b8'}}>No tienes los privilegios necesarios para ver este ecosistema.</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <Head>
        <title>Aplicaciones Privadas | Ecosistema GAR</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <section className="container">
        <div className={styles.galaxyContainer}>
          {/* Overlay titles */}
          <div className={styles.overlayContent}>
            <h1>Garverse</h1>
            <p>Ecosistema privado de plataformas operativas y de gestión.</p>
          </div>

          <div className={styles.stars}></div>

          {/* Planetary System */}
          <div className={styles.solarSystem}>
            {/* The Sun / Core */}
            <div className={styles.core}>
               <span className={styles.coreText}>GAR</span>
            </div>

            {/* Orbiting Apps */}
            {apps.map((app, index) => {
              // We'll calculate a randomized starting angle for visual appeal
              const initialAngle = (360 / apps.length) * index;
              
              return (
                <div key={app.id} 
                     className={styles.orbit} 
                     style={{
                       width: `${app.orbitRadius * 2}px`, 
                       height: `${app.orbitRadius * 2}px`,
                       left: `-${app.orbitRadius}px`,
                       top: `-${app.orbitRadius}px`
                     }}>
                  
                  {/* Container that actually rotates */}
                  <div className={styles.orbitRotation}
                       style={{
                         animation: `${styles.spin} ${app.orbitSpeed}s linear infinite`,
                         transform: `rotate(${initialAngle}deg)`
                       }}>
                    
                    {/* The Planet itself positioned at the edge of the radius */}
                    <div className={styles.planetContainer}
                         style={{ 
                            transform: `translate(${app.orbitRadius}px, 0px)`,
                            '--planet-color': app.color 
                         }}>
                      
                      <div className={styles.planet} 
                           style={{
                             width: `${app.size}px`,
                             height: `${app.size}px`,
                             backgroundColor: app.color,
                             // reverse the spin to keep the planet pointing "up"
                             animation: `${styles.reverseSpin} ${app.orbitSpeed}s linear infinite` 
                           }}>
                      </div>
                      
                      <div className={styles.tooltip}>
                        <h3>{app.name}</h3>
                        <p>{app.description}</p>
                        <a href={app.url} target="_blank" rel="noopener noreferrer" className={styles.visitBtn}>
                          Abrir
                        </a>
                      </div>

                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}

// Server Side protection
export async function getServerSideProps(context) {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: '/api/auth/signin?callbackUrl=/aplicaciones',
        permanent: false,
      },
    };
  }

  // Double check authorization, NextAuth callback should handle this, 
  // but we enforce it strictly here as well.
  if (session.user.email.toLowerCase() !== AUTHORIZED_EMAIL.toLowerCase()) {
    return {
      props: {
        accessDenied: true
      }
    };
  }

  return {
    props: {
      apps: privateApps
    },
  };
}
