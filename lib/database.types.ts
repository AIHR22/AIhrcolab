export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      employees: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          first_name: string
          last_name: string
          email: string
          position: string
          department_id: string
          status: "active" | "inactive" | "on_leave"
          avatar_url: string | null
          hire_date: string
          salary: number
          manager_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          first_name: string
          last_name: string
          email: string
          position: string
          department_id: string
          status?: "active" | "inactive" | "on_leave"
          avatar_url?: string | null
          hire_date: string
          salary: number
          manager_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          first_name?: string
          last_name?: string
          email?: string
          position?: string
          department_id?: string
          status?: "active" | "inactive" | "on_leave"
          avatar_url?: string | null
          hire_date?: string
          salary?: number
          manager_id?: string | null
        }
      }
      departments: {
        Row: {
          id: string
          name: string
          description: string | null
          manager_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          manager_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          manager_id?: string | null
          created_at?: string
        }
      }
    }
  }
}
