#!/usr/bin/env python3
"""
Deterministic script to inspect and fetch official brand logos and verified multimedia
items from kopernicus.tech, inspexiona.com.ar, techinsurance.com.ar, and kps.com.ar.
Saves intermediate inspection data in .tmp/ and official logos in public/images/brands/.
"""
import json
import re
import ssl
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TMP_DIR = ROOT / ".tmp"
BRANDS_DIR = ROOT / "public" / "images" / "brands"

SITES = {
    "kopernicus": "https://kopernicus.tech/",
    "kopernicus_ar": "https://www.kopernicus.com.ar/",
    "inspexiona": "https://inspexiona.com.ar/",
    "techinsurance": "https://techinsurance.com.ar/",
    "kps": "https://kps.com.ar/",
    "kopernicus_multimedia": "https://www.kopernicus.tech/multimedia",
    "kopernicus_ar_multimedia": "https://www.kopernicus.com.ar/multimedia",
}

CTX = ssl.create_default_context()
CTX.check_hostname = False
CTX.verify_mode = ssl.CERT_NONE

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    )
}


def fetch_html(url: str):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=20, context=CTX) as resp:
        final_url = resp.geturl()
        content_type = resp.headers.get("Content-Type", "")
        raw = resp.read()
        text = raw.decode("utf-8", errors="replace")
        return final_url, content_type, text


def extract_assets_and_links(base_url: str, html: str):
    imgs = re.findall(r'<img[^>]+src=["\']([^"\']+)["\'][^>]*>', html, re.I)
    svgs = re.findall(r'<svg[^>]*>.*?</svg>', html, re.I | re.S)
    og_image = re.findall(
        r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)["\']',
        html,
        re.I,
    )
    icons = re.findall(
        r'<link[^>]+rel=["\'][^"\']*icon[^"\']*["\'][^>]+href=["\']([^"\']+)["\']',
        html,
        re.I,
    )
    links = re.findall(
        r'<a[^>]+href=["\']([^"\']+)["\'][^>]*>(.*?)</a>', html, re.I | re.S
    )
    headings = re.findall(
        r'<h[1-4][^>]*>(.*?)</h[1-4]>', html, re.I | re.S
    )
    clean_headings = [
        re.sub(r"<[^>]+>", " ", h).strip() for h in headings if h.strip()
    ]
    clean_links = []
    for href, label in links:
        lbl = re.sub(r"<[^>]+>", " ", label).strip()
        lbl = re.sub(r"\s+", " ", lbl)
        if lbl or "logo" in href.lower():
            clean_links.append(
                {"href": urllib.parse.urljoin(base_url, href), "text": lbl[:160]}
            )

    return {
        "imgs": [urllib.parse.urljoin(base_url, i) for i in imgs],
        "og_image": [urllib.parse.urljoin(base_url, i) for i in og_image],
        "icons": [urllib.parse.urljoin(base_url, i) for i in icons],
        "inline_svg_count": len(svgs),
        "inline_svgs_sample": [s[:1500] for s in svgs[:6]],
        "headings": clean_headings[:40],
        "links": clean_links[:80],
    }


def main():
    TMP_DIR.mkdir(parents=True, exist_ok=True)
    BRANDS_DIR.mkdir(parents=True, exist_ok=True)

    report = {}
    for key, url in SITES.items():
        try:
            final_url, ctype, html = fetch_html(url)
            # Save raw HTML in .tmp for inspection
            (TMP_DIR / f"{key}.html").write_text(html, encoding="utf-8")
            info = extract_assets_and_links(final_url, html)
            info["status"] = "ok"
            info["final_url"] = final_url
            report[key] = info
        except Exception as e:
            report[key] = {"status": "error", "error": str(e), "url": url}

    report_path = TMP_DIR / "ecosystem_multimedia_report.json"
    report_path.write_text(
        json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    print(f"Report written to {report_path}")


if __name__ == "__main__":
    main()
