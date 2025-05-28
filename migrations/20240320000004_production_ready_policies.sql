-- Drop existing policies
DROP POLICY IF EXISTS "tenant_users_select" ON public.tenant_users;
DROP POLICY IF EXISTS "tenant_users_insert" ON public.tenant_users;
DROP POLICY IF EXISTS "tenant_users_update" ON public.tenant_users;
DROP POLICY IF EXISTS "tenant_users_delete" ON public.tenant_users;

-- Enable RLS
ALTER TABLE public.tenant_users ENABLE ROW LEVEL SECURITY;

-- Policy for reading tenant_users
-- Users can:
-- 1. Read their own records
-- 2. Read records in tenants where they are client_admin
-- 3. Platform admins can read all
CREATE POLICY "tenant_users_select"
ON public.tenant_users
FOR SELECT
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM tenant_users tu
    WHERE tu.user_id = auth.uid()
    AND tu.tenant_id = tenant_users.tenant_id
    AND tu.role = 'client_admin'
  )
  OR EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.user_id = auth.uid()
    AND up.is_platform_admin = true
  )
);

-- Policy for inserting tenant_users
-- Only allow:
-- 1. Platform admins to create any tenant user
-- 2. Client admins to create users in their tenants
CREATE POLICY "tenant_users_insert"
ON public.tenant_users
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.user_id = auth.uid()
    AND up.is_platform_admin = true
  )
  OR (
    EXISTS (
      SELECT 1 FROM tenant_users tu
      WHERE tu.user_id = auth.uid()
      AND tu.tenant_id = tenant_users.tenant_id
      AND tu.role = 'client_admin'
    )
    -- Prevent client admins from creating other client admins
    AND NEW.role != 'client_admin'
  )
);

-- Policy for updating tenant_users
-- Only allow:
-- 1. Users to update their own non-role fields
-- 2. Client admins to update users in their tenants (except other client admins)
-- 3. Platform admins to update any record
CREATE POLICY "tenant_users_update"
ON public.tenant_users
FOR UPDATE
USING (
  (user_id = auth.uid() AND OLD.role = NEW.role)
  OR (
    EXISTS (
      SELECT 1 FROM tenant_users tu
      WHERE tu.user_id = auth.uid()
      AND tu.tenant_id = tenant_users.tenant_id
      AND tu.role = 'client_admin'
    )
    AND OLD.role != 'client_admin'
    AND NEW.role != 'client_admin'
  )
  OR EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.user_id = auth.uid()
    AND up.is_platform_admin = true
  )
);

-- Policy for deleting tenant_users
-- Only allow:
-- 1. Users to remove themselves (except if they're the last client admin)
-- 2. Client admins to remove users in their tenants (except other client admins)
-- 3. Platform admins to remove any user
CREATE POLICY "tenant_users_delete"
ON public.tenant_users
FOR DELETE
USING (
  (
    user_id = auth.uid()
    AND NOT (
      role = 'client_admin'
      AND EXISTS (
        SELECT 1 FROM tenant_users tu
        WHERE tu.tenant_id = tenant_users.tenant_id
        AND tu.role = 'client_admin'
        HAVING COUNT(*) <= 1
      )
    )
  )
  OR (
    EXISTS (
      SELECT 1 FROM tenant_users tu
      WHERE tu.user_id = auth.uid()
      AND tu.tenant_id = tenant_users.tenant_id
      AND tu.role = 'client_admin'
    )
    AND tenant_users.role != 'client_admin'
  )
  OR EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.user_id = auth.uid()
    AND up.is_platform_admin = true
  )
); 