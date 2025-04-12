import { NextResponse } from 'next/server';
import { getCurrentTenantContext, hasAccessToTenant } from '../supabase/tenant-context';

type TenantAuthOptions = {
  requireTenant?: boolean; // If true, request must have a valid tenant context
  allowPlatformAdmin?: boolean; // If true, platform admins can access without tenant context
};

export async function withTenantAuth(
  handler: Function,
  options: TenantAuthOptions = { requireTenant: true, allowPlatformAdmin: true }
) {
  return async function(req: Request, ...args: any[]) {
    try {
      // Get tenant context
      const tenantContext = await getCurrentTenantContext();
      
      if (!tenantContext) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Handle platform admin access
      if (tenantContext.role === 'platform_admin' && options.allowPlatformAdmin) {
        // Allow access to all data for platform admins
        return handler(req, ...args);
      }

      // Check tenant requirements
      if (options.requireTenant && !tenantContext.tenantId) {
        return NextResponse.json({ error: 'Tenant context required' }, { status: 403 });
      }

      // Add tenant context to request
      const url = new URL(req.url);
      url.searchParams.set('tenantId', tenantContext.tenantId || '');
      
      // Create new request with tenant context
      const tenantRequest = new Request(url, {
        headers: req.headers,
        method: req.method,
        body: req.body,
        cache: req.cache,
        credentials: req.credentials,
        integrity: req.integrity,
        keepalive: req.keepalive,
        mode: req.mode,
        redirect: req.redirect,
        referrer: req.referrer,
        referrerPolicy: req.referrerPolicy,
        signal: req.signal,
      });

      // Call handler with tenant context
      return handler(tenantRequest, ...args);
    } catch (error: any) {
      console.error('[Tenant Auth Middleware Error]:', error);
      return NextResponse.json(
        { error: error.message || 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

// Helper to get tenant ID from request
export function getTenantId(req: Request): string | null {
  const url = new URL(req.url);
  return url.searchParams.get('tenantId');
}

// Helper to validate tenant access
export async function validateTenantAccess(
  req: Request,
  tenantId: string
): Promise<boolean> {
  const tenantContext = await getCurrentTenantContext();
  
  if (!tenantContext) return false;
  
  // Platform admins have access to all tenants
  if (tenantContext.role === 'platform_admin') return true;
  
  // For other users, check if they have access to the specific tenant
  return tenantContext.tenantId === tenantId;
}