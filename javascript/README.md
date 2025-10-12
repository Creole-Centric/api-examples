# CreoleCentric API - JavaScript Examples

JavaScript/Node.js implementation of the CreoleCentric Text-to-Speech API client with examples for different use cases.

## Available Examples

### 📦 [nodejs-example/](nodejs-example/)
Complete Node.js backend integration with Express.js
- **Best for:** Backend APIs, server-side applications, microservices
- **Features:** Webhook handling, job management, full API client
- **Technologies:** Node.js, Express, Axios

### 🌐 [embeddable-widget/](embeddable-widget/)
Client-side embeddable TTS widget
- **Best for:** Websites, web applications, content portals
- **Features:** Ready-to-use UI component, customizable styling
- **Technologies:** Vanilla JavaScript, HTML, CSS

## Quick Start

### Node.js Backend Example

```bash
cd nodejs-example
npm install
cp .env.example .env
# Edit .env and add your API key
node index.js
```

### Embeddable Widget

```html
<!-- Include the widget script -->
<script src="path/to/creolecentric-widget.js"></script>

<!-- Add the widget container -->
<div id="creolecentric-tts-widget"></div>

<script>
  // Initialize widget
  CreoleCentricWidget.init({
    apiKey: 'cc_your_api_key_here',
    container: '#creolecentric-tts-widget'
  });
</script>
```

## Installation

### Requirements

- Node.js 14 or higher (for Node.js examples)
- npm or yarn

### Dependencies

```bash
npm install
```

## Basic Usage (Node.js)

```javascript
const CreoleCentricAPI = require('./creolecentric-api');

// Initialize client
const client = new CreoleCentricAPI(process.env.CREOLECENTRIC_API_KEY);

// Create a TTS job
const job = await client.createTtsJob({
  text: 'Bonjou! Kijan ou ye?',
  voice_id: 'i4mRPwKM2yHwXhbmkN514',
  model_id: 'ccl_ht_v100',
  webhook_url: 'https://your-app.com/webhooks/tts'
});

console.log(`Job created: ${job.id}`);
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
- `createTtsJob(options)` - Create new TTS job
- `getJobStatus(jobId)` - Get job status
- `getJobDetails(jobId)` - Get full job details
- `listJobs(limit, offset)` - List user's jobs
- `cancelJob(jobId)` - Cancel a job

### Express TTS
- `expressTts(text, voiceId)` - Generate audio immediately (short texts)

## Webhook Integration

When creating a TTS job, specify a `webhook_url` to receive real-time updates:

```javascript
const job = await client.createTtsJob({
  text: 'Your text here',
  webhook_url: 'https://your-app.com/webhooks/tts'
});
```

Webhook stages:
- `tts_queued` - Job queued
- `tts_started` - Processing started
- `tts_synthesized` - Audio synthesized
- `tts_uploaded` - Audio uploaded to storage
- `tts_delivered` - Final delivery complete

See the `nodejs-example/` for webhook handling implementation.

## Error Handling

```javascript
try {
  const job = await client.createTtsJob({ text: 'Some text' });
} catch (error) {
  console.error('API error:', error.message);
  if (error.response) {
    console.error('Response:', error.response.data);
  }
}
```

## Choosing an Example

| Use Case | Recommended Example |
|----------|-------------------|
| Backend API or service | `nodejs-example/` |
| Website integration | `embeddable-widget/` |
| Custom implementation | Start with `nodejs-example/` |

## Browser Compatibility

The embeddable widget supports:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Resources

- [Full API Documentation](https://github.com/Creole-Centric/api-examples)
- [CreoleCentric Website](https://creolecentric.com)
