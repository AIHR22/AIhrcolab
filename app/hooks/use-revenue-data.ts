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

export function useRevenueData() {
  const { data, error, isLoading } = useSWR<RevenueMetrics>('/api/revenue/company/current', fetcher);

  return {
    metrics: data,
    isLoading,
    isError: error,
    revenueError: error
  };
}