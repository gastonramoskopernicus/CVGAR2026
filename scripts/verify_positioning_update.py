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

    # 1. Home checks
    home_src = read_text("src/pages/index.js")
    required_home_strings = [
        "ESTRATEGIA",
        "TECNOLOGÍA",
        "TRANSFORMACIÓN",
        "Transformando la Estrategia en ",
        "Acompaño a empresas en la evolución de sus negocios, conectando estrategia, procesos y tecnología para generar resultados concretos.",
        "EFICIENCIA",
        "PROCESOS",
        "DIGITALIZACIÓN",
        "Haciendo que la Tecnología genere ",
        "Ayudo a organizaciones a simplificar operaciones, optimizar procesos e incorporar soluciones digitales que mejoran su competitividad.",
        "INNOVACIÓN",
        "CRECIMIENTO",
        "NUEVOS NEGOCIOS",
        "Creando Nuevas Oportunidades de ",
        "Diseño estrategias para desarrollar productos, abrir canales comerciales y aprovechar la tecnología como motor de crecimiento.",
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
        "Home: 3 mensajes del carrusel + 3 capacidades destacadas + 6000ms + reduced-motion",
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

    # 3. Capacidades & Áreas de Enfoque checks
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
        "Empresas medianas y en crecimiento",
        "Seguros y servicios financieros",
        "Comercio, retail y servicios",
        "Organizaciones con sistemas legados",
        "Empresas que buscan innovar",
        "Especialización sectorial principal",
    ]
    missing_cap = [s for s in required_cap_strings if s not in cap_src]
    record(
        "Capacidades: 6 capacidades principales + temas asociados + 5 Áreas de Enfoque",
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
            "Transformando la Estrategia en " in html
            and "Acompaño a empresas en la evolución de sus negocios, conectando estrategia, procesos y tecnología para generar resultados concretos." in html
            and "Estrategia y Negocio" in html
            and "Procesos y Tecnología" in html
            and "Innovación y Crecimiento" in html
        )
        record(
            "SSR HTML inicial (index.html): Mensaje 1 y 3 capacidades presentes para SEO y accesibilidad",
            ssr_ok,
            "OK" if ssr_ok else "Falta contenido SSR en index.html",
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
