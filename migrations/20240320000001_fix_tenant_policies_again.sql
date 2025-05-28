-- Drop all existing tenant_users policies
DROP POLICY IF EXISTS "tenant_users_self_access" ON public.tenant_users;
DROP POLICY IF EXISTS "tenant_users_insert" ON public.tenant_users;
DROP POLICY IF EXISTS "tenant_users_update" ON public.tenant_users;
DROP POLICY IF EXISTS "tenant_users_delete" ON public.tenant_users;

-- Create a simplified select policy
CREATE POLICY "tenant_users_select"
ON public.tenant_users
FOR SELECT
USING (
  -- Users can see their own records
  user_id = auth.uid()
  OR
  -- Platform admins can see all records
  EXISTS (
    SELECT 1
    FROM public.user_profiles up
    WHERE up.user_id = auth.uid()
    AND up.is_platform_admin = true
  )
  OR
  -- Client admins can see members of their tenants
  EXISTS (
    SELECT 1
    FROM public.tenant_users tu
    WHERE tu.user_id = auth.uid()
    AND tu.tenant_id = tenant_users.tenant_id
    AND tu.role = 'client_admin'
  )
);

-- Create insert policy for client admins and platform admins
CREATE POLICY "tenant_users_insert"
ON public.tenant_users
FOR INSERT
WITH CHECK (
  -- Platform admins can add users to any tenant
  EXISTS (
    SELECT 1
    FROM public.user_profiles up
    WHERE up.user_id = auth.uid()
    AND up.is_platform_admin = true
  )
  OR
  -- Client admins can add users to their tenants
  EXISTS (
    SELECT 1
    FROM public.tenant_users tu
    WHERE tu.user_id = auth.uid()
    AND tu.tenant_id = tenant_users.tenant_id
    AND tu.role = 'client_admin'
  )
);

-- Create update policy
CREATE POLICY "tenant_users_update"
ON public.tenant_users
FOR UPDATE
USING (
  -- Users can update their own records
  user_id = auth.uid()
  OR
  -- Platform admins can update all records
  EXISTS (
    SELECT 1
    FROM public.user_profiles up
    WHERE up.user_id = auth.uid()
    AND up.is_platform_admin = true
  )
  OR
  -- Client admins can update users in their tenants
  EXISTS (
    SELECT 1
    FROM public.tenant_users tu
    WHERE tu.user_id = auth.uid()
    AND tu.tenant_id = tenant_users.tenant_id
    AND tu.role = 'client_admin'
  )
)
WITH CHECK (
  -- Same conditions for the new data
  user_id = auth.uid()
  OR
  EXISTS (
    SELECT 1
    FROM public.user_profiles up
    WHERE up.user_id = auth.uid()
    AND up.is_platform_admin = true
  )
  OR
  EXISTS (
    SELECT 1
    FROM public.tenant_users tu
    WHERE tu.user_id = auth.uid()
    AND tu.tenant_id = tenant_users.tenant_id
    AND tu.role = 'client_admin'
  )
);

-- Create delete policy
CREATE POLICY "tenant_users_delete"
ON public.tenant_users
FOR DELETE
USING (
  -- Users can delete their own records
  user_id = auth.uid()
  OR
  -- Platform admins can delete any record
  EXISTS (
    SELECT 1
    FROM public.user_profiles up
    WHERE up.user_id = auth.uid()
    AND up.is_platform_admin = true
  )
  OR
  -- Client admins can delete users from their tenants
  EXISTS (
    SELECT 1
    FROM public.tenant_users tu
    WHERE tu.user_id = auth.uid()
    AND tu.tenant_id = tenant_users.tenant_id
    AND tu.role = 'client_admin'
  )
); 