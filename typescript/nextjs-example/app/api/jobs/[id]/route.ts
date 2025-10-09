import { NextRequest, NextResponse } from 'next/server';
import { CreoleCentricAPI } from '@/lib/creolecentric';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id;

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    // Initialize API client
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

    // Get job status
    const job = await client.getJobStatus(jobId);

    return NextResponse.json(job);
  } catch (error: any) {
    console.error('Job status fetch error:', error);

    return NextResponse.json(
      {
        error: error.message || 'Failed to fetch job status',
        details: error.responseBody
      },
      { status: error.statusCode || 500 }
    );
  }
}
