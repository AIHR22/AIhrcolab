-- Enable Row Level Security for all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create a function to get current tenant ID
CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  tenant_id uuid;
  is_platform_admin boolean;
BEGIN
  -- Check if user is platform admin
  SELECT role = 'platform_admin' INTO is_platform_admin
  FROM user_profiles
  WHERE user_id = auth.uid();

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

-- Policy for user_profiles
CREATE POLICY "Users can view their own profile"
ON user_profiles
FOR SELECT
USING (user_id = auth.uid() OR EXISTS (
  SELECT 1 FROM tenant_users
  WHERE tenant_users.tenant_id = get_current_tenant_id()
  AND tenant_users.user_id = user_profiles.user_id
));

-- Policy for tenant_users
CREATE POLICY "Users can view members in their tenant"
ON tenant_users
FOR SELECT
USING (tenant_id = get_current_tenant_id() OR 
       EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role = 'platform_admin'));

CREATE POLICY "Only client admins can manage tenant users"
ON tenant_users
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM tenant_users tu
    WHERE tu.user_id = auth.uid()
    AND tu.tenant_id = tenant_users.tenant_id
    AND tu.role = 'client_admin'
  ) OR
  EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role = 'platform_admin')
);

-- Policy for employees
CREATE POLICY "Users can only access employees in their tenant"
ON employees
FOR ALL
USING (tenant_id = get_current_tenant_id() OR 
       EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role = 'platform_admin'));

-- Policy for projects
CREATE POLICY "Users can only access projects in their tenant"
ON projects
FOR ALL
USING (tenant_id = get_current_tenant_id() OR 
       EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role = 'platform_admin'));

-- Policy for tasks
CREATE POLICY "Users can only access tasks in their tenant"
ON tasks
FOR ALL
USING (EXISTS (
  SELECT 1 FROM projects
  WHERE projects.id = tasks.project_id
  AND (projects.tenant_id = get_current_tenant_id() OR 
       EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role = 'platform_admin'))
));