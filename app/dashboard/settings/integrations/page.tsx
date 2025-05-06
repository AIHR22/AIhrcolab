'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

export default function IntegrationsPage() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<{ success: boolean; message?: string } | null>(null);

  const handleConnect = async () => {
    setIsConnecting(true);
    setConnectionStatus(null);

    try {
      // Implement actual connection logic here
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulated delay
      setConnectionStatus({ success: true, message: 'Successfully connected to the system' });
    } catch (error) {
      setConnectionStatus({ success: false, message: 'Failed to connect to the system' });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Integration Settings</h1>
      
      <Tabs defaultValue="erp" className="w-full">
        <TabsList>
          <TabsTrigger value="erp">ERP Systems</TabsTrigger>
          <TabsTrigger value="hris">HRIS</TabsTrigger>
          <TabsTrigger value="custom">Custom API</TabsTrigger>
        </TabsList>

        <TabsContent value="erp" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ERP System Integration</CardTitle>
              <CardDescription>
                Connect your ERP system to sync employee and department data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="system">Select System</Label>
                <Select value={selectedSystem} onValueChange={setSelectedSystem}>
                  <SelectTrigger id="system">
                    <SelectValue placeholder="Select an ERP system" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sap">SAP</SelectItem>
                    <SelectItem value="oracle">Oracle</SelectItem>
                    <SelectItem value="workday">Workday</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <Input id="api-key" type="password" placeholder="Enter your API key" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endpoint">API Endpoint</Label>
                <Input id="endpoint" type="url" placeholder="https://api.example.com" />
              </div>

              <Button
                onClick={handleConnect}
                disabled={isConnecting || !selectedSystem}
                className="w-full"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  'Connect'
                )}
              </Button>

              {connectionStatus && (
                <Alert variant={connectionStatus.success ? 'default' : 'destructive'}>
                  <AlertTitle>
                    {connectionStatus.success ? 'Success' : 'Error'}
                  </AlertTitle>
                  <AlertDescription>
                    {connectionStatus.message}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hris" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>HRIS Integration</CardTitle>
              <CardDescription>
                Connect your HRIS system to sync employee data and organizational structure
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Similar form structure as ERP, but with HRIS-specific fields */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom API Integration</CardTitle>
              <CardDescription>
                Configure a custom API integration with your internal systems
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Custom API configuration form */}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}