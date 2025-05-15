import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface ProjectionModelParams {
  employee_count: number;
  avg_salary: number;
  revenue_per_employee: number;
  growth_rate: number;
  projection_timeframe: '6months' | '12months' | '24months';
}

const defaultParams: ProjectionModelParams = {
  employee_count: 100,
  avg_salary: 75000,
  revenue_per_employee: 10000,
  growth_rate: 5,
  projection_timeframe: '12months'
};

export function useRevenueProjectionModel() {
  const { toast } = useToast();
  const [params, setParams] = useState<ProjectionModelParams>(defaultParams);
  const [isLoading, setIsLoading] = useState(false);

  // Update a single parameter
  const updateParam = (field: keyof ProjectionModelParams, value: number | string) => {
    setParams(prev => ({
      ...prev,
      [field]: typeof value === 'string' ? parseFloat(value) || 0 : value
    }));
  };

  // Apply parameters
  const applyParams = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/revenue/company/model', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      
      if (!response.ok) {
        throw new Error('Failed to apply changes');
      }
      
      toast({
        title: 'Success',
        description: 'Changes applied successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to apply changes',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    params,
    updateParam,
    applyParams,
    isLoading
  };
} 