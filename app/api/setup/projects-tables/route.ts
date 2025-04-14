import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST() {
  try {
    // Create projects table
    const createProjectsTable = await supabaseAdmin.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(100) NOT NULL,
        description TEXT,
        start_date DATE,
        end_date DATE,
        status VARCHAR(20) DEFAULT 'Planning',
        budget DECIMAL(12,2),
        department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `)

    // Create skills table if it doesn't exist
    const createSkillsTable = await supabaseAdmin.query(`
      CREATE TABLE IF NOT EXISTS skills (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        category VARCHAR(50),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `)

    // Create employee_skills table if it doesn't exist
    const createEmployeeSkillsTable = await supabaseAdmin.query(`
      CREATE TABLE IF NOT EXISTS employee_skills (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
        skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
        proficiency_level INT NOT NULL DEFAULT 1,
        years_experience DECIMAL(4,1),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(employee_id, skill_id)
      );
    `)

    // Create project_allocations table if it doesn't exist
    const createProjectAllocationsTable = await supabaseAdmin.query(`
      CREATE TABLE IF NOT EXISTS project_allocations (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
        allocation_percentage INT NOT NULL DEFAULT 100,
        start_date DATE,
        end_date DATE,
        role VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(project_id, employee_id)
      );
    `)

    // Insert some sample skills
    const insertSkills = await supabaseAdmin.query(`
      INSERT INTO skills (name, category, description)
      VALUES 
        ('JavaScript', 'Programming', 'JavaScript programming language'),
        ('React', 'Frontend', 'React.js library'),
        ('Node.js', 'Backend', 'Node.js runtime'),
        ('Python', 'Programming', 'Python programming language'),
        ('Machine Learning', 'Data Science', 'Machine learning and AI'),
        ('Cloud Architecture', 'Infrastructure', 'Cloud infrastructure design'),
        ('DevOps', 'Infrastructure', 'Development operations'),
        ('UI/UX Design', 'Design', 'User interface and experience design'),
        ('Mobile Development', 'Programming', 'Mobile app development'),
        ('Project Management', 'Management', 'Project planning and execution')
      ON CONFLICT (name) DO NOTHING;
    `)

    // Insert some sample projects
    const insertProjects = await supabaseAdmin.query(`
      INSERT INTO projects (name, description, start_date, end_date, status, budget)
      VALUES 
        ('Website Redesign', 'Redesign the company website with modern UI/UX', '2023-01-01', '2023-06-30', 'In Progress', 150000),
        ('Mobile App Development', 'Develop a new mobile app for customers', '2023-03-15', '2023-12-31', 'Planning', 250000),
        ('Cloud Migration', 'Migrate on-premise infrastructure to the cloud', '2023-02-01', '2023-08-31', 'In Progress', 300000),
        ('AI Recommendation Engine', 'Build an AI-powered recommendation engine', '2023-05-01', '2024-01-31', 'Planning', 400000),
        ('Data Warehouse Implementation', 'Implement a new data warehouse', '2023-04-01', '2023-10-31', 'On Hold', 350000)
      ON CONFLICT DO NOTHING;
    `)

    return NextResponse.json({
      success: true,
      message: "Projects and related tables created successfully",
    })
  } catch (error: any) {
    console.error("Error creating projects tables:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}

