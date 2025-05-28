-- Drop existing policies
DROP POLICY IF EXISTS "user_profiles_select" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_update" ON public.user_profiles;

-- Create non-recursive policies
CREATE POLICY "user_profiles_select"
ON public.user_profiles
FOR SELECT
USING (
    -- Users can only see their own profile during login
    auth.uid() = user_id
);

-- After login, platform admins get additional access through the tenant-aware client
CREATE POLICY "user_profiles_update"
ON public.user_profiles
FOR UPDATE
USING (
    -- Users can only update their own profile
    auth.uid() = user_id
);

-- Create policy for platform admin access that will be used after initial login
CREATE POLICY "platform_admin_access"
ON public.user_profiles
FOR ALL
USING (
    -- Check if the user's profile has is_platform_admin = true
    (SELECT is_platform_admin FROM public.user_profiles WHERE user_id = auth.uid())
);

-- Ensure RLS is enabled
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY; 