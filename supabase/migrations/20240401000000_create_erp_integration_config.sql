-- Create erp_integration_config table
CREATE TABLE IF NOT EXISTS public.erp_integration_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('workday', 'sap', 'oracle', 'custom')),
  api_endpoint TEXT NOT NULL,
  auth_method TEXT NOT NULL CHECK (auth_method IN ('oauth', 'api_key', 'basic_auth')),
  credentials JSONB NOT NULL,
  sync_frequency TEXT NOT NULL CHECK (sync_frequency IN ('hourly', 'daily', 'weekly', 'manual')),
  last_sync TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'error')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_erp_integration_config_status ON public.erp_integration_config(status);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_erp_integration_config_updated_at
  BEFORE UPDATE ON public.erp_integration_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE public.erp_integration_config ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read ERP integration configurations
CREATE POLICY "Allow authenticated users to read ERP integration configurations"
  ON public.erp_integration_config
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to create ERP integration configurations
CREATE POLICY "Allow authenticated users to create ERP integration configurations"
  ON public.erp_integration_config
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update ERP integration configurations
CREATE POLICY "Allow authenticated users to update ERP integration configurations"
  ON public.erp_integration_config
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete ERP integration configurations
CREATE POLICY "Allow authenticated users to delete ERP integration configurations"
  ON public.erp_integration_config
  FOR DELETE
  TO authenticated
  USING (true); 