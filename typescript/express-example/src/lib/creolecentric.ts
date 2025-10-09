/**
 * CreoleCentric API Client for TypeScript/JavaScript
 *
 * This is a type-safe wrapper for the CreoleCentric TTS API.
 */

export interface CreoleCentricConfig {
  apiKey: string;
  baseUrl?: string;
}

export interface TTSJobRequest {
  text: string;
  voice_id?: string;
  model_id?: string;
  speed?: number;
  pitch?: number;
}

export interface TTSJob {
  id: string;
  status: 'queued' | 'processing' | 'synthesized' | 'uploaded' | 'delivered' | 'failed' | 'cancelled';
  text: string;
  voice_id: string;
  model_id: string;
  audio_url?: string;
  duration_seconds?: number;
  credits_used?: number;
  created_at: string;
  completed_at?: string;
  error_message?: string;
}

export interface Voice {
  voice_id: string;
  name: string;
  region?: string;
  gender?: string;
  age?: string;
  description?: string;
}

export interface Model {
  id: string;
  name: string;
  display_name?: string;
  description?: string;
}

export interface HealthCheck {
  status: string;
  version: string;
  api_contract_version?: string;
}

export interface CreditBalance {
  total_credits: number;
  subscription_credits: number;
  purchased_credits: number;
}

export class CreoleCentricAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public responseBody?: any
  ) {
    super(message);
    this.name = 'CreoleCentricAPIError';
  }
}

export class CreoleCentricAPI {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: CreoleCentricConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://creolecentric.com/api/v1';
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': `ApiKey ${this.apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorBody = await response.text();
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

        try {
          const errorJson = JSON.parse(errorBody);
          errorMessage = errorJson.error || errorJson.message || errorMessage;
        } catch {
          // Use default error message
        }

        throw new CreoleCentricAPIError(
          errorMessage,
          response.status,
          errorBody
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof CreoleCentricAPIError) {
        throw error;
      }
      throw new CreoleCentricAPIError(
        `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // ============== Health Check ==============

  async checkHealth(): Promise<HealthCheck> {
    return this.makeRequest<HealthCheck>('/health/');
  }

  // ============== User & Credits ==============

  async getCreditBalance(): Promise<CreditBalance> {
    return this.makeRequest<CreditBalance>('/credits/balance/');
  }

  // ============== Voices & Models ==============

  async getVoices(): Promise<{ voices: Voice[]; count: number; source: string }> {
    return this.makeRequest('/tts/voices/');
  }

  async getModels(): Promise<{ models: Model[]; count: number }> {
    return this.makeRequest('/tts/models/');
  }

  // ============== TTS Jobs ==============

  async createTTSJob(request: TTSJobRequest): Promise<TTSJob> {
    return this.makeRequest<TTSJob>('/tts/jobs/', {
      method: 'POST',
      body: JSON.stringify({
        voice_id: 'i4mRPwKM2yHwXhbmkN514', // Xavier Bruneau default
        model_id: 'ccl_ht_v100', // Default Haitian Creole model
        ...request,
      }),
    });
  }

  async getJobStatus(jobId: string): Promise<TTSJob> {
    return this.makeRequest<TTSJob>(`/tts/jobs/${jobId}/status/`);
  }

  async getJobDetails(jobId: string): Promise<TTSJob> {
    return this.makeRequest<TTSJob>(`/tts/jobs/${jobId}/`);
  }

  async listJobs(limit: number = 10, offset: number = 0): Promise<{
    count: number;
    next: string | null;
    previous: string | null;
    results: TTSJob[];
  }> {
    return this.makeRequest(`/tts/jobs/list/?limit=${limit}&offset=${offset}`);
  }

  async cancelJob(jobId: string): Promise<{ success: boolean; message: string }> {
    return this.makeRequest(`/tts/jobs/${jobId}/cancel/`, {
      method: 'POST',
    });
  }

  /**
   * Wait for a job to complete by polling the status endpoint
   */
  async waitForJob(
    jobId: string,
    options: {
      timeout?: number; // milliseconds
      pollInterval?: number; // milliseconds
      onProgress?: (status: TTSJob) => void;
    } = {}
  ): Promise<TTSJob> {
    const {
      timeout = 300000, // 5 minutes default
      pollInterval = 2000, // 2 seconds default
      onProgress,
    } = options;

    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const status = await this.getJobStatus(jobId);

      if (onProgress) {
        onProgress(status);
      }

      if (['completed', 'delivered', 'failed', 'cancelled'].includes(status.status)) {
        return status;
      }

      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    throw new CreoleCentricAPIError(`Job ${jobId} did not complete within ${timeout}ms`);
  }

  // ============== Express TTS ==============

  /**
   * Use express TTS for immediate audio generation (shorter texts)
   * Returns audio data as a Blob
   */
  async expressTTS(text: string, voiceId: string = 'i4mRPwKM2yHwXhbmkN514'): Promise<Blob> {
    const url = `${this.baseUrl}/tts/express/`;
    const headers = {
      'Authorization': `ApiKey ${this.apiKey}`,
      'Content-Type': 'application/json',
    };

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        text,
        voice_id: voiceId,
      }),
    });

    if (!response.ok) {
      throw new CreoleCentricAPIError(
        `Express TTS failed: ${response.statusText}`,
        response.status
      );
    }

    return await response.blob();
  }
}
