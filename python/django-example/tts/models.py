from django.db import models


class TTSJob(models.Model):
    """Model for tracking TTS jobs"""

    job_id = models.CharField(max_length=255, unique=True, db_index=True)
    text = models.TextField()
    voice_id = models.CharField(max_length=255)
    model_id = models.CharField(max_length=255)
    status = models.CharField(max_length=50, default='queued')
    audio_url = models.URLField(blank=True, null=True)
    duration_seconds = models.FloatField(blank=True, null=True)
    credits_used = models.IntegerField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    error_message = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'TTS Job'
        verbose_name_plural = 'TTS Jobs'

    def __str__(self):
        return f"Job {self.job_id[:8]}... - {self.status}"
