# CreoleCentric TTS Django Example

This example demonstrates how to integrate the CreoleCentric Text-to-Speech API with a Django web application.

## Features

- **Django REST Framework**: RESTful API endpoints
- **Webhook Support**: Real-time job status updates (RECOMMENDED)
- **Server-Side API Integration**: Secure API key handling
- **Model-View-Template**: Django's MVT architecture
- **Admin Interface**: Built-in Django admin for job management
- **Database**: SQLite for development, PostgreSQL-ready
- **Type Hints**: Full type annotations
- **Webhook Signature Validation**: Secure webhook authentication

## Prerequisites

- Python 3.8 or higher
- pip package manager
- CreoleCentric API key (get one at https://creolecentric.com)

## Setup

1. **Clone this example**:
   ```bash
   git clone https://github.com/Creole-Centric/api-examples.git
   cd api-examples/python/django-example
   ```

2. **Create virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your API credentials:
   ```env
   SECRET_KEY=your-django-secret-key-here
   DEBUG=True
   CREOLECENTRIC_API_KEY=cc_your_api_key_here
   CREOLECENTRIC_API_URL=https://api.creolecentric.com/v1
   ```

5. **Run migrations**:
   ```bash
   python manage.py migrate
   ```

6. **Create superuser** (optional):
   ```bash
   python manage.py createsuperuser
   ```

7. **Run the development server**:
   ```bash
   python manage.py runserver
   ```

   The API will be available at [http://localhost:8000](http://localhost:8000)

## Project Structure

```
django-example/
├── manage.py                    # Django management script
├── config/                      # Project configuration
│   ├── settings.py             # Django settings
│   ├── urls.py                 # Root URL configuration
│   └── wsgi.py                 # WSGI application
├── tts/                        # TTS app
│   ├── models.py              # Database models
│   ├── views.py               # API views
│   ├── webhook_views.py       # Webhook receiver (RECOMMENDED)
│   ├── serializers.py         # DRF serializers
│   ├── urls.py                # App URL configuration
│   └── services.py            # CreoleCentric API client
├── requirements.txt            # Python dependencies
└── README.md                   # This file
```

## API Endpoints

### Create TTS Job
```http
POST /api/tts/jobs/
Content-Type: application/json

{
  "text": "Bonjou! Kijan ou ye?",
  "voice_id": "i4mRPwKM2yHwXhbmkN514",
  "model_id": "ccl_ht_v100"
}
```

### Get Job Status
```http
GET /api/tts/jobs/{job_id}/
```

### List Jobs
```http
GET /api/tts/jobs/
```

### Get Voices
```http
GET /api/tts/voices/
```

### Get Models
```http
GET /api/tts/models/
```

### Get Credit Balance
```http
GET /api/credits/balance/
```

## Usage Examples

### Using curl

```bash
# Create a TTS job
curl -X POST http://localhost:8000/api/tts/jobs/ \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Bonjou! Kijan ou ye?",
    "voice_id": "i4mRPwKM2yHwXhbmkN514",
    "model_id": "ccl_ht_v100"
  }'

# Check job status
curl http://localhost:8000/api/tts/jobs/{job_id}/

# Get available voices
curl http://localhost:8000/api/tts/voices/
```

### Using Python Requests

```python
import requests

# Create a TTS job
response = requests.post(
    'http://localhost:8000/api/tts/jobs/',
    json={
        'text': 'Bonjou! Kijan ou ye?',
        'voice_id': 'i4mRPwKM2yHwXhbmkN514',
        'model_id': 'ccl_ht_v100'
    }
)

job = response.json()
print(f"Job created: {job['id']}")

# Check job status
status_response = requests.get(f"http://localhost:8000/api/tts/jobs/{job['id']}/")
status = status_response.json()
print(f"Status: {status['status']}")
```

## Webhooks (RECOMMENDED)

Webhooks provide real-time job status updates and are the **RECOMMENDED** method for production applications. They eliminate the need for polling and provide instant notifications when job status changes.

### Why Use Webhooks?

- **Real-time Updates**: Instant notifications when jobs complete
- **Efficient**: No polling required, reduces API load
- **Scalable**: Better performance for high-volume applications
- **Event-Driven**: React to job events immediately

### Webhook Setup

1. **Add webhook endpoint to your URLs** (already configured in this example):
   ```python
   # tts/urls.py
   path('webhooks/tts/', webhook_views.webhook_receiver, name='webhook-receiver'),
   ```

2. **Make your webhook URL publicly accessible**:
   - For local development: Use [ngrok](https://ngrok.com/) or similar
   - For production: Use your actual domain

3. **Configure webhook URL when creating jobs**:
   ```python
   import requests

   response = requests.post(
       'http://localhost:8000/api/tts/jobs/',
       json={
           'text': 'Bonjou! Kijan ou ye?',
           'voice_id': 'i4mRPwKM2yHwXhbmkN514',
           'model_id': 'ccl_ht_v100',
           'callback_url': 'https://your-domain.com/api/webhooks/tts/'  # Your webhook URL
       }
   )
   ```

### Webhook Events

The CreoleCentric API sends webhooks for the following events:

- `tts_queued`: Job has been queued for processing
- `tts_started`: Job processing has started
- `tts_synthesized`: TTS synthesis is complete
- `tts_uploaded`: Audio file uploaded to storage
- `tts_delivered`: Job is fully complete and audio is available
- `tts_failed`: Job processing failed

### Webhook Payload Example

```json
{
  "event": "tts_delivered",
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "delivered",
  "audio_url": "https://storage.creolecentric.com/audio/abc123.mp3",
  "duration_seconds": 12.5,
  "credits_used": 150,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Webhook Security (Optional)

Webhook signature validation is **optional** but **recommended** for production. If you configure a webhook secret, all webhooks will be signed with HMAC-SHA256.

1. **Get your webhook secret** from the CreoleCentric dashboard

2. **Add to environment variables**:
   ```env
   CREOLECENTRIC_WEBHOOK_SECRET=your-webhook-secret-here
   ```

3. **Signature validation** happens automatically (see `tts/webhook_views.py`)

**Note**: If no webhook secret is configured, webhooks will still work but without signature validation. This is fine for development and testing.

### Testing Webhooks Locally

Use [ngrok](https://ngrok.com/) to expose your local server:

```bash
# Start your Django server
python manage.py runserver

# In another terminal, start ngrok
ngrok http 8000
```

Then use the ngrok URL as your callback URL:
```
https://abc123.ngrok.io/api/webhooks/tts/
```

### Webhook vs Polling

**Webhooks (RECOMMENDED)**:
```python
# Create job with callback URL - no polling needed!
response = requests.post(
    'http://localhost:8000/api/tts/jobs/',
    json={
        'text': 'Bonjou!',
        'voice_id': 'i4mRPwKM2yHwXhbmkN514',
        'model_id': 'ccl_ht_v100',
        'callback_url': 'https://your-domain.com/api/webhooks/tts/'
    }
)
# Your webhook endpoint will be called automatically when the job completes
```

**Polling (NOT RECOMMENDED)**:
```python
# Create job without callback
response = requests.post(...)
job_id = response.json()['id']

# Poll every 2 seconds (inefficient!)
import time
while True:
    status = requests.get(f'http://localhost:8000/api/tts/jobs/{job_id}/')
    if status.json()['status'] == 'delivered':
        break
    time.sleep(2)
```

## Django Models

The example includes a `TTSJob` model for tracking jobs:

```python
class TTSJob(models.Model):
    job_id = models.CharField(max_length=255, unique=True)
    text = models.TextField()
    voice_id = models.CharField(max_length=255)
    model_id = models.CharField(max_length=255)
    status = models.CharField(max_length=50)
    audio_url = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(blank=True, null=True)
```

## Django Admin

Access the admin interface at [http://localhost:8000/admin](http://localhost:8000/admin) to:
- View all TTS jobs
- Monitor job status
- Access audio URLs
- Debug issues

## Development

### Run Tests

```bash
python manage.py test
```

### Create Database Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### Collect Static Files

```bash
python manage.py collectstatic
```

## Deployment

### Using Gunicorn

```bash
pip install gunicorn
gunicorn config.wsgi:application --bind 0.0.0.0:8000
```

### Using Docker

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
RUN python manage.py collectstatic --noinput

CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000"]
```

### Environment Variables for Production

```env
SECRET_KEY=your-production-secret-key
DEBUG=False
ALLOWED_HOSTS=your-domain.com,www.your-domain.com
DATABASE_URL=postgresql://user:pass@localhost/dbname
CREOLECENTRIC_API_KEY=cc_your_api_key_here
CREOLECENTRIC_API_URL=https://api.creolecentric.com/v1
```

## Security Considerations

- API key is stored in environment variables (never in code)
- CSRF protection enabled for form submissions
- Django's built-in security middleware active
- HTTPS recommended for production
- Rate limiting recommended (use django-ratelimit)

## Learn More

- [CreoleCentric API Documentation](https://creolecentric.com/developer)
- [Django Documentation](https://docs.djangoproject.com)
- [Django REST Framework](https://www.django-rest-framework.org)

## Support

For questions or issues:
- Email: support@creolecentric.com
- GitHub: https://github.com/Creole-Centric/api-examples/issues

## License

MIT
