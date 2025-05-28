-- Drop existing policies that might interfere with login
DROP POLICY IF EXISTS "tenant_users_select" ON public.tenant_users;
DROP POLICY IF EXISTS "tenant_users_self_access" ON public.tenant_users;
DROP POLICY IF EXISTS "tenant_users_read_own" ON public.tenant_users;
DROP POLICY IF EXISTS "tenant_users_admin_manage" ON public.tenant_users;

-- Create a simplified select policy for login flow
CREATE POLICY "tenant_users_basic_access"
ON public.tenant_users
FOR SELECT
USING (
  -- Users can ALWAYS see their own records for login
  user_id = auth.uid()
);

-- Create a simplified select policy for user profiles
DROP POLICY IF EXISTS "Users can read their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Platform admins can read all profiles" ON public.user_profiles;

CREATE POLICY "user_profiles_basic_access"
ON public.user_profiles
FOR SELECT
USING (
  -- Users can ALWAYS see their own profile for login
  user_id = auth.uid()
);

-- Ensure RLS is enabled
ALTER TABLE public.tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY; 