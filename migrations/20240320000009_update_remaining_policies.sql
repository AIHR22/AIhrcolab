-- Update the get_current_tenant_id function to use platform_admins table
CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  tenant_id uuid;
  is_platform_admin boolean;
BEGIN
  -- Check if user is platform admin using new table
  SELECT EXISTS (
    SELECT 1 FROM platform_admins
    WHERE user_id = auth.uid()
  ) INTO is_platform_admin;

  IF is_platform_admin THEN
    -- Platform admins can access all tenants
    RETURN NULL;
  END IF;

  -- Get tenant ID from tenant_users table
  SELECT tenant_users.tenant_id INTO tenant_id
  FROM tenant_users
  WHERE tenant_users.user_id = auth.uid();

  RETURN tenant_id;
END;
$$;

-- Update policies on tenants table
DROP POLICY IF EXISTS "delete_tenants" ON public.tenants;
CREATE POLICY "delete_tenants"
ON public.tenants
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM platform_admins
    WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "insert_tenants" ON public.tenants;
CREATE POLICY "insert_tenants"
ON public.tenants
FOR SELECT
USING (
  -- Users can see tenants they belong to
  EXISTS (
    SELECT 1
    FROM tenant_users tu
    WHERE tu.user_id = auth.uid()
      AND tu.tenant_id = tenants.id
  )
  OR
  -- Platform admins can see all
  EXISTS (
    SELECT 1
    FROM platform_admins
    WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "update_tenants" ON public.tenants;
CREATE POLICY "update_tenants"
ON public.tenants
FOR UPDATE
USING (
  -- Only platform admins can update tenants
  EXISTS (
    SELECT 1
    FROM platform_admins
    WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM platform_admins
    WHERE user_id = auth.uid()
  )
);

-- Update policies for other tables
DROP POLICY IF EXISTS "admin_all_access" ON public.tenants;
DROP POLICY IF EXISTS "admin_all_access" ON public.tenant_users;

-- Recreate admin access policies using platform_admins table
CREATE POLICY "admin_all_access" ON public.tenants
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM platform_admins
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "admin_all_access" ON public.tenant_users
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM platform_admins
    WHERE user_id = auth.uid()
  )
);

-- Update tenant access policies for all tables
DROP POLICY IF EXISTS "tenant_access" ON public.departments;
CREATE POLICY "tenant_access" ON public.departments
FOR ALL
USING (
  tenant_id IN (
    SELECT t.id FROM tenants t
    INNER JOIN tenant_users tu ON t.id = tu.tenant_id
    WHERE tu.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM platform_admins
    WHERE user_id = auth.uid()
  )
);

-- Repeat for other tables
DROP POLICY IF EXISTS "tenant_access" ON public.positions;
CREATE POLICY "tenant_access" ON public.positions
FOR ALL
USING (
  tenant_id IN (
    SELECT t.id FROM tenants t
    INNER JOIN tenant_users tu ON t.id = tu.tenant_id
    WHERE tu.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM platform_admins
    WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "tenant_access" ON public.employees;
CREATE POLICY "tenant_access" ON public.employees
FOR ALL
USING (
  tenant_id IN (
    SELECT t.id FROM tenants t
    INNER JOIN tenant_users tu ON t.id = tu.tenant_id
    WHERE tu.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM platform_admins
    WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "tenant_access" ON public.time_off;
CREATE POLICY "tenant_access" ON public.time_off
FOR ALL
USING (
  tenant_id IN (
    SELECT t.id FROM tenants t
    INNER JOIN tenant_users tu ON t.id = tu.tenant_id
    WHERE tu.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM platform_admins
    WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "tenant_access" ON public.documents;
CREATE POLICY "tenant_access" ON public.documents
FOR ALL
USING (
  tenant_id IN (
    SELECT t.id FROM tenants t
    INNER JOIN tenant_users tu ON t.id = tu.tenant_id
    WHERE tu.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM platform_admins
    WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "tenant_access" ON public.projects;
CREATE POLICY "tenant_access" ON public.projects
FOR ALL
USING (
  tenant_id IN (
    SELECT t.id FROM tenants t
    INNER JOIN tenant_users tu ON t.id = tu.tenant_id
    WHERE tu.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM platform_admins
    WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "tenant_access" ON public.project_organization_charts;
CREATE POLICY "tenant_access" ON public.project_organization_charts
FOR ALL
USING (
  tenant_id IN (
    SELECT t.id FROM tenants t
    INNER JOIN tenant_users tu ON t.id = tu.tenant_id
    WHERE tu.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM platform_admins
    WHERE user_id = auth.uid()
  )
); 