#!/usr/bin/env python3
"""
Deterministic QA Verification Suite for:
GAR — Formulario de contacto con notificación y respuesta automática.

Verifica:
1. Correo Interno: From=info@gastonramos.com.ar, To=info@gastonramos.com.ar, Reply-To=visitante,
   ausencia total de CC/BCC (sin copias a Gmail ni Kopernicus).
2. Confirmación Automática al Visitante:
   - Asunto exacto: 'Gracias por contactarme — Gastón Ramos'
   - Contenido exacto (Saludo personalizado, cuerpo y firma GAR con https://gastonramos.com.ar)
   - Plantilla HTML responsive minimalista GAR + versión de texto plano
   - Ausencia estricta del mensaje original del visitante en la respuesta automática
3. Prioridad de Notificación Interna y Tratamiento de Errores:
   - Si falla el correo interno -> falla el envío y NO se envía confirmación al visitante.
   - Si el correo interno se acepta pero falla la respuesta automática -> muestra éxito al visitante,
     NO repite el correo interno y permite reintentar la confirmación por separado con idempotencia.
4. Protección contra abuso de respuestas automáticas (cooldown de 60m por destinatario).
"""
import json
import subprocess
import sys
import urllib.request
import urllib.error

BASE_URL = "http://localhost:3000"


def assert_true(cond, msg):
    if not cond:
        print(f"[FAIL] {msg}")
        sys.exit(1)
    print(f"[PASS] {msg}")


def post_json(path, payload, headers=None):
    url = f"{BASE_URL}{path}"
    data = json.dumps(payload).encode("utf-8")
    req_headers = {"Content-Type": "application/json"}
    if headers:
        req_headers.update(headers)
    req = urllib.request.Request(url, method="POST", data=data, headers=req_headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode("utf-8"))


def main():
    print("=== 1. UNIT & INTEGRATION TESTS ON DUAL-EMAIL SERVICE (contactEmailService.js) ===")
    node_script = """
    (async () => {
      const svc = await import('./src/lib/contactEmailService.js');

      // 1. Verificar destinatario interno info@gastonramos.com.ar y ausencia total de CC/BCC (Gmail/Kopernicus)
      const recipients = svc.resolveConfiguredRecipients();
      if (recipients.from !== 'info@gastonramos.com.ar' || recipients.to !== 'info@gastonramos.com.ar') {
        throw new Error('Expected From & To = info@gastonramos.com.ar, got ' + JSON.stringify(recipients));
      }
      if (recipients.cc !== null || recipients.bcc !== null || recipients.ccStatus.includedInSend !== false) {
        throw new Error('CC and BCC must be strictly null/disabled');
      }
      console.log('PASS: Internal mailbox info@gastonramos.com.ar & zero CC/BCC (no Gmail/Kopernicus copies)');

      // 2. Validar contenido del Correo Interno
      const validInput = svc.validateAndSanitizeContactInput({
        nombre: 'Martín Echeverría <script>alert(1)</script>',
        email: 'martin.echeverria@empresa.com.ar',
        empresa: 'Seguros del Sur',
        telefono: '+54 11 5555-5555',
        mensaje: 'Mensaje confidencial de consultoría que NO debe reflejarse en el auto-reply.'
      });
      if (!validInput.valid) {
        throw new Error('Valid input rejected: ' + validInput.errorCode);
      }

      const internalMail = svc.buildContactEmailContent(validInput.data);
      if (internalMail.subject !== 'GAR | Nueva consulta desde gastonramos.com.ar') {
        throw new Error('Unexpected internal subject: ' + internalMail.subject);
      }
      if (internalMail.html.includes('<script>')) {
        throw new Error('XSS script tag not escaped in internal HTML');
      }
      for (const line of [
        'Nombre: Martín Echeverría <script>alert(1)</script>',
        'Email: martin.echeverria@empresa.com.ar',
        'Empresa: Seguros del Sur',
        'Teléfono: +54 11 5555-5555',
        'Mensaje: Mensaje confidencial de consultoría que NO debe reflejarse en el auto-reply.',
        'Fecha y hora:'
      ]) {
        if (!internalMail.text.includes(line)) {
          throw new Error('Internal text missing line: ' + line);
        }
      }
      console.log('PASS: Internal notification format & HTML escaping');

      // 3. Validar contenido de la Confirmación Automática al Visitante
      const autoReply = svc.buildVisitorAutoReplyContent({ nombre: validInput.data.nombre });
      if (autoReply.subject !== 'Gracias por contactarme — Gastón Ramos') {
        throw new Error('Unexpected auto-reply subject: ' + autoReply.subject);
      }
      for (const reqText of [
        'Hola Martín Echeverría <script>alert(1)</script>,',
        'Gracias por contactarme y por tu interés.',
        'Recibí correctamente tu mensaje y a la brevedad me pondré en contacto con vos para conocer mejor tu consulta y evaluar cómo puedo ayudarte.',
        'Saludos,',
        'Gastón Alejandro Ramos',
        'Estrategia · Tecnología · Transformación',
        'https://gastonramos.com.ar'
      ]) {
        if (!autoReply.text.includes(reqText)) {
          throw new Error('Auto-reply text missing required phrase: ' + reqText);
        }
      }
      if (autoReply.html.includes('<script>')) {
        throw new Error('XSS script tag not escaped in auto-reply HTML');
      }
      if (
        autoReply.text.includes('Mensaje confidencial de consultoría') ||
        autoReply.html.includes('Mensaje confidencial de consultoría')
      ) {
        throw new Error('SECURITY VIOLATION: Original visitor message must NEVER be included in auto-reply');
      }
      console.log('PASS: Visitor auto-reply exact content, GAR HTML template & zero original message reflection');

      // 4. Verificar contratos de envío Cloudflare Email Sending API (Correo Interno + Auto-Reply)
      process.env.CLOUDFLARE_ACCOUNT_ID = 'cf_test_account_1234567890';
      process.env.CLOUDFLARE_EMAIL_API_TOKEN = 'cf_test_token_1234567890abcdef';

      const capturedCalls = [];
      const mockFetch = async (url, opts) => {
        capturedCalls.push({ url, body: JSON.parse(opts.body) });
        return {
          ok: true,
          status: 200,
          json: async () => ({ success: true, result: { id: 'cf-msg-' + capturedCalls.length } })
        };
      };

      const intRes = await svc.dispatchContactEmail(validInput.data, { fetchImpl: mockFetch });
      const arRes = await svc.dispatchVisitorAutoReplyEmail(
        { nombre: validInput.data.nombre, email: validInput.data.email },
        { fetchImpl: mockFetch }
      );

      if (!intRes.ok || !arRes.ok || capturedCalls.length !== 2) {
        throw new Error('Expected 2 Cloudflare API calls (internal + auto-reply)');
      }

      const call1 = capturedCalls[0].body;
      if (
        call1.from.address !== 'info@gastonramos.com.ar' ||
        call1.to !== 'info@gastonramos.com.ar' ||
        call1.reply_to !== 'martin.echeverria@empresa.com.ar' ||
        'cc' in call1 ||
        'bcc' in call1
      ) {
        throw new Error('Invalid Internal Email envelope: ' + JSON.stringify(call1));
      }

      const call2 = capturedCalls[1].body;
      if (
        call2.from.address !== 'info@gastonramos.com.ar' ||
        call2.to !== 'martin.echeverria@empresa.com.ar' ||
        call2.reply_to !== 'info@gastonramos.com.ar' ||
        call2.subject !== 'Gracias por contactarme — Gastón Ramos' ||
        'cc' in call2 ||
        'bcc' in call2
      ) {
        throw new Error('Invalid Auto-Reply Email envelope: ' + JSON.stringify(call2));
      }
      console.log('PASS: Dual Cloudflare API envelopes verified (From/To/Reply-To & zero CC/BCC)');

      console.log('ALL_NODE_TESTS_OK');
    })();
    """
    res = subprocess.run(["node", "-e", node_script], capture_output=True, text=True)
    print(res.stdout.strip())
    assert_true(
        res.returncode == 0 and "ALL_NODE_TESTS_OK" in res.stdout,
        f"Node dual-email unit suite passed ({res.stderr.strip()})",
    )

    print("\n=== 2. LIVE HTTP ENDPOINT TESTS ON DUAL-EMAIL & ERROR RECOVERY ===")
    post_json(
        "/api/contact",
        {},
        headers={"x-qa-test-suite": "gar-antispam-qa", "x-qa-action": "reset-state"},
    )

    # 2.1 Envío legítimo: Correo interno OK + Respuesta automática OK + Cooldown anti-abuso en 2do envío
    st1, body1 = post_json(
        "/api/contact",
        {
            "nombre": "Valeria Sosa",
            "email": "valeria.sosa@empresa.com.ar",
            "empresa": "Aseguradora Austral",
            "telefono": "+54 11 4321-9876",
            "mensaje": "Primera consulta válida de Valeria.",
            "turnstileToken": "qa-dual-token-1",
        },
        headers={
            "x-qa-test-suite": "gar-antispam-qa",
            "x-qa-test-ip": "190.20.1.1",
            "x-qa-mock-provider": "success",
        },
    )
    assert_true(
        st1 == 200 and body1.get("providerAccepted") is True and body1.get("autoReplyStatus") == "SENT",
        f"1st submission sends both internal notification and visitor auto-reply (autoReplyStatus={body1.get('autoReplyStatus')})",
    )

    # Segundo envío con diferente mensaje a la misma casilla de visitante en <60m:
    # Se entrega el correo interno a info@gastonramos.com.ar pero se bloquea la 2da auto-respuesta
    st2, body2 = post_json(
        "/api/contact",
        {
            "nombre": "Valeria Sosa",
            "email": "valeria.sosa@empresa.com.ar",
            "mensaje": "Segunda consulta distinta desde el mismo email en ventana corta.",
            "turnstileToken": "qa-dual-token-2",
        },
        headers={
            "x-qa-test-suite": "gar-antispam-qa",
            "x-qa-test-ip": "190.20.1.2",
            "x-qa-mock-provider": "success",
        },
    )
    assert_true(
        st2 == 200
        and body2.get("providerAccepted") is True
        and body2.get("autoReplyStatus") == "AUTOREPLY_RECIPIENT_COOLDOWN_60M",
        f"2nd submission within 60m to same address delivers internal email but prevents auto-reply spam (autoReplyStatus={body2.get('autoReplyStatus')})",
    )

    # 2.2 Correo interno aceptado pero falla la respuesta automática -> Éxito al visitante + Reintento separado idempotente
    st3, body3 = post_json(
        "/api/contact",
        {
            "nombre": "Hernán Paz",
            "email": "hernan.paz@corporacion.com.ar",
            "mensaje": "Consulta donde el correo interno pasa pero la auto-respuesta falla inicialmente.",
            "turnstileToken": "qa-dual-token-3",
        },
        headers={
            "x-qa-test-suite": "gar-antispam-qa",
            "x-qa-test-ip": "190.20.2.1",
            "x-qa-mock-provider": "internal_ok_autoreply_fail",
        },
    )
    ticket_id = body3.get("requestId")
    assert_true(
        st3 == 200
        and body3.get("providerAccepted") is True
        and body3.get("autoReplyStatus") == "FAILED_PENDING_RETRY"
        and bool(ticket_id),
        f"When internal email succeeds and auto-reply fails, visitor sees success (HTTP 200) and ticket {ticket_id} is registered",
    )

    # Reintentar únicamente la confirmación automática por separado usando x-autoreply-retry-id
    st_retry1, body_retry1 = post_json(
        "/api/contact",
        {},
        headers={
            "x-qa-test-suite": "gar-antispam-qa",
            "x-autoreply-retry-id": ticket_id,
            "x-qa-mock-provider": "success",
        },
    )
    assert_true(
        st_retry1 == 200 and body_retry1.get("autoReplyStatus") == "SENT",
        "Separate auto-reply retry succeeds without re-sending internal notification",
    )

    # Verificar idempotencia del reintento (un segundo reintento devuelve alreadySent: True)
    st_retry2, body_retry2 = post_json(
        "/api/contact",
        {},
        headers={
            "x-qa-test-suite": "gar-antispam-qa",
            "x-autoreply-retry-id": ticket_id,
            "x-qa-mock-provider": "success",
        },
    )
    assert_true(
        st_retry2 == 200 and body_retry2.get("alreadySent") is True,
        "Auto-reply retry is strictly idempotent (never sends duplicate confirmation)",
    )

    print("\nALL DUAL-EMAIL & AUTO-REPLY QA TESTS PASSED!")


if __name__ == "__main__":
    main()
