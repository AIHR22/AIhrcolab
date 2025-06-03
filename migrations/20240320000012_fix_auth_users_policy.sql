-- First, drop the overly restrictive policy
DROP POLICY IF EXISTS "platform_admin_user_access" ON auth.users;
DROP POLICY IF EXISTS "auth_users_policy" ON auth.users;

-- Create a new policy that allows authentication
CREATE POLICY "auth_users_policy"
ON auth.users
FOR ALL
USING (
  -- During auth, there is no auth.uid()
  auth.uid() IS NULL 
  OR
  -- Users can see their own record
  auth.uid() = id
  OR
  -- After auth, allow platform admins full access
  EXISTS (
    SELECT 1 FROM public.platform_admins
    WHERE platform_admins.user_id = auth.uid()
  )
);

-- Make sure RLS is still enabled
ALTER TABLE auth.users FORCE ROW LEVEL SECURITY; 