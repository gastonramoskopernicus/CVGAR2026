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
4. **Diseño Visual General:** La vista principal adopta un concepto tipo "sistema planetario". Cada aplicación privada debe representarse como un planeta u órbita (no infantil, elegante).
5. **Configuración Centralizada:** Mantener un array accesible y no hardcoded para la lista de aplicaciones privadas en `src/data/privateApps.js`.
6. **Tool Stack (Nuevo):** Para la sección de herramientas (Tool Stack), abandonar el estilo planetario. Utilizar un diseño premium tipo "command center" con tarjetas *glassmorphism*, bordes sutiles, hover microanimado y categorización estructurada. La data debe estar centralizada en `src/data/toolStack.js`.

## Casos Borde y Trampas Conocidas (Actualizar al detectar errores)
- *NextAuth Session Loading:* Asegurar el manejo de la sesión en el cliente (estado *loading*) o realizar la protección directamente por validación Server-Side (SSR en `getServerSideProps` preferiblemente para evitar UI blinks).
- *OAuth Credentials:* Se deben setear `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` además de `NEXTAUTH_URL` y `NEXTAUTH_SECRET` en el `.env`. Se deben añadir al `/directivas/` si varían.

*(Directiva generada durante planificación)*
