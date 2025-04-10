-- First, create departments
INSERT INTO public.departments (id, name, description)
VALUES 
    ('22222222-2222-2222-2222-222222222222', 'Sales', 'Sales and Revenue Generation')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.departments (id, name, description)
VALUES 
    ('33333333-3333-3333-3333-333333333333', 'Marketing', 'Marketing and Brand Management')
ON CONFLICT (id) DO NOTHING;

-- Then create projects
INSERT INTO public.projects (id, department_id, name)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'Revenue Forecasting'
)
ON CONFLICT (id) DO NOTHING;

-- Add department members
INSERT INTO public.department_members (department_id, user_id, role)
VALUES 
    ('22222222-2222-2222-2222-222222222222', auth.uid(), 'admin')
ON CONFLICT (department_id, user_id) DO NOTHING;

INSERT INTO public.department_members (department_id, user_id, role)
VALUES 
    ('33333333-3333-3333-3333-333333333333', auth.uid(), 'manager')
ON CONFLICT (department_id, user_id) DO NOTHING;

-- Finally add revenue data
INSERT INTO public.department_revenue (department_id, amount, date, forecast_data)
VALUES 
    ('22222222-2222-2222-2222-222222222222', 50000, CURRENT_DATE, '{"projected_growth": 0.05}'::jsonb)
ON CONFLICT (department_id, date) DO NOTHING;

INSERT INTO public.department_revenue (department_id, amount, date, forecast_data)
VALUES 
    ('33333333-3333-3333-3333-333333333333', 75000, CURRENT_DATE, '{"projected_growth": 0.07}'::jsonb)
ON CONFLICT (department_id, date) DO NOTHING; 