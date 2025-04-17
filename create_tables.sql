-- 1. Revenue Data Table
CREATE TABLE IF NOT EXISTS revenue_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  period_type VARCHAR(20) NOT NULL CHECK (period_type IN ('monthly', 'quarterly', 'annual')),
  period_date DATE NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  is_projected BOOLEAN DEFAULT false,
  growth_rate DECIMAL(5,2),
  company_wide BOOLEAN DEFAULT true,
  department_id UUID REFERENCES departments(id),
  project_id UUID REFERENCES projects(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for revenue_data
CREATE INDEX IF NOT EXISTS idx_revenue_tenant ON revenue_data(tenant_id);
CREATE INDEX IF NOT EXISTS idx_revenue_period ON revenue_data(period_type, period_date);
CREATE INDEX IF NOT EXISTS idx_revenue_department ON revenue_data(department_id) WHERE department_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_revenue_project ON revenue_data(project_id) WHERE project_id IS NOT NULL;

-- Enable RLS
ALTER TABLE revenue_data ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY revenue_tenant_isolation ON revenue_data
    USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid)
    WITH CHECK (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- 2. Department Revenue Table
CREATE TABLE IF NOT EXISTS department_revenue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  department_id UUID REFERENCES departments(id),
  period_type VARCHAR(20) NOT NULL CHECK (period_type IN ('monthly', 'quarterly', 'annual')),
  period_date DATE NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  is_projected BOOLEAN DEFAULT false,
  growth_rate DECIMAL(5,2),
  company_wide BOOLEAN DEFAULT true,
  project_id UUID REFERENCES projects(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for department_revenue
CREATE INDEX IF NOT EXISTS idx_dept_revenue_tenant ON department_revenue(tenant_id);
CREATE INDEX IF NOT EXISTS idx_dept_revenue_department ON department_revenue(department_id);
CREATE INDEX IF NOT EXISTS idx_dept_revenue_period ON department_revenue(period_type, period_date);

-- Enable RLS
ALTER TABLE department_revenue ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY dept_revenue_tenant_isolation ON department_revenue
    USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid)
    WITH CHECK (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- 3. Revenue Model Parameters Table
CREATE TABLE IF NOT EXISTS revenue_model_params (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name VARCHAR(100) NOT NULL,
  employee_count INTEGER,
  avg_salary DECIMAL(10,2),
  revenue_per_employee DECIMAL(10,2),
  growth_rate DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for revenue_model_params
CREATE INDEX IF NOT EXISTS idx_model_params_tenant ON revenue_model_params(tenant_id);

-- Enable RLS
ALTER TABLE revenue_model_params ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY model_params_tenant_isolation ON revenue_model_params
    USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid)
    WITH CHECK (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- 4. Scenarios Table
CREATE TABLE IF NOT EXISTS scenarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  impact_amount DECIMAL(15,2),
  is_predefined BOOLEAN DEFAULT false,
  project_id UUID REFERENCES projects(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for scenarios
CREATE INDEX IF NOT EXISTS idx_scenario_tenant ON scenarios(tenant_id);
CREATE INDEX IF NOT EXISTS idx_scenario_project ON scenarios(project_id) WHERE project_id IS NOT NULL;

-- Enable RLS
ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY scenario_tenant_isolation ON scenarios
    USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid)
    WITH CHECK (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- 5. Scenario Parameters Table
CREATE TABLE IF NOT EXISTS scenario_parameters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  scenario_id UUID NOT NULL REFERENCES scenarios(id),
  param_name VARCHAR(100) NOT NULL,
  param_value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for scenario_parameters
CREATE INDEX IF NOT EXISTS idx_scenario_param_tenant ON scenario_parameters(tenant_id);
CREATE INDEX IF NOT EXISTS idx_scenario_param_scenario ON scenario_parameters(scenario_id);

-- Enable RLS
ALTER TABLE scenario_parameters ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY scenario_param_tenant_isolation ON scenario_parameters
    USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid)
    WITH CHECK (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- 6. Revenue Comparisons Table
CREATE TABLE IF NOT EXISTS revenue_comparisons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  period_type VARCHAR(20) NOT NULL CHECK (period_type IN ('monthly', 'quarterly', 'annual')),
  period_date DATE NOT NULL,
  current_value DECIMAL(15,2) NOT NULL,
  previous_value DECIMAL(15,2),
  percentage_change DECIMAL(5,2),
  metric_type VARCHAR(50) NOT NULL,
  department_id UUID REFERENCES departments(id),
  project_id UUID REFERENCES projects(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for revenue_comparisons
CREATE INDEX IF NOT EXISTS idx_comparison_tenant ON revenue_comparisons(tenant_id);
CREATE INDEX IF NOT EXISTS idx_comparison_period ON revenue_comparisons(period_type, period_date);
CREATE INDEX IF NOT EXISTS idx_comparison_department ON revenue_comparisons(department_id) WHERE department_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_comparison_project ON revenue_comparisons(project_id) WHERE project_id IS NOT NULL;

-- Enable RLS
ALTER TABLE revenue_comparisons ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY comparison_tenant_isolation ON revenue_comparisons
    USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid)
    WITH CHECK (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- Functions for revenue calculations
CREATE OR REPLACE FUNCTION calculate_revenue_projections(
  p_tenant_id UUID,
  employee_count INTEGER,
  avg_salary DECIMAL,
  revenue_per_employee DECIMAL,
  growth_rate DECIMAL
) RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- Verify tenant ID matches the authenticated user's tenant
  IF p_tenant_id != auth.jwt() -> 'tenant_id' THEN
    RAISE EXCEPTION 'Unauthorized tenant access';
  END IF;

  -- Calculate monthly revenue
  result = jsonb_build_object(
    'monthly_revenue', (employee_count * revenue_per_employee),
    'annual_revenue', (employee_count * revenue_per_employee * 12),
    'projected_revenue', (employee_count * revenue_per_employee * 12 * (1 + growth_rate/100)),
    'profit_margin', ((employee_count * revenue_per_employee * 12) - (employee_count * avg_salary)) / (employee_count * revenue_per_employee * 12) * 100
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate scenario impact
CREATE OR REPLACE FUNCTION calculate_scenario_impact(
  p_tenant_id UUID,
  scenario_ids UUID[]
) RETURNS DECIMAL AS $$
DECLARE
  total_impact DECIMAL := 0;
  scenario_record RECORD;
BEGIN
  -- Verify tenant ID matches the authenticated user's tenant
  IF p_tenant_id != auth.jwt() -> 'tenant_id' THEN
    RAISE EXCEPTION 'Unauthorized tenant access';
  END IF;

  FOR scenario_record IN 
    SELECT * FROM scenarios 
    WHERE id = ANY(scenario_ids)
    AND tenant_id = p_tenant_id
  LOOP
    total_impact := total_impact + scenario_record.impact_amount;
  END LOOP;
  
  RETURN total_impact;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate comparison data
CREATE OR REPLACE FUNCTION generate_comparison_data(
  p_tenant_id UUID,
  p_period_type VARCHAR,
  p_metric_type VARCHAR,
  p_department_id UUID DEFAULT NULL,
  p_project_id UUID DEFAULT NULL
) RETURNS TABLE (
  period_date DATE,
  current_value DECIMAL,
  previous_value DECIMAL,
  percentage_change DECIMAL
) AS $$
BEGIN
  -- Verify tenant ID matches the authenticated user's tenant
  IF p_tenant_id != auth.jwt() -> 'tenant_id' THEN
    RAISE EXCEPTION 'Unauthorized tenant access';
  END IF;

  RETURN QUERY 
    SELECT 
      rd.period_date,
      rd.amount as current_value,
      lag(rd.amount) OVER (ORDER BY rd.period_date) as previous_value,
      (rd.amount - lag(rd.amount) OVER (ORDER BY rd.period_date)) / lag(rd.amount) OVER (ORDER BY rd.period_date) * 100 as percentage_change
    FROM revenue_data rd
    WHERE rd.tenant_id = p_tenant_id
    AND rd.period_type = p_period_type
    AND (p_department_id IS NULL OR rd.department_id = p_department_id)
    AND (p_project_id IS NULL OR rd.project_id = p_project_id)
    ORDER BY rd.period_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
