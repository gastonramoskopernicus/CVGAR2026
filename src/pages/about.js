import Image from 'next/image'
import { motion } from 'framer-motion'
import SEOHead from '@/components/SEOHead'
import { buildProfilePageSchema } from '@/lib/schemaOrg'
import GARIcon from '@/components/GARIcon'
import styles from '@/styles/About.module.css'
import ExperienceMap from '../components/ExperienceMap'
import EcosystemSection from '../components/EcosystemSection'

export default function About() {
  const credentials = [
    'Licenciado en Sistemas de Información',
    'Licenciado en Administración',
    'Posgrado en Derecho de Seguros',
    'Docente universitario, speaker y disertante',
  ]

  const dimensions = [
    {
      icon: 'strategy',
      title: 'Visión estratégica',
      description:
        'Capacidad de comprender desafíos empresariales y definir caminos de transformación.',
    },
    {
      icon: 'architecture',
      title: 'Experiencia tecnológica',
      description:
        'Conocimiento de arquitecturas, plataformas, sistemas e integración.',
    },
    {
      icon: 'operations',
      title: 'Orientación al negocio',
      description:
        'Mejora de procesos, eficiencia, innovación y crecimiento.',
    },
  ]

  const specialties = [
    "Estrategia y Transformación de Negocios",
    "Optimización y Digitalización de Procesos",
    "Estrategia y Arquitectura Tecnológica",
    "Modernización de Plataformas y Sistemas Core",
    "Innovación, Productos y Canales Comerciales",
    "Inteligencia Artificial y Automatización",
    "Especialización en Seguros y Finanzas",
    "Evaluación y Selección de Software",
    "Integración de Sistemas y Ecosistemas",
    "Eficiencia Operativa y Modelos de Negocio",
    "Advisory para Directorios, CEOs y CIOs",
    "Liderazgo de Programas de Transformación"
  ]

  const timeline = [
    {
      role: "Socio Director en Kopernicus Tech LATAM - CEO Argentina",
      company: "Kopernicus Tech",
      logo: "/images/brands/kopernicus-dark.png",
      period: "sept. 2020 - actualidad",
      description: "Socio Director en Kopernicus Tech Latam, donde asesoramos y acompañamos a las principales compañías de seguros y entidades financieras de la región en la transformación y optimización de sus procesos de negocio. Participamos activamente en el diseño y desarrollo de nuevos productos, la modernización y migración de plataformas legacy, la implementación de soluciones core y la definición de estrategias tecnológicas orientadas a generar eficiencia operativa y ventajas competitivas sostenibles.",
      highlights: [
        "Abordamos la necesidad desde la estrategia de TI, hasta la implementación de la misma.",
        "Alineación de objetivos corporativos con el potencial de las tecnologías de información.",
        "Relaciones estratégicas de largo plazo basadas en innovación y disrupción digital."
      ]
    },
    {
      role: "Founder KPS Tech Argentina",
      company: "KPS Tech Argentina",
      logo: "/images/brands/kpstech-blanco.png",
      period: "dic. 2025 - actualidad",
      description: "Founder de KPS Tech Argentina, una firma de consultoría que nace como un spin-off de Kopernicus Tech, orientada a brindar servicios a empresas con foco en Argentina y la región. Acompañamos organizaciones de múltiples industrias —como manufactura, retail, legales, entre otras— en la optimización de sus procesos, la evolución de sus modelos de negocio y la adopción de tecnología como habilitador estratégico.",
      highlights: [
        "Diseño, construcción y evolución de plataformas tecnológicas.",
        "Combinación de estrategia, arquitectura y delivery con equipos especializados.",
        "Metodologías y estándares del sector asegurador aplicados a nuevas industrias."
      ]
    },
    {
      role: "Digital Leader / Infinity Ambassador",
      company: "InfinityLifeTech",
      logo: null,
      period: "jul. 2020 - actualidad",
      description: "Colaboración estratégica para posicionar a InfinityLife Tech como una de las mejores plataformas de bienestar y estilo de vida.",
      highlights: [
        "Innovación y desarrollo de nuevas herramientas para la plataforma.",
        "Know-how en Estrategia, TI y el ámbito deportivo como bienestar.",
        "Participación en concursos internacionales y actividades de bienestar en LATAM."
      ]
    },
    {
      role: "Socio Gerente",
      company: "Next Step Argentina",
      logo: "/images/companies/nextstep.svg",
      period: "dic. 2012 - jul. 2020",
      description: "Me desarrollé como gerente en una de las principales consultoras de nicho de seguros en Argentina, colaborando en proyectos de gran relevancia tanto a nivel local como regional.",
      highlights: [
        "Implementación de nuevas tendencias del mercado y mejores prácticas.",
        "Desarrollo de actividades en Argentina, Uruguay y España.",
        "Think big. Think digital."
      ]
    },
    {
      role: "Director de Operaciones",
      company: "Grupo GAMAN",
      logo: "/images/companies/grupogaman.png",
      period: "dic. 2010 - jul. 2020",
      description: "Colaboré en la creación y evolución de uno de los brokers más importantes de Argentina, participando en el diseño de imagen, la estructuración de operaciones, el desarrollo comercial con terceros y la implementación de herramientas y soluciones de backend.",
      highlights: [
        "Gestión operativa integral en un entorno multi-empresa.",
        "Posicionamiento estratégico dentro de la industria aseguradora.",
        "Sinergia entre la administración de NextStep y las operaciones del Grupo."
      ]
    },
    {
      role: "Gerente General",
      company: "Broker Digital de Productores de Seguros S.A",
      logo: null,
      period: "dic. 2010 - dic. 2014",
      description: "Fui co-founder del primer agregador digital de seguros de Argentina en el año 2010.",
      highlights: [
        "Liderazgo en la creación de plataformas digitales para productores.",
        "Gestión ejecutiva y visión de negocio Insurtech temprana."
      ]
    },
    {
      role: "Profesor Titular",
      company: "Universidad del Salvador",
      logo: "/images/companies/usal.png",
      period: "mar. 2005 - dic. 2014",
      description: "Profesor titular de la Cátedra Sistemas de Información para las carreras de Administración y Recursos Humanos.",
      highlights: [
        "Formación de futuros profesionales en la intersección de tecnología y administración.",
        "Desarrollo de contenidos académicos basados en experiencia real de mercado."
      ]
    },
    {
      role: "Manager IT Practice",
      company: "PriceWaterhouseCoopers - Argentina",
      logo: "/images/companies/pwc.svg",
      period: "nov. 2006 - dic. 2010",
      description: "Gerente de Consultoría IT, asesorando a altas gerencias y CEOs en la optimización tecnológica para generar ventajas competitivas sostenibles. He trabajado con empresas multinacionales tanto en Argentina como en otros mercados, incluyendo Estados Unidos, México, Paraguay, Uruguay y Brasil, acompañando a las organizaciones en la adopción y aprovechamiento estratégico de IT para potenciar sus operaciones y definir su estrategia corporativa.",
      highlights: [
        "Alineación estratégica, optimización de costos y Sourcing de IT (Outsourcing, Offshoring).",
        "Experiencia internacional: Brasil, México, USA y Paraguay.",
        "Alliance Manager para relaciones con SAP, Oracle, Microsoft, entre otros."
      ]
    },
    {
      role: "Software Developer / Project Leader",
      company: "Axoft Argentina",
      logo: "/images/companies/axoft.png",
      period: "oct. 1998 - nov. 2006",
      description: "Desarrollo en una de las compañías de software más importantes de Argentina, obteniendo know-how profundo en proyectos de gran escala.",
      highlights: [
        "Arquitecturas Multi-tier, Análisis basado en Objetos y Componentes.",
        "Liderazgo de proyectos Core para el crecimiento de productos competitivos.",
        "Migración de datos y tecnologías complejas."
      ]
    }
  ]

  const hobbies = [
    { title: "Tecnología e Innovación" },
    { title: "Deporte" },
    { title: "Liderazgo y Mentoría" },
  ]

  return (
    <>
      <SEOHead
        title="Perfil y Trayectoria | Gastón Alejandro Ramos — Consultor Senior en Estrategia y Tecnología"
        description="Conocé la trayectoria profesional, formación académica y experiencia internacional de Gastón Alejandro Ramos, Consultor Senior en Estrategia, Tecnología y Transformación de Negocios con especialización en seguros y finanzas."
        path="/about"
        ogType="profile"
        jsonLd={buildProfilePageSchema()}
      />

      <div className={styles.intro}>
        <div className="container">
          <div className={styles.header}>
            <h1 className={styles.title}>Sobre Mí</h1>
            <p className={styles.subtitle}>
              Consultor Senior en Estrategia, Tecnología y Transformación de Negocios, con más de 30 años de trayectoria acompañando la evolución de organizaciones y sistemas.
            </p>
          </div>

          <ul className={styles.credentialsStrip} aria-label="Credenciales profesionales">
            {credentials.map((cred) => (
              <li key={cred} className={styles.credentialItem}>
                <span className={styles.credentialMarker} aria-hidden="true" />
                <span className={styles.credentialText}>{cred}</span>
              </li>
            ))}
          </ul>

          <div className={styles.bioGrid}>
            <div className={styles.bioImageWrapper}>
              <Image 
                src="/FotoGAR.jpeg" 
                alt="Gastón Alejandro Ramos" 
                width={450} 
                height={600} 
                className={styles.bioImage}
                priority
              />
            </div>
            <div className={styles.bioText}>
              <p>
                Soy consultor senior en Estrategia, Tecnología y Transformación Digital, con una trayectoria de más de 30 años acompañando a organizaciones en la evolución de sus negocios y sistemas.
              </p>
              <p>
                Mi trabajo combina una visión estratégica del negocio con un profundo conocimiento de los procesos operativos y las soluciones tecnológicas. Acompaño a empresas que buscan mejorar su eficiencia, modernizar sus plataformas, desarrollar nuevos productos o canales comerciales y aprovechar las oportunidades que ofrece la innovación.
              </p>
              <p>
                Cuento con una especialización consolidada en la industria aseguradora y los servicios financieros, trabajando en iniciativas de transformación, evolución de sistemas core, integración tecnológica y nuevos modelos de negocio en Argentina y Latinoamérica.
              </p>
              <p>
                Esta experiencia también me permite aportar valor a empresas medianas y organizaciones de otros sectores que necesitan incorporar tecnología con criterio de negocio, priorizar inversiones y convertir iniciativas de transformación en resultados concretos.
              </p>
            </div>
          </div>

          <div className={styles.dimensionsGrid}>
            {dimensions.map((dim) => (
              <div key={dim.title} className={styles.dimensionCard}>
                <div className={styles.dimensionIcon} aria-hidden="true">
                  <GARIcon name={dim.icon} size={28} />
                </div>
                <h2 className={styles.dimensionTitle}>{dim.title}</h2>
                <p className={styles.dimensionDescription}>{dim.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className={styles.specialties}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Expertise y Áreas de Enfoque</h2>
          <div className={styles.specialtiesGrid}>
            {specialties.map((item, index) => (
              <motion.div 
                key={index}
                whileHover={{ y: -2 }}
                className={styles.specialtyCard}
              >
                {item}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <div className="container">
        <ExperienceMap />
      </div>

      <section className={styles.experience}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Trayectoria Profesional</h2>
          <div className={styles.timeline}>
            {timeline.map((item, index) => (
              <div key={index} className={styles.timelineItem}>
                <div className={styles.expHeader}>
                  <div className={styles.expIdentity}>
                    <h3 className={styles.role}>{item.role}</h3>
                    <div className={styles.companyRow}>
                      {item.logo && (
                        <img
                          src={item.logo}
                          alt={item.company}
                          className={styles.companyLogo}
                          loading="lazy"
                        />
                      )}
                      <span className={styles.company}>{item.company}</span>
                    </div>
                  </div>
                  <span className={styles.period}>{item.period}</span>
                </div>
                <p className={styles.expDescription}>{item.description}</p>
                <ul className={styles.expList}>
                  {item.highlights.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <EcosystemSection />

      <section className={styles.education}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Formación Académica</h2>
          <div className={styles.eduGrid}>
            <div className={styles.eduItem}>
              <h3>Licenciatura en Sistemas de Información</h3>
              <p>Universidad del Salvador</p>
            </div>
            <div className={styles.eduItem}>
              <h3>Licenciatura en Administración de Empresas</h3>
              <p>Universidad del Salvador</p>
            </div>
            <div className={styles.eduItem}>
              <h3>Posgrado en Derecho y Seguros</h3>
              <p>Universidad de Buenos Aires (UBA)</p>
            </div>
            <div className={styles.eduItem}>
              <h3>Certificación IAOP</h3>
              <p>International Association of Outsourcing Professionals</p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.howIWork}>
        <div className="container">
          <div className={styles.workBox}>
            <h2 className={styles.workTitle}>Visión y Compromiso</h2>
            <p className={styles.workText}>
              Mi enfoque se basa en la integridad, la visión estratégica y la capacidad de ejecución. Entiendo a la tecnología como un habilitador de la estrategia y del negocio: no solo diseño hojas de ruta, sino que me comprometo con la viabilidad tecnológica, la mejora operativa y el éxito sostenible de cada iniciativa de transformación.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
