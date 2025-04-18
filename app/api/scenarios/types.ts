export type ScenarioType = 'company' | 'project'

export interface Scenario {
  id: string
  tenant_id: string
  project_id?: string
  scenario_type: ScenarioType
  name: string
  description: string
  is_predefined: boolean
  parameters: Record<string, any>
  created_at: string
  updated_at: string
}

export interface ScenarioImpactParameters {
  scenario_ids: string[]
  parameters: {
    start_date: string
    end_date: string
    impact_factor: number
    custom_parameters?: Record<string, any>
  }
}

export interface ScenarioImpact {
  scenario_id: string
  baseline_revenue: number
  projected_revenue: number
  impact_percentage: number
  confidence_score: number
  factors: {
    market_conditions: number
    seasonality: number
    historical_trend: number
    other_factors: string[]
  }
}
