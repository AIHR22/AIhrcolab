-- First drop all existing policies
DROP POLICY IF EXISTS "tenant_users_select" ON public.tenant_users;
DROP POLICY IF EXISTS "tenant_users_self_access" ON public.tenant_users;
DROP POLICY IF EXISTS "tenant_users_insert" ON public.tenant_users;
DROP POLICY IF EXISTS "tenant_users_update" ON public.tenant_users;
DROP POLICY IF EXISTS "tenant_users_delete" ON public.tenant_users;
DROP POLICY IF EXISTS "tenant_users_read_own" ON public.tenant_users;
DROP POLICY IF EXISTS "tenant_users_admin_manage" ON public.tenant_users;

-- Basic read policy - users can read their own records and platform admins can read all
CREATE POLICY "tenant_users_select"
ON public.tenant_users
FOR SELECT
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid()
    AND is_platform_admin = true
  )
);

-- Insert policy - only platform admins can insert
CREATE POLICY "tenant_users_insert"
ON public.tenant_users
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid()
    AND is_platform_admin = true
  )
);

-- Update policy - users can update their own records, platform admins can update all
CREATE POLICY "tenant_users_update"
ON public.tenant_users
FOR UPDATE
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid()
    AND is_platform_admin = true
  )
);

-- Delete policy - users can delete their own records, platform admins can delete all
CREATE POLICY "tenant_users_delete"
ON public.tenant_users
FOR DELETE
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid()
    AND is_platform_admin = true
  )
); 