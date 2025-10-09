from django.contrib import admin
from .models import TTSJob


@admin.register(TTSJob)
class TTSJobAdmin(admin.ModelAdmin):
    list_display = ['job_id_short', 'text_preview', 'status', 'voice_id', 'created_at', 'completed_at']
    list_filter = ['status', 'created_at']
    search_fields = ['job_id', 'text', 'voice_id']
    readonly_fields = ['job_id', 'created_at', 'completed_at']

    def job_id_short(self, obj):
        return f"{obj.job_id[:8]}..." if obj.job_id else "N/A"
    job_id_short.short_description = 'Job ID'

    def text_preview(self, obj):
        return obj.text[:50] + '...' if len(obj.text) > 50 else obj.text
    text_preview.short_description = 'Text'
