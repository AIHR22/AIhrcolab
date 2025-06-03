-- Create platform_admins table if it doesn't exist
CREATE TABLE IF NOT EXISTS platform_admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on platform_admins table
ALTER TABLE platform_admins ENABLE ROW LEVEL SECURITY;

-- Allow users to see their own platform admin record
DROP POLICY IF EXISTS "select_own_platform_admin" ON platform_admins;
CREATE POLICY "select_own_platform_admin"
ON platform_admins
FOR SELECT
USING (
    user_id = auth.uid()
);

-- Migrate existing platform admins
INSERT INTO platform_admins (user_id)
SELECT user_id
FROM user_profiles
WHERE is_platform_admin = true
ON CONFLICT (user_id) DO NOTHING;

-- Drop policies that reference is_platform_admin
DROP POLICY IF EXISTS "Platform admins can read all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "platform_admin_access" ON public.user_profiles;

-- Update tenant_users policies to use new platform_admins table
DROP POLICY IF EXISTS "tenant_users_select" ON public.tenant_users;
CREATE POLICY "tenant_users_select"
ON public.tenant_users
FOR SELECT
USING (
    user_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM platform_admins
        WHERE user_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1 FROM tenant_users tu
        WHERE tu.user_id = auth.uid()
        AND tu.tenant_id = tenant_users.tenant_id
        AND tu.role = 'client_admin'
    )
);

DROP POLICY IF EXISTS "tenant_users_insert" ON public.tenant_users;
CREATE POLICY "tenant_users_insert"
ON public.tenant_users
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM platform_admins
        WHERE user_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1 FROM tenant_users tu
        WHERE tu.user_id = auth.uid()
        AND tu.tenant_id = tenant_users.tenant_id
        AND tu.role = 'client_admin'
    )
);

DROP POLICY IF EXISTS "tenant_users_update" ON public.tenant_users;
CREATE POLICY "tenant_users_update"
ON public.tenant_users
FOR UPDATE
USING (
    user_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM platform_admins
        WHERE user_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1 FROM tenant_users tu
        WHERE tu.user_id = auth.uid()
        AND tu.tenant_id = tenant_users.tenant_id
        AND tu.role = 'client_admin'
    )
);

DROP POLICY IF EXISTS "tenant_users_delete" ON public.tenant_users;
CREATE POLICY "tenant_users_delete"
ON public.tenant_users
FOR DELETE
USING (
    user_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM platform_admins
        WHERE user_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1 FROM tenant_users tu
        WHERE tu.user_id = auth.uid()
        AND tu.tenant_id = tenant_users.tenant_id
        AND tu.role = 'client_admin'
    )
);

-- Finally, drop the is_platform_admin column
ALTER TABLE user_profiles DROP COLUMN is_platform_admin; 