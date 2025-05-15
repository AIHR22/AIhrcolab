-- ERP Integration Tables

-- Table to store integration configurations
CREATE TABLE IF NOT EXISTS integration_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  system_type VARCHAR(100) NOT NULL, -- 'sap', 'oracle', 'workday', 'custom', etc.
  auth_type VARCHAR(50) NOT NULL, -- 'oauth2', 'basic', 'api_key', etc.
  config JSONB NOT NULL, -- Store connection details, endpoints, credentials (encrypted)
  is_active BOOLEAN DEFAULT false,
  sync_frequency VARCHAR(50) DEFAULT 'daily', -- 'hourly', 'daily', 'weekly', 'manual'
  last_sync_at TIMESTAMP WITH TIME ZONE,
  next_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table to store sync history/logs
CREATE TABLE IF NOT EXISTS integration_sync_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  integration_config_id UUID REFERENCES integration_configs(id) ON DELETE CASCADE,
  sync_type VARCHAR(50) NOT NULL, -- 'employees', 'departments', 'full', etc.
  status VARCHAR(50) NOT NULL, -- 'success', 'failed', 'partial'
  records_processed INTEGER DEFAULT 0,
  records_created INTEGER DEFAULT 0,
  records_updated INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  details JSONB
);

-- Table to store field mappings
CREATE TABLE IF NOT EXISTS integration_field_mappings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  integration_config_id UUID REFERENCES integration_configs(id) ON DELETE CASCADE,
  entity_type VARCHAR(50) NOT NULL, -- 'employee', 'department', etc.
  source_field VARCHAR(255) NOT NULL, -- Field name in the external system
  target_field VARCHAR(255) NOT NULL, -- Field name in our system
  is_required BOOLEAN DEFAULT false,
  transformation_rule TEXT, -- Optional transformation logic (e.g., JS snippet)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_integration_configs_system_type ON integration_configs(system_type);
CREATE INDEX IF NOT EXISTS idx_integration_sync_logs_config_id ON integration_sync_logs(integration_config_id);
CREATE INDEX IF NOT EXISTS idx_integration_sync_logs_status ON integration_sync_logs(status);
CREATE INDEX IF NOT EXISTS idx_integration_field_mappings_config_id ON integration_field_mappings(integration_config_id);

-- Create trigger for updated_at
CREATE TRIGGER update_integration_configs_updated_at
BEFORE UPDATE ON integration_configs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integration_field_mappings_updated_at
BEFORE UPDATE ON integration_field_mappings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
