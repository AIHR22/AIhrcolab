import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function initLearningTables() {
  try {
    // Create courses table
    const { error: coursesError } = await supabase.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        level VARCHAR(50) NOT NULL,
        duration_hours INTEGER NOT NULL,
        category VARCHAR(100) NOT NULL,
        thumbnail_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
        created_by UUID REFERENCES employees(id),
        status VARCHAR(50) DEFAULT 'active'
      );
    `)

    if (coursesError) throw coursesError

    // Create course_content table for modules and lessons
    const { error: contentError } = await supabase.query(`
      CREATE TABLE IF NOT EXISTS course_content (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        content_type VARCHAR(50) NOT NULL,
        content TEXT,
        order_index INTEGER NOT NULL,
        duration_minutes INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
      );
    `)

    if (contentError) throw contentError

    // Create course_enrollments table
    const { error: enrollmentsError } = await supabase.query(`
      CREATE TABLE IF NOT EXISTS course_enrollments (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
        employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
        enrollment_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
        completion_date TIMESTAMP WITH TIME ZONE,
        status VARCHAR(50) DEFAULT 'in_progress',
        progress INTEGER DEFAULT 0,
        UNIQUE(course_id, employee_id)
      );
    `)

    if (enrollmentsError) throw enrollmentsError

    // Create course_progress table for tracking individual module completion
    const { error: progressError } = await supabase.query(`
      CREATE TABLE IF NOT EXISTS course_progress (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        enrollment_id UUID REFERENCES course_enrollments(id) ON DELETE CASCADE,
        content_id UUID REFERENCES course_content(id) ON DELETE CASCADE,
        completed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
        UNIQUE(enrollment_id, content_id)
      );
    `)

    if (progressError) throw progressError

    // Create learning_paths table
    const { error: pathsError } = await supabase.query(`
      CREATE TABLE IF NOT EXISTS learning_paths (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
        created_by UUID REFERENCES employees(id),
        status VARCHAR(50) DEFAULT 'active'
      );
    `)

    if (pathsError) throw pathsError

    // Create learning_path_courses table for mapping courses to paths
    const { error: pathCoursesError } = await supabase.query(`
      CREATE TABLE IF NOT EXISTS learning_path_courses (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE,
        course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
        order_index INTEGER NOT NULL,
        UNIQUE(path_id, course_id)
      );
    `)

    if (pathCoursesError) throw pathCoursesError

    // Create certifications table
    const { error: certificationsError } = await supabase.query(`
      CREATE TABLE IF NOT EXISTS certifications (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
        course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
        certification_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
        expiry_date TIMESTAMP WITH TIME ZONE,
        certificate_url TEXT,
        status VARCHAR(50) DEFAULT 'active'
      );
    `)

    if (certificationsError) throw certificationsError

    // Create skills table
    const { error: skillsError } = await supabase.query(`
      CREATE TABLE IF NOT EXISTS skills (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        description TEXT,
        UNIQUE(name)
      );
    `)

    if (skillsError) throw skillsError

    // Create course_skills table for mapping skills to courses
    const { error: courseSkillsError } = await supabase.query(`
      CREATE TABLE IF NOT EXISTS course_skills (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
        skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
        UNIQUE(course_id, skill_id)
      );
    `)

    if (courseSkillsError) throw courseSkillsError

    // Create employee_skills table for tracking employee skills
    const { error: employeeSkillsError } = await supabase.query(`
      CREATE TABLE IF NOT EXISTS employee_skills (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
        skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
        proficiency_level INTEGER CHECK (proficiency_level BETWEEN 1 AND 5),
        acquired_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
        UNIQUE(employee_id, skill_id)
      );
    `)

    if (employeeSkillsError) throw employeeSkillsError

    console.log("✅ Learning module tables created successfully")
    return { success: true }
  } catch (error) {
    console.error("Error creating learning tables:", error)
    return { success: false, error }
  }
}

// Run the initialization
initLearningTables().then((result) => {
  if (result.success) {
    console.log("✅ Learning module database initialization completed")
  } else {
    console.error("❌ Learning module database initialization failed:", result.error)
  }
})

