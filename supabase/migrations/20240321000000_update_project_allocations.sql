-- Drop the existing foreign key constraint
ALTER TABLE project_allocations 
DROP CONSTRAINT IF EXISTS project_allocations_employee_id_fkey;

-- Add the new foreign key constraint with ON DELETE CASCADE
ALTER TABLE project_allocations 
ADD CONSTRAINT project_allocations_employee_id_fkey 
FOREIGN KEY (employee_id) 
REFERENCES employees(id) 
ON DELETE CASCADE; 