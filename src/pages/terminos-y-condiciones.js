import Head from 'next/head'
import { motion } from 'framer-motion'
import styles from '@/styles/Legal.module.css'

const sections = [
  { id: 'uso', title: '1. Uso del sitio' },
  { id: 'responsabilidad', title: '2. Responsabilidad del usuario' },
  { id: 'limitacion', title: '3. Limitación de responsabilidad' },
  { id: 'disponibilidad', title: '4. Disponibilidad del servicio' },
  { id: 'cambios', title: '5. Cambios en el contenido' },
  { id: 'propiedad', title: '6. Propiedad intelectual' },
  { id: 'legislacion', title: '7. Legislación aplicable' },
  { id: 'contacto', title: '8. Contacto' },
]

export default function TerminosYCondiciones() {
  return (
    <>
      <Head>
        <title>Términos y Condiciones | Gastón Alejandro Ramos</title>
        <meta name="description" content="Términos y condiciones de uso del sitio personal de Gastón Alejandro Ramos." />
      </Head>

      <div className={styles.page}>
        <section className={styles.hero}>
          <div className="container">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <span className={styles.badge}>Legal</span>
              <h1 className={styles.title}>Términos y Condiciones</h1>
              <p className={styles.meta}>Última actualización: marzo de 2025</p>
            </motion.div>
          </div>
        </section>

        <section className={styles.body}>
          <div className="container">
            <motion.div
              className={styles.inner}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {/* TOC */}
              <nav className={styles.toc} aria-label="Tabla de contenidos">
                <p className={styles.tocTitle}>Contenidos</p>
                {sections.map(s => (
                  <a key={s.id} href={`#${s.id}`} className={styles.tocLink}>{s.title}</a>
                ))}
              </nav>

              {/* Content */}
              <div className={styles.content}>

                <div className={styles.section}>
                  <p className={styles.text}>
                    Los presentes términos y condiciones regulan el acceso y uso del sitio web de <strong>Gastón Alejandro Ramos</strong> (en adelante, "el sitio"). Al acceder y utilizar este sitio, el usuario acepta íntegramente estas condiciones. Si no está de acuerdo con alguno de estos términos, debe abstenerse de utilizar el sitio.
                  </p>
                </div>

                <div id="uso" className={styles.section}>
                  <h2 className={styles.sectionTitle}>1. Uso del sitio</h2>
                  <p className={styles.text}>
                    El sitio tiene carácter informativo y profesional. Está destinado a presentar la trayectoria, capacidades e intereses de Gastón Alejandro Ramos, y a facilitar el contacto con potenciales clientes, colaboradores y profesionales del sector.
                  </p>
                  <p className={styles.text}>El usuario se compromete a:</p>
                  <ul className={styles.list}>
                    <li>Utilizar el sitio de manera lícita y conforme a la buena fe.</li>
                    <li>No realizar actividades que puedan dañar, inutilizar o deteriorar el sitio.</li>
                    <li>No intentar acceder de forma no autorizada a sistemas o redes vinculados al sitio.</li>
                    <li>No utilizar el formulario de contacto para fines fraudulentos o spam.</li>
                  </ul>
                </div>

                <div id="responsabilidad" className={styles.section}>
                  <h2 className={styles.sectionTitle}>2. Responsabilidad del usuario</h2>
                  <p className={styles.text}>
                    El usuario es responsable del uso que haga del sitio y de la veracidad de la información que proporcione a través del formulario de contacto u otros medios disponibles. Cualquier daño causado por un uso indebido del sitio será responsabilidad exclusiva del usuario.
                  </p>
                </div>

                <div id="limitacion" className={styles.section}>
                  <h2 className={styles.sectionTitle}>3. Limitación de responsabilidad</h2>
                  <p className={styles.text}>
                    El titular del sitio no garantiza la disponibilidad permanente, la ausencia de errores ni la exactitud absoluta de los contenidos. La información presentada tiene carácter orientativo y puede contener inexactitudes o estar desactualizada.
                  </p>
                  <p className={styles.text}>
                    El sitio puede incluir enlaces a recursos externos. No se asume responsabilidad por el contenido, políticas de privacidad ni prácticas de sitios de terceros enlazados.
                  </p>
                  <p className={styles.text}>
                    En ningún caso el titular será responsable de daños directos, indirectos, incidentales o consecuentes derivados del uso o de la imposibilidad de uso del sitio.
                  </p>
                </div>

                <div id="disponibilidad" className={styles.section}>
                  <h2 className={styles.sectionTitle}>4. Disponibilidad del servicio</h2>
                  <p className={styles.text}>
                    El titular del sitio se reserva el derecho de interrumpir, suspender o modificar el acceso al sitio en cualquier momento y sin previo aviso, ya sea por razones técnicas, de mantenimiento, seguridad u otra causa justificada. No se asume responsabilidad por interrupciones temporales del servicio.
                  </p>
                </div>

                <div id="cambios" className={styles.section}>
                  <h2 className={styles.sectionTitle}>5. Cambios en el contenido</h2>
                  <p className={styles.text}>
                    El contenido del sitio puede actualizarse, modificarse o eliminarse en cualquier momento sin previo aviso. El titular se reserva el derecho de realizar dichas modificaciones para mantener la información relevante y actualizada.
                  </p>
                  <p className={styles.text}>
                    Se recomienda al usuario revisar periódicamente estos términos, ya que también pueden actualizarse. El uso continuado del sitio tras cualquier modificación implica la aceptación de los nuevos términos.
                  </p>
                </div>

                <div id="propiedad" className={styles.section}>
                  <h2 className={styles.sectionTitle}>6. Propiedad intelectual</h2>
                  <p className={styles.text}>
                    Todo el contenido de este sitio — incluyendo, sin limitación, textos, artículos, ideas, estructuras de contenido, materiales de presentación, diseño, código fuente y cualquier otro elemento — es propiedad intelectual de <strong>Gastón Ramos</strong>, salvo indicación expresa en contrario.
                  </p>
                  <div className={styles.highlight}>
                    <p>
                      <strong>Queda expresamente prohibido</strong> reproducir, distribuir, transformar, comunicar públicamente o usar con fines comerciales cualquier contenido de este sitio, total o parcialmente, sin haber obtenido autorización previa y por escrito de su autor.
                    </p>
                    <p style={{ marginTop: '0.85rem' }}>
                      El uso permitido está condicionado a la <strong>cita explícita del autor y la fuente</strong>, indicando nombre completo (Gastón Ramos) y URL del sitio de origen. El incumplimiento de estas condiciones puede dar lugar a acciones legales.
                    </p>
                  </div>
                  <p className={styles.text} style={{ marginTop: '1.25rem' }}>
                    Para solicitar autorización de uso o colaboración, contactar a <strong>ramos.gaston@kopernicus.tech</strong>.
                  </p>
                </div>

                <div id="legislacion" className={styles.section}>
                  <h2 className={styles.sectionTitle}>7. Legislación aplicable</h2>
                  <p className={styles.text}>
                    Estos términos y condiciones se rigen por la legislación de la República Argentina, en particular por la Ley 25.326 de Protección de Datos Personales y demás normativa aplicable. Cualquier controversia derivada del uso del sitio será sometida a los tribunales competentes de la Ciudad Autónoma de Buenos Aires.
                  </p>
                </div>

                <div id="contacto" className={styles.section}>
                  <h2 className={styles.sectionTitle}>8. Contacto</h2>
                  <p className={styles.text}>
                    Para consultas relacionadas con estos términos y condiciones, podés escribir a través del <a href="/contacto" style={{ textDecoration: 'underline' }}>formulario de contacto</a> o directamente a <strong>ramos.gaston@kopernicus.tech</strong>.
                  </p>
                </div>

              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  )
}
