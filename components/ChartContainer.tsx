import { ReactNode } from 'react';
import { cn } from "@/lib/utils"

interface ChartConfig {
  current: {
    label: string;
    color: string;
  };
  previous: {
    label: string;
    color: string;
  };
}

interface ChartContainerProps {
  children?: ReactNode;
  config: ChartConfig;
  className?: string;
}

export function ChartContainer({ children, config, className }: ChartContainerProps) {
  return (
    <div className={cn("relative", className)}>
      <div className="absolute top-0 right-0 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: config.current.color }} />
          <span className="text-sm text-muted-foreground">{config.current.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: config.previous.color }} />
          <span className="text-sm text-muted-foreground">{config.previous.label}</span>
        </div>
      </div>
      {children}
    </div>
  );
}
