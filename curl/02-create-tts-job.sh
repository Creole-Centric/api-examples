#!/bin/bash
# Create a TTS Job

API_KEY="${CREOLECENTRIC_API_KEY}"
BASE_URL="https://creolecentric.com/api/v1"

curl -X POST "${BASE_URL}/tts/jobs/" \
  -H "Authorization: ApiKey ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Bonjou! Kijan ou ye?",
    "voice_id": "i4mRPwKM2yHwXhbmkN514",
    "model_id": "ccl_ht_v100",
    "webhook_url": "https://your-app.com/webhooks/tts"
  }'
