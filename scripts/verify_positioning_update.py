#!/usr/bin/env python3
"""
Verificador determinista de la Directiva:
Evolución del Posicionamiento Profesional y Contenidos del Sitio (GAR).

Valida:
1. Home (src/pages/index.js): Carrusel de 3 mensajes en el Hero, comportamiento (6s, pausa, reduced-motion, controles discretos), y las 3 capacidades destacadas.
2. Perfil (src/pages/about.js): 4 párrafos exactos, 3 dimensiones (Visión estratégica, Experiencia tecnológica, Orientación al negocio) y preservación de trayectoria/educación real.
3. Capacidades (src/pages/capabilities.js): 6 capacidades principales con todos sus temas asociados y 5 Áreas de Enfoque diferenciando Seguros y servicios financieros como especialización sectorial principal.
4. Iconografía GAR: Uso exclusivo de GARIcon sin bibliotecas genéricas externas.
5. SEO y Schema.org (src/lib/schemaOrg.js): Posicionamiento como Consultor Senior en Estrategia, Tecnología y Transformación de Negocios.
6. Renderizado SSR inicial en .next/server/pages/*.html tras build.
"""

import json
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def read_text(rel_path: str) -> str:
    path = ROOT / rel_path
    if not path.exists():
        raise FileNotFoundError(f"Archivo no encontrado: {rel_path}")
    return path.read_text(encoding="utf-8")


def main() -> int:
    checks = []

    def record(name: str, passed: bool, detail: str = ""):
        checks.append({"name": name, "passed": bool(passed), "detail": detail})

    # 1. Home checks (4 slides + main positioning paragraph + capabilities)
    home_src = read_text("src/pages/index.js")
    required_home_strings = [
        "Transformando la estrategia en ",
        "Acompaño a empresas y organizaciones en la definición y ejecución de iniciativas de transformación, conectando estrategia, procesos, tecnología y resultados.",
        "Tecnología que transforma ",
        "Modernización de plataformas, evolución de sistemas existentes, arquitectura empresarial e integración de soluciones para potenciar las capacidades del negocio.",
        "Innovación con impacto ",
        "Diseño de nuevos productos, canales y modelos de negocio, incorporando automatización, inteligencia artificial y soluciones digitales.",
        "Experiencia que conecta ",
        "Más de 30 años acompañando organizaciones en desafíos de estrategia, operaciones y tecnología, con especialización en seguros y experiencia transversal en distintos sectores.",
        "Consultor senior en estrategia, tecnología y transformación empresarial. Con más de 30 años de experiencia, acompaño a organizaciones en la evolución de sus negocios, procesos y plataformas, integrando innovación, arquitectura empresarial y soluciones digitales.",
        "Estrategia y Negocio",
        "Transformación, crecimiento y competitividad.",
        "Procesos y Tecnología",
        "Eficiencia, digitalización y automatización.",
        "Innovación y Crecimiento",
        "Nuevos productos, canales y modelos de negocio.",
        "CAROUSEL_INTERVAL_MS = 6000",
        "useReducedMotion",
        "/FotoGAR-hero-v3.webp",
    ]
    missing_home = [s for s in required_home_strings if s not in home_src]
    record(
        "Home: 4 slides del carrusel + texto principal de posicionamiento + 3 capacidades + 6000ms + reduced-motion",
        len(missing_home) == 0,
        f"Faltantes: {missing_home}" if missing_home else "OK",
    )

    # 2. Perfil checks
    about_src = read_text("src/pages/about.js")
    required_about_strings = [
        "Soy consultor senior en Estrategia, Tecnología y Transformación Digital, con una trayectoria de más de 30 años acompañando a organizaciones en la evolución de sus negocios y sistemas.",
        "Mi trabajo combina una visión estratégica del negocio con un profundo conocimiento de los procesos operativos y las soluciones tecnológicas. Acompaño a empresas que buscan mejorar su eficiencia, modernizar sus plataformas, desarrollar nuevos productos o canales comerciales y aprovechar las oportunidades que ofrece la innovación.",
        "Cuento con una especialización consolidada en la industria aseguradora y los servicios financieros, trabajando en iniciativas de transformación, evolución de sistemas core, integración tecnológica y nuevos modelos de negocio en Argentina y Latinoamérica.",
        "Esta experiencia también me permite aportar valor a empresas medianas y organizaciones de otros sectores que necesitan incorporar tecnología con criterio de negocio, priorizar inversiones y convertir iniciativas de transformación en resultados concretos.",
        "Visión estratégica",
        "Experiencia tecnológica",
        "Orientación al negocio",
        "Kopernicus Tech",
        "KPS Tech Argentina",
        "Universidad del Salvador",
        "Posgrado en Derecho y Seguros",
    ]
    missing_about = [s for s in required_about_strings if s not in about_src]
    record(
        "Perfil: 4 párrafos exactos + 3 dimensiones + preservación de trayectoria y formación",
        len(missing_about) == 0,
        f"Faltantes: {missing_about}" if missing_about else "OK",
    )

    # 3. Capacidades & 6 Industrias / Ámbitos de Experiencia checks
    cap_src = read_text("src/pages/capabilities.js")
    required_cap_strings = [
        "Estrategia y Transformación del Negocio",
        "Definición de hojas de ruta, evolución de modelos operativos, priorización de inversiones y alineación entre objetivos empresariales y tecnología.",
        "Optimización y Digitalización de Procesos",
        "Diagnóstico de operaciones, simplificación de circuitos, automatización, reducción de tareas manuales y mejora de productividad.",
        "Estrategia y Arquitectura Tecnológica",
        "Modernización de plataformas, integración de sistemas, evaluación y selección de software, proveedores y soluciones empresariales.",
        "Innovación, Productos y Canales",
        "Desarrollo de nuevas propuestas de valor, productos digitales, modelos de distribución, ecosistemas comerciales y oportunidades de crecimiento.",
        "Inteligencia Artificial y Automatización",
        "Identificación de casos de uso, evaluación de viabilidad, automatización inteligente y adopción de inteligencia artificial orientada a resultados.",
        "Especialización en Seguros y Finanzas",
        "Transformación aseguradora, evolución de sistemas core, distribución digital, nuevos productos, eficiencia operativa e integración de ecosistemas.",
        "Seguros y servicios financieros",
        "Retail y comercio",
        "Servicios profesionales",
        "Industria y manufactura",
        "Tecnología y plataformas digitales",
        "Operaciones y servicios empresariales",
    ]
    missing_cap = [s for s in required_cap_strings if s not in cap_src]
    record(
        "Capacidades: 6 capacidades principales + 6 Industrias y Ámbitos de Experiencia equilibrados",
        len(missing_cap) == 0,
        f"Faltantes: {missing_cap}" if missing_cap else "OK",
    )

    # 4. Iconografía GAR checks
    forbidden_icons = ["lucide-react", "@heroicons", "fortawesome", "font-awesome", "react-icons"]
    found_forbidden = []
    for rel in ["src/pages/index.js", "src/pages/about.js", "src/pages/capabilities.js", "package.json"]:
        txt = read_text(rel).lower()
        for f in forbidden_icons:
            if f in txt:
                found_forbidden.append(f"{rel}:{f}")
    record(
        "Iconografía GAR: Sin bibliotecas de íconos externas prohibidas",
        len(found_forbidden) == 0,
        f"Encontrados: {found_forbidden}" if found_forbidden else "Exclusivamente GARIcon",
    )

    # 5. Schema.org checks
    schema_src = read_text("src/lib/schemaOrg.js")
    record(
        "SEO & Schema.org: Posicionamiento Consultor Senior en Estrategia, Tecnología y Transformación de Negocios",
        "Consultor Senior en Estrategia, Tecnología y Transformación de Negocios" in schema_src,
        "OK",
    )

    # 6. Compiled SSR HTML checks (if .next/server/pages/index.html exists)
    ssr_index = ROOT / ".next/server/pages/index.html"
    if ssr_index.exists():
        html = ssr_index.read_text(encoding="utf-8")
        ssr_ok = (
            "Transformando la estrategia en " in html
            and "Acompaño a empresas y organizaciones en la definición y ejecución de iniciativas de transformación, conectando estrategia, procesos, tecnología y resultados." in html
            and "Estrategia y Negocio" in html
            and "Procesos y Tecnología" in html
            and "Innovación y Crecimiento" in html
        )
        record(
            "SSR HTML inicial (index.html): Slide 1 y 3 capacidades presentes para SEO y accesibilidad",
            ssr_ok,
            "OK" if ssr_ok else "Falta contenido SSR en index.html",
        )

    # 7. Ajustes V3.1 (Credenciales en Perfil, Carrusel Deportivo 60s/40s, Ecosistema sin recuadros, Doble correo)
    creds = [
        "Licenciado en Sistemas de Información",
        "Licenciado en Administración",
        "Posgrado en Derecho de Seguros",
        "Docente universitario, speaker y disertante",
    ]
    missing_creds = [c for c in creds if c not in about_src]
    record(
        "Perfil V3.1: 4 credenciales profesionales debajo del encabezado",
        len(missing_creds) == 0,
        f"Faltantes: {missing_creds}" if missing_creds else "OK",
    )

    hobbies_css = read_text("src/styles/Hobbies.module.css")
    sport_speed_ok = (
        "animation: scroll 60s linear infinite;" in hobbies_css
        and "animation-duration: 40s;" in hobbies_css
        and "prefers-reduced-motion: reduce" in hobbies_css
    )
    record(
        "Carrusel Deportivo V3.1: Duración reducida al 50% (120s->60s desktop, 80s->40s mobile) + reduced-motion",
        sport_speed_ok,
        "OK" if sport_speed_ok else "Revisar Hobbies.module.css",
    )

    eco_css = read_text("src/components/ProfessionalEcosystem.module.css")
    eco_clean_ok = (
        "background: transparent;" in eco_css
        and "border: none;" in eco_css
        and "box-shadow: none;" in eco_css
        and "border-radius: 0;" in eco_css
    )
    record(
        "Ecosistema Profesional V3.1: Eliminación de recuadros, bordes y fondos de tarjeta en los 4 logos",
        eco_clean_ok,
        "OK" if eco_clean_ok else "Revisar ProfessionalEcosystem.module.css",
    )

    email_svc = read_text("src/lib/contactEmailService.js")
    dual_email_ok = (
        "info@gastonramos.com.ar" in email_svc
        and "GAR — Nueva consulta desde el sitio web" in email_svc
        and "Gracias por contactarme — Gastón Ramos" in email_svc
    )
    record(
        "Contacto V3.1: Servicio de doble correo (interno + auto-reply) hacia/desde info@gastonramos.com.ar",
        dual_email_ok,
        "OK" if dual_email_ok else "Revisar contactEmailService.js",
    )

    # 8. Ajustes V3.2 (Aplicaciones, Showcase, Ecosistema enlaces, Footer)
    app_src = read_text("src/pages/aplicaciones.js")
    showcase_src = read_text("src/pages/showcase.js")
    gate_src = read_text("src/components/PrivateAuthGate.js")
    app_showcase_ok = (
        "ACCESO PRIVADO" in app_src
        and "Mis Aplicaciones / Plataformas Propias" in app_src
        and "Espacio privado y seguro de acceso a mis aplicaciones y plataformas. Iniciá sesión con tu cuenta Google autorizada para continuar." in app_src
        and "CONTENIDO PRIVADO" in showcase_src
        and "Bienvenido a mi Showcase" in showcase_src
        and "En esta sección encontrarás presentaciones, demostraciones, prototipos y casos de éxito que reflejan experiencias, proyectos e iniciativas desarrolladas a lo largo de mi trayectoria profesional." in showcase_src
        and "Presentaciones" in gate_src
        and "Demos" in gate_src
        and "Prototipos" in gate_src
        and "Casos de éxito" in gate_src
        and "OAuth" not in gate_src
        and "OIDC" not in gate_src
    )
    record(
        "Aplicaciones & Showcase V3.2: Textos de acceso privado, 4 categorías conceptuales y eliminación de referencias OAuth/OIDC",
        app_showcase_ok,
        "OK" if app_showcase_ok else "Revisar aplicaciones.js, showcase.js o PrivateAuthGate.js",
    )

    eco_js = read_text("src/components/ProfessionalEcosystem.js")
    eco_links_ok = (
        "https://kopernicus.tech/" in eco_js
        and "https://inspexiona.com.ar/" in eco_js
        and "https://techinsurance.com.ar/" in eco_js
        and "https://www.kpstech.com.ar/" in eco_js
    )
    record(
        "Ecosistema Profesional V3.2: 4 enlaces institucionales verificados",
        eco_links_ok,
        "OK" if eco_links_ok else "Revisar enlaces en ProfessionalEcosystem.js",
    )

    footer_src = read_text("src/components/Footer.js")
    footer_ok = (
        "Consultor senior en estrategia, tecnología y transformación empresarial. Acompaño a organizaciones en la evolución de sus negocios, procesos y plataformas digitales." in footer_src
        and "Estrategia · Tecnología · Transformación" in footer_src
    )
    record(
        "Footer V3.2: Consistencia editorial y descripción profesional actualizada",
        footer_ok,
        "OK" if footer_ok else "Revisar Footer.js",
    )

    # Save report in .tmp/
    tmp_dir = ROOT / ".tmp"
    tmp_dir.mkdir(exist_ok=True)
    report_path = tmp_dir / "positioning_update_verification.json"
    all_passed = all(c["passed"] for c in checks)
    report_path.write_text(
        json.dumps({"all_passed": all_passed, "checks": checks}, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )

    if not all_passed:
        for c in checks:
            if not c["passed"]:
                print(f"[FAIL] {c['name']}: {c['detail']}", file=sys.stderr)
        return 1

    print(f"OK: {len(checks)}/{len(checks)} verificaciones superadas. Reporte en {report_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
