# CreoleCentric API - cURL Examples

This document provides cURL command examples for all CreoleCentric API endpoints.

## Prerequisites

Set your API key as an environment variable:

```bash
export API_KEY="cc_your_api_key_here"
export BASE_URL="https://creolecentric.com/api/v1"
```

## Authentication

All requests must include the API key in the `Authorization` header:

```
Authorization: ApiKey cc_your_api_key_here
```

## API Endpoints

### 1. Health Check

Check if the API is operational:

```bash
curl -X GET "$BASE_URL/health/" \
  -H "Authorization: ApiKey $API_KEY"
```

**Response:**
```json
{
  "status": "healthy",
  "service": "CreoleCentric TTS Platform",
  "database": "healthy",
  "version": "4.0.5"
}
```

### 2. User Information

#### Get User Profile

```bash
curl -X GET "$BASE_URL/users/profile/" \
  -H "Authorization: ApiKey $API_KEY"
```

#### Get Credit Balance

```bash
curl -X GET "$BASE_URL/credits/balance/" \
  -H "Authorization: ApiKey $API_KEY"
```

**Response:**
```json
{
  "total_credits": 100000,
  "subscription_credits": 100000,
  "purchased_credits": 0,
  "subscription_plan": "creator"
}
```

### 3. Voices and Models

#### List Available Voices

```bash
curl -X GET "$BASE_URL/tts/voices/" \
  -H "Authorization: ApiKey $API_KEY"
```

**Response:**
```json
[
  {
    "voice_id": "voice_1",
    "name": "Marie",
    "language": "ht",
    "gender": "female",
    "age": "young",
    "accent": "standard",
    "description": "Clear and friendly female voice"
  },
  ...
]
```

#### List Available Models

```bash
curl -X GET "$BASE_URL/tts/models/" \
  -H "Authorization: ApiKey $API_KEY"
```

**Response:**
```json
[
  {
    "model_id": "model_1",
    "name": "Standard",
    "description": "Standard quality TTS model",
    "languages": ["ht"],
    "max_characters": 5000
  },
  ...
]
```

#### Get Voice Settings

```bash
curl -X GET "$BASE_URL/tts/voice-settings/" \
  -H "Authorization: ApiKey $API_KEY"
```

### 4. TTS Job Management

#### Create a TTS Job

```bash
curl -X POST "$BASE_URL/tts/jobs/" \
  -H "Authorization: ApiKey $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Bonjou! Kijan ou ye jodi a?",
    "voice_id": "voice_1",
    "model_id": "model_1",
    "speed": 1.0,
    "pitch": 1.0
  }'
```

**Response:**
```json
{
  "job_id": "123e4567-e89b-12d3-a456-426614174000",
  "status": "pending",
  "text": "Bonjou! Kijan ou ye jodi a?",
  "voice_id": "voice_1",
  "model_id": "model_1",
  "credits_used": 25,
  "created_at": "2025-09-12T12:00:00Z"
}
```

#### Get Job Status

```bash
curl -X GET "$BASE_URL/tts/jobs/{job_id}/status/" \
  -H "Authorization: ApiKey $API_KEY"
```

**Response:**
```json
{
  "job_id": "123e4567-e89b-12d3-a456-426614174000",
  "status": "completed",
  "progress": 100,
  "audio_url": "https://s3.example.com/audio/123e4567.mp3",
  "duration_seconds": 2.5
}
```

#### Get Job Details

```bash
curl -X GET "$BASE_URL/tts/jobs/{job_id}/" \
  -H "Authorization: ApiKey $API_KEY"
```

#### List Jobs

```bash
curl -X GET "$BASE_URL/tts/jobs/list/?limit=10&offset=0" \
  -H "Authorization: ApiKey $API_KEY"
```

**Response:**
```json
{
  "count": 50,
  "next": "$BASE_URL/tts/jobs/list/?limit=10&offset=10",
  "previous": null,
  "results": [
    {
      "job_id": "123e4567-e89b-12d3-a456-426614174000",
      "status": "completed",
      "text": "Bonjou! Kijan ou ye jodi a?",
      "created_at": "2025-09-12T12:00:00Z",
      "audio_url": "https://s3.example.com/audio/123e4567.mp3"
    },
    ...
  ]
}
```

#### Cancel a Job

```bash
curl -X POST "$BASE_URL/tts/jobs/{job_id}/cancel/" \
  -H "Authorization: ApiKey $API_KEY"
```

#### Delete Multiple Jobs

```bash
curl -X POST "$BASE_URL/tts/jobs/bulk-delete/" \
  -H "Authorization: ApiKey $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "job_ids": [
      "123e4567-e89b-12d3-a456-426614174000",
      "234e5678-e89b-12d3-a456-426614174001"
    ]
  }'
```

### 5. Express TTS (Quick Generation)

For short texts (< 500 characters) that need immediate generation:

```bash
curl -X POST "$BASE_URL/tts/express/" \
  -H "Authorization: ApiKey $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Mèsi anpil!",
    "voice_id": "voice_1"
  }' \
  --output audio.mp3
```

This endpoint returns the audio file directly in the response.

### 6. Advanced Features

#### Batch TTS Processing

Submit multiple texts for processing:

```bash
curl -X POST "$BASE_URL/tts/batch/submit/" \
  -H "Authorization: ApiKey $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "text": "Premye tèks la",
        "voice_id": "voice_1",
        "model_id": "model_1"
      },
      {
        "text": "Dezyèm tèks la",
        "voice_id": "voice_2",
        "model_id": "model_1"
      }
    ],
    "webhook_url": "https://your-server.com/webhook"
  }'
```

#### Voice Preview

Generate a preview of a voice:

```bash
curl -X POST "$BASE_URL/tts/voice-preview/" \
  -H "Authorization: ApiKey $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "voice_id": "voice_1",
    "text": "Sa se yon tès vwa"
  }'
```

### 7. Webhook Integration

When creating jobs, you can specify a webhook URL to receive status updates:

```bash
curl -X POST "$BASE_URL/tts/jobs/" \
  -H "Authorization: ApiKey $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Tèks pou konvèti",
    "voice_id": "voice_1",
    "model_id": "model_1",
    "webhook_url": "https://your-server.com/webhook",
    "webhook_events": ["queued", "processing", "completed", "failed"]
  }'
```

## Error Handling

### Common Error Responses

#### 401 Unauthorized
```json
{
  "detail": "Authentication credentials were not provided."
}
```

#### 403 Forbidden
```json
{
  "error": "Insufficient credits. You have 0 credits remaining."
}
```

#### 404 Not Found
```json
{
  "error": "Job not found"
}
```

#### 429 Too Many Requests
```json
{
  "error": "Rate limit exceeded. Please wait before making more requests."
}
```

#### 500 Internal Server Error
```json
{
  "error": "An internal error occurred. Please try again later."
}
```

## Rate Limiting

The API implements rate limiting based on your subscription plan:

- **Free**: 10 requests per hour
- **Starter**: 60 requests per hour
- **Creator**: 300 requests per hour
- **Pro**: 600 requests per hour
- **Business**: 1,200 requests per hour
- **Enterprise**: Unlimited

Rate limit information is included in response headers:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Time when the limit resets (Unix timestamp)

## Best Practices

1. **Always check job status** before attempting to download audio
2. **Implement exponential backoff** when polling for job status
3. **Store job IDs** for tracking and future reference
4. **Handle errors gracefully** with appropriate retry logic
5. **Use webhooks** for production applications instead of polling
6. **Batch small requests** to optimize credit usage
7. **Cache voice and model lists** as they don't change frequently

## Testing

Test your API key and connection:

```bash
# Simple health check
curl -X GET "$BASE_URL/health/" \
  -H "Authorization: ApiKey $API_KEY" \
  -w "\nHTTP Status: %{http_code}\n"

# If successful, test creating a simple job
curl -X POST "$BASE_URL/tts/jobs/" \
  -H "Authorization: ApiKey $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"text": "Test", "voice_id": "voice_1", "model_id": "model_1"}' \
  -w "\nHTTP Status: %{http_code}\n"
```

## Support

For API support, please contact:
- Email: support@creolecentric.com
- Documentation: https://creolecentric.com/docs/api
- Status Page: https://status.creolecentric.com