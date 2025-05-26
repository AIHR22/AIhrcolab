import type { Database } from '@/lib/database.types';

export type UserRole = 'platform_admin' | 'client_admin' | 'sub_user';

export interface Company {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Tenant {
  id: string;
  company_id: string;
  status: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  company?: Company;
}

export interface TenantUser {
  id: string;
  tenant_id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
  tenant?: Tenant;
}

export interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  name: string;
  is_platform_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  current_tenant_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface TenantContextValue {
  currentTenantId: string | null;
  currentCompanyId: string | null;
  tenants: Tenant[];
  isPlatformAdmin: boolean;
  isLoading: boolean;
  userRole: UserRole | null;
  switchTenant: (tenantId: string) => Promise<void>;
  refreshTenantContext: () => Promise<void>;
}

// Type for the tenant-aware tables
export type TenantAwareTableName = 
  | 'employees' 
  | 'departments' 
  | 'projects' 
  | 'documents' 
  | 'tasks' 
  | 'positions' 
  | 'user_profiles' 
  | 'tenant_users';

// Extended Supabase types with tenant tables
export type SupabaseClient = ReturnType<typeof import('@supabase/supabase-js').createClient<Database>>;

export type Tables = Database['public']['Tables'];
export type TableName = keyof Tables;
export type TableRow<T extends TableName> = Tables[T]['Row'];
