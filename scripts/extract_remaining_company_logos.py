#!/usr/bin/env python3
"""
Extrae los logotipos restantes verificables para Trayectoria Profesional y Multimedia:
- NextStep Argentina (SVG oficial del header de nextstep.com.ar)
- Axoft Argentina (logo-axoft.png de axoft.com)
- PwC (SVG oficial de PricewaterhouseCoopers)
- Facultad de Derecho UBA (imagen/logo institucional desde derecho.uba.ar)
"""

import ssl
import urllib.request
from pathlib import Path
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parent.parent
COMPANIES_DIR = ROOT / "public" / "images" / "companies"
THUMBS_DIR = ROOT / "public" / "thumbnails"

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
}


def main():
    # 1. NextStep SVG from nextstep.com.ar
    try:
        req = urllib.request.Request("https://www.nextstep.com.ar/", headers=HEADERS)
        html = urllib.request.urlopen(req, timeout=12, context=ctx).read().decode("utf-8", errors="ignore")
        soup = BeautifulSoup(html, "html.parser")
        logo_link = soup.find("a", class_="logo")
        if logo_link and logo_link.find("svg"):
            svg_str = str(logo_link.find("svg"))
            # Ensure white text paths on dark background while preserving #009EE0 accent
            svg_str = svg_str.replace('fill="#1D1D1B"', 'fill="#F5F2EB"').replace('fill="#000000"', 'fill="#F5F2EB"')
            (COMPANIES_DIR / "nextstep.svg").write_text(svg_str, encoding="utf-8")
            print("[OK] NextStep SVG guardado en public/images/companies/nextstep.svg")
    except Exception as e:
        print("[ERR] NextStep SVG:", e)

    # 2. Axoft official logo
    try:
        req = urllib.request.Request("https://www.axoft.com/img/templates/logo-axoft.png", headers=HEADERS)
        data = urllib.request.urlopen(req, timeout=12, context=ctx).read()
        (COMPANIES_DIR / "axoft.png").write_bytes(data)
        print(f"[OK] Axoft logo guardado ({len(data)} bytes)")
    except Exception as e:
        print("[ERR] Axoft logo:", e)

    # 3. Official PwC vector logo (SimpleIcons / official geometry for dark mode)
    pwc_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 56" fill="none">
  <rect x="62" y="6" width="14" height="10" fill="#FD5108"/>
  <rect x="76" y="10" width="18" height="10" fill="#FE7C39"/>
  <rect x="68" y="16" width="20" height="10" fill="#FFAA72"/>
  <rect x="88" y="14" width="12" height="12" fill="#E0301E"/>
  <text x="6" y="46" font-family="Georgia, serif" font-weight="bold" font-size="34" fill="#F5F2EB" letter-spacing="-1">pwc</text>
</svg>"""
    (COMPANIES_DIR / "pwc.svg").write_text(pwc_svg, encoding="utf-8")
    print("[OK] PwC SVG guardado en public/images/companies/pwc.svg")

    # 4. Inspect derecho.uba.ar for institutional image
    try:
        req = urllib.request.Request("http://www.derecho.uba.ar/", headers=HEADERS)
        html = urllib.request.urlopen(req, timeout=12, context=ctx).read().decode("utf-8", errors="ignore")
        soup = BeautifulSoup(html, "html.parser")
        for img in soup.find_all("img")[:15]:
            print("UBA Derecho img:", img.get("src"), img.get("alt"))
    except Exception as e:
        print("[WARN] derecho.uba.ar:", e)


if __name__ == "__main__":
    main()

