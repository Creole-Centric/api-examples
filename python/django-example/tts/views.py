from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from django.utils import timezone
from .models import TTSJob
from .serializers import TTSJobSerializer, TTSJobCreateSerializer
from .services import CreoleCentricClient
import requests


class TTSJobViewSet(viewsets.ModelViewSet):
    """ViewSet for TTS Jobs"""

    queryset = TTSJob.objects.all()
    serializer_class = TTSJobSerializer

    def create(self, request):
        """
        Create a new TTS job

        Accepts optional callback_url parameter for webhook notifications.
        Using webhooks is RECOMMENDED over polling for production applications.
        """
        serializer = TTSJobCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            client = CreoleCentricClient()

            # Get callback URL from request if provided
            callback_url = request.data.get('callback_url')

            # Create job with optional webhook callback
            job_data = client.create_tts_job(
                callback_url=callback_url,
                **serializer.validated_data
            )

            # Save to database
            tts_job = TTSJob.objects.create(
                job_id=job_data['id'],
                text=serializer.validated_data['text'],
                voice_id=serializer.validated_data.get('voice_id', 'i4mRPwKM2yHwXhbmkN514'),
                model_id=serializer.validated_data.get('model_id', 'ccl_ht_v100'),
                status=job_data.get('status', 'queued'),
                audio_url=job_data.get('audio_url'),
                credits_used=job_data.get('credits_used'),
            )

            return Response(
                TTSJobSerializer(tts_job).data,
                status=status.HTTP_201_CREATED
            )

        except requests.HTTPError as e:
            return Response(
                {"error": str(e), "details": e.response.text if e.response else None},
                status=e.response.status_code if e.response else status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['get'])
    def refresh(self, request, pk=None):
        """Refresh job status from CreoleCentric API"""
        tts_job = self.get_object()

        try:
            client = CreoleCentricClient()
            job_data = client.get_job_status(tts_job.job_id)

            # Update database
            tts_job.status = job_data.get('status', tts_job.status)
            tts_job.audio_url = job_data.get('audio_url') or tts_job.audio_url
            tts_job.duration_seconds = job_data.get('duration_seconds') or tts_job.duration_seconds
            tts_job.credits_used = job_data.get('credits_used') or tts_job.credits_used
            tts_job.error_message = job_data.get('error_message') or tts_job.error_message

            if job_data.get('status') in ['delivered', 'completed'] and not tts_job.completed_at:
                tts_job.completed_at = timezone.now()

            tts_job.save()

            return Response(TTSJobSerializer(tts_job).data)

        except requests.HTTPError as e:
            return Response(
                {"error": str(e)},
                status=e.response.status_code if e.response else status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@api_view(['GET'])
def get_voices(request):
    """Get available voices"""
    try:
        client = CreoleCentricClient()
        voices = client.get_voices()
        return Response(voices)
    except requests.HTTPError as e:
        return Response(
            {"error": str(e)},
            status=e.response.status_code if e.response else status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def get_models(request):
    """Get available models"""
    try:
        client = CreoleCentricClient()
        models = client.get_models()
        return Response(models)
    except requests.HTTPError as e:
        return Response(
            {"error": str(e)},
            status=e.response.status_code if e.response else status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def get_credit_balance(request):
    """Get credit balance"""
    try:
        client = CreoleCentricClient()
        balance = client.get_credit_balance()
        return Response(balance)
    except requests.HTTPError as e:
        return Response(
            {"error": str(e)},
            status=e.response.status_code if e.response else status.HTTP_500_INTERNAL_SERVER_ERROR
        )
