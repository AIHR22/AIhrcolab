// Shared type definitions for components and features

// Chart related types
export interface ChartConfig {
  current?: {
    label: string;
    color: string;
  };
  previous?: {
    label: string;
    color: string;
  };
  [key: string]: {
    label: string;
    color: string;
  } | undefined;
}

export interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

// Chat related types
export interface ChatInputProps {
  placeholder?: string;
  onSend?: (text: string) => Promise<void>;
  onSubmit?: (text: string) => void;
  disabled?: boolean;
}

// Scenario related types
export interface CustomScenarios {
  id: string;
  name: string;
  impact: number;
  category: string;
  revenueChange: number;
  marketingSpend: number;
  exchangeRate: number;
  paymentDelay: number;
  salaryIncrease: number;
  newContracts: number;
} 