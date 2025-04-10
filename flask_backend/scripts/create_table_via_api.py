import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def create_ml_predictions_table():
    supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if not supabase_url or not supabase_key:
        print("❌ Error: Supabase credentials not found in environment variables")
        return False
    
    headers = {
        "apikey": supabase_key,
        "Authorization": f"Bearer {supabase_key}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }
    
    # SQL to create the table
    sql_query = """
    CREATE TABLE IF NOT EXISTS public.ml_predictions (
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

    -- Add indexes
    CREATE INDEX IF NOT EXISTS idx_ml_predictions_date ON public.ml_predictions(date);
    CREATE INDEX IF NOT EXISTS idx_ml_predictions_model_version ON public.ml_predictions(model_version);

    -- Set up RLS
    ALTER TABLE public.ml_predictions ENABLE ROW LEVEL SECURITY;

    -- Policies
    CREATE POLICY "Allow read access for authenticated users" ON public.ml_predictions
        FOR SELECT TO authenticated USING (true);

    CREATE POLICY "Allow insert for authenticated users" ON public.ml_predictions
        FOR INSERT TO authenticated WITH CHECK (true);

    -- Permissions
    GRANT ALL ON public.ml_predictions TO authenticated;
    GRANT ALL ON public.ml_predictions TO service_role;
    """
    
    try:
        # Use the REST API to execute SQL
        response = requests.post(
            f"{supabase_url}/rest/v1/rpc/exec_sql",
            headers=headers,
            json={"query": sql_query}
        )
        
        if response.status_code == 200:
            print("✅ Successfully created ml_predictions table")
            return True
        else:
            print(f"❌ Error creating table: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

if __name__ == "__main__":
    create_ml_predictions_table() 