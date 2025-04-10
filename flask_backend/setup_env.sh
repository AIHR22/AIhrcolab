#!/bin/bash

# Create and activate a new conda environment
conda create -n revenue_forecast python=3.10 -y
conda activate revenue_forecast

# Install TensorFlow dependencies for Apple Silicon
conda install -c apple tensorflow-deps -y

# Install other conda-forge packages
conda install -c conda-forge prophet numpy pandas scikit-learn matplotlib -y

# Install pip packages
pip install -r requirements.txt

# Install additional development tools
pip install black flake8 pytest-watch

echo "Environment setup complete! To activate, run: conda activate revenue_forecast" 