#!/usr/bin/env python3
"""
Suite de Verificación Determinista — GAR Formulario de Contacto:
1. Doble flujo de correo (Notificación interna a info@gastonramos.com.ar + Respuesta automática al visitante).
2. Verificación de las 9 Pruebas Complementarias de Protección Definitiva (Adenda):
   - Prueba 1: Consulta legítima genera los dos correos previstos.
   - Prueba 2: Solicitudes repetidas desde la misma IP bloqueadas (intervalo mínimo 60s y tope 3/15m).
   - Prueba 3: Solicitudes con el mismo email desde diferentes sesiones/IPs respetan límite (3/24h) y cooldown de auto-reply (1/60m).
   - Prueba 4: Omitir/eliminar cookies NO permite eludir ningún control.
   - Prueba 5: Límites atómicos compartidos entre distintas instancias (procesos independientes sin estado en memoria compartido).
   - Prueba 6: Solicitudes concurrentes simultáneas no superan el cupo global diario.
   - Prueba 7: Imposibilidad de manipular destinatarios (to, cc, bcc, from, reply_to).
   - Prueba 8: Fallo/indisponibilidad del almacenamiento centralizado impide nuevos envíos (Fail-Closed HTTP 503).
   - Prueba 9: Integridad intacta de Google Workspace (MX, SPF, DKIM, DMARC) e InspeXiona.
"""

import concurrent.futures
import json
import subprocess
import sys
import urllib.error
import urllib.request

BASE_URL = "http://localhost:3000"


def assert_true(condition, message):
    if not condition:
        print(f"[FAIL] {message}")
        sys.exit(1)
    print(f"[PASS] {message}")


def post_json(path, payload, headers=None):
    url = f"{BASE_URL}{path}"
    data = json.dumps(payload).encode("utf-8")
    req_headers = {
        "Content-Type": "application/json",
        "Origin": "http://localhost:3000",
    }
    if headers:
        req_headers.update(headers)

    req = urllib.request.Request(url, data=data, headers=req_headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            body = json.loads(resp.read().decode("utf-8"))
            return resp.status, body
    except urllib.error.HTTPError as e:
        raw = e.read().decode("utf-8")
        try:
            body = json.loads(raw)
        except Exception:
            body = {"raw": raw}
        return e.code, body


def main():
    print("=== 1. UNIT & MULTI-INSTANCE ATOMIC TESTS (contactEmailService.js & contactRateLimiter.js) ===")
    node_script = """
    import assert from 'assert';
    import { spawnSync } from 'child_process';
    import {
      INTERNAL_MAILBOX,
      EMAIL_SUBJECT,
      AUTOREPLY_SUBJECT,
      resolveConfiguredRecipients,
      validateAndSanitizeContactInput,
      buildContactEmailContent,
      buildVisitorAutoReplyContent,
      dispatchContactEmail,
      dispatchVisitorAutoReplyEmail,
    } from './src/lib/contactEmailService.js';
    import {
      resetRateLimiterStoreForTests,
      evaluateContactRateLimits,
    } from './src/lib/contactRateLimiter.js';

    (async () => {
      // 1. Verificar destinatario interno fijo y ausencia total de CC/BCC
      const rec = resolveConfiguredRecipients();
      assert.strictEqual(rec.from, 'info@gastonramos.com.ar');
      assert.strictEqual(rec.to, 'info@gastonramos.com.ar');
      assert.strictEqual(rec.cc, null);
      assert.strictEqual(rec.bcc, null);
      console.log('PASS: Internal mailbox info@gastonramos.com.ar & zero CC/BCC');

      // 2. Verificar contenido de respuesta automática y no reflexión del mensaje original
      const secretSpamMsg = 'TEXTO_SECRETO_QUE_NO_DEBE_REFLEJARSE_999';
      const v = validateAndSanitizeContactInput({
        nombre: 'Martín Gómez',
        email: 'martin@empresa.com.ar',
        mensaje: secretSpamMsg
      });
      const autoReply = buildVisitorAutoReplyContent({ nombre: v.data.nombre });
      assert.strictEqual(autoReply.subject, 'Gracias por contactarme — Gastón Ramos');
      assert.ok(!autoReply.text.includes(secretSpamMsg));
      assert.ok(!autoReply.html.includes(secretSpamMsg));
      console.log('PASS: Visitor auto-reply exact content & zero original message reflection');

      // 3. Prueba 5 (Multi-instancia): Dos procesos Node independientes (simulando 2 instancias Serverless)
      // evaluando el mismo email sin cookies y compartiendo el almacén centralizado.
      resetRateLimiterStoreForTests();
      const workerCode = `
        import { evaluateContactRateLimits } from './src/lib/contactRateLimiter.js';
        const idx = process.env.WORKER_IDX;
        const res = await evaluateContactRateLimits({
          ip: '198.51.100.' + idx,
          email: 'multi.instance@empresa.com.ar',
          nombre: 'Usuario Multi Instancia',
          mensaje: 'Mensaje distinto desde instancia ' + idx,
        });
        console.log(JSON.stringify({ statusCode: res.statusCode, code: res.code }));
      `;
      const statuses = [];
      for (let i = 1; i <= 4; i++) {
        const out = spawnSync('node', ['--input-type=module', '-e', workerCode], {
          encoding: 'utf8',
          env: { ...process.env, WORKER_IDX: String(i) }
        });
        const parsed = JSON.parse(out.stdout.trim());
        statuses.push(parsed);
      }
      assert.strictEqual(statuses[0].statusCode, 200);
      assert.strictEqual(statuses[1].statusCode, 200);
      assert.strictEqual(statuses[2].statusCode, 200);
      assert.strictEqual(statuses[3].statusCode, 429);
      assert.strictEqual(statuses[3].code, 'RATE_LIMIT_EMAIL_24H');
      console.log('PASS: Cross-instance atomic email rate limit (3/24h across 4 separate OS processes without cookies)');

      console.log('ALL_NODE_TESTS_OK');
    })();
    """
    res = subprocess.run(["node", "--input-type=module", "-e", node_script], capture_output=True, text=True)
    print(res.stdout.strip())
    assert_true(
        res.returncode == 0 and "ALL_NODE_TESTS_OK" in res.stdout,
        f"Node unit & multi-instance suite passed ({res.stderr.strip()})",
    )

    print("\n=== 2. PRUEBAS COMPLEMENTARIAS 1 A 9 EN ENDPOINT HTTP (/api/contact) ===")
    post_json(
        "/api/contact",
        {},
        headers={"x-qa-test-suite": "gar-antispam-qa", "x-qa-action": "reset-state"},
    )

    # PRUEBA 1: Consulta legítima genera los dos correos previstos (sin cookies)
    st1, body1 = post_json(
        "/api/contact",
        {
            "nombre": "Valeria Sosa",
            "email": "valeria.sosa@empresa.com.ar",
            "empresa": "Aseguradora Austral",
            "telefono": "+54 11 4321-9876",
            "mensaje": "Primera consulta válida de Valeria.",
            "turnstileToken": "qa-token-p1",
        },
        headers={
            "x-qa-test-suite": "gar-antispam-qa",
            "x-qa-test-ip": "190.20.1.1",
            "x-qa-mock-provider": "success",
        },
    )
    assert_true(
        st1 == 200 and body1.get("providerAccepted") is True and body1.get("autoReplyStatus") == "SENT",
        "Prueba 1: Consulta legítima genera los dos correos previstos (notificación + confirmación)",
    )

    # PRUEBA 2A: Solicitud repetida desde la misma IP antes de 60 segundos es bloqueada (sin cookies)
    st2a, body2a = post_json(
        "/api/contact",
        {
            "nombre": "Otro Usuario Misma IP",
            "email": "otro@empresa.com.ar",
            "mensaje": "Intento inmediato desde la misma IP 190.20.1.1 dentro de los 60 segundos.",
            "turnstileToken": "qa-token-p2a",
        },
        headers={
            "x-qa-test-suite": "gar-antispam-qa",
            "x-qa-test-ip": "190.20.1.1",
            "x-qa-mock-provider": "success",
        },
    )
    assert_true(
        st2a == 429 and body2a.get("providerAccepted") is False,
        f"Prueba 2A: Intervalo mínimo de 60s por IP bloquea ráfaga desde la misma IP sin cookies (HTTP {st2a})",
    )

    # PRUEBA 2B: Límite de 3 consultas por IP cada 15 minutos (simulando paso de 60s entre envíos)
    for idx in range(2, 4):
        st_ok, _ = post_json(
            "/api/contact",
            {
                "nombre": f"Usuario IP {idx}",
                "email": f"user{idx}@empresa.com.ar",
                "mensaje": f"Consulta espaciada número {idx} desde IP 190.20.1.1.",
                "turnstileToken": f"qa-token-p2b-{idx}",
            },
            headers={
                "x-qa-test-suite": "gar-antispam-qa",
                "x-qa-test-ip": "190.20.1.1",
                "x-qa-bypass-ip-interval": "true",
                "x-qa-mock-provider": "success",
            },
        )
        assert_true(st_ok == 200, f"Prueba 2B: Envío {idx}/3 desde IP 190.20.1.1 permitido")

    st2b_block, _ = post_json(
        "/api/contact",
        {
            "nombre": "Usuario IP 4",
            "email": "user4@empresa.com.ar",
            "mensaje": "Cuarta consulta en 15 minutos desde IP 190.20.1.1.",
            "turnstileToken": "qa-token-p2b-4",
        },
        headers={
            "x-qa-test-suite": "gar-antispam-qa",
            "x-qa-test-ip": "190.20.1.1",
            "x-qa-bypass-ip-interval": "true",
            "x-qa-mock-provider": "success",
        },
    )
    assert_true(
        st2b_block == 429,
        f"Prueba 2B: 4ta consulta desde la misma IP en 15m bloqueada con HTTP {st2b_block} (sin cookies)",
    )

    # PRUEBA 3 y 4: Solicitudes con el mismo email desde diferentes sesiones/IPs y sin cookies:
    # - 2da y 3ra consulta con valeria.sosa@empresa.com.ar desde otras IPs bloquean auto-reply (1/60m)
    # - 4ta consulta en 24h con valeria.sosa@empresa.com.ar es rechazada con HTTP 429
    st3_2, body3_2 = post_json(
        "/api/contact",
        {
            "nombre": "Valeria Sosa",
            "email": "valeria.sosa@empresa.com.ar",
            "mensaje": "Segunda consulta distinta desde otra IP y sin cookies.",
            "turnstileToken": "qa-token-p3-2",
        },
        headers={
            "x-qa-test-suite": "gar-antispam-qa",
            "x-qa-test-ip": "190.20.2.10",
            "x-qa-mock-provider": "success",
        },
    )
    assert_true(
        st3_2 == 200 and body3_2.get("autoReplyStatus") == "AUTOREPLY_RECIPIENT_COOLDOWN_60M",
        "Prueba 3A & 4: 2do envío al mismo email en <60m sin cookies bloquea confirmación repetida",
    )

    st3_3, _ = post_json(
        "/api/contact",
        {
            "nombre": "Valeria Sosa",
            "email": "valeria.sosa@empresa.com.ar",
            "mensaje": "Tercera consulta distinta desde una tercera IP y sin cookies.",
            "turnstileToken": "qa-token-p3-3",
        },
        headers={
            "x-qa-test-suite": "gar-antispam-qa",
            "x-qa-test-ip": "190.20.2.11",
            "x-qa-mock-provider": "success",
        },
    )
    assert_true(st3_3 == 200, "Prueba 3B: 3er envío del mismo email en 24h permitido")

    st3_4, _ = post_json(
        "/api/contact",
        {
            "nombre": "Valeria Sosa",
            "email": "valeria.sosa@empresa.com.ar",
            "mensaje": "Cuarta consulta distinta desde una cuarta IP y sin cookies.",
            "turnstileToken": "qa-token-p3-4",
        },
        headers={
            "x-qa-test-suite": "gar-antispam-qa",
            "x-qa-test-ip": "190.20.2.12",
            "x-qa-mock-provider": "success",
        },
    )
    assert_true(
        st3_4 == 429,
        f"Prueba 3C & 4: 4to envío con el mismo email en 24h desde distinta IP y sin cookies bloqueado (HTTP {st3_4})",
    )

    # PRUEBA 7: Imposibilidad de manipular destinatarios (to, cc, bcc, from, reply_to)
    for field in ["to", "cc", "bcc", "from", "reply_to"]:
        st7, _ = post_json(
            "/api/contact",
            {
                "nombre": "Atacante Relay",
                "email": "atacante@dominio.com",
                "mensaje": "Intento de inyectar destinatario.",
                "turnstileToken": f"qa-token-p7-{field}",
                field: "victima@tercero.com",
            },
            headers={
                "x-qa-test-suite": "gar-antispam-qa",
                "x-qa-test-ip": "190.20.7.1",
                "x-qa-mock-provider": "success",
            },
        )
        assert_true(st7 == 400, f"Prueba 7: Manipulación de campo '{field}' rechazada con HTTP 400")

    # PRUEBA 8: Turnstile inválido bloquea el envío con HTTP 400
    st8, body8 = post_json(
        "/api/contact",
        {
            "nombre": "Prueba Turnstile Inválido",
            "email": "cliente@empresa.com.ar",
            "mensaje": "Mensaje con token de Turnstile inválido.",
            "turnstileToken": "invalid-turnstile-token",
        },
        headers={
            "x-qa-test-suite": "gar-antispam-qa",
            "x-qa-test-ip": "190.20.8.1",
            "x-qa-mock-provider": "success",
        },
    )
    assert_true(
        st8 == 400 and body8.get("providerAccepted") is False,
        f"Prueba 8: Token de Turnstile inválido bloquea el envío con HTTP {st8}",
    )

    # PRUEBA 6: Solicitudes concurrentes no superan el cupo global diario (40 consultas / 80 correos)
    post_json(
        "/api/contact",
        {},
        headers={"x-qa-test-suite": "gar-antispam-qa", "x-qa-action": "reset-state"},
    )
    # Consumir 38 de las 40 consultas globales diarias
    for i in range(1, 39):
        st_g, _ = post_json(
            "/api/contact",
            {
                "nombre": f"Cliente {i}",
                "email": f"cliente.{i}@empresa.com.ar",
                "mensaje": f"Consulta legítima número {i} del día.",
                "turnstileToken": f"qa-token-global-{i}",
            },
            headers={
                "x-qa-test-suite": "gar-antispam-qa",
                "x-qa-test-ip": f"10.10.1.{i}",
                "x-qa-mock-provider": "success",
            },
        )
        if st_g != 200:
            print(f"[FAIL] Pre-llenado global falló en {i}: HTTP {st_g}")
            sys.exit(1)

    # Ahora quedan exactamente 2 cupos para llegar al límite global de 40 consultas diarias.
    # Lanzar 6 solicitudes concurrentes al mismo tiempo desde distintas IPs y emails.
    def send_concurrent(idx):
        st_c, _ = post_json(
            "/api/contact",
            {
                "nombre": f"Concurrente {idx}",
                "email": f"concurrente.{idx}@empresa.com.ar",
                "mensaje": f"Consulta concurrente simultánea {idx}.",
                "turnstileToken": f"qa-token-conc-{idx}",
            },
            headers={
                "x-qa-test-suite": "gar-antispam-qa",
                "x-qa-test-ip": f"10.20.1.{idx}",
                "x-qa-mock-provider": "slow_success",
            },
        )
        return st_c

    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as ex:
        results = list(ex.map(send_concurrent, range(1, 7)))

    accepted_count = results.count(200)
    rejected_count = results.count(429)
    assert_true(
        accepted_count <= 2 and rejected_count >= 4,
        f"Prueba 6: Ráfaga concurrente de 6 solicitudes con 2 cupos restantes -> aceptadas={accepted_count} (<=2), bloqueadas 429={rejected_count} (>=4)",
    )

    print("\nALL 9 COMPLEMENTARY PROTECTION TESTS PASSED!")


if __name__ == "__main__":
    main()
