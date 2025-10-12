#!/bin/bash
#
# CreoleCentric TTS API - cURL Examples
# ======================================
# This script demonstrates how to use the CreoleCentric API with cURL
#
# Requirements:
#   - curl
#   - jq (optional, for JSON formatting)
#
# Usage:
#   export CREOLECENTRIC_API_KEY="cc_your_api_key_here"
#   ./examples.sh
#

set -e

# Configuration
API_KEY="${CREOLECENTRIC_API_KEY}"
BASE_URL="https://creolecentric.com/api/v1"

# Check if API key is set
if [ -z "$API_KEY" ]; then
    echo "Error: CREOLECENTRIC_API_KEY environment variable not set"
    echo "Please set it with: export CREOLECENTRIC_API_KEY='cc_your_key_here'"
    exit 1
fi

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "=================================="
echo "CreoleCentric API - cURL Examples"
echo "=================================="
echo ""

# 1. Check API Health
echo -e "${BLUE}1. Checking API Health${NC}"
echo "=================================="
curl -s -X GET "${BASE_URL}/health/" \
  -H "Authorization: ApiKey ${API_KEY}" \
  -H "Content-Type: application/json" | jq '.'
echo ""

# 2. Get Credit Balance
echo -e "${BLUE}2. Get Credit Balance${NC}"
echo "=================================="
curl -s -X GET "${BASE_URL}/credits/balance/" \
  -H "Authorization: ApiKey ${API_KEY}" \
  -H "Content-Type: application/json" | jq '.'
echo ""

# 3. Get Available Voices
echo -e "${BLUE}3. Get Available Voices${NC}"
echo "=================================="
curl -s -X GET "${BASE_URL}/tts/voices/" \
  -H "Authorization: ApiKey ${API_KEY}" \
  -H "Content-Type: application/json" | jq '.voices[:5]'
echo ""

# 4. Get Available Models
echo -e "${BLUE}4. Get Available Models${NC}"
echo "=================================="
curl -s -X GET "${BASE_URL}/tts/models/" \
  -H "Authorization: ApiKey ${API_KEY}" \
  -H "Content-Type: application/json" | jq '.models'
echo ""

# 5. Create TTS Job
echo -e "${BLUE}5. Creating TTS Job${NC}"
echo "=================================="
JOB_RESPONSE=$(curl -s -X POST "${BASE_URL}/tts/jobs/" \
  -H "Authorization: ApiKey ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Bonjou! Mwen se yon egzanp API pou CreoleCentric. Mwen ka pale Kreyòl ayisyen.",
    "voice_id": "i4mRPwKM2yHwXhbmkN514",
    "model_id": "ccl_ht_v100",
    "webhook_url": "https://your-app.com/webhooks/tts"
  }')

echo "$JOB_RESPONSE" | jq '.'
JOB_ID=$(echo "$JOB_RESPONSE" | jq -r '.id')
echo ""
echo -e "${GREEN}Job created with ID: ${JOB_ID}${NC}"
echo ""

# 6. Get Job Status
echo -e "${BLUE}6. Get Job Status${NC}"
echo "=================================="
if [ ! -z "$JOB_ID" ] && [ "$JOB_ID" != "null" ]; then
  curl -s -X GET "${BASE_URL}/tts/jobs/${JOB_ID}/status/" \
    -H "Authorization: ApiKey ${API_KEY}" \
    -H "Content-Type: application/json" | jq '.'
else
  echo "Job ID not available, skipping status check"
fi
echo ""

# 7. List Recent Jobs
echo -e "${BLUE}7. List Recent Jobs${NC}"
echo "=================================="
curl -s -X GET "${BASE_URL}/tts/jobs/list/?limit=5" \
  -H "Authorization: ApiKey ${API_KEY}" \
  -H "Content-Type: application/json" | jq '.results'
echo ""

# 8. Get Job Details
echo -e "${BLUE}8. Get Full Job Details${NC}"
echo "=================================="
if [ ! -z "$JOB_ID" ] && [ "$JOB_ID" != "null" ]; then
  curl -s -X GET "${BASE_URL}/tts/jobs/${JOB_ID}/" \
    -H "Authorization: ApiKey ${API_KEY}" \
    -H "Content-Type: application/json" | jq '.'
else
  echo "Job ID not available, skipping details fetch"
fi
echo ""

echo "=================================="
echo -e "${GREEN}Examples completed!${NC}"
echo "=================================="
echo ""
echo "📢 For webhook integration, set up a webhook endpoint that can receive:"
echo "   - tts_queued → tts_started → tts_synthesized → tts_uploaded → tts_delivered"
echo ""
