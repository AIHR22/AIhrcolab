import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function initDatabase() {
  console.log("Initializing HR Suite database...")

  try {
    // Create employees table
    console.log("Creating employees table...")
    const { error: employeesError } = await supabase.rpc("create_employees_table", {})

    if (employeesError) {
      // If RPC doesn't exist, create table with SQL
      const { error } = await supabase.from("employees").select("count").limit(1)

      if (error && error.code === "42P01") {
        // Table doesn't exist, create it
        const { error: createError } = await supabase.sql`
          CREATE TABLE IF NOT EXISTS employees (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            department TEXT NOT NULL,
            position TEXT NOT NULL,
            hire_date DATE NOT NULL,
            manager_id UUID REFERENCES employees(id),
            status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'on_leave')),
            avatar_url TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
          )
        `

        if (createError) {
          throw createError
        }

        console.log("Employees table created successfully")
      } else if (error) {
        throw error
      } else {
        console.log("Employees table already exists")
      }
    } else {
      console.log("Employees table created successfully via RPC")
    }

    // Create time_off_requests table
    console.log("Creating time_off_requests table...")
    const { error: timeOffError } = await supabase.from("time_off_requests").select("count").limit(1)

    if (timeOffError && timeOffError.code === "42P01") {
      // Table doesn't exist, create it
      const { error: createError } = await supabase.sql`
        CREATE TABLE IF NOT EXISTS time_off_requests (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          employee_id UUID REFERENCES employees(id) NOT NULL,
          start_date DATE NOT NULL,
          end_date DATE NOT NULL,
          reason TEXT NOT NULL,
          status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        )
      `

      if (createError) {
        throw createError
      }

      console.log("Time off requests table created successfully")
    } else if (timeOffError) {
      throw timeOffError
    } else {
      console.log("Time off requests table already exists")
    }

    // Create reviews table
    console.log("Creating reviews table...")
    const { error: reviewsError } = await supabase.from("reviews").select("count").limit(1)

    if (reviewsError && reviewsError.code === "42P01") {
      // Table doesn't exist, create it
      const { error: createError } = await supabase.sql`
        CREATE TABLE IF NOT EXISTS reviews (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          employee_id UUID REFERENCES employees(id) NOT NULL,
          reviewer_id UUID REFERENCES employees(id) NOT NULL,
          review_date DATE NOT NULL,
          performance_score INTEGER NOT NULL CHECK (performance_score BETWEEN 1 AND 5),
          comments TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        )
      `

      if (createError) {
        throw createError
      }

      console.log("Reviews table created successfully")
    } else if (reviewsError) {
      throw reviewsError
    } else {
      console.log("Reviews table already exists")
    }

    // Create documents table
    console.log("Creating documents table...")
    const { error: documentsError } = await supabase.from("documents").select("count").limit(1)

    if (documentsError && documentsError.code === "42P01") {
      // Table doesn't exist, create it
      const { error: createError } = await supabase.sql`
        CREATE TABLE IF NOT EXISTS documents (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          title TEXT NOT NULL,
          type TEXT NOT NULL,
          category TEXT NOT NULL,
          file_url TEXT,
          status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'archived')),
          created_by UUID REFERENCES employees(id),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        )
      `

      if (createError) {
        throw createError
      }

      console.log("Documents table created successfully")
    } else if (documentsError) {
      throw documentsError
    } else {
      console.log("Documents table already exists")
    }

    console.log("Database initialization completed successfully")
    return { success: true }
  } catch (error) {
    console.error("Error initializing database:", error)
    return { success: false, error }
  }
}

// Run the initialization
initDatabase().then((result) => {
  if (result.success) {
    console.log("✅ All tables created successfully")
  } else {
    console.error("❌ Database initialization failed:", result.error)
  }
})

