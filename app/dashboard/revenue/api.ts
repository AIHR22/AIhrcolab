import { DepartmentRevenueApiResponse } from './types';
import { mockDepartmentData } from './utils';

interface ApiResponseForecast {
  amount: number;
  date: string;
  periodType: string;
  factors?: {
    historical_trend?: number;
    seasonal_factors?: number;
    market_conditions?: number;
    other_factors?: string;
  };
  departmentId?: string;
  total?: number;
  department_revenue?: Record<string, number>;
}

interface ForecastApiResponse {
  forecasts: ApiResponseForecast[];
  success?: boolean;
  error?: string;
}

interface DepartmentData {
  currentRevenue: number;
  previousRevenue: number;
  percentChange: number;
}

interface MonthlyMetrics {
  total: number;
  departments: Record<string, DepartmentData>;
}

interface DepartmentMetrics {
  [key: string]: MonthlyMetrics;
}

export const getRevenueForecast = async (): Promise<DepartmentRevenueApiResponse | null> => {
  try {
    const response = await fetch('/api/revenue/forecast', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer test_token`
      },
      body: JSON.stringify({
        months: 12
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API request failed with status ${response.status}`);
    }

    const data = await response.json() as ForecastApiResponse;
    
    if (!data.forecasts || !Array.isArray(data.forecasts) || data.forecasts.length === 0) {
      console.warn('API returned empty or invalid forecasts data:', data);
      return null;
    }

    const departmentMetrics = data.forecasts.reduce<DepartmentMetrics>((acc, forecast: ApiResponseForecast) => {
      const date = new Date(forecast.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          total: 0,
          departments: {}
        };
      }
      
      if (forecast.department_revenue) {
        const departmentRevenues = forecast.department_revenue as Record<string, number>;
        Object.entries(departmentRevenues).forEach(([deptId, revenue]) => {
          if (!acc[monthKey].departments[deptId]) {
            acc[monthKey].departments[deptId] = {
              currentRevenue: revenue,
              previousRevenue: 0,
              percentChange: 0
            };
          } else {
            acc[monthKey].departments[deptId].currentRevenue = revenue;
          }
        });
      } else if (forecast.departmentId) {
        const deptId = forecast.departmentId;
        const revenue = forecast.amount || 0;
        
        if (!acc[monthKey].departments[deptId]) {
          acc[monthKey].departments[deptId] = {
            currentRevenue: revenue,
            previousRevenue: 0,
            percentChange: 0
          };
        } else {
          acc[monthKey].departments[deptId].currentRevenue = revenue;
        }
      } else if (forecast.amount) {
        const deptId = 'total';
        if (!acc[monthKey].departments[deptId]) {
          acc[monthKey].departments[deptId] = {
            currentRevenue: forecast.amount,
            previousRevenue: 0,
            percentChange: 0
          };
        } else {
          acc[monthKey].departments[deptId].currentRevenue = forecast.amount;
        }
      }
      
      const departmentValues = Object.values(acc[monthKey].departments) as DepartmentData[];
      acc[monthKey].total = departmentValues.reduce<number>(
        (sum, dept) => sum + dept.currentRevenue,
        0
      );
      return acc;
    }, {});

    const months = Object.keys(departmentMetrics).sort();
    const latestMonth = months[months.length - 1];
    const previousMonth = months[months.length - 2] || latestMonth;

    if (!latestMonth) {
      throw new Error('No forecast data available');
    }

    const departments = Object.entries(departmentMetrics[latestMonth].departments).map(([id, data]) => {
      const prev = departmentMetrics[previousMonth]?.departments[id]?.currentRevenue || 0;
      return {
        id,
        name: mockDepartmentData.find(d => d.id === id)?.name || id,
        currentRevenue: data.currentRevenue,
        previousRevenue: prev,
        percentChange: prev === 0 ? 0 : ((data.currentRevenue - prev) / prev * 100)
      };
    });

    const sortedDepartments = [...departments].sort((a, b) => b.currentRevenue - a.currentRevenue);

    return {
      departments: departments as any[], // Type assertion since we know the structure matches
      metrics: {
        totalRevenue: departmentMetrics[latestMonth].total,
        projectedGrowth: ((departmentMetrics[latestMonth].total - 
          (departmentMetrics[previousMonth]?.total || 0)) / 
          (departmentMetrics[previousMonth]?.total || 1)) * 100,
        topPerformer: sortedDepartments[0]?.name || 'N/A',
        quickStats: {
          monthlyAverage: months.reduce((sum, month) => sum + departmentMetrics[month].total, 0) / months.length,
          quarterlyGrowth: ((departmentMetrics[latestMonth].total - 
            (departmentMetrics[previousMonth]?.total || 0)) / 
            (departmentMetrics[previousMonth]?.total || 1)) * 100,
          yearlyProjection: departmentMetrics[latestMonth].total * 12
        }
      }
    };
  } catch (error) {
    console.error('Error fetching revenue forecast:', error);
    return null;
  }
}; 