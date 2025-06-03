-- Insert profiles for existing platform admins that don't have a profile yet
INSERT INTO platform_admin_profiles (user_id, email, full_name)
SELECT 
    pa.user_id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'full_name', 'Platform Admin') as full_name
FROM platform_admins pa
LEFT JOIN platform_admin_profiles pap ON pa.user_id = pap.user_id
JOIN auth.users au ON pa.user_id = au.id
WHERE pap.id IS NULL;  -- Only insert for admins that don't have a profile yet

-- Verify the migration
SELECT 
    pa.user_id,
    pap.email,
    pap.full_name,
    pap.created_at
FROM platform_admins pa
LEFT JOIN platform_admin_profiles pap ON pa.user_id = pap.user_id
ORDER BY pap.created_at DESC; 