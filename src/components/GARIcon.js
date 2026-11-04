import React from 'react'

/**
 * GAR Icon System — Sistema de iconografía vectorial exclusivo V2.1
 *
 * Principios de diseño:
 * - Geometría inspirada sutilmente en los trazos estructurales de G (arco abierto con barra interna),
 *   A (vértice angular / puente transversal) y R (columna + bucle + proyección diagonal).
 * - Trazos técnicos y modulares con terminaciones consistentes (strokeWidth 1.75 / 1.5, round caps).
 * - Bicolor ejecutivo: Amarillo GAR (#f5b727) como trazo principal + Ocre GAR (#c88a28) como estructura secundaria
 *   + punto focal amarillo (#f5b727) que dialoga con el monograma GAR.
 * - Sin cohetes, bombillas, engranajes ni clichés de stock.
 */
export default function GARIcon({
  name = 'strategy',
  size = 28,
  className = '',
}) {
  const primary = '#f5b727'
  const secondary = '#c88a28'

  const renderGlyph = () => {
    switch (name) {
      /* 1. Estrategia tecnológica — Arco G de precisión + vector direccional A + coordenada focal */
      case 'strategy':
        return (
          <>
            {/* Estructura secundaria ocre: retícula de horizonte y cuadrante */}
            <path
              d="M6 16H13M16 6V11M16 26V23"
              stroke={secondary}
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.75"
            />
            {/* Arco G exterior técnico */}
            <path
              d="M23.5 9.5A10.5 10.5 0 1 0 26.5 16H18.5"
              stroke={primary}
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Vértice A direccional ascendente */}
            <path
              d="M12.5 20.5L16 12L19.5 20.5M13.8 18H18.2"
              stroke={primary}
              strokeWidth="1.65"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Punto distintivo GAR. */}
            <circle cx="25.5" cy="9.5" r="1.8" fill={primary} />
          </>
        )

      /* 2. Transformación digital — Plano legado ocre mutando hacia estructura G/R abierta */
      case 'transformation':
        return (
          <>
            {/* Marco base en ocre (estado inicial) */}
            <path
              d="M6 10.5V23.5C6 24.88 7.12 26 8.5 26H17.5"
              stroke={secondary}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray="2.5 2.5"
              opacity="0.85"
            />
            {/* Estructura G/R evolucionada en amarillo */}
            <path
              d="M24 9H14.5C12.01 9 10 11.01 10 13.5V18.5C10 20.99 12.01 23 14.5 23H22V16.5H16.5"
              stroke={primary}
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Proyección diagonal R de transición */}
            <path
              d="M19 13L25.5 6.5M25.5 6.5H20.5M25.5 6.5V11.5"
              stroke={primary}
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="25.5" cy="23" r="1.8" fill={primary} />
          </>
        )

      /* 3. Innovación — Prisma de horizonte emergente (sin cohetes ni bombillas) */
      case 'innovation':
        return (
          <>
            {/* Ondas / arcos modulares de expansión en ocre */}
            <path
              d="M7.5 22.5A12 12 0 0 1 24.5 22.5"
              stroke={secondary}
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.8"
            />
            <path
              d="M4.5 18H9M23 18H27.5"
              stroke={secondary}
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.7"
            />
            {/* Geometría central: Vértice A refractado con apertura G */}
            <path
              d="M10 25L16 7.5L22 25"
              stroke={primary}
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12.5 19.5H19.5L23.5 23.5"
              stroke={primary}
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Punto cenital GAR. */}
            <circle cx="16" cy="4.5" r="1.8" fill={primary} />
          </>
        )

      /* 4. Arquitectura empresarial — Plano modular de 3 capas desacopladas (Base G, Puente A, Voladizo R) */
      case 'architecture':
        return (
          <>
            {/* Columnas estructurales verticales en ocre */}
            <path
              d="M9 11V21M23 11V21M16 14V25"
              stroke={secondary}
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.8"
            />
            {/* Capa superior (Estrategia / API) */}
            <path
              d="M6 9.5L16 5.5L26 9.5L16 13.5L6 9.5Z"
              stroke={primary}
              strokeWidth="1.75"
              strokeLinejoin="round"
            />
            {/* Capa intermedia modular con puente A */}
            <path
              d="M6 16.5L16 20.5L26 16.5"
              stroke={primary}
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Capa fundacional G con barra de retorno */}
            <path
              d="M6 22.5L16 26.5L23.5 23.5"
              stroke={secondary}
              strokeWidth="1.65"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="26" cy="22.5" r="1.8" fill={primary} />
          </>
        )

      /* 5. Inteligencia artificial — Matriz tensorial G/A/R (sin robots ni clichés) */
      case 'ai':
        return (
          <>
            {/* Conexiones sinápticas ortogonales en ocre */}
            <path
              d="M16 5V9.5M16 22.5V27M5 16H9.5M22.5 16H27M8.2 8.2L11.4 11.4M20.6 20.6L23.8 23.8"
              stroke={secondary}
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.8"
            />
            {/* Núcleo G octogonal/circular abierto */}
            <path
              d="M21.5 12A6.5 6.5 0 1 0 22.5 16H17.5"
              stroke={primary}
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Triada interna A + diagonal R */}
            <path
              d="M13.5 18.5L16 13L18.5 18.5L23.5 23.5"
              stroke={primary}
              strokeWidth="1.65"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="23.5" cy="8.5" r="1.8" fill={primary} />
          </>
        )

      /* 6. Automatización — Circuito determinista de flujo continuo (sin engranajes) */
      case 'automation':
        return (
          <>
            {/* Riel secundario de retorno en ocre */}
            <path
              d="M24 19.5V21A4 4 0 0 1 20 25H9A4 4 0 0 1 5 21V16.5"
              stroke={secondary}
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.85"
            />
            {/* Canal principal G de ejecución */}
            <path
              d="M8 12.5V11A4 4 0 0 1 12 7H23A4 4 0 0 1 27 11V15.5H19"
              stroke={primary}
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Compuerta lógica A/R en el centro */}
            <path
              d="M12.5 19L16 13L19.5 19M14 17H18"
              stroke={primary}
              strokeWidth="1.65"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Pulso activo GAR. */}
            <circle cx="5" cy="12.5" r="1.8" fill={primary} />
          </>
        )

      /* 7. Nuevos negocios — Matriz de expansión y vector R hacia nuevo cuadrante */
      case 'ventures':
        return (
          <>
            {/* Cuadrantes base en ocre */}
            <rect
              x="5.5"
              y="14.5"
              width="12"
              height="12"
              rx="2.5"
              stroke={secondary}
              strokeWidth="1.5"
              opacity="0.8"
            />
            {/* Marco G de escalabilidad */}
            <path
              d="M14.5 11.5V8A2.5 2.5 0 0 1 17 5.5H24A2.5 2.5 0 0 1 26.5 8V15A2.5 2.5 0 0 1 24 17.5H20.5"
              stroke={primary}
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Vector diagonal R de despegue desde el núcleo */}
            <path
              d="M11.5 20.5L21.5 10.5M21.5 10.5H16.5M21.5 10.5V15.5"
              stroke={primary}
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="24" cy="24" r="1.8" fill={primary} />
          </>
        )

      /* 8. Procesos y operaciones — Rieles modulares sincronizados con terminales G/R */
      case 'operations':
        return (
          <>
            {/* Líneas de proceso paralelas en ocre */}
            <path
              d="M6 9.5H26M6 16H22M6 22.5H26"
              stroke={secondary}
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.75"
            />
            {/* Nodos de control modular G/A/R en amarillo */}
            <path
              d="M13 6.5H10A1.5 1.5 0 0 0 8.5 8V11A1.5 1.5 0 0 0 10 12.5H13V9.5H11.2"
              stroke={primary}
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M17.5 19L20 13L22.5 19"
              stroke={primary}
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M11 20V25M11 20H14.5A1.5 1.5 0 0 1 16 21.5C16 22.3 15.3 23 14.5 23H11M14 23L16.5 25.5"
              stroke={primary}
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="25.5" cy="16" r="1.8" fill={primary} />
          </>
        )

      /* 9. Consultoría — Lente de convergencia ejecutiva (Arco G + Proyección R) */
      case 'consulting':
        return (
          <>
            {/* Arco secundario de contraste (perspectiva de negocio) */}
            <path
              d="M19.5 7.5A9 9 0 1 1 19.5 24.5"
              stroke={secondary}
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.85"
            />
            {/* Arco G principal (visión tecnológica) */}
            <path
              d="M13.5 24.5A9 9 0 1 1 13.5 7.5"
              stroke={primary}
              strokeWidth="1.75"
              strokeLinecap="round"
            />
            {/* Eje de síntesis A/R central */}
            <path
              d="M11.5 16H20.5M16 11.5L20.5 16L16 20.5"
              stroke={primary}
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="24" cy="16" r="1.8" fill={primary} />
          </>
        )

      /* 10. Ecosistema de empresas — 4 nodos orbitales vinculados al núcleo GAR. */
      case 'ecosystem':
      default:
        return (
          <>
            {/* Órbita y ejes de vinculación en ocre */}
            <circle
              cx="16"
              cy="16"
              r="9.5"
              stroke={secondary}
              strokeWidth="1.4"
              strokeDasharray="3 3"
              opacity="0.75"
            />
            <path
              d="M11.5 11.5L8.5 8.5M20.5 11.5L23.5 8.5M11.5 20.5L8.5 23.5M20.5 20.5L23.5 23.5"
              stroke={secondary}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            {/* Núcleo central G */}
            <path
              d="M18.8 13.5A4 4 0 1 0 20 16H16.5"
              stroke={primary}
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* 4 Nodos de las marcas del ecosistema (Kopernicus, InspeXiona, TechInsurance, KPS) */}
            <rect x="4.5" y="4.5" width="4.5" height="4.5" rx="1.2" stroke={primary} strokeWidth="1.65" fill="#0d0e11" />
            <rect x="23" y="4.5" width="4.5" height="4.5" rx="1.2" stroke={primary} strokeWidth="1.65" fill="#0d0e11" />
            <rect x="4.5" y="23" width="4.5" height="4.5" rx="1.2" stroke={primary} strokeWidth="1.65" fill="#0d0e11" />
            <circle cx="25.25" cy="25.25" r="2.25" fill={primary} />
          </>
        )
    }
  }

  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {renderGlyph()}
    </svg>
  )
}
