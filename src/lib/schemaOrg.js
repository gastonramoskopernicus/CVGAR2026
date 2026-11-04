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
  jobTitle: 'Consultor Senior en Estrategia, Tecnología y Transformación Digital',
  description:
    'Consultor independiente en estrategia empresarial, tecnología, transformación digital e innovación con más de 30 años de trayectoria en Argentina y Latinoamérica, y especialización destacada en seguros y servicios financieros.',
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
      name: 'Estrategia Empresarial y Tecnológica',
      description:
        'Definición de hojas de ruta tecnológicas conectadas con los objetivos estratégicos del negocio, priorización de inversiones y arquitectura moderna.',
    },
    {
      name: 'Transformación Digital y Organizacional',
      description:
        'Evolución integral de modelos operativos, rediseño de procesos punta a punta y adopción sostenible de tecnología en empresas de Argentina y Latinoamérica.',
    },
    {
      name: 'Arquitectura y Modernización de Core Systems',
      description:
        'Consultoría senior en evaluación, selección (RFI/RFP), migración e integración de plataformas críticas y sistemas core aseguradores y empresariales.',
    },
    {
      name: 'Inteligencia Artificial y Automatización Aplicada',
      description:
        'Implementación de inteligencia artificial, automatización inteligente de procesos y eficiencia operativa orientada a resultados medibles.',
    },
    {
      name: 'Innovación, Canales Digitales y Ecosistemas B2B2C',
      description:
        'Diseño de nuevos modelos de negocio, productos digitales y canales de distribución integrados mediante arquitecturas API-First.',
    },
    {
      name: 'Advisory Tecnológico para CEOs, Directores y CIOs',
      description:
        'Acompañamiento ejecutivo independiente para directorios y alta gerencia en decisiones tecnológicas críticas, gobierno IT y selección de proveedores.',
    },
  ]

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      '@id': `${SITE_URL}/capabilities#service`,
      name: 'Consultoría Senior en Estrategia, Tecnología, Transformación Digital y Seguros',
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

