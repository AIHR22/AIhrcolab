import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string

// Generate random date within a range
function randomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

// Generate random employee data
function generateEmployees(count: number) {
  const employees = []
  const firstNames = ["John", "Jane", "Michael", "Emily", "David", "Sarah", "Robert", "Lisa", "William", "Emma"]
  const lastNames = ["Smith", "Johnson", "Williams", "Jones", "Brown", "Davis", "Miller", "Wilson", "Moore", "Taylor"]
  const departments = ["Engineering", "Product", "Marketing", "Sales", "HR", "Finance", "Operations"]
  const positions = {
    Engineering: ["Software Engineer", "Senior Engineer", "Tech Lead", "Engineering Manager"],
    Product: ["Product Manager", "Product Designer", "UX Researcher", "Product Director"],
    Marketing: ["Marketing Specialist", "Content Writer", "SEO Specialist", "Marketing Manager"],
    Sales: ["Sales Representative", "Account Executive", "Sales Manager", "Customer Success"],
    HR: ["HR Specialist", "Recruiter", "HR Manager", "People Operations"],
    Finance: ["Accountant", "Financial Analyst", "Controller", "Finance Manager"],
    Operations: ["Operations Specialist", "Office Manager", "Facilities Manager", "IT Support"],
  }

  // Create managers first
  const managerIds = []
  for (let i = 0; i < departments.length; i++) {
    const department = departments[i]
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const position =
      positions[department as keyof typeof positions][positions[department as keyof typeof positions].length - 1]

    const employee = {
      id: crypto.randomUUID(),
      first_name: firstName,
      last_name: lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      department,
      position,
      hire_date: randomDate(new Date(2018, 0, 1), new Date(2021, 11, 31))
        .toISOString()
        .split("T")[0],
      status: "active",
      created_at: new Date().toISOString(),
    }

    employees.push(employee)
    managerIds.push(employee.id)
  }

  // Create regular employees
  for (let i = 0; i < count - departments.length; i++) {
    const department = departments[Math.floor(Math.random() * departments.length)]
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const positionOptions = positions[department as keyof typeof positions]
    const position = positionOptions[Math.floor(Math.random() * (positionOptions.length - 1))]
    const managerId = managerIds[departments.indexOf(department)]

    const statusOptions = ["active", "active", "active", "active", "inactive", "on_leave"] // Weighted for more active employees
    const status = statusOptions[Math.floor(Math.random() * statusOptions.length)]

    employees.push({
      id: crypto.randomUUID(),
      first_name: firstName,
      last_name: lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 100)}@example.com`,
      department,
      position,
      hire_date: randomDate(new Date(2020, 0, 1), new Date())
        .toISOString()
        .split("T")[0],
      manager_id: managerId,
      status,
      created_at: new Date().toISOString(),
    })
  }

  return employees
}

// Generate time off requests
function generateTimeOffRequests(employees: any[]) {
  const requests = []
  const reasons = ["Vacation", "Sick Leave", "Personal Day", "Family Emergency", "Medical Appointment"]

  // Only generate requests for active employees
  const activeEmployees = employees.filter((e) => e.status === "active")

  // Generate 1-3 requests for about 70% of employees
  for (let i = 0; i < Math.floor(activeEmployees.length * 0.7); i++) {
    const employee = activeEmployees[i]
    const requestCount = Math.floor(Math.random() * 3) + 1

    for (let j = 0; j < requestCount; j++) {
      const startDate = randomDate(new Date(2023, 0, 1), new Date(2023, 11, 31))
      const endDate = new Date(startDate)
      endDate.setDate(startDate.getDate() + Math.floor(Math.random() * 5) + 1)

      const statusOptions = ["approved", "approved", "approved", "pending", "pending", "rejected"]
      const status = statusOptions[Math.floor(Math.random() * statusOptions.length)]

      requests.push({
        id: crypto.randomUUID(),
        employee_id: employee.id,
        start_date: startDate.toISOString().split("T")[0],
        end_date: endDate.toISOString().split("T")[0],
        reason: reasons[Math.floor(Math.random() * reasons.length)],
        status,
        created_at: new Date(startDate.getTime() - Math.random() * 1000 * 60 * 60 * 24 * 14).toISOString(), // 1-14 days before start date
      })
    }
  }

  return requests
}

// Generate performance reviews
function generateReviews(employees: any[]) {
  const reviews = []

  // Generate reviews for about 60% of employees
  for (let i = 0; i < Math.floor(employees.length * 0.6); i++) {
    const employee = employees[i]

    // Skip managers for simplicity
    if (!employee.manager_id) continue

    const reviewDate = randomDate(new Date(2023, 0, 1), new Date(2023, 6, 31))
    const performanceScore = Math.floor(Math.random() * 5) + 1 // 1-5 rating

    const comments = [
      "Consistently meets expectations and delivers quality work.",
      "Exceeds expectations in most areas. Great team player.",
      "Needs improvement in meeting deadlines, but quality of work is good.",
      "Outstanding performance across all areas. Demonstrates leadership qualities.",
      "Meeting basic job requirements but could improve communication skills.",
    ]

    reviews.push({
      id: crypto.randomUUID(),
      employee_id: employee.id,
      reviewer_id: employee.manager_id,
      review_date: reviewDate.toISOString().split("T")[0],
      performance_score: performanceScore,
      comments: comments[Math.floor(Math.random() * comments.length)],
      created_at: reviewDate.toISOString(),
    })
  }

  return reviews
}

export async function GET() {
  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ error: "Missing Supabase environment variables" }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    // Generate sample data
    const employees = generateEmployees(20) // Generate 20 employees for the demo
    const timeOffRequests = generateTimeOffRequests(employees)
    const reviews = generateReviews(employees)

    // Clear existing data
    await supabase.from("reviews").delete().neq("id", "00000000-0000-0000-0000-000000000000")
    await supabase.from("time_off_requests").delete().neq("id", "00000000-0000-0000-0000-000000000000")
    await supabase.from("employees").delete().neq("id", "00000000-0000-0000-0000-000000000000")

    // Insert employees
    const { error: employeesError } = await supabase.from("employees").insert(employees)
    if (employeesError) {
      return NextResponse.json({ error: `Error inserting employees: ${employeesError.message}` }, { status: 500 })
    }

    // Insert time off requests
    const { error: timeOffError } = await supabase.from("time_off_requests").insert(timeOffRequests)
    if (timeOffError) {
      return NextResponse.json({ error: `Error inserting time off requests: ${timeOffError.message}` }, { status: 500 })
    }

    // Insert reviews
    const { error: reviewsError } = await supabase.from("reviews").insert(reviews)
    if (reviewsError) {
      return NextResponse.json({ error: `Error inserting reviews: ${reviewsError.message}` }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      counts: {
        employees: employees.length,
        timeOffRequests: timeOffRequests.length,
        reviews: reviews.length,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: `Error seeding database: ${error}` }, { status: 500 })
  }
}

