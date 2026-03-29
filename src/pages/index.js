import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import styles from '@/styles/Home.module.css'

export default function Home() {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: "easeOut" }
  }

  return (
    <>
      <Head>
        <title>Gastón Alejandro Ramos | Asesor en Estrategia y Tecnología para Seguros</title>
      </Head>

      <section className={styles.heroSection}>
        <div className="container">
          <div className={styles.heroGrid}>
            {/* Image on the Left */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={styles.imageWrapper}
            >
              <div className={styles.imageBackground}>
                <Image 
                  src="/FotoGAR.jpeg" 
                  alt="Gastón Alejandro Ramos" 
                  width={450} 
                  height={600} 
                  className={styles.heroImage}
                  priority
                />
              </div>
              
              {/* Circular Text Element (Adjusted Position) */}
              <div className={styles.circularBadge} style={{ bottom: '-30px', left: '-30px' }}>
                <svg viewBox="0 0 100 100" width="120" height="120">
                  <path id="circlePath" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" fill="transparent" />
                  <text className={styles.badgeText}>
                    <textPath href="#circlePath">
                      SEGUROS • ESTRATEGIA • TECNOLOGÍA •
                    </textPath>
                  </text>
                </svg>
              </div>
            </motion.div>

            {/* Content on the Right */}
            <motion.div 
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              className={styles.heroContent}
            >
              <h1 className={styles.mainTitle} style={{ color: '#000000' }}>
                Transformando <br /> 
                la Estrategia <br />
                en <span className={styles.highlight}>Realidad</span>.
              </h1>
              
              <p className={styles.description} style={{ color: '#333333' }}>
                Como Asesor Senior en Tecnología y Estrategia para Seguros, lidero la transformación mediante innovación, arquitectura empresarial y evolución digital para el mercado latinoamericano.
              </p>

              <div className={styles.ctaGroup}>
                <Link href="/about" className={styles.primaryCta}>
                  Ver Perfil <span>&rarr;</span>
                </Link>
                <Link href="/contacto" className={styles.primaryCta}>
                  Hablemos
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Artistic Lightbulb/Idea Element (Bottom Right) */}
        <div className={styles.decorLight} style={{ color: '#000000' }}>
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5" />
            <path d="M9 18h6" />
            <path d="M10 22h4" />
          </svg>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className={styles.infoSection}>
        <div className="container">
          <div className={styles.infoGrid}>
            <div className={styles.infoRow}>
              <h2 className={styles.infoTitle} style={{ color: '#000000' }}>Experiencia Construida para la Transformación</h2>
              <div className={styles.infoContent}>
                <p style={{ color: '#444444' }}>
                  Socio Director de Kopernicus Tech, con más de 30 años de trayectoria liderando la convergencia estratégica entre el negocio asegurador y las plataformas tecnológicas de vanguardia.
                </p>
              </div>
            </div>
            
            <div className={styles.capabilitiesTeaser}>
              <div className={styles.capabilityCard}>
                <div className={styles.iconWrapper} style={{ marginBottom: '1.5rem', color: '#000' }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
                </div>
                <h3 style={{ color: '#000000' }}>Estrategia Tecnológica</h3>
                <p style={{ color: '#666666' }}>Modernización de core y arquitectura empresarial para el futuro del seguro.</p>
              </div>
              <div className={styles.capabilityCard}>
                <div className={styles.iconWrapper} style={{ marginBottom: '1.5rem', color: '#000' }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v8"></path><path d="m4.93 4.93 5.66 5.66"></path><path d="M2 12h8"></path><path d="m4.93 19.07 5.66-5.66"></path><path d="M12 22v-8"></path><path d="m19.07 19.07-5.66-5.66"></path><path d="M22 12h-8"></path><path d="m19.07 4.93-5.66 5.66"></path></svg>
                </div>
                <h3 style={{ color: '#000000' }}>Innovación en Seguros</h3>
                <p style={{ color: '#666666' }}>Nuevos productos eficientes y modelos de negocio digitales disruptivos.</p>
              </div>
              <div className={styles.capabilityCard}>
                <div className={styles.iconWrapper} style={{ marginBottom: '1.5rem', color: '#000' }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
                </div>
                <h3 style={{ color: '#000000' }}>Transformación Digital</h3>
                <p style={{ color: '#666666' }}>Automatización, canales digitales e IA aplicada para maximizar la eficiencia.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
