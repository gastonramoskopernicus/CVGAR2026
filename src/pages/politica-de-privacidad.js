import Head from 'next/head'
import { motion } from 'framer-motion'
import styles from '@/styles/Legal.module.css'

const sections = [
  { id: 'datos', title: '1. Datos que recopilamos' },
  { id: 'uso', title: '2. Uso de la información' },
  { id: 'proteccion', title: '3. Protección de datos' },
  { id: 'cookies', title: '4. Cookies' },
  { id: 'terceros', title: '5. Servicios de terceros' },
  { id: 'derechos', title: '6. Derechos del usuario' },
  { id: 'propiedad', title: '7. Propiedad intelectual' },
  { id: 'contacto', title: '8. Contacto' },
]

export default function PoliticaDePrivacidad() {
  return (
    <>
      <Head>
        <title>Política de Privacidad | Gastón Alejandro Ramos</title>
        <meta name="description" content="Política de privacidad del sitio personal de Gastón Alejandro Ramos." />
      </Head>

      <div className={styles.page}>
        <section className={styles.hero}>
          <div className="container">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <span className={styles.badge}>Legal</span>
              <h1 className={styles.title}>Política de Privacidad</h1>
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
                    Este sitio web (gaston-portfolio.vercel.app) es el sitio personal y profesional de <strong>Gastón Alejandro Ramos</strong>. La presente política explica qué información podría recopilarse durante la visita y cómo se utiliza. Al navegar este sitio, el usuario acepta los términos aquí descritos.
                  </p>
                </div>

                <div id="datos" className={styles.section}>
                  <h2 className={styles.sectionTitle}>1. Datos que recopilamos</h2>
                  <p className={styles.text}>Este sitio puede recopilar las siguientes categorías de información:</p>
                  <ul className={styles.list}>
                    <li><strong>Formulario de contacto:</strong> nombre, dirección de email, empresa, teléfono y mensaje enviados voluntariamente por el usuario.</li>
                    <li><strong>Datos de navegación:</strong> dirección IP, tipo de navegador, páginas visitadas y tiempo de permanencia, con fines estadísticos y de mejora del sitio.</li>
                    <li>No se recopilan datos sensibles (salud, datos financieros, etc.).</li>
                  </ul>
                </div>

                <div id="uso" className={styles.section}>
                  <h2 className={styles.sectionTitle}>2. Uso de la información</h2>
                  <p className={styles.text}>La información recopilada se utiliza exclusivamente para:</p>
                  <ul className={styles.list}>
                    <li>Responder consultas enviadas a través del formulario de contacto.</li>
                    <li>Mejorar el contenido y la experiencia de navegación del sitio.</li>
                    <li>Analizar el tráfico de forma agregada y anónima.</li>
                  </ul>
                  <p className={styles.text}>No se venden, ceden ni comparten datos personales con terceros con fines comerciales.</p>
                </div>

                <div id="proteccion" className={styles.section}>
                  <h2 className={styles.sectionTitle}>3. Protección de datos</h2>
                  <p className={styles.text}>
                    Se aplican medidas técnicas y organizativas razonables para proteger la información personal contra accesos no autorizados, alteraciones o divulgaciones. La transmisión de datos a través del formulario de contacto se realiza mediante conexión HTTPS.
                  </p>
                  <p className={styles.text}>
                    Sin embargo, ningún método de transmisión por internet es 100% seguro. En caso de cualquier incidente, el titular del sitio tomará las medidas correspondientes de forma inmediata.
                  </p>
                </div>

                <div id="cookies" className={styles.section}>
                  <h2 className={styles.sectionTitle}>4. Cookies</h2>
                  <p className={styles.text}>
                    Este sitio puede utilizar cookies técnicas necesarias para el correcto funcionamiento del mismo (por ejemplo, para mantener el estado de sesión o preferencias de navegación). No se utilizan cookies de seguimiento con fines publicitarios.
                  </p>
                  <p className={styles.text}>
                    El usuario puede configurar su navegador para rechazar o eliminar cookies, aunque esto puede afectar la funcionalidad de algunas partes del sitio.
                  </p>
                </div>

                <div id="terceros" className={styles.section}>
                  <h2 className={styles.sectionTitle}>5. Servicios de terceros</h2>
                  <p className={styles.text}>El sitio puede integrar servicios de terceros, como:</p>
                  <ul className={styles.list}>
                    <li><strong>Vercel</strong> (infraestructura de hosting): puede registrar datos de acceso según su propia política de privacidad.</li>
                    <li><strong>LinkedIn</strong> (enlace externo): al hacer clic en links de LinkedIn, el usuario es redirigido a una plataforma con su propia política de datos.</li>
                  </ul>
                  <p className={styles.text}>Este sitio no controla ni es responsable de las prácticas de privacidad de estos terceros.</p>
                </div>

                <div id="derechos" className={styles.section}>
                  <h2 className={styles.sectionTitle}>6. Derechos del usuario</h2>
                  <p className={styles.text}>El usuario tiene derecho a:</p>
                  <ul className={styles.list}>
                    <li>Acceder a la información personal que haya proporcionado.</li>
                    <li>Solicitar su rectificación o eliminación.</li>
                    <li>Oponerse al tratamiento de sus datos.</li>
                    <li>Solicitar la portabilidad de sus datos.</li>
                  </ul>
                  <p className={styles.text}>Para ejercer cualquiera de estos derechos, puede escribir a <strong>ramos.gaston@kopernicus.tech</strong>.</p>
                </div>

                <div id="propiedad" className={styles.section}>
                  <h2 className={styles.sectionTitle}>7. Propiedad intelectual</h2>
                  <p className={styles.text}>
                    Todo el contenido presente en este sitio — incluyendo textos, ideas, estructuras de contenido, materiales de presentación y cualquier información vinculada — es propiedad intelectual de <strong>Gastón Ramos</strong>, salvo que se indique expresamente lo contrario.
                  </p>
                  <div className={styles.highlight}>
                    <p>
                      Queda <strong>prohibida la reproducción, distribución, modificación o uso comercial</strong> de cualquier contenido de este sitio sin autorización previa y por escrito de su autor. El uso permitido queda sujeto a la cita explícita y correcta de la fuente, indicando autor y URL de origen.
                    </p>
                  </div>
                  <p className={styles.text} style={{ marginTop: '1.25rem' }}>
                    Para solicitar autorización de uso, escribir a <strong>ramos.gaston@kopernicus.tech</strong>.
                  </p>
                </div>

                <div id="contacto" className={styles.section}>
                  <h2 className={styles.sectionTitle}>8. Contacto</h2>
                  <p className={styles.text}>
                    Ante cualquier consulta relacionada con esta política de privacidad, podés comunicarte a través del <a href="/contacto" style={{ textDecoration: 'underline' }}>formulario de contacto</a> o directamente por email a <strong>ramos.gaston@kopernicus.tech</strong>.
                  </p>
                  <p className={styles.text}>
                    Esta política puede actualizarse periódicamente. Se recomienda revisarla de forma regular para mantenerse informado sobre eventuales cambios.
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
