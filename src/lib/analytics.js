/**
 * Capa de Analítica y Seguimiento de Conversiones (V3 — Preparación GA4 / GTM / Google Ads).
 * Regla de Ejecución:
 * - Inactiva por defecto mientras no se configuren IDs explícitos (cero gasto, cero campañas activas).
 * - Separa estrictamente Conversiones Principales (Leads comerciales) de Microconversiones.
 */

export const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID || ''
export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || ''
export const GADS_ID = process.env.NEXT_PUBLIC_GADS_ID || ''
export const GADS_LEAD_LABEL = process.env.NEXT_PUBLIC_GADS_LEAD_LABEL || ''

export function isAnalyticsEnabled() {
  return Boolean(GA4_ID || GTM_ID)
}

function pushDataLayer(eventPayload) {
  if (typeof window === 'undefined') return
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push(eventPayload)
  if (typeof window.gtag === 'function' && eventPayload.event) {
    const { event, ...params } = eventPayload
    window.gtag('event', event, params)
  }
}

/**
 * Conversiones Principales (Macro-conversiones comerciales):
 * - Consulta comercial enviada ('generate_lead')
 * - Reunión solicitada ('schedule_meeting_request')
 * Regla de Privacidad: Jamás incluye nombre, email, teléfono, empresa ni mensaje.
 */
export function trackLeadConversion({
  type = 'generate_lead',
  sourcePage = '/contacto',
} = {}) {
  pushDataLayer({
    event: type,
    conversion_tier: 'primary_commercial_lead',
    source_page: String(sourcePage || '/contacto'),
    currency: 'ARS',
    value: 1,
  })

  // Si Google Ads Conversion Tracking se habilita en el futuro con autorización
  if (typeof window !== 'undefined' && typeof window.gtag === 'function' && GADS_ID && GADS_LEAD_LABEL) {
    window.gtag('event', 'conversion', {
      send_to: `${GADS_ID}/${GADS_LEAD_LABEL}`,
      value: 1.0,
      currency: 'ARS',
    })
  }
}

/**
 * Microconversiones (Interacciones de interés, NO contabilizadas como leads comerciales):
 * - click_email
 * - click_linkedin
 * - cta_interaction
 * - multimedia_open
 */
export function trackMicroConversion(action, { label = '', destination = '' } = {}) {
  pushDataLayer({
    event: action,
    conversion_tier: 'microconversion',
    event_label: label,
    destination_url: destination,
  })
}

