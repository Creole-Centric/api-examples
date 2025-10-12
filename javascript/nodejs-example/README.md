# CreoleCentric TTS JavaScript/Node.js Example (Axios)

This example demonstrates how to integrate the CreoleCentric Text-to-Speech API with Node.js using the `axios` HTTP client library.

## Features

- **Axios HTTP Client**: Popular promise-based HTTP client
- **Comprehensive API Coverage**: All API endpoints implemented
- **Error Handling**: Axios interceptors for error handling
- **Job Polling**: Built-in `waitForJob()` method
- **Audio Download**: Download generated audio files
- **Express TTS**: Support for immediate audio generation
- **Module Export**: Can be imported in other Node.js projects

## Prerequisites

- Node.js 14.0 or higher
- npm or yarn package manager
- CreoleCentric API key (get one at https://creolecentric.com)

## Setup

1. **Clone this example**:
   ```bash
   git clone https://github.com/Creole-Centric/api-examples.git
   cd api-examples/javascript/basic-example
   ```

2. **Install dependencies**:
   ```bash
   npm install
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
   node creolecentric-api.js
   ```

## Usage

### Basic TTS Job

```javascript
const CreoleCentricAPI = require('./creolecentric-api');

// Initialize client
const apiKey = process.env.CREOLECENTRIC_API_KEY;
const client = new CreoleCentricAPI(apiKey);

// Create a TTS job
async function createJob() {
  const job = await client.createTTSJob(
    'Bonjou! Kijan ou ye?',
    'i4mRPwKM2yHwXhbmkN514',  // Xavier Bruneau
    'ccl_ht_v100'
  );

  console.log(`Job created: ${job.id}`);

  // Wait for completion
  const finalJob = await client.waitForJob(job.id, 60);

  if (finalJob.audio_url) {
    console.log(`Audio ready: ${finalJob.audio_url}`);

    // Download audio
    await client.downloadAudio(
      finalJob.audio_url,
      './output.mp3'
    );
  }
}

createJob().catch(console.error);
```

### Using as a Module

You can import the `CreoleCentricAPI` class in your own projects:

```javascript
const CreoleCentricAPI = require('./creolecentric-api');

const client = new CreoleCentricAPI('cc_your_key_here');

// Check API health
const health = await client.checkHealth();
console.log(`API Status: ${health.status}`);

// Get credit balance
const balance = await client.getCreditBalance();
console.log(`Total Credits: ${balance.total_credits}`);

// Get available voices
const voices = await client.getVoices();
voices.voices.forEach(voice => {
  console.log(`Voice: ${voice.name} (ID: ${voice.voice_id})`);
});

// Get available models
const models = await client.getModels();
models.models.forEach(model => {
  console.log(`Model: ${model.display_name} (ID: ${model.id})`);
});
```

### Express TTS (Immediate Audio)

For shorter texts that need immediate conversion:

```javascript
// Generate audio immediately (returns Buffer)
const audioData = await client.expressTTS(
  'Bonjou!',
  'i4mRPwKM2yHwXhbmkN514'
);

// Save to file
const fs = require('fs');
fs.writeFileSync('output.mp3', audioData);
```

### Download Audio Files

```javascript
// Download audio from a completed job
await client.downloadAudio(
  job.audio_url,
  './my-audio.mp3'
);

console.log('Audio downloaded successfully!');
```

## API Client Features

The `CreoleCentricAPI` class includes:

### Health & Credits
- `checkHealth()` - Check API health status
- `getUserInfo()` - Get current user information
- `getCreditBalance()` - Get credit balance

### Voices & Models
- `getVoices()` - Get available voices
- `getModels()` - Get available TTS models
- `getVoiceSettings()` - Get voice configuration

### TTS Jobs
- `createTTSJob(text, voiceId, modelId, options)` - Create a new TTS job
- `getJobStatus(jobId)` - Get job status
- `getJobDetails(jobId)` - Get full job details
- `listJobs(limit, offset)` - List recent jobs
- `cancelJob(jobId)` - Cancel a job
- `waitForJob(jobId, timeout, pollInterval)` - Poll until job completes

### Express TTS & Audio
- `expressTTS(text, voiceId)` - Immediate audio generation
- `downloadAudio(audioUrl, outputPath)` - Download audio file

## Error Handling

The client uses Axios interceptors for automatic error handling:

```javascript
try {
  const job = await client.createTTSJob('Hello');
} catch (error) {
  if (error.response) {
    // The request was made and the server responded with a status code
    console.error(`API Error: ${error.response.status}`);
    console.error('Response:', error.response.data);
  } else if (error.request) {
    // The request was made but no response was received
    console.error('No response received:', error.message);
  } else {
    // Something happened in setting up the request
    console.error('Request error:', error.message);
  }
}
```

## Advanced Usage

### Custom Timeout and Polling

```javascript
// Wait for job with custom settings
const finalJob = await client.waitForJob(
  job.id,
  300,  // 5 minutes timeout
  3     // Check every 3 seconds
);
```

### List Jobs with Pagination

```javascript
// Get recent jobs
const jobs = await client.listJobs(20, 0);

jobs.results.forEach(job => {
  console.log(`Job ${job.id}: ${job.status}`);
});

// Next page
if (jobs.next) {
  const nextJobs = await client.listJobs(20, 20);
}
```

### Additional Options

```javascript
// Create job with speed and pitch
const job = await client.createTTSJob(
  'Bonjou!',
  'i4mRPwKM2yHwXhbmkN514',
  'ccl_ht_v100',
  {
    speed: 1.2,
    pitch: 0.9
  }
);
```

## Testing

Run the example script to test all functionality:

```bash
node creolecentric-api.js
```

This will:
1. Check API health
2. Get credit balance
3. List available voices
4. List available models
5. Create a TTS job
6. Wait for job completion
7. List recent jobs
8. Generate express TTS audio

## Learn More

- [CreoleCentric API Documentation](https://creolecentric.com/developer)
- [Axios Documentation](https://axios-http.com)
- [Node.js Documentation](https://nodejs.org/docs)

## Support

For questions or issues:
- Email: support@creolecentric.com
- GitHub: https://github.com/Creole-Centric/api-examples/issues

## License

MIT
