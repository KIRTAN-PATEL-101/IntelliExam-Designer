#!/bin/bash

# IntelliExam AI Backend Setup Script

echo "Setting up IntelliExam AI Backend..."

# Create virtual environment
python -m venv ai_backend_env

# Activate virtual environment
source ai_backend_env/bin/activate

# Install requirements
pip install -r requirements.txt

# Copy environment template
cp .env.example .env

echo "Setup complete!"
echo "Please edit the .env file to add your API keys"
echo "To run the server: python main.py"
