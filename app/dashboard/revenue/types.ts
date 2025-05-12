// Type definitions
export type ViewMode = "company-wide" | "project-based"
export type TabOption = "current-view" | "project-view" | "comparison" | "what-if" | "History"
export type ComparisonPeriod = "monthly" | "quarterly" | "yearly"
export type ComparisonMetric = "revenue" | "growth" | "profitability"

export interface Department {
  id: string;
  name: string;
  headcount: number;
  revenue_per_employee: number;
  total_revenue: number;
  currentRevenue?: number;
  previousRevenue?: number;
  percentChange?: number;
}

export interface ChartConfig {
  actual?: {
    label: string;
    color: string;
  };
  projected?: {
    label: string;
    color: string;
  };
  current?: {
    label: string;
    color: string;
  };
  previous?: {
    label: string;
    color: string;
  };
}

export interface SectionVisibility {
  metrics: boolean
  projectionModel: boolean
  revenueTrends: boolean
  profitabilitySimulator: boolean
  departmentRevenue: boolean
  whatIfScenario: boolean
  projectMetrics: boolean
  departmentAllocation: boolean
  projectTimeline: boolean;
}

export interface DepartmentRevenueApiResponse {
  departments: Department[];
  metrics: {
    totalRevenue: number;
    projectedGrowth: number;
    topPerformer: string;
    quickStats: {
      monthlyAverage: number;
      quarterlyGrowth: number;
      yearlyProjection: number;
    };
  };
}

export interface CustomScenarios {
  newContracts: number;
  attritionRate: number;
  marketingSpend: number;
  exchangeRate: number;
  paymentDelay: number;
  revenueChange: number;
  salaryIncrease: number;
}

export interface ChatInputProps {
  placeholder: string;
  onSend: (text: string) => Promise<void>;
} 