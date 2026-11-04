#!/usr/bin/env python3
"""
Downloads official brand logos from kopernicus.tech, inspexiona.com.ar,
techinsurance.com.ar, and kps.com.ar into public/images/brands/, and extracts
verified multimedia/prensa/whitepaper items from kopernicus.tech.
"""
import json
import re
import ssl
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TMP_DIR = ROOT / ".tmp"
BRANDS_DIR = ROOT / "public" / "images" / "brands"

CTX = ssl.create_default_context()
CTX.check_hostname = False
CTX.verify_mode = ssl.CERT_NONE

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    )
}

LOGOS_TO_DOWNLOAD = {
    "kopernicus.svg": "https://www.kopernicus.tech/kopernicus.svg",
    "kopernicus.png": "https://www.kopernicus.tech/kopernicus.png",
    "inspexiona-white.png": "https://www.inspexiona.com.ar/brand/inspexiona-logo-official-white.png",
    "inspexiona.png": "https://www.kopernicus.tech/inspexiona-logo.png",
    "techinsurance.svg": "https://www.kopernicus.tech/TechInsurance_logo.svg",
    "techinsurance-alt.svg": "https://www.techinsurance.com.ar/TechInsurance.svg",
    "kps-white.png": "https://kps.com.ar/img/logo-w.png",
    "kps.png": "https://kps.com.ar/img/logo.png",
}

EXTRA_PAGES = {
    "prensa": "https://www.kopernicus.tech/prensa",
    "whitepapers": "https://www.kopernicus.tech/whitepapers",
}


def download_file(url: str, dest: Path):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=20, context=CTX) as resp:
        data = resp.read()
        dest.write_bytes(data)
        return len(data)


def main():
    BRANDS_DIR.mkdir(parents=True, exist_ok=True)
    TMP_DIR.mkdir(parents=True, exist_ok=True)

    downloaded = {}
    for filename, url in LOGOS_TO_DOWNLOAD.items():
        try:
            dest = BRANDS_DIR / filename
            size = download_file(url, dest)
            downloaded[filename] = {"status": "ok", "size": size, "url": url}
        except Exception as e:
            downloaded[filename] = {"status": "error", "error": str(e), "url": url}

    # Parse Next.js flight data or script tags in kopernicus_multimedia.html
    mm_html = (TMP_DIR / "kopernicus_multimedia.html").read_text(encoding="utf-8")
    # Find YouTube video IDs or URLs in multimedia HTML
    yt_ids = re.findall(r'(?:youtube\.com/embed/|youtu\.be/|youtube\.com/watch\?v=|vi/)([A-Za-z0-9_-]{11})', mm_html)
    # Extract text blocks around h2/h3 in multimedia
    cards = re.findall(r'<h3[^>]*>(.*?)</h3>\s*<p[^>]*>(.*?)</p>', mm_html, re.I | re.S)

    extra_data = {}
    for key, url in EXTRA_PAGES.items():
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=20, context=CTX) as resp:
                html = resp.read().decode("utf-8", errors="replace")
                (TMP_DIR / f"kopernicus_{key}.html").write_text(html, encoding="utf-8")
                headings = [
                    re.sub(r"<[^>]+>", " ", h).strip()
                    for h in re.findall(r"<h[1-4][^>]*>(.*?)</h[1-4]>", html, re.I | re.S)
                ]
                links = re.findall(r'<a[^>]+href=["\']([^"\']+)["\'][^>]*>', html, re.I)
                extra_data[key] = {"headings": headings, "links": links[:60]}
        except Exception as e:
            extra_data[key] = {"error": str(e)}

    summary = {
        "downloaded_logos": downloaded,
        "multimedia_youtube_ids": list(dict.fromkeys(yt_ids)),
        "multimedia_cards": [
            {
                "title": re.sub(r"<[^>]+>", "", t).strip(),
                "desc": re.sub(r"<[^>]+>", "", d).strip(),
            }
            for t, d in cards
        ],
        "extra_pages": extra_data,
    }
    out_file = TMP_DIR / "brands_and_multimedia_details.json"
    out_file.write_text(json.dumps(summary, indent=2, ensure_ascii=False), encoding="utf-8")
    print(json.dumps(downloaded, indent=2))


if __name__ == "__main__":
    main()

