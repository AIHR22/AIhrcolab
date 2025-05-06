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
SELECT
  'John', 
  'Doe', 
  'john.doe@example.com', 
  '+1 (555) 123-4567', 
  'Software Engineer', 
  d.id, 
  '2022-01-15', 
  'active', 
  '/placeholder.svg?height=40&width=40', 
  '123 Main St, San Francisco, CA 94105', 
  'Experienced software engineer with a focus on frontend technologies.', 
  'Frontend', 
  'john.doe', 
  'employee'
FROM departments d
WHERE d.name = 'Engineering'
LIMIT 1

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

-- Repeat for other employees
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
SELECT
  'Jane', 
  'Smith', 
  'jane.smith@example.com', 
  '+1 (555) 987-6543', 
  'Product Manager', 
  d.id, 
  '2021-11-03', 
  'active', 
  '/placeholder.svg?height=40&width=40', 
  '456 Market St, San Francisco, CA 94105', 
  'Strategic product manager with a background in user research.', 
  'Product Management', 
  'jane.smith', 
  'manager'
FROM departments d
WHERE d.name = 'Product'
LIMIT 1

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

