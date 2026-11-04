import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import GARIcon from '@/components/GARIcon'
import ProfessionalEcosystem from '@/components/ProfessionalEcosystem'
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

              {/* Hero Pillars Preview (existing 3 core capabilities with GAR Icon System) */}
              <div className={styles.heroPillars}>
                <div className={styles.pillarItem}>
                  <div className={styles.pillarIcon} aria-hidden="true">
                    <GARIcon name="strategy" size={28} />
                  </div>
                  <span className={styles.pillarTitle}>Estrategia Tecnológica</span>
                  <span className={styles.pillarMeta}>Modernización de core y arquitectura</span>
                </div>

                <div className={styles.pillarItem}>
                  <div className={styles.pillarIcon} aria-hidden="true">
                    <GARIcon name="transformation" size={28} />
                  </div>
                  <span className={styles.pillarTitle}>Transformación Digital</span>
                  <span className={styles.pillarMeta}>Automatización, canales e IA</span>
                </div>

                <div className={styles.pillarItem}>
                  <div className={styles.pillarIcon} aria-hidden="true">
                    <GARIcon name="innovation" size={28} />
                  </div>
                  <span className={styles.pillarTitle}>Innovación en Seguros</span>
                  <span className={styles.pillarMeta}>Nuevos productos y modelos</span>
                </div>
              </div>
            </motion.div>

            {/* Right Column — Protagonist Cutout Silhouette & Animated Circular Element Behind */}
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
                        d="M 180, 180 m -158, 0 a 158,158 0 1,1 316,0 a 158,158 0 1,1 -316,0"
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

              {/* Personal Photograph Cutout (Transparent Alpha Channel, No Rectangular Frame) */}
              <div className={styles.imageWrapper}>
                <div className={styles.imageBackground}>
                  <Image
                    src="/FotoGAR-nobg.webp"
                    alt="Gastón Alejandro Ramos"
                    fill
                    sizes="(max-width: 480px) 320px, (max-width: 768px) 400px, (max-width: 1024px) 46vw, 500px"
                    className={styles.heroImage}
                    priority
                  />
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
                  <GARIcon name="strategy" size={30} />
                </div>
                <h3>Estrategia Tecnológica</h3>
                <p>Modernización de core y arquitectura empresarial para el futuro del seguro.</p>
              </div>
              <div className={styles.capabilityCard}>
                <div className={styles.iconWrapper}>
                  <GARIcon name="innovation" size={30} />
                </div>
                <h3>Innovación en Seguros</h3>
                <p>Nuevos productos eficientes y modelos de negocio digitales disruptivos.</p>
              </div>
              <div className={styles.capabilityCard}>
                <div className={styles.iconWrapper}>
                  <GARIcon name="transformation" size={30} />
                </div>
                <h3>Transformación Digital</h3>
                <p>Automatización, canales digitales e IA aplicada para maximizar la eficiencia.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ecosistema Profesional — Pre-Footer Section */}
      <ProfessionalEcosystem />
    </>
  )
}
