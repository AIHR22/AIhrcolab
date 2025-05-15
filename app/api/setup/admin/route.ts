import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function POST(request: Request) {
  try {
    console.log("Starting admin user creation...")

    const { email, password } = await request.json()

    if (!email || !password) {
      console.log("Missing email or password")
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Create admin user
    console.log("Creating admin user with email:", email)
    const { data: userData, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role: "admin",
        full_name: `Admin ${email.split("@")[0]}`,
      },
    })

    if (createUserError) {
      console.error("Error creating admin user:", createUserError)
      return NextResponse.json({ error: createUserError.message }, { status: 500 })
    }

    console.log("Admin user created successfully:", userData.user.id)

    // Check if profiles table exists
    const { error: tableCheckError } = await supabaseAdmin
      .from("profiles")
      .select("count(*)", { count: "exact", head: true })

    if (tableCheckError) {
      console.error("Profiles table does not exist:", tableCheckError)
      return NextResponse.json(
        { error: "Profiles table does not exist. Please run the setup SQL script first." },
        { status: 500 },
      )
    }

    // Insert admin profile
    console.log("Inserting admin profile...")
    const { error: profileError } = await supabaseAdmin.from("profiles").insert({
      user_id: userData.user.id,
      email: userData.user.email,
      full_name: `Admin ${email.split("@")[0]}`,
      role: "admin",
    })

    if (profileError) {
      console.error("Error creating admin profile:", profileError)
      return NextResponse.json({ error: "Failed to create admin profile", details: profileError }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Admin user created successfully",
      userId: userData.user.id,
    })
  } catch (error: any) {
    console.error("Admin creation error:", error)
    return NextResponse.json({ error: error.message || "Failed to create admin user" }, { status: 500 })
  }
}

