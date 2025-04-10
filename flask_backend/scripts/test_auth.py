import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

API_URL = "http://localhost:3000/api"
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

def test_authentication():
    """Test the authentication flow"""
    print("\nTesting Authentication Flow...")
    
    # Test 1: Sign in with valid credentials
    try:
        # Replace with test user credentials
        credentials = {
            "email": "test@example.com",
            "password": "testpassword123"
        }
        
        response = requests.post(f"{API_URL}/auth", json=credentials)
        if response.status_code == 200:
            print("✅ Sign in successful")
            auth_data = response.json()
            access_token = auth_data.get("session", {}).get("access_token")
            
            # Test 2: Access protected endpoint with valid token
            headers = {"Authorization": f"Bearer {access_token}"}
            revenue_response = requests.get(f"{API_URL}/revenue", headers=headers)
            
            if revenue_response.status_code == 200:
                print("✅ Protected endpoint access successful")
            else:
                print("❌ Protected endpoint access failed:", revenue_response.json())
        else:
            print("❌ Sign in failed:", response.json())
            
        # Test 3: Access protected endpoint with invalid token
        headers = {"Authorization": "Bearer invalid_token"}
        invalid_response = requests.get(f"{API_URL}/revenue", headers=headers)
        if invalid_response.status_code == 401:
            print("✅ Invalid token correctly rejected")
        else:
            print("❌ Invalid token test failed:", invalid_response.status_code)
            
        # Test 4: Access protected endpoint without token
        no_auth_response = requests.get(f"{API_URL}/revenue")
        if no_auth_response.status_code == 401:
            print("✅ No token correctly rejected")
        else:
            print("❌ No token test failed:", no_auth_response.status_code)
            
    except Exception as e:
        print("❌ Test failed with error:", str(e))

if __name__ == "__main__":
    test_authentication() 