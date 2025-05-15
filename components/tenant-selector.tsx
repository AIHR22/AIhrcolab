import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTenant } from '@/contexts/tenant-context';

export function TenantSelector() {
  const { currentTenantId, tenants, isPlatformAdmin, switchTenant } = useTenant();

  if (!isPlatformAdmin || tenants.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center space-x-4">
      <span className="text-sm font-medium">Tenant:</span>
      <Select
        value={currentTenantId || undefined}
        onValueChange={(value) => switchTenant(value)}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select tenant" />
        </SelectTrigger>
        <SelectContent>
          {tenants.map((tenant) => (
            <SelectItem key={tenant.id} value={tenant.id}>
              {tenant.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}