import { createClient } from '@supabase/supabase-js';
import { Database } from '../database.types';
import { getSupabase } from '../supabaseClient';

// Tenant context management
export interface TenantContext {
  tenantId: string | null;
  role: 'platform_admin' | 'client_admin' | 'sub_user';
}

// Get current user's tenant context
export async function getCurrentTenantContext(): Promise<TenantContext | null> {
  const client = getSupabase();
  
  try {
    const { data: { session }, error: sessionError } = await client.auth.getSession();
    if (sessionError || !session?.user) return null;

    const user = session.user;

    // Check if user is platform admin by email and role
    if (user.email === 'arvindfenova@gmail.com' || user.email === 'test2@test.com') {
      return {
        tenantId: null, // Platform admin can access all tenants
        role: 'platform_admin'
      };
    }

    // Check user profile role
    const { data: userProfile, error: profileError } = await client
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return null;
    }

    if (userProfile?.role === 'platform_admin') {
      return {
        tenantId: null, // Platform admin can access all tenants
        role: 'platform_admin'
      };
    }

    // Get user's tenant association
    const { data: tenantUser, error: tenantError } = await client
      .from('tenant_users')
      .select('tenant_id, role')
      .eq('user_id', user.id)
      .single();

    if (tenantError) {
      console.error('Error fetching tenant user:', tenantError);
      return null;
    }

    if (!tenantUser) return null;

    return {
      tenantId: tenantUser.tenant_id,
      role: tenantUser.role as 'client_admin' | 'sub_user'
    };
  } catch (error) {
    console.error('Error getting tenant context:', error);
    return null;
  }
}

// Create a Supabase client with tenant context
export function createTenantAwareClient(tenantId: string | null) {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Add tenant context to all requests
  if (tenantId) {
    // Intercept all requests to add tenant context
    const { fetch: originalFetch } = supabase;
    supabase.fetch = async (url, options) => {
      const modifiedOptions = {
        ...options,
        headers: {
          ...options?.headers,
          'x-tenant-id': tenantId
        }
      };
      return originalFetch(url, modifiedOptions);
    };
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