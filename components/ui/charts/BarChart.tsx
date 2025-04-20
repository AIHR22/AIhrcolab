'use client'

import { ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

interface BarChartProps {
  data: Array<{
    [key: string]: string | number
  }>
  dataKey: string
  xAxisKey?: string
  fill?: string
  className?: string
}

export function BarChart({
  data,
  dataKey,
  xAxisKey = 'name',
  fill = '#0ea5e9',
  className,
}: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <RechartsBarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xAxisKey} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey={dataKey} fill={fill} />
      </RechartsBarChart>
    </ResponsiveContainer>
  )
}
