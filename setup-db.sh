#!/bin/bash

# Get the Supabase URL and key from .env.local
source .env.local

# Create the department_revenue table
curl -X POST "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/sql" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  -d '{
    "query": "CREATE TABLE IF NOT EXISTS department_revenue (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), project_id UUID NOT NULL, department_id UUID NOT NULL, amount DECIMAL NOT NULL, date DATE NOT NULL, forecast_data JSONB, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), UNIQUE(project_id, department_id, date))"
  }'

# Create index
curl -X POST "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/sql" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  -d '{
    "query": "CREATE INDEX IF NOT EXISTS idx_department_revenue_project_date ON department_revenue(project_id, date)"
  }'

# Enable RLS
curl -X POST "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/sql" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  -d '{
    "query": "ALTER TABLE department_revenue ENABLE ROW LEVEL SECURITY"
  }'

# Add RLS policy
curl -X POST "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/sql" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  -d '{
    "query": "CREATE POLICY \"Users can view their departments revenue\" ON department_revenue FOR SELECT USING (auth.uid() IN (SELECT user_id FROM organization_members WHERE organization_id = (SELECT organization_id FROM projects WHERE id = project_id)))"
  }'

echo "Database setup complete!" 