"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentTenantContext, getAccessibleTenants } from '@/lib/supabase/tenant-context';
import { useAuth } from './auth-provider';

interface TenantContextType {
  currentTenantId: string | null;
  tenants: Array<{ id: string; name: string }>;
  isPlatformAdmin: boolean;
  isLoading: boolean;
  switchTenant: (tenantId: string) => Promise<void>;
  refreshTenantContext: () => Promise<void>;
}

const TenantContext = createContext<TenantContextType | null>(null);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { client, user } = useAuth();
  const [currentTenantId, setCurrentTenantId] = useState<string | null>(null);
  const [tenants, setTenants] = useState<Array<{ id: string; name: string }>>([]);
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refreshTenantContext = async () => {
    if (!user) {
      setCurrentTenantId(null);
      setTenants([]);
      setIsPlatformAdmin(false);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const tenantContext = await getCurrentTenantContext();
      
      if (!tenantContext) {
        router.push('/login');
        return;
      }

      setIsPlatformAdmin(tenantContext.isPlatformAdmin);
      setCurrentTenantId(tenantContext.tenantId);

      // Get accessible tenants
      const accessibleTenantIds = await getAccessibleTenants(user.id);
      
      if (accessibleTenantIds.length > 0) {
        const { data: tenantData } = await client
          .from('tenants')
          .select('id, name')
          .in('id', accessibleTenantIds);

        setTenants(tenantData || []);
      }
    } catch (error) {
      console.error('Error refreshing tenant context:', error);
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const switchTenant = async (tenantId: string) => {
    try {
      setIsLoading(true);
      
      // Verify tenant access
      const accessibleTenantIds = await getAccessibleTenants(user?.id || '');
      if (!accessibleTenantIds.includes(tenantId)) {
        throw new Error('No access to this tenant');
      }

      setCurrentTenantId(tenantId);
      router.refresh();
    } catch (error) {
      console.error('Error switching tenant:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshTenantContext();
  }, [user]);

  return (
    <TenantContext.Provider
      value={{
        currentTenantId,
        tenants,
        isPlatformAdmin,
        isLoading,
        switchTenant,
        refreshTenantContext,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}