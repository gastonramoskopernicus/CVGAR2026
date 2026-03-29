import Head from 'next/head'
import styles from '@/styles/Legal.module.css'

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
            <span className={styles.badge}>Legal</span>
            <h1 className={styles.title}>Política de Privacidad</h1>
            <p className={styles.meta}>Última actualización: marzo de 2025</p>
          </div>
        </section>

        <section className={styles.body}>
          <div className="container">

            <div className={styles.section}>
              <p className={styles.text}>
                Este sitio web es el sitio personal y profesional de <strong>Gastón Alejandro Ramos</strong>. La presente política describe qué información puede recopilarse durante la visita y cómo se utiliza.
              </p>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Datos que recopilamos</h2>
              <ul className={styles.list}>
                <li><strong>Formulario de contacto:</strong> nombre, email, empresa, teléfono y mensaje enviados voluntariamente por el usuario.</li>
                <li><strong>Datos de navegación:</strong> dirección IP, tipo de navegador y páginas visitadas, con fines estadísticos y de mejora del sitio.</li>
              </ul>
              <p className={styles.text} style={{ marginTop: '0.85rem' }}>No se recopilan datos sensibles ni se venden datos a terceros.</p>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Uso de la información</h2>
              <p className={styles.text}>La información recopilada se utiliza exclusivamente para responder consultas enviadas a través del formulario de contacto y para mejorar la experiencia de navegación del sitio.</p>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Protección de datos</h2>
              <p className={styles.text}>Se aplican medidas técnicas razonables para proteger la información personal. La transmisión de datos se realiza mediante conexión HTTPS. No obstante, ningún sistema de transmisión por internet es completamente seguro.</p>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Cookies</h2>
              <p className={styles.text}>El sitio puede utilizar cookies técnicas necesarias para su correcto funcionamiento. No se utilizan cookies de seguimiento con fines publicitarios. El usuario puede configurar su navegador para rechazarlas.</p>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Servicios de terceros</h2>
              <p className={styles.text}>El sitio utiliza Vercel para hosting e incluye enlaces a plataformas externas (LinkedIn). Estos servicios tienen sus propias políticas de privacidad y este sitio no se hace responsable de sus prácticas.</p>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Derechos del usuario</h2>
              <p className={styles.text}>El usuario puede solicitar acceso, rectificación, eliminación o portabilidad de sus datos escribiendo a <strong>ramos.gaston@kopernicus.tech</strong>.</p>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Propiedad intelectual</h2>
              <p className={styles.text}>
                Todo el contenido de este sitio — textos, ideas, estructuras, materiales y cualquier información vinculada — es propiedad intelectual de <strong>Gastón Ramos</strong>.
              </p>
              <div className={styles.highlight}>
                <p>
                  Queda <strong>prohibida la reproducción, distribución o uso</strong> de cualquier contenido sin autorización previa del autor o sin citar correctamente la fuente: nombre completo (Gastón Ramos) y URL de origen.
                </p>
              </div>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Contacto</h2>
              <p className={styles.text}>
                Para consultas sobre esta política, contactar a través del <a href="/contacto" style={{ textDecoration: 'underline' }}>formulario de contacto</a> o por email a <strong>ramos.gaston@kopernicus.tech</strong>.
              </p>
            </div>

          </div>
        </section>
      </div>
    </>
  )
}
