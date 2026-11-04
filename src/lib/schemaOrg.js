/**
 * Generador centralizado de Schema.org JSON-LD verificable para Gastón Alejandro Ramos (GAR).
 * Cumple estrictamente la Directiva Maestra SEO V3:
 * - Solo datos profesionales verificables.
 * - Sin reseñas ficticias ni relaciones societarias inventadas.
 */

export const SITE_URL = 'https://gastonramos.com.ar'

export const PERSON_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': `${SITE_URL}/#person`,
  name: 'Gastón Alejandro Ramos',
  alternateName: 'Gastón Ramos',
  jobTitle: 'Consultor Senior en Estrategia, Tecnología y Transformación de Negocios',
  description:
    'Consultor Senior en Estrategia, Tecnología y Transformación de Negocios con más de 30 años de trayectoria acompañando a empresas medianas, grandes organizaciones y compañías de seguros y servicios financieros en Argentina y Latinoamérica.',
  url: SITE_URL,
  image: `${SITE_URL}/FotoGAR.jpeg`,
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Buenos Aires',
    addressCountry: 'AR',
  },
  sameAs: [
    'https://www.linkedin.com/in/ramosgaston/',
    'https://www.youtube.com/@kopernicustech',
    'https://kopernicus.tech/',
    'https://www.kpstech.com.ar/',
    'https://techinsurance.com.ar/',
    'https://inspexiona.com.ar/',
  ],
  worksFor: [
    {
      '@type': 'Organization',
      name: 'Kopernicus Tech',
      url: 'https://kopernicus.tech/',
    },
    {
      '@type': 'Organization',
      name: 'KPS Tech Argentina',
      url: 'https://www.kpstech.com.ar/',
    },
  ],
  alumniOf: [
    {
      '@type': 'CollegeOrUniversity',
      name: 'Universidad del Salvador',
      sameAs: 'https://www.usal.edu.ar/',
    },
    {
      '@type': 'CollegeOrUniversity',
      name: 'Facultad de Derecho - Universidad de Buenos Aires (UBA)',
      sameAs: 'http://www.derecho.uba.ar/',
    },
  ],
  knowsAbout: [
    'Estrategia empresarial y tecnológica',
    'Transformación digital y organizacional',
    'Optimización de procesos y operaciones',
    'Arquitectura y modernización tecnológica',
    'Inteligencia artificial aplicada al negocio',
    'Automatización y eficiencia operativa',
    'Innovación y nuevos modelos de negocio',
    'Selección de software y proveedores',
    'Asesoramiento tecnológico para CEOs y CIOs',
    'Consultoría estratégica y tecnológica en seguros e InsurTech',
  ],
}

export const WEBSITE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  url: SITE_URL,
  name: 'Gastón Alejandro Ramos | Consultor en Estrategia y Tecnología',
  inLanguage: 'es-AR',
  publisher: {
    '@id': `${SITE_URL}/#person`,
  },
}

export function buildBreadcrumbSchema(items = []) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: item.path.startsWith('http') ? item.path : `${SITE_URL}${item.path}`,
    })),
  }
}

export function buildProfilePageSchema() {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'ProfilePage',
      '@id': `${SITE_URL}/about#profilepage`,
      url: `${SITE_URL}/about`,
      name: 'Perfil y Trayectoria Profesional | Gastón Alejandro Ramos',
      inLanguage: 'es-AR',
      mainEntity: PERSON_SCHEMA,
    },
    buildBreadcrumbSchema([
      { name: 'Inicio', path: '/' },
      { name: 'Perfil', path: '/about' },
    ]),
  ]
}

export function buildCapabilitiesSchema() {
  const services = [
    {
      name: 'Estrategia y Transformación del Negocio',
      description:
        'Definición de hojas de ruta, evolución de modelos operativos, priorización de inversiones y alineación entre objetivos empresariales y tecnología.',
    },
    {
      name: 'Optimización y Digitalización de Procesos',
      description:
        'Diagnóstico de operaciones, simplificación de circuitos, automatización, reducción de tareas manuales y mejora de productividad.',
    },
    {
      name: 'Estrategia y Arquitectura Tecnológica',
      description:
        'Modernización de plataformas, integración de sistemas, evaluación y selección de software, proveedores y soluciones empresariales.',
    },
    {
      name: 'Innovación, Productos y Canales',
      description:
        'Desarrollo de nuevas propuestas de valor, productos digitales, modelos de distribución, ecosistemas comerciales y oportunidades de crecimiento.',
    },
    {
      name: 'Inteligencia Artificial y Automatización',
      description:
        'Identificación de casos de uso, evaluación de viabilidad, automatización inteligente y adopción de inteligencia artificial orientada a resultados.',
    },
    {
      name: 'Especialización en Seguros y Finanzas',
      description:
        'Transformación aseguradora, evolución de sistemas core, distribución digital, nuevos productos, eficiencia operativa e integración de ecosistemas.',
    },
  ]

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      '@id': `${SITE_URL}/capabilities#service`,
      name: 'Consultoría Senior en Estrategia, Tecnología, Transformación de Negocios y Seguros',
      provider: {
        '@id': `${SITE_URL}/#person`,
      },
      areaServed: [
        { '@type': 'Country', name: 'Argentina' },
        { '@type': 'Country', name: 'Uruguay' },
        { '@type': 'Country', name: 'Chile' },
        { '@type': 'Country', name: 'Paraguay' },
        { '@type': 'Country', name: 'Colombia' },
        { '@type': 'Country', name: 'México' },
        { '@type': 'Country', name: 'Ecuador' },
      ],
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Capacidades de Consultoría y Advisory',
        itemListElement: services.map((s) => ({
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: s.name,
            description: s.description,
          },
        })),
      },
    },
    buildBreadcrumbSchema([
      { name: 'Inicio', path: '/' },
      { name: 'Capacidades', path: '/capabilities' },
    ]),
  ]
}

export function buildMultimediaSchema(items = []) {
  const structuredItems = items.slice(0, 10).map((item) => {
    if (item.isVideo && item.youtubeId) {
      return {
        '@context': 'https://schema.org',
        '@type': 'VideoObject',
        name: item.title,
        description: item.description,
        thumbnailUrl: [
          item.thumbnail || `https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg`,
        ],
        uploadDate: '2025-01-01T00:00:00Z',
        embedUrl: `https://www.youtube.com/embed/${item.youtubeId}`,
        contentUrl: `https://www.youtube.com/watch?v=${item.youtubeId}`,
        author: {
          '@id': `${SITE_URL}/#person`,
        },
      }
    }
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: item.title,
      description: item.description,
      image: item.image ? `${SITE_URL}${item.image}` : `${SITE_URL}/FotoGAR.jpeg`,
      author: {
        '@id': `${SITE_URL}/#person`,
      },
      publisher: {
        '@id': `${SITE_URL}/#person`,
      },
      mainEntityOfPage: item.link || `${SITE_URL}/multimedia`,
    }
  })

  return [
    buildBreadcrumbSchema([
      { name: 'Inicio', path: '/' },
      { name: 'Multimedia', path: '/multimedia' },
    ]),
    ...structuredItems,
  ]
}

export function buildContactPageSchema() {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      '@id': `${SITE_URL}/contacto#contactpage`,
      url: `${SITE_URL}/contacto`,
      name: 'Contacto | Gastón Alejandro Ramos — Consultor en Estrategia y Tecnología',
      inLanguage: 'es-AR',
      mainEntity: {
        '@id': `${SITE_URL}/#person`,
      },
    },
    buildBreadcrumbSchema([
      { name: 'Inicio', path: '/' },
      { name: 'Contacto', path: '/contacto' },
    ]),
  ]
}

