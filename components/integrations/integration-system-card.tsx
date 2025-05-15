'use client';

import { useState } from 'react';
import { Card, CardHeader, CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IntegrationConnectDialog } from './integration-connect-dialog';

interface IntegrationSystemCardProps {
  value: string;
  label: string;
  description: string;
}

export function IntegrationSystemCard({ value, label, description }: IntegrationSystemCardProps) {
  const [showConnectDialog, setShowConnectDialog] = useState(false);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between space-y-0">
          <div>
            <CardTitle className="text-xl font-semibold">{label}</CardTitle>
            <CardDescription className="mt-2">{description}</CardDescription>
          </div>
          <Button
            onClick={() => setShowConnectDialog(true)}
            className="ml-4"
          >
            Connect
          </Button>
        </div>
      </CardHeader>

      <IntegrationConnectDialog
        isOpen={showConnectDialog}
        onClose={() => setShowConnectDialog(false)}
        systemType={value}
        systemLabel={label}
      />
    </Card>
  );
}