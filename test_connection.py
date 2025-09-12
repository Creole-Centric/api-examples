#!/usr/bin/env python3
"""
Simple test script to verify API connection and authentication.
Run this first to ensure your API key is working correctly.
"""

import os
import sys
import json
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_api_connection():
    """Test API connection and authentication"""
    
    # Get API key
    api_key = os.getenv("CREOLECENTRIC_API_KEY")
    base_url = os.getenv("CREOLECENTRIC_API_URL", "https://creolecentric.com/api/v1")
    
    if not api_key:
        print("❌ Error: CREOLECENTRIC_API_KEY not set")
        print("\nPlease set your API key:")
        print("  export CREOLECENTRIC_API_KEY='cc_your_key_here'")
        print("\nOr create a .env file with:")
        print("  CREOLECENTRIC_API_KEY=cc_your_key_here")
        return False
    
    print(f"🔑 Using API Key: {api_key[:10]}...")
    print(f"🌐 API URL: {base_url}")
    print("-" * 50)
    
    # Test headers
    headers = {
        "Authorization": f"ApiKey {api_key}",
        "Content-Type": "application/json"
    }
    
    # 1. Test health endpoint (no auth required)
    print("\n1. Testing health endpoint...")
    try:
        response = requests.get(f"{base_url}/health/", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ API is {data.get('status', 'unknown')}")
            print(f"   Version: {data.get('version', 'unknown')}")
        else:
            print(f"   ❌ Health check failed: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Connection error: {e}")
        return False
    
    # 2. Test authentication
    print("\n2. Testing authentication...")
    try:
        response = requests.get(
            f"{base_url}/credits/balance/",
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Authentication successful!")
            print(f"   Credits available: {data.get('total_credits', 0):,}")
            print(f"   Subscription plan: {data.get('subscription_plan', 'unknown')}")
        elif response.status_code == 401:
            print(f"   ❌ Authentication failed: Invalid API key")
            print(f"   Response: {response.text}")
            return False
        else:
            print(f"   ❌ Unexpected response: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Request error: {e}")
        return False
    
    # 3. Test getting voices
    print("\n3. Testing voice endpoint...")
    try:
        response = requests.get(
            f"{base_url}/tts/voices/",
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            voices = response.json()
            print(f"   ✅ Found {len(voices)} voices")
            if voices:
                print(f"   First voice: {voices[0].get('name', 'unknown')}")
        else:
            print(f"   ⚠️  Could not fetch voices: {response.status_code}")
            
    except Exception as e:
        print(f"   ⚠️  Voice endpoint error: {e}")
    
    # 4. Test getting models
    print("\n4. Testing models endpoint...")
    try:
        response = requests.get(
            f"{base_url}/tts/models/",
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            models = response.json()
            print(f"   ✅ Found {len(models)} models")
            if models:
                print(f"   First model: {models[0].get('name', 'unknown')}")
        else:
            print(f"   ⚠️  Could not fetch models: {response.status_code}")
            
    except Exception as e:
        print(f"   ⚠️  Models endpoint error: {e}")
    
    print("\n" + "=" * 50)
    print("✅ API connection test completed successfully!")
    print("=" * 50)
    print("\nYou can now run the full examples:")
    print("  Python:  python python/creolecentric_api.py")
    print("  Node.js: node nodejs/creolecentric-api.js")
    
    return True


if __name__ == "__main__":
    success = test_api_connection()
    sys.exit(0 if success else 1)