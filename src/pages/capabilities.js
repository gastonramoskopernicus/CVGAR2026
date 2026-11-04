import Link from 'next/link'
import SEOHead from '@/components/SEOHead'
import { buildCapabilitiesSchema } from '@/lib/schemaOrg'
import GARIcon from '@/components/GARIcon'
import styles from '@/styles/Capabilities.module.css'

export default function Capabilities() {
  const coreCapabilities = [
    {
      title: 'Estrategia y Transformación del Negocio',
      description:
        'Definición de hojas de ruta, evolución de modelos operativos, priorización de inversiones y alineación entre objetivos empresariales y tecnología.',
      icon: <GARIcon name="strategy" size={34} />,
      topics: [
        'Estrategia tecnológica y de negocio.',
        'Roadmaps de transformación.',
        'Evolución de modelos operativos.',
        'Evaluación y priorización de iniciativas.',
        'Acompañamiento de programas estratégicos.',
      ],
    },
    {
      title: 'Optimización y Digitalización de Procesos',
      description:
        'Diagnóstico de operaciones, simplificación de circuitos, automatización, reducción de tareas manuales y mejora de productividad.',
      icon: <GARIcon name="operations" size={34} />,
      topics: [
        'Relevamiento y rediseño de procesos.',
        'Identificación de ineficiencias.',
        'Automatización de tareas.',
        'Integración entre áreas y sistemas.',
        'Mejora de productividad y calidad operativa.',
      ],
    },
    {
      title: 'Estrategia y Arquitectura Tecnológica',
      description:
        'Modernización de plataformas, integración de sistemas, evaluación y selección de software, proveedores y soluciones empresariales.',
      icon: <GARIcon name="architecture" size={34} />,
      topics: [
        'Arquitectura empresarial.',
        'Modernización y evolución de legados.',
        'Integración de aplicaciones.',
        'Selección de software y proveedores.',
        'Urbanización de sistemas existentes.',
        'Definición de hojas de ruta tecnológicas.',
      ],
    },
    {
      title: 'Innovación, Productos y Canales',
      description:
        'Desarrollo de nuevas propuestas de valor, productos digitales, modelos de distribución, ecosistemas comerciales y oportunidades de crecimiento.',
      icon: <GARIcon name="innovation" size={34} />,
      topics: [
        'Diseño de productos y servicios.',
        'Nuevos canales de distribución.',
        'Modelos digitales y embebidos.',
        'Ecosistemas y alianzas.',
        'Validación de oportunidades de negocio.',
      ],
    },
    {
      title: 'Inteligencia Artificial y Automatización',
      description:
        'Identificación de casos de uso, evaluación de viabilidad, automatización inteligente y adopción de inteligencia artificial orientada a resultados.',
      icon: <GARIcon name="ai" size={34} />,
      topics: [
        'Identificación y priorización de casos de uso.',
        'Automatización asistida por IA.',
        'Optimización de tareas y procesos.',
        'Integración de capacidades inteligentes.',
        'Evaluación de beneficios y riesgos.',
      ],
    },
    {
      title: 'Especialización en Seguros y Finanzas',
      description:
        'Transformación aseguradora, evolución de sistemas core, distribución digital, nuevos productos, eficiencia operativa e integración de ecosistemas.',
      icon: <GARIcon name="consulting" size={34} />,
      topics: [
        'Transformación de aseguradoras y brokers.',
        'Sistemas core y modernización.',
        'Innovación en productos y coberturas.',
        'Canales digitales y affinity.',
        'Automatización de operaciones.',
        'Inspecciones, siniestros y peritajes.',
        'Integración de plataformas y ecosistemas.',
      ],
    },
  ]

  const focusAreas = [
    {
      title: 'Seguros y servicios financieros',
      badge: 'Especialización sectorial principal',
      isPrimarySector: true,
      icon: <GARIcon name="consulting" size={28} />,
      description:
        'Transformación de modelos operativos, modernización de plataformas, nuevos productos, distribución digital y eficiencia de procesos.',
    },
    {
      title: 'Empresas medianas y en crecimiento',
      badge: 'Capacidad transversal',
      isPrimarySector: false,
      icon: <GARIcon name="ventures" size={28} />,
      description:
        'Profesionalización de procesos, digitalización de operaciones, integración de herramientas y acompañamiento tecnológico para escalar el negocio.',
    },
    {
      title: 'Comercio, retail y servicios',
      badge: 'Capacidad transversal',
      isPrimarySector: false,
      icon: <GARIcon name="operations" size={28} />,
      description:
        'Optimización de operaciones, integración de sistemas, evolución de canales comerciales y nuevas experiencias digitales.',
    },
    {
      title: 'Organizaciones con sistemas legados',
      badge: 'Capacidad transversal',
      isPrimarySector: false,
      icon: <GARIcon name="transformation" size={28} />,
      description:
        'Modernización progresiva, integración y evolución tecnológica, preservando la continuidad operativa y las inversiones existentes.',
    },
    {
      title: 'Empresas que buscan innovar',
      badge: 'Capacidad transversal',
      isPrimarySector: false,
      icon: <GARIcon name="innovation" size={28} />,
      description:
        'Identificación de oportunidades, validación de iniciativas, nuevos productos, servicios y modelos de negocio.',
    },
  ]

  return (
    <>
      <SEOHead
        title="Capacidades y Áreas de Enfoque | Gastón Alejandro Ramos — Consultor Senior"
        description="Consultoría senior en estrategia y transformación de negocios, optimización de procesos, arquitectura tecnológica, innovación, inteligencia artificial y especialización en seguros y finanzas."
        path="/capabilities"
        jsonLd={buildCapabilitiesSchema()}
      />

      <div className={styles.intro}>
        <div className="container">
          <div className={styles.header}>
            <h1 className={styles.title}>Capacidades</h1>
            <p className={styles.subtitle}>
              Asesoramiento estratégico, evolución de procesos y criterio tecnológico para organizaciones que buscan eficiencia, competitividad y crecimiento sostenible.
            </p>
          </div>

          <div className={styles.featuredCapability}>
            <span className={styles.featuredLabel}>Principio Rector</span>
            <h2 className={styles.featuredTitle}>
              La tecnología como habilitador de la estrategia y del negocio
            </h2>
            <p className={styles.featuredDescription}>
              Acompaño a empresas en la definición y ejecución de iniciativas que conectan visión empresarial, procesos operativos y arquitectura tecnológica para generar resultados concretos, combinando capacidades transversales de gestión con una trayectoria diferencial consolidada en seguros y servicios financieros.
            </p>
          </div>

          <div className={styles.grid}>
            {coreCapabilities.map((service, index) => (
              <div key={service.title} className={styles.card}>
                <div className={styles.cardTop}>
                  <div className={styles.cardIcon}>{service.icon}</div>
                  <span className={styles.cardIndex}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
                <h3 className={styles.cardTitle}>{service.title}</h3>
                <p className={styles.cardDescription}>{service.description}</p>
                <div className={styles.topicsBlock}>
                  <span className={styles.topicsLabel}>Temas asociados</span>
                  <ul className={styles.topicsList}>
                    {service.topics.map((topic) => (
                      <li key={topic}>{topic}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className={styles.focusSection} aria-labelledby="focus-areas-heading">
        <div className="container">
          <div className={styles.focusHeader}>
            <span className={styles.featuredLabel}>Ámbitos de Aplicación</span>
            <h2 id="focus-areas-heading" className={styles.focusSectionTitle}>
              Áreas de Enfoque — Segmentos y desafíos empresariales
            </h2>
            <p className={styles.focusSectionSubtitle}>
              La industria aseguradora y los servicios financieros constituyen mi especialización sectorial histórica principal; a partir de esa experiencia, acompaño también a empresas medianas y organizaciones de distintos sectores en desafíos transversales de estrategia, eficiencia, modernización e innovación.
            </p>
          </div>

          <div className={styles.focusGrid}>
            {focusAreas.map((area) => (
              <div
                key={area.title}
                className={`${styles.focusCard} ${
                  area.isPrimarySector ? styles.focusCardPrimary : ''
                }`}
              >
                <div className={styles.focusCardTop}>
                  <div className={styles.cardIcon}>{area.icon}</div>
                  <span
                    className={`${styles.focusBadge} ${
                      area.isPrimarySector ? styles.focusBadgePrimary : ''
                    }`}
                  >
                    {area.badge}
                  </span>
                </div>
                <h3 className={styles.cardTitle}>{area.title}</h3>
                <p className={styles.cardDescription}>{area.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className="container">
          <div className={styles.ctaBox}>
            <h2 className={styles.ctaTitle}>¿Está listo para dar el siguiente paso?</h2>
            <p className={styles.ctaText}>
              Conversemos sobre cómo mi experiencia senior y visión estratégica pueden acompañar la evolución de los procesos, la tecnología y el negocio de su organización.
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
