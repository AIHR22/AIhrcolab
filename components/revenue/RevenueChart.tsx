"use client"

import { useRevenueRealtime } from "@/hooks/use-revenue-realtime"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"

export function RevenueChart() {
  const { revenueData, loading, error } = useRevenueRealtime()

  if (loading) {
    return <Skeleton className="w-full h-[400px] bg-slate-800" />
  }

  if (error) {
    return <div className="text-gray-200">Error loading revenue data: {error.message}</div>
  }

  // Format currency for tooltip
  const formatCurrency = (value: number) => {
    if (!value && value !== 0) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Custom tooltip to show actual and projected values
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 p-4 border border-slate-700 rounded shadow text-gray-200">
          <p className="font-bold text-gray-200">{label}</p>
          {payload.map((entry: any, index: number) => (
            entry.value !== null && (
              <p key={index} style={{ color: entry.color }}>
                {entry.name}: {formatCurrency(entry.value)}
              </p>
            )
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[400px] p-4">
      <LineChart 
        width={800} 
        height={400} 
        data={revenueData}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke="#1e293b" 
          vertical={false}
        />
        <XAxis 
          dataKey="month" 
          stroke="#94a3b8"
          tick={{ fill: '#94a3b8' }}
        />
        <YAxis 
          tickFormatter={formatCurrency}
          width={100}
          stroke="#94a3b8"
          tick={{ fill: '#94a3b8' }}
          axisLine={{ stroke: '#1e293b' }}
        />
        <Tooltip 
          content={<CustomTooltip />}
          cursor={{ stroke: '#475569' }}
        />
        <Legend 
          wrapperStyle={{ color: '#94a3b8' }}
        />
        <Line
          type="monotone"
          dataKey="actual"
          stroke="#3b82f6"
          name="Actual Revenue"
          strokeWidth={2}
          dot={{ r: 4, fill: '#3b82f6' }}
          activeDot={{ r: 6, fill: '#3b82f6' }}
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="projected"
          stroke="#22c55e"
          name="Projected Revenue"
          strokeDasharray="5 5"
          strokeWidth={2}
          dot={{ r: 4, fill: '#22c55e' }}
          activeDot={{ r: 6, fill: '#22c55e' }}
          connectNulls
        />
      </LineChart>
    </div>
  )
} 