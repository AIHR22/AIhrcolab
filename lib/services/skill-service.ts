import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export const skillService = {
  // Get all skills
  async getAll() {
    const { data, error } = await supabase
      .from("skills")
      .select("id, name, category, description")
      .order("name")

    if (error) {
      console.error("Error fetching skills:", error)
      throw error
    }

    return data
  },

  // Get a skill by ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from("skills")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      console.error(`Error fetching skill with ID ${id}:`, error)
      throw error
    }

    return data
  },

  // Create a new skill
  async create(skill: { name: string; category?: string; description?: string }) {
    const { data, error } = await supabase
      .from("skills")
      .insert(skill)
      .select()
      .single()

    if (error) {
      console.error("Error creating skill:", error)
      throw error
    }

    return data
  },

  // Update a skill
  async update(id: string, skill: { name?: string; category?: string; description?: string }) {
    const { data, error } = await supabase
      .from("skills")
      .update(skill)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error(`Error updating skill with ID ${id}:`, error)
      throw error
    }

    return data
  },

  // Delete a skill
  async delete(id: string) {
    const { error } = await supabase
      .from("skills")
      .delete()
      .eq("id", id)

    if (error) {
      console.error(`Error deleting skill with ID ${id}:`, error)
      throw error
    }

    return true
  }
} 