from fastapi import APIRouter, HTTPException, status
from services.creolecentric import CreoleCentricClient
from models import TTSJobCreate, TTSJob, ErrorResponse
import httpx

router = APIRouter(prefix="/tts", tags=["tts"])
client = CreoleCentricClient()


@router.post("/jobs", response_model=dict, status_code=status.HTTP_201_CREATED, responses={500: {"model": ErrorResponse}})
async def create_tts_job(job_request: TTSJobCreate):
    """
    Create a new TTS job

    Accepts optional callback_url parameter for webhook notifications.
    Using webhooks is RECOMMENDED over polling for production applications.
    """
    try:
        job = await client.create_tts_job(
            text=job_request.text,
            voice_id=job_request.voice_id,
            model_id=job_request.model_id,
            callback_url=job_request.callback_url,
            speed=job_request.speed,
            pitch=job_request.pitch
        )
        return job

    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=e.response.status_code,
            detail={"error": str(e), "details": e.response.text}
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": str(e)}
        )


@router.get("/jobs/{job_id}", response_model=dict, responses={500: {"model": ErrorResponse}})
async def get_job_status(job_id: str):
    """Get job status"""
    try:
        job_status = await client.get_job_status(job_id)
        return job_status

    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=e.response.status_code,
            detail={"error": str(e), "details": e.response.text}
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": str(e)}
        )


@router.get("/voices", response_model=dict, responses={500: {"model": ErrorResponse}})
async def get_voices():
    """Get available voices"""
    try:
        voices = await client.get_voices()
        return voices

    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=e.response.status_code,
            detail={"error": str(e)}
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": str(e)}
        )


@router.get("/models", response_model=dict, responses={500: {"model": ErrorResponse}})
async def get_models():
    """Get available models"""
    try:
        models = await client.get_models()
        return models

    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=e.response.status_code,
            detail={"error": str(e)}
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": str(e)}
        )
