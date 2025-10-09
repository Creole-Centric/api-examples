from pydantic import BaseModel
from typing import Optional


class TTSJobCreate(BaseModel):
    """Request model for creating a TTS job"""
    text: str
    voice_id: str = "i4mRPwKM2yHwXhbmkN514"  # Xavier Bruneau default
    model_id: str = "ccl_ht_v100"  # Default Haitian Creole model
    callback_url: Optional[str] = None  # Webhook URL (RECOMMENDED)
    speed: Optional[float] = 1.0
    pitch: Optional[float] = 1.0


class TTSJob(BaseModel):
    """Response model for TTS job"""
    id: str
    status: str
    text: str
    voice_id: str
    model_id: str
    audio_url: Optional[str] = None
    duration_seconds: Optional[float] = None
    credits_used: Optional[int] = None
    created_at: str
    completed_at: Optional[str] = None
    error_message: Optional[str] = None


class ErrorResponse(BaseModel):
    """Error response model"""
    error: str
    details: Optional[str] = None
