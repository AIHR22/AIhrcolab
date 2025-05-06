-- Integration System Database Setup
-- Run this in the Supabase SQL Editor

-- Create integration_configs table
CREATE TABLE IF NOT EXISTS integration_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  system_type VARCHAR(100) NOT NULL,
  auth_type VARCHAR(50) NOT NULL,
  config JSONB NOT NULL,
  is_active BOOLEAN DEFAULT false,
  sync_frequency VARCHAR(50) DEFAULT 'daily',
  last_sync_at TIMESTAMP WITH TIME ZONE,
  next_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create integration_sync_logs table
CREATE TABLE IF NOT EXISTS integration_sync_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  integration_config_id UUID REFERENCES integration_configs(id) ON DELETE CASCADE,
  sync_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  records_processed INTEGER DEFAULT 0,
  records_created INTEGER DEFAULT 0,
  records_updated INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  details JSONB
);

-- Create integration_field_mappings table
CREATE TABLE IF NOT EXISTS integration_field_mappings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  integration_config_id UUID REFERENCES integration_configs(id) ON DELETE CASCADE,
  entity_type VARCHAR(50) NOT NULL,
  source_field VARCHAR(255) NOT NULL,
  target_field VARCHAR(255) NOT NULL,
  is_required BOOLEAN DEFAULT false,
  transformation_rule TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create update_updated_at_column function for triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
DROP TRIGGER IF EXISTS update_integration_configs_updated_at ON integration_configs;
CREATE TRIGGER update_integration_configs_updated_at
BEFORE UPDATE ON integration_configs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_integration_field_mappings_updated_at ON integration_field_mappings;
CREATE TRIGGER update_integration_field_mappings_updated_at
BEFORE UPDATE ON integration_field_mappings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_integration_configs_system_type ON integration_configs(system_type);
CREATE INDEX IF NOT EXISTS idx_integration_sync_logs_config_id ON integration_sync_logs(integration_config_id);
CREATE INDEX IF NOT EXISTS idx_integration_sync_logs_status ON integration_sync_logs(status);
CREATE INDEX IF NOT EXISTS idx_integration_field_mappings_config_id ON integration_field_mappings(integration_config_id);

-- Create sample integration for testing (optional - comment out if not needed)
/*
INSERT INTO integration_configs (name, system_type, auth_type, config, is_active, sync_frequency)
VALUES (
  'Demo HRIS Integration',
  'generic_rest',
  'basic',
  '{"base_url": "https://api.example.com", "username": "demo", "password": "demo", "employees_endpoint": "/employees", "departments_endpoint": "/departments"}',
  true,
  'daily'
);
*/
