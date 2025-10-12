# CreoleCentric API - cURL Examples

Command-line examples for interacting with the CreoleCentric Text-to-Speech API using cURL.

## Requirements

- cURL (pre-installed on most systems)
- jq (optional, for JSON formatting)

### Install jq (optional)

```bash
# macOS
brew install jq

# Ubuntu/Debian
sudo apt-get install jq

# CentOS/RHEL
sudo yum install jq
```

## Setup

Set your API key as an environment variable:

```bash
export CREOLECENTRIC_API_KEY="cc_your_api_key_here"
```

Or create a `.env` file:

```bash
echo "CREOLECENTRIC_API_KEY=cc_your_api_key_here" > .env
source .env
```

## Quick Start

Run all examples:

```bash
./examples.sh
```

## Individual Examples

### 1. Health Check

```bash
./01-health-check.sh
```

Or manually:

```bash
curl -X GET "https://creolecentric.com/api/v1/health/" \
  -H "Authorization: ApiKey ${CREOLECENTRIC_API_KEY}" \
  -H "Content-Type: application/json"
```

### 2. Create TTS Job

```bash
./02-create-tts-job.sh
```

Or manually:

```bash
curl -X POST "https://creolecentric.com/api/v1/tts/jobs/" \
  -H "Authorization: ApiKey ${CREOLECENTRIC_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Bonjou! Kijan ou ye?",
    "voice_id": "i4mRPwKM2yHwXhbmkN514",
    "model_id": "ccl_ht_v100",
    "webhook_url": "https://your-app.com/webhooks/tts"
  }'
```

## Common Operations

### Get Credit Balance

```bash
curl -X GET "https://creolecentric.com/api/v1/credits/balance/" \
  -H "Authorization: ApiKey ${CREOLECENTRIC_API_KEY}" \
  -H "Content-Type: application/json"
```

### List Available Voices

```bash
curl -X GET "https://creolecentric.com/api/v1/tts/voices/" \
  -H "Authorization: ApiKey ${CREOLECENTRIC_API_KEY}" \
  -H "Content-Type: application/json"
```

### Get Job Status

```bash
JOB_ID="your-job-id-here"
curl -X GET "https://creolecentric.com/api/v1/tts/jobs/${JOB_ID}/status/" \
  -H "Authorization: ApiKey ${CREOLECENTRIC_API_KEY}" \
  -H "Content-Type: application/json"
```

### List Recent Jobs

```bash
curl -X GET "https://creolecentric.com/api/v1/tts/jobs/list/?limit=10&offset=0" \
  -H "Authorization: ApiKey ${CREOLECENTRIC_API_KEY}" \
  -H "Content-Type: application/json"
```

### Cancel a Job

```bash
JOB_ID="your-job-id-here"
curl -X POST "https://creolecentric.com/api/v1/tts/jobs/${JOB_ID}/cancel/" \
  -H "Authorization: ApiKey ${CREOLECENTRIC_API_KEY}" \
  -H "Content-Type: application/json"
```

## Webhook Integration

To receive real-time updates about your TTS job, include a `webhook_url` when creating the job:

```bash
curl -X POST "https://creolecentric.com/api/v1/tts/jobs/" \
  -H "Authorization: ApiKey ${CREOLECENTRIC_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Your text here",
    "voice_id": "i4mRPwKM2yHwXhbmkN514",
    "model_id": "ccl_ht_v100",
    "webhook_url": "https://your-app.com/webhooks/tts"
  }'
```

Your webhook endpoint will receive POST requests for each stage:
- `tts_queued` - Job queued
- `tts_started` - Processing started
- `tts_synthesized` - Audio synthesized
- `tts_uploaded` - Audio uploaded to storage
- `tts_delivered` - Final delivery complete

## Express TTS (Short Texts)

For immediate audio generation of short texts:

```bash
curl -X POST "https://creolecentric.com/api/v1/tts/express/" \
  -H "Authorization: ApiKey ${CREOLECENTRIC_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Bonjou!",
    "voice_id": "i4mRPwKM2yHwXhbmkN514"
  }' \
  --output audio.mp3
```

## Using with Environment Files

If you're using an `.env` file, source it first:

```bash
source .env
./examples.sh
```

Or use it inline:

```bash
env $(cat .env | xargs) ./examples.sh
```

## Tips

### Pretty Print JSON

Use `jq` for formatted output:

```bash
curl ... | jq '.'
```

### Save Response to File

```bash
curl ... > response.json
```

### Include HTTP Headers in Output

```bash
curl -i ...
```

### Verbose Output for Debugging

```bash
curl -v ...
```

## Error Handling

Check the HTTP status code:

```bash
HTTP_STATUS=$(curl -s -o response.json -w "%{http_code}" ...)

if [ $HTTP_STATUS -eq 200 ]; then
    echo "Success!"
    cat response.json | jq '.'
else
    echo "Error: HTTP $HTTP_STATUS"
    cat response.json
fi
```

## Resources

- [Full API Documentation](https://github.com/Creole-Centric/api-examples)
- [CreoleCentric Website](https://creolecentric.com)
- [cURL Documentation](https://curl.se/docs/)
