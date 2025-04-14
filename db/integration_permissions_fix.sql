-- Grant permissions for the integration tables
-- Run this in the Supabase SQL Editor

-- Enable Row Level Security (RLS) on integration tables
ALTER TABLE integration_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_field_mappings ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users to access integration data
CREATE POLICY "Allow authenticated users to read integration_configs"
ON integration_configs FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to insert integration_configs"
ON integration_configs FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update integration_configs"
ON integration_configs FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete integration_configs"
ON integration_configs FOR DELETE
TO authenticated
USING (true);

-- Policies for integration_sync_logs
CREATE POLICY "Allow authenticated users to read integration_sync_logs"
ON integration_sync_logs FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to insert integration_sync_logs"
ON integration_sync_logs FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policies for integration_field_mappings
CREATE POLICY "Allow authenticated users to read integration_field_mappings"
ON integration_field_mappings FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to insert integration_field_mappings"
ON integration_field_mappings FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update integration_field_mappings"
ON integration_field_mappings FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete integration_field_mappings"
ON integration_field_mappings FOR DELETE
TO authenticated
USING (true);

-- Insert at least one test record to verify the system is working
INSERT INTO integration_configs (name, system_type, auth_type, config, is_active, sync_frequency)
VALUES (
  'Demo HRIS Integration',
  'generic_rest',
  'basic',
  '{"base_url": "https://api.example.com", "username": "demo", "password": "demo", "employees_endpoint": "/employees", "departments_endpoint": "/departments"}',
  true,
  'daily'
);
