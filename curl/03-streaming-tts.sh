#!/bin/bash
# Live-streaming TTS — Server-Sent Events
#
# Streams base64-encoded 24 kHz mono 16-bit PCM as `chunk` events,
# ending with a `done` event that carries the saved S3 audio URL.
# First audio byte typically lands in under 100 ms.
#
# Eligibility: text ≤ 600 chars, model_id supports ccl_ht_gem_pro
# (Studio Pro), voice_id is NOT a Custom Voice (cv_*).
#
# Billing: 1.5x the standard per-character rate. Cancelling mid-stream
# refunds credits proportional to the audio not yet delivered — close
# the connection (Ctrl-C) to test.

API_KEY="${CREOLECENTRIC_API_KEY}"
BASE_URL="${CREOLECENTRIC_API_URL:-https://api.creolecentric.com/v1}"
VOICE_ID="${CREOLECENTRIC_VOICE_ID:-smgykWMfupuWlPLWf0Zi9}"

# -N disables curl's output buffering so SSE frames print as they arrive.
curl -N -X POST "${BASE_URL}/users/dev/tts/stream/" \
  -H "Authorization: ApiKey ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d "{
    \"text\": \"Bonjou tout moun! Mwen kontan we ou la jodi a.\",
    \"voice_id\": \"${VOICE_ID}\",
    \"model_id\": \"ccl_ht_gem_pro\"
  }"

# To save the audio to a file, pipe this script's output through a
# small parser that extracts pcm_b64 from each `chunk` event and
# base64-decodes it. The Python and Node examples in this repo do
# that end-to-end (output.wav) — start there if you need the audio,
# not just the raw SSE stream.
