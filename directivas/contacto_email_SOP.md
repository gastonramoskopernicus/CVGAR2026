# Directiva — Reparación e Integración del Formulario de Contacto (`gastonramos.com.ar`) (SOP)

## 1. Objetivo General
Diagnosticar, reparar y blindar el flujo de contacto de `gastonramos.com.ar` (`/contacto` y `/api/contact`) reutilizando la arquitectura de envío de correos de **InspeXiona** (**Cloudflare Email Sending REST API**), conservando intacto el diseño visual del formulario y garantizando seguridad, validación estricta, manejo de errores amigable y disparo limpio de la conversión `generate_lead`.

## 2. Diagnóstico de Causa Raíz
1. **Proveedor incompleto y credenciales placeholder en `CV_GAR_2026`:**
   - `src/pages/api/contact.js` estaba acoplado exclusivamente a Gmail SMTP vía `nodemailer` (`SMTP_USER` / `SMTP_PASS`).
   - En `.env.local`, `SMTP_USER` contenía el valor de ejemplo `tu-cuenta@gmail.com` y `SMTP_PASS` `xxxx xxxx xxxx xxxx`, causando rechazo de autenticación SMTP (`HTTP 500`).
   - En los entornos de Vercel donde `SMTP_USER`/`SMTP_PASS` no estaban definidos, el endpoint abortaba en la línea 57 con `HTTP 500 {"error": "Servicio de email no configurado."}`.
2. **Vulnerabilidades y brechas detectadas en la implementación anterior:**
   - Interpolación directa sin escape HTML (`${nombre}`, `${email}`, `${mensaje}`) en el cuerpo del correo (riesgo de inyección HTML/XSS en clientes de correo).
   - Ausencia de validación contra inyección de encabezados (`\r`, `\n`) en `email` / `replyTo` y `nombre`.
   - Ausencia de límites de longitud máxima por campo.
   - El frontend mostraba `err.message` crudo devuelto por el backend y no limpiaba el estado `values` tras el envío exitoso.

## 3. Infraestructura Identificada en InspeXiona (`EmailNotificationProvider.ts`)
- **Proveedor real verificado:** **Cloudflare Email Sending REST API** (el usuario refirió verbalmente "CloudFoundry", correspondiendo en la configuración técnica real de InspeXiona a **Cloudflare**).
- **Endpoint oficial:** `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/email/sending/send`
- **Método de integración:** Solicitud HTTP `POST` nativa (`fetch`) con encabezado `Authorization: Bearer ${CLOUDFLARE_EMAIL_API_TOKEN}` y payload JSON (`from`, `to`, `cc`, `reply_to`, `subject`, `html`, `text`).
- **Variables de entorno requeridas (Server-Side):**
  - `CLOUDFLARE_ACCOUNT_ID`: ID de cuenta de Cloudflare.
  - `CLOUDFLARE_EMAIL_API_TOKEN`: Token de API con permiso *Email Sending: Write*.
  - `CLOUDFLARE_EMAIL_FROM`: Remitente verificado en Cloudflare (ej. `GAR | gastonramos.com.ar <notificaciones@mail.inspexiona.com.ar>` o dominio verificado en `gastonramos.com.ar`).
  - `CONTACT_TO_EMAIL`: Destinatario principal (`gaston.alejandro.ramos@gmail.com`).
  - `CONTACT_CC_EMAIL`: Destinatario en copia (sujeto a validación ASCII RFC 5321/5322).
- **Fallback opcional:** Si no se definen las variables de Cloudflare pero se proveen credenciales SMTP válidas (no placeholders), el servicio admite fallback controlado por SMTP; si ninguna credencial real está presente, devuelve error controlado `503` sin falsos positivos de aceptación.

## 4. Validación de Destinatarios (Trampa Conocida — EAI / Caracteres Internacionales)
- **TO:** `gaston.alejandro.ramos@gmail.com` (100% válido bajo RFC 5321/5322 y Cloudflare Email API).
- **CC solicitado en directiva:** `ramos.gastón@kopernicus.tech` (contiene tilde `ó` `U+00F3` en la parte local).
- **Regla de validación:** La especificación estándar RFC 5321/5322 y la API REST de Cloudflare Email Sending rechazan caracteres no-ASCII en la parte local de la dirección si el servidor no negocia `SMTPUTF8` extremo a extremo.
- **Acción obligatoria:** No sustituir automáticamente `ramos.gastón@kopernicus.tech` por `ramos.gaston@kopernicus.tech` sin autorización del usuario. El validador `validateEmailAddress()` detecta caracteres no-ASCII (`[^\x00-\x7F]`), informa explícitamente el estado `INVALID_INTERNATIONAL_CHAR_IN_LOCAL_PART` y solicita confirmación al usuario para utilizar `ramos.gaston@kopernicus.tech` (dirección ASCII oficial utilizada en el resto del sitio).

## 5. Especificaciones de Seguridad, UX y Analítica
1. **Formato del Correo:**
   - **Asunto:** `GAR | Nueva consulta desde gastonramos.com.ar`
   - **Cuerpo (HTML con estética GAR grafito/amarillo + Texto Plano):**
     - Encabezado: `Nueva consulta recibida desde el sitio personal GAR`
     - Campos: `Nombre`, `Email`, `Empresa`, `Teléfono`, `Mensaje`, `Fecha y hora` (zona horaria `America/Argentina/Buenos_Aires`), `Origen: gastonramos.com.ar`.
   - **Reply-To:** Email validado del visitante. Jamás usar el email del visitante como `From`.
2. **Controles de Seguridad en `/api/contact`:**
   - Validación server-side de campos obligatorios y límites de longitud (`nombre <= 120`, `email <= 254`, `empresa <= 160`, `telefono <= 40`, `mensaje <= 4000`).
   - Rechazo de caracteres de control / CR / LF (`[\r\n\0]`) para prevenir Header Injection.
   - Escape HTML completo (`&`, `<`, `>`, `"`, `'`) en todos los valores antes de construir el cuerpo HTML.
   - Honeypot (`_trap`) + prevención de doble envío idempotente (ventana de 60s por huella de solicitud) + rate limiting por IP + timeout de 10s hacia el proveedor (`AbortController`).
   - Destinatarios fijos del lado servidor; el cliente no puede definir ni alterar `to` ni `cc`.
   - Logs sin PII sensible.
3. **Experiencia de Usuario en `/contacto`:**
   - Éxito: mostrar `"Tu mensaje fue enviado correctamente. Gracias por contactarme."` y limpiar el formulario únicamente tras confirmación real del proveedor (`providerAccepted: true`).
   - Error general: mostrar `"No pudimos enviar tu mensaje. Intentá nuevamente."` sin exponer detalles técnicos y conservando los datos en los campos.
   - Demasiados intentos (`HTTP 429`): mostrar `"Se realizaron demasiados intentos. Por favor, volvé a probar más tarde."` sin revelar umbrales internos.
4. **Conversión `generate_lead`:**
   - Disparar únicamente cuando `res.ok && data.ok && data.providerAccepted === true`, una sola vez por envío, y sin incluir ningún dato personal (`nombre`, `email`, `telefono`, `empresa`, `mensaje`) en el payload analítico.

---

## 6. Protección Antispam, Turnstile, Rate Limiting Distribuido y Observabilidad
1. **Cloudflare Turnstile (Modo Managed / Interacción Invisible cuando sea permitido):**
   - Widget en frontend (`src/components/TurnstileWidget.js`) con `appearance: 'interaction-only'` y `action: 'contact_submit'`, utilizando clave pública de QA (`NEXT_PUBLIC_TURNSTILE_SITE_KEY`, con fallback seguro en QA a la clave oficial de prueba de Cloudflare `1x00000000000000000000AA`).
   - Validación exclusivamente en servidor (`src/lib/turnstileVerify.js`) contra `https://challenges.cloudflare.com/turnstile/v0/siteverify` con `TURNSTILE_SECRET_KEY` (jamás expuesta al cliente).
   - Verificación estricta de `success === true`, `action === 'contact_submit'`, `hostname` dentro de la lista blanca autorizada (`gastonramos.com.ar`, `localhost`, `127.0.0.1`, previews de Vercel del proyecto), y antigüedad del challenge.
   - **Prevención de Reutilización (Single-Use Token Ledger):** Todo token validado se registra mediante su hash SHA-256 en almacenamiento persistente con TTL de 15 minutos; cualquier intento de reutilizar un token es rechazado inmediatamente con `TOKEN_REUSED` antes de despachar correo.
2. **Rate Limiting Distribuido y Multi-Nivel (`src/lib/contactRateLimiter.js`):**
   - Arquitectura híbrida sin servicios pagos no autorizados: soporta **Upstash Redis REST** (`UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`) para despliegues serverless multi-instancia y un **almacén persistente compartido en disco con escritura atómica** (`.storage/security/contact-rate-limits.json`) para QA/desarrollo o nodos locales (no depende exclusivamente de la memoria volátil del proceso).
   - **Umbrales configurables por entorno:**
     - **Por IP (corto plazo):** `3` envíos cada `15` minutos (`CONTACT_RL_IP_15M=3`).
     - **Por IP (diario):** `10` envíos cada `24` horas (`CONTACT_RL_IP_24H=10`).
     - **Por Email declarado:** `3` envíos cada `60` minutos (`CONTACT_RL_EMAIL_60M=3`).
     - **Global del formulario:** `30` envíos cada `60` minutos (`CONTACT_RL_GLOBAL_60M=30`) — emite alerta interna de seguridad cuando se alcanza.
     - **Mensajes idénticos (Duplicados):** bloqueo durante `30` minutos (`CONTACT_DUPLICATE_TTL_MIN=30`) mediante hash SHA-256 de campos normalizados (`email` + `nombre` + `mensaje`), sin almacenar el texto del mensaje.
   - **Extracción segura de IP:** priorizar encabezados inyectados por proxies confiables (`cf-connecting-ip`, `x-vercel-forwarded-for`, o el primer hop confiable en entorno local/QA), ignorando cabeceras arbitrarias (`x-client-ip`, `client-ip`, etc.).
3. **Honeypot Accesible (`_trap`):**
   - Invisible visualmente, fuera de foco de teclado (`tabIndex={-1}`), oculto para lectores de pantalla (`aria-hidden="true"`), `autoComplete="off"`, sin interferir con autocompletado legítimo.
   - Si viene completado, se rechaza el envío en backend sin llamar al proveedor de correo y se registra en observabilidad como solicitud bloqueada (`HONEYPOT_TRIGGERED`).
4. **Validación Estricta de Contenido y Tamaño:**
   - Tamaño máximo total de la solicitud: **16 KB** (`16384` bytes; `api.bodyParser.sizeLimit = '16kb'` + verificación explícita en handler).
   - Límites por campo: `nombre <= 120`, `email <= 254`, `empresa <= 150`, `telefono <= 40`, `mensaje <= 3000`.
   - Prohibición explícita de adjuntos (`attachments`, `files`, `file`, `attachment`) y de parámetros de control (`to`, `cc`, `bcc`, `from`, `replyTo`, `subject`, `template`, `html`, `apiKey`, `smtp`).
5. **Protección del Proveedor de Email y Concurrencia:**
   - Semáforo de concurrencia máxima (`MAX_CONCURRENT_DISPATCHES = 3`) para evitar ráfagas simultáneas hacia Cloudflare Email API / SMTP.
   - Timeout estricto de `10s` (`AbortController`) y cero reintentos infinitos.
6. **Observabilidad sin PII (`src/lib/contactObservability.js`):**
   - Registro estructurado en `.storage/security/contact-observability.json` (y logs estructurados en consola) con `timestamp`, `requestId` (UUID), `validationResult`, `accepted`, `technicalReason`, `providerResult`, y contadores agregados (`legitimateRequests`, `blockedRequests`, `deliveryFailures`, `limitsReached` desglosados por regla).
   - Prohibido registrar el mensaje completo, tokens de Turnstile, secretos o datos personales en texto plano (IP y email se registran únicamente como hashes truncados).
7. **Restricciones / Casos Borde (Memoria Viva):**
   - *Nota: No evaluar `idempotencyKey.trim().length <= 128` sin verificar simultáneamente `idempotencyKey.trim().length > 0`, porque una cadena vacía `""` generaría un hash constante `idem:<sha256("")>` bloqueando envíos subsiguientes sin cabecera `X-Idempotency-Key` como `DUPLICATE_IDEMPOTENCY_KEY`. En su lugar, exigir `length > 0 && length <= 128`.*
   - *Nota: En Vercel, tanto los entornos Preview como Production compilan con `process.env.NODE_ENV === 'production'`. No condicionar el fallback de clave de Turnstile a `process.env.NODE_ENV !== 'production'`, porque si `NEXT_PUBLIC_TURNSTILE_SITE_KEY` o `TURNSTILE_SECRET_KEY` no están cargadas aún en Vercel, `TurnstileWidget` devuelve `null` y bloquea el envío en cliente y servidor (`TURNSTILE_SECRET_NOT_CONFIGURED`).*
   - *Nota: En Vercel Serverless (`AWS Lambda`), `process.cwd()` (`/var/task`) es de solo lectura (`EROFS`). Cuando `process.env.VERCEL` está activo, los almacenes en disco de rate limiting y observabilidad deben escribir en `path.join(os.tmpdir(), 'gar-contact-security')` (`/tmp/gar-contact-security`).*
   - *Nota: No copiar secretos productivos desde otros proyectos (`InspeXiona`). Las credenciales del proveedor de correo (`CLOUDFLARE_ACCOUNT_ID` + `CLOUDFLARE_EMAIL_API_TOKEN` + `CLOUDFLARE_EMAIL_FROM`, o `RESEND_API_KEY` + `EMAIL_FROM`, o `SMTP_USER` + `SMTP_PASS`) deben ser cargadas explícitamente en el proyecto Vercel `gaston-portfolio`.*

---

## 8. Doble Flujo de Correo: Notificación Interna (`info@gastonramos.com.ar`) y Confirmación Automática al Visitante
1. **Correo 1 — Notificación Interna (Prioridad Crítica):**
   - **From:** `info@gastonramos.com.ar` (`GAR | gastonramos.com.ar <info@gastonramos.com.ar>`)
   - **To:** `info@gastonramos.com.ar`
   - **Reply-To:** email validado del visitante.
   - **Sin CC ni BCC** (prohibido enviar copias a cuentas de Gmail o Kopernicus).
   - **Contenido:** Nombre, Email, Empresa, Teléfono, Mensaje, Fecha y hora (`America/Argentina/Buenos_Aires`), Origen (`gastonramos.com.ar`).
2. **Correo 2 — Confirmación Automática al Visitante (Prioridad Secundaria Desacoplada):**
   - **From:** `Gastón Alejandro Ramos <info@gastonramos.com.ar>`
   - **To:** email validado del visitante.
   - **Reply-To:** `info@gastonramos.com.ar`
   - **Sin CC ni BCC.**
   - **Asunto exacto:** `Gracias por contactarme — Gastón Ramos`
   - **Contenido obligatorio (HTML responsive minimalista GAR + Texto plano):**
     - Saludo: `Hola [Nombre],`
     - Párrafo 1: `Gracias por contactarme y por tu interés.`
     - Párrafo 2: `Recibí correctamente tu mensaje y a la brevedad me pondré en contacto con vos para conocer mejor tu consulta y evaluar cómo puedo ayudarte.`
     - Firma: `Saludos,` / `Gastón Alejandro Ramos` / `Estrategia · Tecnología · Transformación` / `https://gastonramos.com.ar`
   - **Restricciones de Seguridad en la Confirmación:**
     - **PROHIBIDO incluir el mensaje original del visitante** en la confirmación automática (impide reflexión de contenido spam/phishing hacia terceros).
     - Prohibido incluir enlaces promocionales o adjuntos.
     - Se envía **únicamente después** de que todas las validaciones antispam pasen Y de que el correo interno a `info@gastonramos.com.ar` haya sido aceptado exitosamente por el proveedor.
     - **Límite por destinatario de auto-respuesta:** máximo 1 confirmación automática cada 60 minutos y máximo 2 cada 24 horas para una misma dirección de correo destinataria (`checkAndConsumeAutoReplyQuota`), evitando bombardear casillas de terceros si un atacante reutiliza el mismo email con mensajes distintos.
     - **Cuota global del conjunto de correos:** contabiliza cada correo emitido (interno + respuesta automática) contra el tope global horario (`CONTACT_RL_GLOBAL_EMAILS_60M=60`).
3. **Tratamiento de Errores e Idempotencia:**
   - Si falla el correo interno -> retornar error al usuario y **no enviar** la confirmación al visitante.
   - Si el correo interno es aceptado pero falla la confirmación automática -> **no repetir** la notificación interna, retornar `HTTP 200` (`providerAccepted: true`, éxito visual al visitante), registrar el error de confirmación en observabilidad y guardar una entrada idempotente en `autoReplyRetryQueue` (con `requestId`, `nombre` y `email`, sin el mensaje original, permitiendo un único reintento separado vía `retryFailedAutoReply(requestId)` sin reintentos infinitos).
4. **Diagnóstico DNS de `gastonramos.com.ar` (SPF, DKIM, DMARC y MX):**
   - **NS:** `ruth.ns.cloudflare.com.`, `cameron.ns.cloudflare.com.`
   - **MX actual (NO MODIFICAR):** `1 smtp.google.com.`
   - **SPF actual:** `"v=spf1 include:_spf.google.com ~all"`
   - **DKIM activo:** `google._domainkey.gastonramos.com.ar` (`v=DKIM1; k=rsa; p=MIIBIjAN...`)
   - **DMARC actual:** `"v=DMARC1; p=none; rua=mailto:info@gastonramos.com.ar"`
   - **Nota operativa de autenticación de remitente (`info@gastonramos.com.ar`):**
     - Como el buzón `info@gastonramos.com.ar` tiene MX, SPF (`include:_spf.google.com`) y DKIM (`google._domainkey`) activos en Google Workspace, si se envía mediante Cloudflare Email Sending o Resend con `From: info@gastonramos.com.ar`, es requisito agregar el `include` SPF y registros DKIM del proveedor en Cloudflare DNS (sin tocar el registro MX `1 smtp.google.com`), o bien utilizar credenciales SMTP de `info@gastonramos.com.ar` en Google Workspace que ya cuentan con SPF y DKIM 100% autenticados en DNS.





