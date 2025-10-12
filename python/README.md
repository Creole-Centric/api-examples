# CreoleCentric API - Python Examples

Python implementation of the CreoleCentric Text-to-Speech API client with examples for popular frameworks.

## Quick Start

### Basic Client Usage

The `creolecentric_api.py` file provides a standalone client that works with any Python application:

```bash
# Install dependencies
pip install -r requirements.txt

# Set up your API key
cp .env.example .env
# Edit .env and add your API key

# Run the example
python creolecentric_api.py
```

## Framework-Specific Examples

We provide integration examples for popular Python web frameworks:

### 📦 Available Examples

- **[requests-example/](requests-example/)** - Simple requests-based implementation (no framework)
  - Best for: Standalone scripts, CLI tools, background jobs
  - Minimal dependencies

- **[flask-example/](flask-example/)** - Flask web application integration
  - Best for: Simple web apps, APIs, microservices
  - Includes webhook handling

- **[fastapi-example/](fastapi-example/)** - FastAPI integration with async support
  - Best for: High-performance APIs, async applications
  - Modern Python 3.7+ features

- **[django-example/](django-example/)** - Django integration
  - Best for: Full-featured web applications
  - Database models, admin interface

## Installation

### Requirements

- Python 3.7 or higher
- pip

### Dependencies

```bash
pip install -r requirements.txt
```

## Basic Usage

```python
from creolecentric_api import CreoleCentricAPI

# Initialize client
client = CreoleCentricAPI(os.getenv("CREOLECENTRIC_API_KEY"))

# Create a TTS job
job = client.create_tts_job(
    text="Bonjou! Kijan ou ye?",
    voice_id="i4mRPwKM2yHwXhbmkN514",
    model_id="ccl_ht_v100",
    webhook_url="https://your-app.com/webhooks/tts"
)

print(f"Job created: {job['id']}")
```

## API Methods

### Health & User
- `check_health()` - Check API health status
- `get_user_info()` - Get current user information
- `get_credit_balance()` - Get credit balance

### Voices & Models
- `get_voices()` - List available voices
- `get_models()` - List available TTS models
- `get_voice_settings()` - Get voice settings configuration

### TTS Jobs
- `create_tts_job(text, voice_id, model_id, **kwargs)` - Create new TTS job
- `get_job_status(job_id)` - Get job status
- `get_job_details(job_id)` - Get full job details
- `list_jobs(limit, offset)` - List user's jobs
- `cancel_job(job_id)` - Cancel a job

### Express TTS
- `express_tts(text, voice_id)` - Generate audio immediately (short texts)

## Webhook Integration

When creating a TTS job, you can specify a `webhook_url` to receive real-time status updates:

```python
job = client.create_tts_job(
    text="Your text here",
    webhook_url="https://your-app.com/webhooks/tts"
)
```

Webhook stages:
- `tts_queued` - Job queued
- `tts_started` - Processing started
- `tts_synthesized` - Audio synthesized
- `tts_uploaded` - Audio uploaded to storage
- `tts_delivered` - Final delivery complete

See the framework examples for webhook handling implementations.

## Error Handling

```python
try:
    job = client.create_tts_job("Some text")
except requests.exceptions.HTTPError as e:
    print(f"API error: {e}")
    print(f"Response: {e.response.text}")
```

## Choosing an Example

| Use Case | Recommended Example |
|----------|-------------------|
| Simple script or automation | `requests-example/` |
| Lightweight web app | `flask-example/` |
| Modern async API | `fastapi-example/` |
| Full-featured application | `django-example/` |

## Resources

- [Full API Documentation](https://github.com/Creole-Centric/api-examples)
- [CreoleCentric Website](https://creolecentric.com)
