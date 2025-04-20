interface RevenueTrend {
  amount: number;
  date: string;
  growthRate: number;
}

export function generateProjections(baseData: RevenueTrend[], growthRateAdjustment: number): RevenueTrend[] {
  if (!baseData || baseData.length === 0) return [];

  // Create a copy of the base data
  const projectedData = [...baseData];
  
  // Get the last data point
  const lastDataPoint = baseData[baseData.length - 1];
  const lastDate = new Date(lastDataPoint.date);
  const lastAmount = lastDataPoint.amount;

  // Generate 12 months of projections
  for (let i = 1; i <= 12; i++) {
    const projectedDate = new Date(lastDate);
    projectedDate.setMonth(lastDate.getMonth() + i);

    // Calculate projected amount with compound growth
    const monthlyGrowthRate = (1 + growthRateAdjustment / 100) ** (1/12) - 1;
    const projectedAmount = lastAmount * (1 + monthlyGrowthRate) ** i;

    projectedData.push({
      date: projectedDate.toISOString().split('T')[0],
      amount: Math.round(projectedAmount),
      growthRate: monthlyGrowthRate * 100
    });
  }

  return projectedData;
}
