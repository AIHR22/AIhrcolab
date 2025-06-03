import { createClient } from '@supabase/supabase-js';
import { Database } from '../database.types';
import { getSupabase } from '../supabaseClient';

// Role types
type TenantRole = 'client_admin' | 'sub_user';

// Tenant context management
export interface TenantContext {
  tenantId: string | null;
  role: TenantRole | null;
  isPlatformAdmin: boolean;
  companyId?: string | null;
}

// Get Supabase clients
const client = getSupabase();

// Get current user's tenant context
export async function getCurrentTenantContext(): Promise<TenantContext | null> {
  try {
    // Get current session
    const { data: { session }, error: sessionError } = await client.auth.getSession();
      
    if (sessionError || !session) {
      console.error('No active session found');
      return null;
    }

    const { user } = session;

    // Check if user is a platform admin first
    const { data: platformAdmin } = await client
      .from('platform_admins')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    // If user is a platform admin, they don't need a profile
    if (platformAdmin) {
      return {
        tenantId: null,
        role: null,
        isPlatformAdmin: true
      };
    }

    // For non-platform admins, get user profile
    const { data: profile, error: profileError } = await client
      .from('user_profiles')
      .select('id, email, name, role')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return null;
    }

    if (!profile) {
      console.error('User profile not found');
      return null;
    }

    // Get user's tenant memberships
    const { data: tenantMemberships, error: membershipError } = await client
      .from('tenant_users')
      .select(`
        tenant_id,
        role,
        tenants (
          company_id,
          is_default
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (membershipError) {
      console.error('Error fetching tenant memberships:', membershipError);
      return null;
    }

    // If user has no memberships, return null (will trigger default tenant creation in auth provider)
    if (!tenantMemberships || tenantMemberships.length === 0) {
      return null;
    }

    // Try to find default tenant first
    let membership = tenantMemberships.find(m => m.tenants?.is_default);
    
    // If no default tenant, use the first one
    if (!membership) {
      membership = tenantMemberships[0];
    }

    return {
      tenantId: membership.tenant_id,
      role: membership.role as TenantRole,
      isPlatformAdmin: false,
      companyId: membership.tenants?.company_id
    };

  } catch (error) {
    console.error('Error in getCurrentTenantContext:', error);
    return null;
  }
}

// Create a Supabase client with tenant context
export async function createTenantAwareClient(tenantId: string | null) {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  if (tenantId) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await supabase.auth.updateUser({
        data: { tenant_id: tenantId }
      });
    }
  }

  return supabase;
}

// Helper to get all accessible tenants for a user
export async function getAccessibleTenants(userId: string): Promise<string[]> {
  try {
    // Check if user is a platform admin
    const { data: platformAdmin, error: platformAdminError } = await client
      .from('platform_admins')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    console.log('Platform admin check:', { platformAdmin, platformAdminError, userId });

    // Platform admins can access all tenants
    if (platformAdmin) {
      const { data: allTenants, error: tenantsError } = await client
        .from('tenants')
        .select('id')
        .order('created_at', { ascending: true });

      console.log('Fetching all tenants:', { allTenants, tenantsError });

      if (tenantsError) {
        console.error('Error fetching all tenants:', tenantsError);
        return [];
      }

      return allTenants?.map(t => t.id) || [];
    }

    // Regular users can only access their assigned tenants
    const { data: tenantUsers, error: tenantError } = await client
      .from('tenant_users')
      .select('tenant_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (tenantError) {
      console.error('Error fetching tenant users:', tenantError);
      return [];
    }

    return tenantUsers?.map(tu => tu.tenant_id) || [];
  } catch (error) {
    console.error('Error in getAccessibleTenants:', error);
    return [];
  }
}