-- Create organization_charts table
CREATE TABLE IF NOT EXISTS organization_charts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  structure JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  is_active BOOLEAN DEFAULT true
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_organization_charts_active ON organization_charts(is_active);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_organization_charts_updated_at
  BEFORE UPDATE ON organization_charts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE organization_charts ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read active organization charts
CREATE POLICY "Allow authenticated users to read active organization charts"
  ON organization_charts
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Allow authenticated users to create organization charts
CREATE POLICY "Allow authenticated users to create organization charts"
  ON organization_charts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update their organization charts
CREATE POLICY "Allow authenticated users to update their organization charts"
  ON organization_charts
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete their organization charts
CREATE POLICY "Allow authenticated users to delete their organization charts"
  ON organization_charts
  FOR DELETE
  TO authenticated
  USING (true); 