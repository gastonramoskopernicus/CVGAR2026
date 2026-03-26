import Head from 'next/head'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styles from '@/styles/Hobbies.module.css'
import baseStyles from '@/styles/About.module.css'

// B&W minimal SVG icons — inline, no dependencies
const TechIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
)

const SportIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
)

const LeadershipIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

const ChevronIcon = ({ isOpen }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}
    aria-hidden="true"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

const categories = [
  {
    id: 'tech',
    title: 'Tecnología e Innovación',
    icon: TechIcon,
    tagline: 'Perspectiva estratégica sobre transformación digital',
    intro: `La tecnología no es un fin en sí misma, sino el medio por el que las organizaciones evolucionan y generan valor real. Desde chico me fascinó entender cómo funcionan los sistemas, cómo se conectan y cómo pueden cambiar procesos que parecían inamovibles.

Con más de 30 años de experiencia en la intersección entre negocio y tecnología, desarrollé una mirada que integra la estrategia con la ejecución. No se trata de adoptar cada nueva herramienta que aparece, sino de identificar qué innovaciones tienen potencial genuino para transformar una industria y cómo implementarlas de forma sostenible.

Este espacio está pensado como punto de encuentro para reflexiones, experiencias y aprendizajes sobre innovación, IT strategy y transformación digital — con foco en el mercado latinoamericano y el sector asegurador.`,
    cta: 'Próximamente: artículos sobre IA aplicada, arquitectura empresarial y ecosistemas Insurtech.',
  },
  {
    id: 'sport',
    title: 'Deporte',
    icon: SportIcon,
    tagline: 'Disciplina, resiliencia y rendimiento sostenido',
    intro: `El deporte me dio herramientas que no encontré en ningún libro. La consistencia, la tolerancia a la incomodidad y la capacidad de mantener el foco en objetivos de largo plazo son habilidades que entrené durante años en la pista, el agua y el camino, y que aplico todos los días en el trabajo.

Mi trayectoria incluye:
— 9 medios Ironman completados
— 6 Ironman completados
— Travesía de natación Villusquiza–Paraná (30 km en aguas abiertas)
— 3 participaciones en medio Ultraman
— Finalista en Ultraman Brasil UV515 — único representante argentino en esa instancia
— Múltiples maratones y experiencias de ultra trail

No me interesa el deporte como exhibición. Me interesa como práctica de desarrollo personal y como metáfora del esfuerzo sostenido. Cada meta larga enseña algo que no se puede enseñar en un aula.`,
    cta: 'Próximamente: reflexiones sobre entrenamiento, travesías y lo que el deporte de resistencia enseña sobre el liderazgo.',
  },
  {
    id: 'leadership',
    title: 'Liderazgo y Mentoría',
    icon: LeadershipIcon,
    tagline: 'Acompañar el crecimiento de otros',
    intro: `Llegué a un punto en mi carrera donde parte del trabajo más significativo es ayudar a otros a crecer. No desde un rol académico, sino desde la experiencia directa: haber trabajado en consultoría, en dirección ejecutiva, en proyectos de transformación complejos y en la construcción de equipos.

La mentoría que me interesa es práctica y cercana. No se trata de dar consejos genéricos, sino de acompañar a alguien en una situación concreta, compartir perspectivas ganadas de primera mano y ayudar a pensar con más claridad.

Si estás en un momento de transición profesional, explorando cómo crecer en el mundo de la tecnología y los seguros, o necesitás una perspectiva externa sobre tu estrategia, esta es una conversación que vale la pena tener.`,
    cta: 'Próximamente: notas sobre liderazgo, cultura organizacional y desarrollo de equipos.',
  },
]

export default function Hobbies() {
  const [openId, setOpenId] = useState(null)

  const toggle = (id) => setOpenId(prev => prev === id ? null : id)

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

          <div className={styles.categoriesStack}>
            {categories.map((cat, index) => {
              const Icon = cat.icon
              const isOpen = openId === cat.id
              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08, duration: 0.5, ease: 'easeOut' }}
                  className={styles.categoryItem}
                >
                  <button
                    className={`${styles.categoryTrigger} ${isOpen ? styles.triggerOpen : ''}`}
                    onClick={() => toggle(cat.id)}
                    aria-expanded={isOpen}
                    aria-controls={`panel-${cat.id}`}
                  >
                    <div className={styles.triggerLeft}>
                      <span className={styles.iconWrap}>
                        <Icon />
                      </span>
                      <div className={styles.triggerText}>
                        <span className={styles.categoryTitle}>{cat.title}</span>
                        <span className={styles.categoryTagline}>{cat.tagline}</span>
                      </div>
                    </div>
                    <ChevronIcon isOpen={isOpen} />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`panel-${cat.id}`}
                        key="panel"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.38, ease: [0.4, 0, 0.2, 1] }}
                        style={{ overflow: 'hidden' }}
                        role="region"
                        aria-label={cat.title}
                      >
                        <div className={styles.panelInner}>
                          <div className={styles.panelText}>
                            {cat.intro.split('\n').map((para, i) => (
                              para.trim() ? (
                                <p key={i} className={para.startsWith('—') ? styles.bulletLine : undefined}>
                                  {para}
                                </p>
                              ) : null
                            ))}
                          </div>
                          <p className={styles.panelCta}>{cat.cta}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
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
