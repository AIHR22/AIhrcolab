-- Function to create the departments table
CREATE OR REPLACE FUNCTION create_departments_table()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if the table already exists
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public'
    AND table_name = 'departments'
  ) THEN
    -- Create departments table
    CREATE TABLE departments (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );

    -- Add comment to table
    COMMENT ON TABLE departments IS 'Organizational departments';
  END IF;
END;
$$;

-- Function to create the employees table
CREATE OR REPLACE FUNCTION create_employees_table()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if the table already exists
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public'
    AND table_name = 'employees'
  ) THEN
    -- Create employees table
    CREATE TABLE employees (
      id SERIAL PRIMARY KEY,
      first_name VARCHAR(255) NOT NULL,
      last_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      position VARCHAR(255),
      department_id INTEGER,
      manager_id INTEGER,
      salary DECIMAL(10, 2),
      hire_date TIMESTAMP DEFAULT NOW(),
      created_at TIMESTAMP DEFAULT NOW(),
      FOREIGN KEY (department_id) REFERENCES departments(id),
      FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE SET NULL
    );

    -- Add comment to table
    COMMENT ON TABLE employees IS 'Company employees';
  END IF;
END;
$$;

-- Function to create the org_structures table for organization charts
CREATE OR REPLACE FUNCTION create_org_structures_table()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if the table already exists
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public'
    AND table_name = 'org_structures'
  ) THEN
    -- Create org_structures table
    CREATE TABLE org_structures (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      structure JSONB NOT NULL,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Add comment to table
    COMMENT ON TABLE org_structures IS 'Organization chart structures';
  END IF;
END;
$$; 