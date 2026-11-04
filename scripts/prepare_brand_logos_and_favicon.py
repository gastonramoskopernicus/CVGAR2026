#!/usr/bin/env python3
"""
Script determinista para:
1. Generar /public/favicon.ico con monograma GAR. y punto amarillo.
2. Adaptar /public/images/brands/kopernicus.png a fondo oscuro (/public/images/brands/kopernicus-dark.png)
   preservando el isotipo magenta original (#DA084B) e invirtiendo únicamente los píxeles negros del texto.
3. Inspeccionar el lockup oficial de TechInsurance en .tmp/techinsurance.html y extraer detalles de .tmp/kopernicus_multimedia.html.
"""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import re
import json
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parent.parent
BRANDS_DIR = ROOT / "public" / "images" / "brands"
TMP_DIR = ROOT / ".tmp"


def create_favicon_ico():
    img = Image.new("RGBA", (64, 64), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    # Rounded dark square
    draw.rounded_rectangle([(0, 0), (63, 63)], radius=14, fill=(13, 14, 17, 255), outline=(245, 183, 39, 90), width=2)
    # Draw simple crisp GAR. text using default or system font
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 21)
    except Exception:
        font = ImageFont.load_default()
    draw.text((6, 20), "GAR", fill=(245, 242, 235, 255), font=font)
    draw.ellipse([(51, 33), (58, 40)], fill=(245, 183, 39, 255))
    ico_path = ROOT / "public" / "favicon.ico"
    img.save(ico_path, format="ICO", sizes=[(64, 64), (32, 32), (16, 16)])
    print(f"[OK] Favicon ICO actualizado en {ico_path}")


def create_kopernicus_dark_logo():
    src = BRANDS_DIR / "kopernicus.png"
    dst = BRANDS_DIR / "kopernicus-dark.png"
    img = Image.open(src).convert("RGBA")
    pixels = img.load()
    w, h = img.size

    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            if a == 0:
                continue
            # Check if pixel is part of the magenta/red brain icon (high R relative to G and B)
            if r > 120 and (r - g) > 60:
                # Keep original magenta/red icon pixel untouched
                continue
            # Otherwise it is neutral dark/grey text ("KOPERNICUS" and "./Tech_for_the_Future")
            # Map dark luminance (0..255) to light warm white (245, 242, 235)
            lum = 0.299 * r + 0.587 * g + 0.114 * b
            if lum < 220:
                # Darker original pixels become brighter white on dark background
                inv = int(245 - (lum * 0.35))
                pixels[x, y] = (inv, int(inv * 0.99), int(inv * 0.96), a)

    img.save(dst, "PNG")
    print(f"[OK] Logo Kopernicus para fondo oscuro generado en {dst} ({w}x{h})")


def inspect_techinsurance_and_multimedia():
    ti_html_path = TMP_DIR / "techinsurance.html"
    if ti_html_path.exists():
        soup = BeautifulSoup(ti_html_path.read_text(encoding="utf-8", errors="ignore"), "html.parser")
        header = soup.find("header") or soup.find("nav")
        if header:
            print("=== TechInsurance Header HTML ===")
            print(header.prettify()[:1200])

    mm_html_path = TMP_DIR / "kopernicus_multimedia.html"
    if mm_html_path.exists():
        html = mm_html_path.read_text(encoding="utf-8", errors="ignore")
        soup = BeautifulSoup(html, "html.parser")
        print("=== Kopernicus Multimedia Links & Cards ===")
        for a in soup.find_all("a", href=True):
            txt = " ".join(a.get_text().split())
            href = a["href"]
            if any(k in href.lower() for k in ["youtu", "linkedin", "nota", "prensa", "multimedia", "http"]):
                print(f"LINK: {txt[:80]} -> {href}")
        # Also search for youtube embeds or video IDs in raw HTML
        yt_matches = re.findall(r'(?:youtube\.com/watch\?v=|youtu\.be/|youtube\.com/embed/)([A-Za-z0-9_-]{11})', html)
        print("YouTube IDs in kopernicus_multimedia.html:", set(yt_matches))


if __name__ == "__main__":
    create_favicon_ico()
    create_kopernicus_dark_logo()
    inspect_techinsurance_and_multimedia()
