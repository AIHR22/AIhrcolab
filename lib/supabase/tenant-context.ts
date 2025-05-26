import { createClient } from '@supabase/supabase-js';
import { Database } from '../database.types';
import { getSupabase } from '../supabaseClient';

// Tenant context management
export interface TenantContext {
  tenantId: string | null;
  platformRole: 'platform_admin' | 'user';
  tenantRole: 'client_admin' | 'sub_user' | null;
}

// Get Supabase client
const client = getSupabase();

// Get current user's tenant context
export async function getCurrentTenantContext(): Promise<TenantContext | null> {
  console.log('getCurrentTenantContext: Starting tenant context retrieval');
  try {
    // Get current session
    const { data: { session }, error: sessionError } = await client.auth.getSession();
    
    if (sessionError || !session) {
      console.error('getCurrentTenantContext: No active session');
      return null;
    }

    const { user } = session;
    console.log('getCurrentTenantContext: User session found', { user: user.id });

    // Get the user's tenant memberships with tenant details
    console.log('getCurrentTenantContext: Fetching tenant memberships with details...');
    
    // First, check if user is a platform admin
    const { data: userProfile, error: profileError } = await client
      .from('user_profiles')
      .select('is_platform_admin')
      .eq('user_id', user.id)
      .single();
      
    if (profileError) {
      console.error('getCurrentTenantContext: Error fetching user profile:', profileError);
      return null;
    }
    
    // Set platform role
    const platformRole = userProfile.is_platform_admin ? 'platform_admin' : 'user';
    
    // If user is a platform admin, we can return early
    if (platformRole === 'platform_admin') {
      console.log('getCurrentTenantContext: User is a platform admin');
      return {
        tenantId: null,
        platformRole,
        tenantRole: null
      };
    }
    
    // Get tenant memberships with tenant details
    const { data: tenantMemberships, error: membershipError } = await client
      .from('tenant_users')
      .select(`
        tenant_id, 
        role,
        tenants!inner(
          id,
          name,
          company_id,
          is_default,
          status,
          created_at,
          updated_at
        )
      `)
      .eq('user_id', user.id)
      .order('tenants.is_default', { ascending: false });
      
    console.log('getCurrentTenantContext: Raw tenant memberships:', { tenantMemberships, membershipError });

    if (membershipError) {
      console.error('getCurrentTenantContext: Error fetching tenant memberships:', membershipError);
      return null;
    }
    
    if (!tenantMemberships || tenantMemberships.length === 0) {
      console.log('getCurrentTenantContext: No tenant memberships found for user');
      return null;
    }
    
    // If user has memberships, return the first one (prioritizing default tenant)
    if (tenantMemberships?.length > 0) {
      const membership = tenantMemberships[0];
      console.log('getCurrentTenantContext: Using existing tenant membership:', membership);
      
      // Map the role from tenant_users
      const tenantRole = membership.role === 'client_admin' ? 'client_admin' : 'sub_user';
      
      console.log(`getCurrentTenantContext: Using tenant role '${tenantRole}' for tenant '${membership.tenant_id}'`);
      
      return {
        tenantId: membership.tenant_id,
        platformRole,
        tenantRole
      };
    }

    console.log('getCurrentTenantContext: No tenant memberships found, checking for default setup...');
    
    // If we get here, user has no tenant memberships - try to create a default setup
    try {
      // First, check if there's a default company
      const { data: defaultCompany, error: companyError } = await client
        .from('companies')
        .select('id')
        .eq('is_default', true)
        .maybeSingle();
        
      let companyId = defaultCompany?.id;
      
      // Create default company if it doesn't exist
      if (!companyId) {
        console.log('getCurrentTenantContext: Creating default company...');
        const { data: newCompany, error: createCompanyError } = await client
          .from('companies')
          .insert({
            name: 'Default Company',
            is_default: true,
            status: 'active'
          })
          .select('id')
          .single();
          
        if (createCompanyError) throw createCompanyError;
        companyId = newCompany.id;
      }
      
      // Create default tenant for the company
      console.log('getCurrentTenantContext: Creating default tenant...');
      const { data: defaultTenant, error: tenantError } = await client
        .from('tenants')
        .insert({
          company_id: companyId,
          name: 'Default Tenant',
          is_default: true,
          status: 'active'
        })
        .select('id')
        .single();
        
      if (tenantError) throw tenantError;
      
      // Add user to the tenant as admin
      console.log('getCurrentTenantContext: Adding user to tenant...');
      const { error: membershipError } = await client
        .from('tenant_users')
        .insert({
          tenant_id: defaultTenant.id,
          user_id: user.id,
          role: 'client_admin'
        });
        
      if (membershipError) throw membershipError;
      
      console.log('getCurrentTenantContext: Successfully created default tenant setup');
      
      return {
        tenantId: defaultTenant.id,
        platformRole,
        tenantRole: 'client_admin'
      };
      
    } catch (error) {
      console.error('getCurrentTenantContext: Error creating default tenant setup:', error);
      return null;
    }
    
  } catch (error) {
    console.error('getCurrentTenantContext: Error getting tenant context:', error);
    return null;
  }
};

// Create a Supabase client with tenant context
export async function createTenantAwareClient(tenantId: string | null) {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Add tenant context to all requests
  if (tenantId) {
    // Add tenant header to all requests
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await supabase.auth.updateUser({
        data: { tenant_id: tenantId }
      });
    }
  }

  return supabase;
}

// Helper to check if user has access to a specific tenant
export async function hasAccessToTenant(userId: string, tenantId: string): Promise<boolean> {
  // Get user profile
  const { data: userProfile, error: profileError } = await client
    .from('user_profiles')
    .select('is_platform_admin')
    .eq('user_id', userId)
    .single();

  if (profileError || !userProfile) {
    console.error('Error fetching user profile:', profileError);
    return false;
  }

  // Platform admins have access to all tenants
  if (userProfile.is_platform_admin) {
    console.log('hasAccessToTenant: User is platform admin, access granted');
    return true;
  }

  // Check if user has access to the specified tenant
  console.log('hasAccessToTenant: Checking tenant access for user');
  const { data: tenantUser, error } = await client
    .from('tenant_users')
    .select('role')
    .eq('user_id', userId)
    .eq('tenant_id', tenantId)
    .single();

  if (error) {
    console.error('Error checking tenant user access:', error);
    return false;
  }

  // If user has any role in the tenant, they have access
  return !!tenantUser;
}

// Helper to get all accessible tenants for a user
export async function getAccessibleTenants(userId: string): Promise<string[]> {
  const client = getSupabase();
  
  const { data: userProfile, error: profileError } = await client
    .from('user_profiles')
    .select('role')
    .eq('user_id', userId)
    .single();

  if (profileError) {
    console.error('Error fetching user profile:', profileError);
    return [];
  }

  // Platform admins can access all tenants
  if (userProfile?.role === 'platform_admin') {
    const { data: allTenants, error: tenantsError } = await client
      .from('tenants')
      .select('id');

    if (tenantsError) {
      console.error('Error fetching all tenants:', tenantsError);
      return [];
    }

    return allTenants?.map((t: { id: string }) => t.id) || [];
  }

  // If user has client_admin role, get their tenant
  if (userProfile?.role === 'client_admin') {
    const { data: tenantUsers, error: tenantError } = await client
      .from('tenant_users')
      .select('tenant_id')
      .eq('user_id', userId);

    if (tenantError) {
      console.error('Error fetching user tenants:', tenantError);
      return [];
    }

    return tenantUsers.map(tu => tu.tenant_id);
  }

  // Regular users can only access their assigned tenant
  const { data: tenantUsers, error: tenantError } = await client
    .from('tenant_users')
    .select('tenant_id')
    .eq('user_id', userId);

  if (tenantError) {
    console.error('Error fetching tenant users:', tenantError);
    return [];
  }

  return tenantUsers?.map((tu: { tenant_id: string }) => tu.tenant_id) || [];
}