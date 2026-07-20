#!/usr/bin/env python3
"""
webhook-tool-python.py — Example webhook handler for a Voice Agent tool.

Demonstrates the full contract for a function-calling tool endpoint:

  * HMAC-SHA256 signature verification on every incoming POST
    (fails closed — untrusted requests get a 401).
  * JSON body parsing + light argument validation.
  * A canned business-logic step (look up a policy by number) that
    returns a JSON object back to the agent.
  * Correct response format so the agent knows what to say next.

Framework-free — uses only Python's standard library (http.server,
hmac, hashlib, json). No pip install required.

USAGE
-----
1. When you create the tool on your agent (via /agents/<id>/edit or
   POST /v1/agents/<id>/tools/), CreoleCentric returns the signing
   secret ONCE. Copy it into an env var:

     export WEBHOOK_SIGNING_SECRET='cc_webhook_...'

2. Start this server:

     python3 webhook-tool-python.py

3. Expose it to the public internet (any way that works — ngrok is
   the easiest):

     ngrok http 8080

   Copy the https://xxxx.ngrok-free.app URL and paste it as the
   tool's webhook_url on your agent.

4. Talk to your agent, ask something that should trigger the tool
   ("what's the status of policy P-0042?"), watch this terminal.

TOOL SCHEMA to register on the agent for this example
-----------------------------------------------------
  name: lookup_policy
  description: Look up an insurance policy by its policy number.
    Call this whenever the caller mentions a policy number or asks
    about a specific policy's status.
  parameters_schema:
    {
      "type": "object",
      "properties": {
        "policy_number": {
          "type": "string",
          "description": "The policy number (e.g. 'P-0042')."
        }
      },
      "required": ["policy_number"]
    }
"""
from __future__ import annotations

import hmac
import hashlib
import json
import os
import sys
from http.server import BaseHTTPRequestHandler, HTTPServer


PORT = int(os.environ.get('PORT', '8080'))
SIGNING_SECRET = os.environ.get('WEBHOOK_SIGNING_SECRET', '')

if not SIGNING_SECRET:
    print(
        '\n[!] WEBHOOK_SIGNING_SECRET is not set. The server will still '
        'start, but every request will fail HMAC verification.\n'
        '    Set it to the value CreoleCentric returned when you '
        'created the tool.\n',
        file=sys.stderr,
    )


# ============================================================================
# Business logic — replace this with your real backend lookup.
# ============================================================================

_FAKE_POLICIES = {
    'P-0042': {
        'holder': 'Marie Joseph',
        'plan': 'Family Health',
        'status': 'active',
        'premium_gourdes': 5000,
        'renewal_date': '2027-01-15',
    },
    'P-0100': {
        'holder': 'Jean Baptiste',
        'plan': 'Individual Auto',
        'status': 'pending renewal',
        'premium_gourdes': 3200,
        'renewal_date': '2026-08-01',
    },
}


def lookup_policy(policy_number: str) -> dict:
    policy = _FAKE_POLICIES.get(policy_number.upper())
    if not policy:
        return {'found': False, 'message': f'No policy found for {policy_number}.'}
    return {'found': True, **policy}


# ============================================================================
# HMAC verification — NON-NEGOTIABLE. Fail closed.
# ============================================================================

def verify_signature(request_body: bytes, header_value: str) -> bool:
    """Return True iff the header matches HMAC-SHA256(body) under our secret."""
    if not SIGNING_SECRET or not header_value:
        return False
    expected = hmac.new(
        SIGNING_SECRET.encode('utf-8'),
        request_body,
        hashlib.sha256,
    ).hexdigest()
    # Use compare_digest to guard against timing attacks.
    return hmac.compare_digest(expected, header_value)


# ============================================================================
# HTTP handler
# ============================================================================

class ToolWebhookHandler(BaseHTTPRequestHandler):

    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', '0'))
        body = self.rfile.read(content_length) if content_length else b''
        signature = self.headers.get('X-CreoleCentric-Signature', '')

        if not verify_signature(body, signature):
            self._log('HMAC verification FAILED — refusing request')
            self._respond(401, {'error': 'invalid_signature'})
            return

        try:
            payload = json.loads(body.decode('utf-8'))
        except json.JSONDecodeError:
            self._respond(400, {'error': 'invalid_json'})
            return

        # Payload shape (matches integrator guide):
        #   {
        #     "tool_name": "lookup_policy",
        #     "parameters": {"policy_number": "P-0042"},
        #     "session_id": "…",
        #     "agent_id": "…",
        #     "timestamp": "2026-07-20T…Z"
        #   }
        tool_name = payload.get('tool_name')
        params = payload.get('parameters') or {}
        session_id = payload.get('session_id', '?')

        self._log(f'tool={tool_name} session={session_id[:8]} args={params}')

        if tool_name == 'lookup_policy':
            policy_number = params.get('policy_number', '').strip()
            if not policy_number:
                self._respond(200, {'error': 'policy_number is required'})
                return
            result = lookup_policy(policy_number)
            self._respond(200, result)
            return

        self._respond(200, {'error': f'unknown_tool: {tool_name!r}'})

    def _respond(self, status: int, payload: dict) -> None:
        body = json.dumps(payload).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _log(self, msg: str) -> None:
        print(f'[{self.address_string()}] {msg}', flush=True)

    # Silence the default per-request access log — we're logging ourselves.
    def log_request(self, code='-', size='-'):
        pass


if __name__ == '__main__':
    server = HTTPServer(('0.0.0.0', PORT), ToolWebhookHandler)
    print(f'Voice-agent tool webhook listening on :{PORT}')
    print('Waiting for tool calls…\n')
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\nShutting down.')
        server.shutdown()
