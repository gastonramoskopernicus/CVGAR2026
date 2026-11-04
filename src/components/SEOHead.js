import Head from 'next/head'
import { SITE_URL } from '@/lib/schemaOrg'

/**
 * Componente SEO On-Page y Datos Estructurados centralizado (V3).
 * Inyecta de forma server-side:
 * - Title único
 * - Meta description específica en español
 * - Canonical URL
 * - Open Graph completo (es_AR)
 * - Twitter Card
 * - Meta robots y autoría explícita
 * - Bloques JSON-LD de Schema.org
 */
export default function SEOHead({
  title = 'Gastón Ramos | Consultor en Estrategia y Tecnología',
  description = 'Consultoría senior en estrategia, tecnología y transformación digital para empresas de Argentina y Latinoamérica. Conocé la trayectoria de Gastón Ramos.',
  path = '/',
  ogType = 'website',
  ogImage = '/FotoGAR.jpeg',
  noindex = false,
  jsonLd = [],
}) {
  const cleanPath = path === '/' ? '' : path.replace(/\/$/, '')
  const canonicalUrl = `${SITE_URL}${cleanPath || '/'}`
  const fullImageUrl = ogImage.startsWith('http') ? ogImage : `${SITE_URL}${ogImage}`
  const robotsContent = noindex
    ? 'noindex, nofollow'
    : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'

  const schemas = Array.isArray(jsonLd) ? jsonLd : [jsonLd]

  return (
    <Head>
      <title key="title">{title}</title>
      <meta key="description" name="description" content={description} />
      <meta key="robots" name="robots" content={robotsContent} />
      <meta key="author" name="author" content="Gastón Alejandro Ramos" />
      <link key="canonical" rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta key="og:title" property="og:title" content={title} />
      <meta key="og:description" property="og:description" content={description} />
      <meta key="og:url" property="og:url" content={canonicalUrl} />
      <meta key="og:type" property="og:type" content={ogType} />
      <meta key="og:locale" property="og:locale" content="es_AR" />
      <meta
        key="og:site_name"
        property="og:site_name"
        content="Gastón Alejandro Ramos — Consultor en Estrategia y Tecnología"
      />
      <meta key="og:image" property="og:image" content={fullImageUrl} />

      {/* Twitter Card */}
      <meta key="twitter:card" name="twitter:card" content="summary_large_image" />
      <meta key="twitter:title" name="twitter:title" content={title} />
      <meta key="twitter:description" name="twitter:description" content={description} />
      <meta key="twitter:image" name="twitter:image" content={fullImageUrl} />

      {/* Schema.org JSON-LD */}
      {!noindex &&
        schemas.filter(Boolean).map((schemaObj, idx) => (
          <script
            key={`jsonld-${idx}`}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaObj) }}
          />
        ))}
    </Head>
  )
}

