import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function seedDatabase() {
  console.log("Seeding HR Suite database with sample data...")

  try {
    // Check if employees table exists and has data
    const { data: existingEmployees, error: checkError } = await supabase.from("employees").select("count").single()

    if (checkError && checkError.code !== "42P01") {
      throw checkError
    }

    if (existingEmployees && existingEmployees.count > 0) {
      console.log(`Employees table already has ${existingEmployees.count} records. Skipping seed.`)
      return { success: true, message: "Database already seeded" }
    }

    // Sample employee data
    const employees = [
      {
        id: "11111111-1111-1111-1111-111111111111",
        first_name: "John",
        last_name: "Doe",
        email: "john.doe@example.com",
        department: "Engineering",
        position: "CTO",
        hire_date: "2020-01-15",
        status: "active",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
      },
      {
        id: "22222222-2222-2222-2222-222222222222",
        first_name: "Jane",
        last_name: "Smith",
        email: "jane.smith@example.com",
        department: "HR",
        position: "HR Director",
        hire_date: "2020-02-20",
        status: "active",
        manager_id: "11111111-1111-1111-1111-111111111111",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
      },
      {
        id: "33333333-3333-3333-3333-333333333333",
        first_name: "Michael",
        last_name: "Johnson",
        email: "michael.johnson@example.com",
        department: "Engineering",
        position: "Senior Developer",
        hire_date: "2021-03-10",
        status: "active",
        manager_id: "11111111-1111-1111-1111-111111111111",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
      },
      {
        id: "44444444-4444-4444-4444-444444444444",
        first_name: "Emily",
        last_name: "Williams",
        email: "emily.williams@example.com",
        department: "Marketing",
        position: "Marketing Manager",
        hire_date: "2021-04-15",
        status: "active",
        manager_id: "11111111-1111-1111-1111-111111111111",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
      },
      {
        id: "55555555-5555-5555-5555-555555555555",
        first_name: "David",
        last_name: "Brown",
        email: "david.brown@example.com",
        department: "Sales",
        position: "Sales Director",
        hire_date: "2021-05-20",
        status: "active",
        manager_id: "11111111-1111-1111-1111-111111111111",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
      },
      {
        id: "66666666-6666-6666-6666-666666666666",
        first_name: "Sarah",
        last_name: "Miller",
        email: "sarah.miller@example.com",
        department: "Engineering",
        position: "Frontend Developer",
        hire_date: "2022-01-10",
        status: "active",
        manager_id: "33333333-3333-3333-3333-333333333333",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      },
      {
        id: "77777777-7777-7777-7777-777777777777",
        first_name: "James",
        last_name: "Wilson",
        email: "james.wilson@example.com",
        department: "Engineering",
        position: "Backend Developer",
        hire_date: "2022-02-15",
        status: "active",
        manager_id: "33333333-3333-3333-3333-333333333333",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
      },
      {
        id: "88888888-8888-8888-8888-888888888888",
        first_name: "Jessica",
        last_name: "Taylor",
        email: "jessica.taylor@example.com",
        department: "Marketing",
        position: "Content Specialist",
        hire_date: "2022-03-20",
        status: "active",
        manager_id: "44444444-4444-4444-4444-444444444444",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica",
      },
      {
        id: "99999999-9999-9999-9999-999999999999",
        first_name: "Robert",
        last_name: "Anderson",
        email: "robert.anderson@example.com",
        department: "Sales",
        position: "Account Executive",
        hire_date: "2022-04-10",
        status: "active",
        manager_id: "55555555-5555-5555-5555-555555555555",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Robert",
      },
      {
        id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        first_name: "Lisa",
        last_name: "Thomas",
        email: "lisa.thomas@example.com",
        department: "HR",
        position: "HR Specialist",
        hire_date: "2022-05-15",
        status: "active",
        manager_id: "22222222-2222-2222-2222-222222222222",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa",
      },
    ]

    // Insert employees
    console.log("Inserting sample employees...")
    const { error: employeesError } = await supabase.from("employees").insert(employees)

    if (employeesError) {
      throw employeesError
    }

    // Sample time off requests
    const timeOffRequests = [
      {
        employee_id: "33333333-3333-3333-3333-333333333333",
        start_date: "2023-07-10",
        end_date: "2023-07-14",
        reason: "Vacation",
        status: "approved",
      },
      {
        employee_id: "44444444-4444-4444-4444-444444444444",
        start_date: "2023-08-01",
        end_date: "2023-08-05",
        reason: "Family event",
        status: "approved",
      },
      {
        employee_id: "66666666-6666-6666-6666-666666666666",
        start_date: "2023-09-20",
        end_date: "2023-09-22",
        reason: "Personal",
        status: "rejected",
      },
      {
        employee_id: "77777777-7777-7777-7777-777777777777",
        start_date: "2023-10-15",
        end_date: "2023-10-19",
        reason: "Vacation",
        status: "approved",
      },
      {
        employee_id: "88888888-8888-8888-8888-888888888888",
        start_date: "2023-11-01",
        end_date: "2023-11-03",
        reason: "Medical appointment",
        status: "approved",
      },
      {
        employee_id: "99999999-9999-9999-9999-999999999999",
        start_date: "2023-12-27",
        end_date: "2023-12-31",
        reason: "Holiday",
        status: "pending",
      },
      {
        employee_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        start_date: "2024-01-15",
        end_date: "2024-01-19",
        reason: "Vacation",
        status: "pending",
      },
    ]

    // Insert time off requests
    console.log("Inserting sample time off requests...")
    const { error: timeOffError } = await supabase.from("time_off_requests").insert(timeOffRequests)

    if (timeOffError) {
      throw timeOffError
    }

    // Sample reviews
    const reviews = [
      {
        employee_id: "33333333-3333-3333-3333-333333333333",
        reviewer_id: "11111111-1111-1111-1111-111111111111",
        review_date: "2023-01-15",
        performance_score: 4,
        comments: "Excellent work on the backend architecture.",
      },
      {
        employee_id: "44444444-4444-4444-4444-444444444444",
        reviewer_id: "11111111-1111-1111-1111-111111111111",
        review_date: "2023-01-20",
        performance_score: 5,
        comments: "Outstanding leadership of the marketing team.",
      },
      {
        employee_id: "55555555-5555-5555-5555-555555555555",
        reviewer_id: "11111111-1111-1111-1111-111111111111",
        review_date: "2023-02-10",
        performance_score: 4,
        comments: "Great job hitting sales targets.",
      },
      {
        employee_id: "66666666-6666-6666-6666-666666666666",
        reviewer_id: "33333333-3333-3333-3333-333333333333",
        review_date: "2023-03-15",
        performance_score: 3,
        comments: "Good progress, but needs improvement in code quality.",
      },
      {
        employee_id: "77777777-7777-7777-7777-777777777777",
        reviewer_id: "33333333-3333-3333-3333-333333333333",
        review_date: "2023-03-20",
        performance_score: 4,
        comments: "Consistently delivers high-quality backend code.",
      },
      {
        employee_id: "88888888-8888-8888-8888-888888888888",
        reviewer_id: "44444444-4444-4444-4444-444444444444",
        review_date: "2023-04-10",
        performance_score: 4,
        comments: "Excellent content creation and campaign management.",
      },
      {
        employee_id: "99999999-9999-9999-9999-999999999999",
        reviewer_id: "55555555-5555-5555-5555-555555555555",
        review_date: "2023-04-15",
        performance_score: 3,
        comments: "Meeting targets but needs to improve client communication.",
      },
      {
        employee_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        reviewer_id: "22222222-2222-2222-2222-222222222222",
        review_date: "2023-05-10",
        performance_score: 4,
        comments: "Excellent handling of employee relations and HR processes.",
      },
    ]

    // Insert reviews
    console.log("Inserting sample reviews...")
    const { error: reviewsError } = await supabase.from("reviews").insert(reviews)

    if (reviewsError) {
      throw reviewsError
    }

    // Sample documents
    const documents = [
      {
        title: "Employee Handbook 2023",
        type: "PDF",
        category: "Policies",
        status: "published",
        created_by: "22222222-2222-2222-2222-222222222222",
        file_url: "https://example.com/documents/employee-handbook.pdf",
      },
      {
        title: "Vacation Policy",
        type: "DOCX",
        category: "Policies",
        status: "published",
        created_by: "22222222-2222-2222-2222-222222222222",
        file_url: "https://example.com/documents/vacation-policy.docx",
      },
      {
        title: "Performance Review Template",
        type: "XLSX",
        category: "Templates",
        status: "published",
        created_by: "22222222-2222-2222-2222-222222222222",
        file_url: "https://example.com/documents/performance-review.xlsx",
      },
      {
        title: "Expense Report Form",
        type: "XLSX",
        category: "Forms",
        status: "published",
        created_by: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        file_url: "https://example.com/documents/expense-report.xlsx",
      },
      {
        title: "Remote Work Guidelines",
        type: "PDF",
        category: "Policies",
        status: "published",
        created_by: "22222222-2222-2222-2222-222222222222",
        file_url: "https://example.com/documents/remote-work.pdf",
      },
      {
        title: "Benefits Overview 2023",
        type: "PDF",
        category: "Benefits",
        status: "published",
        created_by: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        file_url: "https://example.com/documents/benefits.pdf",
      },
      {
        title: "Onboarding Checklist",
        type: "DOCX",
        category: "Templates",
        status: "published",
        created_by: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        file_url: "https://example.com/documents/onboarding.docx",
      },
      {
        title: "Travel Policy Draft",
        type: "DOCX",
        category: "Policies",
        status: "draft",
        created_by: "22222222-2222-2222-2222-222222222222",
        file_url: "https://example.com/documents/travel-policy-draft.docx",
      },
    ]

    // Insert documents
    console.log("Inserting sample documents...")
    const { error: documentsError } = await supabase.from("documents").insert(documents)

    if (documentsError) {
      throw documentsError
    }

    console.log("Database seeding completed successfully")
    return { success: true }
  } catch (error) {
    console.error("Error seeding database:", error)
    return { success: false, error }
  }
}

// Run the seeding
seedDatabase().then((result) => {
  if (result.success) {
    console.log("✅ Database seeded successfully")
  } else {
    console.error("❌ Database seeding failed:", result.error)
  }
})

