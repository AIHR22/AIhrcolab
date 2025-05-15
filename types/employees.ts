export interface Employee {
  id: string
  employee_id: string
  name: string
  email: string
  phone?: string
  position: string
  department_id: string
  status: "active" | "on_leave" | "terminated"
  hire_date: string
  termination_date?: string
  salary: number
  address?: string
  emergency_contact?: string
  notes?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface EmployeePerformance {
  id: string
  employee_id: string
  review_date: string
  reviewer_id: string
  rating: number
  strengths: string
  areas_for_improvement: string
  goals: string
  comments: string
  created_at: string
  updated_at: string
}

export interface EmployeeEducation {
  id: string
  employee_id: string
  institution: string
  degree: string
  field_of_study: string
  start_date: string
  end_date?: string
  is_current: boolean
  created_at: string
  updated_at: string
}

export interface EmployeeSkill {
  id: string
  employee_id: string
  skill_name: string
  proficiency_level: "beginner" | "intermediate" | "advanced" | "expert"
  years_of_experience: number
  created_at: string
  updated_at: string
}

