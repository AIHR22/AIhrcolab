from functools import wraps
from flask import request, jsonify, current_app
import time
from datetime import datetime, timedelta
import jwt
import os
from typing import Dict, Tuple
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Rate limiting configuration
RATE_LIMIT_WINDOW = int(os.getenv('RATE_LIMIT_WINDOW', 3600))  # 1 hour in seconds
MAX_REQUESTS_PER_WINDOW = int(os.getenv('MAX_REQUESTS_PER_WINDOW', 1000))  # Maximum requests per window
rate_limit_store: Dict[str, Tuple[int, float]] = {}  # {ip: (request_count, window_start)}

# JWT configuration
JWT_SECRET = os.getenv('JWT_SECRET', 'your-secret-key')  # Change this in production
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION = 3600  # 1 hour in seconds

def get_client_ip():
    """Get the client IP address from the request."""
    if request.headers.get('X-Forwarded-For'):
        return request.headers.get('X-Forwarded-For').split(',')[0]
    return request.remote_addr

def check_rate_limit():
    """Check if the client has exceeded the rate limit."""
    client_ip = get_client_ip()
    current_time = time.time()
    
    if client_ip in rate_limit_store:
        request_count, window_start = rate_limit_store[client_ip]
        
        # Reset window if it's expired
        if current_time - window_start > RATE_LIMIT_WINDOW:
            rate_limit_store[client_ip] = (1, current_time)
            return True
            
        # Check if limit exceeded
        if request_count >= MAX_REQUESTS_PER_WINDOW:
            return False
            
        # Increment request count
        rate_limit_store[client_ip] = (request_count + 1, window_start)
    else:
        # First request from this IP
        rate_limit_store[client_ip] = (1, current_time)
    
    return True

def verify_jwt(token):
    """Verify the JWT token."""
    try:
        jwt_secret = os.getenv('JWT_SECRET')
        if not jwt_secret:
            logger.error("JWT_SECRET not set in environment variables")
            return None
            
        payload = jwt.decode(token, jwt_secret, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        logger.warning("Token has expired")
        return None
    except jwt.InvalidTokenError as e:
        logger.warning(f"Invalid token: {str(e)}")
        return None
    except Exception as e:
        logger.error(f"Unexpected error verifying token: {str(e)}")
        return None

def require_auth(f):
    """Decorator to require authentication."""
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            logger.warning(f"Missing Authorization header from {get_client_ip()}")
            return jsonify({'error': 'Missing Authorization header'}), 401
        
        try:
            token_type, token = auth_header.split(' ')
            if token_type.lower() != 'bearer':
                logger.warning(f"Invalid token type from {get_client_ip()}")
                return jsonify({'error': 'Invalid token type'}), 401
                
            payload = verify_jwt(token)
            
            if not payload:
                logger.warning(f"Invalid token from {get_client_ip()}")
                return jsonify({'error': 'Invalid or expired token'}), 401
            
            # Add user info to request context
            request.user = payload
            return f(*args, **kwargs)
            
        except ValueError:
            logger.warning(f"Malformed Authorization header from {get_client_ip()}")
            return jsonify({'error': 'Malformed Authorization header'}), 401
        except Exception as e:
            logger.error(f"Authentication error: {str(e)}")
            return jsonify({'error': 'Authentication failed'}), 401
    
    return decorated

def rate_limit(f):
    """Decorator to implement rate limiting."""
    @wraps(f)
    def decorated(*args, **kwargs):
        if not check_rate_limit():
            logger.warning(f"Rate limit exceeded for {get_client_ip()}")
            return jsonify({
                'error': 'Rate limit exceeded',
                'retry_after': RATE_LIMIT_WINDOW
            }), 429
        return f(*args, **kwargs)
    return decorated

def security_headers(f):
    """Decorator to add security headers to response."""
    @wraps(f)
    def decorated(*args, **kwargs):
        response = f(*args, **kwargs)
        
        # Handle both response types (tuple and response object)
        if isinstance(response, tuple):
            response_obj = response[0]
        else:
            response_obj = response
            
        # Add security headers
        headers = {
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block',
            'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
            'Content-Security-Policy': "default-src 'self'",
            'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
        }
        
        for key, value in headers.items():
            response_obj.headers[key] = value
            
        return response
    return decorated

def sanitize_input(data):
    """Sanitize input data to prevent injection attacks."""
    if isinstance(data, str):
        # Remove potentially dangerous characters
        return ''.join(c for c in data if c.isprintable())
    elif isinstance(data, dict):
        return {k: sanitize_input(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [sanitize_input(item) for item in data]
    return data 