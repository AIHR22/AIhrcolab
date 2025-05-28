-- Drop existing policies
DROP POLICY IF EXISTS "select_tenant_users" ON public.tenant_users;
DROP POLICY IF EXISTS "insert_tenant_users" ON public.tenant_users;
DROP POLICY IF EXISTS "update_tenant_users" ON public.tenant_users;
DROP POLICY IF EXISTS "delete_tenant_users" ON public.tenant_users;

-- Create new simplified policies that avoid recursion
CREATE POLICY "tenant_users_self_access"
ON public.tenant_users
FOR SELECT
USING (
  -- Users can see their own tenant memberships
  user_id = auth.uid()
  OR
  -- Platform admins can see all
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

-- Policy for inserting new tenant users
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

-- Policy for updating tenant users
CREATE POLICY "tenant_users_update"
ON public.tenant_users
FOR UPDATE
USING (
  -- Platform admins can update any tenant user
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

-- Policy for deleting tenant users
CREATE POLICY "tenant_users_delete"
ON public.tenant_users
FOR DELETE
USING (
  -- Platform admins can delete any tenant user
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