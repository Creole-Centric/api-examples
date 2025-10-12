# CreoleCentric TTS Flask Example

This example demonstrates how to integrate the CreoleCentric Text-to-Speech API with a Flask web application.

## Features

- **Lightweight Framework**: Minimal Flask setup
- **RESTful API**: Clean REST endpoints
- **Webhook Support**: Real-time job status updates (RECOMMENDED)
- **Server-Side API Integration**: Secure API key handling
- **Blueprint Architecture**: Organized route structure
- **Error Handling**: Comprehensive exception handling
- **CORS Support**: Cross-origin request handling
- **Webhook Signature Validation**: Secure webhook authentication

## Prerequisites

- Python 3.8 or higher
- pip package manager
- CreoleCentric API key (get one at https://creolecentric.com)

## Setup

1. **Clone this example**:
   ```bash
   git clone https://github.com/Creole-Centric/api-examples.git
   cd api-examples/python/flask-example
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
   FLASK_APP=app.py
   FLASK_ENV=development
   CREOLECENTRIC_API_KEY=cc_your_api_key_here
   CREOLECENTRIC_API_URL=https://api.creolecentric.com/v1
   ```

5. **Run the development server**:
   ```bash
   flask run
   ```

   The API will be available at [http://localhost:5000](http://localhost:5000)

## Project Structure

```
flask-example/
├── app.py                       # Main Flask application
├── services/
│   └── creolecentric.py        # CreoleCentric API client
├── routes/
│   ├── tts.py                  # TTS routes blueprint
│   └── webhooks.py             # Webhook receiver (RECOMMENDED)
├── requirements.txt            # Python dependencies
└── README.md                   # This file
```

## API Endpoints

### Create TTS Job
```http
POST /api/tts/jobs
Content-Type: application/json

{
  "text": "Bonjou! Kijan ou ye?",
  "voice_id": "i4mRPwKM2yHwXhbmkN514",
  "model_id": "ccl_ht_v100"
}
```

### Get Job Status
```http
GET /api/tts/jobs/<job_id>
```

### Get Voices
```http
GET /api/tts/voices
```

### Get Models
```http
GET /api/tts/models
```

### Get Credit Balance
```http
GET /api/credits/balance
```

## Usage Examples

### Using curl

```bash
# Create a TTS job
curl -X POST http://localhost:5000/api/tts/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Bonjou! Kijan ou ye?",
    "voice_id": "i4mRPwKM2yHwXhbmkN514",
    "model_id": "ccl_ht_v100"
  }'

# Check job status
curl http://localhost:5000/api/tts/jobs/{job_id}

# Get available voices
curl http://localhost:5000/api/tts/voices
```

### Using Python Requests

```python
import requests

# Create a TTS job
response = requests.post(
    'http://localhost:5000/api/tts/jobs',
    json={
        'text': 'Bonjou! Kijan ou ye?',
        'voice_id': 'i4mRPwKM2yHwXhbmkN514',
        'model_id': 'ccl_ht_v100'
    }
)

job = response.json()
print(f"Job created: {job['id']}")

# Check job status
status_response = requests.get(f"http://localhost:5000/api/tts/jobs/{job['id']}")
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

1. **Webhook endpoints are already configured** in this example via the `webhooks` blueprint

2. **Make your webhook URL publicly accessible**:
   - For local development: Use [ngrok](https://ngrok.com/) or similar
   - For production: Use your actual domain

3. **Configure webhook URL when creating jobs**:
   ```python
   import requests

   response = requests.post(
       'http://localhost:5000/api/tts/jobs',
       json={
           'text': 'Bonjou! Kijan ou ye?',
           'voice_id': 'i4mRPwKM2yHwXhbmkN514',
           'model_id': 'ccl_ht_v100',
           'callback_url': 'https://your-domain.com/api/webhooks/tts'  # Your webhook URL
       }
   )
   ```

### Webhook Events

- `tts_queued`: Job has been queued for processing
- `tts_started`: Job processing has started
- `tts_synthesized`: TTS synthesis is complete
- `tts_uploaded`: Audio file uploaded to storage
- `tts_delivered`: Job is fully complete and audio is available
- `tts_failed`: Job processing failed

### Webhook Security (Optional)

Webhook signature validation is **optional** but **recommended** for production:

```env
CREOLECENTRIC_WEBHOOK_SECRET=your-webhook-secret-here
```

**Note**: If no webhook secret is configured, webhooks will still work but without signature validation.

### Testing Webhooks Locally

Use [ngrok](https://ngrok.com/) to expose your local server:

```bash
# Start Flask server
flask run

# In another terminal, start ngrok
ngrok http 5000
```

Then use the ngrok URL as your callback URL:
```
https://abc123.ngrok.io/api/webhooks/tts
```

## Development

### Run in Debug Mode

```bash
export FLASK_ENV=development
flask run --debug
```

### Run with Custom Port

```bash
flask run --port 8000
```

## Deployment

### Using Gunicorn

```bash
pip install gunicorn
gunicorn app:app --bind 0.0.0.0:5000
```

### Using uWSGI

```bash
pip install uwsgi
uwsgi --http :5000 --wsgi-file app.py --callable app
```

### Using Docker

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD ["gunicorn", "app:app", "--bind", "0.0.0.0:5000"]
```

### Environment Variables for Production

```env
FLASK_ENV=production
SECRET_KEY=your-production-secret-key
CREOLECENTRIC_API_KEY=cc_your_api_key_here
CREOLECENTRIC_API_URL=https://api.creolecentric.com/v1
```

## Security Considerations

- API key is stored in environment variables (never in code)
- CORS configured - update origins for production
- HTTPS recommended for production
- Rate limiting recommended (use Flask-Limiter)
- Input validation on all endpoints

## Learn More

- [CreoleCentric API Documentation](https://creolecentric.com/developer)
- [Flask Documentation](https://flask.palletsprojects.com)
- [Flask Blueprints](https://flask.palletsprojects.com/en/latest/blueprints/)

## Support

For questions or issues:
- Email: support@creolecentric.com
- GitHub: https://github.com/Creole-Centric/api-examples/issues

## License

MIT
