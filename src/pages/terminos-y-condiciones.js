import Head from 'next/head'
import styles from '@/styles/Legal.module.css'

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
            <span className={styles.badge}>Legal</span>
            <h1 className={styles.title}>Términos y Condiciones</h1>
            <p className={styles.meta}>Última actualización: marzo de 2025</p>
          </div>
        </section>

        <section className={styles.body}>
          <div className="container">

            <div className={styles.section}>
              <p className={styles.text}>
                Los presentes términos regulan el acceso y uso del sitio web de <strong>Gastón Alejandro Ramos</strong>. Al acceder a este sitio, el usuario acepta estas condiciones en su totalidad.
              </p>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Uso del sitio</h2>
              <p className={styles.text}>El sitio tiene carácter informativo y profesional. El usuario se compromete a utilizarlo de manera lícita, sin intentar dañarlo, acceder de forma no autorizada ni emplearlo para fines fraudulentos.</p>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Responsabilidad del usuario</h2>
              <p className={styles.text}>El usuario es responsable del uso que haga del sitio y de la veracidad de la información que proporcione. Cualquier daño derivado de un uso indebido es responsabilidad exclusiva del usuario.</p>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Limitación de responsabilidad</h2>
              <p className={styles.text}>El titular del sitio no garantiza la disponibilidad permanente ni la exactitud absoluta de los contenidos. No se asume responsabilidad por daños directos o indirectos derivados del uso o de la imposibilidad de acceso al sitio, ni por el contenido de sitios externos enlazados.</p>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Disponibilidad y cambios</h2>
              <p className={styles.text}>El titular se reserva el derecho de interrumpir, modificar o eliminar el acceso al sitio o a cualquier contenido del mismo, en cualquier momento y sin previo aviso. El uso continuado del sitio tras cualquier modificación implica la aceptación de los nuevos términos.</p>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Propiedad intelectual</h2>
              <p className={styles.text}>
                Todo el contenido de este sitio — incluyendo textos, ideas, estructuras, diseño, código y materiales — es propiedad intelectual de <strong>Gastón Ramos</strong>, salvo indicación expresa en contrario.
              </p>
              <div className={styles.highlight}>
                <p>
                  Queda <strong>expresamente prohibido</strong> reproducir, distribuir, transformar o usar con fines comerciales cualquier contenido de este sitio sin autorización previa y por escrito de su autor.
                </p>
                <p>
                  El uso permitido está condicionado a la <strong>cita explícita del autor</strong>: nombre completo (Gastón Ramos) y URL de origen. El incumplimiento puede dar lugar a acciones legales.
                </p>
              </div>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Legislación aplicable</h2>
              <p className={styles.text}>Estos términos se rigen por la legislación de la República Argentina, en particular la Ley 25.326 de Protección de Datos Personales. Cualquier controversia será sometida a los tribunales competentes de la Ciudad Autónoma de Buenos Aires.</p>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Contacto</h2>
              <p className={styles.text}>
                Para consultas sobre estos términos, escribir a través del <a href="/contacto" style={{ textDecoration: 'underline' }}>formulario de contacto</a> o a <strong>ramos.gaston@kopernicus.tech</strong>.
              </p>
            </div>

          </div>
        </section>
      </div>
    </>
  )
}
