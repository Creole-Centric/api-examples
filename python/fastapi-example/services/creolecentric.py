import os
import httpx
from typing import Dict, Any


class CreoleCentricClient:
    """Async client for interacting with CreoleCentric TTS API"""

    def __init__(self):
        self.api_key = os.getenv('CREOLECENTRIC_API_KEY')
        self.base_url = os.getenv('CREOLECENTRIC_API_URL', 'https://api.creolecentric.com/v1').rstrip('/')
        self.headers = {
            "Authorization": f"ApiKey {self.api_key}",
            "Content-Type": "application/json"
        }

    async def _make_request(self, method: str, endpoint: str, data: Dict = None) -> Dict[str, Any]:
        """Make an async HTTP request to the API"""
        url = f"{self.base_url}{endpoint}"

        async with httpx.AsyncClient() as client:
            response = await client.request(
                method=method,
                url=url,
                json=data,
                headers=self.headers,
                timeout=30.0
            )
            response.raise_for_status()
            return response.json() if response.content else {}

    async def get_voices(self) -> Dict[str, Any]:
        """Get list of available voices"""
        return await self._make_request("GET", "/tts/voices/")

    async def get_models(self) -> Dict[str, Any]:
        """Get list of available TTS models"""
        return await self._make_request("GET", "/tts/models/")

    async def get_credit_balance(self) -> Dict[str, Any]:
        """Get current credit balance"""
        return await self._make_request("GET", "/credits/balance/")

    async def create_tts_job(self, text: str, voice_id: str, model_id: str, callback_url: str = None, **kwargs) -> Dict[str, Any]:
        """
        Create a new TTS job

        Args:
            text: Text to convert to speech
            voice_id: Voice to use for synthesis
            model_id: TTS model to use
            callback_url: Optional webhook URL for status updates (RECOMMENDED)
            **kwargs: Additional parameters

        Returns:
            Dict containing job details

        Note:
            Using callback_url is HIGHLY RECOMMENDED for production applications.
            Webhooks provide real-time updates without polling.
        """
        data = {
            "text": text,
            "voice_id": voice_id,
            "model_id": model_id,
            **kwargs
        }

        # Add callback URL if provided (RECOMMENDED)
        if callback_url:
            data["callback_url"] = callback_url

        return await self._make_request("POST", "/tts/jobs/", data=data)

    async def get_job_status(self, job_id: str) -> Dict[str, Any]:
        """Get status of a TTS job"""
        return await self._make_request("GET", f"/tts/jobs/{job_id}/status/")

    async def get_job_details(self, job_id: str) -> Dict[str, Any]:
        """Get full details of a TTS job"""
        return await self._make_request("GET", f"/tts/jobs/{job_id}/")
