"""
Webhook Router for CreoleCentric TTS API

This module demonstrates how to receive and process webhook notifications
from the CreoleCentric TTS API using FastAPI. Webhooks are the RECOMMENDED
method for tracking job status instead of polling.
"""

import os
import hmac
import hashlib
import time
import logging
from fastapi import APIRouter, Request, HTTPException, status
from typing import Dict

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/webhooks", tags=["webhooks"])

# In-memory job storage (in production, use a real database)
job_storage: Dict[str, Dict] = {}


def validate_webhook_signature(payload: bytes, signature: str, timestamp: str) -> bool:
    """
    Validate webhook signature

    Security Note:
        Webhook signature validation is OPTIONAL but RECOMMENDED for production.
        If no webhook secret is configured, validation is skipped.
    """
    webhook_secret = os.getenv('CREOLECENTRIC_WEBHOOK_SECRET')

    if not webhook_secret:
        logger.info("Webhook signature validation skipped - no CREOLECENTRIC_WEBHOOK_SECRET configured")
        return True

    if not signature or not timestamp:
        logger.warning("Missing webhook signature or timestamp headers")
        return False

    # Check timestamp to prevent replay attacks
    try:
        webhook_time = int(timestamp)
        current_time = int(time.time())
        if abs(current_time - webhook_time) > 300:  # 5 minutes
            logger.warning(f"Webhook timestamp too old: {webhook_time}")
            return False
    except (ValueError, TypeError):
        logger.warning(f"Invalid webhook timestamp: {timestamp}")
        return False

    # Calculate expected signature
    message = f"{timestamp}.{payload.decode('utf-8')}"
    expected_signature = hmac.new(
        webhook_secret.encode('utf-8'),
        message.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()

    is_valid = hmac.compare_digest(signature, expected_signature)
    if not is_valid:
        logger.warning(f"Webhook signature mismatch")
    return is_valid


@router.post("/tts")
async def webhook_receiver(request: Request):
    """
    Receive and process webhook notifications from CreoleCentric API

    This endpoint handles all webhook events. It validates signatures,
    updates job status, and can trigger additional actions.
    """
    try:
        # Get signature headers
        signature = request.headers.get('x-webhook-signature')
        timestamp = request.headers.get('x-webhook-timestamp')

        # Get raw body for signature validation
        body = await request.body()

        # Validate signature
        if not validate_webhook_signature(body, signature, timestamp):
            logger.error("Invalid webhook signature")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid signature"
            )

        # Parse JSON payload
        try:
            payload = await request.json()
        except Exception:
            logger.error("Invalid JSON payload")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid JSON"
            )

        # Extract event data
        event = payload.get('event')
        job_id = payload.get('job_id')

        if not event or not job_id:
            logger.error(f"Missing event or job_id in payload")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing required fields"
            )

        logger.info(f"Received webhook event '{event}' for job {job_id}")

        # Get or create job record
        if job_id not in job_storage:
            job_storage[job_id] = {'job_id': job_id}

        job = job_storage[job_id]

        # Process based on event type
        if event == 'tts_queued':
            job['status'] = 'queued'
        elif event == 'tts_started':
            job['status'] = 'processing'
        elif event == 'tts_synthesized':
            job['status'] = 'synthesized'
        elif event == 'tts_uploaded':
            job['status'] = 'uploaded'
            if payload.get('audio_url'):
                job['audio_url'] = payload['audio_url']
        elif event == 'tts_delivered':
            job['status'] = 'delivered'
            if payload.get('audio_url'):
                job['audio_url'] = payload['audio_url']
            if payload.get('duration_seconds'):
                job['duration_seconds'] = payload['duration_seconds']
            if payload.get('credits_used'):
                job['credits_used'] = payload['credits_used']
            logger.info(f"Job {job_id} delivered successfully")
        elif event == 'tts_failed':
            job['status'] = 'failed'
            job['error_message'] = payload.get('error', 'Unknown error')
            logger.error(f"Job {job_id} failed: {job['error_message']}")
        else:
            logger.warning(f"Unknown webhook event: {event}")

        return {
            "status": "success",
            "job_id": job_id,
            "event": event
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Error processing webhook: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.get("/test")
async def webhook_test():
    """
    Test endpoint to verify webhook configuration

    This endpoint can be used to test that your webhook URL is accessible.
    """
    return {
        "status": "ok",
        "message": "Webhook endpoint is accessible"
    }
