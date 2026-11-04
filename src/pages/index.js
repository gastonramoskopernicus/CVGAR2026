import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import styles from '@/styles/Home.module.css'

export default function Home() {
  const fadeInUp = {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] }
  }

  return (
    <>
      <Head>
        <title>Gastón Alejandro Ramos | Asesor en Estrategia y Tecnología para Seguros</title>
      </Head>

      <section className={styles.heroSection}>
        {/* Ambient radial glow behind the right column */}
        <div className={styles.ambientGlow} aria-hidden="true" />

        <div className="container">
          <div className={styles.heroGrid}>
            {/* Left Column — Editorial Identity & Content */}
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              className={styles.heroContent}
            >
              <div className={styles.eyebrow}>
                <span>ESTRATEGIA</span>
                <span className={styles.eyebrowDivider}>/</span>
                <span>TECNOLOGÍA</span>
                <span className={styles.eyebrowDivider}>/</span>
                <span>TRANSFORMACIÓN</span>
              </div>

              <div className={styles.identityBlock}>
                <h1 className={styles.nameTitle}>
                  Gastón <br />
                  Ramos<span className={styles.yellowDot}>.</span>
                </h1>

                <p className={styles.mainTitle}>
                  Transformando la Estrategia en <span className={styles.highlight}>Realidad</span>.
                </p>
              </div>

              <p className={styles.description}>
                Como Asesor Senior en Tecnología y Estrategia para Seguros, lidero la transformación mediante innovación, arquitectura empresarial y evolución digital para el mercado latinoamericano.
              </p>

              <div className={styles.ctaGroup}>
                <Link href="/about" className={styles.primaryCta}>
                  Ver Perfil <span aria-hidden="true">&rarr;</span>
                </Link>
                <Link href="/contacto" className={styles.secondaryCta}>
                  Hablemos
                </Link>
              </div>

              {/* Hero Pillars Preview (existing 3 core capabilities) */}
              <div className={styles.heroPillars}>
                <div className={styles.pillarItem}>
                  <div className={styles.pillarIcon} aria-hidden="true">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 2 7 12 12 22 7 12 2" />
                      <polyline points="2 12 12 17 22 12" />
                      <polyline points="2 17 12 22 22 17" />
                    </svg>
                  </div>
                  <span className={styles.pillarTitle}>Estrategia Tecnológica</span>
                  <span className={styles.pillarMeta}>Modernización de core y arquitectura</span>
                </div>

                <div className={styles.pillarItem}>
                  <div className={styles.pillarIcon} aria-hidden="true">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="5" r="2.5" />
                      <circle cx="5" cy="19" r="2.5" />
                      <circle cx="19" cy="19" r="2.5" />
                      <line x1="10.5" y1="7" x2="6.5" y2="16.8" />
                      <line x1="13.5" y1="7" x2="17.5" y2="16.8" />
                      <line x1="7.5" y1="19" x2="16.5" y2="19" />
                    </svg>
                  </div>
                  <span className={styles.pillarTitle}>Transformación Digital</span>
                  <span className={styles.pillarMeta}>Automatización, canales e IA</span>
                </div>

                <div className={styles.pillarItem}>
                  <div className={styles.pillarIcon} aria-hidden="true">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
                      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
                      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
                      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
                    </svg>
                  </div>
                  <span className={styles.pillarTitle}>Innovación en Seguros</span>
                  <span className={styles.pillarMeta}>Nuevos productos y modelos</span>
                </div>
              </div>
            </motion.div>

            {/* Right Column — Protagonist Portrait & Animated Circular Element Behind */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
              className={styles.visualColumn}
            >
              {/* Animated Circular Backdrop Behind Portrait */}
              <div className={styles.orbitalStage} aria-hidden="true">
                <div className={styles.orbitalGlow} />
                <div className={styles.orbitalRingOuter} />
                <div className={styles.orbitalRingInner} />

                {/* Rotating Circular Text SVG (preserved & enhanced logic) */}
                <div className={styles.circularBadge}>
                  <svg viewBox="0 0 360 360" className={styles.circularSvg}>
                    <defs>
                      <path
                        id="circlePath"
                        d="M 180, 180 m -154, 0 a 154,154 0 1,1 308,0 a 154,154 0 1,1 -308,0"
                        fill="transparent"
                      />
                    </defs>
                    <text className={styles.badgeText}>
                      <textPath href="#circlePath" startOffset="0%">
                        SEGUROS &bull; ESTRATEGIA &bull; TECNOLOGÍA &bull; TRANSFORMACIÓN &bull; INNOVACIÓN &bull;
                      </textPath>
                    </text>
                  </svg>
                </div>
              </div>

              {/* Personal Photograph Integrated Naturally */}
              <div className={styles.imageWrapper}>
                <div className={styles.imageBackground}>
                  <Image
                    src="/FotoGAR.jpeg"
                    alt="Gastón Alejandro Ramos"
                    fill
                    sizes="(max-width: 480px) 300px, (max-width: 768px) 380px, (max-width: 1024px) 45vw, 480px"
                    className={styles.heroImage}
                    priority
                  />
                  <div className={styles.imageVignette} aria-hidden="true" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Cue */}
        <a
          href="#propuesta-valor"
          className={styles.scrollCue}
          aria-label="Explorar propuesta de valor"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </a>
      </section>

      {/* Value Proposition Section */}
      <section id="propuesta-valor" className={styles.infoSection}>
        <div className="container">
          <div className={styles.infoGrid}>
            <div className={styles.infoRow}>
              <div className={styles.infoHeaderBlock}>
                <span className={styles.sectionKicker}>Trayectoria &amp; Enfoque</span>
                <h2 className={styles.infoTitle}>Experiencia Construida para la Transformación</h2>
              </div>
              <div className={styles.infoContent}>
                <p>
                  Socio Director de Kopernicus Tech, con más de 30 años de trayectoria liderando la convergencia estratégica entre el negocio asegurador y las plataformas tecnológicas de vanguardia.
                </p>
              </div>
            </div>

            <div className={styles.capabilitiesTeaser}>
              <div className={styles.capabilityCard}>
                <div className={styles.iconWrapper}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
                </div>
                <h3>Estrategia Tecnológica</h3>
                <p>Modernización de core y arquitectura empresarial para el futuro del seguro.</p>
              </div>
              <div className={styles.capabilityCard}>
                <div className={styles.iconWrapper}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v8"></path><path d="m4.93 4.93 5.66 5.66"></path><path d="M2 12h8"></path><path d="m4.93 19.07 5.66-5.66"></path><path d="M12 22v-8"></path><path d="m19.07 19.07-5.66-5.66"></path><path d="M22 12h-8"></path><path d="m19.07 4.93-5.66 5.66"></path></svg>
                </div>
                <h3>Innovación en Seguros</h3>
                <p>Nuevos productos eficientes y modelos de negocio digitales disruptivos.</p>
              </div>
              <div className={styles.capabilityCard}>
                <div className={styles.iconWrapper}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
                </div>
                <h3>Transformación Digital</h3>
                <p>Automatización, canales digitales e IA aplicada para maximizar la eficiencia.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
