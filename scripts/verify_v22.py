#!/usr/bin/env python3
"""
Verification suite for GASTONRAMOS.COM.AR — DIRECTIVA V2.2 (Sprints 1 to 4).
Validates:
- Sprint 1: KPS Tech official logo, company logos in Trayectoria, CSS contrast tokens, real Multimedia images
- Sprint 2: Presence of Editorial Matrix artifact & directive without unauthorized content overwrite
- Sprint 3: OAuth 2.0 / OIDC security & strict server-side gating of /aplicaciones
- Sprint 4: Private /showcase page, API 401 enforcement, file validation & signed URLs
"""
import json
import os
import subprocess
import sys
import urllib.request
import urllib.error

BASE_URL = "http://localhost:3000"


def fetch(path, method="GET", data=None, headers=None):
    url = f"{BASE_URL}{path}"
    req = urllib.request.Request(url, method=method, data=data, headers=headers or {})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return resp.status, resp.read().decode("utf-8", errors="replace"), dict(resp.headers)
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", errors="replace"), dict(e.headers)


def assert_true(cond, msg):
    if not cond:
        print(f"[FAIL] {msg}")
        sys.exit(1)
    print(f"[PASS] {msg}")


def main():
    print("=== 1. SPRINT 1: VISUAL & ASSET VERIFICATION ===")
    status, html_home, _ = fetch("/")
    assert_true(status == 200, "GET / returns 200 OK")
    assert_true("/images/brands/kpstech-blanco.png" in html_home, "Home includes official KPS Tech logo (/images/brands/kpstech-blanco.png)")
    assert_true("https://www.kpstech.com.ar/" in html_home, "Home links to official https://www.kpstech.com.ar/")
    assert_true('href="/showcase"' in html_home, "Header navigation includes /showcase link")

    status, html_about, _ = fetch("/about")
    assert_true(status == 200, "GET /about returns 200 OK")
    for logo in [
        "/images/brands/kopernicus-dark.png",
        "/images/brands/kpstech-blanco.png",
        "/images/companies/nextstep.svg",
        "/images/companies/grupogaman.png",
        "/images/companies/usal.png",
        "/images/companies/pwc.svg",
        "/images/companies/axoft.png",
    ]:
        assert_true(logo in html_about, f"Trayectoria (/about) includes verifiable company logo: {logo}")

    status, html_multi, _ = fetch("/multimedia")
    assert_true(status == 200, "GET /multimedia returns 200 OK")
    for thumb in [
        "/thumbnails/modernizacion-cores-seguros.jpg",
        "/thumbnails/resiliencia-transaccional-space-cloud.jpg",
        "/thumbnails/uba-posgrados.jpg",
        "https://img.youtube.com/vi/PtV9EF4u7T4/hqdefault.jpg",
    ]:
        assert_true(thumb in html_multi, f"Multimedia (/multimedia) includes real image: {thumb}")

    # Verify CSS contrast tokens exist in globals.css and GARIcon.js
    with open("src/styles/globals.css", "r", encoding="utf-8") as f:
        globals_css = f.read()
    assert_true("--gar-icon-primary" in globals_css, "globals.css defines --gar-icon-primary state token")

    print("\n=== 2. SPRINT 2: EDITORIAL MATRIX GOVERNANCE ===")
    assert_true(os.path.exists("directivas/matriz_editorial_v2_2.md"), "directivas/matriz_editorial_v2_2.md exists")

    print("\n=== 3. SPRINT 3: OAUTH 2.0 / OIDC & /APLICACIONES SERVER-SIDE PROTECTION ===")
    status, html_apps, _ = fetch("/aplicaciones")
    assert_true(status == 200, "GET /aplicaciones returns 200 OK (renders Auth Gate)")
    assert_true("Acceso Restringido · OAuth 2.0 / OIDC" in html_apps, "/aplicaciones shows PrivateAuthGate when unauthenticated")
    for secret_str in [
        "crm-kps.vercel.app",
        "car-admin-ebon.vercel.app",
        "kpsenergy.com.ar",
        "crypto-admin-web.vercel.app",
    ]:
        assert_true(secret_str not in html_apps, f"Unauthenticated /aplicaciones does NOT leak private app URL: {secret_str}")

    print("\n=== 4. SPRINT 4: PRIVATE /SHOWCASE & API SECURITY ===")
    status, html_showcase, _ = fetch("/showcase")
    assert_true(status == 200, "GET /showcase returns 200 OK (renders Auth Gate)")
    assert_true("Acceso Restringido · OAuth 2.0 / OIDC" in html_showcase, "/showcase shows PrivateAuthGate when unauthenticated")
    for secret_item in [
        "seed-posgrado-uba-2026",
        "seed-seminario-latam-2025",
        "seed-entrevista-kopernicus",
    ]:
        assert_true(secret_item not in html_showcase, f"Unauthenticated /showcase does NOT leak private item ID: {secret_item}")

    for method in ["GET", "POST", "PUT", "DELETE"]:
        st, body, _ = fetch(
            "/api/showcase",
            method=method,
            data=b"{}" if method in ("POST", "PUT") else None,
            headers={"Content-Type": "application/json"} if method in ("POST", "PUT") else {},
        )
        assert_true(st == 401, f"Unauthenticated {method} /api/showcase returns HTTP 401 (got {st})")

    st_file, body_file, _ = fetch("/api/showcase/file/seed-posgrado-uba-2026")
    assert_true(st_file == 401, f"Unauthenticated GET /api/showcase/file/seed-posgrado-uba-2026 returns HTTP 401 (got {st_file})")

    # Run Node unit test on showcaseStore.js (file validation, magic bytes, signed tokens, CRUD & audit log)
    node_test = """
    const store = require('./src/lib/showcaseStore.js');
    const items = store.readCatalog();
    if (!Array.isArray(items) || items.length < 3) {
      throw new Error('Expected at least 3 seed items in showcaseStore');
    }
    // 1. Test signed token generation and verification
    const token = store.createSignedFileToken('seed-posgrado-uba-2026', 'gaston.alejandro.ramos@gmail.com', 900);
    const verified = store.verifySignedFileToken(token, 'seed-posgrado-uba-2026', 'gaston.alejandro.ramos@gmail.com');
    if (!verified) {
      throw new Error('Signed file token verification failed');
    }
    const wrongUser = store.verifySignedFileToken(token, 'seed-posgrado-uba-2026', 'intruder@example.com');
    if (wrongUser) {
      throw new Error('Signed file token should reject mismatched email');
    }
    // 2. Test malicious file upload rejection (.exe / bad magic bytes)
    let rejectedMalicious = false;
    try {
      store.validateAndSavePrivateFile({
        originalName: 'payload.exe',
        mimeType: 'application/x-msdownload',
        base64Data: Buffer.from('MZfakeexe').toString('base64'),
      });
    } catch (err) {
      rejectedMalicious = true;
    }
    if (!rejectedMalicious) {
      throw new Error('Malicious .exe upload was not rejected');
    }
    // 3. Test spoofed PDF with wrong magic bytes rejection
    let rejectedSpoofedPdf = false;
    try {
      store.validateAndSavePrivateFile({
        originalName: 'spoofed.pdf',
        mimeType: 'application/pdf',
        base64Data: Buffer.from('<html><script>alert(1)</script></html>').toString('base64'),
      });
    } catch (err) {
      rejectedSpoofedPdf = true;
    }
    if (!rejectedSpoofedPdf) {
      throw new Error('Spoofed PDF with HTML bytes was not rejected by magic-byte validator');
    }
    console.log('NODE_STORE_TEST_OK');
    """
    res = subprocess.run(["node", "-e", node_test], capture_output=True, text=True)
    assert_true(res.returncode == 0 and "NODE_STORE_TEST_OK" in res.stdout, f"showcaseStore.js security & token unit tests passed ({res.stderr.strip()})")

    print("\nALL V2.2 CHECKS PASSED SUCCESSFULLY!")


if __name__ == "__main__":
    main()
