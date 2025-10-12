# CreoleCentric API - Ruby Examples

Ruby implementation of the CreoleCentric Text-to-Speech API client.

## Requirements

- Ruby 2.7 or higher
- Bundler

## Installation

1. Install dependencies:

```bash
bundle install
```

2. Set up your API key:

```bash
cp .env.example .env
# Edit .env and add your API key
```

## Usage

### Basic Example

```bash
ruby creolecentric_api.rb
```

### Using in Your Application

```ruby
require_relative 'creolecentric_api'

# Initialize client
client = CreoleCentricAPI.new(ENV['CREOLECENTRIC_API_KEY'])

# Create a TTS job
job = client.create_tts_job(
  'Bonjou! Kijan ou ye?',
  voice_id: 'i4mRPwKM2yHwXhbmkN514',
  model_id: 'ccl_ht_v100',
  webhook_url: 'https://your-app.com/webhooks/tts'
)

puts "Job created: #{job['id']}"
```

## API Methods

### Health & User
- `check_health` - Check API health status
- `get_user_info` - Get current user information
- `get_credit_balance` - Get credit balance

### Voices & Models
- `get_voices` - List available voices
- `get_models` - List available TTS models
- `get_voice_settings` - Get voice settings configuration

### TTS Jobs
- `create_tts_job(text, voice_id:, model_id:, **options)` - Create new TTS job
- `get_job_status(job_id)` - Get job status
- `get_job_details(job_id)` - Get full job details
- `list_jobs(limit:, offset:)` - List user's jobs
- `cancel_job(job_id)` - Cancel a job

### Express TTS
- `express_tts(text, voice_id:)` - Generate audio immediately (short texts)

## Webhook Integration

When creating a TTS job, you can specify a `webhook_url` to receive real-time status updates:

```ruby
job = client.create_tts_job(
  'Your text here',
  webhook_url: 'https://your-app.com/webhooks/tts'
)
```

You'll receive webhooks for each stage:
- `tts_queued` - Job queued
- `tts_started` - Processing started
- `tts_synthesized` - Audio synthesized
- `tts_uploaded` - Audio uploaded to storage
- `tts_delivered` - Final delivery complete

## Error Handling

The client raises `HTTP::Error` for HTTP errors. Handle them appropriately:

```ruby
begin
  job = client.create_tts_job('Some text')
rescue HTTP::Error => e
  puts "API error: #{e}"
end
```

## Resources

- [Full API Documentation](https://github.com/Creole-Centric/api-examples)
- [CreoleCentric Website](https://creolecentric.com)
