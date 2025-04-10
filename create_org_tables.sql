-- Create departments table
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create department_revenue table
CREATE TABLE IF NOT EXISTS public.department_revenue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department_id UUID NOT NULL REFERENCES departments(id),
    amount DECIMAL NOT NULL,
    date DATE NOT NULL,
    forecast_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(department_id, date)
);

-- Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department_id UUID NOT NULL REFERENCES departments(id),
    name TEXT NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'on_hold')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create department_members table
CREATE TABLE IF NOT EXISTS public.department_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department_id UUID NOT NULL REFERENCES departments(id),
    user_id UUID NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'member', 'viewer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(department_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_dept_members_user ON department_members(user_id);
CREATE INDEX IF NOT EXISTS idx_dept_members_dept ON department_members(department_id);
CREATE INDEX IF NOT EXISTS idx_projects_dept ON projects(department_id);
CREATE INDEX IF NOT EXISTS idx_dept_revenue_dept_date ON department_revenue(department_id, date);

-- Enable RLS
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE department_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE department_revenue ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their departments"
ON departments
FOR SELECT
USING (
    id IN (
        SELECT department_id 
        FROM department_members 
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can view their projects"
ON projects
FOR SELECT
USING (
    department_id IN (
        SELECT department_id 
        FROM department_members 
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can view department members"
ON department_members
FOR SELECT
USING (
    department_id IN (
        SELECT department_id 
        FROM department_members 
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can view department revenue"
ON department_revenue
FOR SELECT
USING (
    department_id IN (
        SELECT department_id 
        FROM department_members 
        WHERE user_id = auth.uid()
    )
); 