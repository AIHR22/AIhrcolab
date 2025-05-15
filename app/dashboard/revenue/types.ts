import type { CustomTooltipProps, ChartConfig } from '@/types/shared';

// Type definitions
export type ViewMode = 'company-wide' | 'department' | 'project-based';
export type TabOption = 'current-view' | 'project-view' | 'overview' | 'what-if' | 'comparison' | 'forecast' | 'History';
export type ComparisonPeriod = 'monthly' | 'quarterly' | 'yearly';
export type ComparisonMetric = 'revenue' | 'growth';

export type Department = {
  id: string;
  name: string;
  budget: number;
  headcount: number;
  revenue_per_employee: number;
  total_revenue: number;
};

export type SectionVisibility = {
  [key: string]: boolean;
};

export type DepartmentRevenueApiResponse = {
  id: string;
  name: string;
  currentRevenue: number;
  projectedRevenue: number;
  growthRate: number;
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
};

// Chat related types
export interface ChatInputProps {
  placeholder?: string;
  onSend?: (text: string) => Promise<void>;
  onSubmit?: (text: string) => void;
  disabled?: boolean;
}

// Scenario related types
export interface CustomScenarios {
  newContracts: number;
  attritionRate: number;
  marketingSpend: number;
  exchangeRate: number;
  paymentDelay: number;
  revenueChange: number;
  salaryIncrease: number;
}

export interface WhatIfScenario {
  id: string;
  name: string;
  impact: number;
  category: string;
}

// Re-export shared types
export type { CustomTooltipProps, ChartConfig }; 