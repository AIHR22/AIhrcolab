-- Add growth_scenarios table for the Strategic Growth Planner

CREATE TABLE IF NOT EXISTS growth_scenarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    params JSONB NOT NULL,
    results JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Add indexes for faster retrieval
CREATE INDEX IF NOT EXISTS growth_scenarios_name_idx ON growth_scenarios (name);
CREATE INDEX IF NOT EXISTS growth_scenarios_created_at_idx ON growth_scenarios (created_at);
