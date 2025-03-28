export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      employees: {
        Row: {
          id: string
          created_at: string
          name: string
          email: string
          position: string
          department: string
          avatar_url: string | null
          start_date: string
          manager_id: string | null
          salary: number
          status: "active" | "inactive" | "on_leave"
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          email: string
          position: string
          department: string
          avatar_url?: string | null
          start_date: string
          manager_id?: string | null
          salary: number
          status?: "active" | "inactive" | "on_leave"
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          email?: string
          position?: string
          department?: string
          avatar_url?: string | null
          start_date?: string
          manager_id?: string | null
          salary?: number
          status?: "active" | "inactive" | "on_leave"
        }
      }
      time_off_requests: {
        Row: {
          id: string
          created_at: string
          employee_id: string
          type: "vacation" | "sick" | "personal" | "other"
          start_date: string
          end_date: string
          status: "pending" | "approved" | "rejected"
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          employee_id: string
          type: "vacation" | "sick" | "personal" | "other"
          start_date: string
          end_date: string
          status?: "pending" | "approved" | "rejected"
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          employee_id?: string
          type?: "vacation" | "sick" | "personal" | "other"
          start_date?: string
          end_date?: string
          status?: "pending" | "approved" | "rejected"
          notes?: string | null
        }
      }
      reviews: {
        Row: {
          id: string
          created_at: string
          employee_id: string
          reviewer_id: string
          review_type: "performance" | "probation" | "salary"
          scheduled_date: string
          status: "scheduled" | "completed" | "cancelled"
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          employee_id: string
          reviewer_id: string
          review_type: "performance" | "probation" | "salary"
          scheduled_date: string
          status?: "scheduled" | "completed" | "cancelled"
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          employee_id?: string
          reviewer_id?: string
          review_type?: "performance" | "probation" | "salary"
          scheduled_date?: string
          status?: "scheduled" | "completed" | "cancelled"
          notes?: string | null
        }
      }
      projects: {
        Row: {
          id: string
          created_at: string
          name: string
          description: string | null
          start_date: string
          end_date: string | null
          status: "planning" | "in_progress" | "completed" | "on_hold"
          budget: number | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          description?: string | null
          start_date: string
          end_date?: string | null
          status?: "planning" | "in_progress" | "completed" | "on_hold"
          budget?: number | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          description?: string | null
          start_date?: string
          end_date?: string | null
          status?: "planning" | "in_progress" | "completed" | "on_hold"
          budget?: number | null
        }
      }
      project_members: {
        Row: {
          id: string
          created_at: string
          project_id: string
          employee_id: string
          role: string
        }
        Insert: {
          id?: string
          created_at?: string
          project_id: string
          employee_id: string
          role: string
        }
        Update: {
          id?: string
          created_at?: string
          project_id?: string
          employee_id?: string
          role?: string
        }
      }
      company_settings: {
        Row: {
          id: string
          created_at: string
          name: string
          logo_url: string | null
          primary_color: string | null
          secondary_color: string | null
          address: string | null
          phone: string | null
          email: string | null
          website: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          address?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          address?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

