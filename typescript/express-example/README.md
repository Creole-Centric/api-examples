# CreoleCentric TTS Express.js Example

This example demonstrates how to integrate the CreoleCentric Text-to-Speech API with an Express.js backend using TypeScript.

## Features

- **Type-Safe API Integration**: Full TypeScript support with type definitions
- **RESTful API Endpoints**: Express routes for TTS job creation and status checking
- **Server-Side API Key**: Securely stores API credentials on the backend
- **Error Handling**: Comprehensive error handling and validation
- **CORS Support**: Configured for cross-origin requests

## Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn
- CreoleCentric API key (get one at https://creolecentric.com)

## Setup

1. **Clone this example**:
   ```bash
   git clone https://github.com/Creole-Centric/api-examples.git
   cd api-examples/typescript/express-example
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
   PORT=3000
   CREOLECENTRIC_API_KEY=cc_your_api_key_here
   CREOLECENTRIC_API_URL=https://creolecentric.com/api/v1
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

   The API will be available at [http://localhost:3000](http://localhost:3000)

## Project Structure

```
express-example/
├── src/
│   ├── lib/
│   │   └── creolecentric.ts      # API client library
│   ├── routes/
│   │   └── tts.ts                 # TTS routes
│   ├── middleware/
│   │   └── errorHandler.ts       # Error handling middleware
│   └── index.ts                   # Server entry point
├── .env.example                   # Environment template
├── package.json                   # Dependencies
├── tsconfig.json                  # TypeScript config
└── README.md                      # This file
```

## API Endpoints

### Create TTS Job
```http
POST /api/tts/jobs
Content-Type: application/json

{
  "text": "Bonjou! Kijan ou ye?",
  "voice_id": "i4mRPwKM2yHwXhbmkN514",
  "model_id": "ccl_ht_v100",
  "speed": 1.0,
  "pitch": 1.0
}
```

**Response:**
```json
{
  "id": "job_abc123",
  "status": "queued",
  "text": "Bonjou! Kijan ou ye?",
  "voice_id": "i4mRPwKM2yHwXhbmkN514",
  "model_id": "ccl_ht_v100",
  "created_at": "2025-10-09T12:00:00Z"
}
```

### Get Job Status
```http
GET /api/tts/jobs/:jobId
```

**Response:**
```json
{
  "id": "job_abc123",
  "status": "delivered",
  "audio_url": "https://creolecentric.com/audio/...",
  "duration_seconds": 3.5,
  "credits_used": 10,
  "completed_at": "2025-10-09T12:00:05Z"
}
```

### Get Available Voices
```http
GET /api/tts/voices
```

### Get Available Models
```http
GET /api/tts/models
```

### Get Credit Balance
```http
GET /api/credits/balance
```

### Health Check
```http
GET /api/health
```

## Usage Examples

### Using curl

```bash
# Create a TTS job
curl -X POST http://localhost:3000/api/tts/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Bonjou! Kijan ou ye?",
    "voice_id": "i4mRPwKM2yHwXhbmkN514",
    "model_id": "ccl_ht_v100"
  }'

# Check job status
curl http://localhost:3000/api/tts/jobs/job_abc123

# Get voices
curl http://localhost:3000/api/tts/voices
```

### Using fetch (JavaScript)

```javascript
// Create a TTS job
const response = await fetch('http://localhost:3000/api/tts/jobs', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    text: 'Bonjou! Kijan ou ye?',
    voice_id: 'i4mRPwKM2yHwXhbmkN514',
    model_id: 'ccl_ht_v100',
  }),
});

const job = await response.json();
console.log('Job created:', job.id);

// Poll for completion
const checkStatus = async () => {
  const statusResponse = await fetch(`http://localhost:3000/api/tts/jobs/${job.id}`);
  const status = await statusResponse.json();

  if (status.status === 'delivered') {
    console.log('Audio ready:', status.audio_url);
    return status;
  }

  // Continue polling
  setTimeout(checkStatus, 2000);
};

checkStatus();
```

## Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run production build
- `npm run lint` - Run ESLint

### Building for Production

```bash
npm run build
npm start
```

The compiled JavaScript will be in the `dist/` directory.

## Deployment

This Express.js API can be deployed to:
- **Heroku**: Add `Procfile` with `web: npm start`
- **Railway**: Automatically detects Node.js apps
- **DigitalOcean App Platform**: Configure via dashboard
- **AWS Elastic Beanstalk**: Package and deploy
- **Docker**: Create Dockerfile with Node.js base image

### Environment Variables in Production

Make sure to set these environment variables in your hosting platform:
- `PORT` - Server port (usually auto-assigned by host)
- `CREOLECENTRIC_API_KEY` - Your API key
- `CREOLECENTRIC_API_URL` - API base URL

## Security Considerations

- API key is stored securely on the backend (never exposed to clients)
- Input validation on all endpoints
- Rate limiting recommended for production (use `express-rate-limit`)
- CORS configured - update origins for production
- Error messages sanitized to avoid leaking sensitive information

## Learn More

- [CreoleCentric API Documentation](https://creolecentric.com/developer)
- [Express.js Documentation](https://expressjs.com)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

## Support

For questions or issues:
- Email: support@creolecentric.com
- GitHub: https://github.com/Creole-Centric/api-examples/issues

## License

MIT
