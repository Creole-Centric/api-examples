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
     */
    async getVoices() {
        const response = await this.client.get('/tts/voices/');
        return response.data;
    }
    
    /**
     * Get list of available TTS models
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
     * Wait for a job to complete
     * @param {string} jobId - UUID of the job
     * @param {number} timeout - Maximum time to wait in seconds
     * @param {number} pollInterval - Time between status checks in seconds
     */
    async waitForJob(jobId, timeout = 300, pollInterval = 2) {
        const startTime = Date.now();
        const timeoutMs = timeout * 1000;
        const pollIntervalMs = pollInterval * 1000;
        
        while (Date.now() - startTime < timeoutMs) {
            const status = await this.getJobStatus(jobId);
            
            if (['completed', 'failed', 'cancelled'].includes(status.status)) {
                return status;
            }
            
            console.log(`Job ${jobId} status: ${status.status || 'unknown'}`);
            
            // Wait before next poll
            await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
        }
        
        throw new Error(`Job ${jobId} did not complete within ${timeout} seconds`);
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
        
        const voices = await client.getVoices();
        console.log(`Found ${voices.length} voices:`);
        
        // Show first 5 voices
        voices.slice(0, 5).forEach(voice => {
            console.log(`  - ${voice.name} (ID: ${voice.voice_id})`);
            console.log(`    Language: ${voice.language}, Gender: ${voice.gender}`);
        });
        console.log();
        
        // 4. Get available models
        console.log('=' .repeat(50));
        console.log('4. Available Models');
        console.log('=' .repeat(50));
        
        const models = await client.getModels();
        console.log(`Found ${models.length} models:`);
        
        models.forEach(model => {
            console.log(`  - ${model.name} (ID: ${model.model_id})`);
            console.log(`    Description: ${model.description}`);
        });
        console.log();
        
        // 5. Create a TTS job
        console.log('=' .repeat(50));
        console.log('5. Creating TTS Job');
        console.log('=' .repeat(50));
        
        const text = "Bonjou! Mwen se yon egzanp API pou CreoleCentric. Mwen ka pale Kreyòl ayisyen.";
        console.log(`Text: ${text}`);
        
        // Use first available voice and model
        const voiceId = voices[0]?.voice_id || 'voice_1';
        const modelId = models[0]?.model_id || 'model_1';
        
        const job = await client.createTTSJob(text, voiceId, modelId, {
            // Optional parameters
            // speed: 1.0,
            // pitch: 1.0
        });
        
        const jobId = job.job_id;
        console.log('Job created successfully!');
        console.log(`Job ID: ${jobId}`);
        console.log(`Status: ${job.status}`);
        console.log(`Credits used: ${job.credits_used || 0}`);
        console.log();
        
        // 6. Wait for job completion
        console.log('=' .repeat(50));
        console.log('6. Waiting for Job Completion');
        console.log('=' .repeat(50));
        
        if (jobId) {
            try {
                const finalStatus = await client.waitForJob(jobId, 60);
                console.log('Job completed!');
                console.log(`Final status: ${finalStatus.status}`);
                
                if (finalStatus.audio_url) {
                    console.log(`Audio URL: ${finalStatus.audio_url}`);
                    
                    // Optional: Download the audio file
                    // const outputPath = path.join(__dirname, `output_${jobId}.mp3`);
                    // await client.downloadAudio(finalStatus.audio_url, outputPath);
                    // console.log(`Audio saved to: ${outputPath}`);
                }
                
                if (finalStatus.duration_seconds) {
                    console.log(`Duration: ${finalStatus.duration_seconds} seconds`);
                }
            } catch (error) {
                console.error(`Job timed out: ${error.message}`);
            }
        }
        console.log();
        
        // 7. List recent jobs
        console.log('=' .repeat(50));
        console.log('7. Recent Jobs');
        console.log('=' .repeat(50));
        
        const jobs = await client.listJobs(5);
        console.log(`Recent ${jobs.results?.length || 0} jobs:`);
        
        jobs.results?.forEach(job => {
            console.log(`  - Job ${job.job_id.substring(0, 8)}...`);
            console.log(`    Created: ${job.created_at}`);
            console.log(`    Status: ${job.status}`);
            console.log(`    Text: ${job.text?.substring(0, 50)}...`);
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