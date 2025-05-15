"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createTenantAwareClient, getCurrentTenantContext, getAccessibleTenants } from '@/lib/supabase/tenant-context';
import { supabaseAdmin } from '@/lib/supabase';

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
  const [currentTenantId, setCurrentTenantId] = useState<string | null>(null);
  const [tenants, setTenants] = useState<Array<{ id: string; name: string }>>([]);
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refreshTenantContext = async () => {
    try {
      const tenantContext = await getCurrentTenantContext();
      
      if (!tenantContext) {
        router.push('/login');
        return;
      }

      setIsPlatformAdmin(tenantContext.role === 'platform_admin');

      // Get user's accessible tenants
      const { data: { user } } = await supabaseAdmin.auth.getUser();
      if (!user) return;

      const accessibleTenantIds = await getAccessibleTenants(user.id);
      
      if (accessibleTenantIds.length > 0) {
        const { data: tenantData } = await supabaseAdmin
          .from('tenants')
          .select('id, name')
          .in('id', accessibleTenantIds);

        setTenants(tenantData || []);
        
        // Set current tenant if not already set
        if (!currentTenantId && tenantData && tenantData.length > 0) {
          setCurrentTenantId(tenantData[0].id);
        }
      }
    } catch (error) {
      console.error('Error refreshing tenant context:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const switchTenant = async (tenantId: string) => {
    try {
      setCurrentTenantId(tenantId);
      // Create new Supabase client with tenant context
      createTenantAwareClient(tenantId);
      // Refresh the page to update data
      router.refresh();
    } catch (error) {
      console.error('Error switching tenant:', error);
    }
  };

  useEffect(() => {
    refreshTenantContext();
  }, []);

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