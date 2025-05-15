export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          email: string
          full_name: string | null
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email: string
          full_name?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email?: string
          full_name?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      positions: {
        Row: {
          id: string
          title: string
          department_id: string | null
          level: string | null
          avg_salary: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          department_id?: string | null
          level?: string | null
          avg_salary?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          department_id?: string | null
          level?: string | null
          avg_salary?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "positions_department_id_fkey"
            columns: ["department_id"]
            referencedRelation: "departments"
            referencedColumns: ["id"]
          }
        ]
      }
      departments: {
        Row: {
          id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_manager_id_fkey"
            columns: ["manager_id"]
            referencedRelation: "employees"
            referencedColumns: ["id"]
          }
        ]
      }
      employees: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string
          position_id: string | null
          department_id: string | null
          hire_date: string
          salary: number | null
          performance_score: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          email: string
          position_id?: string | null
          department_id?: string | null
          hire_date: string
          salary?: number | null
          performance_score?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          email?: string
          position_id?: string | null
          department_id?: string | null
          hire_date?: string
          salary?: number | null
          performance_score?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employees_department_id_fkey"
            columns: ["department_id"]
            referencedRelation: "departments"
            referencedColumns: ["id"]
          }
        ]
      }
      employee_skills: {
        Row: {
          id: string
          employee_id: string | null
          skill_id: string | null
          proficiency_level: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employee_id?: string | null
          skill_id?: string | null
          proficiency_level?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employee_id?: string | null
          skill_id?: string | null
          proficiency_level?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_skills_employee_id_fkey"
            columns: ["employee_id"]
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_skills_skill_id_fkey"
            columns: ["skill_id"]
            referencedRelation: "skills"
            referencedColumns: ["id"]
          }
        ]
      }
      skills: {
        Row: {
          id: string
          name: string
          category: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          category?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          start_date: string | null
          end_date: string | null
          budget: number | null
          status: string | null
          priority: string | null
          complexity: string | null
          department_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          start_date?: string | null
          end_date?: string | null
          budget?: number | null
          status?: string | null
          priority?: string | null
          complexity?: string | null
          department_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          start_date?: string | null
          end_date?: string | null
          budget?: number | null
          status?: string | null
          priority?: string | null
          complexity?: string | null
          department_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_skills: {
        Row: {
          id: string
          project_id: string | null
          skill_id: string | null
          required_level: number | null
          required_count: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id?: string | null
          skill_id?: string | null
          required_level?: number | null
          required_count?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string | null
          skill_id?: string | null
          required_level?: number | null
          required_count?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_skills_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_skills_skill_id_fkey"
            columns: ["skill_id"]
            referencedRelation: "skills"
            referencedColumns: ["id"]
          }
        ]
      }
      project_allocations: {
        Row: {
          id: string
          project_id: string | null
          employee_id: string | null
          allocation_percentage: number | null
          start_date: string | null
          end_date: string | null
          role: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id?: string | null
          employee_id?: string | null
          allocation_percentage?: number | null
          start_date?: string | null
          end_date?: string | null
          role?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string | null
          employee_id?: string | null
          allocation_percentage?: number | null
          start_date?: string | null
          end_date?: string | null
          role?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_allocations_employee_id_fkey"
            columns: ["employee_id"]
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_allocations_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "projects"
            referencedColumns: ["id"]
          }
        ]
      }
      payroll: {
        Row: {
          id: string
          employee_id: string
          base_salary: number
          bonus: number
          deductions: number
          net_salary: number
          payment_date: string
          payment_period_start: string
          payment_period_end: string
          status: string
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          employee_id: string
          base_salary: number
          bonus: number
          deductions: number
          net_salary: number
          payment_date: string
          payment_period_start: string
          payment_period_end: string
          status: string
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          employee_id?: string
          base_salary?: number
          bonus?: number
          deductions?: number
          net_salary?: number
          payment_date?: string
          payment_period_start?: string
          payment_period_end?: string
          status?: string
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payroll_employee_id_fkey"
            columns: ["employee_id"]
            referencedRelation: "employees"
            referencedColumns: ["id"]
          }
        ]
      }
      salary_components: {
        Row: {
          id: string
          name: string
          type: string
          description: string | null
          is_taxable: boolean
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          type: string
          description?: string | null
          is_taxable: boolean
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          type?: string
          description?: string | null
          is_taxable?: boolean
          created_at?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      payroll_components: {
        Row: {
          id: string
          payroll_id: string
          component_id: string
          amount: number
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          payroll_id: string
          component_id: string
          amount: number
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          payroll_id?: string
          component_id?: string
          amount?: number
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payroll_components_component_id_fkey"
            columns: ["component_id"]
            referencedRelation: "salary_components"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_components_payroll_id_fkey"
            columns: ["payroll_id"]
            referencedRelation: "payroll"
            referencedColumns: ["id"]
          }
        ]
      }
      payslips: {
        Row: {
          id: string
          payroll_id: string
          file_url: string
          generated_at: string
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          payroll_id: string
          file_url: string
          generated_at: string
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          payroll_id?: string
          file_url?: string
          generated_at?: string
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payslips_payroll_id_fkey"
            columns: ["payroll_id"]
            referencedRelation: "payroll"
            referencedColumns: ["id"]
          }
        ]
      }
      revenue: {
        Row: {
          id: string
          year: number
          month: number
          amount: number
          category: string
          source: string
          notes: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          year: number
          month: number
          amount: number
          category: string
          source: string
          notes?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          year?: number
          month?: number
          amount?: number
          category?: string
          source?: string
          notes?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      revenue_forecasts: {
        Row: {
          id: string
          year: number
          month: number
          predicted_amount: number
          confidence_score: number
          factors: Json
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          year: number
          month: number
          predicted_amount: number
          confidence_score: number
          factors: Json
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          year?: number
          month?: number
          predicted_amount?: number
          confidence_score?: number
          factors?: Json
          created_at?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      revenue_metrics: {
        Row: {
          id: string
          year: number
          month: number
          total_revenue: number
          total_payroll: number
          profit_margin: number
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          year: number
          month: number
          total_revenue: number
          total_payroll: number
          profit_margin: number
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          year?: number
          month?: number
          total_revenue?: number
          total_payroll?: number
          profit_margin?: number
          created_at?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      workforce_forecasts: {
        Row: {
          id: string
          department_id: string
          forecast_date: string
          forecast_type: string
          headcount_prediction: number
          confidence_score: number
          factors: Json
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          department_id: string
          forecast_date: string
          forecast_type: string
          headcount_prediction: number
          confidence_score: number
          factors: Json
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          department_id?: string
          forecast_date?: string
          forecast_type?: string
          headcount_prediction?: number
          confidence_score?: number
          factors?: Json
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workforce_forecasts_department_id_fkey"
            columns: ["department_id"]
            referencedRelation: "departments"
            referencedColumns: ["id"]
          }
        ]
      }
      skill_gap_analysis: {
        Row: {
          id: string
          department_id: string | null
          analysis_date: string
          results: Json
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          department_id?: string | null
          analysis_date: string
          results: Json
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          department_id?: string | null
          analysis_date?: string
          results?: Json
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "skill_gap_analysis_department_id_fkey"
            columns: ["department_id"]
            referencedRelation: "departments"
            referencedColumns: ["id"]
          }
        ]
      }
      workload_analysis: {
        Row: {
          id: string
          employee_id: string
          analysis_date: string
          utilization_percentage: number
          overallocated: boolean
          underallocated: boolean
          recommendation: string
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          employee_id: string
          analysis_date: string
          utilization_percentage: number
          overallocated: boolean
          underallocated: boolean
          recommendation: string
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          employee_id?: string
          analysis_date?: string
          utilization_percentage?: number
          overallocated?: boolean
          underallocated?: boolean
          recommendation?: string
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workload_analysis_employee_id_fkey"
            columns: ["employee_id"]
            referencedRelation: "employees"
            referencedColumns: ["id"]
          }
        ]
      }
      project_feasibility: {
        Row: {
          id: string
          project_name: string
          analysis_date: string
          start_date: string
          end_date: string
          feasibility_score: number
          resource_gap: Json
          skill_gap: Json
          recommendation: string
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          project_name: string
          analysis_date: string
          start_date: string
          end_date: string
          feasibility_score: number
          resource_gap: Json
          skill_gap: Json
          recommendation: string
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          project_name?: string
          analysis_date?: string
          start_date?: string
          end_date?: string
          feasibility_score?: number
          resource_gap?: Json
          skill_gap?: Json
          recommendation?: string
          created_at?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      employee_performance: {
        Row: {
          id: string
          employee_id: string | null
          review_date: string
          performance_score: number | null
          satisfaction_score: number | null
          workload_score: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employee_id?: string | null
          review_date: string
          performance_score?: number | null
          satisfaction_score?: number | null
          workload_score?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employee_id?: string | null
          review_date?: string
          performance_score?: number | null
          satisfaction_score?: number | null
          workload_score?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      workforce_plans: {
        Row: {
          id: string
          project_id: string | null
          department_id: string | null
          plan_date: string
          required_headcount: number | null
          current_headcount: number | null
          forecasted_headcount: number | null
          attrition_rate: number | null
          growth_rate: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id?: string | null
          department_id?: string | null
          plan_date: string
          required_headcount?: number | null
          current_headcount?: number | null
          forecasted_headcount?: number | null
          attrition_rate?: number | null
          growth_rate?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string | null
          department_id?: string | null
          plan_date?: string
          required_headcount?: number | null
          current_headcount?: number | null
          forecasted_headcount?: number | null
          attrition_rate?: number | null
          growth_rate?: number | null
          created_at?: string
          updated_at?: string
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Export convenience types for common tables
export type Employee = Database['public']['Tables']['employees']['Row']
export type TimeOffRequest = Database['public']['Tables']['time_off_requests']['Row']
export type Review = Database['public']['Tables']['employee_performance']['Row']
