-- Remove is_platform_admin column from user_profiles
ALTER TABLE user_profiles DROP COLUMN IF EXISTS is_platform_admin;

-- Drop any remaining policies that might reference is_platform_admin
DROP POLICY IF EXISTS "platform_admin_access" ON public.user_profiles;
DROP POLICY IF EXISTS "platform_admin_select" ON public.user_profiles;

-- Update user_profiles policies to be simpler
DROP POLICY IF EXISTS "user_profiles_select" ON public.user_profiles;
CREATE POLICY "user_profiles_select"
ON public.user_profiles
FOR SELECT
USING (
    -- Users can see their own profile
    auth.uid() = user_id
    OR
    -- Platform admins can see all profiles
    EXISTS (
        SELECT 1 FROM platform_admins
        WHERE user_id = auth.uid()
    )
);

-- Add policy for updating profiles
DROP POLICY IF EXISTS "user_profiles_update" ON public.user_profiles;
CREATE POLICY "user_profiles_update"
ON public.user_profiles
FOR UPDATE
USING (
    -- Users can update their own profile
    auth.uid() = user_id
    OR
    -- Platform admins can update any profile
    EXISTS (
        SELECT 1 FROM platform_admins
        WHERE user_id = auth.uid()
    )
); 