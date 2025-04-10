#!/bin/bash

# Source the environment variables
if [ -f "../../../.env.local" ]; then
  source "../../../.env.local"
else
  echo "Error: .env.local file not found"
  exit 1
fi

# Create results directory if it doesn't exist
mkdir -p results

# Run Postman tests using Newman with environment variables
newman run revenue-forecast.postman_collection.json \
  --environment revenue-forecast.environment.json \
  --env-var "SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY" \
  --reporters cli,junit \
  --reporter-junit-export results/newman-report.xml 