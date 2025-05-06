-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create project_organization_charts table
CREATE TABLE IF NOT EXISTS project_organization_charts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id),
    role VARCHAR(255),
    parent_id UUID REFERENCES project_organization_charts(id),
    level INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_employee_project UNIQUE (project_id, employee_id)
);

-- Add indexes for better query performance
CREATE INDEX idx_project_org_charts_project_id ON project_organization_charts(project_id);
CREATE INDEX idx_project_org_charts_employee_id ON project_organization_charts(employee_id);
CREATE INDEX idx_project_org_charts_parent_id ON project_organization_charts(parent_id);