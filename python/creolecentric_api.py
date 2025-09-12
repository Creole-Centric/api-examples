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
    
    def __init__(self, api_key: str, base_url: str = "https://creolecentric.com/api/v1"):
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
    
    def get_voices(self) -> List[Dict[str, Any]]:
        """Get list of available voices"""
        return self._make_request("GET", "/tts/voices/")
    
    def get_models(self) -> List[Dict[str, Any]]:
        """Get list of available TTS models"""
        return self._make_request("GET", "/tts/models/")
    
    def get_voice_settings(self) -> Dict[str, Any]:
        """Get voice settings configuration"""
        return self._make_request("GET", "/tts/voice-settings/")
    
    # ============== TTS Jobs ==============
    
    def create_tts_job(self, text: str, voice_id: str = "voice_1", 
                      model_id: str = "model_1", **kwargs) -> Dict[str, Any]:
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
    
    def wait_for_job(self, job_id: str, timeout: int = 300, 
                    poll_interval: int = 2) -> Dict[str, Any]:
        """
        Wait for a job to complete.
        
        Args:
            job_id: UUID of the job
            timeout: Maximum time to wait in seconds
            poll_interval: Time between status checks
            
        Returns:
            Final job status
            
        Raises:
            TimeoutError: If job doesn't complete within timeout
        """
        start_time = time.time()
        
        while time.time() - start_time < timeout:
            status = self.get_job_status(job_id)
            
            if status.get("status") in ["completed", "failed", "cancelled"]:
                return status
            
            print(f"Job {job_id} status: {status.get('status', 'unknown')}")
            time.sleep(poll_interval)
        
        raise TimeoutError(f"Job {job_id} did not complete within {timeout} seconds")
    
    # ============== Express TTS ==============
    
    def express_tts(self, text: str, voice_id: str = "voice_1") -> bytes:
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
        voices = client.get_voices()
        print(f"Found {len(voices)} voices:")
        for voice in voices[:5]:  # Show first 5
            print(f"  - {voice.get('name')} (ID: {voice.get('voice_id')})")
            print(f"    Language: {voice.get('language')}, Gender: {voice.get('gender')}")
        print()
        
        # 4. Get available models
        print("=" * 50)
        print("4. Available Models")
        print("=" * 50)
        models = client.get_models()
        print(f"Found {len(models)} models:")
        for model in models:
            print(f"  - {model.get('name')} (ID: {model.get('model_id')})")
            print(f"    Description: {model.get('description')}")
        print()
        
        # 5. Create a TTS job
        print("=" * 50)
        print("5. Creating TTS Job")
        print("=" * 50)
        
        text = "Bonjou! Mwen se yon egzanp API pou CreoleCentric. Mwen ka pale Kreyòl ayisyen."
        print(f"Text: {text}")
        
        # Use first available voice
        voice_id = voices[0]["voice_id"] if voices else "voice_1"
        model_id = models[0]["model_id"] if models else "model_1"
        
        job = client.create_tts_job(
            text=text,
            voice_id=voice_id,
            model_id=model_id
        )
        
        job_id = job.get("job_id")
        print(f"Job created successfully!")
        print(f"Job ID: {job_id}")
        print(f"Status: {job.get('status')}")
        print(f"Credits used: {job.get('credits_used', 0)}")
        print()
        
        # 6. Wait for job completion
        print("=" * 50)
        print("6. Waiting for Job Completion")
        print("=" * 50)
        
        if job_id:
            try:
                final_status = client.wait_for_job(job_id, timeout=60)
                print(f"Job completed!")
                print(f"Final status: {final_status.get('status')}")
                
                if final_status.get('audio_url'):
                    print(f"Audio URL: {final_status.get('audio_url')}")
                
                if final_status.get('duration_seconds'):
                    print(f"Duration: {final_status.get('duration_seconds')} seconds")
                    
            except TimeoutError as e:
                print(f"Job timed out: {e}")
        print()
        
        # 7. List recent jobs
        print("=" * 50)
        print("7. Recent Jobs")
        print("=" * 50)
        
        jobs = client.list_jobs(limit=5)
        print(f"Recent {len(jobs.get('results', []))} jobs:")
        
        for job in jobs.get("results", []):
            created = job.get("created_at", "")
            print(f"  - Job {job.get('job_id')[:8]}...")
            print(f"    Created: {created}")
            print(f"    Status: {job.get('status')}")
            print(f"    Text: {job.get('text', '')[:50]}...")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()