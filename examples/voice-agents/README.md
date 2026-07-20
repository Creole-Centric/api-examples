# Voice Agents — Examples

Working code samples for building and deploying a CreoleCentric
Voice Agent. Start with the docs:

- [`../../docs/voice-agents-best-practices.md`](../../docs/voice-agents-best-practices.md) — design + security guide (read this first)
- [`https://creolecentric.com/docs/voice-agents`](https://creolecentric.com/docs/voice-agents) — platform overview + rate card

## What's in this folder

| File | What it does |
|---|---|
| [`embed.html`](embed.html) | Simplest possible browser widget embed. Static HTML page with the `<script>` tag — open it in a browser and start talking. |
| [`create-agent.sh`](create-agent.sh) | Curl example for creating an agent via `POST /v1/agents/`. Covers both BYO and CreoleCentric-proxied LLM modes. |
| [`webhook-tool-python.py`](webhook-tool-python.py) | Python webhook handler for a function-calling tool. Verifies the HMAC signature (mandatory), validates arguments, returns a JSON result. Framework-free (`http.server`), so nothing to install. |
| [`webhook-tool-node.js`](webhook-tool-node.js) | Node.js webhook handler for a function-calling tool. Zero dependencies — uses the built-in `http` and `crypto` modules. |
| [`escalation-webhook-python.py`](escalation-webhook-python.py) | Python receiver for escalation POSTs. Verifies HMAC, forwards the transcript to a Slack Incoming Webhook. |

## Quickstart (5 minutes to a working widget)

1. **Get an API key** with the `agent` scope at
   [`/api-keys`](https://creolecentric.com/api-keys). You need a
   Creator subscription or Creator Pack (≥85,000 credits).

2. **Add at least one Studio Pro voice** to your library at
   [`/voices`](https://creolecentric.com/voices) — the agent
   voice picker only shows Studio Pro voices.

3. **Create an agent**:
   ```bash
   cd examples/voice-agents
   export CREOLECENTRIC_API_KEY=cc_your_key_here
   ./create-agent.sh
   ```
   Copy the returned `agent_id`.

4. **Embed the widget**:
   ```bash
   # Edit embed.html and paste your agent_id
   sed -i 's/YOUR_AGENT_ID/<paste-here>/g' embed.html
   # Open it in a browser
   open embed.html
   ```

5. **Grant microphone permission and talk to it.**

## Adding function-calling tools

If you want the agent to look things up in your systems (order
status, appointment times, account balances) instead of just
answering from its prompt, wire a webhook tool:

1. **Run the example webhook** locally with something like
   [ngrok](https://ngrok.com) to expose it publicly:
   ```bash
   python3 webhook-tool-python.py  # binds to :8080
   ngrok http 8080                  # → https://xxxx.ngrok-free.app
   ```

2. **Register the tool** on your agent (via `/agents/<id>/edit`
   in the browser, or a `POST /v1/agents/<id>/tools/` from your
   backend). Set the webhook URL to your public ngrok URL.

3. **Save the signing secret** — returned once on tool creation,
   never again. Put it in an env var (`WEBHOOK_SIGNING_SECRET`)
   before starting the webhook.

4. **Test.** Ask the agent something that should trigger the
   tool. Watch the webhook logs; you should see the request,
   the signature verification passing, and the response.

## Setting up escalation

Similar pattern — run the escalation webhook, expose it, register
it in the agent's `escalation_config.webhook_url` field, save the
signing secret. See [`escalation-webhook-python.py`](escalation-webhook-python.py)
for the full flow (with a Slack forward included).

## Security must-reads

Before pointing real traffic at your agent:

- **BYO LLM key handling** — [best-practices §2.1](../../docs/voice-agents-best-practices.md#21-byo-llm-keys--what-you-should-do). Dedicated key, project scoping, spending cap, rotation.
- **HMAC verification is mandatory** — [best-practices §2.4](../../docs/voice-agents-best-practices.md#24-webhook-tool-hmac-verification-non-negotiable). The example webhook code shows the pattern; don't skip it.
- **Rate-limit exposure** — [best-practices §2.7](../../docs/voice-agents-best-practices.md#27-rate-limiting--cost-controls). We don't currently rate-limit per-agent sessions; if your agent is `is_public=true` on an unauthenticated site, put a CAPTCHA in front of the widget.

## Getting help

- `support@creolecentric.com`
- Paid onboarding: subject "Voice Agents Onboarding" — 4–6 hours of paired implementation, prompt workshop, and security review.
