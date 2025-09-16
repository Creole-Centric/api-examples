#!/bin/bash

# CreoleCentric TTS API - Check Job Status
# =========================================
# This script retrieves the status of an existing TTS job
#
# Usage:
#   ./check_job_status.sh <job_id>
#
# Example:
#   ./check_job_status.sh 7361d812-f782-48d9-aa07-634372e3d18c

# Configuration
CREOLECENTRIC_API_KEY="${CREOLECENTRIC_API_KEY:-cc_your_api_key_here}"
API_BASE_URL="https://creolecentric.com/api/v1"

# Check if job ID was provided
if [ $# -eq 0 ]; then
    echo "Error: Job ID required"
    echo "Usage: $0 <job_id>"
    echo "Example: $0 7361d812-f782-48d9-aa07-634372e3d18c"
    exit 1
fi

JOB_ID=$1

# Check if API key is set
if [[ "$CREOLECENTRIC_API_KEY" == "cc_your_api_key_here" ]]; then
    echo "Error: Please set your API key"
    echo "export CREOLECENTRIC_API_KEY='cc_your_actual_key'"
    exit 1
fi

echo "Checking status for job: $JOB_ID"
echo ""

# Get job status
RESPONSE=$(curl -s -X GET "$API_BASE_URL/tts/jobs/$JOB_ID/" \
  -H "Authorization: ApiKey $CREOLECENTRIC_API_KEY")

# Check if jq is available for pretty printing
if command -v jq &> /dev/null; then
    # Parse and display formatted output
    STATUS=$(echo "$RESPONSE" | jq -r '.status // "unknown"')

    echo "Status: $STATUS"
    echo "----------------------------------------"

    if [[ "$STATUS" == "completed" ]]; then
        echo "✓ Job completed successfully!"
        echo ""
        echo "Details:"
        echo "$RESPONSE" | jq '{
            status,
            text,
            voice_name,
            model_id,
            audio_file_url,
            s3_url,
            duration_seconds,
            duration_formatted,
            file_size,
            credits_used,
            completed_at
        }'

        AUDIO_URL=$(echo "$RESPONSE" | jq -r '.audio_file_url // .audio_url // ""')
        if [[ -n "$AUDIO_URL" ]] && [[ "$AUDIO_URL" != "null" ]]; then
            echo ""
            echo "Download audio with:"
            echo "curl -o output.mp3 \"$AUDIO_URL\""
        fi

    elif [[ "$STATUS" == "pending" ]] || [[ "$STATUS" == "processing" ]]; then
        echo "⏳ Job is still being processed"
        echo ""
        echo "Details:"
        echo "$RESPONSE" | jq '{
            status,
            text,
            voice_name,
            model_id,
            queue_position,
            credits_used,
            created_at,
            started_at
        }'

    elif [[ "$STATUS" == "failed" ]]; then
        echo "✗ Job failed"
        echo ""
        echo "Details:"
        echo "$RESPONSE" | jq '{
            status,
            error_message,
            text,
            voice_name,
            model_id,
            credits_used,
            created_at
        }'

    else
        # Show full response for unknown status
        echo "$RESPONSE" | jq .
    fi
else
    # Fallback without jq - just show raw response
    echo "$RESPONSE"
fi