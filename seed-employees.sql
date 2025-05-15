-- First, get the department IDs
WITH dept_ids AS (
  SELECT id, name FROM departments
)
-- Insert sample employees
INSERT INTO employees (
  first_name, 
  last_name, 
  email, 
  phone, 
  position, 
  department, 
  hire_date, 
  status, 
  avatar_url, 
  address, 
  bio, 
  team, 
  username, 
  role
)
VALUES
  (
    'John', 
    'Doe', 
    'john.doe@example.com', 
    '+1 (555) 123-4567', 
    'Software Engineer', 
    (SELECT id FROM dept_ids WHERE name = 'Engineering' LIMIT 1), 
    '2022-01-15', 
    'active', 
    '/placeholder.svg?height=40&width=40', 
    '123 Main St, San Francisco, CA 94105', 
    'Experienced software engineer with a focus on frontend technologies.', 
    'Frontend', 
    'john.doe', 
    'employee'
  ),
  (
    'Jane', 
    'Smith', 
    'jane.smith@example.com', 
    '+1 (555) 987-6543', 
    'Product Manager', 
    (SELECT id FROM dept_ids WHERE name = 'Product' LIMIT 1), 
    '2021-11-03', 
    'active', 
    '/placeholder.svg?height=40&width=40', 
    '456 Market St, San Francisco, CA 94105', 
    'Strategic product manager with a background in user research.', 
    'Product Management', 
    'jane.smith', 
    'manager'
  ),
  (
    'Michael', 
    'Johnson', 
    'michael.johnson@example.com', 
    '+1 (555) 456-7890', 
    'UX Designer', 
    (SELECT id FROM dept_ids WHERE name = 'Design' LIMIT 1), 
    '2023-02-20', 
    'onboarding', 
    '/placeholder.svg?height=40&width=40', 
    '789 Howard St, San Francisco, CA 94105', 
    'Creative UX designer with a passion for user-centered design.', 
    'Design', 
    'michael.johnson', 
    'employee'
  ),
  (
    'Emily', 
    'Williams', 
    'emily.williams@example.com', 
    '+1 (555) 789-0123', 
    'Marketing Specialist', 
    (SELECT id FROM dept_ids WHERE name = 'Marketing' LIMIT 1), 
    '2022-08-10', 
    'active', 
    '/placeholder.svg?height=40&width=40', 
    '321 Mission St, San Francisco, CA 94105', 
    'Results-driven marketing specialist with expertise in digital marketing.', 
    'Digital Marketing', 
    'emily.williams', 
    'employee'
  ),
  (
    'David', 
    'Brown', 
    'david.brown@example.com', 
    '+1 (555) 234-5678', 
    'Sales Representative', 
    (SELECT id FROM dept_ids WHERE name = 'Sales' LIMIT 1), 
    '2021-05-15', 
    'offboarding', 
    '/placeholder.svg?height=40&width=40', 
    '987 Folsom St, San Francisco, CA 94105', 
    'Experienced sales representative with a track record of exceeding targets.', 
    'Enterprise Sales', 
    'david.brown', 
    'employee'
  )
ON CONFLICT (email) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  phone = EXCLUDED.phone,
  position = EXCLUDED.position,
  department = EXCLUDED.department,
  hire_date = EXCLUDED.hire_date,
  status = EXCLUDED.status,
  avatar_url = EXCLUDED.avatar_url,
  address = EXCLUDED.address,
  bio = EXCLUDED.bio,
  team = EXCLUDED.team,
  username = EXCLUDED.username,
  role = EXCLUDED.role;

