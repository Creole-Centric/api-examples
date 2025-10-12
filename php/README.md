# CreoleCentric API - PHP Examples

PHP implementation of the CreoleCentric Text-to-Speech API client.

## Requirements

- PHP 7.4 or higher
- Composer

## Installation

1. Install dependencies:

```bash
composer install
```

2. Set up your API key:

```bash
cp .env.example .env
# Edit .env and add your API key
```

## Usage

### Basic Example

```bash
php CreoleCentricAPI.php
```

### Using in Your Application

```php
<?php
require_once 'vendor/autoload.php';

// Initialize client
$client = new CreoleCentricAPI($_ENV['CREOLECENTRIC_API_KEY']);

// Create a TTS job
$job = $client->createTtsJob(
    'Bonjou! Kijan ou ye?',
    'i4mRPwKM2yHwXhbmkN514',  // voice_id
    'ccl_ht_v100',             // model_id
    ['webhook_url' => 'https://your-app.com/webhooks/tts']
);

echo "Job created: " . $job['id'] . "\n";
```

## API Methods

### Health & User
- `checkHealth()` - Check API health status
- `getUserInfo()` - Get current user information
- `getCreditBalance()` - Get credit balance

### Voices & Models
- `getVoices()` - List available voices
- `getModels()` - List available TTS models
- `getVoiceSettings()` - Get voice settings configuration

### TTS Jobs
- `createTtsJob($text, $voiceId, $modelId, $options)` - Create new TTS job
- `getJobStatus($jobId)` - Get job status
- `getJobDetails($jobId)` - Get full job details
- `listJobs($limit, $offset)` - List user's jobs
- `cancelJob($jobId)` - Cancel a job

### Express TTS
- `expressTts($text, $voiceId)` - Generate audio immediately (short texts)

## Webhook Integration

When creating a TTS job, you can specify a `webhook_url` to receive real-time status updates:

```php
$job = $client->createTtsJob(
    'Your text here',
    'voice_id',
    'model_id',
    ['webhook_url' => 'https://your-app.com/webhooks/tts']
);
```

You'll receive webhooks for each stage:
- `tts_queued` - Job queued
- `tts_started` - Processing started
- `tts_synthesized` - Audio synthesized
- `tts_uploaded` - Audio uploaded to storage
- `tts_delivered` - Final delivery complete

## Error Handling

The client throws `GuzzleException` for HTTP errors. Handle them appropriately:

```php
try {
    $job = $client->createTtsJob('Some text');
} catch (GuzzleException $e) {
    echo "API error: " . $e->getMessage();
}
```

## Resources

- [Full API Documentation](https://github.com/Creole-Centric/api-examples)
- [CreoleCentric Website](https://creolecentric.com)
