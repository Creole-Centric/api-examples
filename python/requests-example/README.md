# CreoleCentric TTS Python Example (Requests Library)

This example demonstrates how to integrate the CreoleCentric Text-to-Speech API with Python using the `requests` library.

## Features

- **Simple HTTP Client**: Uses the popular `requests` library
- **Type Hints**: Full type annotations for better IDE support
- **Comprehensive API Coverage**: All API endpoints implemented
- **Error Handling**: Proper exception handling
- **Job Polling**: Built-in `wait_for_job()` method
- **Express TTS**: Support for immediate audio generation

## Prerequisites

- Python 3.8 or higher
- pip package manager
- CreoleCentric API key (get one at https://creolecentric.com)

## Setup

1. **Clone this example**:
   ```bash
   git clone https://github.com/Creole-Centric/api-examples.git
   cd api-examples/python/requests-example
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your API credentials:
   ```env
   CREOLECENTRIC_API_KEY=cc_your_api_key_here
   CREOLECENTRIC_API_URL=https://api.creolecentric.com/v1
   ```

4. **Run the example**:
   ```bash
   python creolecentric_api.py
   ```

## Usage

### Basic TTS Job

```python
from creolecentric_api import CreoleCentricAPI
import os

# Initialize client
api_key = os.getenv("CREOLECENTRIC_API_KEY")
client = CreoleCentricAPI(api_key)

# Create a TTS job
job = client.create_tts_job(
    text="Bonjou! Kijan ou ye?",
    voice_id="i4mRPwKM2yHwXhbmkN514",  # Xavier Bruneau
    model_id="ccl_ht_v100"
)

print(f"Job created: {job['id']}")

# Wait for completion
final_job = client.wait_for_job(job['id'], timeout=60)

if final_job['audio_url']:
    print(f"Audio ready: {final_job['audio_url']}")
```

### Using as a Module

You can import the `CreoleCentricAPI` class in your own projects:

```python
from creolecentric_api import CreoleCentricAPI

client = CreoleCentricAPI(api_key="cc_your_key_here")

# Check API health
health = client.check_health()
print(f"API Status: {health['status']}")

# Get credit balance
balance = client.get_credit_balance()
print(f"Total Credits: {balance['total_credits']}")

# Get available voices
voices = client.get_voices()
for voice in voices['voices']:
    print(f"Voice: {voice['name']} (ID: {voice['voice_id']})")

# Get available models
models = client.get_models()
for model in models['models']:
    print(f"Model: {model['display_name']} (ID: {model['id']})")
```

### Express TTS (Immediate Audio)

For shorter texts that need immediate conversion:

```python
# Generate audio immediately (returns bytes)
audio_data = client.express_tts(
    text="Bonjou!",
    voice_id="i4mRPwKM2yHwXhbmkN514"
)

# Save to file
with open("output.mp3", "wb") as f:
    f.write(audio_data)
```

## API Client Features

The `CreoleCentricAPI` class includes:

### Health & Credits
- `check_health()` - Check API health status
- `get_user_info()` - Get current user information
- `get_credit_balance()` - Get credit balance

### Voices & Models
- `get_voices()` - Get available voices
- `get_models()` - Get available TTS models
- `get_voice_settings()` - Get voice configuration

### TTS Jobs
- `create_tts_job()` - Create a new TTS job
- `get_job_status()` - Get job status
- `get_job_details()` - Get full job details
- `list_jobs()` - List recent jobs
- `cancel_job()` - Cancel a job
- `wait_for_job()` - Poll until job completes

### Express TTS
- `express_tts()` - Immediate audio generation for short texts

## Error Handling

The client handles various error scenarios:

```python
import requests

try:
    job = client.create_tts_job(text="Hello")
except requests.exceptions.HTTPError as e:
    print(f"HTTP Error: {e}")
    print(f"Response: {e.response.text}")
except requests.exceptions.RequestException as e:
    print(f"Request Error: {e}")
except TimeoutError as e:
    print(f"Job timed out: {e}")
```

## Advanced Usage

### Custom Timeout and Polling

```python
# Wait for job with custom settings
final_job = client.wait_for_job(
    job_id=job['id'],
    timeout=300,      # 5 minutes
    poll_interval=3   # Check every 3 seconds
)
```

### List Jobs with Pagination

```python
# Get recent jobs
jobs = client.list_jobs(limit=20, offset=0)

for job in jobs['results']:
    print(f"Job {job['id']}: {job['status']}")

# Next page
if jobs['next']:
    next_jobs = client.list_jobs(limit=20, offset=20)
```

## Testing

Run the example script to test all functionality:

```bash
python creolecentric_api.py
```

This will:
1. Check API health
2. Get credit balance
3. List available voices
4. List available models
5. Create a TTS job
6. Wait for job completion
7. List recent jobs

## Learn More

- [CreoleCentric API Documentation](https://creolecentric.com/developer)
- [Requests Documentation](https://requests.readthedocs.io)
- [Python Type Hints](https://docs.python.org/3/library/typing.html)

## Support

For questions or issues:
- Email: support@creolecentric.com
- GitHub: https://github.com/Creole-Centric/api-examples/issues

## License

MIT
