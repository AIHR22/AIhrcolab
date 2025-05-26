import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import type { TenantAwareTableName } from '@/types/tenant.types';

type SupabaseClient = ReturnType<typeof createClient<Database, 'public'>>;
type Table = Database['public']['Tables'];
type TableName = keyof Table;

type QueryBuilder<T extends TableName> = ReturnType<SupabaseClient['from']>;

// Export the TenantContext type
export type TenantContext = {
  tenantId: string | null;
  role: 'platform_admin' | 'client_admin' | 'sub_user';
};

// List of tables that should be tenant-scoped
const TENANT_AWARE_TABLES: TenantAwareTableName[] = [
  'employees',
  'departments',
  'projects',
  'documents',
  'tasks',
  'positions',
  'user_profiles',
  'tenant_users'
];

/**
 * Creates a tenant-aware Supabase client
 */
export function createTenantAwareClient(tenantId: string | null) {
  const headers: Record<string, string> = {};
  if (tenantId) {
    headers['X-Tenant-ID'] = tenantId;
  }
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { 
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      global: { 
        headers 
      } 
    }
  );
}

/**
 * Applies tenant filtering to a query if needed
 * @param query The Supabase query builder
 * @param tenantId The current tenant ID (null for platform admins)
 * @param tableName The name of the table being queried
 */
export function withTenantFilter<T extends TableName>(
  query: any,
  tenantId: string | null,
  tableName: T
) {
  if (!TENANT_AWARE_TABLES.includes(tableName as TenantAwareTableName)) {
    return query;
  }
  
  if (tenantId) {
    return query.eq('tenant_id', tenantId);
  }
  
  return query;
}

/**
 * Gets the current tenant context for a user
 */
export async function getCurrentTenantContext(supabase: SupabaseClient): Promise<TenantContext | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Check if user is a platform admin
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('is_platform_admin')
    .eq('user_id', user.id)
    .single();

  if (profile?.is_platform_admin) {
    return { tenantId: null, role: 'platform_admin' };
  }

  // Get user's tenant memberships
  const { data: memberships } = await supabase
    .from('tenant_users')
    .select('tenant_id, role')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (!memberships || memberships.length === 0) {
    return null;
  }

  // For now, just return the first tenant. You might want to implement tenant switching logic
  return {
    tenantId: memberships[0].tenant_id,
    role: memberships[0].role
  };
}

/**
 * Checks if a user has access to a specific tenant
 */
export async function hasAccessToTenant(
  supabase: SupabaseClient,
  userId: string,
  tenantId: string
): Promise<boolean> {
  // Platform admins have access to all tenants
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('is_platform_admin')
    .eq('user_id', userId)
    .single();

  if (profile?.is_platform_admin) {
    return true;
  }

  // Check if user is a member of the tenant
  const { data: membership } = await supabase
    .from('tenant_users')
    .select('tenant_id')
    .eq('user_id', userId)
    .eq('tenant_id', tenantId)
    .single();

  return !!membership;
}
