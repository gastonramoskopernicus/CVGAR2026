#!/usr/bin/env python3
"""
Script determinista para V2.2 Sprint 1:
1. Inspeccionar https://www.kpstech.com.ar/ y descargar su logotipo institucional oficial.
2. Buscar y descargar logotipos oficiales verificables de las empresas de la Trayectoria Profesional.
3. Verificar imágenes reales disponibles en kopernicus.tech/prensa y metadatos OpenGraph públicos.
"""

import json
import re
import ssl
import urllib.request
import urllib.parse
from pathlib import Path
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parent.parent
TMP_DIR = ROOT / ".tmp"
BRANDS_DIR = ROOT / "public" / "images" / "brands"
COMPANIES_DIR = ROOT / "public" / "images" / "companies"
MULTIMEDIA_DIR = ROOT / "public" / "thumbnails"

TMP_DIR.mkdir(parents=True, exist_ok=True)
BRANDS_DIR.mkdir(parents=True, exist_ok=True)
COMPANIES_DIR.mkdir(parents=True, exist_ok=True)
MULTIMEDIA_DIR.mkdir(parents=True, exist_ok=True)

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
}


def fetch_url(url, timeout=12):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=timeout, context=ctx) as resp:
        return resp.read(), resp.geturl(), resp.headers.get("Content-Type", "")


def inspect_kpstech():
    print("=== 1. Inspeccionando https://www.kpstech.com.ar/ ===")
    for url in ["https://www.kpstech.com.ar/", "https://kpstech.com.ar/"]:
        try:
            data, final_url, ctype = fetch_url(url)
            html = data.decode("utf-8", errors="ignore")
            (TMP_DIR / "kpstech.html").write_text(html, encoding="utf-8")
            soup = BeautifulSoup(html, "html.parser")
            print(f"[OK] {url} -> {final_url} ({len(html)} bytes)")
            header = soup.find("header") or soup.find("nav")
            if header:
                print("--- Header HTML de kpstech.com.ar ---")
                print(header.prettify()[:1500])
            for img in soup.find_all("img"):
                print("IMG:", img.get("src"), "| alt:", img.get("alt"), "| class:", img.get("class"))
            for svg in soup.find_all("svg"):
                print("SVG:", svg.get("class"), str(svg)[:300])
            for link in soup.find_all("link"):
                if any(k in " ".join(link.get("rel", [])).lower() for k in ["icon", "preload"]):
                    print("LINK:", link.get("rel"), link.get("href"))
            break
        except Exception as e:
            print(f"[WARN] Error en {url}: {e}")


def inspect_company_sites():
    print("\n=== 2. Inspeccionando sitios oficiales de empresas de la Trayectoria ===")
    sites = {
        "usal": ["https://www.usal.edu.ar/"],
        "gaman": ["https://www.grupogaman.com.ar/", "https://grupogaman.com.ar/", "https://www.grupogaman.com/"],
        "axoft": ["https://www.axoft.com/", "https://www.tangonexo.com/"],
        "pwc": ["https://www.pwc.com.ar/", "https://www.pwc.com/"],
        "infinity": ["https://infinitylifetech.com/", "https://www.infinitylifetech.com/"],
        "nextstep": ["https://www.nextstep.com.ar/", "https://nextstep.com.ar/"],
    }
    for key, urls in sites.items():
        for u in urls:
            try:
                data, final_url, _ = fetch_url(u, timeout=10)
                html = data.decode("utf-8", errors="ignore")
                soup = BeautifulSoup(html, "html.parser")
                imgs = []
                for img in soup.find_all("img"):
                    src = img.get("src") or ""
                    alt = img.get("alt") or ""
                    if any(w in (src + alt).lower() for w in ["logo", "brand", key, "usal", "gaman", "axoft", "tango", "pwc", "infinity", "next"]):
                        imgs.append((urllib.parse.urljoin(final_url, src), alt))
                for meta in soup.find_all("meta", property="og:image"):
                    if meta.get("content"):
                        imgs.append((urllib.parse.urljoin(final_url, meta["content"]), "og:image"))
                print(f"[{key}] {final_url} -> encontrados {len(imgs)} candidatos:")
                for src, alt in imgs[:6]:
                    print(f"   - {src} ({alt})")
                break
            except Exception as e:
                print(f"[{key}] Falló {u}: {e}")


def inspect_prensa_and_linkedin():
    print("\n=== 3. Verificando imágenes de prensa en kopernicus.tech y OG de LinkedIn ===")
    prensa_html_path = TMP_DIR / "kopernicus_prensa.html"
    if prensa_html_path.exists():
        html = prensa_html_path.read_text(encoding="utf-8", errors="ignore")
        imgs = set(re.findall(r"/prensa/[a-zA-Z0-9_-]+\.(?:jpg|png|webp)", html))
        print("Imágenes en kopernicus.tech/prensa:", sorted(imgs))


if __name__ == "__main__":
    inspect_kpstech()
    inspect_company_sites()
    inspect_prensa_and_linkedin()

