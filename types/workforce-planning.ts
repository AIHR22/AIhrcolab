import type { Database } from "./supabase"
import type { Department } from "./organization"
import type { Employee } from "./employees"

export type Project = Database["public"]["Tables"]["projects"]["Row"]
export type ProjectInsert = Database["public"]["Tables"]["projects"]["Insert"]
export type ProjectUpdate = Database["public"]["Tables"]["projects"]["Update"]

export type ProjectAllocation = Database["public"]["Tables"]["project_allocations"]["Row"] & {
  allocation_percentage: number
}
export type ProjectAllocationInsert = Database["public"]["Tables"]["project_allocations"]["Insert"]
export type ProjectAllocationUpdate = Database["public"]["Tables"]["project_allocations"]["Update"]

export type Skill = Database["public"]["Tables"]["skills"]["Row"]
export type SkillInsert = Database["public"]["Tables"]["skills"]["Insert"]
export type SkillUpdate = Database["public"]["Tables"]["skills"]["Update"]

export type EmployeeSkill = Database["public"]["Tables"]["employee_skills"]["Row"]
export type EmployeeSkillInsert = Database["public"]["Tables"]["employee_skills"]["Insert"]
export type EmployeeSkillUpdate = Database["public"]["Tables"]["employee_skills"]["Update"]

export type ProjectSkill = {
  id: string
  project_id: string
  skill_id: string
  required_level: number
  required_count: number
  created_at: string
  updated_at: string
  skill?: Skill
}

export type WorkforceForecast = {
  id: string
  department_id: string | null
  forecast_date: string
  forecast_type: string
  headcount_prediction: number
  confidence_score: number | null
  factors: any | null
  created_at: string
  updated_at: string
  department?: Department
}

export type SkillGapAnalysis = {
  id: string
  skill_id: string
  department_id: string | null
  current_headcount: number
  required_headcount: number
  gap: number
  priority: string | null
  recommendation: string | null
  estimated_cost: number | null
  created_at: string
  updated_at: string
  skill?: Skill
  department?: Department
}

export type WorkloadAnalysis = {
  id: string
  employee_id: string
  analysis_date: string
  utilization_percentage: number
  overallocated: boolean
  underallocated: boolean
  recommendation: string | null
  created_at: string
  updated_at: string
  employee?: Employee
}

export type HiringRecommendation = {
  id: string
  project_id: string | null
  department_id: string | null
  position_title: string
  count: number
  urgency: string | null
  estimated_salary: number | null
  estimated_cost: number | null
  justification: string | null
  status: string
  created_at: string
  updated_at: string
  project?: Project
  department?: Department
}

export type AIRecommendations = {
  assessment: string
  recommendations: string[]
  risk_factors: string[]
  cost_analysis: {
    hiring_costs: number
    training_costs: number
    timeline_impact_days: number
  }
  mitigation_strategies?: string[]
  department_impact?: {
    most_affected: string[]
    impact_description: string
  }
}

export type ProjectFeasibility = {
  id: string
  project_name: string
  analysis_date: string
  start_date: string
  end_date: string
  feasibility_score: number
  resource_gap: {
    total_employees_needed: number
    available_employees: number
    gap: number
  }
  skill_gap: Array<{
    skill_id: string
    skill_name?: string
    required_count: number
    available_count: number
    gap: number
    severity: "Critical" | "High" | "Medium" | "Low" | "None"
  }>
  recommendation: string
  ai_recommendations: AIRecommendations
  created_at: string
  updated_at: string
  project?: Project
}

export type ProjectFeasibilityResult = {
  id: string
  feasibility_score: number
  resource_gap: {
    total_employees_needed: number
    available_employees: number
    gap: number
  }
  skill_gaps: Array<{
    skill_id: string
    skill_name?: string
    required_count: number
    available_count: number
    gap: number
    severity: "Critical" | "High" | "Medium" | "Low" | "None"
  }>
  recommendations: string[]
  risk_factors: string[]
  cost_analysis: {
    hiring_costs: number
    training_costs: number
    timeline_impact_days: number
  }
  mitigation_strategies?: string[]
  department_impact?: {
    most_affected: string[]
    impact_description: string
  }
  created_at: string
}

export type ProjectWithSkills = Project & {
  required_skills?: ProjectSkill[]
}

export type ProjectFeasibilityRequest = {
  project_name: string
  start_date: string
  end_date: string
  description?: string
  required_skills: Array<{
    skill_id: string
    skill_name?: string
    required_level: number
    required_count: number
  }>
  budget?: number
}

export type WorkforceOptimizationRequest = {
  department_id?: string
  project_id?: string
  time_frame?: string
}

export type HiringRecommendationRequest = {
  project_id?: string
  department_id?: string
  skills_needed?: Array<{
    skill_id: string
    count: number
    level: number
  }>
}

export type WorkloadBalancingRequest = {
  department_id?: string
  project_id?: string
  date_range?: {
    start_date: string
    end_date: string
  }
}
