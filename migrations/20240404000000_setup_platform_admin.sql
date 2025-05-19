-- Set up platform admin for arvindfenova@gmail.com

-- First ensure the user_profiles table exists with proper structure
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL,
    email TEXT NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    name TEXT,
    role TEXT NOT NULL CHECK (role IN ('platform_admin', 'client_admin', 'sub_user')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add unique index on lowercase email
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_profiles_email_lower ON user_profiles (LOWER(email));

-- Enable RLS on the user_profiles table if not already enabled
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Users can view their own profile"
    ON user_profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
    ON user_profiles FOR UPDATE
    USING (auth.uid() = user_id);

-- Function to update email_verified status
CREATE OR REPLACE FUNCTION public.handle_email_verification()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE user_profiles
    SET email_verified = TRUE
    WHERE user_id = NEW.id
    AND NEW.email_confirmed_at IS NOT NULL;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for email verification
CREATE TRIGGER on_auth_user_email_verified
    AFTER UPDATE OF email_confirmed_at ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_email_verification();

-- Update or insert the user profile for arvindfenova@gmail.com as platform admin
DO $$ 
BEGIN
    -- Get the user_id from auth.users table for the email
    WITH user_data AS (
        SELECT id as auth_user_id 
        FROM auth.users 
        WHERE email = 'arvindfenova@gmail.com'
    )
    INSERT INTO user_profiles (user_id, email, role)
    SELECT 
        auth_user_id,
        'arvindfenova@gmail.com',
        'platform_admin'
    FROM user_data
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        role = 'platform_admin',
        updated_at = NOW();

    -- Ensure proper RLS policies are in place
    DROP POLICY IF EXISTS platform_admin_access ON user_profiles;
    CREATE POLICY platform_admin_access ON user_profiles
        TO authenticated
        USING (auth.uid() = user_id OR 
              EXISTS (SELECT 1 FROM user_profiles 
                     WHERE user_id = auth.uid() AND role = 'platform_admin'));

END $$;