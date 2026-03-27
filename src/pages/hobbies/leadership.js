import Head from 'next/head'
import Link from 'next/link'
import { motion } from 'framer-motion'
import styles from '@/styles/Hobbies.module.css'
import baseStyles from '@/styles/About.module.css'

const BackIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
)

export default function LeadershipLanding() {
  return (
    <>
      <Head>
        <title>Liderazgo y Mentoría | Gastón Alejandro Ramos</title>
        <meta name="description" content="Acompañar el crecimiento de otros: liderazgo práctico, formación de equipos y mentoría desde la experiencia directa." />
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
            <h1 className={styles.subTitle}>Liderazgo<br />y Mentoría</h1>
            <p className={styles.subTagline}>Acompañar el crecimiento de otros desde la experiencia directa.</p>
          </motion.div>
        </div>
      </div>

      <section className={styles.contentSection}>
        <div className="container">
          <motion.div
            className={styles.contentGrid}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.18 }}
          >
            <div className={styles.sideLabel}>Perspectiva</div>
            <div className={styles.contentBody}>
              <p>
                Llegué a un punto en mi carrera donde parte del trabajo más significativo no es ejecutar proyectos propios, sino ayudar a otros a crecer. No desde un rol académico ni desde una posición de autoridad formal, sino desde la experiencia directa: haber navegado decisiones difíciles, cometido errores, aprendido en contextos de alta incertidumbre y construido equipos en organizaciones complejas.
              </p>
              <p>
                La mentoría que me interesa es práctica y cercana. No se trata de dar consejos genéricos ni de transmitir frameworks abstractos, sino de acompañar a alguien en una situación concreta, compartir perspectivas ganadas de primera mano y ayudar a pensar con más claridad sobre qué decisión tomar y por qué.
              </p>
              <p>
                El liderazgo, desde mi mirada, tiene menos que ver con el cargo y más con la capacidad de generar contexto donde otros pueden dar lo mejor de sí. Eso requiere escucha real, claridad de dirección y una presencia consistente, no solo en los momentos buenos.
              </p>
            </div>
          </motion.div>

          <motion.div
            className={styles.contentGrid}
            style={{ marginTop: '5rem' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.28 }}
          >
            <div className={styles.sideLabel}>Áreas de trabajo</div>
            <div className={styles.contentBody}>
              <p><strong>Liderazgo situacional.</strong> Cómo adaptar el estilo de conducción según la madurez del equipo, el tipo de desafío y el contexto organizacional.</p>
              <p><strong>Formación de equipos de alto rendimiento.</strong> Construcción de cultura, claridad de roles y mecanismos de accountability en equipos técnicos y estratégicos.</p>
              <p><strong>Desarrollo profesional.</strong> Acompañamiento de perfiles en transición: de especialistas a líderes, de empleados a emprendedores, de ejecutores a estrategas.</p>
              <p><strong>Mentoría en tecnología y seguros.</strong> Un espacio específico para quienes quieren crecer en la industria aseguradora o en el mundo de la consultoría estratégica de TI en LATAM.</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.38 }}
          >
            <div className={styles.ctaBlock} style={{ marginTop: '5rem' }}>
              <h3>¿Tiene sentido hablar?</h3>
              <p>
                Si estás en un momento de transición profesional, querés explorar cómo crecer en el mundo de la tecnología y los seguros, o necesitás una perspectiva externa sobre tu estrategia o equipo, esta es una conversación que vale la pena tener.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
