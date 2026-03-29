import Head from 'next/head'
import styles from '@/styles/Legal.module.css'

export default function TerminosYCondiciones() {
  return (
    <>
      <Head>
        <title>Términos y Condiciones | Gastón Alejandro Ramos</title>
        <meta name="description" content="Términos y condiciones de uso del sitio web de Gastón Alejandro Ramos." />
      </Head>

      <div className={styles.page}>
        <section className={styles.hero}>
          <div className="container">
            <span className={styles.badge}>Legal</span>
            <h1 className={styles.title}>Términos y Condiciones</h1>
            <p className={styles.meta}>Última actualización: marzo de 2025</p>
          </div>
        </section>

        <section className={styles.body}>
          <div className="container">

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>1. Introducción</h2>
              <p className={styles.text}>
                Los presentes Términos y Condiciones regulan el acceso, navegación y uso del sitio web titularidad de <strong>Gastón Alejandro Ramos</strong>, así como de cualquier contenido, material o información vinculada directa o indirectamente al mismo.
              </p>
              <p className={styles.text}>
                El acceso y utilización de este sitio implican la aceptación plena, expresa y sin reservas de las disposiciones aquí establecidas. En caso de no estar de acuerdo con las mismas, el usuario deberá abstenerse de utilizar el sitio.
              </p>
              <p className={styles.text}>
                Este sitio tiene carácter profesional, informativo y de difusión de contenidos vinculados a la tecnología, la consultoría, la innovación y el desarrollo organizacional.
              </p>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>2. Alcance del contenido</h2>
              <p className={styles.text}>
                Todo el contenido publicado en este sitio, así como el contenido asociado, derivado o complementario difundido a través de otros canales, incluyendo —pero no limitado a— plataformas como LinkedIn, YouTube, presentaciones, documentos, publicaciones o cualquier otro medio digital o físico, forma parte del ecosistema de conocimiento y desarrollo profesional de Gastón Ramos.
              </p>
              <p className={styles.text}>
                El acceso a este sitio no implica en ningún caso la cesión de derechos sobre dicho contenido.
              </p>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>3. Propiedad intelectual</h2>
              <p className={styles.text}>
                Todo el contenido del sitio — incluyendo, entre otros, textos, ideas, metodologías, enfoques, estructuras, modelos, diseños, código, materiales y cualquier tipo de información — es propiedad exclusiva de <strong>Gastón Ramos</strong>, salvo que se indique expresamente lo contrario.
              </p>
              <p className={styles.text}>Este alcance se extiende a:</p>
              <ul className={styles.list}>
                <li>contenidos publicados en este sitio</li>
                <li>contenidos vinculados o referenciados</li>
                <li>contenidos difundidos en plataformas externas asociadas (LinkedIn, YouTube u otras)</li>
                <li>materiales derivados o adaptaciones del contenido original</li>
              </ul>
              <div className={styles.highlight}>
                <p>
                  Queda <strong>estrictamente prohibida</strong> su reproducción, distribución, transformación, adaptación o utilización, total o parcial, con fines comerciales o profesionales, sin autorización previa y por escrito del titular.
                </p>
                <p>
                  El uso permitido del contenido deberá realizarse bajo alguna de las siguientes condiciones: contar con <strong>autorización expresa del autor</strong>, o incluir <strong>mención clara, visible y completa</strong> del autor (Gastón Ramos) junto con la referencia a la fuente original.
                </p>
                <p>El incumplimiento de estas condiciones podrá dar lugar a las acciones legales correspondientes.</p>
              </div>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>4. Limitación de responsabilidad</h2>
              <p className={styles.text}>
                El titular del sitio no garantiza la disponibilidad permanente del mismo ni la ausencia de errores en sus contenidos. Asimismo, no se asume responsabilidad por:
              </p>
              <ul className={styles.list}>
                <li>daños directos o indirectos derivados del uso del sitio</li>
                <li>decisiones tomadas en base a la información publicada</li>
                <li>interrupciones del servicio</li>
                <li>contenidos de terceros accesibles mediante enlaces</li>
              </ul>
              <p className={styles.text}>El uso del sitio es responsabilidad exclusiva del usuario.</p>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>5. Modificaciones</h2>
              <p className={styles.text}>
                Gastón Alejandro Ramos se reserva el derecho de modificar, actualizar o eliminar, en cualquier momento y sin previo aviso:
              </p>
              <ul className={styles.list}>
                <li>los contenidos del sitio</li>
                <li>las condiciones de uso</li>
                <li>la estructura o disponibilidad del mismo</li>
              </ul>
              <p className={styles.text}>El uso continuado del sitio implica la aceptación de dichas modificaciones.</p>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>6. Legislación aplicable y jurisdicción</h2>
              <p className={styles.text}>
                Los presentes Términos y Condiciones se rigen por la legislación vigente en la República Argentina, incluyendo la Ley N.º 25.326 de Protección de Datos Personales.
              </p>
              <p className={styles.text}>
                Para cualquier controversia derivada de la interpretación o aplicación de estos términos, las partes se someten a la jurisdicción de los tribunales competentes de la Ciudad Autónoma de Buenos Aires.
              </p>
            </div>

          </div>
        </section>
      </div>
    </>
  )
}
