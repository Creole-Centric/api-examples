#!/usr/bin/env python3
"""
CreoleCentric TTS API Client Example
=====================================
This example demonstrates how to use the CreoleCentric Text-to-Speech API.

Requirements:
    pip install requests python-dotenv
"""

import os
import json
import time
import requests
from typing import Optional, Dict, Any, List
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class CreoleCentricAPI:
    """Client for interacting with CreoleCentric TTS API"""
    
    def __init__(self, api_key: str, base_url: str = "https://api.creolecentric.com/v1"):
        """
        Initialize the API client.
        
        Args:
            api_key: Your API key starting with 'cc_'
            base_url: Base URL for the API (default: production URL)
        """
        self.api_key = api_key
        self.base_url = base_url.rstrip('/')
        self.headers = {
            "Authorization": f"ApiKey {api_key}",
            "Content-Type": "application/json"
        }
        self.session = requests.Session()
        self.session.headers.update(self.headers)
    
    def _make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, 
                     params: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Make an HTTP request to the API.
        
        Args:
            method: HTTP method (GET, POST, etc.)
            endpoint: API endpoint (e.g., '/tts/jobs/')
            data: JSON data for POST requests
            params: Query parameters
            
        Returns:
            Response JSON data
            
        Raises:
            requests.HTTPError: If the request fails
        """
        url = f"{self.base_url}{endpoint}"
        
        try:
            response = self.session.request(
                method=method,
                url=url,
                json=data,
                params=params,
                timeout=30
            )
            response.raise_for_status()
            return response.json() if response.content else {}
        except requests.exceptions.HTTPError as e:
            print(f"HTTP Error: {e}")
            print(f"Response: {e.response.text if e.response else 'No response'}")
            raise
        except requests.exceptions.RequestException as e:
            print(f"Request Error: {e}")
            raise
    
    # ============== Health Check ==============
    
    def check_health(self) -> Dict[str, Any]:
        """Check API health status"""
        return self._make_request("GET", "/health/")
    
    # ============== User & Credits ==============
    
    def get_user_info(self) -> Dict[str, Any]:
        """Get current user information"""
        return self._make_request("GET", "/users/profile/")
    
    def get_credit_balance(self) -> Dict[str, Any]:
        """Get current credit balance"""
        return self._make_request("GET", "/credits/balance/")
    
    # ============== Voices & Models ==============
    
    def get_voices(self) -> Dict[str, Any]:
        """Get list of available voices

        Returns:
            Dictionary containing:
                - success: bool
                - voices: list of voice dictionaries
                - count: number of voices
                - source: data source (infer or local)
        """
        return self._make_request("GET", "/tts/voices/")
    
    def get_models(self) -> Dict[str, Any]:
        """Get list of available TTS models

        Returns:
            Dictionary containing:
                - success: bool
                - models: list of model dictionaries
                - count: number of models
        """
        return self._make_request("GET", "/tts/models/")
    
    def get_voice_settings(self) -> Dict[str, Any]:
        """Get voice settings configuration"""
        return self._make_request("GET", "/tts/voice-settings/")
    
    # ============== TTS Jobs ==============
    
    def create_tts_job(self, text: str, voice_id: str = "qW6MAd7f5iuYw7bAH96wC",
                      model_id: str = "ccl_ht_v100", **kwargs) -> Dict[str, Any]:
        """
        Create a new TTS job.
        
        Args:
            text: Text to convert to speech
            voice_id: ID of the voice to use
            model_id: ID of the model to use
            **kwargs: Additional parameters (speed, pitch, etc.)
            
        Returns:
            Job details including job_id
        """
        data = {
            "text": text,
            "voice_id": voice_id,
            "model_id": model_id,
            **kwargs
        }
        return self._make_request("POST", "/tts/jobs/", data=data)
    
    def get_job_status(self, job_id: str) -> Dict[str, Any]:
        """
        Get status of a TTS job.
        
        Args:
            job_id: UUID of the job
            
        Returns:
            Job status and details
        """
        return self._make_request("GET", f"/tts/jobs/{job_id}/status/")
    
    def get_job_details(self, job_id: str) -> Dict[str, Any]:
        """
        Get full details of a TTS job.
        
        Args:
            job_id: UUID of the job
            
        Returns:
            Complete job information
        """
        return self._make_request("GET", f"/tts/jobs/{job_id}/")
    
    def list_jobs(self, limit: int = 10, offset: int = 0) -> Dict[str, Any]:
        """
        List TTS jobs for the current user.
        
        Args:
            limit: Number of jobs to return
            offset: Pagination offset
            
        Returns:
            List of jobs with pagination info
        """
        params = {"limit": limit, "offset": offset}
        return self._make_request("GET", "/tts/jobs/list/", params=params)
    
    def cancel_job(self, job_id: str) -> Dict[str, Any]:
        """
        Cancel a pending or processing TTS job.
        
        Args:
            job_id: UUID of the job to cancel
            
        Returns:
            Cancellation status
        """
        return self._make_request("POST", f"/tts/jobs/{job_id}/cancel/")
    
    # ============== Express TTS ==============
    
    def express_tts(self, text: str, voice_id: str = "qW6MAd7f5iuYw7bAH96wC") -> bytes:
        """
        Use express TTS for immediate audio generation (shorter texts).
        
        Args:
            text: Text to convert (max 500 characters recommended)
            voice_id: Voice to use
            
        Returns:
            Audio data as bytes
        """
        data = {
            "text": text,
            "voice_id": voice_id
        }
        
        response = self.session.post(
            f"{self.base_url}/tts/express/",
            json=data,
            timeout=30
        )
        response.raise_for_status()
        return response.content


def main():
    """Example usage of the CreoleCentric API client"""
    
    # Load API key from environment variable or .env file
    API_KEY = os.getenv("CREOLECENTRIC_API_KEY")
    
    if not API_KEY:
        print("Error: CREOLECENTRIC_API_KEY environment variable not set")
        print("Please set it with your API key: export CREOLECENTRIC_API_KEY='cc_your_key_here'")
        return
    
    # Initialize client
    client = CreoleCentricAPI(API_KEY)
    
    try:
        # 1. Check API health
        print("=" * 50)
        print("1. Checking API Health")
        print("=" * 50)
        health = client.check_health()
        print(f"API Status: {health.get('status')}")
        print(f"Version: {health.get('version')}")
        print()
        
        # 2. Get credit balance
        print("=" * 50)
        print("2. Credit Balance")
        print("=" * 50)
        balance = client.get_credit_balance()
        print(f"Total Credits: {balance.get('total_credits', 0):,}")
        print(f"Subscription Credits: {balance.get('subscription_credits', 0):,}")
        print(f"Purchased Credits: {balance.get('purchased_credits', 0):,}")
        print()
        
        # 3. Get available voices
        print("=" * 50)
        print("3. Available Voices")
        print("=" * 50)
        voices_response = client.get_voices()
        voices = voices_response.get('voices', [])
        print(f"Found {voices_response.get('count', len(voices))} voices (source: {voices_response.get('source', 'unknown')}):")
        for voice in voices[:5]:  # Show first 5
            print(f"  - {voice.get('name')} (ID: {voice.get('voice_id')})")
            print(f"    Region: {voice.get('region')}, Gender: {voice.get('gender')}")
        print()
        
        # 4. Get available models
        print("=" * 50)
        print("4. Available Models")
        print("=" * 50)
        models_response = client.get_models()
        models = models_response.get('models', [])
        print(f"Found {models_response.get('count', len(models))} models:")
        for model in models:
            print(f"  - {model.get('display_name') or model.get('name')} (ID: {model.get('id')})")
            print(f"    Description: {model.get('description')}")
        print()
        
        # 5. Create a TTS job
        print("=" * 50)
        print("5. Creating TTS Job")
        print("=" * 50)
        
        text = "Bonjou! Mwen se yon egzanp API pou CreoleCentric. Mwen ka pale Kreyòl ayisyen."
        print(f"Text: {text}")
        
        # Use Xavier Bruneau voice and default Haitian Creole model
        # To find voice IDs: Go to Voice Library page, click "More" (...) on any voice card
        # To find model IDs: In TTS interface, go to Speech Options tab, click Model field

        # Use a real voice ID - don't rely on voices list which may contain placeholders
        voice_id = "i4mRPwKM2yHwXhbmkN514"  # Xavier Bruneau
        model_id = "ccl_ht_v100"  # Default Haitian Creole model

        # If you want to use a voice from the list, make sure it's not a placeholder
        if voices and voices[0].get("voice_id") not in ["voice_1", "voice_2"]:
            voice_id = voices[0]["voice_id"]
        if models:
            model_id = models[0]["id"]
        
        # To use webhooks, add webhook_url parameter:
        job = client.create_tts_job(
            text=text,
            voice_id=voice_id,
            model_id=model_id,
            webhook_url="https://your-app.com/webhooks/tts"  # Your webhook endpoint
        )

        job_id = job.get("id")
        print(f"Job created successfully!")
        print(f"Job ID: {job_id}")
        print(f"Status: {job.get('status')}")
        print(f"Credits used: {job.get('credits_used', 0)}")
        print()
        print("📢 Webhook notifications will be sent to your endpoint:")
        print("   - tts_queued → tts_started → tts_synthesized → tts_uploaded → tts_delivered")
        print(f"   See examples/webhook_server.py for webhook handling example")
        print()

        # 6. List recent jobs
        print("=" * 50)
        print("6. Recent Jobs")
        print("=" * 50)
        
        jobs = client.list_jobs(limit=5)
        print(f"Recent {len(jobs.get('results', []))} jobs:")
        
        for job in jobs.get("results", []):
            created = job.get("created_at", "")
            job_id = job.get('id')
            job_id_display = job_id[:8] + "..." if job_id else "N/A"
            print(f"  - Job {job_id_display}")
            print(f"    Created: {created}")
            print(f"    Status: {job.get('status')}")
            text_preview = job.get('text', '')
            if text_preview:
                print(f"    Text: {text_preview[:50]}{'...' if len(text_preview) > 50 else ''}")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()