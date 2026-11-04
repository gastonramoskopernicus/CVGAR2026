import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import SEOHead from '@/components/SEOHead'
import { PERSON_SCHEMA, WEBSITE_SCHEMA } from '@/lib/schemaOrg'
import GARIcon from '@/components/GARIcon'
import ProfessionalEcosystem from '@/components/ProfessionalEcosystem'
import styles from '@/styles/Home.module.css'

const HERO_MESSAGES = [
  {
    id: 'estrategia-transformacion',
    label: 'Estrategia y transformación',
    categories: ['ESTRATEGIA', 'TECNOLOGÍA', 'TRANSFORMACIÓN'],
    titlePrefix: 'Transformando la Estrategia en ',
    titleHighlight: 'Realidad',
    titleSuffix: '.',
    description:
      'Acompaño a empresas en la evolución de sus negocios, conectando estrategia, procesos y tecnología para generar resultados concretos.',
  },
  {
    id: 'eficiencia-operativa',
    label: 'Eficiencia operativa',
    categories: ['EFICIENCIA', 'PROCESOS', 'DIGITALIZACIÓN'],
    titlePrefix: 'Haciendo que la Tecnología genere ',
    titleHighlight: 'Valor',
    titleSuffix: '.',
    description:
      'Ayudo a organizaciones a simplificar operaciones, optimizar procesos e incorporar soluciones digitales que mejoran su competitividad.',
  },
  {
    id: 'innovacion-crecimiento',
    label: 'Innovación y crecimiento',
    categories: ['INNOVACIÓN', 'CRECIMIENTO', 'NUEVOS NEGOCIOS'],
    titlePrefix: 'Creando Nuevas Oportunidades de ',
    titleHighlight: 'Negocio',
    titleSuffix: '.',
    description:
      'Diseño estrategias para desarrollar productos, abrir canales comerciales y aprovechar la tecnología como motor de crecimiento.',
  },
]

const FEATURED_CAPABILITIES = [
  {
    icon: 'strategy',
    title: 'Estrategia y Negocio',
    description: 'Transformación, crecimiento y competitividad.',
  },
  {
    icon: 'transformation',
    title: 'Procesos y Tecnología',
    description: 'Eficiencia, digitalización y automatización.',
  },
  {
    icon: 'innovation',
    title: 'Innovación y Crecimiento',
    description: 'Nuevos productos, canales y modelos de negocio.',
  },
]

const CAROUSEL_INTERVAL_MS = 6000

export default function Home() {
  const [activeSlide, setActiveSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    if (prefersReducedMotion || isPaused) return

    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_MESSAGES.length)
    }, CAROUSEL_INTERVAL_MS)

    return () => clearInterval(timer)
  }, [prefersReducedMotion, isPaused])

  const currentMessage = HERO_MESSAGES[activeSlide]

  const fadeInUp = {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
  }

  const slideMotionProps = prefersReducedMotion
    ? {
        initial: false,
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 1, y: 0 },
        transition: { duration: 0 },
      }
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -8 },
        transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
      }

  return (
    <>
      <SEOHead
        title="Gastón Ramos | Consultor Senior en Estrategia, Tecnología y Transformación de Negocios"
        description="Consultor Senior en Estrategia, Tecnología y Transformación de Negocios. Optimización de procesos, modernización tecnológica, innovación y especialización en seguros y finanzas en Argentina y Latinoamérica."
        path="/"
        jsonLd={[PERSON_SCHEMA, WEBSITE_SCHEMA]}
      />

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
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onFocusCapture={() => setIsPaused(true)}
              onBlurCapture={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) {
                  setIsPaused(false)
                }
              }}
            >
              <div className={styles.eyebrowSlot} aria-live="polite" aria-atomic="true">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={`eyebrow-${currentMessage.id}`}
                    className={styles.eyebrow}
                    {...slideMotionProps}
                  >
                    {currentMessage.categories.map((cat, idx) => (
                      <span key={cat} className={styles.eyebrowGroup}>
                        {idx > 0 && <span className={styles.eyebrowDivider}>/</span>}
                        <span>{cat}</span>
                      </span>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className={styles.identityBlock}>
                <h1 className={styles.nameTitle}>
                  Gastón <br />
                  Ramos<span className={styles.yellowDot}>.</span>
                </h1>

                <div className={styles.mainTitleSlot} aria-live="polite" aria-atomic="true">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.p
                      key={`title-${currentMessage.id}`}
                      className={styles.mainTitle}
                      {...slideMotionProps}
                    >
                      {currentMessage.titlePrefix}
                      <span className={styles.highlight}>{currentMessage.titleHighlight}</span>
                      {currentMessage.titleSuffix}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </div>

              <div className={styles.descriptionSlot} aria-live="polite" aria-atomic="true">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.p
                    key={`desc-${currentMessage.id}`}
                    className={styles.description}
                    {...slideMotionProps}
                  >
                    {currentMessage.description}
                  </motion.p>
                </AnimatePresence>
              </div>

              {/* Discrete manual selector indicators for the Hero Positioning Carousel */}
              <div
                className={styles.carouselControls}
                role="group"
                aria-label="Mensajes de posicionamiento profesional"
              >
                {HERO_MESSAGES.map((msg, idx) => {
                  const isActive = idx === activeSlide
                  return (
                    <button
                      key={msg.id}
                      type="button"
                      onClick={() => {
                        setActiveSlide(idx)
                        setIsPaused(true)
                      }}
                      className={`${styles.carouselDot} ${
                        isActive ? styles.carouselDotActive : ''
                      }`}
                      aria-label={`Mensaje ${idx + 1}: ${msg.label}`}
                      aria-pressed={isActive}
                    >
                      <span className={styles.carouselDotBar} />
                    </button>
                  )
                })}
              </div>

              <div className={styles.ctaGroup}>
                <Link href="/about" className={styles.primaryCta}>
                  Ver Perfil <span aria-hidden="true">&rarr;</span>
                </Link>
                <Link href="/contacto" className={styles.secondaryCta}>
                  Hablemos
                </Link>
              </div>

              {/* Hero Pillars Preview (3 core capabilities with GAR Icon System) */}
              <div className={styles.heroPillars}>
                {FEATURED_CAPABILITIES.map((cap) => (
                  <div key={cap.title} className={styles.pillarItem}>
                    <div className={styles.pillarIcon} aria-hidden="true">
                      <GARIcon name={cap.icon} size={28} />
                    </div>
                    <span className={styles.pillarTitle}>{cap.title}</span>
                    <span className={styles.pillarMeta}>{cap.description}</span>
                  </div>
                ))}
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
                    src="/FotoGAR-hero-v3.webp"
                    alt="Gastón Alejandro Ramos"
                    fill
                    quality={95}
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
                  Más de 30 años de trayectoria asesorando a organizaciones en estrategia, procesos y tecnología para evolucionar sus negocios, con una especialización consolidada en la industria aseguradora y los servicios financieros en Argentina y Latinoamérica.
                </p>
              </div>
            </div>

            <div className={styles.capabilitiesTeaser}>
              {FEATURED_CAPABILITIES.map((cap) => (
                <div key={cap.title} className={styles.capabilityCard}>
                  <div className={styles.iconWrapper}>
                    <GARIcon name={cap.icon} size={30} />
                  </div>
                  <h3>{cap.title}</h3>
                  <p>{cap.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Ecosistema Profesional — Pre-Footer Section */}
      <ProfessionalEcosystem />
    </>
  )
}
