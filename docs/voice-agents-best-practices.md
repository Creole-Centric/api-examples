# Voice Agents — Best Practices & Security Guide

**Audience.** Customers building a Voice Agent on CreoleCentric.
Reference for design decisions, security posture, and the operational
runbook you'll want in place before real traffic hits the widget.

**Companion documents.**
- Overview + API contract: [`/docs/voice-agents`](https://creolecentric.com/docs/voice-agents) on the CreoleCentric site.
- Working code examples: [`../examples/voice-agents/`](../examples/voice-agents/) in this repo (embed HTML, agent-create curl, HMAC-verified webhook handlers in Python + Node).

---

## 1. Design best practices

### 1.1 System prompt patterns

Two paragraphs is the target length. Long prompts cost more per turn
(they're re-tokenized every LLM call), reduce room for conversation
context, and don't measurably improve behavior beyond the essentials.

Structure that reliably works:

1. **Role sentence.** *"You are a customer service agent for ACME
   Insurance."* First-person doesn't help; second-person addressed to
   the model does.
2. **Language pinning** — only if `multilingual=False`. Otherwise the
   runtime appends the language directive automatically and a manual
   pin will fight it.
3. **Tone + brevity constraint.** *"Reply concisely (1–3 sentences).
   Warm but professional."*
4. **Domain-specific rules.** *"Never quote a specific premium
   amount — always defer to the caller's account rep. Never make up
   policy numbers."*
5. **Escalation instruction, if applicable.** *"Emit
   `[escalate=true]` when the caller mentions a claim, an
   emergency, or explicitly asks for a human."*
6. **Tool usage hint, if tools are wired.** *"When the caller asks
   about their policy, call `lookup_policy`. Never fabricate
   details you didn't get from a tool call."*

Anti-patterns to avoid:

- Long lists of "do not do X" rules — the model tends to bring up
  the forbidden topic mentioning it's forbidden. Prefer positive
  framing.
- Multi-personality prompts ("you are helpful AND stern AND funny")
  — pick one.
- Writing the whole prompt in Kreyòl. Modern LLMs handle
  instructions in English more reliably. Write the prompt in
  English with Kreyòl example phrases inline where the tone or
  vocabulary needs to be locked.

### 1.2 Language mode selection

- **Multilingual (default)** for consumer-facing agents where the
  caller pool isn't homogeneous — most Haitian diaspora deployments
  fall here. Handles code-switching gracefully; the STT engine
  returns the detected language directly and the runtime appends a
  reply-in-same-language directive.
- **Kreyòl only** for domestic Haiti deployments where Kreyòl
  transcription accuracy is more important than accepting the
  occasional English caller. The tuned STT prompt gives cleaner
  Haitian orthography, at the cost of garbling non-Kreyòl input.

### 1.3 Voice selection

- **Studio Pro only** for agents — the picker enforces this. Studio
  Standard doesn't stream cleanly for live conversation; Regional
  voices don't stream at all.
- Match voice **gender to the persona** the customer wants callers
  to perceive. The Voice Library page shows all Studio Pro voices
  with previews.
- **Regional accent matters** for authenticity. International-region
  Studio Pro voices are more neutral; try 2–3 during design and
  pick the one that fits the brand.

### 1.4 Tool design

Each tool the agent can call is a webhook you implement. Principles
that survive first contact with real callers:

- **Small tool count.** Three well-designed tools beat ten redundant
  ones. LLMs pick the right tool much more reliably when the tool
  vocabulary is small.
- **Names describe behavior** — `lookup_policy`, not
  `handle_policy_stuff`. LLMs use the name as a big prior.
- **Descriptions written for the LLM**, not for humans. Say what
  the tool does, what arguments it takes, and — critically —
  *when* the LLM should invoke it. Include a natural-language
  example.
- **Strict JSON schemas** (`"type": "object"` + required + enum
  where applicable). We validate against the schema before firing
  the webhook, so a hallucinated arg name never hits your server.
- **Timeouts.** Default 5 seconds. Bump for slow backends, but
  anything over 10 seconds will feel broken to the caller. Prefer
  making the tool call acknowledge fast and return partial data,
  with a follow-up turn to fetch the rest.
- **Idempotent semantics.** Tools may be called multiple times if
  the caller re-asks. Design for that — no side effects on the
  first call that a second call couldn't safely repeat, or key by
  a client-provided idempotency token in the schema.

### 1.5 Escalation strategy

Three canonical marker patterns work well:

- `[escalate=true]` — soft escalation, agent got stuck.
- `[emergency]` — hard escalation, prioritize the transcript in
  routing.
- `[out_of_scope]` — the caller asked about something the agent
  isn't supposed to handle.

Give the LLM concrete triggers in the prompt: *"Emit
`[escalate=true]` if the caller mentions a claim, asks to speak to
a person, or the same question comes up twice in a row without
progress."*

Escalation POSTs deliver the full transcript, resolved language,
turn count, tool-call log, and session_id — all HMAC-signed. Your
endpoint should verify the signature (see §2.4) before acting on
the payload.

### 1.6 Session sizing

- `max_turns_per_session` — cap based on the use case. Support
  bots: 15–20. Appointment booking: 8–12. FAQ: 5. This bounds the
  credit reservation math, which is tier-aware:
  - Standard tier (Gemini 2.5 Flash): ~105 credits/turn → 20 turns
    reserves ~2.1K per session.
  - Advanced tier (Gemini 2.5 Pro): ~1,265 credits/turn → 20 turns
    reserves ~25K per session.
  Pick `max_turns_per_session` deliberately if you're on Advanced —
  it's the main lever that keeps a single stuck conversation from
  reserving a big chunk of your balance.
- `session_ttl_seconds` — how long the session-scoped API key
  remains valid. Default 3600 (1 hour). Longer for use cases where
  users may walk away and return; shorter for high-turnover
  kiosks.

### 1.7 Public vs. private agents

The `is_public` field controls **who can start a session against
your agent** — it's the authentication boundary at conversation
start, not a visibility or quality setting. Voice, LLM behavior,
and credit rates are identical either way.

|  | `is_public: true` | `is_public: false` |
|---|---|---|
| Who can invoke it? | Anyone with the agent_id | Only the owner (JWT or API key) |
| Widget on a public marketing site? | Works | Doesn't work (widget can't auth) |
| Bot-attack risk on your credit balance | High — anyone can open sessions | None — no unauth callers |
| Typical use case | Consumer support, FAQ, prospect chat | Employee tools, logged-in customer flows |

**`is_public: true`** — the `agent_id` alone is enough to open a
session. Your credit balance pays for every turn regardless of
who's talking. Right for consumer-facing widgets, FAQ bots, and
prospect engagement where you don't want to force sign-in.

**`is_public: false`** — session-start requires an authenticated
request that resolves to the agent's owner (JWT or an API key
with the `agent` scope). The widget alone can't reach a private
agent — its session-start POST carries no credentials. If you
want widget-style embedding for a private agent, your backend
generates a short-lived session token first and hands it to the
widget. Right for internal tools, employee-only agents, and flows
scoped to logged-in customers of your own product.

**Cost-exposure caveat for public agents.** Public agents are
throttled at **100 anonymous sessions/hour per agent** (see §2.7).
That caps the worst case, but 100/hr can still burn real money on
Advanced tier (~25K credits per session × 100 = 2.5M credits/hr in
the peak-abuse scenario). Layer additional defenses in front of
the widget: a CAPTCHA / turnstile, a provider-side spending cap,
and — if the concern outweighs the signup friction — flipping to
`is_public: false` with session tokens issued from your own
authenticated backend.

---

## 2. Security considerations

### 2.1 BYO LLM keys — what you should do

*The question customers ask most: "we're just using a key — what's
the security model?"*

The API key **is the entire security boundary.** There's no OAuth,
no signed request, no client certificate. Anyone (person or system)
with the key can spend against your provider account. The goal is
to make that boundary as narrow as possible.

**Customer-side hardening — do all of these before go-live:**

1. **Use a dedicated key** for the CreoleCentric agent. Never share
   a key that's used elsewhere. When something goes wrong, you can
   revoke this one key without breaking your other systems.
2. **Scope the key to a project** where the provider supports it.
   OpenAI project-scoped keys with per-project spending limits.
   Anthropic workspace keys. Google Cloud service accounts with
   IAM-restricted scopes.
3. **Set a spending cap** on the provider dashboard. This is your
   *last line of defense* against a runaway agent or a compromised
   key. Cap at 2–3× expected monthly spend — trip alarms early.
4. **Restrict to the models the agent uses.** If your agent uses
   `gpt-4o-mini`, don't authorize the key to hit `o1`. Providers
   that support model-level scoping include OpenAI (via projects)
   and Google (via IAM roles).
5. **Rotate periodically.** Every 90 days is a sensible default;
   more often if your team has personnel churn. Rotation is a
   PATCH on the agent — no downtime.
6. **Monitor at the provider.** Set up spending alerts on the
   provider dashboard, not just on CreoleCentric. If our monitoring
   ever misses an anomaly, theirs is the backstop.
7. **Assume rotation** in your operational runbook. Document the
   procedure: rotate at provider, PATCH the agent, verify next
   session succeeds. It should take under 5 minutes and be doable
   at 3am.

**If you suspect a key leak**:

1. Revoke the key at the provider **first** (stops the bleeding).
2. PATCH the agent's `llm_config.api_key` with a new key.
3. Test a session. Old ciphertext in our DB is now useless — the
   key is revoked at the source.
4. Check provider usage logs for unauthorized requests before
   considering it contained.

### 2.2 BYO LLM keys — what we do on our side

Transparency so your security team can vet the platform:

- **Encryption at rest.** Fernet symmetric encryption (128-bit
  AES-CBC + HMAC-SHA256). Keys are encrypted immediately on
  ingest before they touch the primary database. The encryption
  key lives in our `AGENT_ENCRYPTION_KEY` env var, held in the
  application-tier secrets store.
- **In-memory only during a call.** Plaintext key exists only in
  the Python process's memory during the outgoing LLM HTTP request.
  Not logged, not persisted, not written to disk.
- **Not returned on reads.** `GET /v1/agents/<id>/` returns
  `api_key_configured: true|false` — never the ciphertext, never
  the plaintext. There is no API path that returns a plaintext
  key.
- **Not shared.** We only ever send the key to your designated
  provider (OpenAI, Anthropic, Google) — not to any third-party
  analytics, telemetry, or debug service.
- **Deletion.** When you PATCH with a new key or delete the agent,
  the old ciphertext is discarded on the next migration. Backups
  retain it per the backup retention policy; we can force-purge
  older backups on written request.
- **Threat model** we defend against: casual DB dump, log
  exfiltration, honest-employee curiosity. **Not** defended
  against: a full server compromise where an attacker has code
  execution on the app tier — in that scenario an attacker can
  decrypt any key by importing our crypto helper. For customers
  with that threat model, see §2.3.

### 2.3 Alternative architectures for high-security customers

If BYO-with-a-stored-key isn't acceptable — regulated industries,
your security team blocks storing third-party API keys with a
vendor — three alternatives:

**Option A: CreoleCentric-proxied mode.** Your own key never
touches our system. LLM cost is billed in credits at our rate
card (see §8 of the integrator guide). Simplest for security
review; only trade-off is you don't pick your own model beyond
Standard / Advanced.

**Option B: Customer-hosted LLM proxy.** Define a webhook tool
named e.g. `ask_llm` that takes a prompt argument and returns a
text response. Your webhook endpoint runs the LLM call inside
your own infrastructure, using a key that never leaves your VPC.
From our side, this looks like any other webhook tool —
HMAC-signed, JSON-schema-validated, 5-second-timeout by default.
Adds ~100–200 ms of tool-call latency vs BYO direct. Strongest
isolation. Reasonable for finance, healthcare, and government
customers.

**Option C: Function-restricted deployment.** For very narrow use
cases (FAQ, appointment booking), build an agent whose LLM is
called only through tools — the LLM is effectively a router that
picks which tool to invoke, and the agent's responses are
templated from tool results. Reduces the LLM's discretion, limits
the blast radius of a compromised key or misbehaving model.
Meaningful design effort but eliminates unbounded generation.

### 2.4 Webhook tool HMAC verification (non-negotiable)

Every tool call we send to your webhook includes an HMAC-SHA256
signature in the `X-CreoleCentric-Signature` header, keyed on the
signing secret returned once when the tool was created. **Verify
the signature before acting on the payload** — otherwise your
webhook endpoint accepts arbitrary POSTs from anyone on the
internet.

Minimal Python verification (paste as a starter):

```python
import hmac, hashlib

def verify_signature(request_body: bytes, header_value: str,
                     signing_secret: str) -> bool:
    expected = hmac.new(
        signing_secret.encode('utf-8'),
        request_body,
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(expected, header_value or '')
```

Fail closed on missing/mismatched signature. Log the attempt.

If you rotate the signing secret (delete + recreate the tool),
update the constant in your verification code. There is no
"grace period" — the old secret stops working immediately.

### 2.5 Session-scoped API keys

The widget embed pattern is safe because session start returns a
**session-scoped, time-limited child API key** rather than exposing
your master key. That child key:

- Has `agent` scope only — can't submit TTS jobs, can't manage
  the account.
- Expires at `session_ttl_seconds` from creation (default 1 hour).
- Is revoked at session end via
  `POST /v1/agents/sessions/<id>/end`.
- Belongs to the parent (master) key, so revoking the parent
  kills all outstanding session keys.

**Never embed the parent (master) key in browser code.** The
widget only ever sees session keys.

### 2.6 PII in transcripts

`AgentTurn` rows preserve the raw user transcript and agent
response text indefinitely (Phase 2 has no retention policy). If
your domain has PII exposure — health, finance, legal — plan for
this:

- **Product roadmap:** Per-agent retention policy + PII redaction
  is Phase 3 work; not available yet.
- **Interim mitigation:** Instruct the LLM in the system prompt
  to never include SSN / DOB / account numbers verbatim in its
  response. Not bulletproof, but reduces surface area.
- **Documentation duty:** If you're in a regulated industry, you
  need your own retention + deletion policy for the transcripts
  you access via our API, independent of ours.

### 2.7 Rate limiting + cost controls

Layered defenses, cheapest first:

- `max_turns_per_session` bounds a single conversation's cost.
- Credit reservation at session start blocks new sessions when
  your account balance is low. Reservation is tier-aware — see
  §1.6 for the per-turn numbers.
- **Per-agent throttle:** public agents are capped at **100
  anonymous sessions/hour per agent**. The 101st unauthenticated
  session-start returns `429 Too Many Requests` with a
  `Retry-After` header (seconds until the window resets). The
  owner and authenticated collaborators bypass the throttle —
  their sessions bill their own account, so there's no abuse
  vector to protect against. The cap is a hard block against
  runaway bot campaigns, not fine-grained rate control.
- Provider-side spending cap (BYO mode) is the final backstop.

If 100/hr is still too high for your public widget's tier + cost
profile — Advanced tier can reach ~2.5M credits/hr at saturation —
add front-of-widget mitigations:

- CAPTCHA or turnstile before showing the widget button.
- Origin-header check on your side (we accept any origin for the
  widget; enforce your own).
- Flip to `is_public=false` and issue session tokens from your
  authenticated backend.

**Handling 429 on the client.** When session-start returns 429,
show a "please try again in a few minutes" message and back off
by at least the `Retry-After` seconds. Don't hot-loop retries —
you'll just keep hitting the throttle and never make progress.

---

## 3. Go-live checklist

Run through this before pointing real traffic at the agent.

- [ ] Agent tested via the browser widget (or SDK) with 5 real
  utterances from your expected caller pool. Each produced a
  reasonable response.
- [ ] Escalation triggered at least once, confirmed your
  destination received + verified the HMAC signature.
- [ ] Every webhook tool responded correctly to at least one live
  call. Failure modes tested (timeout, invalid args).
- [ ] Provider-side spending cap set (BYO mode only). Confirmed
  the alert fires at 80% of cap.
- [ ] Session-start credit reservation math sanity-checked against
  expected traffic (`max_turns × avg_credits_per_turn × expected
  concurrent sessions`).
- [ ] Widget embed snippet added to production, with a CSP that
  allows `wss://creolecentric.com`.
- [ ] Runbook written and stored in your Ops docs:
  - How to rotate the LLM key
  - How to update the agent's system prompt or tools
  - Who at CreoleCentric to contact if things break
  - How to check per-agent credit spend
- [ ] Turn-log audit sample reviewed — you confirm the transcripts
  look right and there's no unexpected PII leaking into responses.

---

## 4. Post-launch: what to watch

Instrument at least these three signals in the first two weeks:

1. **Sessions per day** and **turns per session**. Baseline the
   normal pattern; alert on 3× deviation. Runaway agents or bot
   attacks show up here first.
2. **Escalation rate** (escalated turns / total turns). Rising
   rate means the agent's answers are getting worse — usually a
   sign the world changed and the system prompt needs an update.
3. **Provider spend** (BYO mode) or **credit burn** (CC mode).
   Alert on daily spend crossing 130% of the trailing 7-day
   average.

---

## 5. Common pitfalls

- **Writing the system prompt in Kreyòl.** LLMs handle instructions
  in English more reliably. Rewrite as English instructions with
  Kreyòl example phrases inline.
- **Expecting the agent to remember prior sessions.** It doesn't —
  each session is a fresh conversation. If you need cross-session
  memory (returning-caller recognition), build it via a tool that
  fetches user context by phone number / account ID at the start
  of the session.
- **Escalation webhook rejects the POST because you forgot to
  verify HMAC or your firewall blocks us.** Test end-to-end during
  design; don't leave this until go-live.
- **`is_public=true` on an agent with expensive BYO LLM tokens.**
  A bot campaign will burn through your provider budget in hours.
  Default to authenticated-caller flow unless you have a
  legitimate need for anonymous access.
- **Tool schema drifts from what your backend expects.** Version
  the tool schema. When you change the backend, delete + recreate
  the tool (which rotates the signing secret) so both sides update
  atomically.
- **Long system prompts.** Every extra 200 tokens costs ~20 credits
  per turn on the Standard tier, and doesn't measurably improve
  agent quality once past ~400 tokens.

---

## 6. Getting help

Free-tier support: [support@creolecentric.com](mailto:support@creolecentric.com).
Two-business-day response for scoping.

**Voice Agents Onboarding engagement** — paid, 4–6 hours of paired
implementation, reference architecture review, and go-live support
tailored to your use case. Includes the security review + a
walkthrough of everything in this guide against your specific
deployment. Contact us with subject "Voice Agents Onboarding" and a
2-paragraph description of the use case.
