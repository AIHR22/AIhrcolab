import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export interface RevenueMetrics {
  monthly: number;
  annual: number;
  projected: number;
  profitMargin: number;
  _debug?: {
    currentMonthStart: string;
    yearAgoStart: string;
    dataPoints: number;
    avgMonthlyRevenue: number;
    employeeMetrics: {
      count: number;
      avgSalary: number;
      totalSalary: number;
      revenuePerEmployee: number;
    };
    modelParams: {
      name: string;
      employee_count: number;
      avg_salary: number;
      revenue_per_employee: number;
      growth_rate: number;
      created_at: string;
    };
  };
}

export interface MonthlyComparison {
  period: string;
  current: number;
  previous: number;
}

export interface RevenueTrend {
  date: string;
  amount: number;
  growthRate: number;
}

export interface RevenueHistory {
  date: string;
  amount: number;
  type: string;
}

export function useRevenueData() {
  // Current metrics
  const { data: metrics, error: metricsError } = useSWR<RevenueMetrics>(
    '/api/revenue/company/current',
    fetcher
  );

  // Monthly comparison
  const { data: monthlyComparison, error: comparisonError } = useSWR<MonthlyComparison[]>(
    '/api/revenue/company/comparison?period=monthly',
    fetcher
  );

  // Trends data (12 months)
  const { data: trends, error: trendsError } = useSWR<RevenueTrend[]>(
    '/api/revenue/company/trends?months=12',
    fetcher
  );

  // History data
  const { data: history, error: historyError } = useSWR<RevenueHistory[]>(
    '/api/revenue/company/history',
    fetcher
  );

  return {
    metrics,
    monthlyComparison,
    trends,
    history,
    isLoading: !metrics && !metricsError,
    isError: metricsError || comparisonError || trendsError || historyError
  };
} 