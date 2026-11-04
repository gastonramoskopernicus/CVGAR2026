import { useEffect, useRef } from 'react'
import Script from 'next/script'

const QA_DEFAULT_SITE_KEY = '1x00000000000000000000AA'

/**
 * Componente Cloudflare Turnstile en modo Managed con apariencia 'interaction-only'
 * (interacción invisible cuando Cloudflare lo permite, sin alterar el diseño visual).
 * Reutiliza el patrón de `InspeXiona/src/components/security/TurnstileWidget.tsx`.
 */
export default function TurnstileWidget({
  onVerify,
  onExpire,
  onError,
  action = 'contact_submit',
  resetKey = 0,
}) {
  const containerRef = useRef(null)
  const widgetIdRef = useRef(null)

  const siteKey =
    (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY &&
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY !== '[SENSITIVE]'
      ? process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY.trim()
      : '') || QA_DEFAULT_SITE_KEY

  const renderWidget = () => {
    if (typeof window === 'undefined' || !window.turnstile || !containerRef.current || !siteKey) {
      return
    }

    if (widgetIdRef.current !== null) {
      try {
        window.turnstile.remove(widgetIdRef.current)
      } catch {
        // Ignorar si ya fue removido
      }
      widgetIdRef.current = null
    }

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      action,
      theme: 'dark',
      appearance: 'interaction-only',
      callback: (token) => {
        if (onVerify) onVerify(token)
      },
      'expired-callback': () => {
        if (onExpire) onExpire()
      },
      'error-callback': () => {
        if (onError) onError()
      },
    })
  }

  useEffect(() => {
    if (typeof window !== 'undefined' && window.turnstile) {
      renderWidget()
    }
    return () => {
      if (typeof window !== 'undefined' && window.turnstile && widgetIdRef.current !== null) {
        try {
          window.turnstile.remove(widgetIdRef.current)
        } catch {
          // Ignorar errores de desmontaje
        }
        widgetIdRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteKey, action, resetKey])

  if (!siteKey) return null

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={renderWidget}
      />
      <div
        ref={containerRef}
        data-turnstile-action={action}
        aria-label="Verificación de seguridad anti-bots"
      />
    </>
  )
}
