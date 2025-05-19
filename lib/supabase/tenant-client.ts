import { createClient } from '@supabase/supabase-js';
import type { Database } from '../database.types';
import { getCurrentTenantContext } from './tenant-context';

// Type for module-specific clients
export type ModuleClient = {
  name: string;
  getClient: () => Promise<ReturnType<typeof createClient<Database>>>;
};

// Create a tenant-aware client for a specific module
export async function createModuleClient(moduleName: string): Promise<ModuleClient> {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return {
    name: moduleName,
    getClient: async () => {
      const tenantContext = await getCurrentTenantContext();
      
      if (!tenantContext) {
        throw new Error('No tenant context available');
      }

      // For platform admins, return client without tenant header
      if (tenantContext.role === 'platform_admin') {
        return supabase;
      }

      // For other users, add tenant header
      if (tenantContext.tenantId) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await supabase.auth.updateUser({
            data: { tenant_id: tenantContext.tenantId }
          });
        }
      }

      return supabase;
    }
  };
}

// Create module-specific clients
export const moduleClients = {
  revenue: createModuleClient('revenue'),
  employees: createModuleClient('employees'),
  departments: createModuleClient('departments'),
  // Add other modules as needed
} as const;

// Helper hook for React components
export async function useModuleClient(moduleName: keyof typeof moduleClients) {
  const moduleClient = moduleClients[moduleName];
  if (!moduleClient) {
    throw new Error(`No client found for module: ${moduleName}`);
  }
  return moduleClient.getClient();
}
