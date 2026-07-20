#!/usr/bin/env node
/**
 * webhook-tool-node.js — Node.js example webhook handler for a Voice
 * Agent function-calling tool. Same contract as webhook-tool-python.py.
 *
 * Uses only Node built-ins (http, crypto) — zero dependencies.
 * Requires Node.js 18+.
 *
 * USAGE
 * -----
 *   export WEBHOOK_SIGNING_SECRET='cc_webhook_...'  # from tool creation
 *   node webhook-tool-node.js                       # binds to :8080
 *   ngrok http 8080                                 # expose publicly
 *
 * Point your agent's tool webhook_url at the ngrok URL.
 *
 * See webhook-tool-python.py for the tool schema to register.
 */

const http = require('http');
const crypto = require('crypto');

const PORT = parseInt(process.env.PORT || '8080', 10);
const SIGNING_SECRET = process.env.WEBHOOK_SIGNING_SECRET || '';

if (!SIGNING_SECRET) {
  console.error(
    '\n[!] WEBHOOK_SIGNING_SECRET is not set. The server will still ' +
    'start, but every request will fail HMAC verification.\n' +
    '    Set it to the value CreoleCentric returned when you ' +
    'created the tool.\n'
  );
}

// ---------------------------------------------------------------------------
// Business logic — replace with your real backend lookup.
// ---------------------------------------------------------------------------

const FAKE_POLICIES = {
  'P-0042': {
    holder: 'Marie Joseph',
    plan: 'Family Health',
    status: 'active',
    premium_gourdes: 5000,
    renewal_date: '2027-01-15',
  },
  'P-0100': {
    holder: 'Jean Baptiste',
    plan: 'Individual Auto',
    status: 'pending renewal',
    premium_gourdes: 3200,
    renewal_date: '2026-08-01',
  },
};

function lookupPolicy(policyNumber) {
  const policy = FAKE_POLICIES[policyNumber.toUpperCase()];
  if (!policy) {
    return { found: false, message: `No policy found for ${policyNumber}.` };
  }
  return { found: true, ...policy };
}

// ---------------------------------------------------------------------------
// HMAC verification — NON-NEGOTIABLE. Fail closed.
// ---------------------------------------------------------------------------

function verifySignature(requestBody, headerValue) {
  if (!SIGNING_SECRET || !headerValue) return false;
  const expected = crypto
    .createHmac('sha256', SIGNING_SECRET)
    .update(requestBody)
    .digest('hex');
  // timingSafeEqual guards against timing attacks; requires same-length buffers.
  const a = Buffer.from(expected, 'utf-8');
  const b = Buffer.from(headerValue, 'utf-8');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

// ---------------------------------------------------------------------------
// HTTP handler
// ---------------------------------------------------------------------------

function respond(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

function handleRequest(req, res) {
  if (req.method !== 'POST') {
    respond(res, 405, { error: 'method_not_allowed' });
    return;
  }
  const chunks = [];
  req.on('data', c => chunks.push(c));
  req.on('end', () => {
    const bodyBuf = Buffer.concat(chunks);
    const signature = req.headers['x-creolecentric-signature'] || '';

    if (!verifySignature(bodyBuf, signature)) {
      console.log(`[${req.socket.remoteAddress}] HMAC verification FAILED — refusing`);
      respond(res, 401, { error: 'invalid_signature' });
      return;
    }

    let payload;
    try {
      payload = JSON.parse(bodyBuf.toString('utf-8'));
    } catch (_e) {
      respond(res, 400, { error: 'invalid_json' });
      return;
    }

    // Payload shape (from the integrator guide):
    //   { tool_name, parameters, session_id, agent_id, timestamp }
    const toolName = payload.tool_name;
    const params = payload.parameters || {};
    const sessionId = payload.session_id || '?';

    console.log(
      `[${req.socket.remoteAddress}] tool=${toolName} ` +
      `session=${String(sessionId).slice(0, 8)} args=${JSON.stringify(params)}`
    );

    if (toolName === 'lookup_policy') {
      const policyNumber = (params.policy_number || '').trim();
      if (!policyNumber) {
        respond(res, 200, { error: 'policy_number is required' });
        return;
      }
      respond(res, 200, lookupPolicy(policyNumber));
      return;
    }

    respond(res, 200, { error: `unknown_tool: ${JSON.stringify(toolName)}` });
  });
}

const server = http.createServer(handleRequest);
server.listen(PORT, () => {
  console.log(`Voice-agent tool webhook listening on :${PORT}`);
  console.log('Waiting for tool calls…\n');
});
