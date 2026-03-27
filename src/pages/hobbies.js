import Head from 'next/head'
import Link from 'next/link'
import { motion } from 'framer-motion'
import styles from '@/styles/Hobbies.module.css'
import baseStyles from '@/styles/About.module.css'

const TechIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
)

const SportIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
)

const LeadershipIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
)

const hubs = [
  {
    id: 'tech',
    href: '/hobbies/tech',
    icon: TechIcon,
    title: 'Tecnología e Innovación',
    tagline: 'Perspectiva estratégica sobre transformación digital',
    intro: 'Más de 30 años en la intersección entre negocio y tecnología forjaron una mirada que va más allá de la herramienta: entender qué innovaciones tienen potencial genuino para transformar organizaciones y cómo implementarlas de forma sostenible.',
    cta: 'Explorar',
  },
  {
    id: 'sport',
    href: '/hobbies/sport',
    icon: SportIcon,
    title: 'Deporte',
    tagline: 'Disciplina, resiliencia y rendimiento sostenido',
    intro: 'Ironman, Ultraman, travesías en aguas abiertas y ultra trail. El deporte de resistencia no es un pasatiempo, es una escuela de foco, tolerancia a la adversidad y ejecución de largo plazo — habilidades que aplico todos los días.',
    cta: 'Ver experiencia',
  },
  {
    id: 'leadership',
    href: '/hobbies/leadership',
    icon: LeadershipIcon,
    title: 'Liderazgo y Mentoría',
    tagline: 'Acompañar el crecimiento de otros',
    intro: 'En un punto de la carrera donde parte del trabajo más significativo es ayudar a otros a crecer. Una mentoría práctica y cercana, desde la experiencia directa en consultoría, dirección ejecutiva y transformación de organizaciones.',
    cta: 'Conocer más',
  },
]

export default function Hobbies() {
  return (
    <>
      <Head>
        <title>Pasatiempos e Intereses | Gastón Alejandro Ramos</title>
        <meta name="description" content="Tecnología, deporte de alto rendimiento y liderazgo — los pilares personales que sostienen la visión profesional de Gastón Alejandro Ramos." />
      </Head>

      <div className={baseStyles.intro}>
        <div className="container">
          <div className={baseStyles.header}>
            <h1 className={baseStyles.title} style={{ color: '#000000' }}>Pasatiempos e intereses</h1>
            <p className={baseStyles.subtitle}>Más allá de la estrategia: los pilares que dan forma a mi visión personal y profesional.</p>
          </div>

          <div className={styles.hubGrid}>
            {hubs.map((hub, index) => {
              const Icon = hub.icon
              return (
                <motion.div
                  key={hub.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5, ease: 'easeOut' }}
                >
                  <Link href={hub.href} className={styles.hubCard}>
                    <div className={styles.hubCardTop}>
                      <span className={styles.hubIcon}>
                        <Icon />
                      </span>
                      <span className={styles.hubIndex}>{String(index + 1).padStart(2, '0')}</span>
                    </div>
                    <div className={styles.hubCardBody}>
                      <h2 className={styles.hubTitle}>{hub.title}</h2>
                      <p className={styles.hubTagline}>{hub.tagline}</p>
                      <p className={styles.hubIntro}>{hub.intro}</p>
                    </div>
                    <div className={styles.hubCardFooter}>
                      <span className={styles.hubCta}>
                        {hub.cta}
                        <ArrowIcon />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      <section className={baseStyles.howIWork}>
        <div className="container">
          <div className={baseStyles.workBox}>
            <h2 className={baseStyles.workTitle}>Equilibrio y Enfoque</h2>
            <p className={baseStyles.workText}>
              La excelencia profesional nace de un equilibrio integral. El deporte de resistencia, la curiosidad tecnológica y el compromiso con el desarrollo de otros no son escapes, sino fuentes de perspectiva y resiliencia que aplico en cada desafío estratégico.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
