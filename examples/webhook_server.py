#!/usr/bin/env python3
"""
CreoleCentric Webhook Server Example
=====================================
This example demonstrates how to receive and process webhook events
from the CreoleCentric TTS API.

Requirements:
    pip install flask requests

Usage:
    1. Run this server: python webhook_server.py
    2. In another terminal, expose it with ngrok: ngrok http 5000
    3. Use the ngrok URL as your webhook_url when creating TTS jobs
"""

import json
import logging
from datetime import datetime
from flask import Flask, request, jsonify
import os

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)

# Store received webhooks (in production, use a database)
webhook_events = []


@app.route('/')
def index():
    """Home page showing server status and recent webhooks"""
    html = """
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
        <h1>🎤 CreoleCentric Webhook Server</h1>
        <p>Server is running and ready to receive webhooks!</p>
        <p>Webhook URL: <code>http://your-server.com/webhook</code></p>
        <p><small>Page auto-refreshes every 5 seconds</small></p>

        <h2>Recent Webhook Events (Last 10)</h2>
    """

    if not webhook_events:
        html += "<p>No webhooks received yet.</p>"
    else:
        for event in webhook_events[-10:][::-1]:  # Show last 10, most recent first
            status_class = f"status-{event.get('status', 'pending')}"
            html += f"""
            <div class="event">
                <div class="event-header">
                    {event.get('event', 'Unknown')} -
                    <span class="status {status_class}">{event.get('status', 'N/A')}</span>
                    - {event.get('timestamp', 'N/A')}
                </div>
                <div>Job ID: {event.get('job_id', 'N/A')}</div>
                <pre class="json">{json.dumps(event, indent=2)}</pre>
            </div>
            """

    html += """
    </body>
    </html>
    """
    return html


@app.route('/webhook', methods=['POST'])
def webhook():
    """
    Webhook endpoint to receive CreoleCentric TTS events.

    Expected webhook events:
    - tts_queued: Job added to queue
    - tts_started: Processing started
    - tts_synthesized: Audio synthesis complete
    - tts_uploaded: Audio uploaded to S3
    - tts_delivered: Job fully completed
    - tts_failed: Job failed
    """
    try:
        # Get the webhook data
        data = request.json

        if not data:
            logger.warning("Received webhook with no data")
            return jsonify({"error": "No data provided"}), 400

        # Log the received event
        event_type = data.get('event', 'unknown')
        job_id = data.get('job_id', 'unknown')
        status = data.get('status', 'unknown')

        logger.info(f"Received webhook: {event_type} for job {job_id} (status: {status})")

        # Store the event
        webhook_events.append({
            **data,
            'received_at': datetime.utcnow().isoformat()
        })

        # Process based on event type
        if event_type == 'tts_queued':
            handle_queued(data)

        elif event_type == 'tts_started':
            handle_started(data)

        elif event_type == 'tts_synthesized':
            handle_synthesized(data)

        elif event_type == 'tts_uploaded':
            handle_uploaded(data)

        elif event_type == 'tts_delivered':
            handle_delivered(data)

        elif event_type == 'tts_failed':
            handle_failed(data)

        else:
            logger.warning(f"Unknown event type: {event_type}")

        # Return success response
        return jsonify({
            "status": "success",
            "message": f"Webhook {event_type} processed",
            "job_id": job_id
        }), 200

    except Exception as e:
        logger.error(f"Error processing webhook: {str(e)}")
        return jsonify({"error": str(e)}), 500


def handle_queued(data):
    """Handle job queued event"""
    job_id = data.get('job_id')
    queue_position = data.get('queue_position')
    logger.info(f"Job {job_id} queued at position {queue_position}")

    # In production, you might:
    # - Update job status in your database
    # - Send notification to user
    # - Update UI via WebSocket


def handle_started(data):
    """Handle job started event"""
    job_id = data.get('job_id')
    logger.info(f"Job {job_id} processing started")

    # In production, you might:
    # - Update job status to "processing"
    # - Log processing start time


def handle_synthesized(data):
    """Handle synthesis complete event"""
    job_id = data.get('job_id')
    duration = data.get('duration_seconds')
    logger.info(f"Job {job_id} synthesized, duration: {duration}s")

    # In production, you might:
    # - Log synthesis metrics
    # - Prepare for download


def handle_uploaded(data):
    """Handle S3 upload complete event"""
    job_id = data.get('job_id')
    s3_url = data.get('s3_url')
    logger.info(f"Job {job_id} uploaded to S3: {s3_url}")

    # In production, you might:
    # - Store S3 URL for later access
    # - Trigger post-processing


def handle_delivered(data):
    """Handle job completion event"""
    job_id = data.get('job_id')
    audio_url = data.get('audio_file_url')
    s3_url = data.get('s3_url')
    credits_used = data.get('credits_used')
    duration = data.get('duration_seconds')

    logger.info(f"Job {job_id} completed successfully!")
    logger.info(f"  Audio URL: {audio_url}")
    logger.info(f"  S3 URL: {s3_url}")
    logger.info(f"  Duration: {duration}s")
    logger.info(f"  Credits used: {credits_used}")

    # In production, you might:
    # - Download and store the audio file
    # - Update job status to "completed"
    # - Send notification to user
    # - Trigger any post-processing workflows

    # Example: Download the audio file
    if audio_url:
        download_audio(job_id, audio_url)


def handle_failed(data):
    """Handle job failure event"""
    job_id = data.get('job_id')
    error_message = data.get('error_message', 'Unknown error')
    logger.error(f"Job {job_id} failed: {error_message}")

    # In production, you might:
    # - Update job status to "failed"
    # - Send error notification to user
    # - Log error for debugging
    # - Potentially retry the job


def download_audio(job_id, audio_url):
    """Download audio file from completed job"""
    try:
        import requests

        logger.info(f"Downloading audio for job {job_id}")

        # Create downloads directory if it doesn't exist
        os.makedirs('downloads', exist_ok=True)

        # Download the file
        response = requests.get(audio_url, stream=True)
        response.raise_for_status()

        # Save to file
        filename = f"downloads/{job_id}.mp3"
        with open(filename, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)

        logger.info(f"Audio saved to {filename}")

    except Exception as e:
        logger.error(f"Failed to download audio: {str(e)}")


@app.route('/events')
def get_events():
    """API endpoint to get all webhook events as JSON"""
    return jsonify(webhook_events)


@app.route('/events/<job_id>')
def get_job_events(job_id):
    """API endpoint to get events for a specific job"""
    job_events = [e for e in webhook_events if e.get('job_id') == job_id]
    return jsonify(job_events)


@app.route('/health')
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "events_received": len(webhook_events)
    })


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))

    print("=" * 50)
    print("CreoleCentric Webhook Server")
    print("=" * 50)
    print(f"Server starting on http://localhost:{port}")
    print(f"Webhook endpoint: http://localhost:{port}/webhook")
    print("")
    print("To expose this server to the internet for testing:")
    print("1. Install ngrok: https://ngrok.com")
    print(f"2. Run: ngrok http {port}")
    print("3. Use the ngrok URL as your webhook_url")
    print("")
    print("Press Ctrl+C to stop the server")
    print("=" * 50)

    app.run(host='0.0.0.0', port=port, debug=True)