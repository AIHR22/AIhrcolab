-- Create tenants table for client organizations
CREATE TABLE IF NOT EXISTS tenants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255),
    settings JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create tenant_users table to associate users with tenants
CREATE TABLE IF NOT EXISTS tenant_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('client_admin', 'sub_user')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, user_id)
);

-- Add tenant_id to existing tables
ALTER TABLE departments ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE positions ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE employees ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE time_off ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE documents ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE projects ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE project_organization_charts ADD COLUMN tenant_id UUID REFERENCES tenants(id);

-- Create indexes for better query performance
CREATE INDEX idx_departments_tenant_id ON departments(tenant_id);
CREATE INDEX idx_positions_tenant_id ON positions(tenant_id);
CREATE INDEX idx_employees_tenant_id ON employees(tenant_id);
CREATE INDEX idx_time_off_tenant_id ON time_off(tenant_id);
CREATE INDEX idx_documents_tenant_id ON documents(tenant_id);
CREATE INDEX idx_projects_tenant_id ON projects(tenant_id);
CREATE INDEX idx_project_org_charts_tenant_id ON project_organization_charts(tenant_id);

-- Add RLS policies for tenant isolation
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_off ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_organization_charts ENABLE ROW LEVEL SECURITY;

-- Create policies for platform admin access (can see all data)
CREATE POLICY admin_all_access ON tenants TO authenticated
    USING (EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role = 'platform_admin'));

CREATE POLICY admin_all_access ON tenant_users TO authenticated
    USING (EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role = 'platform_admin'));

-- Create policies for tenant-specific access
CREATE POLICY tenant_access ON departments TO authenticated
    USING (
        tenant_id IN (
            SELECT t.id FROM tenants t
            INNER JOIN tenant_users tu ON t.id = tu.tenant_id
            WHERE tu.user_id = auth.uid()
        ) OR
        EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role = 'platform_admin')
    );

-- Repeat similar policies for other tables
CREATE POLICY tenant_access ON positions TO authenticated USING (tenant_id IN (SELECT t.id FROM tenants t INNER JOIN tenant_users tu ON t.id = tu.tenant_id WHERE tu.user_id = auth.uid()) OR EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role = 'platform_admin'));
CREATE POLICY tenant_access ON employees TO authenticated USING (tenant_id IN (SELECT t.id FROM tenants t INNER JOIN tenant_users tu ON t.id = tu.tenant_id WHERE tu.user_id = auth.uid()) OR EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role = 'platform_admin'));
CREATE POLICY tenant_access ON time_off TO authenticated USING (tenant_id IN (SELECT t.id FROM tenants t INNER JOIN tenant_users tu ON t.id = tu.tenant_id WHERE tu.user_id = auth.uid()) OR EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role = 'platform_admin'));
CREATE POLICY tenant_access ON documents TO authenticated USING (tenant_id IN (SELECT t.id FROM tenants t INNER JOIN tenant_users tu ON t.id = tu.tenant_id WHERE tu.user_id = auth.uid()) OR EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role = 'platform_admin'));
CREATE POLICY tenant_access ON projects TO authenticated USING (tenant_id IN (SELECT t.id FROM tenants t INNER JOIN tenant_users tu ON t.id = tu.tenant_id WHERE tu.user_id = auth.uid()) OR EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role = 'platform_admin'));
CREATE POLICY tenant_access ON project_organization_charts TO authenticated USING (tenant_id IN (SELECT t.id FROM tenants t INNER JOIN tenant_users tu ON t.id = tu.tenant_id WHERE tu.user_id = auth.uid()) OR EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role = 'platform_admin'));

-- Add constraint to limit sub-users per tenant
CREATE OR REPLACE FUNCTION check_tenant_user_limit()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.role = 'sub_user' AND (
        SELECT COUNT(*)
        FROM tenant_users
        WHERE tenant_id = NEW.tenant_id
        AND role = 'sub_user'
    ) >= 10 THEN
        RAISE EXCEPTION 'Tenant cannot have more than 10 sub-users';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_tenant_user_limit
    BEFORE INSERT ON tenant_users
    FOR EACH ROW
    EXECUTE FUNCTION check_tenant_user_limit();