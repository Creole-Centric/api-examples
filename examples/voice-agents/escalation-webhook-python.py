#!/usr/bin/env python3
"""
escalation-webhook-python.py — Example receiver for Voice Agent
escalation POSTs.

When the agent's response contains a configured trigger marker
(e.g. `[escalate=true]`, `[emergency]`), CreoleCentric POSTs the
full session transcript + metadata to your escalation_config.webhook_url.
This example receives that POST, verifies the HMAC signature, and
forwards the transcript to a Slack Incoming Webhook so a human
picks it up.

Same framework-free approach as webhook-tool-python.py — only
stdlib is required.

USAGE
-----
  export ESCALATION_SIGNING_SECRET='cc_esc_...'   # from agent config
  export SLACK_WEBHOOK_URL='https://hooks.slack.com/services/...'
  python3 escalation-webhook-python.py

  ngrok http 8090

  # Register the ngrok URL as your agent's escalation_config.webhook_url.

Every escalation results in a formatted Slack message with:
  * The full transcript (user + agent turns, chronologically).
  * The resolved input language.
  * The tool-call log (which tools the agent invoked before giving up).
  * The trigger marker that caused the escalation.
  * A link back to the session for post-mortem.

The signing secret for escalation is separate from webhook-tool
secrets. Currently we reuse the tool signing pattern — set it via
`ESCALATION_SIGNING_SECRET` env var for this example.
"""
from __future__ import annotations

import hmac
import hashlib
import json
import os
import sys
import urllib.request
from http.server import BaseHTTPRequestHandler, HTTPServer


PORT = int(os.environ.get('PORT', '8090'))
SIGNING_SECRET = os.environ.get('ESCALATION_SIGNING_SECRET', '')
SLACK_WEBHOOK_URL = os.environ.get('SLACK_WEBHOOK_URL', '')

if not SIGNING_SECRET:
    print(
        '\n[!] ESCALATION_SIGNING_SECRET not set — every request will '
        'fail HMAC verification. Set it to the signing secret from your '
        'agent config.\n', file=sys.stderr,
    )
if not SLACK_WEBHOOK_URL:
    print(
        '\n[!] SLACK_WEBHOOK_URL not set — escalations will only be '
        'logged to stdout, not forwarded to Slack. Set it to a Slack '
        'Incoming Webhook URL to enable forwarding.\n', file=sys.stderr,
    )


def verify_signature(request_body: bytes, header_value: str) -> bool:
    if not SIGNING_SECRET or not header_value:
        return False
    expected = hmac.new(
        SIGNING_SECRET.encode('utf-8'),
        request_body,
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(expected, header_value)


def format_slack_message(escalation: dict) -> dict:
    """Build a Slack Block Kit payload from the escalation record."""
    transcript_lines = []
    for turn in escalation.get('transcript', []):
        role = turn.get('role', '?')
        text = turn.get('text', '')
        transcript_lines.append(f'*{role}*: {text}')
    transcript_body = '\n'.join(transcript_lines) or '_(empty transcript)_'

    tool_calls = escalation.get('tool_calls', [])
    tool_summary = (
        '\n'.join(f'  • `{tc.get("name","?")}` — {tc.get("result","?")}'
                  for tc in tool_calls)
        if tool_calls else '_(no tools invoked)_'
    )

    trigger = escalation.get('trigger_marker', '?')
    lang = escalation.get('language_resolved', '?')
    session_id = escalation.get('session_id', '?')
    agent_id = escalation.get('agent_id', '?')

    return {
        'blocks': [
            {
                'type': 'header',
                'text': {'type': 'plain_text', 'text': f'🚨 Voice Agent escalation ({trigger})'},
            },
            {
                'type': 'section',
                'fields': [
                    {'type': 'mrkdwn', 'text': f'*Agent:*\n`{agent_id}`'},
                    {'type': 'mrkdwn', 'text': f'*Session:*\n`{session_id}`'},
                    {'type': 'mrkdwn', 'text': f'*Language:*\n{lang}'},
                    {'type': 'mrkdwn', 'text': f'*Turns:*\n{len(escalation.get("transcript", []))}'},
                ],
            },
            {
                'type': 'section',
                'text': {'type': 'mrkdwn', 'text': f'*Transcript:*\n{transcript_body}'},
            },
            {
                'type': 'section',
                'text': {'type': 'mrkdwn', 'text': f'*Tool calls:*\n{tool_summary}'},
            },
        ]
    }


def forward_to_slack(escalation: dict) -> None:
    if not SLACK_WEBHOOK_URL:
        return
    payload = json.dumps(format_slack_message(escalation)).encode('utf-8')
    req = urllib.request.Request(
        SLACK_WEBHOOK_URL,
        data=payload,
        headers={'Content-Type': 'application/json'},
    )
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            resp.read()
    except Exception as exc:  # noqa: BLE001
        print(f'[slack] forward failed: {exc}', flush=True)


class EscalationHandler(BaseHTTPRequestHandler):

    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', '0'))
        body = self.rfile.read(content_length) if content_length else b''
        signature = self.headers.get('X-CreoleCentric-Signature', '')

        if not verify_signature(body, signature):
            self._log('HMAC verification FAILED — refusing request')
            self._respond(401, {'error': 'invalid_signature'})
            return

        try:
            escalation = json.loads(body.decode('utf-8'))
        except json.JSONDecodeError:
            self._respond(400, {'error': 'invalid_json'})
            return

        session_id = escalation.get('session_id', '?')
        trigger = escalation.get('trigger_marker', '?')
        self._log(f'ESCALATION trigger={trigger} session={session_id[:8]}')

        # Log the full record to stdout for local debugging.
        print(json.dumps(escalation, indent=2), flush=True)

        # Forward to Slack if configured.
        forward_to_slack(escalation)

        # Always ACK 200 — CreoleCentric doesn't retry escalations
        # today, and we've already accepted responsibility by
        # verifying the signature.
        self._respond(200, {'status': 'received'})

    def _respond(self, status: int, payload: dict) -> None:
        body = json.dumps(payload).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _log(self, msg: str) -> None:
        print(f'[{self.address_string()}] {msg}', flush=True)

    def log_request(self, code='-', size='-'):
        pass


if __name__ == '__main__':
    server = HTTPServer(('0.0.0.0', PORT), EscalationHandler)
    print(f'Voice-agent escalation receiver listening on :{PORT}')
    print('Waiting for escalations…\n')
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\nShutting down.')
        server.shutdown()
