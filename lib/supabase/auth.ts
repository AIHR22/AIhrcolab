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
    // Step 1: Create the user in auth.users
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

    const userId = authData.user.id

    // Step 2: Create company
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .insert({
        name: 'My Company',
        tier: 'starter',
        max_users: 5
      })
      .select('id')
      .single()

    if (companyError) {
      console.error('Error creating company:', companyError)
      throw companyError
    }

    // Step 3: Get tenant ID (created by fn_default_tenant trigger)
    const { data: tenantData, error: tenantError } = await supabase
      .from('tenants')
      .select('id')
      .eq('company_id', companyData.id)
      .single()

    if (tenantError) {
      console.error('Error getting tenant:', tenantError)
      throw tenantError
    }

    // Step 4: Create tenant user
    const { error: tenantUserError } = await supabase
      .from('tenant_users')
      .insert({
        user_id: userId,
        tenant_id: tenantData.id,
        role: 'client_admin'
      })

    if (tenantUserError) {
      console.error('Error creating tenant user:', tenantUserError)
      throw tenantUserError
    }

    // Step 5: Create user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: userId,
        email: email,
        full_name: fullName
      })

    if (profileError) {
      console.error('Error creating user profile:', profileError)
      throw profileError
    }

    return {
      success: true,
      user: authData.user,
      message: 'Please check your email for verification link'
    }

  } catch (error) {
    console.error('Signup process failed:', error)
    throw error
  }
} 