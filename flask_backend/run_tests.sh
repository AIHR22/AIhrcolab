#!/bin/bash

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Install test dependencies if needed
pip install -r requirements.txt

# Run pytest with verbose output and coverage report
python -m pytest tests/ -v --cov=app --cov-report=term-missing 