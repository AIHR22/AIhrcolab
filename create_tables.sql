-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create department_revenue table
CREATE TABLE IF NOT EXISTS public.department_revenue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL,
    department_id UUID NOT NULL,
    amount DECIMAL NOT NULL,
    date DATE NOT NULL,
    forecast_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, department_id, date)
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_department_revenue_project_date 
ON public.department_revenue(project_id, date);

-- Enable Row Level Security
ALTER TABLE public.department_revenue ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Users can view their departments revenue"
ON public.department_revenue
FOR SELECT
USING (
    auth.uid() IN (
        SELECT user_id 
        FROM organization_members 
        WHERE organization_id = (
            SELECT organization_id 
            FROM projects 
            WHERE id = project_id
        )
    )
);

-- Insert some sample data
INSERT INTO public.department_revenue (project_id, department_id, amount, date, forecast_data)
VALUES 
    ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 50000, '2024-04-01', '{"projected_growth": 0.05}'::jsonb),
    ('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 75000, '2024-04-01', '{"projected_growth": 0.07}'::jsonb)
ON CONFLICT (project_id, department_id, date) DO NOTHING; 