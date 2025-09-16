#!/bin/bash

# CreoleCentric TTS API Example with Webhook
# ===========================================
# This script demonstrates how to create a TTS job with a webhook URL
# for receiving real-time status updates.
#
# Note: You need a publicly accessible webhook endpoint to receive notifications.
# For testing, you can use services like:
# - webhook.site (free temporary webhooks)
# - ngrok (tunnel to local server)
# - RequestBin
# - Your own server endpoint

# Configuration
CREOLECENTRIC_API_KEY="${CREOLECENTRIC_API_KEY:-cc_your_api_key_here}"
API_BASE_URL="https://creolecentric.com/api/v1"

# Voice and Model IDs
# To find Voice IDs: Go to Voice Library page, click "More" (...) button on any voice card
# To find Model IDs: In TTS interface, go to Speech Options tab, click on Model field
VOICE_ID="qW6MAd7f5iuYw7bAH96wC"  # Nicolas Innocent voice
MODEL_ID="ccl_ht_v100"             # Default Haitian Creole model

# Webhook URL - Replace with your actual webhook endpoint
WEBHOOK_URL="${WEBHOOK_URL:-https://webhook.site/your-unique-url}"

# Check if API key is set
if [[ "$CREOLECENTRIC_API_KEY" == "cc_your_api_key_here" ]]; then
    echo "Error: Please set your API key"
    echo "export CREOLECENTRIC_API_KEY='cc_your_actual_key'"
    exit 1
fi

# Check if webhook URL is set
if [[ "$WEBHOOK_URL" == "https://webhook.site/your-unique-url" ]]; then
    echo "Warning: Using default webhook URL. Set your own with:"
    echo "export WEBHOOK_URL='https://your-webhook-endpoint.com/webhook'"
    echo ""
    echo "For testing, you can use:"
    echo "1. Go to https://webhook.site"
    echo "2. Copy your unique URL"
    echo "3. export WEBHOOK_URL='<your-unique-url>'"
    echo ""
    read -p "Continue with example webhook URL? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "=========================================="
echo "CreoleCentric TTS API - Webhook Example"
echo "=========================================="
echo ""
echo "Webhook URL: $WEBHOOK_URL"
echo ""

# Create a TTS job with webhook
echo "Creating TTS job with webhook..."
echo "Text: Bonjou! Mwen kontan wè ou. Kijan ou ye jodi a?"
echo ""

RESPONSE=$(curl -s -X POST "$API_BASE_URL/tts/jobs/" \
  -H "Authorization: ApiKey $CREOLECENTRIC_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"text\": \"Bonjou! Mwen kontan wè ou. Kijan ou ye jodi a?\",
    \"voice_id\": \"$VOICE_ID\",
    \"model_id\": \"$MODEL_ID\",
    \"webhook_url\": \"$WEBHOOK_URL\"
  }")

# Check if request was successful
if [[ -z "$RESPONSE" ]]; then
    echo "Error: No response from API"
    exit 1
fi

# Parse response
if command -v jq &> /dev/null; then
    JOB_ID=$(echo "$RESPONSE" | jq -r '.id // .job_id')
    STATUS=$(echo "$RESPONSE" | jq -r '.status')
    CREDITS_USED=$(echo "$RESPONSE" | jq -r '.credits_used')

    if [[ "$JOB_ID" == "null" ]]; then
        echo "Error: Failed to create job"
        echo "$RESPONSE" | jq .
        exit 1
    fi

    echo "✓ Job created successfully!"
    echo ""
    echo "Job Details:"
    echo "$RESPONSE" | jq '{
        id,
        status,
        text,
        voice_name,
        model_id,
        webhook_url,
        credits_used,
        created_at
    }'
else
    JOB_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*' | sed 's/"id":"//')
    echo "✓ Job created successfully!"
    echo "Job ID: $JOB_ID"
    echo ""
    echo "Full response:"
    echo "$RESPONSE"
fi

echo ""
echo "=========================================="
echo "Webhook Events You Will Receive:"
echo "=========================================="
echo ""
echo "The following events will be sent to your webhook URL:"
echo ""
echo "1. tts_queued - Job added to processing queue"
echo "   {
     \"event\": \"tts_queued\",
     \"job_id\": \"$JOB_ID\",
     \"status\": \"pending\",
     \"queue_position\": 5,
     \"timestamp\": \"2025-09-16T12:00:00Z\"
   }"
echo ""
echo "2. tts_started - Processing started"
echo "   {
     \"event\": \"tts_started\",
     \"job_id\": \"$JOB_ID\",
     \"status\": \"processing\",
     \"timestamp\": \"2025-09-16T12:00:05Z\"
   }"
echo ""
echo "3. tts_synthesized - Audio synthesis complete"
echo "   {
     \"event\": \"tts_synthesized\",
     \"job_id\": \"$JOB_ID\",
     \"status\": \"synthesized\",
     \"duration_seconds\": 3.5,
     \"timestamp\": \"2025-09-16T12:00:10Z\"
   }"
echo ""
echo "4. tts_uploaded - Audio uploaded to storage"
echo "   {
     \"event\": \"tts_uploaded\",
     \"job_id\": \"$JOB_ID\",
     \"status\": \"uploaded\",
     \"s3_url\": \"https://s3.example.com/audio/...\",
     \"timestamp\": \"2025-09-16T12:00:12Z\"
   }"
echo ""
echo "5. tts_delivered - Final completion"
echo "   {
     \"event\": \"tts_delivered\",
     \"job_id\": \"$JOB_ID\",
     \"status\": \"completed\",
     \"audio_file_url\": \"https://creolecentric.com/audio/...\",
     \"s3_url\": \"https://s3.example.com/audio/...\",
     \"duration_seconds\": 3.5,
     \"credits_used\": 47,
     \"timestamp\": \"2025-09-16T12:00:13Z\"
   }"
echo ""
echo "=========================================="
echo "Next Steps:"
echo "=========================================="
echo ""
echo "1. Check your webhook endpoint for incoming events"
echo "   URL: $WEBHOOK_URL"
echo ""
echo "2. You can also check job status manually:"
echo "   curl -X GET \"$API_BASE_URL/tts/jobs/$JOB_ID/\" \\"
echo "     -H \"Authorization: ApiKey \$CREOLECENTRIC_API_KEY\""
echo ""
echo "3. Once completed, download the audio from the URL"
echo "   provided in the 'tts_delivered' webhook event"
echo ""

# Optionally check status after a delay
echo "Waiting 5 seconds before checking status..."
sleep 5

echo ""
echo "Current job status:"
curl -s -X GET "$API_BASE_URL/tts/jobs/$JOB_ID/" \
  -H "Authorization: ApiKey $CREOLECENTRIC_API_KEY" | \
  (command -v jq &> /dev/null && jq '{status, audio_file_url, s3_url, error_message}' || cat)