-- First, create a temporary table to store unique user profiles
CREATE TEMP TABLE temp_user_profiles AS
SELECT DISTINCT ON (user_id)
    id,
    user_id,
    email,
    name,
    role,
    is_platform_admin,
    created_at,
    updated_at
FROM user_profiles
ORDER BY user_id, updated_at DESC;

-- Drop the existing table and its dependencies
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Recreate the table with proper constraints
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT,
    role TEXT NOT NULL DEFAULT 'sub_user' CHECK (role IN ('platform_admin', 'client_admin', 'sub_user')),
    is_platform_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on email
CREATE UNIQUE INDEX idx_user_profiles_email_lower ON user_profiles (LOWER(email));

-- Restore the data from temp table
INSERT INTO user_profiles (id, user_id, email, name, role, is_platform_admin, created_at, updated_at)
SELECT id, user_id, email, name, 
       CASE 
           WHEN role NOT IN ('platform_admin', 'client_admin', 'sub_user') THEN 'sub_user'
           ELSE role 
       END,
       is_platform_admin,
       created_at,
       updated_at
FROM temp_user_profiles;

-- Drop the temporary table
DROP TABLE temp_user_profiles;

-- Recreate the RLS policies
DROP POLICY IF EXISTS "user_profiles_basic_access" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can read their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Platform admins can read all profiles" ON public.user_profiles;

-- Create simplified policies
CREATE POLICY "user_profiles_select"
ON public.user_profiles
FOR SELECT
USING (
    -- Users can see their own profile
    auth.uid() = user_id
    OR
    -- Platform admins can see all profiles
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE user_id = auth.uid()
        AND is_platform_admin = true
    )
);

CREATE POLICY "user_profiles_update"
ON public.user_profiles
FOR UPDATE
USING (
    -- Users can update their own profile
    auth.uid() = user_id
    OR
    -- Platform admins can update all profiles
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE user_id = auth.uid()
        AND is_platform_admin = true
    )
);

-- Ensure RLS is enabled
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY; 