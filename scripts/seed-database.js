import { createClient } from "@supabase/supabase-js"
import { v4 as uuidv4 } from "uuid"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Helper function to format dates
function formatDate(date) {
  return date.toISOString().split("T")[0]
}

// Helper function to get a random date within a range
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

// Helper function to add days to a date
function addDays(date, days) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

// Helper function to subtract days from a date
function subDays(date, days) {
  const result = new Date(date)
  result.setDate(result.getDate() - days)
  return result
}

async function seedDatabase() {
  console.log("Starting database seeding...")

  try {
    // Clear existing data
    console.log("Clearing existing data...")
    await supabase.from("project_members").delete().not("id", "is", null)
    await supabase.from("time_off_requests").delete().not("id", "is", null)
    await supabase.from("reviews").delete().not("id", "is", null)
    await supabase.from("projects").delete().not("id", "is", null)
    await supabase.from("employees").delete().not("id", "is", null)
    await supabase.from("company_settings").delete().not("id", "is", null)

    // Seed company settings
    console.log("Seeding company settings...")
    const companySettings = {
      id: uuidv4(),
      name: "Acme Corporation",
      logo_url: "https://via.placeholder.com/150",
      primary_color: "#3b82f6",
      secondary_color: "#10b981",
      address: "123 Main St, San Francisco, CA 94105",
      phone: "(555) 123-4567",
      email: "info@acmecorp.com",
      website: "https://acmecorp.com",
    }

    await supabase.from("company_settings").insert(companySettings)

    // Seed employees
    console.log("Seeding employees...")
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
      const id = uuidv4()
      const department = departments[Math.floor(Math.random() * departments.length)]
      const position = positions[department][Math.floor(Math.random() * positions[department].length)]
      const startDate = formatDate(subDays(new Date(), Math.floor(Math.random() * 365 * 2)))

      const employee = {
        id,
        name: `Employee ${i + 1}`,
        email: `employee${i + 1}@acmecorp.com`,
        position,
        department,
        avatar_url: `https://i.pravatar.cc/150?u=${id}`,
        start_date: startDate,
        manager_id: i < 5 ? null : managerIds[Math.floor(Math.random() * managerIds.length)],
        salary: 50000 + Math.floor(Math.random() * 100000),
        status: "active",
      }

      employees.push(employee)

      // First 5 employees are managers
      if (i < 5) {
        managerIds.push(id)
      }
    }

    await supabase.from("employees").insert(employees)

    // Seed time off requests
    console.log("Seeding time off requests...")
    const timeOffTypes = ["vacation", "sick", "personal", "other"]
    const timeOffRequests = []

    for (let i = 0; i < 15; i++) {
      const employeeId = employees[Math.floor(Math.random() * employees.length)].id
      const type = timeOffTypes[Math.floor(Math.random() * timeOffTypes.length)]
      const startDate = formatDate(addDays(new Date(), Math.floor(Math.random() * 30)))
      const endDate = formatDate(addDays(new Date(startDate), Math.floor(Math.random() * 7) + 1))
      const status = Math.random() > 0.3 ? "pending" : Math.random() > 0.5 ? "approved" : "rejected"

      timeOffRequests.push({
        id: uuidv4(),
        employee_id: employeeId,
        type,
        start_date: startDate,
        end_date: endDate,
        status,
        notes: `Time off request for ${type}`,
      })
    }

    await supabase.from("time_off_requests").insert(timeOffRequests)

    // Seed reviews
    console.log("Seeding reviews...")
    const reviewTypes = ["performance", "probation", "salary"]
    const reviews = []

    for (let i = 0; i < 10; i++) {
      const employeeId = employees[Math.floor(Math.random() * employees.length)].id
      const reviewerId = managerIds[Math.floor(Math.random() * managerIds.length)]
      const reviewType = reviewTypes[Math.floor(Math.random() * reviewTypes.length)]
      const scheduledDate = new Date(addDays(new Date(), Math.floor(Math.random() * 30))).toISOString()

      reviews.push({
        id: uuidv4(),
        employee_id: employeeId,
        reviewer_id: reviewerId,
        review_type: reviewType,
        scheduled_date: scheduledDate,
        status: "scheduled",
        notes: `${reviewType} review`,
      })
    }

    await supabase.from("reviews").insert(reviews)

    // Seed projects
    console.log("Seeding projects...")
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
      const startDate = formatDate(subDays(new Date(), Math.floor(Math.random() * 90)))
      const endDate =
        Math.random() > 0.3 ? formatDate(addDays(new Date(startDate), 30 + Math.floor(Math.random() * 60))) : null

      projects.push({
        id: uuidv4(),
        name: projectNames[i],
        description: `Description for ${projectNames[i]}`,
        start_date: startDate,
        end_date: endDate,
        status: projectStatuses[Math.floor(Math.random() * projectStatuses.length)],
        budget: 10000 + Math.floor(Math.random() * 90000),
      })
    }

    await supabase.from("projects").insert(projects)

    // Seed project members
    console.log("Seeding project members...")
    const projectMembers = []
    const roles = ["Project Manager", "Developer", "Designer", "QA", "DevOps", "Business Analyst"]

    for (const project of projects) {
      // Assign 3-6 employees to each project
      const memberCount = 3 + Math.floor(Math.random() * 4)
      const projectEmployees = [...employees].sort(() => 0.5 - Math.random()).slice(0, memberCount)

      for (const employee of projectEmployees) {
        projectMembers.push({
          id: uuidv4(),
          project_id: project.id,
          employee_id: employee.id,
          role: roles[Math.floor(Math.random() * roles.length)],
        })
      }
    }

    await supabase.from("project_members").insert(projectMembers)

    console.log("Database seeding completed successfully!")
  } catch (error) {
    console.error("Error seeding database:", error)
  }
}

seedDatabase()

