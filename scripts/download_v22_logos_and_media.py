#!/usr/bin/env python3
"""
Script determinista para descargar:
1. Logotipo oficial de KPS Tech (https://www.kpstech.com.ar/kpstech-blanco.png y favicon.png)
2. Logotipos oficiales verificables para la Trayectoria Profesional (Kopernicus, KPS Tech, Grupo Gaman, USAL, Axoft, PwC, Next Step).
3. Imágenes reales desde kopernicus.tech/prensa y miniaturas reales de YouTube para Multimedia.
"""

import ssl
import urllib.request
import urllib.parse
from pathlib import Path
from bs4 import BeautifulSoup
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
BRANDS_DIR = ROOT / "public" / "images" / "brands"
COMPANIES_DIR = ROOT / "public" / "images" / "companies"
THUMBS_DIR = ROOT / "public" / "thumbnails"
TMP_DIR = ROOT / ".tmp"

for d in (BRANDS_DIR, COMPANIES_DIR, THUMBS_DIR, TMP_DIR):
    d.mkdir(parents=True, exist_ok=True)

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "*/*",
}


def download_file(url, dest: Path):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=15, context=ctx) as resp:
        data = resp.read()
        dest.write_bytes(data)
        return len(data)


def main():
    # 1. KPS Tech Official Logo
    kps_targets = [
        ("https://www.kpstech.com.ar/kpstech-blanco.png", BRANDS_DIR / "kpstech-blanco.png"),
        ("https://www.kpstech.com.ar/favicon.png", BRANDS_DIR / "kpstech-icon.png"),
    ]
    for url, dst in kps_targets:
        try:
            sz = download_file(url, dst)
            print(f"[OK] KPS Tech asset descargado: {dst.name} ({sz} bytes)")
        except Exception as e:
            print(f"[ERR] {url}: {e}")

    # Copy KPS Tech logo to companies dir as well
    if (BRANDS_DIR / "kpstech-blanco.png").exists():
        (COMPANIES_DIR / "kpstech.png").write_bytes((BRANDS_DIR / "kpstech-blanco.png").read_bytes())

    # 2. Inspect Axoft & NextStep headers in detail to get their exact main logo
    try:
        req = urllib.request.Request("https://www.axoft.com/", headers=HEADERS)
        html = urllib.request.urlopen(req, timeout=12, context=ctx).read().decode("utf-8", errors="ignore")
        soup = BeautifulSoup(html, "html.parser")
        for img in soup.find_all("img"):
            src = img.get("src", "")
            if "axoft" in src.lower() or "logo" in src.lower():
                print("Axoft img candidate:", src, img.get("alt"))
    except Exception as e:
        print("Axoft check err:", e)

    try:
        req = urllib.request.Request("https://www.nextstep.com.ar/", headers=HEADERS)
        html = urllib.request.urlopen(req, timeout=12, context=ctx).read().decode("utf-8", errors="ignore")
        soup = BeautifulSoup(html, "html.parser")
        header = soup.find("header") or soup.find("nav")
        if header:
            print("NextStep header:", header.prettify()[:1000])
    except Exception as e:
        print("NextStep check err:", e)

    # 3. Download verified company logos for Trayectoria
    company_downloads = [
        ("https://www.usal.edu.ar/wp-content/uploads/2023/07/Logo-Blanco.png", COMPANIES_DIR / "usal.png"),
        ("https://framerusercontent.com/images/c3EFcqkSX50StxNOJaVtaOQlFGQ.png", COMPANIES_DIR / "grupogaman.png"),
        ("https://www.axoft.com/img/logos/logo_TangoAISoftware-blanco.svg", COMPANIES_DIR / "axoft-tango.svg"),
        ("https://upload.wikimedia.org/wikipedia/commons/0/05/PricewaterhouseCoopers_Logo.svg", COMPANIES_DIR / "pwc.svg"),
    ]
    for url, dst in company_downloads:
        try:
            sz = download_file(url, dst)
            print(f"[OK] Company logo descargado: {dst.name} ({sz} bytes)")
        except Exception as e:
            print(f"[ERR] {url}: {e}")

    # 4. Download real press/article images from kopernicus.tech/prensa
    prensa_images = [
        "modernizacion-cores-seguros.jpg",
        "optimizacion-siniestros-vision-artificial.jpg",
        "potenciacion-canales-pas-eep.jpg",
        "resiliencia-transaccional-space-cloud.jpg",
        "ciberseguridad-gobierno-datos-seguros.jpg",
        "seguro-parametrico-automatizacion-oraculos.jpg",
        "kopernicus-se-integra-insurtechpy.jpg",
        "verdadera-velocidad-transformacion-digital.jpg",
        "y-si-el-riesgo-ya-no-fuera-incierto.jpg",
        "radiografia-mercado-asegurador-argentino.jpg",
    ]
    for img_name in prensa_images:
        url = f"https://www.kopernicus.tech/prensa/{img_name}"
        dst = THUMBS_DIR / img_name
        try:
            sz = download_file(url, dst)
            print(f"[OK] Prensa image descargada: {dst.name} ({sz} bytes)")
        except Exception as e:
            print(f"[ERR] {url}: {e}")


if __name__ == "__main__":
    main()

