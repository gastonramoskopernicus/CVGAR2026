import Head from 'next/head'
import Link from 'next/link'
import styles from '@/styles/Capabilities.module.css'

export default function Capabilities() {
  const secondaryServices = [
    {
      title: "Transformación Digital para Aseguradoras",
      description: "Evolución integral del modelo operativo, desde la captura del riesgo hasta la atención de siniestros, apalancándose en tecnología digital de última generación.",
      icon: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
    },
    {
      title: "Modernización de Core Systems",
      description: "Consultoría experta en la selección, migración e implementación de sistemas centrales de seguros y plataformas críticas para el negocio.",
      icon: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 20L4 4m16 0L4 20"></path></svg>
    },
    {
      title: "Innovación en Productos",
      description: "Diseño y lanzamiento de nuevos productos y pólizas bajo demanda con un enfoque centrado en el cliente y el aprovechamiento de datos.",
      icon: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
    },
    {
      title: "Automatización & IA",
      description: "Implementación de inteligencia artificial y automatización inteligente para optimizar procesos comerciales y operativos en seguros.",
      icon: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4"></path><path d="M12 18v4"></path><path d="M4.93 4.93l2.83 2.83"></path><path d="M16.24 16.24l2.83 2.83"></path><path d="M2 12h4"></path><path d="M18 12h4"></path><path d="M4.93 19.07l2.83-2.83"></path><path d="M16.24 7.76l2.83-2.83"></path></svg>
    },
    {
      title: "Canales Digitales & B2B2C",
      description: "Desarrollo de ecosistemas de distribución digital y canales de venta directa que potencian la llegada al mercado.",
      icon: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
    },
    {
      title: "Siniestros & Eficiencia",
      description: "Optimización de la cadena de valor en gestión de siniestros para reducir costos operativos y mejorar la satisfacción del cliente.",
      icon: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
    }
  ]

  return (
    <>
      <Head>
        <title>Capacidades | Gastón Alejandro Ramos</title>
      </Head>

      <div className={styles.intro}>
        <div className="container">
          <div className={styles.header}>
            <h1 className={styles.title} style={{ color: '#000000' }}>Capacidades</h1>
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
                <div className={styles.cardIcon} style={{ color: '#000000', marginBottom: '1.5rem' }}>
                  {service.icon}
                </div>
                <h3 className={styles.cardTitle} style={{ color: '#000000' }}>{service.title}</h3>
                <p className={styles.cardDescription} style={{ color: '#555555' }}>{service.description}</p>
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
            <Link href="#contact" className={styles.contactBtn}>
              Iniciar una Conversación
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
