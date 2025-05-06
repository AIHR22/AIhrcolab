'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

interface Credentials {
  clientId?: string;
  clientSecret?: string;
  apiKey?: string;
  username?: string;
  password?: string;
  instanceUrl?: string;
  file?: File;
}

interface IntegrationConnectFormProps {
  systemType: string;
  onConnect: (credentials: Credentials) => Promise<void>;
}

export function IntegrationConnectForm({ systemType, onConnect }: IntegrationConnectFormProps) {
  const [credentials, setCredentials] = useState<Credentials>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onConnect(credentials);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect');
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => {
    switch (systemType) {
      case 'workday':
        return (
          <>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clientId">Client ID</Label>
                <Input
                  id="clientId"
                  value={credentials.clientId || ''}
                  onChange={(e) => setCredentials({ ...credentials, clientId: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientSecret">Client Secret</Label>
                <Input
                  id="clientSecret"
                  type="password"
                  value={credentials.clientSecret || ''}
                  onChange={(e) => setCredentials({ ...credentials, clientSecret: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instanceUrl">Instance URL</Label>
                <Input
                  id="instanceUrl"
                  type="url"
                  value={credentials.instanceUrl || ''}
                  onChange={(e) => setCredentials({ ...credentials, instanceUrl: e.target.value })}
                  required
                  placeholder="https://wd2-impl-services1.workday.com/"
                />
              </div>
            </div>
          </>
        );

      case 'sap':
        return (
          <>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={credentials.apiKey || ''}
                  onChange={(e) => setCredentials({ ...credentials, apiKey: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instanceUrl">Instance URL</Label>
                <Input
                  id="instanceUrl"
                  type="url"
                  value={credentials.instanceUrl || ''}
                  onChange={(e) => setCredentials({ ...credentials, instanceUrl: e.target.value })}
                  required
                  placeholder="https://api.successfactors.eu/"
                />
              </div>
            </div>
          </>
        );

      case 'csv_file':
        return (
          <>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file">Upload CSV File</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFile(file);
                      setCredentials({ ...credentials, file });
                    }
                  }}
                  required
                />
              </div>
            </div>
          </>
        );

      default:
        return <div>Unsupported system type</div>;
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {renderForm()}
        
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            'Connect'
          )}
        </Button>
      </form>
    </Card>
  );
}