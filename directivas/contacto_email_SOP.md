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
   - Error: mostrar `"No pudimos enviar tu mensaje en este momento. Por favor, intentá nuevamente."` sin exponer detalles técnicos y conservando los datos en los campos.
4. **Conversión `generate_lead`:**
   - Disparar únicamente cuando `res.ok && data.ok && data.providerAccepted === true`, una sola vez por envío, y sin incluir ningún dato personal (`nombre`, `email`, `telefono`, `empresa`, `mensaje`) en el payload analítico.
