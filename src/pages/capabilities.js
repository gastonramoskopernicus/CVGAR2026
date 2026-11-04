import Link from 'next/link'
import SEOHead from '@/components/SEOHead'
import { buildCapabilitiesSchema } from '@/lib/schemaOrg'
import GARIcon from '@/components/GARIcon'
import styles from '@/styles/Capabilities.module.css'

export default function Capabilities() {
  const secondaryServices = [
    {
      title: "Transformación Digital para Aseguradoras",
      description: "Evolución integral del modelo operativo, desde la captura del riesgo hasta la atención de siniestros, apalancándose en tecnología digital de última generación.",
      icon: <GARIcon name="transformation" size={34} />
    },
    {
      title: "Modernización de Core Systems",
      description: "Consultoría experta en la selección, migración e implementación de sistemas centrales de seguros y plataformas críticas para el negocio.",
      icon: <GARIcon name="architecture" size={34} />
    },
    {
      title: "Innovación en Productos",
      description: "Diseño y lanzamiento de nuevos productos y pólizas bajo demanda con un enfoque centrado en el cliente y el aprovechamiento de datos.",
      icon: <GARIcon name="innovation" size={34} />
    },
    {
      title: "Automatización & IA",
      description: "Implementación de inteligencia artificial y automatización inteligente para optimizar procesos comerciales y operativos en seguros.",
      icon: <GARIcon name="ai" size={34} />
    },
    {
      title: "Canales Digitales & B2B2C",
      description: "Desarrollo de ecosistemas de distribución digital y canales de venta directa que potencian la llegada al mercado.",
      icon: <GARIcon name="ventures" size={34} />
    },
    {
      title: "Siniestros & Eficiencia",
      description: "Optimización de la cadena de valor en gestión de siniestros para reducir costos operativos y mejorar la satisfacción del cliente.",
      icon: <GARIcon name="operations" size={34} />
    }
  ]

  return (
    <>
      <SEOHead
        title="Capacidades de Consultoría | Gastón Alejandro Ramos"
        description="Servicios de consultoría estratégica y tecnológica, transformación digital, modernización de sistemas core, inteligencia artificial, automatización y advisory para empresas."
        path="/capabilities"
        jsonLd={buildCapabilitiesSchema()}
      />

      <div className={styles.intro}>
        <div className="container">
          <div className={styles.header}>
            <h1 className={styles.title}>Capacidades</h1>
            <p className={styles.subtitle}>Soluciones estratégicas y ejecución técnica para los desafíos reales del sector asegurador.</p>
          </div>

          <div className={styles.featuredCapability}>
            <span className={styles.featuredLabel}>Enfoque Principal</span>
            <h2 className={styles.featuredTitle}>Estrategia Tecnológica Integral</h2>
            <p className={styles.featuredDescription}>
              Ayudo a las organizaciones a definir un camino tecnológico robusto que conecte los objetivos estratégicos con una arquitectura moderna, garantizando escalabilidad y resultados tangibles.
            </p>
          </div>

          <div className={styles.grid}>
            {secondaryServices.map((service, index) => (
              <div key={index} className={styles.card}>
                <div className={styles.cardTop}>
                  <div className={styles.cardIcon}>
                    {service.icon}
                  </div>
                  <span className={styles.cardIndex}>{String(index + 1).padStart(2, '0')}</span>
                </div>
                <h3 className={styles.cardTitle}>{service.title}</h3>
                <p className={styles.cardDescription}>{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className={styles.ctaSection}>
        <div className="container">
          <div className={styles.ctaBox}>
            <h2 className={styles.ctaTitle}>¿Está listo para dar el siguiente paso?</h2>
            <p className={styles.ctaText}>
              Conversemos sobre cómo mi experiencia senior y visión estratégica pueden guiar la evolución de su organización aseguradora.
            </p>
            <Link href="/contacto" className={styles.contactBtn}>
              Hablemos
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
