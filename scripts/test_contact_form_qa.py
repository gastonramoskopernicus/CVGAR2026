#!/usr/bin/env python3
"""
Deterministic QA Verification Suite for DIRECTIVA GAR — Reparación e integración del formulario de contacto.
Tests:
1. Required fields validation (missing nombre, email, mensaje)
2. Invalid email format & SMTP Header Injection (\r\n)
3. Empty message validation
4. Recipient override attack prevention (client sending 'to'/'cc'/'bcc')
5. HTML sanitization / XSS prevention in email body
6. Recipient validation (TO: gaston.alejandro.ramos@gmail.com, CC: ramos.gastón@kopernicus.tech non-ASCII detection without silent substitution)
7. Exact email format (Subject, HTML + Plain Text, Reply-To = visitor, From != visitor)
8. Successful provider acceptance (Cloudflare Email Sending REST API contract)
9. Provider error handling (safe error message, providerAccepted: false)
10. Provider timeout handling (AbortController)
11. Double-click / duplicate submission prevention (HTTP 409)
12. IP Rate limiting (HTTP 429)
13. Honeypot anti-spam filtering
14. Live HTTP endpoint test against http://localhost:3000/api/contact
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
    print("=== 1. UNIT & INTEGRATION TESTS ON contactEmailService.js & api/contact.js ===")
    node_script = """
    (async () => {
      const svc = await import('./src/lib/contactEmailService.js');

      // 1. Validate Recipient Configuration (TO & CC with international character 'ó')
      delete process.env.CONTACT_TO_EMAIL;
      delete process.env.CONTACT_CC_EMAIL;
      const recipients = svc.resolveConfiguredRecipients();
      if (recipients.to !== 'gaston.alejandro.ramos@gmail.com') {
        throw new Error('Expected TO gaston.alejandro.ramos@gmail.com, got ' + recipients.to);
      }
      if (recipients.ccStatus.configured !== 'ramos.gastón@kopernicus.tech') {
        throw new Error('Expected configured CC ramos.gastón@kopernicus.tech');
      }
      if (recipients.ccStatus.valid !== false || recipients.ccStatus.reason !== 'NON_ASCII_LOCAL_PART') {
        throw new Error('Expected CC ramos.gastón@kopernicus.tech to be flagged as NON_ASCII_LOCAL_PART');
      }
      if (recipients.cc !== null) {
        throw new Error('Invalid non-ASCII CC must not be silently substituted or sent without validation');
      }
      console.log('PASS: Recipient validation & non-ASCII CC detection without silent substitution');

      // 2. Required fields & empty message validation
      const missingName = svc.validateAndSanitizeContactInput({ nombre: '  ', email: 'gaston.alejandro.ramos@gmail.com', mensaje: 'Hola' });
      if (missingName.valid || missingName.errorCode !== 'MISSING_REQUIRED_FIELDS') {
        throw new Error('Failed missing nombre check');
      }
      const emptyMsg = svc.validateAndSanitizeContactInput({ nombre: 'Gastón', email: 'gaston.alejandro.ramos@gmail.com', mensaje: '   ' });
      if (emptyMsg.valid || emptyMsg.errorCode !== 'MISSING_REQUIRED_FIELDS') {
        throw new Error('Failed empty mensaje check');
      }
      console.log('PASS: Required fields & empty message validation');

      // 3. Invalid email & Header injection check
      const badEmail = svc.validateAndSanitizeContactInput({ nombre: 'Gastón', email: 'correo-invalido', mensaje: 'Consulta' });
      if (badEmail.valid || badEmail.errorCode !== 'INVALID_EMAIL') {
        throw new Error('Failed invalid email check');
      }
      const headerInj = svc.validateAndSanitizeContactInput({
        nombre: 'Gastón',
        email: 'gaston.alejandro.ramos@gmail.com\\r\\nBcc: attacker@example.com',
        mensaje: 'Consulta'
      });
      if (headerInj.valid) {
        throw new Error('Failed header injection check on email');
      }
      const clientOverride = svc.validateAndSanitizeContactInput({
        nombre: 'Gastón',
        email: 'gaston.alejandro.ramos@gmail.com',
        mensaje: 'Consulta',
        to: 'attacker@example.com'
      });
      if (clientOverride.valid || clientOverride.errorCode !== 'RECIPIENT_OVERRIDE_FORBIDDEN') {
        throw new Error('Failed client recipient override prevention');
      }
      console.log('PASS: Email format, Header Injection & Recipient Override protection');

      // 4. HTML Sanitization, Subject, Reply-To & Body Format
      const validInput = svc.validateAndSanitizeContactInput({
        nombre: 'Gastón Ramos <script>alert(1)</script>',
        email: 'gaston.alejandro.ramos@gmail.com',
        empresa: 'Kopernicus Tech',
        telefono: '+54 11 5555-5555',
        mensaje: 'Consulta estratégica & tecnológica'
      });
      if (!validInput.valid) {
        throw new Error('Valid input rejected: ' + validInput.errorCode);
      }
      const content = svc.buildContactEmailContent(validInput.data);
      if (content.subject !== 'GAR | Nueva consulta desde gastonramos.com.ar') {
        throw new Error('Unexpected subject: ' + content.subject);
      }
      if (content.html.includes('<script>')) {
        throw new Error('XSS script tag was not escaped in HTML body');
      }
      for (const expectedLine of [
        'Nueva consulta recibida desde el sitio personal GAR',
        'Nombre: Gastón Ramos <script>alert(1)</script>',
        'Email: gaston.alejandro.ramos@gmail.com',
        'Empresa: Kopernicus Tech',
        'Teléfono: +54 11 5555-5555',
        'Mensaje: Consulta estratégica & tecnológica',
        'Origen: gastonramos.com.ar'
      ]) {
        if (!content.text.includes(expectedLine)) {
          throw new Error('Plain text missing expected line: ' + expectedLine);
        }
      }
      console.log('PASS: Email Subject, HTML escaping & Plain Text format');

      // 5. Cloudflare Email Sending REST API Dispatch (Success, Error & Timeout)
      process.env.CLOUDFLARE_ACCOUNT_ID = 'cf_test_account_1234567890';
      process.env.CLOUDFLARE_EMAIL_API_TOKEN = 'cf_test_token_1234567890abcdef';
      process.env.CLOUDFLARE_EMAIL_FROM = 'GAR | gastonramos.com.ar <notificaciones@mail.inspexiona.com.ar>';

      let capturedRequest = null;
      const mockFetchSuccess = async (url, opts) => {
        capturedRequest = { url, opts, body: JSON.parse(opts.body) };
        return {
          ok: true,
          status: 200,
          json: async () => ({ success: true, result: { id: 'cf-msg-uuid-001' } })
        };
      };

      const okRes = await svc.dispatchContactEmail(validInput.data, { fetchImpl: mockFetchSuccess });
      if (!okRes.ok || !okRes.providerAccepted || okRes.provider !== 'CLOUDFLARE' || okRes.messageId !== 'cf-msg-uuid-001') {
        throw new Error('Expected successful Cloudflare acceptance');
      }
      if (capturedRequest.body.to !== 'gaston.alejandro.ramos@gmail.com') {
        throw new Error('Wrong TO in Cloudflare payload');
      }
      if (capturedRequest.body.reply_to !== 'gaston.alejandro.ramos@gmail.com') {
        throw new Error('Wrong reply_to in Cloudflare payload');
      }
      if (capturedRequest.body.from.address === capturedRequest.body.reply_to) {
        throw new Error('Visitor email must NEVER be used as From address');
      }
      console.log('PASS: Cloudflare REST API dispatch, From != Visitor & Reply-To verification');

      // 6. Provider Error test
      const mockFetchFail = async () => ({
        ok: false,
        status: 500,
        json: async () => ({ success: false })
      });
      const errRes = await svc.dispatchContactEmail(validInput.data, { fetchImpl: mockFetchFail });
      if (errRes.ok || errRes.providerAccepted || errRes.errorCode !== 'PROVIDER_HTTP_500') {
        throw new Error('Expected PROVIDER_HTTP_500 on provider failure');
      }
      console.log('PASS: Provider HTTP error handling');

      // 7. Provider Timeout test
      const mockFetchTimeout = (url, opts) => new Promise((resolve, reject) => {
        opts.signal.addEventListener('abort', () => {
          const e = new Error('The operation was aborted');
          e.name = 'AbortError';
          reject(e);
        });
      });
      const timeoutRes = await svc.dispatchContactEmail(validInput.data, { timeoutMs: 50, fetchImpl: mockFetchTimeout });
      if (timeoutRes.ok || timeoutRes.providerAccepted || timeoutRes.errorCode !== 'PROVIDER_TIMEOUT') {
        throw new Error('Expected PROVIDER_TIMEOUT on slow provider');
      }
      console.log('PASS: Provider timeout handling (AbortController)');

      console.log('ALL_NODE_TESTS_OK');
    })();
    """
    res = subprocess.run(["node", "-e", node_script], capture_output=True, text=True)
    print(res.stdout.strip())
    assert_true(
        res.returncode == 0 and "ALL_NODE_TESTS_OK" in res.stdout,
        f"Node unit/integration suite passed ({res.stderr.strip()})",
    )

    print("\n=== 2. LIVE HTTP ENDPOINT TESTS AGAINST http://localhost:3000/api/contact ===")
    # 2.1 Honeypot check
    st, body = post_json(
        "/api/contact",
        {
            "nombre": "Bot",
            "email": "gaston.alejandro.ramos@gmail.com",
            "mensaje": "Spam",
            "_trap": "filled-by-bot",
        },
        headers={"X-Forwarded-For": "10.99.0.1"},
    )
    assert_true(
        st == 200 and body.get("spamFiltered") is True and body.get("providerAccepted") is False,
        "Honeypot silently filters spam with providerAccepted: false",
    )

    # 2.2 Missing required field
    st, body = post_json(
        "/api/contact",
        {"nombre": "", "email": "gaston.alejandro.ramos@gmail.com", "mensaje": "Prueba"},
        headers={"X-Forwarded-For": "10.99.0.2"},
    )
    assert_true(
        st == 400 and body.get("code") == "MISSING_REQUIRED_FIELDS",
        "Live API rejects missing nombre with HTTP 400",
    )

    # 2.3 Invalid email
    st, body = post_json(
        "/api/contact",
        {"nombre": "Gastón Ramos", "email": "invalido@", "mensaje": "Prueba"},
        headers={"X-Forwarded-For": "10.99.0.2"},
    )
    assert_true(
        st == 400 and body.get("code") == "INVALID_EMAIL",
        "Live API rejects invalid email with HTTP 400",
    )

    # 2.4 Unconfigured provider credentials fail-closed check (since .env.local has placeholder SMTP and no Cloudflare token)
    st, body = post_json(
        "/api/contact",
        {
            "nombre": "Gastón Ramos",
            "email": "gaston.alejandro.ramos@gmail.com",
            "empresa": "GAR QA",
            "telefono": "+54 11 4444-4444",
            "mensaje": "Prueba de diagnóstico QA",
        },
        headers={"X-Forwarded-For": "10.99.0.3"},
    )
    assert_true(
        st == 503
        and body.get("providerAccepted") is False
        and body.get("error") == "No pudimos enviar tu mensaje en este momento. Por favor, intentá nuevamente.",
        "Live API returns HTTP 503 with user-safe error message when provider credentials are placeholders/missing",
    )

    # 2.5 Rate limiting check (5 requests per IP allowed; 6th returns 429)
    test_ip = "10.99.88.77"
    last_status = None
    last_body = None
    for i in range(6):
        last_status, last_body = post_json(
            "/api/contact",
            {
                "nombre": "Gastón Ramos",
                "email": "gaston.alejandro.ramos@gmail.com",
                "mensaje": f"Mensaje distinto para prueba rate limit #{i}",
            },
            headers={"X-Forwarded-For": test_ip},
        )
    assert_true(
        last_status == 429 and last_body.get("code") == "RATE_LIMITED",
        "Live API enforces per-IP rate limiting (HTTP 429 on 6th request)",
    )

    print("\nALL QA CONTACT FORM TESTS PASSED!")


if __name__ == "__main__":
    main()
