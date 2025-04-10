import jwt
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def generate_token(user_id: str, role: str = 'user') -> str:
    """Generate a JWT token for testing."""
    JWT_SECRET = os.getenv('JWT_SECRET', 'your-secret-key')
    JWT_ALGORITHM = 'HS256'
    
    payload = {
        'user_id': user_id,
        'role': role,
        'exp': datetime.utcnow() + timedelta(hours=1)
    }
    
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return token

if __name__ == '__main__':
    # Generate a test token
    test_token = generate_token('test-user-123', 'admin')
    print(f"\nTest JWT Token:\n{test_token}\n")
    
    # Print usage instructions
    print("To use this token in your requests, add it to the Authorization header:")
    print(f"Authorization: Bearer {test_token}") 