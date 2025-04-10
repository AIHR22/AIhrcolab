import pytest
from unittest.mock import patch, MagicMock
from app import DataService

@patch('app.requests.get')
def test_fetch_revenue_data(mock_get):
    """Test fetching revenue data from Supabase."""
    # Mock the response
    mock_response = MagicMock()
    mock_response.json.return_value = [
        {"month": "2024-01", "revenue": 1000},
        {"month": "2024-02", "revenue": 1200}
    ]
    mock_get.return_value = mock_response
    
    # Test the fetch
    data = DataService.fetch_revenue_data()
    assert len(data) == 2
    assert data[0]["revenue"] == 1000
    assert data[1]["month"] == "2024-02"

@patch('app.requests.post')
def test_store_prediction(mock_post):
    """Test storing prediction data in Supabase."""
    # Mock the response
    mock_response = MagicMock()
    mock_response.json.return_value = {"id": 1, "created_at": "2024-04-08"}
    mock_post.return_value = mock_response
    
    # Test data to store
    prediction_data = {
        "model_type": "prophet",
        "predictions": [100, 200, 300],
        "timestamp": "2024-04-08"
    }
    
    # Test the storage
    result = DataService.store_prediction(prediction_data)
    assert result["id"] == 1
    assert "created_at" in result 