-- Create tasks table with tenant isolation
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    priority TEXT NOT NULL DEFAULT 'medium',
    assigned_to UUID REFERENCES employees(id),
    due_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);

-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policy for tenant isolation
CREATE POLICY tenant_access ON tasks TO authenticated
    USING (
        project_id IN (
            SELECT p.id FROM projects p
            INNER JOIN tenant_users tu ON p.tenant_id = tu.tenant_id
            WHERE tu.user_id = auth.uid()
        ) OR
        EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role = 'platform_admin')
    );