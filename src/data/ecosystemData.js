/**
 * Arquitectura de datos extensible para Ecosistema (Empresas, Productos e Iniciativas).
 *
 * NOTA EDITORIAL (Fase V2 Visual):
 * - No se publican textos comerciales nuevos, atribuciones societarias ni relaciones no verificadas.
 * - Las entidades previstas sin contenido verificado en el sitio actual permanecen con `published: false`
 *   listas para activarse en la Fase 2 (evolución editorial y comercial).
 */

export const ecosystemEntities = [
  {
    id: 'kopernicus-tech',
    name: 'Kopernicus Tech',
    category: 'Consultoría & Transformación',
    // Texto existente y verificado en el sitio actual (Footer / About)
    description:
      'Asesoramiento y acompañamiento a compañías de seguros y entidades financieras de la región en la transformación y optimización de sus procesos de negocio.',
    url: 'https://kopernicus.com.ar',
    published: true,
  },
  {
    id: 'kps-tech',
    name: 'KPS Tech',
    category: 'Consultoría & Tecnología',
    // Texto existente y verificado en el sitio actual (About)
    description:
      'Firma de consultoría orientada a brindar servicios a empresas en la optimización de sus procesos, evolución de modelos de negocio y adopción de tecnología.',
    url: null,
    published: true,
  },
  {
    id: 'tech-insurance',
    name: 'Tech Insurance',
    category: 'Iniciativa / Ecosistema',
    description: null,
    url: null,
    published: false, // Pendiente de contenido verificado en Fase 2
  },
  {
    id: 'inspexiona',
    name: 'InspeXiona',
    category: 'Producto / Plataforma',
    description: null,
    url: null,
    published: false, // Pendiente de contenido verificado en Fase 2
  },
]

