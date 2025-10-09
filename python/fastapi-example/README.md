# CreoleCentric TTS FastAPI Example

This example demonstrates how to integrate the CreoleCentric Text-to-Speech API with a FastAPI web application.

## Features

- **Modern Async Framework**: Built on async/await with type hints
- **Automatic API Documentation**: Built-in Swagger UI and ReDoc
- **Pydantic Models**: Type-safe request/response validation
- **High Performance**: One of the fastest Python frameworks
- **Server-Side API Integration**: Secure API key handling
- **CORS Support**: Cross-origin request handling

## Prerequisites

- Python 3.8 or higher
- pip package manager
- CreoleCentric API key (get one at https://creolecentric.com)

## Setup

1. **Clone this example**:
   ```bash
   git clone https://github.com/Creole-Centric/api-examples.git
   cd api-examples/python/fastapi-example
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
   CREOLECENTRIC_API_KEY=cc_your_api_key_here
   CREOLECENTRIC_API_URL=https://creolecentric.com/api/v1
   ```

5. **Run the development server**:
   ```bash
   uvicorn main:app --reload
   ```

   The API will be available at:
   - API: [http://localhost:8000](http://localhost:8000)
   - Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
   - ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

## Project Structure

```
fastapi-example/
├── main.py                      # FastAPI application
├── models.py                    # Pydantic models
├── services/
│   └── creolecentric.py        # CreoleCentric API client
├── routers/
│   └── tts.py                  # TTS routes
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
GET /api/tts/jobs/{job_id}
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

## Interactive API Documentation

FastAPI automatically generates interactive API documentation:

- **Swagger UI**: Visit [http://localhost:8000/docs](http://localhost:8000/docs) to try out the API interactively
- **ReDoc**: Visit [http://localhost:8000/redoc](http://localhost:8000/redoc) for alternative documentation

## Usage Examples

### Using curl

```bash
# Create a TTS job
curl -X POST http://localhost:8000/api/tts/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Bonjou! Kijan ou ye?",
    "voice_id": "i4mRPwKM2yHwXhbmkN514",
    "model_id": "ccl_ht_v100"
  }'

# Check job status
curl http://localhost:8000/api/tts/jobs/{job_id}

# Get available voices
curl http://localhost:8000/api/tts/voices
```

### Using Python httpx (Async)

```python
import httpx
import asyncio

async def create_job():
    async with httpx.AsyncClient() as client:
        response = await client.post(
            'http://localhost:8000/api/tts/jobs',
            json={
                'text': 'Bonjou! Kijan ou ye?',
                'voice_id': 'i4mRPwKM2yHwXhbmkN514',
                'model_id': 'ccl_ht_v100'
            }
        )
        job = response.json()
        print(f"Job created: {job['id']}")

        # Check status
        status_response = await client.get(
            f"http://localhost:8000/api/tts/jobs/{job['id']}"
        )
        status = status_response.json()
        print(f"Status: {status['status']}")

asyncio.run(create_job())
```

## Pydantic Models

FastAPI uses Pydantic for data validation:

```python
from pydantic import BaseModel

class TTSJobCreate(BaseModel):
    text: str
    voice_id: str = "i4mRPwKM2yHwXhbmkN514"
    model_id: str = "ccl_ht_v100"
    speed: float = 1.0
    pitch: float = 1.0
```

## Development

### Run with Auto-Reload

```bash
uvicorn main:app --reload --port 8000
```

### Run with Custom Host/Port

```bash
uvicorn main:app --host 0.0.0.0 --port 8080
```

## Deployment

### Using Uvicorn (Production)

```bash
pip install uvicorn[standard]
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Using Gunicorn with Uvicorn Workers

```bash
pip install gunicorn
gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Using Docker

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Environment Variables for Production

```env
CREOLECENTRIC_API_KEY=cc_your_api_key_here
CREOLECENTRIC_API_URL=https://creolecentric.com/api/v1
```

## Testing

FastAPI has excellent testing support with TestClient:

```python
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_create_job():
    response = client.post(
        "/api/tts/jobs",
        json={"text": "Hello", "voice_id": "test", "model_id": "test"}
    )
    assert response.status_code == 201
```

## Security Considerations

- API key is stored in environment variables (never in code)
- CORS configured - update origins for production
- HTTPS recommended for production
- Rate limiting recommended (use slowapi)
- Automatic request validation via Pydantic

## Learn More

- [CreoleCentric API Documentation](https://creolecentric.com/developer)
- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [Pydantic Documentation](https://docs.pydantic.dev)
- [Uvicorn Documentation](https://www.uvicorn.org)

## Support

For questions or issues:
- Email: support@creolecentric.com
- GitHub: https://github.com/Creole-Centric/api-examples/issues

## License

MIT
