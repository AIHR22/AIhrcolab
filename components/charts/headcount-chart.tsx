"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"

interface HeadcountChartProps {
  data: {
    month: string;
    headcount: number;
  }[];
}

export function HeadcountChart({ data }: HeadcountChartProps) {
  // Format the month for display (e.g., "2023-01" to "Jan 2023")
  const formattedData = data.map(item => ({
    ...item,
    formattedMonth: new Date(item.month).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
  }));

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart
        data={formattedData}
        margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="formattedMonth" 
          tick={{ fontSize: 12 }}
          angle={-45}
          textAnchor="end"
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          domain={['auto', 'auto']}
          label={{ value: 'Headcount', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
        />
        <Tooltip 
          formatter={(value) => [`${value} employees`, 'Headcount']}
          labelFormatter={(label) => `Month: ${label}`}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="headcount" 
          name="Headcount"
          stroke="#2563eb" 
          strokeWidth={2}
          activeDot={{ r: 8 }} 
        />
      </LineChart>
    </ResponsiveContainer>
  );
}