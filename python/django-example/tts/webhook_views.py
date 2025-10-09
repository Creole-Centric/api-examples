"""
Webhook Views for CreoleCentric TTS API

This module demonstrates how to receive and process webhook notifications
from the CreoleCentric TTS API. Webhooks are the RECOMMENDED method for
tracking job status instead of polling.

Webhook Events:
- tts_queued: Job has been queued for processing
- tts_started: Job processing has started
- tts_synthesized: TTS synthesis is complete
- tts_uploaded: Audio file uploaded to storage
- tts_delivered: Job is fully complete and ready
- tts_failed: Job processing failed
"""

import json
import hmac
import hashlib
import time
import logging
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils import timezone
from django.conf import settings
from .models import TTSJob

logger = logging.getLogger(__name__)


def validate_webhook_signature(payload: bytes, signature: str, timestamp: str) -> bool:
    """
    Validate webhook signature to ensure it came from CreoleCentric API

    Args:
        payload: Raw request body as bytes
        signature: Signature from X-Webhook-Signature header
        timestamp: Timestamp from X-Webhook-Timestamp header

    Returns:
        bool: True if signature is valid, False otherwise

    Security Note:
        Webhook signature validation is OPTIONAL but RECOMMENDED for production.
        If no webhook secret is configured, validation is skipped with a warning.
        This matches the behavior of the CreoleCentric core system.
    """
    # Get webhook secret from settings (optional)
    webhook_secret = getattr(settings, 'CREOLECENTRIC_WEBHOOK_SECRET', None)

    if not webhook_secret:
        # No secret configured - skip validation (matches core behavior)
        logger.info("Webhook signature validation skipped - no CREOLECENTRIC_WEBHOOK_SECRET configured")
        return True

    if not signature or not timestamp:
        logger.warning("Missing webhook signature or timestamp headers")
        return False

    # Check timestamp to prevent replay attacks (reject if older than 5 minutes)
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
    # Format: HMAC-SHA256(timestamp + "." + payload, secret)
    message = f"{timestamp}.{payload.decode('utf-8')}"
    expected_signature = hmac.new(
        webhook_secret.encode('utf-8'),
        message.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()

    # Compare signatures (use constant-time comparison to prevent timing attacks)
    is_valid = hmac.compare_digest(signature, expected_signature)
    if not is_valid:
        logger.warning(f"Webhook signature mismatch - received: {signature[:8]}...")
    return is_valid


@csrf_exempt
@require_http_methods(["POST"])
def webhook_receiver(request):
    """
    Receive and process webhook notifications from CreoleCentric API

    This endpoint handles all webhook events sent by the CreoleCentric TTS API.
    It validates the signature, updates the job status in the database, and
    can trigger additional actions (notifications, etc.)

    Example webhook payload:
    {
        "event": "tts_delivered",
        "job_id": "job_abc123",
        "status": "delivered",
        "audio_url": "https://storage.creolecentric.com/audio/abc123.mp3",
        "duration_seconds": 12.5,
        "credits_used": 150,
        "timestamp": "2024-01-15T10:30:00Z"
    }
    """
    try:
        # Get signature headers
        signature = request.headers.get('X-Webhook-Signature')
        timestamp = request.headers.get('X-Webhook-Timestamp')

        # Validate signature
        if not validate_webhook_signature(request.body, signature, timestamp):
            logger.error("Invalid webhook signature")
            return JsonResponse(
                {"error": "Invalid signature"},
                status=401
            )

        # Parse payload
        try:
            payload = json.loads(request.body)
        except json.JSONDecodeError:
            logger.error("Invalid JSON payload")
            return JsonResponse(
                {"error": "Invalid JSON"},
                status=400
            )

        # Extract event data
        event = payload.get('event')
        job_id = payload.get('job_id')

        if not event or not job_id:
            logger.error(f"Missing event or job_id in payload: {payload}")
            return JsonResponse(
                {"error": "Missing required fields"},
                status=400
            )

        logger.info(f"Received webhook event '{event}' for job {job_id}")

        # Find the job in database
        try:
            tts_job = TTSJob.objects.get(job_id=job_id)
        except TTSJob.DoesNotExist:
            logger.error(f"Job {job_id} not found in database")
            return JsonResponse(
                {"error": "Job not found"},
                status=404
            )

        # Process based on event type
        if event == 'tts_queued':
            tts_job.status = 'queued'
            logger.info(f"Job {job_id} queued")

        elif event == 'tts_started':
            tts_job.status = 'processing'
            logger.info(f"Job {job_id} started processing")

        elif event == 'tts_synthesized':
            tts_job.status = 'synthesized'
            logger.info(f"Job {job_id} synthesis complete")

        elif event == 'tts_uploaded':
            tts_job.status = 'uploaded'
            if payload.get('audio_url'):
                tts_job.audio_url = payload['audio_url']
            logger.info(f"Job {job_id} uploaded to storage")

        elif event == 'tts_delivered':
            tts_job.status = 'delivered'
            if payload.get('audio_url'):
                tts_job.audio_url = payload['audio_url']
            if payload.get('duration_seconds'):
                tts_job.duration_seconds = payload['duration_seconds']
            if payload.get('credits_used'):
                tts_job.credits_used = payload['credits_used']
            if not tts_job.completed_at:
                tts_job.completed_at = timezone.now()
            logger.info(f"Job {job_id} delivered successfully")

            # TODO: You can trigger additional actions here:
            # - Send email notification to user
            # - Push notification via WebSocket
            # - Update external systems
            # - Log analytics

        elif event == 'tts_failed':
            tts_job.status = 'failed'
            tts_job.error_message = payload.get('error', 'Unknown error')
            logger.error(f"Job {job_id} failed: {tts_job.error_message}")

            # TODO: You can trigger failure actions here:
            # - Send error notification to user
            # - Refund credits if applicable
            # - Log error for debugging

        else:
            logger.warning(f"Unknown webhook event: {event}")
            # Still return 200 to acknowledge receipt

        # Save updates to database
        tts_job.save()

        # Return success response
        return JsonResponse({
            "status": "success",
            "job_id": job_id,
            "event": event
        })

    except Exception as e:
        logger.exception(f"Error processing webhook: {e}")
        return JsonResponse(
            {"error": "Internal server error"},
            status=500
        )


@csrf_exempt
@require_http_methods(["GET"])
def webhook_test(request):
    """
    Test endpoint to verify webhook configuration

    This endpoint can be used to test that your webhook URL is accessible
    from the internet. The CreoleCentric API may ping this endpoint to
    verify webhook configuration.
    """
    return JsonResponse({
        "status": "ok",
        "message": "Webhook endpoint is accessible"
    })
