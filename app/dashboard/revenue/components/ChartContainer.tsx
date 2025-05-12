import { ReactNode } from 'react';

export interface ChartConfig {
  current?: {
    label: string;
    color: string;
  };
  previous?: {
    label: string;
    color: string;
  };
  actual?: {
    label: string;
    color: string;
  };
  projected?: {
    label: string;
    color: string;
  };
}

interface ChartContainerProps {
  children: ReactNode;
  config: ChartConfig;
  className?: string;
}

export function ChartContainer({ children, config, className = '' }: ChartContainerProps) {
  return (
    <div className={`relative ${className}`}>
      {children}
    </div>
  );
} 