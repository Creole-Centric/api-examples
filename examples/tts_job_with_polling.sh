#!/bin/bash

# CreoleCentric TTS API Example with Job Status Polling
# ======================================================
# This script demonstrates how to:
# 1. Create a TTS job
# 2. Poll for job completion
# 3. Download the resulting audio file
#
# Requirements:
# - curl (for API requests)
# - jq (for JSON parsing) - Install with: apt-get install jq / brew install jq

# Configuration
CREOLECENTRIC_API_KEY="${CREOLECENTRIC_API_KEY:-cc_your_api_key_here}"
API_BASE_URL="https://creolecentric.com/api/v1"

# Voice and Model IDs
# To find Voice IDs: Go to Voice Library page, click "More" (...) button on any voice card
# To find Model IDs: In TTS interface, go to Speech Options tab, click on Model field
VOICE_ID="qW6MAd7f5iuYw7bAH96wC"  # Nicolas Innocent voice
MODEL_ID="ccl_ht_v100"             # Default Haitian Creole model

# Check if API key is set
if [[ "$CREOLECENTRIC_API_KEY" == "cc_your_api_key_here" ]]; then
    echo "Error: Please set your API key"
    echo "export CREOLECENTRIC_API_KEY='cc_your_actual_key'"
    exit 1
fi

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo "Warning: jq is not installed. JSON parsing will be limited."
    echo "Install with: apt-get install jq (Debian/Ubuntu) or brew install jq (macOS)"
fi

echo "=========================================="
echo "CreoleCentric TTS API Example"
echo "=========================================="
echo ""

# Step 1: Create a TTS job
echo "1. Creating TTS job..."
echo "   Text: Bonjou! Kijan ou ye?"
echo "   Voice: Nicolas Innocent ($VOICE_ID)"
echo "   Model: CCL Haitian v100 ($MODEL_ID)"
echo ""

RESPONSE=$(curl -s -X POST "$API_BASE_URL/tts/jobs/" \
  -H "Authorization: ApiKey $CREOLECENTRIC_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"text\": \"Bonjou! Kijan ou ye?\",
    \"voice_id\": \"$VOICE_ID\",
    \"model_id\": \"$MODEL_ID\"
  }")

# Check if request was successful
if [[ -z "$RESPONSE" ]]; then
    echo "Error: No response from API"
    exit 1
fi

# Extract job ID
if command -v jq &> /dev/null; then
    JOB_ID=$(echo "$RESPONSE" | jq -r '.id // .job_id')
    STATUS=$(echo "$RESPONSE" | jq -r '.status')
    CREDITS_USED=$(echo "$RESPONSE" | jq -r '.credits_used')

    if [[ "$JOB_ID" == "null" ]]; then
        echo "Error: Failed to create job"
        echo "$RESPONSE" | jq .
        exit 1
    fi
else
    # Fallback for systems without jq
    JOB_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*' | sed 's/"id":"//')
    STATUS=$(echo "$RESPONSE" | grep -o '"status":"[^"]*' | sed 's/"status":"//')
    CREDITS_USED=$(echo "$RESPONSE" | grep -o '"credits_used":[0-9]*' | sed 's/"credits_used"://')
fi

echo "✓ Job created successfully!"
echo "  Job ID: $JOB_ID"
echo "  Initial Status: $STATUS"
echo "  Credits Used: $CREDITS_USED"
echo ""

# Step 2: Poll for job completion
echo "2. Polling for job completion..."
echo "   (This may take 10-30 seconds depending on text length)"
echo ""

MAX_ATTEMPTS=30  # Maximum number of polling attempts
POLL_INTERVAL=2  # Seconds between polls
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    ATTEMPT=$((ATTEMPT + 1))

    # Get job status
    STATUS_RESPONSE=$(curl -s -X GET "$API_BASE_URL/tts/jobs/$JOB_ID/" \
      -H "Authorization: ApiKey $CREOLECENTRIC_API_KEY")

    if command -v jq &> /dev/null; then
        STATUS=$(echo "$STATUS_RESPONSE" | jq -r '.status')
        QUEUE_POSITION=$(echo "$STATUS_RESPONSE" | jq -r '.queue_position // "N/A"')
        AUDIO_URL=$(echo "$STATUS_RESPONSE" | jq -r '.audio_file_url // .audio_url // ""')
        ERROR_MESSAGE=$(echo "$STATUS_RESPONSE" | jq -r '.error_message // ""')
        DURATION=$(echo "$STATUS_RESPONSE" | jq -r '.duration_seconds // ""')
        S3_URL=$(echo "$STATUS_RESPONSE" | jq -r '.s3_url // ""')
    else
        STATUS=$(echo "$STATUS_RESPONSE" | grep -o '"status":"[^"]*' | sed 's/"status":"//')
        AUDIO_URL=$(echo "$STATUS_RESPONSE" | grep -o '"audio_file_url":"[^"]*' | sed 's/"audio_file_url":"//')
        ERROR_MESSAGE=$(echo "$STATUS_RESPONSE" | grep -o '"error_message":"[^"]*' | sed 's/"error_message":"//')
    fi

    echo -n "  Attempt $ATTEMPT/$MAX_ATTEMPTS - Status: $STATUS"

    if [[ "$QUEUE_POSITION" != "N/A" ]] && [[ "$QUEUE_POSITION" != "null" ]] && [[ -n "$QUEUE_POSITION" ]]; then
        echo -n " (Queue position: $QUEUE_POSITION)"
    fi
    echo ""

    # Check for completion
    if [[ "$STATUS" == "completed" ]]; then
        echo ""
        echo "✓ Job completed successfully!"

        if [[ -n "$DURATION" ]] && [[ "$DURATION" != "null" ]]; then
            echo "  Duration: ${DURATION} seconds"
        fi

        if [[ -n "$AUDIO_URL" ]] && [[ "$AUDIO_URL" != "null" ]]; then
            echo "  Audio URL: $AUDIO_URL"
        fi

        if [[ -n "$S3_URL" ]] && [[ "$S3_URL" != "null" ]]; then
            echo "  S3 URL: $S3_URL"
        fi

        # Step 3: Download the audio file (optional)
        if [[ -n "$AUDIO_URL" ]] && [[ "$AUDIO_URL" != "null" ]]; then
            echo ""
            echo "3. Downloading audio file..."
            OUTPUT_FILE="output_${JOB_ID:0:8}.mp3"

            if curl -s -o "$OUTPUT_FILE" "$AUDIO_URL"; then
                echo "✓ Audio saved as: $OUTPUT_FILE"

                # Check file size
                if command -v du &> /dev/null; then
                    FILE_SIZE=$(du -h "$OUTPUT_FILE" | cut -f1)
                    echo "  File size: $FILE_SIZE"
                fi
            else
                echo "✗ Failed to download audio file"
            fi
        fi

        break

    elif [[ "$STATUS" == "failed" ]]; then
        echo ""
        echo "✗ Job failed!"
        if [[ -n "$ERROR_MESSAGE" ]] && [[ "$ERROR_MESSAGE" != "null" ]]; then
            echo "  Error: $ERROR_MESSAGE"
        fi
        exit 1

    elif [[ "$STATUS" == "cancelled" ]]; then
        echo ""
        echo "✗ Job was cancelled"
        exit 1
    fi

    # Wait before next poll
    sleep $POLL_INTERVAL
done

if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
    echo ""
    echo "✗ Timeout: Job did not complete within expected time"
    echo "  You can check the status later using:"
    echo "  curl -X GET \"$API_BASE_URL/tts/jobs/$JOB_ID/\" \\"
    echo "    -H \"Authorization: ApiKey \$CREOLECENTRIC_API_KEY\""
    exit 1
fi

echo ""
echo "=========================================="
echo "Example completed successfully!"
echo "=========================================="