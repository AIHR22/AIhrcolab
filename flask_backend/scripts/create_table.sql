-- Drop existing table and policies if they exist
DROP POLICY IF EXISTS "Allow read access for authenticated users" ON public.ml_predictions;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.ml_predictions;
DROP TABLE IF EXISTS public.ml_predictions;

-- Create the table
CREATE TABLE public.ml_predictions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    prophet_forecast JSONB NOT NULL,
    simple_forecast JSONB NOT NULL,
    llama_insights JSONB NOT NULL,
    model_version VARCHAR(50) NOT NULL,
    confidence_score NUMERIC(5,2) NOT NULL,
    metadata JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX idx_ml_predictions_date ON public.ml_predictions(date);
CREATE INDEX idx_ml_predictions_model_version ON public.ml_predictions(model_version);

-- Enable Row Level Security
ALTER TABLE public.ml_predictions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow read access for authenticated users" 
ON public.ml_predictions FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Allow insert for authenticated users" 
ON public.ml_predictions FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Grant permissions
GRANT ALL ON public.ml_predictions TO authenticated;
GRANT ALL ON public.ml_predictions TO service_role;

-- Add comment
COMMENT ON TABLE public.ml_predictions IS 'Stores machine learning predictions for revenue forecasting'; 