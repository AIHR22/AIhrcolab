'use client'

import { ResponsiveContainer, LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

interface LineChartProps {
  data: Array<{
    [key: string]: string | number
  }>
  dataKey: string
  xAxisKey?: string
  stroke?: string
  className?: string
}

export function LineChart({
  data,
  dataKey,
  xAxisKey = 'name',
  stroke = '#0ea5e9',
  className,
}: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <RechartsLineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xAxisKey} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey={dataKey} stroke={stroke} activeDot={{ r: 8 }} />
      </RechartsLineChart>
    </ResponsiveContainer>
  )
}
