#!/usr/bin/env node
/**
 * CreoleCentric TTS API Client Example for Node.js
 * ==================================================
 * This example demonstrates how to use the CreoleCentric Text-to-Speech API.
 * 
 * Requirements:
 *   npm install axios dotenv
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class CreoleCentricAPI {
    /**
     * Initialize the API client
     * @param {string} apiKey - Your API key starting with 'cc_'
     * @param {string} baseUrl - Base URL for the API
     */
    constructor(apiKey, baseUrl = 'https://creolecentric.com/api/v1') {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl.replace(/\/$/, '');
        
        // Create axios instance with default config
        this.client = axios.create({
            baseURL: this.baseUrl,
            headers: {
                'Authorization': `ApiKey ${apiKey}`,
                'Content-Type': 'application/json'
            },
            timeout: 30000
        });
        
        // Add response interceptor for error handling
        this.client.interceptors.response.use(
            response => response,
            error => {
                if (error.response) {
                    console.error(`API Error: ${error.response.status} - ${error.response.statusText}`);
                    console.error('Response:', error.response.data);
                } else if (error.request) {
                    console.error('No response received:', error.message);
                } else {
                    console.error('Request error:', error.message);
                }
                throw error;
            }
        );
    }
    
    // ============== Health Check ==============
    
    /**
     * Check API health status
     */
    async checkHealth() {
        const response = await this.client.get('/health/');
        return response.data;
    }
    
    // ============== User & Credits ==============
    
    /**
     * Get current user information
     */
    async getUserInfo() {
        const response = await this.client.get('/users/profile/');
        return response.data;
    }
    
    /**
     * Get current credit balance
     */
    async getCreditBalance() {
        const response = await this.client.get('/credits/balance/');
        return response.data;
    }
    
    // ============== Voices & Models ==============
    
    /**
     * Get list of available voices
     * @returns {Object} Response containing { success, voices, count, source }
     */
    async getVoices() {
        const response = await this.client.get('/tts/voices/');
        return response.data;
    }

    /**
     * Get list of available TTS models
     * @returns {Object} Response containing { success, models, count }
     */
    async getModels() {
        const response = await this.client.get('/tts/models/');
        return response.data;
    }
    
    /**
     * Get voice settings configuration
     */
    async getVoiceSettings() {
        const response = await this.client.get('/tts/voice-settings/');
        return response.data;
    }
    
    // ============== TTS Jobs ==============
    
    /**
     * Create a new TTS job
     * @param {string} text - Text to convert to speech
     * @param {string} voiceId - ID of the voice to use
     * @param {string} modelId - ID of the model to use
     * @param {object} options - Additional parameters
     */
    async createTTSJob(text, voiceId = 'voice_1', modelId = 'model_1', options = {}) {
        const data = {
            text,
            voice_id: voiceId,
            model_id: modelId,
            ...options
        };
        
        const response = await this.client.post('/tts/jobs/', data);
        return response.data;
    }
    
    /**
     * Get status of a TTS job
     * @param {string} jobId - UUID of the job
     */
    async getJobStatus(jobId) {
        const response = await this.client.get(`/tts/jobs/${jobId}/status/`);
        return response.data;
    }
    
    /**
     * Get full details of a TTS job
     * @param {string} jobId - UUID of the job
     */
    async getJobDetails(jobId) {
        const response = await this.client.get(`/tts/jobs/${jobId}/`);
        return response.data;
    }
    
    /**
     * List TTS jobs for the current user
     * @param {number} limit - Number of jobs to return
     * @param {number} offset - Pagination offset
     */
    async listJobs(limit = 10, offset = 0) {
        const response = await this.client.get('/tts/jobs/list/', {
            params: { limit, offset }
        });
        return response.data;
    }
    
    /**
     * Cancel a pending or processing TTS job
     * @param {string} jobId - UUID of the job to cancel
     */
    async cancelJob(jobId) {
        const response = await this.client.post(`/tts/jobs/${jobId}/cancel/`);
        return response.data;
    }

    /**
     * Download audio from a completed job
     * @param {string} audioUrl - URL of the audio file
     * @param {string} outputPath - Path to save the audio file
     */
    async downloadAudio(audioUrl, outputPath) {
        const response = await axios.get(audioUrl, {
            responseType: 'stream',
            headers: {
                'Authorization': `ApiKey ${this.apiKey}`
            }
        });
        
        const writer = fs.createWriteStream(outputPath);
        response.data.pipe(writer);
        
        return new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    }
    
    // ============== Express TTS ==============
    
    /**
     * Use express TTS for immediate audio generation
     * @param {string} text - Text to convert (max 500 characters recommended)
     * @param {string} voiceId - Voice to use
     */
    async expressTTS(text, voiceId = 'voice_1') {
        const response = await this.client.post('/tts/express/', {
            text,
            voice_id: voiceId
        }, {
            responseType: 'arraybuffer'
        });
        
        return response.data;
    }
}

// ============== Example Usage ==============

async function main() {
    // Load API key from environment variable
    const API_KEY = process.env.CREOLECENTRIC_API_KEY;
    
    if (!API_KEY) {
        console.error('Error: CREOLECENTRIC_API_KEY environment variable not set');
        console.error('Please set it with your API key:');
        console.error('  export CREOLECENTRIC_API_KEY="cc_your_key_here"');
        process.exit(1);
    }
    
    // Initialize client
    const client = new CreoleCentricAPI(API_KEY);
    
    try {
        // 1. Check API health
        console.log('=' .repeat(50));
        console.log('1. Checking API Health');
        console.log('=' .repeat(50));
        
        const health = await client.checkHealth();
        console.log(`API Status: ${health.status}`);
        console.log(`Version: ${health.version}`);
        console.log();
        
        // 2. Get credit balance
        console.log('=' .repeat(50));
        console.log('2. Credit Balance');
        console.log('=' .repeat(50));
        
        const balance = await client.getCreditBalance();
        console.log(`Total Credits: ${(balance.total_credits || 0).toLocaleString()}`);
        console.log(`Subscription Credits: ${(balance.subscription_credits || 0).toLocaleString()}`);
        console.log(`Purchased Credits: ${(balance.purchased_credits || 0).toLocaleString()}`);
        console.log();
        
        // 3. Get available voices
        console.log('=' .repeat(50));
        console.log('3. Available Voices');
        console.log('=' .repeat(50));

        const voicesResponse = await client.getVoices();
        const voices = voicesResponse.voices || [];
        console.log(`Found ${voicesResponse.count || voices.length} voices (source: ${voicesResponse.source || 'unknown'}):`);

        // Show first 5 voices
        voices.slice(0, 5).forEach(voice => {
            console.log(`  - ${voice.name} (ID: ${voice.voice_id})`);
            console.log(`    Region: ${voice.region}, Gender: ${voice.gender}`);
        });
        console.log();

        // 4. Get available models
        console.log('=' .repeat(50));
        console.log('4. Available Models');
        console.log('=' .repeat(50));

        const modelsResponse = await client.getModels();
        const models = modelsResponse.models || [];
        console.log(`Found ${modelsResponse.count || models.length} models:`);

        models.forEach(model => {
            console.log(`  - ${model.display_name || model.name} (ID: ${model.id})`);
            console.log(`    Description: ${model.description}`);
        });
        console.log();
        
        // 5. Create a TTS job
        console.log('=' .repeat(50));
        console.log('5. Creating TTS Job');
        console.log('=' .repeat(50));
        
        const text = "Bonjou! Mwen se yon egzanp API pou CreoleCentric. Mwen ka pale Kreyòl ayisyen.";
        console.log(`Text: ${text}`);
        
        // Use Xavier Bruneau voice and default model
        // Use a real voice ID - don't rely on voices list which may contain placeholders
        let voiceId = 'i4mRPwKM2yHwXhbmkN514';  // Xavier Bruneau
        let modelId = 'ccl_ht_v100';

        // If you want to use a voice from the list, make sure it's not a placeholder
        if (voices[0] && !['voice_1', 'voice_2'].includes(voices[0].voice_id)) {
            voiceId = voices[0].voice_id;
        }
        if (models[0]) {
            modelId = models[0].id;
        }

        // To use webhooks, add webhook_url parameter:
        const job = await client.createTTSJob(text, voiceId, modelId, {
            webhook_url: 'https://your-app.com/webhooks/tts'  // Your webhook endpoint
            // Optional parameters:
            // speed: 1.0,
            // pitch: 1.0
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
        console.log('=' .repeat(50));
        console.log('6. Recent Jobs');
        console.log('=' .repeat(50));
        
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
        
        // 8. Express TTS (for short texts)
        console.log();
        console.log('=' .repeat(50));
        console.log('8. Express TTS (Quick Generation)');
        console.log('=' .repeat(50));
        
        const shortText = "Mèsi anpil!";
        console.log(`Generating audio for: "${shortText}"`);
        
        try {
            const audioData = await client.expressTTS(shortText, voiceId);
            const expressOutputPath = path.join(__dirname, 'express_output.mp3');
            fs.writeFileSync(expressOutputPath, audioData);
            console.log(`Express TTS audio saved to: ${expressOutputPath}`);
        } catch (error) {
            console.log('Express TTS not available or error occurred');
        }
        
    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

// Run the example if this file is executed directly
if (require.main === module) {
    main().catch(console.error);
}

// Export for use as a module
module.exports = CreoleCentricAPI;