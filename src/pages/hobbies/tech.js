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

export default function TechLanding() {
  return (
    <>
      <Head>
        <title>Tecnología e Innovación | Gastón Alejandro Ramos</title>
        <meta name="description" content="Perspectiva estratégica sobre transformación digital, innovación y evolución de organizaciones a través de la tecnología." />
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
            <h1 className={styles.subTitle}>Tecnología<br />e Innovación</h1>
            <p className={styles.subTagline}>Perspectiva estratégica sobre cómo la tecnología transforma organizaciones.</p>
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
                La tecnología no es un fin en sí misma, sino el medio por el que las organizaciones evolucionan y generan valor real. Desde chico me fascinó entender cómo funcionan los sistemas: cómo se conectan, cómo pueden cambiar procesos que parecían inamovibles y cómo una buena arquitectura de información puede transformar por completo la manera en que una empresa opera.
              </p>
              <p>
                Con más de 30 años en la intersección entre negocio y tecnología, desarrollé una mirada que va más allá de la implementación técnica. No se trata de adoptar cada nueva herramienta que aparece, sino de identificar qué innovaciones tienen potencial genuino de transformación y cómo diseñar su adopción de forma sostenible dentro de la organización.
              </p>
              <p>
                El foco particular está en el sector asegurador latinoamericano: una industria con altísimo potencial de modernización, donde la convergencia entre IA, arquitectura empresarial, ecosistemas Insurtech y nuevos modelos de distribución está redefiniendo las reglas del negocio.
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
            <div className={styles.sideLabel}>Áreas de interés</div>
            <div className={styles.contentBody}>
              <p><strong>Estrategia tecnológica.</strong> Alineación entre los objetivos del negocio y las capacidades de IT. Roadmaps de transformación. Gobierno de arquitectura empresarial.</p>
              <p><strong>Innovación aplicada.</strong> Evaluación y adopción de tecnologías emergentes: IA generativa, automatización inteligente, APIs y ecosistemas digitales en el contexto de seguros.</p>
              <p><strong>Evolución de organizaciones.</strong> Cómo las empresas tradicionales pueden reinventarse sin perder su ADN, construyendo capacidades digitales de forma incremental y con impacto medible.</p>
              <p><strong>Transformación digital en LATAM.</strong> Particularidades del mercado regional, regulatorias y culturales, que hacen que la transformación digital en Argentina y el resto de la región tenga sus propios patrones y velocidades.</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.38 }}
          >
            <div className={styles.ctaBlock} style={{ marginTop: '5rem' }}>
              <h3>Próximos contenidos</h3>
              <p>
                Este espacio está preparado para recibir artículos, reflexiones y análisis sobre tecnología, innovación y transformación digital. Si querés hablar sobre alguno de estos temas o explorar una colaboración, el canal de contacto está abierto.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
