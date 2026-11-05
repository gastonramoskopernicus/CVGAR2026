# Directiva — Evolución del Posicionamiento Profesional y Contenidos del Sitio (SOP)

## 1. Objetivo Estratégico
Evolucionar la comunicación institucional de `gastonramos.com.ar` para posicionar a **Gastón Alejandro Ramos** como:
> **Consultor Senior en Estrategia, Tecnología y Transformación de Negocios.**

Ampliar la propuesta de valor hacia organizaciones de distintos sectores —especialmente empresas medianas y en crecimiento— que buscan eficiencia operativa, optimización y digitalización de procesos, modernización de plataformas, automatización e IA, desarrollo de nuevos productos/canales y transformación de modelos operativos, **conservando la especialización en Seguros y Servicios Financieros como fortaleza distintiva principal**.

**Principio rector:** La tecnología es un habilitador de la estrategia y del negocio, no un fin en sí mismo.

---

## 2. Entradas, Alcance y Restricciones

### 2.1. Alcance Autorizado
- **Home (`src/pages/index.js`, `src/styles/Home.module.css`):**
  - Carrusel de posicionamiento en el sector textual del Hero (3 mensajes rotativos).
  - Actualización de las 3 capacidades destacadas (Hero Pillars + Tarjetas de Propuesta de Valor).
  - Ajuste de copy institucional en la sección de Propuesta de Valor para reflejar el alcance transversal + especialización aseguradora.
- **Perfil (`src/pages/about.js`, `src/styles/About.module.css`):**
  - Nuevo texto principal de perfil profesional (4 párrafos exactos).
  - Tres dimensiones destacadas (**Visión estratégica**, **Experiencia tecnológica**, **Orientación al negocio**).
  - Ajuste de subtítulo, etiquetas de expertise y cierre de compromiso para reflejar el posicionamiento ampliado sin alterar la trayectoria laboral ni académica real.
- **Capacidades y Áreas de Enfoque (`src/pages/capabilities.js`, `src/styles/Capabilities.module.css`):**
  - Reorganización en **6 Capacidades Principales** con su descripción y temas asociados.
  - Incorporación de la sección **Áreas de Enfoque — Segmentos y desafíos empresariales** (5 segmentos, diferenciando explícitamente a **Seguros y servicios financieros** como especialización sectorial histórica principal y a los restantes como ámbitos de aplicación transversal).
- **SEO y Datos Estructurados (`src/pages/index.js`, `src/pages/about.js`, `src/pages/capabilities.js`, `src/lib/schemaOrg.js`):**
  - Actualización exclusiva de los metadatos y esquemas JSON-LD directamente afectados por el nuevo posicionamiento.

### 2.2. Restricciones Estrictas (Qué NO tocar)
1. **Entorno:** Implementar y desplegar únicamente en **Preview / QA** (`feature/gr-visual-evolution-v2`). **Prohibido publicar en producción (`main`) sin revisión y aprobación expresa del propietario.**
2. **Identidad Visual y Hero:** Conservar paleta negro/grafito, blanco y amarillo/dorado, tipografías, fotografía `/FotoGAR-hero-v3.webp`, anillos orbitales y animaciones del Hero.
3. **Iconografía GAR (`src/components/GARIcon.js`):**
   - Prohibido incorporar Lucide, Heroicons, Font Awesome, emojis o una segunda librería.
   - Reutilizar exclusivamente los glifos existentes en `GARIcon` (`strategy`, `transformation`, `innovation`, `architecture`, `ai`, `automation`, `ventures`, `operations`, `consulting`, `ecosystem`).
   - Documentar cualquier concepto que pudiera beneficiarse en el futuro de un nuevo glifo GAR dedicado.
4. **Módulos excluidos:** No modificar autenticación, `/aplicaciones`, `/showcase`, `/contacto`, ni `/api/contact` ni el servicio de correo.
5. **Dependencias:** No instalar nuevas librerías para el carrusel (resolver con React `useState`/`useEffect` y `framer-motion`/CSS ya existentes).

---

## 3. Especificación Funcional y Editorial

### 3.1. Home — Carrusel de Posicionamiento en el Hero
- **Mensaje 1 (Renderizado en HTML inicial / SSR para SEO y accesibilidad):**
  - Categoría: `ESTRATEGIA / TECNOLOGÍA / TRANSFORMACIÓN`
  - Titular: `Transformando la Estrategia en Realidad.`
  - Descripción: `Acompaño a empresas en la evolución de sus negocios, conectando estrategia, procesos y tecnología para generar resultados concretos.`
- **Mensaje 2:**
  - Categoría: `EFICIENCIA / PROCESOS / DIGITALIZACIÓN`
  - Titular: `Haciendo que la Tecnología genere Valor.`
  - Descripción: `Ayudo a organizaciones a simplificar operaciones, optimizar procesos e incorporar soluciones digitales que mejoran su competitividad.`
- **Mensaje 3:**
  - Categoría: `INNOVACIÓN / CRECIMIENTO / NUEVOS NEGOCIOS`
  - Titular: `Creando Nuevas Oportunidades de Negocio.`
  - Descripción: `Diseño estrategias para desarrollar productos, abrir canales comerciales y aprovechar la tecnología como motor de crecimiento.`
- **Comportamiento técnico del carrusel:**
  - Rotación automática cada `6000ms`.
  - Transición suave por opacidad y desplazamiento vertical sutil (`y: 10 -> 0`).
  - Altura estable del contenedor textual para evitar saltos de layout (`CLS = 0`).
  - Indicadores discretos de selección manual con soporte de teclado y `aria-label`.
  - Pausa automática en `onMouseEnter` / `onFocus` y al seleccionar manualmente.
  - Respeto de `prefers-reduced-motion` (desactiva rotación automática y desplazamientos si el usuario prefiere movimiento reducido).

### 3.2. Home — Tres Capacidades Destacadas
1. **Tarjeta 1:** `Estrategia y Negocio` — `Transformación, crecimiento y competitividad.` (`GARIcon name="strategy"`)
2. **Tarjeta 2:** `Procesos y Tecnología` — `Eficiencia, digitalización y automatización.` (`GARIcon name="transformation"`)
3. **Tarjeta 3:** `Innovación y Crecimiento` — `Nuevos productos, canales y modelos de negocio.` (`GARIcon name="innovation"`)

### 3.3. Perfil (`/about`)
- Sustituir la biografía principal por los 4 párrafos aprobados en la sección 5 de la directiva.
- Incorporar bloque de las 3 dimensiones profesionales (**Visión estratégica**, **Experiencia tecnológica**, **Orientación al negocio**) reutilizando `GARIcon` (`consulting`, `architecture`, `operations`).
- Preservar íntegramente el mapa de experiencia internacional, la línea de tiempo laboral con logotipos, el ecosistema y la formación académica real.

### 3.4. Capacidades (`/capabilities`) y Áreas de Enfoque
- Presentar las **6 Capacidades Principales** (6.1 a 6.6) con su descripción completa y lista de **Temas asociados**.
- Presentar la sección **Áreas de Enfoque — Segmentos y desafíos empresariales** con los 5 segmentos, destacando a **Seguros y servicios financieros** como especialización sectorial principal consolidada y diferenciando los ámbitos de aplicación transversal.

---

## 4. Verificación Automatizada
- Ejecutar `scripts/verify_positioning_update.py` para comprobar de extremo a extremo la presencia exacta de los textos obligatorios, la ausencia de librerías de íconos externas, el renderizado SSR del Mensaje 1 y la compilación limpia de Next.js (`npm run build`).


---

## 5. Ajustes Puntuales V3.1 — Perfil, Contacto, Carrusel Deportivo y Ecosistema Profesional

### 5.1. Perfil (`/about`) — Bloque de Credenciales Profesionales
- **Ubicación:** Inmediatamente debajo del encabezado (`.header`) y antes del contenido biográfico (`.bioGrid`).
- **Contenido exacto:**
  1. `Licenciado en Sistemas de Información`
  2. `Licenciado en Administración`
  3. `Posgrado en Derecho de Seguros`
  4. `Docente universitario, speaker y disertante`
- **Diseño:** Cinta/barra ejecutiva compacta en grafito, blanco y dorado GAR, utilizando recursos tipográficos/geométricos propios de la identidad GAR sin duplicar el aspecto de las tarjetas de Formación Académica ubicadas al pie de la página.

### 5.2. Contacto (`/contacto` y `POST /api/contact`) — Doble Envío y Diagnóstico Productivo
- **Mensaje A (Notificación interna):**
  - `From: info@gastonramos.com.ar`
  - `To: info@gastonramos.com.ar`
  - `Reply-To:` email validado del visitante.
  - Sin `CC` ni `BCC`.
  - `Subject: GAR — Nueva consulta desde el sitio web`
- **Mensaje B (Confirmación automática al visitante):**
  - `From: info@gastonramos.com.ar`
  - `To:` email validado del visitante.
  - `Reply-To: info@gastonramos.com.ar`
  - Sin `CC` ni `BCC`.
  - `Subject: Gracias por contactarme — Gastón Ramos`
  - Plantilla HTML responsive con identidad GAR + versión texto plano.
- **Diagnóstico de 8 puntos en Producción:** Verificar variables de entorno en Vercel, credenciales de proveedor, registros DNS/SPF/DMARC/MX de `gastonramos.com.ar`, Turnstile, logs/errores de `/api/contact`, rate limiting y deduplicación.

### 5.3. Intereses / Deporte (`/hobbies/sport`) — Aceleración del Carrusel Fotográfico
- Reducir la duración de la animación CSS `.marqueeTrack` al **50%** conservando la misma distancia recorrida (`translateX(calc(-100% - 1.5rem))`):
  - Desktop: `120s` → `60s`.
  - Mobile (`≤ 768px`): `80s` → `40s`.
- Agregar soporte explícito para `@media (prefers-reduced-motion: reduce)`.

### 5.4. Ecosistema Profesional (`src/components/ProfessionalEcosystem.module.css`) — Eliminación de Recuadros
- Eliminar fondos diferenciados, bordes, esquinas redondeadas de tarjeta y sombras en `.brandItem` (tanto en estado base como en `:hover` y `:focus-visible`).
- Mostrar los 4 logotipos (`Kopernicus Tech`, `InspeXiona`, `Tech Insurance`, `KPS Tech`) directamente sobre el fondo de la sección, conservando enlaces, proporciones, alineación horizontal equilibrada y efecto hover discreto por opacidad/escala.
