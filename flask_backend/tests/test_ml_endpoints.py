import json
import pytest
from unittest.mock import patch
import os

def test_predict_endpoint_unauthorized(client):
    """Test that the predict endpoint requires authentication."""
    response = client.get('/api/ml/predict')
    assert response.status_code == 403

def test_train_endpoint_unauthorized(client):
    """Test that the train endpoint requires authentication."""
    response = client.post('/api/ml/train')
    assert response.status_code == 403

def test_predict_endpoint_authorized(client):
    """Test the predict endpoint with proper authentication."""
    headers = {
        'apikey': os.getenv('SUPABASE_SERVICE_ROLE_KEY'),
        'Authorization': f"Bearer {os.getenv('SUPABASE_SERVICE_ROLE_KEY')}"
    }
    response = client.get('/api/ml/predict', headers=headers)
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'predictions' in data
    assert 'insights' in data

def test_train_endpoint_authorized(client):
    """Test the train endpoint with proper authentication."""
    headers = {
        'apikey': os.getenv('SUPABASE_SERVICE_ROLE_KEY'),
        'Authorization': f"Bearer {os.getenv('SUPABASE_SERVICE_ROLE_KEY')}",
        'Content-Type': 'application/json'
    }
    response = client.post('/api/ml/train', headers=headers, json={})
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'success' in data

@patch('app.MLModels.build_prophet_model')
def test_predict_with_mocked_model(mock_prophet, client):
    """Test prediction with a mocked Prophet model."""
    headers = {
        'apikey': os.getenv('SUPABASE_SERVICE_ROLE_KEY'),
        'Authorization': f"Bearer {os.getenv('SUPABASE_SERVICE_ROLE_KEY')}"
    }
    
    # Mock the Prophet model's predict method
    mock_prophet.return_value.predict.return_value = {
        'predictions': [100, 200, 300],
        'insights': {'trends': ['Upward trend']}
    }
    
    response = client.get('/api/ml/predict', headers=headers)
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'predictions' in data
    assert isinstance(data['predictions'], list) 