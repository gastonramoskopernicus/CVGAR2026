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

## 5. Especificaciones de Evolución Quirúrgica V2.1
1. **Fotografía del Hero sin Fondo:**
   - Procesar `/public/FotoGAR.jpeg` mediante un script determinista en `scripts/process_hero_portrait.py` usando `rembg` y `Pillow` para remover únicamente el fondo y generar `/public/FotoGAR-nobg.png` (y `.webp`) con canal alfa real.
   - Eliminar el contenedor rectangular visible, bordes y fondo del retrato en el Hero, integrando la silueta directamente delante del elemento circular animado para que los aros y el texto rotatorio cobren protagonismo detrás de la figura en desktop y mobile.
2. **Evolución del Monograma `GAR.`:**
   - Crear un componente único reutilizable `src/components/Monogram.js` (`GAR` + punto `.` en amarillo `#f5b727`).
   - Aplicar `GAR.` de forma consistente en `Header`, `Footer`, `StickyIcon` y `favicon` (`/public/favicon.svg` + `/public/favicon.ico`), sin alterar textos editoriales ni URLs.
3. **Sistema de Iconografía Exclusivo (`GAR Icon System`):**
   - Crear `src/components/GARIcon.js` con una familia coherente de 10 iconos vectoriales SVG diseñados con geometría modular inspirada sutilmente en trazos `G`, `A` y `R` (arcos abiertos con corte horizontal `G`, vértices angulares `A` con travesaño, diagonales proyectadas `R`) en paleta amarillo (`#f5b727`) y ocre (`#c88a28`):
     1. `strategy` (Estrategia tecnológica)
     2. `transformation` (Transformación digital)
     3. `innovation` (Innovación)
     4. `architecture` (Arquitectura empresarial)
     5. `ai` (Inteligencia artificial)
     6. `automation` (Automatización)
     7. `ventures` (Nuevos negocios)
     8. `operations` (Procesos y operaciones)
     9. `consulting` (Consultoría)
     10. `ecosystem` (Ecosistema de empresas)
   - Conservar íconos funcionales estándar de usabilidad (correo, LinkedIn, menú hamburguesa, flechas de navegación).
4. **Sección Ecosistema Profesional antes del Footer (Home):**
   - Incorporar antes del Footer en el Home la sección **Ecosistema profesional** (*"Empresas, plataformas e iniciativas vinculadas a mi actividad profesional."*) con las 4 marcas:
     - Kopernicus Tech (`https://kopernicus.tech/`)
     - InspeXiona (`https://inspexiona.com.ar/`)
     - Tech Insurance (`https://techinsurance.com.ar/`)
     - KPS (`https://kps.com.ar/`)
   - Extraer los logotipos oficiales mediante `scripts/fetch_ecosystem_and_multimedia.py` desde los sitios/repositorios correspondientes. Si algún asset no está disponible o requiere validación, reportarlo explícitamente.
5. **Multimedia y Disertaciones (`/multimedia`):**
   - Mantener todos los contenidos actuales sin duplicar piezas.
   - Incorporar y diferenciar claramente categorías y tipos (`Disertación`, `Entrevista`, `Artículo`, `Video`, `Publicación`) con datos verificados desde las fuentes oficiales (`kopernicus.tech/multimedia`, LinkedIn, YouTube).
   - No convertir publicaciones de conferencias en videos si no existe grabación verificable.

## 6. Casos Borde y Trampas Conocidas
- **Estilos inline heredados:** Varios componentes de páginas (`index.js`, `about.js`, `capabilities.js`, `multimedia.js`, `hobbies.js`) contienen atributos `style={{ color: '#000000' }}` o `style={{ color: '#444444' }}` heredados del tema claro anterior. Deben removerse o reemplazarse por clases CSS del módulo correspondiente para evitar texto negro invisible sobre fondos oscuros.
- **Animación circular y accesibilidad:** Incluir siempre `@media (prefers-reduced-motion: reduce)` para desactivar o pausar el giro continuo en usuarios que lo soliciten.
- **Dependencias locales (`next-auth`):** Nota: No ejecutar `npm run build` sin verificar primero que `node_modules/next-auth` esté instalado localmente, porque causa el error `Module not found: Can't resolve 'next-auth'`. En su lugar, ejecutar `npm install --no-package-lock` antes del build (respetando la regla previa de no generar `package-lock.json` conflictivo).
- **Contraste de logotipos oficiales sobre fondo oscuro:** Nota: No usar `/kopernicus.png` crudo directamente sobre `#0d0e11` porque su texto `KOPERNICUS` es negro y pierde legibilidad. En su lugar, usar `scripts/prepare_brand_logos_and_favicon.py` para generar `public/images/brands/kopernicus-dark.png` preservando intacto el isotipo magenta `#DA084B` e invirtiendo únicamente la luminancia de los píxeles neutros del wordmark, y para `Tech Insurance` emplear el lockup oficial del header de `techinsurance.com.ar` (`techinsurance.svg` + wordmark `TECHINSURANCE`).
- **Colisión de `.next/` entre `next build` y `next dev`:** Nota: No dejar un proceso `npm run dev` corriendo sin reiniciarlo después de ejecutar `npm run build`, porque `next build` sobreescribe `.next/` con manifiestos de producción y causa HTTP 500 en el servidor de desarrollo activo. En su lugar, reiniciar `npm run dev` tras completar `npm run build`.
