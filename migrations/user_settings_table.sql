-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT TRUE,
  notification_frequency TEXT DEFAULT 'daily',
  timezone TEXT DEFAULT 'America/New_York',
  dark_mode BOOLEAN DEFAULT FALSE,
  language TEXT DEFAULT 'en',
  two_factor_auth BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_settings UNIQUE (user_id)
);

-- Add RLS policies for user_settings table
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own settings
CREATE POLICY "Users can view their own settings" 
  ON user_settings 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy for users to update their own settings
CREATE POLICY "Users can update their own settings" 
  ON user_settings 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Policy for users to insert their own settings
CREATE POLICY "Users can insert their own settings" 
  ON user_settings 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update the updated_at column
CREATE TRIGGER update_user_settings_updated_at
BEFORE UPDATE ON user_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
