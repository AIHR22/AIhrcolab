export interface OrgChartNode {
  id: string
  name: string
  title: string
  department: string
  imageUrl?: string
  children: OrgChartNode[]
  // Added fields for complex reporting relationships
  dotted_line_reports?: OrgChartNode[]
  matrix_reports?: OrgChartNode[]
  reporting_type?: "direct" | "matrix" | "dotted-line"
  // Additional metadata for enhanced visualization
  metadata?: {
    skills?: string[]
    performance_rating?: number
    risk_of_loss?: "low" | "medium" | "high"
    impact_of_loss?: "low" | "medium" | "high"
    succession_candidates?: string[]
    location?: string
  }
}

export interface Department {
  id: string
  name: string
  description?: string
  manager_id?: string
  parent_department_id?: string
  created_at: string
  updated_at: string
  // Added fields for analytics and compliance
  headcount?: number
  budget?: number
  target_headcount?: number
  compliance_status?: "compliant" | "non-compliant" | "review-needed"
  last_audit_date?: string
}

export interface Position {
  id: string
  title: string
  department_id: string
  level: string
  description?: string
  is_manager: boolean
  created_at: string
  updated_at: string
  // Added fields for workforce planning
  is_critical?: boolean
  required_skills?: string[]
  salary_range?: {
    min: number
    max: number
  }
  time_to_fill?: number  // Average days to fill this position
  turnover_rate?: number // Historical turnover rate for this position
}

export interface OrgStructure {
  id: string
  name: string
  structure: OrgChartNode
  is_active: boolean
  created_at: string
  updated_at: string
  // Added fields for scenario planning
  is_scenario?: boolean
  baseline_structure_id?: string
  scenario_description?: string
  cost_impact?: number
  efficiency_impact?: number
}

// New interfaces for enhanced features

export interface OrgChartExportOptions {
  format: "pdf" | "png" | "svg" | "excel"
  showMetadata: boolean
  showDottedLines: boolean
  showMatrixRelationships: boolean
  title?: string
  includeDate: boolean
  paperSize?: "a4" | "letter" | "legal"
  orientation?: "portrait" | "landscape"
}

export interface HRMetric {
  id: string
  name: string
  value: number
  unit: string
  target?: number
  trend?: "up" | "down" | "stable"
  department_id?: string
  period: string
  created_at: string
}

export interface OrgChangeEvent {
  id: string
  event_type: "hire" | "promotion" | "transfer" | "termination" | "reorganization"
  description: string
  affected_positions: string[]
  affected_departments: string[]
  effective_date: string
  status: "planned" | "in-progress" | "completed"
  created_by: string
  created_at: string
  updated_at: string
}

export interface AuditLog {
  id: string
  action: "create" | "update" | "delete" | "view" | "export"
  entity_type: "department" | "position" | "employee" | "org_chart"
  entity_id: string
  user_id: string
  details: string
  created_at: string
  ip_address?: string
}

export interface ERPIntegrationConfig {
  id: string
  name: string
  provider: "workday" | "sap" | "oracle" | "custom"
  api_endpoint: string
  auth_method: "oauth" | "api_key" | "basic_auth"
  credentials: {
    client_id?: string
    tenant_id?: string
    instance_url?: string
  }
  sync_frequency: "hourly" | "daily" | "weekly" | "manual"
  last_sync: string
  status: "active" | "inactive" | "error"
  created_at: string
  updated_at: string
}
