'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SchemaInference } from './schema-inference';
import { toast } from '@/components/ui/use-toast';

interface ERPIntegration {
  id: string;
  name: string;
  provider: string;
  api_endpoint: string;
  sync_frequency: string;
  status: string;
  last_sync?: string;
}

const ERPIntegrationSettings = () => {
  const [integrations, setIntegrations] = useState<ERPIntegration[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSchemaInference, setShowSchemaInference] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    provider: 'custom',
    connection_string: '',
    sync_frequency: 'manual',
    mapping: {
      employees: {
        id: 'employee_id',
        firstName: 'first_name',
        lastName: 'last_name',
        email: 'email',
        department: 'department_id'
      }
    }
  });

  const handleMappingConfirmed = (mapping: Record<string, string>) => {
    setFormData(prev => ({
      ...prev,
      mapping: {
        employees: mapping
      }
    }));
    setShowSchemaInference(false);
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const response = await fetch('/api/integrations/erp-direct');
      const data = await response.json();
      if (data.success) {
        setIntegrations(data.data);
      }
    } catch (error) {
      console.error('Error fetching integrations:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch integrations',
        variant: 'destructive'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/integrations/erp-direct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: 'Success',
          description: 'Integration configured successfully'
        });
        fetchIntegrations();
        // Reset form
        setFormData({
          name: '',
          provider: 'custom',
          connection_string: '',
          sync_frequency: 'manual',
          mapping: {
            employees: {
              id: 'employee_id',
              firstName: 'first_name',
              lastName: 'last_name',
              email: 'email',
              department: 'department_id'
            }
          }
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to configure integration',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (integrationId: string) => {
    try {
      const response = await fetch('/api/integrations/erp-direct', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ integration_id: integrationId })
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: 'Success',
          description: `Synced ${data.data.synced_records} records`
        });
        fetchIntegrations();
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to sync',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      {showSchemaInference && (
        <SchemaInference
          onMappingConfirmed={handleMappingConfirmed}
          connectionString={formData.connection_string}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Configure ERP Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <label htmlFor="name">Integration Name</label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="provider">Provider</label>
                <Select
                  id="provider"
                  value={formData.provider}
                  onValueChange={(value) => setFormData({ ...formData, provider: value })}
                >
                  <option value="custom">Custom</option>
                  <option value="workday">Workday</option>
                  <option value="sap">SAP</option>
                  <option value="oracle">Oracle</option>
                </Select>
              </div>
              <div className="grid gap-2">
                <label htmlFor="connection_string">Connection String</label>
                <Input
                  id="connection_string"
                  value={formData.connection_string}
                  onChange={(e) => setFormData({ ...formData, connection_string: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="sync_frequency">Sync Frequency</label>
                <Select
                  id="sync_frequency"
                  value={formData.sync_frequency}
                  onValueChange={(value) => setFormData({ ...formData, sync_frequency: value })}
                >
                  <option value="manual">Manual</option>
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </Select>
              </div>
            </div>
            <div className="space-y-4">
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={() => setShowSchemaInference(true)}
              >
                Analyze & Map Columns
              </Button>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Configuring...' : 'Configure Integration'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {showSchemaInference && (
        <SchemaInference
          onMappingConfirmed={handleMappingConfirmed}
          connectionString={formData.connection_string}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Active Integrations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {integrations.map((integration) => (
              <div
                key={integration.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <h3 className="font-medium">{integration.name}</h3>
                  <p className="text-sm text-gray-500">
                    {integration.provider} • {integration.sync_frequency} sync
                  </p>
                  {integration.last_sync && (
                    <p className="text-sm text-gray-500">
                      Last synced: {new Date(integration.last_sync).toLocaleString()}
                    </p>
                  )}
                </div>
                <Button
                  onClick={() => handleSync(integration.id)}
                  variant="outline"
                >
                  Sync Now
                </Button>
              </div>
            ))}
            {integrations.length === 0 && (
              <p className="text-center text-gray-500">
                No integrations configured yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ERPIntegrationSettings;