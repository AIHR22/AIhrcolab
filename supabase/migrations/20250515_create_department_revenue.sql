-- Create department_revenue table
CREATE TABLE IF NOT EXISTS public.department_revenue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id),
    department_id UUID NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add RLS policies
ALTER TABLE public.department_revenue ENABLE ROW LEVEL SECURITY;

-- Policy to allow read access to users who belong to the tenant
CREATE POLICY "Users can view their tenant's department revenue"
    ON public.department_revenue
    FOR SELECT
    USING (
        tenant_id IN (
            SELECT tenant_id FROM public.tenant_users
            WHERE user_id = auth.uid()
        )
    );

-- Policy to allow insert/update for client_admin and platform_admin
CREATE POLICY "Admins can manage department revenue"
    ON public.department_revenue
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.tenant_users
            WHERE user_id = auth.uid()
            AND tenant_id = department_revenue.tenant_id
            AND role IN ('client_admin', 'platform_admin')
        )
    );

-- Add indexes for better query performance
CREATE INDEX department_revenue_tenant_id_idx ON public.department_revenue(tenant_id);
CREATE INDEX department_revenue_date_idx ON public.department_revenue(date);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_department_revenue_updated_at
    BEFORE UPDATE ON public.department_revenue
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
