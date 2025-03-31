import type { Department } from "@/types/organization"
import type { Employee } from "@/types/employees"
import type { Skill } from "@/types/workforce-planning"

export interface SkillRequirement {
  skill_id: string
  skill_name?: string
  required_level: number
  required_count: number
}

export interface WorkforcePlan {
  id: string
  name: string
  description?: string
  department_id: string
  start_date: string
  end_date: string
  status: "draft" | "active" | "completed" | "cancelled"
  required_skills: SkillRequirement[]
  created_at: string
  updated_at: string
  department?: Department
  budget_amount?: number
  department_name?: string
}

export interface ResourceAllocation {
  id: string
  plan_id: string
  employee_id: string
  role: string
  allocation_percentage: number
  start_date: string
  end_date: string
  created_at: string
  updated_at: string
  employee?: Employee
}

export interface SkillGapAnalysisResult {
  skill_id: string
  skill_name: string
  required_count: number
  available_count: number
  gap: number
  severity: "Critical" | "High" | "Medium" | "Low" | "None"
  recommendation?: string
}

export interface ResourceGapAnalysisResult {
  total_employees_needed: number
  available_employees: number
  gap: number
  utilization_percentage: number
  cost_impact: number
}

export interface WorkforcePlanningAnalysis {
  plan_id: string
  analysis_date: string
  feasibility_score: number
  resource_gap: ResourceGapAnalysisResult
  skill_gaps: SkillGapAnalysisResult[]
  recommendations: string[]
  risk_factors: string[]
  cost_analysis: {
    hiring_costs: number
    training_costs: number
    total_costs: number
    roi_estimate: number
  }
  created_at: string
  updated_at: string
}
