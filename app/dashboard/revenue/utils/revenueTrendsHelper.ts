// Revenue Trends Helper Functions
import { useEffect, useState } from 'react';

// Type definitions
export interface RevenueTrendData {
  month: string;
  actual: number | null;  // Updated to allow null values
  projected: number | null;
}

// Types for projection data
interface ProjectionData {
  period_date: string;
  amount: number;
  is_projected: boolean;
}

// Mock data as fallback
const MOCK_REVENUE_TRENDS: RevenueTrendData[] = [
  { month: 'Jan', actual: 120000, projected: 110000 },
  { month: 'Feb', actual: 125000, projected: 115000 },
  { month: 'Mar', actual: 130000, projected: 120000 },
  { month: 'Apr', actual: 135000, projected: 125000 },
  { month: 'May', actual: 140000, projected: 130000 },
  { month: 'Jun', actual: 145000, projected: 135000 },
  { month: 'Jul', actual: 150000, projected: 140000 },
  { month: 'Aug', actual: null, projected: 145000 },
  { month: 'Sep', actual: null, projected: 150000 },
  { month: 'Oct', actual: null, projected: 155000 },
  { month: 'Nov', actual: null, projected: 160000 },
  { month: 'Dec', actual: null, projected: 165000 },
];

// Hook for fetching revenue trends data
export function useRevenueTrends(months: number = 12) {
  const [data, setData] = useState<RevenueTrendData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/revenue/company/trends');
        if (!response.ok) {
          throw new Error('Failed to fetch revenue trends');
        }
        const result = await response.json();
      
        // Transform API data to match our format
        const transformedData = result.trends.map((trend: any) => ({
          month: trend.month,
          actual: trend.actual,
          projected: trend.projected
        }));

        setData(transformedData);
      } catch (err) {
        console.error('Error fetching revenue data:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    // Refresh data every minute
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [months]);

  return {
    data,
    isLoading,
    error
  };
}

// Generate projected revenue data based on actual data and growth rate
export function generateProjections(baseData: RevenueTrendData[], growthRate: number): RevenueTrendData[] {
  return baseData.map((point, index) => {
    if (point.actual !== null) {
      return point; // Keep actual data as is
    }
    // For projected points, apply the growth rate
    const lastActualPoint = baseData.find(p => p.actual !== null);
    const baseValue = lastActualPoint ? lastActualPoint.actual! : point.projected!;
    const growthFactor = Math.pow(1 + growthRate / 100, index / 12);
    
    return {
      ...point,
      projected: baseValue * growthFactor
    };
  });
}
