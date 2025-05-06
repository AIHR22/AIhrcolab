-- Create the function to set up admin policies
CREATE OR REPLACE FUNCTION setup_admin_policies(admin_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Ensure the user_profiles table exists
  CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL,
    email TEXT NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- Create policy to allow admin to read all profiles
  CREATE POLICY admin_read_all_profiles ON user_profiles
    FOR SELECT TO authenticated
    USING (auth.uid() = admin_id OR role = 'admin');

  -- Create policy to allow admin to update all profiles
  CREATE POLICY admin_update_all_profiles ON user_profiles
    FOR UPDATE TO authenticated
    USING (auth.uid() = admin_id OR role = 'admin');

  -- Create policy to allow admin to insert profiles
  CREATE POLICY admin_insert_profiles ON user_profiles
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = admin_id OR role = 'admin');

  -- Create policy to allow admin to delete profiles
  CREATE POLICY admin_delete_profiles ON user_profiles
    FOR DELETE TO authenticated
    USING (auth.uid() = admin_id OR role = 'admin');

  -- Enable RLS on the user_profiles table
  ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
END;
$$;

