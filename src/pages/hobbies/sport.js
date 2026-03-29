import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { promises as fs } from 'fs'
import path from 'path'
import styles from '@/styles/Hobbies.module.css'
import baseStyles from '@/styles/About.module.css'

const BackIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
)

const PrevIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
)

const NextIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
)

// Seeded shuffle — deterministic per session, gives variety without hydration mismatch
function seededShuffle(arr, seed) {
  const shuffled = [...arr]
  let s = seed
  for (let i = shuffled.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    const j = Math.abs(s) % (i + 1)
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

const VISIBLE = 3 // slides visible at once

export default function SportLanding({ photos }) {
  const [shuffled, setShuffled] = useState(photos)
  const [page, setPage] = useState(0)

  // Shuffle client-side on mount using today's date as seed for daily variety
  useEffect(() => {
    const seed = new Date().getDate() * 31 + new Date().getMonth() * 12
    setShuffled(seededShuffle(photos, seed))
  }, [photos])

  const totalPages = Math.ceil(shuffled.length / VISIBLE)

  const prev = useCallback(() => setPage(p => Math.max(0, p - 1)), [])
  const next = useCallback(() => setPage(p => Math.min(totalPages - 1, p + 1)), [totalPages])

  const visiblePhotos = shuffled.slice(page * VISIBLE, page * VISIBLE + VISIBLE)

  return (
    <>
      <Head>
        <title>Deporte | Gastón Alejandro Ramos</title>
        <meta name="description" content="9 medios Ironman, 6 Ironman, Ultraman Brasil UB515 — el deporte de resistencia como disciplina de vida." />
      </Head>

      <div className={`${baseStyles.intro} ${styles.subHero}`}>
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Link href="/hobbies" className={styles.backLink}>
              <BackIcon />
              Pasatiempos e intereses
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.08 }}>
            <h1 className={styles.subTitle}>Deporte</h1>
            <p className={styles.subTagline}>Disciplina, resiliencia y rendimiento sostenido como práctica de vida.</p>
          </motion.div>
        </div>
      </div>

      <section className={styles.contentSection}>
        <div className="container">

          {/* Stats Row */}
          <motion.div
            className={styles.statsRow}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.15 }}
          >
            <div className={styles.statItem}>
              <span className={styles.statValue}>UB515</span>
              <span className={styles.statLabel}>Finalista Ultraman Brasil</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>6</span>
              <span className={styles.statLabel}>Ironman — Distancia 140.6 Millas</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>Medio Ultraman</span>
              <span className={styles.statLabel}>301K</span>
            </div>
          </motion.div>

          {/* Main content */}
          <motion.div
            className={styles.contentGrid}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.25 }}
          >
            <div className={styles.sideLabel}>Visión</div>
            <div className={styles.contentBody}>
              <p>
                El deporte me dio herramientas que no encontré en ningún libro. La consistencia, la tolerancia a la incomodidad y la capacidad de mantener el foco en objetivos de largo plazo son habilidades que entrené durante años en la pista, el agua y el camino, y que aplico todos los días en el trabajo.
              </p>
              <p>
                No me interesa el deporte como exhibición. Me interesa como práctica de desarrollo personal y como metáfora del esfuerzo sostenido. Cada meta larga enseña algo que no se puede enseñar en un aula: que la distancia entre el punto de quiebre y el final depende de entrenamiento acumulado, no de inspiración puntual.
              </p>
            </div>
          </motion.div>

          {/* Achievements list */}
          <motion.div
            className={styles.contentGrid}
            style={{ marginTop: '4rem' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.32 }}
          >
            <div className={styles.sideLabel}>Trayectoria</div>
            <ul className={styles.achievementList}>
              <li className={styles.achievementItem}>UB515 — Ultraman Brasil</li>
              <li className={styles.achievementItem}>3 participaciones en el Medio Ultraman (Atletas Extremos, Córdoba)</li>
              <li className={styles.achievementItem}>6 Ironman completos (distancia 140.6)</li>
              <li className={styles.achievementItem}>9 medios Ironman (distancia 70.3)</li>
              <li className={styles.achievementItem}>Travesía de natación Villa Urquiza–Paraná (30 km)</li>
              <li className={styles.achievementItem}>La Misión – Ultratrail 120 km</li>
              <li className={styles.achievementItem}>Múltiples maratones y experiencias de ultra trail (4x maratones, Ultra Trail Pachamama, Ultra Trail Aconcagua, etc.)</li>
            </ul>
          </motion.div>

        </div>
      </section>

      {/* Photo Carousel — full bleed section */}
      {shuffled.length > 0 && (
        <motion.div
          className={styles.carouselSection}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className={styles.carouselHeader} style={{ maxWidth: '1280px', margin: '0 auto 2.5rem', padding: '0 2rem' }}>
            <span className={styles.carouselTitle}>Imágenes</span>
            <div className={styles.carouselControls}>
              <button
                className={styles.carouselBtn}
                onClick={prev}
                disabled={page === 0}
                aria-label="Anterior"
              >
                <PrevIcon />
              </button>
              <button
                className={styles.carouselBtn}
                onClick={next}
                disabled={page >= totalPages - 1}
                aria-label="Siguiente"
              >
                <NextIcon />
              </button>
            </div>
          </div>

          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 2rem' }}>
            <div className={styles.carouselTrack} style={{ padding: 0 }}>
              {visiblePhotos.map((photo) => (
                <div key={photo} className={styles.carouselSlide}>
                  <Image
                    src={`/photos/${photo}`}
                    alt="Experiencia deportiva"
                    width={600}
                    height={450}
                    className={styles.carouselImg}
                    sizes="(max-width: 768px) 85vw, 33vw"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>

            {/* Dots */}
            <div className={styles.carouselDots}>
              {Array.from({ length: Math.min(totalPages, 12) }).map((_, i) => (
                <button
                  key={i}
                  className={`${styles.carouselDot} ${i === page % 12 ? styles.carouselDotActive : ''}`}
                  onClick={() => setPage(i)}
                  aria-label={`Página ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}

      <section style={{ paddingBottom: '2rem' }}>
        <div className="container">
          <motion.div
            className={styles.contentGrid}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.5 }}
          >
            <div className={styles.sideLabel}>Perfil oficial</div>
            <div>
              <a
                href="https://www.ub515.com.br/es/atletas-3/gast%C3%B3n-ramos"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.externalLink}
              >
                <span className={styles.externalLinkText}>
                  Ver perfil en Ultraman Brasil UB515
                </span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="7" y1="17" x2="17" y2="7" />
                  <polyline points="7 7 17 7 17 17" />
                </svg>
              </a>
              <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--muted-foreground)', lineHeight: 1.5 }}>
                Ficha oficial como atleta finalista en Ultraman Brasil UB515 — única representación argentina en esa instancia.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <section style={{ paddingBottom: '6rem' }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.58 }}
          >
            <div className={styles.ctaBlock}>
              <h3>Próximos contenidos</h3>
              <p>
                Reflexiones sobre entrenamiento de largo aliento, travesías en aguas abiertas y lo que el deporte de resistencia enseña sobre liderazgo, toma de decisiones y resiliencia profesional.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}

export async function getStaticProps() {
  const photosDir = path.join(process.cwd(), 'public', 'photos')
  let photos = []
  try {
    const files = await fs.readdir(photosDir)
    photos = files
      .filter(f => /\.(jpe?g|png|webp|gif)$/i.test(f))
      .sort() // stable default order; client shuffles on mount
  } catch (e) {
    photos = []
  }

  return {
    props: { photos },
  }
}
