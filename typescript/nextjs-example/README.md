# CreoleCentric API - Next.js Example

This example demonstrates how to integrate the CreoleCentric Text-to-Speech API into a Next.js 14+ application with App Router and TypeScript.

## Features

- ✅ Next.js 14 with App Router
- ✅ TypeScript with full type safety
- ✅ Server-side API routes for secure API key handling
- ✅ Client-side React components
- ✅ Real-time job status updates
- ✅ Audio playback
- ✅ Error handling

## Prerequisites

- Node.js 18+ and npm
- CreoleCentric API key (get one at https://creolecentric.com/api-keys)

## Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Add your API key to .env.local
# CREOLECENTRIC_API_KEY=cc_your_key_here
```

## Running the Example

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

Visit http://localhost:3000

## Project Structure

```
nextjs-example/
├── app/
│   ├── page.tsx              # Home page with TTS form
│   ├── layout.tsx            # Root layout
│   └── api/
│       ├── tts/
│       │   └── route.ts      # API route for TTS job creation
│       └── jobs/
│           └── [id]/
│               └── route.ts  # API route for job status
├── lib/
│   └── creolecentric.ts      # TypeScript client wrapper
├── .env.example              # Environment variables template
├── package.json
└── README.md
```

## How It Works

1. **Client Component** (`app/page.tsx`): User interface for text-to-speech
2. **API Routes** (`app/api/*`): Server-side endpoints that securely call CreoleCentric API
3. **Client Library** (`lib/creolecentric.ts`): TypeScript wrapper for API calls

## Security Note

The API key is stored in `.env.local` and **never exposed to the client**. All API calls are made through Next.js API routes running on the server.

## Learn More

- [CreoleCentric API Documentation](https://developer.creolecentric.com/api-reference)
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
