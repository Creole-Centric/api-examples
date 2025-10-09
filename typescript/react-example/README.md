# CreoleCentric TTS React Example

This example demonstrates how to integrate the CreoleCentric Text-to-Speech API with a React application using TypeScript and Vite.

## Features

- **Type-Safe API Integration**: Full TypeScript support with type definitions
- **Real-Time Job Status**: Live polling for TTS job completion
- **Audio Playback**: Built-in audio player for generated speech
- **Modern React**: Uses React 18 with hooks and functional components
- **Fast Development**: Vite for instant hot module replacement

## Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn
- CreoleCentric API key (get one at https://creolecentric.com)

## Setup

1. **Clone this example**:
   ```bash
   git clone https://github.com/Creole-Centric/api-examples.git
   cd api-examples/typescript/react-example
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
   VITE_CREOLECENTRIC_API_KEY=cc_your_api_key_here
   VITE_CREOLECENTRIC_API_URL=https://creolecentric.com/api/v1
   ```

   **⚠️ Security Note**: This example uses environment variables prefixed with `VITE_` which makes them available in the browser. For production applications, consider using a backend proxy to keep your API key secure.

4. **Run the development server**:
   ```bash
   npm run dev
   ```

   Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

```
react-example/
├── src/
│   ├── lib/
│   │   └── creolecentric.ts      # API client library
│   ├── components/
│   │   └── TTSForm.tsx            # Main TTS form component
│   ├── App.tsx                     # Root component
│   ├── App.css                     # Styles
│   └── main.tsx                    # Entry point
├── .env.example                    # Environment template
├── package.json                    # Dependencies
├── tsconfig.json                   # TypeScript config
├── vite.config.ts                  # Vite config
└── README.md                       # This file
```

## Usage

### Basic TTS Job

```typescript
import { CreoleCentricAPI } from './lib/creolecentric';

const client = new CreoleCentricAPI({
  apiKey: import.meta.env.VITE_CREOLECENTRIC_API_KEY,
  baseUrl: import.meta.env.VITE_CREOLECENTRIC_API_URL,
});

// Create a TTS job
const job = await client.createTTSJob({
  text: 'Bonjou! Kijan ou ye?',
  voice_id: 'i4mRPwKM2yHwXhbmkN514',  // Xavier Bruneau
  model_id: 'ccl_ht_v100',
});

console.log('Job created:', job.id);

// Wait for completion with progress updates
const completedJob = await client.waitForJob(job.id, {
  timeout: 300000,
  pollInterval: 2000,
  onProgress: (status) => {
    console.log('Job status:', status.status);
  },
});

// Play the audio
if (completedJob.audio_url) {
  const audio = new Audio(completedJob.audio_url);
  audio.play();
}
```

### Using the TTSForm Component

The included `TTSForm` component provides a complete UI for TTS job submission:

```tsx
import TTSForm from './components/TTSForm';

function App() {
  return (
    <div className="App">
      <h1>Text-to-Speech</h1>
      <TTSForm />
    </div>
  );
}
```

## API Client Features

The TypeScript API client (`src/lib/creolecentric.ts`) includes:

- **Full Type Safety**: TypeScript interfaces for all requests and responses
- **Error Handling**: Custom error class with status codes and response bodies
- **Job Polling**: Built-in `waitForJob()` method with configurable timeout
- **All API Endpoints**: Health check, credits, voices, models, TTS jobs, express TTS

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Deployment

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory, ready to deploy to any static hosting service (Vercel, Netlify, Cloudflare Pages, etc.).

### Environment Variables in Production

Make sure to set the environment variables in your hosting platform:
- `VITE_CREOLECENTRIC_API_KEY`
- `VITE_CREOLECENTRIC_API_URL`

**Security Recommendation**: For production apps, implement a backend API route that proxies requests to CreoleCentric API to keep your API key secure.

## Learn More

- [CreoleCentric API Documentation](https://creolecentric.com/developer)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

## Support

For questions or issues:
- Email: support@creolecentric.com
- GitHub: https://github.com/Creole-Centric/api-examples/issues

## License

MIT
