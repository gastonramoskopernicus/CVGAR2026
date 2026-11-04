# Directiva Maestra — GAR SEO Competitivo & Growth V3 (SOP)

## 1. Objetivo General
Transformar `gastonramos.com.ar` en una plataforma de posicionamiento orgánico competitivo y generación de oportunidades comerciales calificadas (consultas ejecutivas de CEOs, directores, empresarios, CIOs, CTOs y líderes de transformación en Argentina y Latinoamérica), manteniendo intacta la identidad visual **Contemporary Tech Editorial — GAR Identity** y operando exclusivamente en la rama aislada de QA (`feature/gr-visual-evolution-v2`).

## 2. Entradas y Fuentes de Verdad
- **Identidad Principal:** Gastón Alejandro Ramos — Consultor Senior en Estrategia, Tecnología y Transformación Digital.
- **Capacidades Transversales:** Estrategia empresarial y tecnológica, Transformación digital y organizacional, Optimización de procesos y operaciones, Arquitectura y modernización tecnológica, Inteligencia artificial aplicada al negocio, Automatización y eficiencia operativa, Innovación y nuevos modelos de negocio, Selección de software y proveedores, Asesoramiento tecnológico para CEOs y CIOs, Evolución de plataformas empresariales.
- **Especialización Sectorial:** Seguros y servicios financieros (diferencial destacado con más de 30 años de trayectoria tecnológica), más capacidad transversal verificable.
- **Ecosistema Verificable:**
  - LinkedIn: `https://www.linkedin.com/in/ramosgaston/`
  - YouTube: `https://www.youtube.com/@kopernicustech`
  - Kopernicus Tech: `https://kopernicus.tech/`
  - KPS Tech: `https://www.kpstech.com.ar/`
  - Tech Insurance: `https://techinsurance.com.ar/`
  - InspeXiona: `https://inspexiona.com.ar/`

## 3. Secuencia de Operaciones y Entregables (Orden Estricto)

### Entrega 1 — Diagnóstico Competitivo, Matriz de Keywords, Oportunidades y Plan Priorizado
1. **Auditoría SEO Inicial (`scripts/seo_audit_v3.py`):**
   - Evaluar estado de indexación, arquitectura de URLs, `<Html lang>`, titles, meta descriptions, jerarquía `H1/H2/H3`, canonicalización, `sitemap.xml`, `robots.txt`, datos estructurados JSON-LD, enlaces internos/externos, textos alternativos (`alt`), separación público vs. privado (`/aplicaciones`, `/showcase`, `/api/*`), renderizado SSR/SSG y Core Web Vitals.
   - Documentar línea de base y dependencia de acceso a Google Search Console (GSC) y Google Analytics 4 (GA4) sin inventar métricas.
2. **Benchmark SEO Competitivo Real (Google Argentina / LATAM):**
   - Investigar SERPs reales en Argentina/LATAM para las 7 familias de keywords (Clusters A a G).
   - Distinguir competidores orgánicos (grandes consultoras globales, directorios, portales académicos) de competidores comerciales directos (consultores senior independientes, boutiques de transformación, especialistas insurtech/tecnológicos).
3. **Investigación de Keywords (Clusters A–G) y Mapa por URL:**
   - Construir matriz completa con los 7 clusters obligatorios, registrando: Keyword, Cluster, País, Volumen mensual estimado (`N/D` cuando requiera herramienta paga o acceso GSC/GKP no conectado, sin inventar cifras), Dificultad/Competencia observada en SERP, Intención de búsqueda, Relevancia comercial, Potencial de conversión, Página objetivo, Prioridad (`P0` a `P3`), Fuente y Fecha de consulta.
4. **Estrategia de Posicionamiento Temprano (Quick Wins P0–P3):**
   - Clasificar oportunidades en `P0` (correcciones críticas de indexación, idioma `es-AR`, canonicals, `robots.txt`, `sitemap.xml`, Schema.org), `P1` (Quick Wins en páginas actuales y búsquedas de consultoría senior/seguros/marca personal), `P2` (landings comerciales propuestas para aprobación) y `P3` (contenidos de autoridad a mediano plazo).

### Entrega 2 — Implementación Técnica SEO en QA (Sin alterar diseño GAR ni publicar textos no aprobados)
1. **Corrección de Idioma y Metadatos Base:**
   - Cambiar `<Html lang="en">` a `<Html lang="es-AR">` en `src/pages/_document.js`.
   - Crear componente centralizado `src/components/SEOHead.js` y configuración `src/lib/seoConfig.js` para inyectar server-side: `<title>`, `<meta name="description">`, `<link rel="canonical">`, Open Graph completo (`og:title`, `og:description`, `og:url`, `og:type`, `og:locale="es_AR"`, `og:image`), Twitter Cards (`summary_large_image`), metadata de autor (`Gastón Alejandro Ramos`) y directivas `robots`.
2. **Control de Indexación (`public/robots.txt` y `public/sitemap.xml`):**
   - Configurar `public/robots.txt` permitiendo el rastreo de páginas públicas y bloqueando explícitamente rutas privadas y técnicas (`Disallow: /aplicaciones`, `Disallow: /showcase`, `Disallow: /api/`).
   - Generar `public/sitemap.xml` limpio incluyendo únicamente las URLs públicas canónicas de `https://gastonramos.com.ar`.
3. **Schema.org JSON-LD Verificable (`src/lib/schemaOrg.js`):**
   - Implementar generadores JSON-LD libres de datos ficticios para:
     - `Person` + `WebSite` (Home `/`)
     - `ProfilePage` + `Person` (Perfil `/about`, incluyendo formación verificada en USAL y trayectoria real)
     - `Service` + `ProfessionalService` (Capacidades `/capabilities`)
     - `CollectionPage` + `Article` + `VideoObject` (Multimedia `/multimedia`)
     - `ContactPage` (Contacto `/contacto`)
     - `BreadcrumbList` en todas las páginas internas públicas.
4. **Optimización de Imágenes, Accesibilidad y Core Web Vitals:**
   - Asegurar atributos `alt` descriptivos, dimensiones explícitas (`width`/`height`) para prevenir CLS (`≤ 0,1`), prioridad de carga (`fetchPriority="high"` / `loading="eager"`) en el retrato del Hero para LCP (`≤ 2,5s`), `loading="lazy"` y `decoding="async"` en imágenes bajo el pliegue, y preservación íntegra de la animación circular del Hero.

### Entrega 3 — Propuestas de Arquitectura, Landings Comerciales, Matriz Editorial, Autoridad, Plan Editorial y GEO/AI Search (Para Aprobación)
- **Regla de Oro:** No publicar automáticamente las nuevas landings comerciales (`/consultoria-estrategica`, `/consultoria-tecnologica`, `/transformacion-digital`, `/inteligencia-artificial-empresas`, `/optimizacion-procesos`, `/consultoria-seguros`, `/asesoramiento-tecnologico`) ni reescribir el copy público sin aprobación expresa.
- Entregar las propuestas completas de las 7 landings comerciales, calendario editorial por ejes, estrategia de autoridad Off-Page (LinkedIn, YouTube, ecosistema Kopernicus/KPS Tech/Tech Insurance/InspeXiona), estrategia geográfica Argentina + LATAM y lineamientos AI Search / GEO listas para validación.

### Entrega 4 — Preparación de Analítica, Conversiones, SEM (Google Ads) y Roadmap 90 Días
1. **Infraestructura Técnica de Medición y Conversiones en QA (`src/lib/analytics.js`):**
   - Implementar capa de eventos desacoplada y segura para GA4 (`NEXT_PUBLIC_GA4_ID`), GTM (`NEXT_PUBLIC_GTM_ID`) y Google Ads Conversion Tracking (`NEXT_PUBLIC_GADS_ID`), **inactiva por defecto** hasta configurar credenciales (cero gasto, cero campañas activas).
   - Separar estrictamente:
     - **Conversiones Principales (Leads):** `generate_lead` / `contact_form_submit` (envío exitoso en `/contacto`), `schedule_meeting_request`.
     - **Microconversiones:** `click_email`, `click_linkedin`, `cta_explore_capabilities`, `multimedia_external_view`.
2. **Estructura de Campañas Google Ads, Keywords Negativas, Dashboard y Roadmap de 90 Días:**
   - Documentar las 5 campañas potenciales, listado depurado de keywords negativas, modelo de atribución/KPIs y plan de trabajo de 90 días (Días 1–15, 16–30, 31–60, 61–90).

## 4. Restricciones y Casos Borde
- **Prohibición de Producción:** Todo cambio técnico se realiza únicamente en `feature/gr-visual-evolution-v2`. Prohibido modificar `main`.
- **Prohibición de Datos Ficticios:** Nunca inventar volúmenes de búsqueda de herramientas pagas no conectadas (usar `N/D` y documentar la fuente real de SERP), ni inventar testimonios, clientes, premios o métricas de conversión.
- **Protección de Secciones Privadas:** `/aplicaciones` y `/showcase` deben mantener `<meta name="robots" content="noindex, nofollow" />`, estar excluidas de `sitemap.xml` y bloqueadas en `robots.txt`.

