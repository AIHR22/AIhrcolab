export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          user_id: string
          email: string
          name: string | null
          role: string
          is_platform_admin: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email: string
          name?: string | null
          role?: string
          is_platform_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email?: string
          name?: string | null
          role?: string
          is_platform_admin?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      tenant_users: {
        Row: {
          id: string
          user_id: string
          role: 'client_admin' | 'sub_user'
          created_at: string
          updated_at: string
          tenant_id: string
        }
        Insert: {
          id?: string
          user_id: string
          role: 'client_admin' | 'sub_user'
          created_at?: string
          updated_at?: string
          tenant_id: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: 'client_admin' | 'sub_user'
          created_at?: string
          updated_at?: string
          tenant_id?: string
        }
      }
      tenants: {
        Row: {
          id: string
          status: string
          created_at: string
          updated_at: string
          company_id: string | null
          is_default: boolean
        }
        Insert: {
          id?: string
          status?: string
          created_at?: string
          updated_at?: string
          company_id?: string | null
          is_default?: boolean
        }
        Update: {
          id?: string
          status?: string
          created_at?: string
          updated_at?: string
          company_id?: string | null
          is_default?: boolean
        }
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          email_notifications: boolean | null
          notification_frequency: string | null
          timezone: string | null
          dark_mode: boolean | null
          language: string | null
          two_factor_auth: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email_notifications?: boolean | null
          notification_frequency?: string | null
          timezone?: string | null
          dark_mode?: boolean | null
          language?: string | null
          two_factor_auth?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email_notifications?: boolean | null
          notification_frequency?: string | null
          timezone?: string | null
          dark_mode?: boolean | null
          language?: string | null
          two_factor_auth?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
