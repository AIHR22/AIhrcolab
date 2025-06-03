-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (renamed to tenant_users)
CREATE TABLE IF NOT EXISTS public.tenant_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user', 'client_admin', 'platform_admin', 'sub_user')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    tenant_id UUID DEFAULT uuid_generate_v4() -- Add tenant_id column
);

-- Create RLS policies
ALTER TABLE public.tenant_users ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own profile
CREATE POLICY "Users can view own tenant_user profile"
    ON public.tenant_users
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy for users to update their own profile
CREATE POLICY "Users can update own tenant_user profile"
    ON public.tenant_users
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Policy for admin to view all profiles
CREATE POLICY "Admins can view all tenant_user profiles"
    ON public.tenant_users
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.tenant_users
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Policy for admin to update all profiles
CREATE POLICY "Admins can update all tenant_user profiles"
    ON public.tenant_users
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.tenant_users
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.tenant_users (user_id, email, full_name, role, tenant_id)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
        uuid_generate_v4() -- Generate a new tenant_id for each new user
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

