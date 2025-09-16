# CreoleCentric TTS API Examples

Welcome to the CreoleCentric Text-to-Speech API examples repository! This collection provides comprehensive examples and documentation for integrating with the CreoleCentric TTS platform.

## 🚀 Quick Start

1. **Get your API Key**: Sign up at [creolecentric.com](https://creolecentric.com) and generate an API key from your dashboard.

2. **Set your API Key**:
   ```bash
   export CREOLECENTRIC_API_KEY="cc_your_api_key_here"
   ```

3. **Choose your language** and run the examples:
   - [Python](#python-example)
   - [Node.js](#nodejs-example)
   - [cURL](#curl-examples)

## 📚 Table of Contents

- [Features](#features)
- [API Overview](#api-overview)
- [Authentication](#authentication)
- [Examples](#examples)
  - [Python](#python-example)
  - [Node.js](#nodejs-example)
  - [cURL](#curl-examples)
- [API Endpoints](#api-endpoints)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Webhooks](#webhooks)
- [Best Practices](#best-practices)
- [Support](#support)

## ✨ Features

- **Haitian Creole TTS**: High-quality text-to-speech synthesis for Haitian Creole
- **Multiple Voices**: Various voices with different genders, ages, and accents
- **Flexible Models**: Different quality levels for various use cases
- **Batch Processing**: Process multiple texts efficiently
- **Express Mode**: Quick generation for short texts
- **Webhook Support**: Real-time status updates
- **Credit System**: Pay-as-you-go or subscription-based billing

## 🔑 Authentication

All API requests require authentication using an API key in the `Authorization` header:

```
Authorization: ApiKey cc_your_api_key_here
```

### Getting an API Key

1. Sign up or log in at [creolecentric.com](https://creolecentric.com)
2. Navigate to your dashboard
3. Go to the API section
4. Click "Generate New API Key"
5. **Important**: Save your key immediately - it won't be shown again!

### API Key Format

- Always starts with `cc_`
- Format: `cc_<key_id>_<secret>`
- Example: `cc_AbCdEfGh-IjKlMnOp-QrStUvWx-YzAbCdEf_1234567890AbCdEf-GhIjKlMnOpQrStUv-WxYzAbCdEfGhIjKl-MnOpQrStUvWxYzAb`
- Keep it secure and never share it publicly

### Getting Voice and Model IDs

#### Voice IDs
1. Go to the [Voice Library](https://creolecentric.com/voices) page
2. Click the "More" (⋮) button on any voice card
3. The Voice ID will be displayed (e.g., `qW6MAd7f5iuYw7bAH96wC`)

#### Model IDs
1. In the TTS interface, go to the "Speech Options" tab
2. Click on the Model field to open the Model Selection page
3. Each model displays its ID (e.g., `ccl_ht_v100` for the default Haitian Creole model)

## 💻 Examples

### Python Example

#### Installation

```bash
cd python
pip install -r requirements.txt
```

#### Usage

```python
from creolecentric_api import CreoleCentricAPI

# Initialize client
client = CreoleCentricAPI("cc_your_api_key_here")

# Create a TTS job
job = client.create_tts_job(
    text="Bonjou! Kijan ou ye?",
    voice_id="qW6MAd7f5iuYw7bAH96wC",  # Nicolas Innocent voice
    model_id="ccl_ht_v100"  # Default Haitian Creole model
)

# Wait for completion
result = client.wait_for_job(job["job_id"])
print(f"Audio URL: {result['audio_url']}")
```

#### Run the Full Example

```bash
cd python
python creolecentric_api.py
```

### Node.js Example

#### Installation

```bash
cd nodejs
npm install
```

#### Usage

```javascript
const CreoleCentricAPI = require('./creolecentric-api');

// Initialize client
const client = new CreoleCentricAPI('cc_your_api_key_here');

// Create a TTS job
const job = await client.createTTSJob(
    'Bonjou! Kijan ou ye?',
    'qW6MAd7f5iuYw7bAH96wC',  // Nicolas Innocent voice
    'ccl_ht_v100'  // Default Haitian Creole model
);

// Wait for completion
const result = await client.waitForJob(job.job_id);
console.log(`Audio URL: ${result.audio_url}`);
```

#### Run the Full Example

```bash
cd nodejs
node creolecentric-api.js
```

### cURL Examples

See [docs/curl-examples.md](docs/curl-examples.md) for comprehensive cURL command examples.

Quick example:

```bash
# Create a TTS job
curl -X POST "https://creolecentric.com/api/v1/tts/jobs/" \
  -H "Authorization: ApiKey cc_your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Bonjou! Kijan ou ye?",
    "voice_id": "qW6MAd7f5iuYw7bAH96wC",
    "model_id": "ccl_ht_v100"
  }'
```

### Complete Examples

The `examples/` directory contains ready-to-run scripts:

#### Polling Examples
- **[tts_job_with_polling.sh](examples/tts_job_with_polling.sh)** - Create a job and poll for completion
- **[check_job_status.sh](examples/check_job_status.sh)** - Check status of an existing job

#### Webhook Examples
- **[tts_job_with_webhook.sh](examples/tts_job_with_webhook.sh)** - Create a job with webhook notifications
- **[webhook_server.py](examples/webhook_server.py)** - Python webhook receiver server (Flask)
- **[webhook_server.js](examples/webhook_server.js)** - Node.js webhook receiver server (Express)

Run any example:
```bash
chmod +x examples/tts_job_with_polling.sh
./examples/tts_job_with_polling.sh
```

## 📡 API Endpoints

### Base URL
```
https://creolecentric.com/api/v1
```

### Main Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health/` | GET | Check API health status |
| `/credits/balance/` | GET | Get credit balance |
| `/tts/voices/` | GET | List available voices |
| `/tts/models/` | GET | List available models |
| `/tts/jobs/` | POST | Create a TTS job |
| `/tts/jobs/{job_id}/` | GET | Get job details |
| `/tts/jobs/{job_id}/status/` | GET | Get job status |
| `/tts/jobs/list/` | GET | List user's jobs |
| `/tts/jobs/{job_id}/cancel/` | POST | Cancel a job |
| `/tts/express/` | POST | Quick TTS for short texts |

### Request Parameters for TTS Jobs

```json
{
  "text": "Text to convert to speech (required)",
  "voice_id": "Voice identifier (required)",
  "model_id": "Model identifier (required)",
  "speed": 1.0,        // Optional: 0.5 to 2.0
  "pitch": 1.0,        // Optional: 0.5 to 2.0
  "webhook_url": "https://your-server.com/webhook"  // Optional
}
```

## ⚠️ Error Handling

### Common Error Codes

| Code | Description | Solution |
|------|-------------|----------|
| 401 | Unauthorized | Check your API key |
| 403 | Forbidden | Check credits or subscription status |
| 404 | Not Found | Verify endpoint URL and resource ID |
| 429 | Too Many Requests | Wait before retrying (check rate limits) |
| 500 | Server Error | Contact support if persists |

### Error Response Format

```json
{
  "error": "Error message",
  "detail": "Detailed error description",
  "code": "ERROR_CODE"
}
```

## ⏱️ Rate Limiting

Rate limits are based on your subscription plan:

| Plan | Requests/Hour | Concurrent Jobs |
|------|---------------|-----------------|
| Free | 10 | 1 |
| Starter | 60 | 3 |
| Creator | 300 | 5 |
| Pro | 600 | 10 |
| Business | 1,200 | 20 |
| Enterprise | Unlimited | Unlimited |

Rate limit information is included in response headers:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Reset time (Unix timestamp)

## 🔔 Webhooks

Webhooks provide real-time updates for job status changes.

### Setting up Webhooks

Include a `webhook_url` when creating a job:

```json
{
  "text": "Your text here",
  "voice_id": "voice_1",
  "model_id": "model_1",
  "webhook_url": "https://your-server.com/webhook"
}
```

### Webhook Events

- `queued`: Job added to processing queue
- `processing`: Job processing started
- `completed`: Job completed successfully
- `failed`: Job failed
- `cancelled`: Job was cancelled

### Webhook Payload

```json
{
  "event": "completed",
  "job_id": "123e4567-e89b-12d3-a456-426614174000",
  "status": "completed",
  "audio_url": "https://s3.example.com/audio/file.mp3",
  "duration_seconds": 5.2,
  "credits_used": 52,
  "timestamp": "2025-09-12T12:00:00Z"
}
```

## 💡 Best Practices

1. **API Key Security**
   - Never commit API keys to version control
   - Use environment variables or secure key management
   - Rotate keys periodically

2. **Efficient Usage**
   - Cache voice and model lists (they rarely change)
   - Use batch processing for multiple texts
   - Implement exponential backoff for retries

3. **Job Management**
   - Store job IDs for tracking
   - Use webhooks instead of polling when possible
   - Clean up old jobs periodically

4. **Error Handling**
   - Implement comprehensive error handling
   - Log errors for debugging
   - Have fallback mechanisms

5. **Credit Optimization**
   - Monitor credit usage
   - Use appropriate models for your needs
   - Consider subscription plans for regular usage

## 🧪 Testing

### Test Your Setup

1. **Test Authentication**:
   ```bash
   curl -X GET "https://creolecentric.com/api/v1/health/" \
     -H "Authorization: ApiKey cc_your_api_key"
   ```

2. **Test Credit Balance**:
   ```bash
   curl -X GET "https://creolecentric.com/api/v1/credits/balance/" \
     -H "Authorization: ApiKey cc_your_api_key"
   ```

3. **Test TTS Creation**:
   ```bash
   curl -X POST "https://creolecentric.com/api/v1/tts/jobs/" \
     -H "Authorization: ApiKey cc_your_api_key" \
     -H "Content-Type: application/json" \
     -d '{"text": "Test", "voice_id": "qW6MAd7f5iuYw7bAH96wC", "model_id": "ccl_ht_v100"}'
   ```

## 📖 Additional Resources

- [API Documentation](https://creolecentric.com/docs/api)
- [Voice Samples](https://creolecentric.com/voices)
- [Pricing](https://creolecentric.com/pricing)
- [Status Page](https://status.creolecentric.com)

## 🤝 Support

Need help? We're here for you!

- **Email**: support@creolecentric.com
- **Documentation**: [creolecentric.com/docs](https://creolecentric.com/docs)
- **Community Forum**: [forum.creolecentric.com](https://forum.creolecentric.com)
- **GitHub Issues**: [github.com/creolecentric/api-examples/issues](https://github.com/creolecentric/api-examples/issues)

## 📄 License

These examples are provided under the MIT License. See [LICENSE](LICENSE) file for details.

## 🌟 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

Made with ❤️ by CreoleCentric - Bringing Haitian Creole to the digital age