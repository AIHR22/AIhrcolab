'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { IntegrationConnectForm } from './integration-connect-form';
import { toast } from '@/components/ui/use-toast';

interface IntegrationConnectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  systemType: string;
  systemLabel: string;
}

export function IntegrationConnectDialog({
  isOpen,
  onClose,
  systemType,
  systemLabel,
}: IntegrationConnectDialogProps) {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async (credentials: any) => {
    setIsConnecting(true);
    try {
      const response = await fetch('/api/integrations/simplified?action=test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_type: systemType,
          config: credentials
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to connect');
      }

      toast({
        title: 'Connection Successful',
        description: `Successfully connected to ${systemLabel}`,
      });

      onClose();
    } catch (error) {
      console.error('Connection error:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect to {systemLabel}</DialogTitle>
        </DialogHeader>
        <IntegrationConnectForm 
          systemType={systemType}
          onConnect={handleConnect}
        />
      </DialogContent>
    </Dialog>
  );
}