"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts"

interface DepartmentDistributionProps {
  data: {
    department_id: string;
    department_name: string;
    current_cost: number;
    optimized_cost: number;
    potential_savings: number;
  }[];
}

// Custom colors for the pie chart
const COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe', '#eff6ff', '#f8fafc'];

export function DepartmentDistribution({ data }: DepartmentDistributionProps) {
  // Format the data for the pie chart
  const formattedData = data.map((item, index) => ({
    name: item.department_name,
    value: item.current_cost,
    color: COLORS[index % COLORS.length]
  }));

  // Format currency for tooltip
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Pie
          data={formattedData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={120}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {formattedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value) => [formatCurrency(value as number), 'Current Cost']}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}