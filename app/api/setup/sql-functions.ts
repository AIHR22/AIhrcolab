export const createEmployeesTableSQL = `
CREATE OR REPLACE FUNCTION create_employees_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    position TEXT NOT NULL,
    department TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    avatar_url TEXT,
    bio TEXT,
    skills TEXT[] DEFAULT '{}',
    reports_to UUID REFERENCES employees(id),
    start_date DATE NOT NULL,
    salary NUMERIC NOT NULL,
    documents JSONB DEFAULT '[]',
    performance_reviews JSONB DEFAULT '[]',
    ai_generated_insights JSONB DEFAULT '[]'
  );

  -- Create trigger to update updated_at timestamp
  CREATE OR REPLACE FUNCTION update_updated_at_column()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  DROP TRIGGER IF EXISTS update_employees_updated_at ON employees;
  CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON employees
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
END;
$$ LANGUAGE plpgsql;
`

export const createDepartmentsTableSQL = `
CREATE OR REPLACE FUNCTION create_departments_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    manager_id UUID REFERENCES employees(id)
  );
END;
$$ LANGUAGE plpgsql;
`

export const createTimeOffTableSQL = `
CREATE OR REPLACE FUNCTION create_time_off_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS time_off (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    notes TEXT,
    approved_by UUID REFERENCES employees(id)
  );

  DROP TRIGGER IF EXISTS update_time_off_updated_at ON time_off;
  CREATE TRIGGER update_time_off_updated_at
  BEFORE UPDATE ON time_off
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
END;
$$ LANGUAGE plpgsql;
`

export const createDocumentsTableSQL = `
CREATE OR REPLACE FUNCTION create_documents_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name TEXT NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    owner_id UUID REFERENCES employees(id),
    shared_with UUID[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}'
  );

  DROP TRIGGER IF EXISTS update_documents_updated_at ON documents;
  CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
END;
$$ LANGUAGE plpgsql;
`

export const enableRealtimeSQL = `
CREATE OR REPLACE FUNCTION enable_realtime()
RETURNS void AS $$
BEGIN
  -- Enable realtime for all tables
  ALTER PUBLICATION supabase_realtime ADD TABLE employees;
  ALTER PUBLICATION supabase_realtime ADD TABLE departments;
  ALTER PUBLICATION supabase_realtime ADD TABLE time_off;
  ALTER PUBLICATION supabase_realtime ADD TABLE documents;
END;
$$ LANGUAGE plpgsql;
`
\
Let's create a database seeding endpoint:

```tsx file="app/api/seed/route.ts"
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"

// Initialize Supabase client with service role key for admin privileges
const supabase = createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST() {
  try {
    // Seed departments
    const departments = [
      { name: "Engineering", description: "Software development and infrastructure" },
      { name: "Product", description: "Product management and design" },
      { name: "Marketing", description: "Brand, growth, and communications" },
      { name: "Sales", description: "Revenue generation and customer acquisition" },
      { name: "HR", description: "Human resources and talent management" },
      { name: "Finance", description: "Financial planning and accounting" },
    ]

    const { error: departmentsError } = await supabase.from("departments").upsert(departments, { onConflict: "name" })

    if (departmentsError) {
      return NextResponse.json({ error: departmentsError.message }, { status: 500 })
    }

    // Seed employees
    const employees = [
      {
        name: "John Doe",
        email: "john.doe@example.com",
        position: "Senior Developer",
        department: "Engineering",
        status: "active",
        skills: ["javascript", "typescript", "react", "nodejs"],
        start_date: "2021-01-15",
        salary: 120000,
      },
      {
        name: "Jane Smith",
        email: "jane.smith@example.com",
        position: "Product Manager",
        department: "Product",
        status: "active",
        skills: ["product_management", "leadership", "communication"],
        start_date: "2020-03-10",
        salary: 130000,
      },
      {
        name: "Michael Johnson",
        email: "michael.johnson@example.com",
        position: "Marketing Director",
        department: "Marketing",
        status: "active",
        skills: ["marketing", "leadership", "communication"],
        start_date: "2019-06-22",
        salary: 140000,
      },
      {
        name: "Emily Davis",
        email: "emily.davis@example.com",
        position: "HR Specialist",
        department: "HR",
        status: "active",
        skills: ["recruiting", "communication", "hr_policies"],
        start_date: "2022-02-05",
        salary: 95000,
      },
      {
        name: "Robert Wilson",
        email: "robert.wilson@example.com",
        position: "Frontend Developer",
        department: "Engineering",
        status: "active",
        skills: ["javascript", "react", "css", "html"],
        start_date: "2022-05-18",
        salary: 105000,
      },
    ]

    const { error: employeesError } = await supabase.from("employees").upsert(employees, { onConflict: "email" })

    if (employeesError) {
      return NextResponse.json({ error: employeesError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Database seeded successfully" })
  } catch (error) {
    console.error("Seeding error:", error)
    return NextResponse.json({ error: "Failed to seed database" }, { status: 500 })
  }
}

