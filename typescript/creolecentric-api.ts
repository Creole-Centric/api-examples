#!/usr/bin/env ts-node
/**
 * CreoleCentric TTS API Client Example (TypeScript)
 * ==================================================
 * This example demonstrates how to use the CreoleCentric Text-to-Speech API.
 *
 * Requirements:
 *   npm install axios dotenv
 *   npm install -D typescript @types/node ts-node
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

// ============== Type Definitions ==============

interface HealthResponse {
    status: string;
    service: string;
    database: string;
    version: string;
}

interface CreditBalance {
    total_credits: number;
    subscription_credits: number;
    purchased_credits: number;
    subscription_plan?: string;
}

interface Voice {
    id: string;
    voice_id: string;
    name: string;
    description: string;
    gender: string;
    region: string;
    region_code?: string;
    accent?: string;
    style?: string;
    quality_level?: string;
    age_group?: string;
    language_code: string;
    is_active: boolean;
    is_default: boolean;
    is_featured: boolean;
    is_premium: boolean;
    preview_url?: string;
    preview_text?: string;
    tags?: string[];
    default_stability?: number;
    default_similarity_boost?: number;
    default_style_strength?: number;
    default_speed?: number;
    use_speaker_boost?: boolean;
}

interface VoicesResponse {
    success: boolean;
    voices: Voice[];
    count: number;
    source: string;
}

interface Model {
    id: string;
    name: string;
    display_name?: string;
    description: string;
    version?: string;
    quality_score?: number;
    is_default?: boolean;
    is_premium?: boolean;
    supported_languages?: string[];
}

interface ModelsResponse {
    success: boolean;
    models: Model[];
    count: number;
}

interface TTSJob {
    id: string;
    text: string;
    voice_id: string;
    voice_name?: string;
    model_id: string;
    status: string;
    created_at: string;
    started_at?: string;
    completed_at?: string;
    audio_file_url?: string;
    duration_seconds?: number;
    duration_formatted?: string;
    credits_used: number;
    characters_processed?: number;
    error_message?: string;
}

interface JobStatusResponse {
    status: string;
    audio_url?: string;
    duration_seconds?: number;
    error_message?: string;
}

interface JobListResponse {
    results: TTSJob[];
    count: number;
    next?: string;
    previous?: string;
}

interface TTSJobParams {
    speed?: number;
    stability?: number;
    similarity_boost?: number;
    style?: number;
    use_speaker_boost?: boolean;
}

// ============== API Client ==============

class CreoleCentricAPI {
    private client: AxiosInstance;
    private baseURL: string;

    constructor(apiKey: string, baseURL: string = 'https://api.creolecentric.com/v1') {
        this.baseURL = baseURL;
        this.client = axios.create({
            baseURL: this.baseURL,
            headers: {
                'Authorization': `ApiKey ${apiKey}`,
                'Content-Type': 'application/json'
            },
            timeout: 30000
        });
    }

    // ============== Health Check ==============

    async checkHealth(): Promise<HealthResponse> {
        const response = await this.client.get<HealthResponse>('/health/');
        return response.data;
    }

    // ============== User & Credits ==============

    async getUserInfo(): Promise<any> {
        const response = await this.client.get('/users/profile/');
        return response.data;
    }

    async getCreditBalance(): Promise<CreditBalance> {
        const response = await this.client.get<CreditBalance>('/credits/balance/');
        return response.data;
    }

    // ============== Voices & Models ==============

    async getVoices(): Promise<VoicesResponse> {
        const response = await this.client.get<VoicesResponse>('/tts/voices/');
        return response.data;
    }

    async getModels(): Promise<ModelsResponse> {
        const response = await this.client.get<ModelsResponse>('/tts/models/');
        return response.data;
    }

    async getVoiceSettings(): Promise<any> {
        const response = await this.client.get('/tts/voice-settings/');
        return response.data;
    }

    // ============== TTS Jobs ==============

    async createTTSJob(
        text: string,
        voiceId: string,
        modelId: string,
        params?: TTSJobParams
    ): Promise<TTSJob> {
        const data = {
            text,
            voice_id: voiceId,
            model_id: modelId,
            ...params
        };
        const response = await this.client.post<TTSJob>('/tts/jobs/', data);
        return response.data;
    }

    async getJobStatus(jobId: string): Promise<JobStatusResponse> {
        const response = await this.client.get<JobStatusResponse>(`/tts/jobs/${jobId}/status/`);
        return response.data;
    }

    async getJobDetails(jobId: string): Promise<TTSJob> {
        const response = await this.client.get<TTSJob>(`/tts/jobs/${jobId}/`);
        return response.data;
    }

    async listJobs(limit: number = 10, offset: number = 0): Promise<JobListResponse> {
        const response = await this.client.get<JobListResponse>('/tts/jobs/list/', {
            params: { limit, offset }
        });
        return response.data;
    }

    async cancelJob(jobId: string): Promise<any> {
        const response = await this.client.post(`/tts/jobs/${jobId}/cancel/`);
        return response.data;
    }

    // ============== Express TTS ==============

    async expressTTS(text: string, voiceId: string): Promise<Buffer> {
        const data = {
            text,
            voice_id: voiceId
        };
        const response = await this.client.post('/tts/express/', data, {
            responseType: 'arraybuffer'
        });
        return Buffer.from(response.data);
    }
}

// ============== Example Usage ==============

async function main(): Promise<void> {
    const API_KEY = process.env.CREOLECENTRIC_API_KEY;

    if (!API_KEY) {
        console.error('Error: CREOLECENTRIC_API_KEY environment variable not set');
        console.error("Please set it with your API key: export CREOLECENTRIC_API_KEY='cc_your_key_here'");
        process.exit(1);
    }

    const client = new CreoleCentricAPI(API_KEY);

    try {
        // 1. Check API health
        console.log('='.repeat(50));
        console.log('1. Checking API Health');
        console.log('='.repeat(50));
        const health = await client.checkHealth();
        console.log(`API Status: ${health.status}`);
        console.log(`Version: ${health.version}`);
        console.log();

        // 2. Get credit balance
        console.log('='.repeat(50));
        console.log('2. Credit Balance');
        console.log('='.repeat(50));
        const balance = await client.getCreditBalance();
        console.log(`Total Credits: ${(balance.total_credits || 0).toLocaleString()}`);
        console.log(`Subscription Credits: ${(balance.subscription_credits || 0).toLocaleString()}`);
        console.log(`Purchased Credits: ${(balance.purchased_credits || 0).toLocaleString()}`);
        console.log();

        // 3. Get available voices
        console.log('='.repeat(50));
        console.log('3. Available Voices');
        console.log('='.repeat(50));
        const voicesResponse = await client.getVoices();
        const voices = voicesResponse.voices || [];
        console.log(`Found ${voicesResponse.count || voices.length} voices (source: ${voicesResponse.source || 'unknown'}):`);

        voices.slice(0, 5).forEach(voice => {
            console.log(`  - ${voice.name} (ID: ${voice.voice_id})`);
            console.log(`    Region: ${voice.region}, Gender: ${voice.gender}`);
        });
        console.log();

        // 4. Get available models
        console.log('='.repeat(50));
        console.log('4. Available Models');
        console.log('='.repeat(50));
        const modelsResponse = await client.getModels();
        const models = modelsResponse.models || [];
        console.log(`Found ${modelsResponse.count || models.length} models:`);

        models.forEach(model => {
            console.log(`  - ${model.display_name || model.name} (ID: ${model.id})`);
            console.log(`    Description: ${model.description}`);
        });
        console.log();

        // 5. Create a TTS job
        console.log('='.repeat(50));
        console.log('5. Creating TTS Job');
        console.log('='.repeat(50));

        const text = "Bonjou! Mwen se yon egzanp API pou CreoleCentric. Mwen ka pale Kreyòl ayisyen.";
        console.log(`Text: ${text}`);

        let voiceId = 'i4mRPwKM2yHwXhbmkN514';  // Xavier Bruneau
        let modelId = 'ccl_ht_v100';

        if (voices[0] && !['voice_1', 'voice_2'].includes(voices[0].voice_id)) {
            voiceId = voices[0].voice_id;
        }
        if (models[0]) {
            modelId = models[0].id;
        }

        // To use webhooks, add webhook_url parameter:
        const job = await client.createTTSJob(text, voiceId, modelId, {
            webhook_url: 'https://your-app.com/webhooks/tts'  // Your webhook endpoint
        });

        const jobId = job.id;
        console.log('Job created successfully!');
        console.log(`Job ID: ${jobId}`);
        console.log(`Status: ${job.status}`);
        console.log(`Credits used: ${job.credits_used || 0}`);
        console.log();
        console.log('📢 Webhook notifications will be sent to your endpoint:');
        console.log('   - tts_queued → tts_started → tts_synthesized → tts_uploaded → tts_delivered');
        console.log('   See examples/webhook_server.js for webhook handling example');
        console.log();

        // 6. List recent jobs
        console.log('='.repeat(50));
        console.log('6. Recent Jobs');
        console.log('='.repeat(50));

        const jobs = await client.listJobs(5);
        console.log(`Recent ${jobs.results?.length || 0} jobs:`);

        jobs.results?.forEach(job => {
            const jobId = job.id || 'N/A';
            const jobIdDisplay = jobId !== 'N/A' ? jobId.substring(0, 8) + '...' : jobId;
            console.log(`  - Job ${jobIdDisplay}`);
            console.log(`    Created: ${job.created_at}`);
            console.log(`    Status: ${job.status}`);
            if (job.text) {
                console.log(`    Text: ${job.text.substring(0, 50)}${job.text.length > 50 ? '...' : ''}`);
            }
        });

    } catch (error) {
        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError;
            console.error('API Error:', axiosError.response?.data || axiosError.message);
        } else if (error instanceof Error) {
            console.error('Error:', error.message);
        } else {
            console.error('Unknown error:', error);
        }
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

export { CreoleCentricAPI, HealthResponse, CreditBalance, Voice, Model, TTSJob, JobStatusResponse };
