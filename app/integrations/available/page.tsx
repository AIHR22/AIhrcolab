'use client';

import { useEffect, useState } from 'react';
import { IntegrationSystemCard } from '@/components/integrations/integration-system-card';

interface System {
  value: string;
  label: string;
}

const systemDescriptions: Record<string, string> = {
  workday: 'Connect to Workday to automatically sync employee data, organizational structures, and HR processes.',
  sap: 'Integrate with SAP SuccessFactors to synchronize employee records, performance data, and HR workflows.',
  csv_file: 'Import employee data from CSV files for simple data migration and periodic updates.'
};

export default function AvailableIntegrationsPage() {
  const [systems, setSystems] = useState<System[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSystems = async () => {
      try {
        const response = await fetch('/api/integrations/simplified?systems=true');
        if (!response.ok) throw new Error('Failed to fetch systems');
        const data = await response.json();
        setSystems(data.filter((sys: System) => [
          'workday', 'sap', 'csv_file'
        ].includes(sys.value)));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load systems');
      } finally {
        setLoading(false);
      }
    };

    fetchSystems();
  }, []);

  if (loading) return <div>Loading available integrations...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Available Integrations</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {systems.map((system) => (
          <IntegrationSystemCard
            key={system.value}
            value={system.value}
            label={system.label}
            description={systemDescriptions[system.value] || ''}
          />
        ))}  
      </div>
    </div>
  );
}