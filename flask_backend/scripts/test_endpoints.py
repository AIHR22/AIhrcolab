import requests
import time
from generate_token import generate_token

BASE_URL = 'http://localhost:5001'

def test_endpoints():
    # Generate a test token
    token = generate_token('test-user-123', 'admin')
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    # Test 1: No authentication
    print("\n1. Testing without authentication:")
    response = requests.get(f'{BASE_URL}/api/ml/predict')
    print(f"Response (should be 401): {response.status_code}")
    print(f"Response body: {response.json()}")
    
    # Test 2: With authentication
    print("\n2. Testing with authentication:")
    response = requests.get(f'{BASE_URL}/api/ml/predict', headers=headers)
    print(f"Response: {response.status_code}")
    print(f"Response body: {response.json()}")
    
    # Test 3: Rate limiting
    print("\n3. Testing rate limiting (sending 5 requests quickly):")
    for i in range(5):
        response = requests.get(f'{BASE_URL}/api/ml/predict', headers=headers)
        print(f"Request {i+1} status: {response.status_code}")
        time.sleep(0.1)  # Small delay between requests
    
    # Test 4: Invalid token
    print("\n4. Testing with invalid token:")
    invalid_headers = {
        'Authorization': 'Bearer invalid.token.here',
        'Content-Type': 'application/json'
    }
    response = requests.get(f'{BASE_URL}/api/ml/predict', headers=invalid_headers)
    print(f"Response (should be 401): {response.status_code}")
    print(f"Response body: {response.json()}")
    
    # Test 5: Training endpoint
    print("\n5. Testing training endpoint:")
    training_data = {
        "training_data": [
            {"date": "2023-01-01", "actual": 100000},
            {"date": "2023-02-01", "actual": 120000}
        ],
        "model_version": "1.0"
    }
    response = requests.post(f'{BASE_URL}/api/ml/train', headers=headers, json=training_data)
    print(f"Response: {response.status_code}")
    print(f"Response body: {response.json()}")

if __name__ == '__main__':
    test_endpoints() 