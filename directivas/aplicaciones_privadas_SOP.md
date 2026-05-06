# Aplicaciones Privadas (SOP)

## Objetivo General
Crear una sección exclusiva de acceso personal (`/aplicaciones`) validada mediante Google OAuth, restringida a un único email autorizado (`Gaston.alejandro.ramos@gmail.com`). La autenticación no debe usar métodos clásicos (usuario/contraseña).

## Arquitectura y Componentes Relacionados
- **Header:** Actualización en `src/components/Header.js` para incluir la opción "Aplicaciones".
- **API Guard:** Creación de endpoint NextAuth en `src/pages/api/auth/[...nextauth].js`.
- **Vista Privada:** `src/pages/aplicaciones.js`, protegida usando `getSession` de NextAuth (Pages Router).

## Reglas y Restricciones (Memoria)
1. **Acceso Autorizado:** Sólo `Gaston.alejandro.ramos@gmail.com` puede visualizar la sección.
2. **Redirección No Autenticado:** Debe ser redirigido directamente al fluxo de OAuth de Google o mostrar "Acceso Denegado". No debe mostrarse el contenido en el cliente bajo ninguna circunstancia.
3. **SEO:** Ruta `/aplicaciones` con tag noindex/nofollow para evitar la indexación por buscadores.
4. **Jerarquía Visual y Diseño (Nivel 1):** La vista principal DEBE mostrar las **Aplicaciones Propias** (CRM KPS, Car Admin, KPS Energy, Crypto Admin) en la parte superior. El diseño debe adoptar una estética "command center" limpia, premium y profesional (estilo Raycast/Linear). Queda **estrictamente prohibido** el uso de planetas, órbitas o nodos flotantes. Asimismo, **queda prohibido el uso excesivo de transparencias (glassmorphism lavado)**; los fondos de las tarjetas deben ser **oscuros sólidos (ej. #181a20)** con textos de altísimo contraste (blanco y gris claro).
5. **Configuración Centralizada (Nivel 1):** Mantener la lista de aplicaciones privadas principales en `src/data/privateApps.js`. No mezclar con utilidades.
6. **Tool Stack (Nivel 2):** Debajo del Nivel 1 debe ubicarse la biblioteca de herramientas secundarias. La data debe estar en `src/data/toolStack.js`. Crypto Admin no pertenece aquí.

## Casos Borde y Trampas Conocidas (Actualizar al detectar errores)
- *NextAuth Session Loading:* Asegurar el manejo de la sesión en el cliente (estado *loading*) o realizar la protección directamente por validación Server-Side (SSR en `getServerSideProps` preferiblemente para evitar UI blinks).
- *OAuth Credentials:* Se deben setear `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` además de `NEXTAUTH_URL` y `NEXTAUTH_SECRET` en el `.env`. Se deben añadir al `/directivas/` si varían.

*(Directiva generada durante planificación)*
