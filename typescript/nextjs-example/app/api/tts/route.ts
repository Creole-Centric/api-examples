import { NextRequest, NextResponse } from 'next/server';
import { CreoleCentricAPI, TTSJobRequest } from '@/lib/creolecentric';

export async function POST(request: NextRequest) {
  try {
    const body: TTSJobRequest = await request.json();

    // Validate required field
    if (!body.text || body.text.trim() === '') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Initialize API client with environment variables
    const apiKey = process.env.CREOLECENTRIC_API_KEY;
    const apiUrl = process.env.CREOLECENTRIC_API_URL;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const client = new CreoleCentricAPI({
      apiKey,
      baseUrl: apiUrl,
    });

    // Create TTS job
    const job = await client.createTTSJob({
      text: body.text,
      voice_id: body.voice_id,
      model_id: body.model_id,
      speed: body.speed,
      pitch: body.pitch,
    });

    return NextResponse.json(job);
  } catch (error: any) {
    console.error('TTS job creation error:', error);

    return NextResponse.json(
      {
        error: error.message || 'Failed to create TTS job',
        details: error.responseBody
      },
      { status: error.statusCode || 500 }
    );
  }
}
