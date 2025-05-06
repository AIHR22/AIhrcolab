export type Database = {
  public: {
    Tables: {
      revenue_data: {
        Row: {
          id: string
          period_date: string
          amount: number
          is_projected: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          period_date: string
          amount: number
          is_projected: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          period_date?: string
          amount?: number
          is_projected?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      revenue_model_params: {
        Row: {
          id: string
          employee_count: number
          avg_salary: number
          growth_rate: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employee_count: number
          avg_salary: number
          growth_rate: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employee_count?: number
          avg_salary?: number
          growth_rate?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
} 