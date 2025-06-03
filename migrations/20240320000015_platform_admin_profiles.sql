-- Create platform admin profiles table
CREATE TABLE IF NOT EXISTS platform_admin_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    phone TEXT,
    title TEXT,
    department TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies for platform admin profiles
ALTER TABLE platform_admin_profiles ENABLE ROW LEVEL SECURITY;

-- Platform admins can read all admin profiles
CREATE POLICY "platform_admins_read_all"
ON platform_admin_profiles
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM platform_admins
        WHERE platform_admins.user_id = auth.uid()
    )
);

-- Platform admins can only update their own profile
CREATE POLICY "platform_admins_update_own"
ON platform_admin_profiles
FOR UPDATE
USING (
    auth.uid() = user_id
)
WITH CHECK (
    auth.uid() = user_id
);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_platform_admin_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER platform_admin_profiles_updated_at
    BEFORE UPDATE ON platform_admin_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_platform_admin_profiles_updated_at();

-- Add function to automatically create platform admin profile
CREATE OR REPLACE FUNCTION create_platform_admin_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO platform_admin_profiles (user_id, email, full_name)
    VALUES (
        NEW.user_id,
        (SELECT email FROM auth.users WHERE id = NEW.user_id),
        COALESCE(
            (SELECT raw_user_meta_data->>'full_name' FROM auth.users WHERE id = NEW.user_id),
            'Platform Admin'
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to create profile when platform admin is created
CREATE TRIGGER create_platform_admin_profile_trigger
    AFTER INSERT ON platform_admins
    FOR EACH ROW
    EXECUTE FUNCTION create_platform_admin_profile();

-- Create profiles for existing platform admins
INSERT INTO platform_admin_profiles (user_id, email, full_name)
SELECT 
    pa.user_id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'full_name', 'Platform Admin') as full_name
FROM platform_admins pa
LEFT JOIN platform_admin_profiles pap ON pa.user_id = pap.user_id
JOIN auth.users au ON pa.user_id = au.id
WHERE pap.id IS NULL;  -- Only insert for admins that don't have a profile yet 