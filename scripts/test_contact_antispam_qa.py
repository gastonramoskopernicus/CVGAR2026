#!/usr/bin/env python3
"""
Suite de pruebas QA obligatorias (14 escenarios) para:
GAR — Protección antispam y antiabuso del formulario de contacto.

Utiliza dobles de prueba deterministas en el proveedor de correo ('x-qa-mock-provider')
para no realizar envíos masivos reales durante las pruebas de carga y abuso.
"""

import concurrent.futures
import json
import os
import sys
import urllib.error
import urllib.request
import uuid

BASE_URL = os.environ.get("QA_BASE_URL", "http://localhost:3000")
API_URL = f"{BASE_URL}/api/contact"
PAGE_URL = f"{BASE_URL}/contacto"

QA_HEADERS = {
    "Content-Type": "application/json",
    "x-qa-test-suite": "gar-antispam-qa",
}


def post_contact(payload, extra_headers=None):
    headers = dict(QA_HEADERS)
    if extra_headers:
        headers.update(extra_headers)
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(API_URL, data=data, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=12) as resp:
            body = json.loads(resp.read().decode("utf-8"))
            return resp.status, body, dict(resp.headers)
    except urllib.error.HTTPError as e:
        raw = e.read().decode("utf-8")
        try:
            body = json.loads(raw)
        except Exception:
            body = {"raw": raw}
        return e.code, body, dict(e.headers)


def reset_qa_state():
    status, body, _ = post_contact({}, {"x-qa-action": "reset-state"})
    assert status == 200 and body.get("reset") is True, f"Fallo al resetear estado QA: {status} {body}"


def get_observability():
    status, body, _ = post_contact({}, {"x-qa-action": "read-observability"})
    assert status == 200 and "observability" in body, f"Fallo al leer observabilidad: {status} {body}"
    return body["observability"]


def fresh_token():
    return f"qa-valid-turnstile-token-{uuid.uuid4().hex}"


def run_all_tests():
    results = []

    def record(num, name, passed, detail):
        status_str = "PASS" if passed else "FAIL"
        print(f"[{status_str}] Prueba #{num:02d} — {name}: {detail}")
        results.append({"id": num, "name": name, "passed": passed, "detail": detail})
        if not passed:
            sys.exit(1)

    reset_qa_state()

    # =========================================================================
    # 1. Envío legítimo
    # =========================================================================
    tok1 = fresh_token()
    status, body, headers = post_contact(
        {
            "nombre": "María Eugenia Valor",
            "email": "mevalor@empresa.com.ar",
            "empresa": "Grupo Valor S.A.",
            "telefono": "+54 11 4555-0101",
            "mensaje": "Hola Gastón, necesitamos evaluar una consultoría en transformación digital.",
            "turnstileToken": tok1,
        },
        {"x-qa-test-ip": "190.10.1.1", "x-qa-mock-provider": "success"},
    )
    record(
        1,
        "Envío legítimo",
        status == 200 and body.get("ok") is True and body.get("providerAccepted") is True and bool(body.get("requestId")),
        f"HTTP {status}, providerAccepted={body.get('providerAccepted')}, requestId={body.get('requestId')}",
    )

    # =========================================================================
    # 2. Token Turnstile inválido
    # =========================================================================
    status, body, _ = post_contact(
        {
            "nombre": "Usuario Prueba",
            "email": "invalido@empresa.com.ar",
            "mensaje": "Consulta con token Turnstile inválido.",
            "turnstileToken": "QA_INVALID_TURNSTILE_TOKEN",
        },
        {"x-qa-test-ip": "190.10.1.2", "x-qa-mock-provider": "success"},
    )
    obs = get_observability()
    last_ev = obs["recentEvents"][0]
    record(
        2,
        "Token Turnstile inválido",
        status == 400
        and body.get("providerAccepted") is False
        and body.get("error") == "No pudimos enviar tu mensaje. Intentá nuevamente."
        and last_ev["technicalReason"] == "TURNSTILE_INVALID_TOKEN",
        f"HTTP {status}, reason={last_ev['technicalReason']} (sin exponer detalle al navegador)",
    )

    # =========================================================================
    # 3. Token expirado
    # =========================================================================
    status, body, _ = post_contact(
        {
            "nombre": "Usuario Prueba",
            "email": "expirado@empresa.com.ar",
            "mensaje": "Consulta con token Turnstile expirado.",
            "turnstileToken": "QA_EXPIRED_TURNSTILE_TOKEN",
        },
        {"x-qa-test-ip": "190.10.1.3", "x-qa-mock-provider": "success"},
    )
    obs = get_observability()
    last_ev = obs["recentEvents"][0]
    record(
        3,
        "Token expirado",
        status == 400
        and body.get("providerAccepted") is False
        and last_ev["technicalReason"] == "TURNSTILE_EXPIRED_TOKEN",
        f"HTTP {status}, reason={last_ev['technicalReason']}",
    )

    # =========================================================================
    # 4. Token reutilizado (Replay Attack con tok1 ya consumido en Prueba #1)
    # =========================================================================
    status, body, _ = post_contact(
        {
            "nombre": "Usuario Replay",
            "email": "replay@empresa.com.ar",
            "mensaje": "Intento de reutilizar el mismo token de Turnstile.",
            "turnstileToken": tok1,
        },
        {"x-qa-test-ip": "190.10.1.4", "x-qa-mock-provider": "success"},
    )
    obs = get_observability()
    last_ev = obs["recentEvents"][0]
    record(
        4,
        "Token reutilizado",
        status == 400
        and body.get("providerAccepted") is False
        and last_ev["technicalReason"] == "TURNSTILE_REUSED_TOKEN",
        f"HTTP {status}, reason={last_ev['technicalReason']}",
    )

    # =========================================================================
    # 5. Honeypot completado
    # =========================================================================
    status, body, _ = post_contact(
        {
            "nombre": "Bot Scraper",
            "email": "bot@spammer.org",
            "mensaje": "Buy cheap backlinks now!",
            "_trap": "http://spammer.org",
            "turnstileToken": fresh_token(),
        },
        {"x-qa-test-ip": "190.10.1.5", "x-qa-mock-provider": "success"},
    )
    obs = get_observability()
    last_ev = obs["recentEvents"][0]
    record(
        5,
        "Honeypot completado",
        status == 400
        and body.get("providerAccepted") is False
        and last_ev["technicalReason"] == "HONEYPOT_TRIGGERED",
        f"HTTP {status}, reason={last_ev['technicalReason']}, providerResult={last_ev['providerResult']}",
    )

    # =========================================================================
    # 6. Exceso de solicitudes por IP (Límite: 3 envíos cada 15 minutos)
    # =========================================================================
    ip_test = "190.10.2.100"
    statuses_ip = []
    for i in range(1, 5):
        st, bd, _ = post_contact(
            {
                "nombre": f"Visitante IP {i}",
                "email": f"visitante{i}@dominio{i}.com",
                "mensaje": f"Mensaje distinto número {i} desde la misma IP.",
                "turnstileToken": fresh_token(),
            },
            {"x-qa-test-ip": ip_test, "x-qa-mock-provider": "success"},
        )
        statuses_ip.append((st, bd))

    obs = get_observability()
    last_ev = obs["recentEvents"][0]
    record(
        6,
        "Exceso de solicitudes por IP",
        [s[0] for s in statuses_ip] == [200, 200, 200, 429]
        and statuses_ip[3][1].get("error") == "Se realizaron demasiados intentos. Por favor, volvé a probar más tarde."
        and last_ev["technicalReason"] == "RATE_LIMIT_IP_15M"
        and obs["counters"]["limitsReached"]["ip_15m"] >= 1,
        f"Secuencia HTTP {[s[0] for s in statuses_ip]}, mensaje 429 exacto, reason={last_ev['technicalReason']}",
    )

    # =========================================================================
    # 7. Exceso por email declarado (Límite: 3 envíos cada 60 minutos desde distintas IPs)
    # =========================================================================
    shared_email = "mismo.cliente@corporacion.com"
    statuses_email = []
    for i in range(1, 5):
        st, bd, _ = post_contact(
            {
                "nombre": f"Contacto {i}",
                "email": shared_email,
                "mensaje": f"Consulta distinta #{i} usando el mismo email declarado desde otra IP.",
                "turnstileToken": fresh_token(),
            },
            {"x-qa-test-ip": f"190.10.3.{i}", "x-qa-mock-provider": "success"},
        )
        statuses_email.append((st, bd))

    obs = get_observability()
    last_ev = obs["recentEvents"][0]
    record(
        7,
        "Exceso por email",
        [s[0] for s in statuses_email] == [200, 200, 200, 429]
        and statuses_email[3][1].get("error") == "Se realizaron demasiados intentos. Por favor, volvé a probar más tarde."
        and last_ev["technicalReason"] == "RATE_LIMIT_EMAIL_60M"
        and obs["counters"]["limitsReached"]["email_60m"] >= 1,
        f"Secuencia HTTP {[s[0] for s in statuses_email]} en IPs rotadas, reason={last_ev['technicalReason']}",
    )

    # =========================================================================
    # 8. Mensajes duplicados (Ventana de 30 minutos sobre hash normalizado)
    # =========================================================================
    dup_payload_1 = {
        "nombre": "Carlos Duplicado",
        "email": "carlos.dup@empresa.com",
        "mensaje": "Hola Gastón, necesito cotizar una asesoría estratégica.",
        "turnstileToken": fresh_token(),
    }
    dup_payload_2 = {
        "nombre": "  carlos   duplicado ",
        "email": "CARLOS.DUP@empresa.com",
        "mensaje": "Hola Gastón,   necesito cotizar una asesoría estratégica.",
        "turnstileToken": fresh_token(),
    }
    st1, _, _ = post_contact(dup_payload_1, {"x-qa-test-ip": "190.10.4.1", "x-qa-mock-provider": "success"})
    st2, bd2, _ = post_contact(dup_payload_2, {"x-qa-test-ip": "190.10.4.2", "x-qa-mock-provider": "success"})
    obs = get_observability()
    last_ev = obs["recentEvents"][0]
    record(
        8,
        "Mensajes duplicados",
        st1 == 200
        and st2 == 429
        and last_ev["technicalReason"] == "DUPLICATE_MESSAGE_30M"
        and obs["counters"]["limitsReached"]["duplicate_30m"] >= 1,
        f"Envío 1={st1}, Envío 2 normalizado idéntico={st2} ({last_ev['technicalReason']})",
    )

    # =========================================================================
    # 9. Manipulación de destinatarios y adjuntos (to, cc, bcc, from, template, attachments)
    # =========================================================================
    st_to, _, _ = post_contact(
        {
            "nombre": "Attacker",
            "email": "attacker@domain.com",
            "mensaje": "Intento de usar el formulario como open relay.",
            "to": "victim@external.com",
            "cc": "victim2@external.com",
            "turnstileToken": fresh_token(),
        },
        {"x-qa-test-ip": "190.10.5.1", "x-qa-mock-provider": "success"},
    )
    obs_to = get_observability()["recentEvents"][0]

    st_att, _, _ = post_contact(
        {
            "nombre": "Attacker",
            "email": "attacker@domain.com",
            "mensaje": "Intento de adjuntar binario.",
            "attachments": [{"filename": "malware.exe"}],
            "turnstileToken": fresh_token(),
        },
        {"x-qa-test-ip": "190.10.5.2", "x-qa-mock-provider": "success"},
    )
    obs_att = get_observability()["recentEvents"][0]

    record(
        9,
        "Manipulación de destinatarios",
        st_to == 400
        and obs_to["technicalReason"] == "RECIPIENT_OVERRIDE_FORBIDDEN"
        and st_att == 400
        and obs_att["technicalReason"] == "ATTACHMENTS_FORBIDDEN",
        f"Override to/cc HTTP {st_to} ({obs_to['technicalReason']}), Adjuntos HTTP {st_att} ({obs_att['technicalReason']})",
    )

    # =========================================================================
    # 10. Inyección de encabezados (CRLF Header Injection)
    # =========================================================================
    st_crlf, _, _ = post_contact(
        {
            "nombre": "Inyector\r\nBcc: spam@target.com",
            "email": "test@domain.com",
            "mensaje": "Prueba de inyección CRLF en encabezados.",
            "turnstileToken": fresh_token(),
        },
        {"x-qa-test-ip": "190.10.6.1", "x-qa-mock-provider": "success"},
    )
    obs_crlf = get_observability()["recentEvents"][0]
    record(
        10,
        "Inyección de encabezados",
        st_crlf == 400 and obs_crlf["technicalReason"] == "HEADER_INJECTION_DETECTED",
        f"HTTP {st_crlf}, reason={obs_crlf['technicalReason']}",
    )

    # =========================================================================
    # 11. Proveedor de correo no disponible
    # =========================================================================
    st_down, bd_down, _ = post_contact(
        {
            "nombre": "Lucía Gómez",
            "email": "lucia.gomez@empresa.com.ar",
            "mensaje": "Consulta legítima cuando el proveedor está caído.",
            "turnstileToken": fresh_token(),
        },
        {"x-qa-test-ip": "190.10.7.1", "x-qa-mock-provider": "unavailable"},
    )
    obs_down = get_observability()
    last_down = obs_down["recentEvents"][0]
    record(
        11,
        "Proveedor de correo no disponible",
        st_down == 502
        and bd_down.get("providerAccepted") is False
        and bd_down.get("error") == "No pudimos enviar tu mensaje. Intentá nuevamente."
        and obs_down["counters"]["deliveryFailures"] >= 1
        and last_down["validationResult"] == "PASS",
        f"HTTP {st_down}, error='{bd_down.get('error')}', deliveryFailures={obs_down['counters']['deliveryFailures']}",
    )

    # =========================================================================
    # 12. Solicitudes concurrentes (Semáforo MAX_CONCURRENT_DISPATCHES = 3)
    # =========================================================================
    def fire_concurrent(idx):
        return post_contact(
            {
                "nombre": f"Concurrente {idx}",
                "email": f"conc{idx}@empresa{idx}.com",
                "mensaje": f"Solicitud simultánea #{idx} para probar límite de concurrencia.",
                "turnstileToken": fresh_token(),
            },
            {"x-qa-test-ip": f"190.10.8.{idx}", "x-qa-mock-provider": "slow_success"},
        )

    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
        futures = [pool.submit(fire_concurrent, i) for i in range(1, 7)]
        conc_results = [f.result()[0] for f in futures]

    accepted_count = conc_results.count(200)
    throttled_count = conc_results.count(429)
    record(
        12,
        "Solicitudes concurrentes",
        accepted_count <= 3 and throttled_count >= 3 and (accepted_count + throttled_count == 6),
        f"6 envíos simultáneos -> {accepted_count} aceptados (máx 3 en paralelo) y {throttled_count} limitados con HTTP 429",
    )

    # =========================================================================
    # 13. Funcionamiento mobile
    # =========================================================================
    with urllib.request.urlopen(PAGE_URL, timeout=10) as resp:
        html_contacto = resp.read().decode("utf-8")

    css_path = os.path.join(os.getcwd(), "src", "styles", "Contact.module.css")
    with open(css_path, "r", encoding="utf-8") as f:
        css_content = f.read()

    has_viewport = 'name="viewport"' in html_contacto and "width=device-width" in html_contacto
    has_mobile_breakpoints = "@media (max-width: 1024px)" in css_content and "@media (max-width: 640px)" in css_content
    record(
        13,
        "Funcionamiento mobile",
        has_viewport and has_mobile_breakpoints,
        "Meta viewport responsive presente en /contacto y grillas adaptativas 1024px/640px verificadas en Contact.module.css",
    )

    # =========================================================================
    # 14. Accesibilidad del formulario
    # =========================================================================
    a11y_checks = {
        "label_nombre": 'for="nombre"' in html_contacto and 'id="nombre"' in html_contacto,
        "label_email": 'for="email"' in html_contacto and 'id="email"' in html_contacto,
        "label_empresa": 'for="empresa"' in html_contacto and 'id="empresa"' in html_contacto,
        "label_telefono": 'for="telefono"' in html_contacto and 'id="telefono"' in html_contacto,
        "label_mensaje": 'for="mensaje"' in html_contacto and 'id="mensaje"' in html_contacto,
        "honeypot_hidden": 'name="_trap"' in html_contacto and 'tabindex="-1"' in html_contacto.lower() and 'aria-hidden="true"' in html_contacto,
        "aria_required": 'aria-required="true"' in html_contacto,
    }
    all_a11y_ok = all(a11y_checks.values())
    record(
        14,
        "Accesibilidad del formulario",
        all_a11y_ok,
        f"Controles verificados: {json.dumps(a11y_checks)}",
    )

    # Verificación adicional de privacidad en observabilidad: cero PII cruda ni mensajes ni tokens
    final_obs_raw = json.dumps(get_observability())
    no_pii_leaked = (
        "mevalor@empresa.com.ar" not in final_obs_raw
        and "necesitamos evaluar una consultoría" not in final_obs_raw
        and tok1 not in final_obs_raw
    )
    assert no_pii_leaked, "ALERTA: Se detectó PII o token en el registro de observabilidad"
    print("\n[OK] Verificación de Privacidad en Observabilidad: 0 emails crudos, 0 mensajes y 0 tokens en logs.")
    print(f"[OK] 14/14 pruebas obligatorias superadas exitosamente.")


if __name__ == "__main__":
    run_all_tests()
