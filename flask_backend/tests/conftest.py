import os
import pytest
from app import app as flask_app
from dotenv import load_dotenv

@pytest.fixture
def app():
    """Create and configure a test Flask application instance."""
    load_dotenv()
    flask_app.config['TESTING'] = True
    return flask_app

@pytest.fixture
def client(app):
    """Create a test client for the Flask application."""
    return app.test_client()

@pytest.fixture
def runner(app):
    """Create a test CLI runner for the Flask application."""
    return app.test_cli_runner() 