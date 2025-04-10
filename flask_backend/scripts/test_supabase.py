import sys
import os
import json
from datetime import datetime, timedelta
import requests
from dotenv import load_dotenv
import secrets
import string

# Add the parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Load environment variables
load_dotenv()

def generate_secure_password(length=16):
    """Generate a secure random password"""
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    return ''.join(secrets.choice(alphabet) for _ in range(length))

def generate_test_email():
    """Generate a random test email"""
    random_suffix = ''.join(secrets.choice(string.ascii_lowercase + string.digits) for _ in range(10))
    return f"test_{random_suffix}@example.com"

def test_supabase_connection():
    """Test basic Supabase connectivity and operations"""
    
    supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if not supabase_url or not supabase_key:
        print("❌ Error: Supabase credentials not found in environment variables")
        return False
        
    headers = {
        "apikey": supabase_key,
        "Authorization": f"Bearer {supabase_key}",
        "Content-Type": "application/json"
    }
    
    try:
        # Test 1: Fetch revenue forecasts
        print("\n1. Testing revenue_forecasts table access:")
        response = requests.get(
            f"{supabase_url}/rest/v1/revenue_forecasts?select=*&limit=1",
            headers=headers
        )
        response.raise_for_status()
        print("✅ Successfully verified revenue_forecasts table access")
        
        # Test 2: Fetch ML predictions
        print("\n2. Testing ml_predictions table access:")
        response = requests.get(
            f"{supabase_url}/rest/v1/ml_predictions?select=*&limit=1",
            headers=headers
        )
        response.raise_for_status()
        print("✅ Successfully verified ml_predictions table access")
        
        # Test 3: Try to insert a test prediction
        print("\n3. Testing prediction insertion:")
        test_id = secrets.token_hex(8)
        future_date = (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d")
        
        test_prediction = {
            "date": datetime.now().isoformat(),
            "model_version": f"test-{test_id}",
            "confidence_score": 0.5,  # Neutral test value
            "prophet_forecast": [
                {
                    "date": future_date,
                    "value": 100.0,  # Minimal test value
                    "lower_bound": 90.0,
                    "upper_bound": 110.0
                }
            ],
            "simple_forecast": [
                {
                    "date": future_date,
                    "value": 100.0  # Minimal test value
                }
            ],
            "llama_insights": {
                "trends": ["Test trend"],
                "forecast": {
                    "reasoning": "Automated test entry",
                    "next_quarter": 100.0  # Minimal test value
                },
                "confidence": {
                    "score": 0.5,  # Neutral test value
                    "risk_factors": ["Test factor"]
                },
                "growth_factors": ["Test growth factor"]
            },
            "metadata": {
                "model_types": ["test_model"],
                "features_used": ["test_feature"],
                "training_date": datetime.now().isoformat(),
                "test": True,
                "test_id": test_id,
                "description": "Automated test entry"
            }
        }
        
        response = requests.post(
            f"{supabase_url}/rest/v1/ml_predictions",
            headers=headers,
            json=test_prediction
        )
        response.raise_for_status()
        print("✅ Successfully inserted test prediction")
        
        # Test 4: Delete the test prediction
        print("\n4. Testing prediction deletion:")
        try:
            response = requests.delete(
                f"{supabase_url}/rest/v1/ml_predictions",
                headers=headers,
                params={
                    "model_version": f"eq.test-{test_id}",
                    "metadata->>test_id": f"eq.{test_id}"
                }
            )
            response.raise_for_status()
            print("✅ Successfully deleted test prediction")
        except requests.exceptions.RequestException as e:
            print(f"⚠️ Warning: Failed to delete test prediction: {str(e)}")
            print("Please manually clean up test data with test_id:", test_id)
        
        print("\n✅ All Supabase connection tests passed!")
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"\n❌ Error during Supabase connection test: {str(e)}")
        if hasattr(e, 'response') and hasattr(e.response, 'text'):
            print(f"Response: {e.response.text}")
        return False

def test_supabase_auth():
    """Test Supabase authentication endpoints"""
    
    supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    test_email = generate_test_email()
    test_password = generate_secure_password()
    
    if not supabase_url or not supabase_key:
        print("❌ Error: Supabase credentials not found in environment variables")
        return False
        
    headers = {
        "apikey": supabase_key,
        "Authorization": f"Bearer {supabase_key}",
        "Content-Type": "application/json"
    }
    
    user_id = None
    try:
        # Test 1: Create a test user
        print("\n1. Testing user creation:")
        response = requests.post(
            f"{supabase_url}/auth/v1/admin/users",
            headers=headers,
            json={
                "email": test_email,
                "password": test_password,
                "email_confirm": True
            }
        )
        response.raise_for_status()
        user_data = response.json()
        user_id = user_data.get("id")
        print("✅ Successfully created test user")
        
        # Test 2: Sign in with the test user
        print("\n2. Testing user sign in:")
        response = requests.post(
            f"{supabase_url}/auth/v1/token?grant_type=password",
            headers=headers,
            json={
                "email": test_email,
                "password": test_password
            }
        )
        response.raise_for_status()
        auth_data = response.json()
        access_token = auth_data.get("access_token")
        print("✅ Successfully signed in with test user")
        
        # Test 3: Verify the access token
        print("\n3. Testing token verification:")
        user_headers = {
            "apikey": supabase_key,
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        response = requests.get(
            f"{supabase_url}/auth/v1/user",
            headers=user_headers
        )
        response.raise_for_status()
        print("✅ Successfully verified access token")
        
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"\n❌ Error during Supabase authentication test: {str(e)}")
        if hasattr(e, 'response') and hasattr(e.response, 'text'):
            print(f"Response: {e.response.text}")
        return False
        
    finally:
        # Always attempt to clean up the test user
        if user_id:
            try:
                print("\n4. Cleaning up test user:")
                response = requests.delete(
                    f"{supabase_url}/auth/v1/admin/users/{user_id}",
                    headers=headers
                )
                response.raise_for_status()
                print("✅ Successfully deleted test user")
            except requests.exceptions.RequestException as e:
                print(f"⚠️ Warning: Failed to delete test user: {str(e)}")
                print("Please manually clean up test user with ID:", user_id)

if __name__ == "__main__":
    connection_success = test_supabase_connection()
    auth_success = test_supabase_auth()
    
    if connection_success and auth_success:
        print("\n✅ All Supabase tests completed successfully!")
    else:
        print("\n❌ Some Supabase tests failed. Check the logs above for details.")
        sys.exit(1) 