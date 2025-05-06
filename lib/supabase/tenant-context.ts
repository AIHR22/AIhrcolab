import { createClient } from '@supabase/supabase-js';
import { Database } from '../database.types';
import { supabaseAdmin } from '../supabase';

// Tenant context management
export interface TenantContext {
  tenantId: string | null;
  role: 'platform_admin' | 'client_admin' | 'sub_user';
}

// Get current user's tenant context
export async function getCurrentTenantContext(): Promise<TenantContext | null> {
  try {
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser();
    if (authError || !user) return null;

    // Check if user is platform admin by email and role
    if (user.email === 'arvindfenova@gmail.com') {
      return {
        tenantId: null, // Platform admin can access all tenants
        role: 'platform_admin'
      };
    }

    // Check user profile role
    const { data: userProfile } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (userProfile?.role === 'platform_admin') {
      return {
        tenantId: null, // Platform admin can access all tenants
        role: 'platform_admin'
      };
    }

    // Get user's tenant association
    const { data: tenantUser } = await supabaseAdmin
      .from('tenant_users')
      .select('tenant_id, role')
      .eq('user_id', user.id)
      .single();

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
  const { data: userProfile } = await supabaseAdmin
    .from('user_profiles')
    .select('role')
    .eq('user_id', userId)
    .single();

  // Platform admins have access to all tenants
  if (userProfile?.role === 'platform_admin') return true;

  const { data: tenantUser } = await supabaseAdmin
    .from('tenant_users')
    .select('id')
    .eq('user_id', userId)
    .eq('tenant_id', tenantId)
    .single();

  return !!tenantUser;
}

// Helper to get all accessible tenants for a user
export async function getAccessibleTenants(userId: string): Promise<string[]> {
  const { data: userProfile } = await supabaseAdmin
    .from('user_profiles')
    .select('role')
    .eq('user_id', userId)
    .single();

  // Platform admins can access all tenants
  if (userProfile?.role === 'platform_admin') {
    const { data: allTenants } = await supabaseAdmin
      .from('tenants')
      .select('id');
    return allTenants?.map(t => t.id) || [];
  }

  // Regular users can only access their assigned tenant
  const { data: tenantUsers } = await supabaseAdmin
    .from('tenant_users')
    .select('tenant_id')
    .eq('user_id', userId);

  return tenantUsers?.map(tu => tu.tenant_id) || [];
}