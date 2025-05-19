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

    // Check user profile role
    let profile = null;
    const { data: userProfile, error: profileError } = await client
      .from('user_profiles')
      .select('role, id')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      if (profileError.code === 'PGRST116') {
        // Profile doesn't exist yet, try to create it
        try {
          // First create the user profile
          const { data: newProfile, error: createError } = await client
            .from('user_profiles')
            .upsert({
              user_id: user.id,
              email: user.email,
              name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
              role: 'sub_user'
            }, {
              onConflict: 'user_id'
            })
            .select('role')
            .single();

          if (createError) {
            console.error('Error creating user profile:', createError);
            return null;
          }

          // Get or create a default tenant for new users
          const { data: defaultTenant, error: tenantError } = await client
            .from('tenants')
            .select('id')
            .eq('name', 'Default Tenant')
            .single();

          if (tenantError) {
            // Create default tenant if it doesn't exist
            const { data: newTenant, error: createTenantError } = await client
              .from('tenants')
              .insert({
                name: 'Default Tenant',
                domain: 'default'
              })
              .select('id')
              .single();

            if (createTenantError) {
              console.error('Error creating default tenant:', createTenantError);
              return null;
            }

            // Associate user with the new tenant
            await client
              .from('tenant_users')
              .insert({
                tenant_id: newTenant.id,
                user_id: user.id,
                role: 'sub_user'
              });
          } else {
            // Associate user with existing default tenant
            await client
              .from('tenant_users')
              .insert({
                tenant_id: defaultTenant.id,
                user_id: user.id,
                role: 'sub_user'
              });
          }

          profile = newProfile;
        } catch (e) {
          // If upsert fails, try one more time to fetch the profile
          const { data: retryProfile, error: retryError } = await client
            .from('user_profiles')
            .select('role')
            .eq('user_id', user.id)
            .single();

          if (retryError) {
            console.error('Error in retry fetch of user profile:', retryError);
            return null;
          }
          profile = retryProfile;
        }
      } else {
        console.error('Error fetching user profile:', profileError);
        return null;
      }
    } else {
      profile = userProfile;
    }

    // Check if user is platform_admin
    if (profile?.role === 'platform_admin') {
      return {
        tenantId: null,
        role: 'platform_admin'
      };
    }

    // Validate that profile role is one of the allowed values
    if (!profile?.role || !['client_admin', 'sub_user'].includes(profile.role)) {
      console.error('Invalid user role:', profile?.role);
      return null;
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