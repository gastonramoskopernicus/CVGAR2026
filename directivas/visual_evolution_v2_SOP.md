# Visual Evolution V2 — Contemporary Tech Editorial (SOP)

## 1. Objetivo General
Evolucionar la identidad visual de `gastonramos.com.ar` hacia el sistema de diseño **Contemporary Tech Editorial — GR Identity** (composición editorial oscura, fotografía protagonista integrada, tipografía moderna, elemento circular animado detrás del retrato, acentos en amarillo y ocre, estética ejecutiva minimalista), preservando íntegramente los contenidos editoriales, rutas y funcionalidades existentes.

## 2. Entorno y Aislamiento de Producción (CRÍTICO)
- **Repositorio:** `https://github.com/gastonramoskopernicus/CVGAR2026.git`
- **Rama de Producción:** `main` (conectada a Vercel `gaston-portfolio`). **PROHIBIDO modificar o hacer push/merge a `main`.**
- **Rama de Trabajo Aislada:** `feature/gr-visual-evolution-v2`.
- **Restricciones:** No modificar variables de entorno productivas, dominios, configuración de NextAuth ni endpoints de API.

## 3. Tokens del Sistema de Diseño V2
- **Background principal:** `#0d0e11` (Negro / Grafito profundo)
- **Superficies secundarias:** `#14161b` / `#181a20` / `#1f222a` (Grises oscuros sólidos)
- **Superficies claras (contraste puntual):** `#fffcf5` / `#f5f2eb` (Marfil / Gris cálido)
- **Texto principal:** `#f5f2eb` (Blanco cálido sobre oscuro) / `#14161b` (Grafito sobre acento amarillo o superficie clara)
- **Texto secundario / Muted:** `#9ca3af` / `#a1a1aa`
- **Acento principal (Amarillo GR):** `#f5b727` (hover `#ffc640`)
- **Acento secundario (Ocre GR):** `#c88a28` / `#9a6518`
- **Bordes y divisores:** `rgba(255, 255, 255, 0.09)` / `#262932`
- **Tipografía:** `Manrope` / `Plus Jakarta Sans` (títulos editoriales contundentes) + `Inter` (cuerpo de alta legibilidad).

## 4. Reglas de Preservación e Identidad
1. **Monograma en Header:** Mantener el monograma `GR.` / `GAR` en el encabezado con acento amarillo y navegación limpia con indicador activo amarillo.
2. **Hero Asimétrico:**
   - **Columna izquierda:** Kicker superior (`ESTRATEGIA / TECNOLOGÍA / TRANSFORMACIÓN`), nombre protagonista (`Gastón Ramos.`), título y descripción originales intactos, botones CTA existentes (`Ver Perfil` y `Hablemos`), e indicadores de las 3 capacidades destacadas con iconos lineales amarillos.
   - **Columna derecha:** Fotografía personal original (`/public/FotoGAR.jpeg`) integrada con el fondo oscuro, acompañada detrás por el componente circular animado (anillos concéntricos en amarillo/ocre + texto circular en rotación suave con soporte `prefers-reduced-motion`).
3. **Control Flotante (`StickyIcon`):** Conservar en esquina inferior derecha con estética actualizada a los tokens V2 (acento amarillo, contraste grafito).
4. **Footer:** Conservar la estructura, bloques, enlaces y textos del componente `Footer.js`, refinando únicamente detalles sutiles de integración tipográfica y borde superior.
5. **Ecosistema / Aplicaciones:**
   - Preservar intacto el flujo privado con Google OAuth en `/aplicaciones` (`privateApps` + `ToolStack`).
   - Preparar la estructura de datos extensible en `src/data/ecosystemData.js` y el componente `src/components/EcosystemGrid.js` para las entidades previstas (`Kopernicus Tech`, `KPS Tech`, `Tech Insurance`, `InspeXiona`, y futuras iniciativas) sin publicar textos comerciales ficticios ni atribuciones societarias no verificadas.
6. **Conservación Absoluta de Contenidos:** No alterar biografía, experiencia, títulos académicos, artículos, videos, descripciones de capacidades ni URLs.

## 5. Casos Borde y Trampas Conocidas
- **Estilos inline heredados:** Varios componentes de páginas (`index.js`, `about.js`, `capabilities.js`, `multimedia.js`, `hobbies.js`) contienen atributos `style={{ color: '#000000' }}` o `style={{ color: '#444444' }}` heredados del tema claro anterior. Deben removerse o reemplazarse por clases CSS del módulo correspondiente para evitar texto negro invisible sobre fondos oscuros.
- **Animación circular y accesibilidad:** Incluir siempre `@media (prefers-reduced-motion: reduce)` para desactivar o pausar el giro continuo en usuarios que lo soliciten.
- **Dependencias locales (`next-auth`):** Nota: No ejecutar `npm run build` sin verificar primero que `node_modules/next-auth` esté instalado localmente, porque causa el error `Module not found: Can't resolve 'next-auth'`. En su lugar, ejecutar `npm install --no-package-lock` antes del build (respetando la regla previa de no generar `package-lock.json` conflictivo).
