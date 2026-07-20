#!/usr/bin/env bash
# =============================================================================
# create-agent.sh — Create a CreoleCentric Voice Agent via the REST API.
# =============================================================================
#
# Usage:
#   export CREOLECENTRIC_API_KEY=cc_your_key_here
#   ./create-agent.sh
#
# Requires:
#   * An API key with the `agent` scope. Get one at
#     https://creolecentric.com/api-keys
#   * A Studio Pro voice_id added to your library. Browse at
#     https://creolecentric.com/voices and copy an ID.
#
# The script creates an agent with a Kreyòl-first prompt, CreoleCentric-
# proxied LLM (Standard tier), and multilingual mode enabled. Adjust the
# payload below for your use case.
#
# Two modes are shown. Comment/uncomment the one you want:
#   1. CreoleCentric-proxied — we handle the AI backend. LLM billed in
#      credits at the rate card in /docs/voice-agents §8.
#   2. Bring-your-own LLM — you supply the provider key. LLM cost goes
#      to your provider account directly.
# =============================================================================

set -euo pipefail

: "${CREOLECENTRIC_API_KEY:?Set CREOLECENTRIC_API_KEY to your cc_… key.}"

API_BASE="${API_BASE:-https://creolecentric.com}"

# Replace with a voice_id from https://creolecentric.com/voices
# — must be a Studio Pro voice for streaming to work.
VOICE_ID="${VOICE_ID:-R8AqIUPjP3sciYOOgnXXT}"  # Berthie (Forward) — Studio Pro

# =============================================================================
# Option 1: CreoleCentric-proxied LLM (Standard tier — recommended default)
# =============================================================================
PAYLOAD='{
  "name": "Insurance Support Assistant",
  "system_prompt": "You are a customer service agent for ACME Insurance. Reply concisely (1-3 sentences). Warm but professional tone. Never quote a specific premium amount — always defer to the caller'\''s account rep. Emit [escalate=true] when the caller mentions a claim, an emergency, or explicitly asks for a human.",
  "voice_id": "'"$VOICE_ID"'",
  "is_public": true,
  "is_active": true,
  "multilingual": true,
  "max_turns_per_session": 20,
  "session_ttl_seconds": 3600,
  "llm_config": {
    "mode": "creolecentric",
    "model": "standard"
  },
  "escalation_config": {
    "trigger_markers": ["[escalate=true]", "[emergency]"]
  }
}'

# =============================================================================
# Option 2: Bring-your-own LLM — uncomment to use, comment Option 1 above.
# =============================================================================
# PAYLOAD='{
#   "name": "Insurance Support Assistant",
#   "system_prompt": "You are a customer service agent for ACME Insurance. Reply concisely (1-3 sentences). Warm but professional tone. Emit [escalate=true] for any claim, emergency, or explicit request for a human.",
#   "voice_id": "'"$VOICE_ID"'",
#   "is_public": true,
#   "is_active": true,
#   "multilingual": true,
#   "max_turns_per_session": 20,
#   "session_ttl_seconds": 3600,
#   "llm_config": {
#     "mode": "byo",
#     "provider": "openai",
#     "model": "gpt-4o-mini",
#     "api_key": "sk-YOUR-OPENAI-KEY-HERE"
#   },
#   "escalation_config": {
#     "trigger_markers": ["[escalate=true]", "[emergency]"]
#   }
# }'
# =============================================================================

echo "Creating agent…"
RESPONSE=$(curl -sS -X POST "$API_BASE/v1/agents/" \
  -H "Authorization: ApiKey $CREOLECENTRIC_API_KEY" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD")

# Print the full response for inspection
echo "$RESPONSE" | python3 -m json.tool

# Pull out the agent_id for the follow-up prompt
AGENT_ID=$(echo "$RESPONSE" | python3 -c "import sys,json;print(json.load(sys.stdin).get('agent_id',''))" 2>/dev/null)
if [ -n "$AGENT_ID" ]; then
  echo ""
  echo "===================================================================="
  echo "  Agent created: $AGENT_ID"
  echo "===================================================================="
  echo ""
  echo "Next: paste this ID into embed.html and open the file in a browser."
  echo ""
  echo "  sed -i.bak 's/YOUR_AGENT_ID/$AGENT_ID/g' embed.html"
  echo "  open embed.html   # or double-click it in your file manager"
  echo ""
fi
