-- First drop all existing policies
DROP POLICY IF EXISTS "tenant_users_select" ON public.tenant_users;
DROP POLICY IF EXISTS "tenant_users_self_access" ON public.tenant_users;
DROP POLICY IF EXISTS "tenant_users_insert" ON public.tenant_users;
DROP POLICY IF EXISTS "tenant_users_update" ON public.tenant_users;
DROP POLICY IF EXISTS "tenant_users_delete" ON public.tenant_users;

-- Create policy for reading tenant_users during login
CREATE POLICY "tenant_users_read_own"
ON public.tenant_users
FOR SELECT
USING (
  -- Users can always read their own tenant memberships for login
  user_id = auth.uid()
);

-- Create policy for client admins to manage their tenant users
CREATE POLICY "tenant_users_admin_manage"
ON public.tenant_users
FOR ALL
USING (
  -- Client admins can manage users in their tenants
  EXISTS (
    SELECT 1
    FROM public.tenant_users tu
    WHERE tu.user_id = auth.uid()
    AND tu.tenant_id = tenant_users.tenant_id
    AND tu.role = 'client_admin'
  )
  OR
  -- Platform admins can manage all users
  EXISTS (
    SELECT 1
    FROM public.user_profiles up
    WHERE up.user_id = auth.uid()
    AND up.is_platform_admin = true
  )
)
WITH CHECK (
  -- Same conditions for insert/update
  EXISTS (
    SELECT 1
    FROM public.tenant_users tu
    WHERE tu.user_id = auth.uid()
    AND tu.tenant_id = tenant_users.tenant_id
    AND tu.role = 'client_admin'
  )
  OR
  EXISTS (
    SELECT 1
    FROM public.user_profiles up
    WHERE up.user_id = auth.uid()
    AND up.is_platform_admin = true
  )
); 