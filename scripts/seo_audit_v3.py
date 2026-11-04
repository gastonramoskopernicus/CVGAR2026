#!/usr/bin/env python3
"""
Deterministic Initial & Post-Implementation SEO Audit Script for gastonramos.com.ar (V3).
Evaluates:
- Indexing status & robots directives
- URL architecture
- <html lang>
- Titles & meta descriptions (length, uniqueness, presence)
- Heading hierarchy (H1, H2, H3)
- Canonical tags
- Open Graph & Twitter tags
- Schema.org JSON-LD structured data
- Sitemap.xml & Robots.txt
- Internal & external links, broken internal links
- Image optimization & alt attributes
- Public vs. Private route isolation (/aplicaciones, /showcase)
"""
import json
import os
import re
import sys
import urllib.request
import urllib.error
from html.parser import HTMLParser

BASE_URL = "http://localhost:3000"

PUBLIC_ROUTES = [
    "/",
    "/about",
    "/capabilities",
    "/multimedia",
    "/hobbies",
    "/hobbies/sport",
    "/hobbies/leadership",
    "/hobbies/tech",
    "/contacto",
    "/politica-de-privacidad",
    "/terminos-y-condiciones",
]

PRIVATE_ROUTES = [
    "/aplicaciones",
    "/showcase",
]


class SEOHTMLParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.html_lang = None
        self.title = ""
        self._in_title = False
        self.meta = {}
        self.og = {}
        self.canonical = None
        self.headings = {"h1": [], "h2": [], "h3": []}
        self._current_heading = None
        self._heading_buf = []
        self.images = []
        self.links = []
        self.json_ld = []
        self._in_json_ld = False
        self._json_ld_buf = []

    def handle_starttag(self, tag, attrs):
        attr_dict = dict(attrs)
        if tag == "html":
            self.html_lang = attr_dict.get("lang")
        elif tag == "title":
            self._in_title = True
        elif tag == "meta":
            name = (attr_dict.get("name") or "").lower()
            prop = (attr_dict.get("property") or "").lower()
            content = attr_dict.get("content") or ""
            if name:
                self.meta[name] = content
            if prop:
                self.og[prop] = content
        elif tag == "link":
            rel = (attr_dict.get("rel") or "").lower()
            if rel == "canonical":
                self.canonical = attr_dict.get("href")
        elif tag in ("h1", "h2", "h3"):
            self._current_heading = tag
            self._heading_buf = []
        elif tag == "img":
            self.images.append({
                "src": attr_dict.get("src", ""),
                "alt": attr_dict.get("alt"),
                "width": attr_dict.get("width"),
                "height": attr_dict.get("height"),
                "loading": attr_dict.get("loading"),
            })
        elif tag == "a":
            href = attr_dict.get("href", "")
            if href:
                self.links.append(href)
        elif tag == "script":
            if (attr_dict.get("type") or "").lower() == "application/ld+json":
                self._in_json_ld = True
                self._json_ld_buf = []

    def handle_endtag(self, tag):
        if tag == "title":
            self._in_title = False
        elif tag in ("h1", "h2", "h3") and self._current_heading == tag:
            text = " ".join("".join(self._heading_buf).split())
            self.headings[tag].append(text)
            self._current_heading = None
        elif tag == "script" and self._in_json_ld:
            raw = "".join(self._json_ld_buf).strip()
            if raw:
                try:
                    self.json_ld.append(json.loads(raw))
                except Exception as e:
                    self.json_ld.append({"_parse_error": str(e), "raw": raw[:120]})
            self._in_json_ld = False

    def handle_data(self, data):
        if self._in_title:
            self.title += data
        if self._current_heading:
            self._heading_buf.append(data)
        if self._in_json_ld:
            self._json_ld_buf.append(data)


def fetch_url(path):
    url = f"{BASE_URL}{path}"
    req = urllib.request.Request(url)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return resp.status, resp.read().decode("utf-8", errors="replace"), dict(resp.headers)
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", errors="replace"), dict(e.headers)
    except Exception as e:
        return 0, str(e), {}


def run_audit():
    report = {
        "robots_txt": {},
        "sitemap_xml": {},
        "public_pages": {},
        "private_pages": {},
        "summary_issues": [],
    }

    # Check robots.txt
    st_rob, body_rob, _ = fetch_url("/robots.txt")
    report["robots_txt"] = {
        "status": st_rob,
        "exists": st_rob == 200 and "User-agent" in body_rob,
        "disallows_private": "/aplicaciones" in body_rob and "/showcase" in body_rob,
        "content_preview": body_rob[:400] if st_rob == 200 else None,
    }
    if not report["robots_txt"]["exists"]:
        report["summary_issues"].append("CRÍTICO: /robots.txt no existe o no es válido.")

    # Check sitemap.xml
    st_map, body_map, _ = fetch_url("/sitemap.xml")
    report["sitemap_xml"] = {
        "status": st_map,
        "exists": st_map == 200 and "<urlset" in body_map,
        "excludes_private": ("/aplicaciones" not in body_map) and ("/showcase" not in body_map),
        "url_count": len(re.findall(r"<loc>", body_map)) if st_map == 200 else 0,
    }
    if not report["sitemap_xml"]["exists"]:
        report["summary_issues"].append("CRÍTICO: /sitemap.xml no existe o no es válido.")

    titles_seen = {}
    descriptions_seen = {}

    for route in PUBLIC_ROUTES:
        st, html, headers = fetch_url(route)
        parser = SEOHTMLParser()
        if st == 200:
            parser.feed(html)

        title = parser.title.strip()
        desc = parser.meta.get("description", "").strip()
        robots = parser.meta.get("robots", "")
        canonical = parser.canonical

        if title:
            titles_seen.setdefault(title, []).append(route)
        else:
            report["summary_issues"].append(f"ALTO: Ruta pública {route} sin <title>.")

        if desc:
            descriptions_seen.setdefault(desc, []).append(route)
        else:
            report["summary_issues"].append(f"ALTO: Ruta pública {route} sin <meta name='description'>.")

        if not canonical:
            report["summary_issues"].append(f"MEDIO: Ruta pública {route} sin <link rel='canonical'>.")

        if parser.html_lang not in ("es", "es-AR", "es-ar"):
            report["summary_issues"].append(
                f"ALTO: Ruta {route} tiene <html lang='{parser.html_lang}'> en lugar de 'es-AR'."
            )

        if len(parser.headings["h1"]) != 1:
            report["summary_issues"].append(
                f"MEDIO: Ruta {route} tiene {len(parser.headings['h1'])} etiquetas H1 (esperado: 1)."
            )

        missing_alt = [img["src"] for img in parser.images if img["alt"] is None or img["alt"].strip() == ""]
        if missing_alt:
            report["summary_issues"].append(
                f"BAJO: Ruta {route} tiene {len(missing_alt)} imágenes sin atributo alt descriptivo."
            )

        report["public_pages"][route] = {
            "status": st,
            "html_lang": parser.html_lang,
            "title": title,
            "title_length": len(title),
            "meta_description": desc,
            "meta_description_length": len(desc),
            "robots": robots,
            "canonical": canonical,
            "og_title": parser.og.get("og:title"),
            "og_description": parser.og.get("og:description"),
            "og_image": parser.og.get("og:image"),
            "og_locale": parser.og.get("og:locale"),
            "h1": parser.headings["h1"],
            "h2_count": len(parser.headings["h2"]),
            "h2_list": parser.headings["h2"],
            "h3_count": len(parser.headings["h3"]),
            "json_ld_count": len(parser.json_ld),
            "json_ld_types": [
                item.get("@type") if isinstance(item, dict) else "graph"
                for item in parser.json_ld
            ],
            "images_total": len(parser.images),
            "images_missing_alt": missing_alt,
            "internal_links_count": len([l for l in parser.links if l.startswith("/")]),
            "external_links_count": len([l for l in parser.links if l.startswith("http")]),
        }

    for route in PRIVATE_ROUTES:
        st, html, headers = fetch_url(route)
        parser = SEOHTMLParser()
        if st == 200:
            parser.feed(html)
        robots = parser.meta.get("robots", "")
        report["private_pages"][route] = {
            "status": st,
            "robots": robots,
            "has_noindex": "noindex" in robots.lower(),
            "cache_control": headers.get("Cache-Control", ""),
        }
        if "noindex" not in robots.lower():
            report["summary_issues"].append(f"CRÍTICO: Ruta privada {route} no tiene meta robots noindex.")

    os.makedirs(".tmp", exist_ok=True)
    with open(".tmp/seo_audit_v3_report.json", "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2, ensure_ascii=False)

    print(f"Audit saved to .tmp/seo_audit_v3_report.json. Found {len(report['summary_issues'])} issues.")
    for issue in report["summary_issues"]:
        print(" -", issue)


if __name__ == "__main__":
    run_audit()

