import { createClient } from '@supabase/supabase-js';
import { Database } from '../database.types';
import { getSupabase } from '../supabaseClient';

// Tenant context management
export interface TenantContext {
  tenantId: string | null;
  role: 'platform_admin' | 'company_admin' | 'sub_user';
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
    
    // If user is a platform admin, we can return early with platform_admin role
    if (userProfile?.is_platform_admin) {
      console.log('getCurrentTenantContext: User is a platform admin');
      return {
        tenantId: null,
        role: 'platform_admin'
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
      
      // Ensure the role is one of the valid values from our database
      const validRoles = ['client_admin', 'sub_user'] as const;
      const role = validRoles.includes(membership.role as any) 
        ? membership.role as 'client_admin' | 'sub_user'
        : 'sub_user';
      
      console.log(`getCurrentTenantContext: Using role '${role}' for tenant '${membership.tenant_id}'`);
      
      return {
        tenantId: membership.tenant_id,
        role
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
          role: 'company_admin'
        });
        
      if (membershipError) throw membershipError;
      
      console.log('getCurrentTenantContext: Successfully created default tenant setup');
      
      return {
        tenantId: defaultTenant.id,
        role: 'company_admin'
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
  const client = getSupabase();
  
  const { data: userProfile, error: profileError } = await client
    .from('user_profiles')
    .select('role')
    .eq('user_id', userId)
    .single();

  if (profileError) {
    console.error('Error checking user profile:', profileError);
    return false;
  }

  // Platform admins have access to all tenants
  if (userProfile?.role === 'platform_admin') return true;

  const { data: tenantUser, error: tenantError } = await client
    .from('tenant_users')
    .select('id')
    .eq('user_id', userId)
    .eq('tenant_id', tenantId)
    .single();

  if (tenantError) {
    console.error('Error checking tenant access:', tenantError);
    return false;
  }

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