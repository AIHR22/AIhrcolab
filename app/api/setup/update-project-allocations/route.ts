import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

    // Create new table with correct schema
    const { error: createError } = await supabaseAdmin
      .from('project_allocations_new')
      .insert([]) // This will create the table with the schema

    if (createError && !createError.message.includes('relation "project_allocations_new" does not exist')) {
      console.error("Error creating new table:", createError)
      throw createError
    }

    // Copy data from old table to new table
    const { data: oldData, error: fetchError } = await supabaseAdmin
      .from('project_allocations')
      .select('*')

    if (fetchError) {
      console.error("Error fetching old data:", fetchError)
      throw fetchError
    }

    if (oldData && oldData.length > 0) {
      const { error: insertError } = await supabaseAdmin
        .from('project_allocations_new')
        .insert(oldData)

      if (insertError) {
        console.error("Error copying data:", insertError)
        throw insertError
      }
    }

    // Drop old table
    const { error: dropError } = await supabaseAdmin
      .from('project_allocations')
      .delete()
      .neq('id', '') // Delete all records

    if (dropError) {
      console.error("Error dropping old table:", dropError)
      throw dropError
    }

    // Rename new table
    const { error: renameError } = await supabaseAdmin
      .from('project_allocations_new')
      .update({ table_name: 'project_allocations' })
      .single()

    if (renameError) {
      console.error("Error renaming table:", renameError)
      throw renameError
    }

    return NextResponse.json({ success: true, message: "Project allocations table updated successfully" })
  } catch (error: any) {
    console.error("Error updating project_allocations table:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
} 