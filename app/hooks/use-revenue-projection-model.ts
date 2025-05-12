import { useState, useCallback, useMemo } from 'react';
import { z } from 'zod';
import { useToast } from '@/components/ui/use-toast';

// Validation schema
const ProjectionModelSchema = z.object({
  employeeCount: z.number().min(0, 'Employee count must be positive'),
  averageSalary: z.number().min(0, 'Average salary must be positive'),
  revenuePerEmployee: z.number().min(0, 'Revenue per employee must be positive'),
  growthRate: z.number().min(0).max(100, 'Growth rate must be between 0 and 100'),
  projectionTimeframe: z.enum(['6months', '12months', '24months'])
});

type ProjectionModelParams = z.infer<typeof ProjectionModelSchema>;

interface UseRevenueProjectionModelReturn {
  // Model parameters
  params: ProjectionModelParams;
  previewParams: ProjectionModelParams;
  // Update functions
  updateParam: (field: keyof ProjectionModelParams, value: number | string) => void;
  resetParams: () => void;
  applyParams: () => Promise<void>;
  // Calculated metrics
  monthlyRevenue: number;
  annualRevenue: number;
  projectedRevenue: number;
  profitMargin: number;
  // Preview metrics
  previewMonthlyRevenue: number;
  previewAnnualRevenue: number;
  previewProjectedRevenue: number;
  previewProfitMargin: number;
  // Loading states
  isLoading: boolean;
  errors: Partial<Record<keyof ProjectionModelParams, string>>;
}

const DEFAULT_PARAMS: ProjectionModelParams = {
  employeeCount: 100,
  averageSalary: 60000,
  revenuePerEmployee: 10000,
  growthRate: 5.0,
  projectionTimeframe: '12months'
};

export function useRevenueProjectionModel(): UseRevenueProjectionModelReturn {
  const { toast } = useToast();
  const [params, setParams] = useState<ProjectionModelParams>(DEFAULT_PARAMS);
  const [previewParams, setPreviewParams] = useState<ProjectionModelParams>(DEFAULT_PARAMS);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ProjectionModelParams, string>>>({});

  // Update a single parameter
  const updateParam = useCallback((field: keyof ProjectionModelParams, value: number | string) => {
    let parsedValue: number | string = value;
    
    // Parse numeric values
    if (field !== 'projectionTimeframe') {
      parsedValue = Number(value);
      if (isNaN(parsedValue)) return;
    }

    // Update preview params immediately
    setPreviewParams(prev => ({
      ...prev,
      [field]: parsedValue
    }));

    // Validate the new value
    const result = ProjectionModelSchema.safeParse({
      ...previewParams,
      [field]: parsedValue
    });

    if (!result.success) {
      const fieldError = result.error.errors.find(err => err.path[0] === field);
      if (fieldError) {
        setErrors(prev => ({
          ...prev,
          [field]: fieldError.message
        }));
      }
    } else {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  }, [previewParams]);

  // Reset parameters to defaults
  const resetParams = useCallback(() => {
    setParams(DEFAULT_PARAMS);
    setPreviewParams(DEFAULT_PARAMS);
    setErrors({});
  }, []);

  // Apply preview parameters
  const applyParams = useCallback(async () => {
    setIsLoading(true);
    try {
      // Validate all parameters
      const result = ProjectionModelSchema.safeParse(previewParams);
      if (!result.success) {
        const newErrors: Partial<Record<keyof ProjectionModelParams, string>> = {};
        result.error.errors.forEach(err => {
          const field = err.path[0] as keyof ProjectionModelParams;
          newErrors[field] = err.message;
        });
        setErrors(newErrors);
        return;
      }

      // TODO: Add API call here when backend is ready
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call

      // Update actual params with preview params
      setParams(previewParams);
      setErrors({});
      
      toast({
        title: "Parameters updated",
        description: "Revenue projection model has been updated successfully."
      });
    } catch (error) {
      console.error('Error updating parameters:', error);
      toast({
        title: "Error",
        description: "Failed to update revenue projection model.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [previewParams, toast]);

  // Calculate metrics for actual params
  const metrics = useMemo(() => {
    const monthlyRevenue = params.employeeCount * params.revenuePerEmployee;
    const annualRevenue = monthlyRevenue * 12;
    const projectedRevenue = annualRevenue * (1 + params.growthRate / 100);
    const totalSalaries = params.employeeCount * params.averageSalary;
    const profitMargin = annualRevenue === 0 ? 0 : ((annualRevenue - totalSalaries) / annualRevenue) * 100;

    return {
      monthlyRevenue,
      annualRevenue,
      projectedRevenue,
      profitMargin
    };
  }, [params]);

  // Calculate preview metrics
  const previewMetrics = useMemo(() => {
    const monthlyRevenue = previewParams.employeeCount * previewParams.revenuePerEmployee;
    const annualRevenue = monthlyRevenue * 12;
    const projectedRevenue = annualRevenue * (1 + previewParams.growthRate / 100);
    const totalSalaries = previewParams.employeeCount * previewParams.averageSalary;
    const profitMargin = annualRevenue === 0 ? 0 : ((annualRevenue - totalSalaries) / annualRevenue) * 100;

    return {
      previewMonthlyRevenue: monthlyRevenue,
      previewAnnualRevenue: annualRevenue,
      previewProjectedRevenue: projectedRevenue,
      previewProfitMargin: profitMargin
    };
  }, [previewParams]);

  return {
    params,
    previewParams,
    updateParam,
    resetParams,
    applyParams,
    isLoading,
    errors,
    ...metrics,
    ...previewMetrics
  };
} 