-- Enable the necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create actual_revenue table
CREATE TABLE IF NOT EXISTS actual_revenue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL,
    amount DECIMAL NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, date)
);

-- Create revenue_forecasts table
CREATE TABLE IF NOT EXISTS revenue_forecasts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL,
    scenario VARCHAR NOT NULL DEFAULT 'base',
    forecast_data JSONB NOT NULL,
    model_metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create revenue_metrics table
CREATE TABLE IF NOT EXISTS revenue_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL,
    metric_name VARCHAR NOT NULL,
    metric_value DECIMAL NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, metric_name, date)
);

-- Create workforce_metrics table
CREATE TABLE IF NOT EXISTS workforce_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL,
    headcount INTEGER NOT NULL,
    avg_salary DECIMAL NOT NULL,
    attrition_rate DECIMAL NOT NULL,
    productivity_metrics JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create model_registry table
CREATE TABLE IF NOT EXISTS model_registry (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL,
    model_data BYTEA NOT NULL,
    metadata JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create metrics_tracking table
CREATE TABLE IF NOT EXISTS metrics_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL,
    metric_type VARCHAR NOT NULL,
    metrics JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create department_revenue table
CREATE TABLE IF NOT EXISTS department_revenue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL,
    department_id UUID NOT NULL,
    amount DECIMAL NOT NULL,
    date DATE NOT NULL,
    forecast_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, department_id, date)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_actual_revenue_project_date ON actual_revenue(project_id, date);
CREATE INDEX IF NOT EXISTS idx_revenue_forecasts_project ON revenue_forecasts(project_id);
CREATE INDEX IF NOT EXISTS idx_workforce_metrics_project ON workforce_metrics(project_id);
CREATE INDEX IF NOT EXISTS idx_model_registry_project_active ON model_registry(project_id) WHERE is_active = true;

-- Set up Row Level Security (RLS)
ALTER TABLE actual_revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE workforce_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics_tracking ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their organization's revenue data"
ON actual_revenue FOR SELECT
USING (auth.uid() IN (
    SELECT user_id 
    FROM organization_members 
    WHERE organization_id = (
        SELECT organization_id 
        FROM projects 
        WHERE id = project_id
    )
));

-- Similar policies for other tables
-- Add more policies as needed for INSERT, UPDATE, DELETE operations

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to all tables
CREATE TRIGGER update_actual_revenue_updated_at
    BEFORE UPDATE ON actual_revenue
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_revenue_forecasts_updated_at
    BEFORE UPDATE ON revenue_forecasts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_revenue_metrics_updated_at
    BEFORE UPDATE ON revenue_metrics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workforce_metrics_updated_at
    BEFORE UPDATE ON workforce_metrics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_model_registry_updated_at
    BEFORE UPDATE ON model_registry
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 