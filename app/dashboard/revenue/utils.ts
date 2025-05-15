import { Department } from './types';

// Mock data
export const mockComparisonData = [
  { period: "Jan", current: 120000, previous: 100000 },
  { period: "Feb", current: 125000, previous: 105000 },
  { period: "Mar", current: 130000, previous: 110000 },
  { period: "Apr", current: 135000, previous: 115000 },
  { period: "May", current: 140000, previous: 120000 },
  { period: "Jun", current: 145000, previous: 125000 },
];

export const mockWhatIfScenarios = [
  { id: "1", name: "Revenue drops by 10% in Q2", impact: -350000, category: "revenue" },
  { id: "2", name: "Marketing spend increases by 25%", impact: -120000, category: "expense" },
  { id: "3", name: "Exchange rate shifts by 5%", impact: -80000, category: "financial" },
  { id: "4", name: "Vendor payments delayed by 30 days", impact: 45000, category: "cash-flow" },
  { id: "5", name: "All salaries increase by 8%", impact: -210000, category: "hr" },
];

export const mockProjects = [
  { id: "project-1", name: "Marketing Campaign Q2", status: "Active", revenue: 250000 },
  { id: "project-2", name: "New Product Launch", status: "Planning", revenue: 500000 },
  { id: "project-3", name: "Website Redesign", status: "Completed", revenue: 120000 },
];

export const mockDepartmentData: Department[] = [
  { id: 'eng', name: 'Engineering', headcount: 50, revenue_per_employee: 200000, total_revenue: 10000000 },
  { id: 'sales', name: 'Sales', headcount: 30, revenue_per_employee: 300000, total_revenue: 9000000 },
  { id: 'mktg', name: 'Marketing', headcount: 20, revenue_per_employee: 250000, total_revenue: 5000000 },
  { id: 'hr', name: 'Human Resources', headcount: 10, revenue_per_employee: 150000, total_revenue: 1500000 },
];

// Helper functions
export const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined) return "$0";
  return `$${value.toLocaleString()}`;
};

export const formatPercentage = (value: number | null | undefined, decimals = 1) => {
  if (value === null || value === undefined) return "--";
  return `${value.toFixed(decimals)}%`;
};

export const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const replayScenario = (scenario: { id: string; date: Date; summary: string; impact: number }) => {
  // TODO: Implement scenario replay logic using existing handlers
  return {
    title: "Replaying Scenario",
    description: `Replaying scenario from ${formatDate(scenario.date)}`,
  };
}; 