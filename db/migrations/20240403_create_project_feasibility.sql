-- Create project_feasibility table
CREATE TABLE IF NOT EXISTS project_feasibility (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_name TEXT NOT NULL,
    analysis_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    feasibility_score INTEGER NOT NULL,
    resource_gap JSONB NOT NULL,
    skill_gap JSONB NOT NULL,
    recommendation TEXT,
    ai_recommendations JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_project_feasibility_updated_at
    BEFORE UPDATE ON project_feasibility
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_project_feasibility_project_name ON project_feasibility(project_name);
CREATE INDEX IF NOT EXISTS idx_project_feasibility_analysis_date ON project_feasibility(analysis_date);
CREATE INDEX IF NOT EXISTS idx_project_feasibility_score ON project_feasibility(feasibility_score);

-- Add RLS policy
ALTER TABLE project_feasibility ENABLE ROW LEVEL SECURITY;

-- Create policies for access control
CREATE POLICY "Enable read access for authenticated users"
    ON project_feasibility
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable insert access for authenticated users"
    ON project_feasibility
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users"
    ON project_feasibility
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true); 