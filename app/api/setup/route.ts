import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// Initialize Supabase client with service role key for admin privileges
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: Request) {
  // Check for a secret key to prevent unauthorized access
  const { searchParams } = new URL(request.url)
  const secretKey = searchParams.get("key")

  // This is a simple security measure - in production, use a more secure approach
  if (secretKey !== "your-secret-setup-key") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Setup database schema
    await setupDatabase()

    // Seed database with sample data
    await seedDatabase()

    return NextResponse.json({ success: true, message: "Database setup and seeding completed successfully" })
  } catch (error) {
    console.error("Setup error:", error)
    return NextResponse.json({ error: "Setup failed", details: error }, { status: 500 })
  }
}

async function setupDatabase() {
  console.log("Setting up database schema...")

  try {
    // Enable UUID extension
    await supabaseAdmin.rpc("create_extension_if_not_exists", { extension_name: "uuid-ossp" })

    // Create tables
    const tables = [
      `
      CREATE TABLE IF NOT EXISTS employees (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        position TEXT NOT NULL,
        department TEXT NOT NULL,
        avatar_url TEXT,
        start_date DATE NOT NULL,
        manager_id UUID REFERENCES employees(id),
        salary INTEGER NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'on_leave')) DEFAULT 'active'
      )
      `,
      `
      CREATE TABLE IF NOT EXISTS time_off_requests (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        employee_id UUID NOT NULL REFERENCES employees(id),
        type TEXT NOT NULL CHECK (type IN ('vacation', 'sick', 'personal', 'other')),
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
        notes TEXT
      )
      `,
      `
      CREATE TABLE IF NOT EXISTS reviews (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        employee_id UUID NOT NULL REFERENCES employees(id),
        reviewer_id UUID NOT NULL REFERENCES employees(id),
        review_type TEXT NOT NULL CHECK (review_type IN ('performance', 'probation', 'salary')),
        scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('scheduled', 'completed', 'cancelled')) DEFAULT 'scheduled',
        notes TEXT
      )
      `,
      `
      CREATE TABLE IF NOT EXISTS projects (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        name TEXT NOT NULL,
        description TEXT,
        start_date DATE NOT NULL,
        end_date DATE,
        status TEXT NOT NULL CHECK (status IN ('planning', 'in_progress', 'completed', 'on_hold')) DEFAULT 'planning',
        budget INTEGER
      )
      `,
      `
      CREATE TABLE IF NOT EXISTS project_members (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        project_id UUID NOT NULL REFERENCES projects(id),
        employee_id UUID NOT NULL REFERENCES employees(id),
        role TEXT NOT NULL
      )
      `,
      `
      CREATE TABLE IF NOT EXISTS company_settings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        name TEXT NOT NULL,
        logo_url TEXT,
        primary_color TEXT,
        secondary_color TEXT,
        address TEXT,
        phone TEXT,
        email TEXT,
        website TEXT
      )
      `,
    ]

    // Execute each table creation query
    for (const tableQuery of tables) {
      await supabaseAdmin.query(tableQuery)
    }

    return true
  } catch (error) {
    console.error("Error setting up database:", error)
    throw error
  }
}

async function seedDatabase() {
  console.log("Seeding database with sample data...")

  try {
    // Clear existing data
    await supabaseAdmin.from("project_members").delete().not("id", "is", null)
    await supabaseAdmin.from("time_off_requests").delete().not("id", "is", null)
    await supabaseAdmin.from("reviews").delete().not("id", "is", null)
    await supabaseAdmin.from("projects").delete().not("id", "is", null)
    await supabaseAdmin.from("employees").delete().not("id", "is", null)
    await supabaseAdmin.from("company_settings").delete().not("id", "is", null)

    // Seed company settings
    const companySettings = {
      name: "Acme Corporation",
      logo_url: "https://via.placeholder.com/150",
      primary_color: "#3b82f6",
      secondary_color: "#10b981",
      address: "123 Main St, San Francisco, CA 94105",
      phone: "(555) 123-4567",
      email: "info@acmecorp.com",
      website: "https://acmecorp.com",
    }

    await supabaseAdmin.from("company_settings").insert(companySettings)

    // Seed employees
    const departments = ["Engineering", "Product", "Marketing", "Sales", "HR", "Finance", "Operations"]
    const positions = {
      Engineering: [
        "Software Engineer",
        "Senior Software Engineer",
        "Tech Lead",
        "Engineering Manager",
        "QA Engineer",
        "DevOps Engineer",
      ],
      Product: ["Product Manager", "Product Designer", "UX Researcher", "Product Director"],
      Marketing: ["Marketing Specialist", "Content Writer", "SEO Specialist", "Marketing Manager"],
      Sales: ["Sales Representative", "Account Executive", "Sales Manager", "Customer Success Manager"],
      HR: ["HR Specialist", "Recruiter", "HR Manager", "People Operations"],
      Finance: ["Accountant", "Financial Analyst", "Finance Manager", "Controller"],
      Operations: ["Operations Specialist", "Operations Manager", "Office Manager", "Facilities Coordinator"],
    }

    const employees = []
    const managerIds = []

    // Create 20 employees
    for (let i = 0; i < 20; i++) {
      const department = departments[Math.floor(Math.random() * departments.length)]
      const position = positions[department][Math.floor(Math.random() * positions[department].length)]
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 365 * 2))

      const employee = {
        name: `Employee ${i + 1}`,
        email: `employee${i + 1}@acmecorp.com`,
        position,
        department,
        avatar_url: `https://i.pravatar.cc/150?u=${i}`,
        start_date: startDate.toISOString().split("T")[0],
        manager_id: i < 5 ? null : managerIds[Math.floor(Math.random() * managerIds.length)],
        salary: 50000 + Math.floor(Math.random() * 100000),
        status: "active",
      }

      const { data, error } = await supabaseAdmin.from("employees").insert(employee).select()

      if (error) throw error

      if (data && data[0]) {
        // First 5 employees are managers
        if (i < 5) {
          managerIds.push(data[0].id)
        }

        employees.push(data[0])
      }
    }

    // Seed projects
    const projectNames = [
      "Website Redesign",
      "Mobile App Development",
      "CRM Integration",
      "Data Migration",
      "Cloud Infrastructure",
      "Marketing Campaign",
      "Product Launch",
    ]

    const projectStatuses = ["planning", "in_progress", "completed", "on_hold"]
    const projects = []

    for (let i = 0; i < projectNames.length; i++) {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 90))

      let endDate = null
      if (Math.random() > 0.3) {
        endDate = new Date(startDate)
        endDate.setDate(endDate.getDate() + 30 + Math.floor(Math.random() * 60))
        endDate = endDate.toISOString().split("T")[0]
      }

      const project = {
        name: projectNames[i],
        description: `Description for ${projectNames[i]}`,
        start_date: startDate.toISOString().split("T")[0],
        end_date: endDate,
        status: projectStatuses[Math.floor(Math.random() * projectStatuses.length)],
        budget: 10000 + Math.floor(Math.random() * 90000),
      }

      const { data, error } = await supabaseAdmin.from("projects").insert(project).select()

      if (error) throw error

      if (data && data[0]) {
        projects.push(data[0])
      }
    }

    // Seed time off requests, reviews, and project members
    const timeOffTypes = ["vacation", "sick", "personal", "other"]
    const reviewTypes = ["performance", "probation", "salary"]
    const roles = ["Project Manager", "Developer", "Designer", "QA", "DevOps", "Business Analyst"]

    // Time off requests
    for (let i = 0; i < 15; i++) {
      const employee = employees[Math.floor(Math.random() * employees.length)]
      const type = timeOffTypes[Math.floor(Math.random() * timeOffTypes.length)]
      const startDate = new Date()
      startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 30))
      const endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 7) + 1)

      await supabaseAdmin.from("time_off_requests").insert({
        employee_id: employee.id,
        type,
        start_date: startDate.toISOString().split("T")[0],
        end_date: endDate.toISOString().split("T")[0],
        status: Math.random() > 0.3 ? "pending" : Math.random() > 0.5 ? "approved" : "rejected",
        notes: `Time off request for ${type}`,
      })
    }

    // Reviews
    for (let i = 0; i < 10; i++) {
      const employee = employees[Math.floor(Math.random() * employees.length)]
      const reviewer = employees.filter((e) => e.id !== employee.id)[Math.floor(Math.random() * (employees.length - 1))]
      const reviewType = reviewTypes[Math.floor(Math.random() * reviewTypes.length)]
      const scheduledDate = new Date()
      scheduledDate.setDate(scheduledDate.getDate() + Math.floor(Math.random() * 30))

      await supabaseAdmin.from("reviews").insert({
        employee_id: employee.id,
        reviewer_id: reviewer.id,
        review_type: reviewType,
        scheduled_date: scheduledDate.toISOString(),
        status: "scheduled",
        notes: `${reviewType} review`,
      })
    }

    // Project members
    for (const project of projects) {
      // Assign 3-6 employees to each project
      const memberCount = 3 + Math.floor(Math.random() * 4)
      const shuffledEmployees = [...employees].sort(() => 0.5 - Math.random())

      for (let i = 0; i < memberCount; i++) {
        await supabaseAdmin.from("project_members").insert({
          project_id: project.id,
          employee_id: shuffledEmployees[i].id,
          role: roles[Math.floor(Math.random() * roles.length)],
        })
      }
    }

    return true
  } catch (error) {
    console.error("Error seeding database:", error)
    throw error
  }
}

// Initialize Supabase client with service role key for admin privileges
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST() {
  try {
    // Create employees table
    const { error: employeesError } = await supabase.rpc("create_employees_table")
    if (employeesError && !employeesError.message.includes("already exists")) {
      return NextResponse.json({ error: employeesError.message }, { status: 500 })
    }

    // Create departments table
    const { error: departmentsError } = await supabase.rpc("create_departments_table")
    if (departmentsError && !departmentsError.message.includes("already exists")) {
      return NextResponse.json({ error: departmentsError.message }, { status: 500 })
    }

    // Create time_off table
    const { error: timeOffError } = await supabase.rpc("create_time_off_table")
    if (timeOffError && !timeOffError.message.includes("already exists")) {
      return NextResponse.json({ error: timeOffError.message }, { status: 500 })
    }

    // Create documents table
    const { error: documentsError } = await supabase.rpc("create_documents_table")
    if (documentsError && !documentsError.message.includes("already exists")) {
      return NextResponse.json({ error: documentsError.message }, { status: 500 })
    }

    // Enable realtime for all tables
    const { error: realtimeError } = await supabase.rpc("enable_realtime")
    if (realtimeError) {
      return NextResponse.json({ error: realtimeError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Database setup completed successfully" })
  } catch (error) {
    console.error("Setup error:", error)
    return NextResponse.json({ error: "Failed to set up database" }, { status: 500 })
  }
}

