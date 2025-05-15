"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"

interface AttritionChartProps {
  data: {
    month: string;
    rate: number;
    predicted_attrition_count: number;
  }[];
}

export function AttritionChart({ data }: AttritionChartProps) {
  // Format the month for display (e.g., "2023-01" to "Jan 2023")
  const formattedData = data.map(item => ({
    ...item,
    formattedMonth: new Date(item.month).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }),
    // Convert rate to percentage for display
    ratePercentage: item.rate * 100
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart
        data={formattedData}
        margin={{ top: 10, right: 30, left: 0, bottom: 25 }}
      >
        <defs>
          <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="formattedMonth" 
          tick={{ fontSize: 12 }}
          angle={-45}
          textAnchor="end"
        />
        <YAxis 
          yAxisId="left"
          tick={{ fontSize: 12 }}
          label={{ value: 'Attrition Rate (%)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
        />
        <YAxis 
          yAxisId="right" 
          orientation="right" 
          tick={{ fontSize: 12 }}
          label={{ value: 'Attrition Count', angle: 90, position: 'insideRight', style: { textAnchor: 'middle' } }}
        />
        <Tooltip 
          formatter={(value, name) => {
            if (name === 'Attrition Rate') {
              return [`${value.toFixed(1)}%`, name];
            }
            return [value, name];
          }}
          labelFormatter={(label) => `Month: ${label}`}
        />
        <Legend />
        <Area 
          type="monotone" 
          dataKey="ratePercentage" 
          name="Attrition Rate" 
          stroke="#ef4444" 
          fillOpacity={1} 
          fill="url(#colorRate)" 
          yAxisId="left"
        />
        <Bar 
          dataKey="predicted_attrition_count" 
          name="Predicted Attrition" 
          fill="#64748b" 
          yAxisId="right"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}