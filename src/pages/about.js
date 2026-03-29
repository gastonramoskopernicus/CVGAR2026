import Head from 'next/head'
import Image from 'next/image'
import { motion } from 'framer-motion'
import styles from '@/styles/About.module.css'

export default function About() {
  const specialties = [
    "Estrategia Tecnológica en Seguros",
    "Transformación Digital",
    "Modernización de Core Systems",
    "Innovación de Productos de Seguros",
    "Automatización e IA",
    "Canales Digitales & B2B2C",
    "Eficiencia Operativa",
    "Arquitectura Empresarial",
    "Insurtech & Ecosistemas",
    "Estrategia de Datos",
    "C-Level & Board Advisor",
    "Liderazgo de Equipos Estratégicos"
  ]

  const timeline = [
    {
      role: "Socio Director en Kopernicus Tech LATAM - CEO Argentina",
      company: "Kopernicus Tech",
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
      <Head>
        <title>Sobre Mí | Gastón Alejandro Ramos</title>
      </Head>

      <div className={styles.intro}>
        <div className="container">
          <div className={styles.header}>
            <h1 className={styles.title} style={{ color: '#000000' }}>Sobre Mí</h1>
            <p className={styles.subtitle}>Trayectoria de liderazgo enfocada en la transformación del sector asegurador.</p>
          </div>

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
                Soy un apasionado por la tecnología, el liderazgo y la innovación aplicada. Con más de 30 años de trayectoria en la industria aseguradora, mi enfoque se centra en actuar como un puente crítico entre la visión del negocio y las capacidades tecnológicas.
              </p>
              <p>
                Como Socio Director de Kopernicus Tech, me especializo en asesorar a niveles C-Level y Juntas Directivas en procesos de Transformación Digital, Insurtech y modernización de infraestructuras críticas. Mi objetivo es convertir la complejidad tecnológica en una ventaja competitiva sostenible.
              </p>
              <p>
                Mi formación incluye una Licenciatura en Sistemas de Información, una Licenciatura en Administración de Empresas en la Universidad del Salvador, un posgrado en Derecho y Seguros de la UBA y una certificación de la IAOP (International Association of Outsourcing Professionals), entre otras calificaciones y certificaciones.
              </p>
            </div>
          </div>
        </div>
      </div>

      <section className={styles.specialties}>
        <div className="container">
          <h2 className={styles.sectionTitle} style={{ color: '#000000' }}>Experticia y Áreas de Enfoque</h2>
          <div className={styles.specialtiesGrid}>
            {specialties.map((item, index) => (
              <motion.div 
                key={index}
                whileHover={{ scale: 1.05 }}
                className={styles.specialtyCard}
              >
                {item}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.experience}>
        <div className="container">
          <h2 className={styles.sectionTitle} style={{ color: '#000000' }}>Trayectoria Profesional</h2>
          <div className={styles.timeline}>
            {timeline.map((item, index) => (
              <div key={index} className={styles.timelineItem}>
                <div className={styles.expHeader}>
                  <div>
                    <h3 className={styles.role} style={{ color: '#000000' }}>{item.role}</h3>
                    <span className={styles.company}>{item.company}</span>
                  </div>
                  <span className={styles.period}>{item.period}</span>
                </div>
                <p className={styles.expDescription} style={{ color: '#444444' }}>{item.description}</p>
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

      <section className={styles.education}>
        <div className="container">
          <h2 className={styles.sectionTitle} style={{ color: '#000000' }}>Formación Académica</h2>
          <div className={styles.eduGrid}>
            <div className={styles.eduItem}>
              <h3 style={{ color: '#000000' }}>Licenciatura en Sistemas de Información</h3>
              <p>Universidad del Salvador</p>
            </div>
            <div className={styles.eduItem}>
              <h3 style={{ color: '#000000' }}>Licenciatura en Administración de Empresas</h3>
              <p>Universidad del Salvador</p>
            </div>
            <div className={styles.eduItem}>
              <h3 style={{ color: '#000000' }}>Posgrado en Derecho y Seguros</h3>
              <p>Universidad de Buenos Aires (UBA)</p>
            </div>
            <div className={styles.eduItem}>
              <h3 style={{ color: '#000000' }}>Certificación IAOP</h3>
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
              Mi enfoque se basa en la Integridad, la Visión Estratégica y la Ejecución Impecable. No solo diseño planes; me comprometo con la viabilidad tecnológica y el éxito a largo plazo de cada iniciativa de transformación en el sector asegurador.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
