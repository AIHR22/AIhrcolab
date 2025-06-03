-- During development, we'll disable RLS on auth.users
-- This is the default Supabase behavior
ALTER TABLE auth.users DISABLE ROW LEVEL SECURITY;

-- Drop any existing policies since we're disabling RLS
DROP POLICY IF EXISTS "platform_admin_user_access" ON auth.users;
DROP POLICY IF EXISTS "auth_users_policy" ON auth.users; 