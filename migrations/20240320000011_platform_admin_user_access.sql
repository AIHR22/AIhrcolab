-- Add policy for platform admins to access auth.users
CREATE POLICY "platform_admin_user_access"
ON auth.users
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.platform_admins
    WHERE platform_admins.user_id = auth.uid()
  )
);

-- Ensure RLS is enabled on auth.users
ALTER TABLE auth.users FORCE ROW LEVEL SECURITY; 