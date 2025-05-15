/**
 * Client-side utilities for accessing workforce planning API endpoints
 */

export type TimePeriod = "monthly" | "quarterly" | "annual";

// Helper types
interface SkillRequirement {
  skill_id: string;
  skill_name?: string;
  required_level: number;
  required_count: number;
  available_count?: number;
  gap?: number;
  severity?: "Critical" | "High" | "Medium" | "Low" | "None";
}

// Workforce Forecasting
// Project-specific forecast request
export interface ProjectForecastRequest {
  project_id?: string;
  project_name?: string; // Allow name as identifier too
  months?: number;
}

// Department/Overall forecast request
export interface DepartmentForecastRequest {
  department_id?: string; // Optional: If not provided, forecasts overall
  months?: number;
}

// Combined Forecast Result Type (can represent project or department forecast)
export interface ForecastResult {
  project_id?: string | null;
  project_name?: string | null;
  department_id?: string | null;
  department_name?: string | null;
  current_headcount: number;
  required_headcount?: number; // Only for project forecast
  headcount_gap?: number;      // Only for project forecast
  attrition_rate: number;     // In percentage
  growth_rate: number;        // In percentage
  projections: Array<{
    month: string;
    projected_headcount?: number; // Headcount for department/overall
    headcount?: number;          // Alias for department/overall
    demand_headcount?: number;   // Headcount for project demand
    gap?: number;                // Gap for project demand
  }>;
  key_findings: string[];
  confidence?: number;
  factors?: any;
}

export async function getProjectForecast(request: ProjectForecastRequest): Promise<ForecastResult> {
  const response = await fetch('/api/workforce/forecast/project', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({})); // Catch if response is not JSON
    throw new Error(`Error fetching project forecast: ${response.statusText} - ${errorData.error || 'Unknown error'}`);
  }

  return response.json();
}

export async function getDepartmentForecast(request: DepartmentForecastRequest): Promise<ForecastResult> {
  const response = await fetch('/api/workforce/forecast/department', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({})); // Catch if response is not JSON
    throw new Error(`Error fetching department forecast: ${response.statusText} - ${errorData.error || 'Unknown error'}`);
  }

  return response.json();
}

// Project Feasibility
export interface ProjectFeasibilityRequest {
  project_id?: string;
  project_name: string;
  start_date: string;
  end_date: string;
  budget?: number;
  required_skills: Array<SkillRequirement>;
  description?: string;
  priority?: "high" | "medium" | "low";
  complexity?: "high" | "medium" | "low";
}

export interface FeasibilityResult {
  feasibility_score: number;
  resource_analysis: {
    resource_ratio: number;
    available_resources: number;
    required_resources: number;
  };
  budget_analysis: {
    budget_ratio: number;
    estimated_cost: number;
    available_budget: number;
  };
  time_analysis: {
    time_ratio: number;
    estimated_time_days: number;
  };
  skill_gaps: Array<SkillRequirement>;
  recommendations: string[];
  risk_factors: string[];
  cost_analysis: {
    hiring_costs: number;
    training_costs: number;
    timeline_impact_days: number;
  };
}

export async function analyzeProjectFeasibility(data: ProjectFeasibilityRequest): Promise<FeasibilityResult> {
  const response = await fetch("/api/workforce/project-feasibility/enhanced", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({})); // Catch if response is not JSON
    throw new Error(errorData.error || "Failed to analyze project feasibility");
  }

  return response.json();
}

// Workforce Reallocation
export interface ReallocationRequest {
  project_id?: string;
  department_id?: string;
  target_utilization?: number;
  skill_ids?: string[];
  required_count?: number;
  implementation?: boolean;
}

export interface ReallocationResult {
  summary: {
    total_underutilized: number;
    total_matching: number;
    total_high_matches: number;
    total_recommended: number;
    total_implemented: number;
    average_skill_match: number;
    additional_capacity: number;
  };
  recommendations: Array<{
    employee_id: string;
    employee_name: string;
    current_allocation: number;
    recommended_allocation: number;
    skill_match_score: number;
    relevant_skills: string[];
  }>;
  implemented_allocations: any[]; // Adjust type based on actual allocation structure
}

export async function reallocateWorkforce(request: ReallocationRequest): Promise<ReallocationResult> {
  const response = await fetch('/api/workforce/reallocate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({})); // Catch if response is not JSON
    throw new Error(errorData.error || "Failed to fetch reallocation recommendations");
  }

  return response.json();
}

// Attrition Prediction
export interface AttritionPredictionRequest {
  department_id?: string;
  position_id?: string;
  months?: number;
  include_factors?: boolean;
}

export interface AttritionPredictionResult {
  average_rate: number;
  monthly_predictions: Array<{
    month: string;
    rate: number;
    predicted_attrition_count: number;
  }>;
  risk_factors?: Record<string, number>;
  high_risk_employees?: Array<{
    employee_id: string;
    name: string;
    risk_score: number;
  }>;
}

export async function predictAttrition(request: AttritionPredictionRequest): Promise<AttritionPredictionResult> {
  const response = await fetch('/api/workforce/attrition-prediction', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({})); // Catch if response is not JSON
    throw new Error(errorData.error || "Failed to predict attrition");
  }

  return response.json();
}

// Cost Optimization
export interface CostOptimizationRequest {
  project_id?: string;
  department_id?: string;
  time_frame?: TimePeriod;
  include_outsourcing?: boolean;
  market_rates?: Record<string, number>;
}

export interface CostOptimizationResult {
  summary: {
    current_cost: number;
    optimized_cost: number;
    potential_savings: number;
    savings_percentage: number;
  };
  department_analysis?: Array<{
    department_id: string;
    department_name: string;
    current_cost: number;
    optimized_cost: number;
    potential_savings: number;
  }>;
  project_analysis?: {
    project_id: string;
    project_name: string;
    current_cost: number;
    optimized_cost: number;
    potential_savings: number;
  };
  recommendations: string[];
}

export async function optimizeWorkforceCost(request: CostOptimizationRequest): Promise<CostOptimizationResult> {
  const response = await fetch('/api/workforce/cost-optimization', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({})); // Catch if response is not JSON
    throw new Error(errorData.error || "Failed to fetch cost optimization analysis");
  }

  return response.json();
}

// Succession Planning
export interface SuccessionPlanningRequest {
  project_id?: string;
  department_id?: string;
  position_id?: string;
  performance_threshold?: number;
  include_development_plans?: boolean;
}

export async function planSuccession(request: SuccessionPlanningRequest) {
  const response = await fetch('/api/workforce/succession-planning', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    throw new Error(`Error planning succession: ${response.statusText}`);
  }
  
  return response.json();
} 