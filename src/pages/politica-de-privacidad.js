import Head from 'next/head'
import styles from '@/styles/Legal.module.css'

export default function PoliticaDePrivacidad() {
  return (
    <>
      <Head>
        <title>Política de Privacidad | Gastón Alejandro Ramos</title>
        <meta name="description" content="Política de privacidad del sitio web de Gastón Alejandro Ramos." />
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
              <h2 className={styles.sectionTitle}>1. Introducción</h2>
              <p className={styles.text}>
                La presente Política de Privacidad describe los criterios bajo los cuales se recopila, utiliza y protege la información en el sitio web titularidad de <strong>Gastón Alejandro Ramos</strong>.
              </p>
              <p className={styles.text}>
                Este sitio tiene carácter profesional e informativo, y se encuentra orientado a la difusión de contenidos, ideas y servicios vinculados a la tecnología, la consultoría y el desarrollo organizacional.
              </p>
              <p className={styles.text}>El uso del sitio implica la aceptación de las prácticas aquí descriptas.</p>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>2. Alcance de la información</h2>
              <p className={styles.text}>
                La información que eventualmente sea proporcionada por los usuarios a través de este sitio será tratada con carácter confidencial y utilizada exclusivamente en el marco de la relación derivada del uso del mismo.
              </p>
              <p className={styles.text}>
                No se recopilan datos sensibles ni se comercializa información personal con terceros.
              </p>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>3. Derechos del usuario</h2>
              <p className={styles.text}>
                Los usuarios podrán ejercer en cualquier momento sus derechos de acceso, rectificación, actualización, limitación, portabilidad o eliminación de los datos personales que hayan proporcionado voluntariamente.
              </p>
              <p className={styles.text}>
                Asimismo, podrán solicitar información adicional sobre el tratamiento de sus datos o requerir la baja de cualquier contacto generado a partir del uso del sitio.
              </p>
              <p className={styles.text}>
                Para ejercer estos derechos, podrán comunicarse mediante el correo electrónico: <strong>ramos.gaston@kopernicus.tech</strong>
              </p>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>4. Seguridad de la información</h2>
              <p className={styles.text}>
                Se adoptan medidas técnicas razonables para proteger la información personal de los usuarios, incluyendo el uso de protocolos seguros de transmisión de datos.
              </p>
              <p className={styles.text}>
                No obstante, se deja constancia de que ningún sistema digital es completamente invulnerable.
              </p>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>5. Propiedad intelectual</h2>
              <p className={styles.text}>
                Todo el contenido presente en este sitio, así como en plataformas y canales asociados — incluyendo LinkedIn, YouTube u otros medios — forma parte del patrimonio intelectual de <strong>Gastón Ramos</strong>.
              </p>
              <p className={styles.text}>Dicho contenido incluye, entre otros:</p>
              <ul className={styles.list}>
                <li>textos</li>
                <li>ideas</li>
                <li>metodologías</li>
                <li>estructuras</li>
                <li>materiales</li>
                <li>enfoques profesionales</li>
              </ul>
              <div className={styles.highlight}>
                <p>
                  Queda <strong>prohibida su reproducción, distribución o utilización</strong> sin autorización previa del titular o sin la correspondiente mención expresa del autor (<strong>Gastón Ramos</strong>) y la fuente original.
                </p>
                <p>El uso indebido de este contenido podrá dar lugar a acciones legales.</p>
              </div>
            </div>

          </div>
        </section>
      </div>
    </>
  )
}
