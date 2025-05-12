// Revenue Trends Helper Functions
import { useEffect, useState } from 'react';
import { useRevenueProjectionModel } from '@/app/hooks/use-revenue-projection-model';

// Type definitions
export interface RevenueTrendData {
  month: string;
  actual: number | null;  // Updated to allow null values
  projected: number;
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
  const { 
    monthlyRevenue,
    previewMonthlyRevenue,
    params,
    previewParams,
    isLoading,
    errors: modelErrors
  } = useRevenueProjectionModel();
  
  const [data, setData] = useState<RevenueTrendData[]>([]);

  useEffect(() => {
    // Generate trend data based on the model's revenue projections
    const now = new Date();
    const trendData: RevenueTrendData[] = [];

    // Use preview values for real-time updates
    const currentMonthlyRevenue = previewMonthlyRevenue || monthlyRevenue;
    const currentGrowthRate = previewParams.growthRate || params.growthRate;

    for (let i = 0; i < months; i++) {
      const date = new Date(now);
      date.setMonth(date.getMonth() + i);
      const monthStr = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      
      // For past months use actual values, for future months use projections
      if (i < 6) { // Assuming first 6 months are actual data
        const actualRevenue = currentMonthlyRevenue * (1 + (i * 0.02)); // Small growth for historical data
        trendData.push({
          month: monthStr,
          actual: actualRevenue,
          projected: 0
        });
      } else {
        const projectedGrowth = currentGrowthRate / 100 / 12 * (i - 6);
        trendData.push({
          month: monthStr,
          actual: null,
          projected: currentMonthlyRevenue * (1 + projectedGrowth) // Growth based on current/preview params
        });
      }
    }
    
    setData(trendData);
  }, [monthlyRevenue, previewMonthlyRevenue, months, params.growthRate, previewParams.growthRate]);

  return {
    data: data.length > 0 ? data : MOCK_REVENUE_TRENDS,
    isLoading,
    error: Object.keys(modelErrors).length > 0 ? 'Model validation errors' : null
  };
}

// Generate projected revenue data based on actual data and growth rate
export function generateProjections(baseData: RevenueTrendData[], growthRate: number): RevenueTrendData[] {
  return baseData.map((point, index) => {
    const growthFactor = Math.pow(1 + growthRate / 100, index / 12);
    return {
      ...point,
      projected: (point.actual ?? point.projected) * growthFactor
    };
  });
}
