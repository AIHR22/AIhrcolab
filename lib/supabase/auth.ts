import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

interface SignUpParams {
  email: string
  password: string
  fullName: string
}

export async function signUpUser({ email, password, fullName }: SignUpParams) {
  try {
    // Create the user in auth.users - the database trigger will handle all setup
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })

    if (authError) {
      console.error('Error creating user:', authError)
      throw authError
    }

    if (!authData.user) {
      throw new Error('No user data returned after signup')
    }

    return {
      success: true,
      user: authData.user,
      message: 'Account created successfully!'
    }

  } catch (error) {
    console.error('Signup process failed:', error)
    throw error
  }
} 