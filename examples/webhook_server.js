#!/usr/bin/env node

/**
 * CreoleCentric Webhook Server Example (Node.js)
 * ===============================================
 * This example demonstrates how to receive and process webhook events
 * from the CreoleCentric TTS API using Node.js and Express.
 *
 * Requirements:
 *   npm install express body-parser axios
 *
 * Usage:
 *   1. Run this server: node webhook_server.js
 *   2. In another terminal, expose it with ngrok: ngrok http 3000
 *   3. Use the ngrok URL as your webhook_url when creating TTS jobs
 */

const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const axios = require('axios').default;

// Initialize Express app
const app = express();
app.use(bodyParser.json());

// Port configuration
const PORT = process.env.PORT || 3000;

// Store received webhooks (in production, use a database)
const webhookEvents = [];

// Ensure downloads directory exists
const downloadsDir = path.join(__dirname, 'downloads');
if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir);
}

/**
 * Home page showing server status and recent webhooks
 */
app.get('/', (req, res) => {
    const recentEvents = webhookEvents.slice(-10).reverse(); // Last 10 events, newest first

    const eventsList = recentEvents.length > 0
        ? recentEvents.map(event => {
            const statusClass = `status-${event.status || 'pending'}`;
            return `
                <div class="event">
                    <div class="event-header">
                        ${event.event || 'Unknown'} -
                        <span class="status ${statusClass}">${event.status || 'N/A'}</span>
                        - ${event.timestamp || 'N/A'}
                    </div>
                    <div>Job ID: ${event.job_id || 'N/A'}</div>
                    <pre class="json">${JSON.stringify(event, null, 2)}</pre>
                </div>
            `;
        }).join('')
        : '<p>No webhooks received yet.</p>';

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>CreoleCentric Webhook Server</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                h1 { color: #333; }
                .event {
                    background: #f5f5f5;
                    padding: 15px;
                    margin: 10px 0;
                    border-radius: 5px;
                    border-left: 4px solid #007bff;
                }
                .event-header {
                    font-weight: bold;
                    color: #007bff;
                    margin-bottom: 10px;
                }
                .json {
                    background: #2d2d2d;
                    color: #f8f8f2;
                    padding: 10px;
                    border-radius: 3px;
                    font-family: 'Courier New', monospace;
                    font-size: 12px;
                    overflow-x: auto;
                }
                .status {
                    display: inline-block;
                    padding: 3px 8px;
                    border-radius: 3px;
                    font-size: 12px;
                    font-weight: bold;
                }
                .status-pending { background: #ffc107; color: #000; }
                .status-processing { background: #17a2b8; color: #fff; }
                .status-completed { background: #28a745; color: #fff; }
                .status-failed { background: #dc3545; color: #fff; }
            </style>
            <meta http-equiv="refresh" content="5">
        </head>
        <body>
            <h1>🎤 CreoleCentric Webhook Server (Node.js)</h1>
            <p>Server is running on port ${PORT}</p>
            <p>Webhook URL: <code>http://your-server.com/webhook</code></p>
            <p><small>Page auto-refreshes every 5 seconds</small></p>

            <h2>Recent Webhook Events (Last 10)</h2>
            ${eventsList}
        </body>
        </html>
    `;

    res.send(html);
});

/**
 * Webhook endpoint to receive CreoleCentric TTS events
 */
app.post('/webhook', (req, res) => {
    try {
        const data = req.body;

        if (!data) {
            console.warn('Received webhook with no data');
            return res.status(400).json({ error: 'No data provided' });
        }

        // Extract event details
        const eventType = data.event || 'unknown';
        const jobId = data.job_id || 'unknown';
        const status = data.status || 'unknown';

        console.log(`\n📨 Received webhook: ${eventType} for job ${jobId} (status: ${status})`);

        // Store the event with received timestamp
        webhookEvents.push({
            ...data,
            received_at: new Date().toISOString()
        });

        // Process based on event type
        switch (eventType) {
            case 'tts_queued':
                handleQueued(data);
                break;

            case 'tts_started':
                handleStarted(data);
                break;

            case 'tts_synthesized':
                handleSynthesized(data);
                break;

            case 'tts_uploaded':
                handleUploaded(data);
                break;

            case 'tts_delivered':
                handleDelivered(data);
                break;

            case 'tts_failed':
                handleFailed(data);
                break;

            default:
                console.warn(`⚠️  Unknown event type: ${eventType}`);
        }

        // Return success response
        res.json({
            status: 'success',
            message: `Webhook ${eventType} processed`,
            job_id: jobId
        });

    } catch (error) {
        console.error('❌ Error processing webhook:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Handle job queued event
 */
function handleQueued(data) {
    const jobId = data.job_id;
    const queuePosition = data.queue_position;
    console.log(`📋 Job ${jobId} queued at position ${queuePosition}`);

    // In production, you might:
    // - Update job status in your database
    // - Send notification to user
    // - Update UI via WebSocket
}

/**
 * Handle job started event
 */
function handleStarted(data) {
    const jobId = data.job_id;
    console.log(`🚀 Job ${jobId} processing started`);

    // In production, you might:
    // - Update job status to "processing"
    // - Log processing start time
}

/**
 * Handle synthesis complete event
 */
function handleSynthesized(data) {
    const jobId = data.job_id;
    const duration = data.duration_seconds;
    console.log(`🎵 Job ${jobId} synthesized, duration: ${duration}s`);

    // In production, you might:
    // - Log synthesis metrics
    // - Prepare for download
}

/**
 * Handle S3 upload complete event
 */
function handleUploaded(data) {
    const jobId = data.job_id;
    const s3Url = data.s3_url;
    console.log(`☁️  Job ${jobId} uploaded to S3: ${s3Url}`);

    // In production, you might:
    // - Store S3 URL for later access
    // - Trigger post-processing
}

/**
 * Handle job completion event
 */
function handleDelivered(data) {
    const jobId = data.job_id;
    const audioUrl = data.audio_file_url;
    const s3Url = data.s3_url;
    const creditsUsed = data.credits_used;
    const duration = data.duration_seconds;

    console.log(`✅ Job ${jobId} completed successfully!`);
    console.log(`   Audio URL: ${audioUrl}`);
    console.log(`   S3 URL: ${s3Url}`);
    console.log(`   Duration: ${duration}s`);
    console.log(`   Credits used: ${creditsUsed}`);

    // In production, you might:
    // - Download and store the audio file
    // - Update job status to "completed"
    // - Send notification to user
    // - Trigger any post-processing workflows

    // Example: Download the audio file
    if (audioUrl) {
        downloadAudio(jobId, audioUrl);
    }
}

/**
 * Handle job failure event
 */
function handleFailed(data) {
    const jobId = data.job_id;
    const errorMessage = data.error_message || 'Unknown error';
    console.error(`❌ Job ${jobId} failed: ${errorMessage}`);

    // In production, you might:
    // - Update job status to "failed"
    // - Send error notification to user
    // - Log error for debugging
    // - Potentially retry the job
}

/**
 * Download audio file from completed job
 */
async function downloadAudio(jobId, audioUrl) {
    try {
        console.log(`📥 Downloading audio for job ${jobId}`);

        // Download the file
        const response = await axios({
            method: 'GET',
            url: audioUrl,
            responseType: 'stream'
        });

        // Save to file
        const filename = path.join(downloadsDir, `${jobId}.mp3`);
        const writer = fs.createWriteStream(filename);

        response.data.pipe(writer);

        writer.on('finish', () => {
            console.log(`💾 Audio saved to ${filename}`);
        });

        writer.on('error', (error) => {
            console.error(`❌ Error saving audio: ${error.message}`);
        });

    } catch (error) {
        console.error(`❌ Failed to download audio: ${error.message}`);
    }
}

/**
 * API endpoint to get all webhook events as JSON
 */
app.get('/events', (req, res) => {
    res.json(webhookEvents);
});

/**
 * API endpoint to get events for a specific job
 */
app.get('/events/:jobId', (req, res) => {
    const jobId = req.params.jobId;
    const jobEvents = webhookEvents.filter(e => e.job_id === jobId);
    res.json(jobEvents);
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        events_received: webhookEvents.length
    });
});

// Start the server
app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log('CreoleCentric Webhook Server (Node.js)');
    console.log('='.repeat(50));
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Webhook endpoint: http://localhost:${PORT}/webhook`);
    console.log('');
    console.log('To expose this server to the internet for testing:');
    console.log('1. Install ngrok: https://ngrok.com');
    console.log(`2. Run: ngrok http ${PORT}`);
    console.log('3. Use the ngrok URL as your webhook_url');
    console.log('');
    console.log('Press Ctrl+C to stop the server');
    console.log('='.repeat(50));
});