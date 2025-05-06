// Revenue Trends Helper Functions
import { useState, useEffect } from 'react';

// Type definitions
export type RevenueTrendData = {
  month: string;
  actual: number | null;
  projected: number | null;
};

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
export function useRevenueTrends(selectedMonths: number = 12) {
  const [data, setData] = useState<RevenueTrendData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Use POST method to fetch revenue trends data with credentials
        const response = await fetch('/api/revenue/trends', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ months: selectedMonths }),
          credentials: 'include' // Include cookies in the request
        });
        
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        
        const apiData = await response.json();
        
        // Transform API data to match RevenueTrendData format
        if (apiData && apiData.trends && Array.isArray(apiData.trends)) {
          const transformedData = apiData.trends.map((item: { amount: number; date: string; growthRate: number }) => {
            const date = new Date(item.date);
            const month = date.toLocaleString('default', { month: 'short' });
            
            return {
              month,
              actual: item.amount,
              projected: null // API doesn't provide projected values
            };
          });
          
          setData(transformedData);
        } else {
          // If API response format is unexpected, use mock data
          console.warn('Unexpected API response format, using mock data');
          setData(MOCK_REVENUE_TRENDS);
        }
      } catch (err) {
        // Log error but still provide mock data to prevent UI breakage
        console.error('Error fetching revenue trends:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setData(MOCK_REVENUE_TRENDS);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [selectedMonths]);
  
  return { data, isLoading, error };
}

// Generate projected revenue data based on actual data and growth rate
export function generateProjections(
  actualData: RevenueTrendData[], 
  growthRate: number = 5.0, 
  projectionMonths: number = 6
): RevenueTrendData[] {
  if (!actualData.length) return [];
  
  // Find last month with actual data
  const lastActualIndex = actualData.findIndex(item => item.actual === null) - 1;
  const lastActualMonth = lastActualIndex >= 0 ? actualData[lastActualIndex] : actualData[actualData.length - 1];
  
  if (!lastActualMonth || lastActualMonth.actual === null) return actualData;
  
  // Generate projections
  const result = [...actualData];
  const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Start from last actual month
  let lastValue = lastActualMonth.actual;
  
  // Update projection for existing months
  for (let i = 0; i < result.length; i++) {
    if (result[i].actual === null) {
      // Monthly growth factor (converting annual rate to monthly)
      const growthFactor = Math.pow(1 + growthRate / 100, 1/12);
      lastValue = lastValue * growthFactor;
      result[i].projected = Math.round(lastValue);
    }
  }
  
  // Add additional months if needed
  const lastMonthIndex = monthOrder.indexOf(result[result.length - 1].month);
  for (let i = 1; i <= projectionMonths; i++) {
    const monthIndex = (lastMonthIndex + i) % 12;
    const growthFactor = Math.pow(1 + growthRate / 100, 1/12);
    lastValue = lastValue * growthFactor;
    
    result.push({
      month: monthOrder[monthIndex],
      actual: null,
      projected: Math.round(lastValue)
    });
  }
  
  return result;
}
