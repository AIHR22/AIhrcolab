-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'sub_user' CHECK (role IN ('platform_admin', 'company_admin', 'sub_user')),
  is_platform_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create companies table if it doesn't exist
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tenants table if it doesn't exist
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tenant_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS tenant_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT DEFAULT 'sub_user' CHECK (role IN ('platform_admin', 'company_admin', 'sub_user')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, user_id)
);

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policies for tenant_users
CREATE POLICY "Users can view their own tenant memberships"
  ON tenant_users FOR SELECT
  USING (auth.uid() = user_id);

-- Create a function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create user profile
  INSERT INTO public.user_profiles (user_id, email, name, role, is_platform_admin)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name' OR split_part(NEW.email, '@', 1),
    'sub_user',
    false
  );
  
  -- Create a default company for the user
  WITH new_company AS (
    INSERT INTO public.companies (name)
    VALUES (NEW.email || '''s Company')
    RETURNING id
  ),
  new_tenant AS (
    INSERT INTO public.tenants (company_id, name, is_default)
    SELECT id, 'Default Tenant', true
    FROM new_company
    RETURNING id
  )
  INSERT INTO public.tenant_users (tenant_id, user_id, role)
  SELECT id, NEW.id, 'company_admin'
  FROM new_tenant;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create a function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to update updated_at
CREATE OR REPLACE FUNCTION create_updated_at_trigger(table_name text)
RETURNS void AS $$
BEGIN
  EXECUTE format('DROP TRIGGER IF EXISTS update_%s_updated_at ON %I', table_name, table_name);
  EXECUTE format('CREATE TRIGGER update_%s_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', 
    table_name, table_name);
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all tables
SELECT create_updated_at_trigger('user_profiles');
SELECT create_updated_at_trigger('companies');
SELECT create_updated_at_trigger('tenants');
SELECT create_updated_at_trigger('tenant_users');

-- Create a default admin user if one doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@example.com') THEN
    INSERT INTO auth.users (
      id, 
      email, 
      encrypted_password, 
      email_confirmed_at, 
      created_at, 
      updated_at
    ) VALUES (
      uuid_generate_v4(), 
      'admin@example.com', 
      crypt('admin123', gen_salt('bf')), 
      NOW(), 
      NOW(), 
      NOW()
    );
  END IF;
END $$;
