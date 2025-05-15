import { NextResponse } from "next/server"
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

// Schema for incoming project data (matches the dialog form, minus the temporary JSON field)
const projectCreateSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  department_id: z.string().uuid(), // Expect UUID
  start_date: z.string().date(), // Expect YYYY-MM-DD
  end_date: z.string().date(),
  budget: z.number().positive().optional().nullable(),
  status: z.string().optional().default('Planning'),
  required_skills: z.array(z.object({ // Expect the parsed array
    skill_id: z.string().uuid(),
    required_proficiency: z.number().min(1).max(5),
    headcount_needed: z.number().int().positive()
  })).optional().default([]),
});

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin.from("projects").select("*").order("start_date", { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Error fetching projects:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate incoming data
    const validation = projectCreateSchema.safeParse(body);
    if (!validation.success) {
      console.error("Project Validation Error:", validation.error.errors);
      return NextResponse.json({ message: "Invalid project data.", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const projectData = validation.data;
    
    console.log("Attempting to create project:", projectData);

    // Insert into Supabase
    const { data, error } = await supabaseAdmin
      .from('projects')
      .insert({
        name: projectData.name,
        description: projectData.description,
        department_id: projectData.department_id,
        start_date: projectData.start_date,
        end_date: projectData.end_date,
        budget: projectData.budget,
        status: projectData.status,
        required_skills: projectData.required_skills, // Insert the parsed JSONB array
      })
      .select() // Select the newly created record
      .single(); // Expect only one record

    if (error) {
      console.error("Supabase Project Insert Error:", error);
      // Provide more specific error messages if possible
      if (error.code === '23503') { // Foreign key violation
         return NextResponse.json({ message: `Invalid department ID: ${projectData.department_id}` }, { status: 400 });
      }
       if (error.code === '23505') { // Unique constraint violation
         return NextResponse.json({ message: `Project with name '${projectData.name}' might already exist.` }, { status: 409 }); // 409 Conflict
      }
      return NextResponse.json({ message: error.message || "Failed to create project in database." }, { status: 500 });
    }

    console.log("Project created successfully:", data);
    return NextResponse.json(data, { status: 201 }); // 201 Created

  } catch (error: any) {
    console.error("[API_PROJECTS_POST_ERROR]", error);
    return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 });
  }
}

