from rest_framework import serializers
from .models import TTSJob


class TTSJobSerializer(serializers.ModelSerializer):
    """Serializer for TTS Job model"""

    class Meta:
        model = TTSJob
        fields = [
            'id', 'job_id', 'text', 'voice_id', 'model_id',
            'status', 'audio_url', 'duration_seconds', 'credits_used',
            'created_at', 'completed_at', 'error_message'
        ]
        read_only_fields = [
            'id', 'job_id', 'status', 'audio_url', 'duration_seconds',
            'credits_used', 'created_at', 'completed_at', 'error_message'
        ]


class TTSJobCreateSerializer(serializers.Serializer):
    """Serializer for creating TTS jobs"""

    text = serializers.CharField(required=True)
    voice_id = serializers.CharField(default="i4mRPwKM2yHwXhbmkN514")
    model_id = serializers.CharField(default="ccl_ht_v100")
    speed = serializers.FloatField(required=False)
    pitch = serializers.FloatField(required=False)
