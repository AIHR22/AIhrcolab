#!/bin/bash

# Start Flask backend in the background
echo "Starting Flask backend..."
cd flask_backend
python app.py &
FLASK_PID=$!
cd ..

# Wait a moment for Flask to start
sleep 2

# Start Next.js frontend
echo "Starting Next.js frontend..."
npm run dev

# When Next.js is terminated, also terminate Flask
echo "Shutting down Flask backend (PID: $FLASK_PID)..."
kill $FLASK_PID