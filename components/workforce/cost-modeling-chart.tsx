"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DollarSign, Download, PieChart, TrendingUp, LineChart, ArrowRight } from "lucide-react"

interface CostCategory {
  name: string;
  value: number;
  color: string;
  growthRate?: number;
}

interface CostProjection {
  month: string; // Format: "YYYY-MM"
  value: number;
}

interface CostModelingChartProps {
  data: {
    department_id: string;
    department_name?: string;
    total_current_cost: number;
    total_projected_cost: number;
    categories: CostCategory[];
    projections: CostProjection[];
    year_over_year_change: number;
    budget_utilization: number;
    budget_allocation: number;
  };
}

export function CostModelingChart({ data }: CostModelingChartProps) {
  const {
    total_current_cost,
    total_projected_cost,
    categories,
    projections,
    year_over_year_change,
    budget_utilization,
    budget_allocation
  } = data;
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Calculate the maximum projection for chart scaling
  const maxProjection = Math.max(...projections.map(p => p.value));
  
  // Determine if we're over budget
  const isOverBudget = budget_utilization > 100;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center text-xl">
              <DollarSign className="mr-2 h-5 w-5" /> Cost Modeling
            </CardTitle>
            <CardDescription>
              Workforce cost projections and allocation
            </CardDescription>
          </div>
          <Badge variant={isOverBudget ? "destructive" : "outline"} className="ml-auto">
            {budget_utilization}% of Budget
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Current Cost</p>
            <p className="text-2xl font-bold">{formatCurrency(total_current_cost)}</p>
          </div>
          <div className="flex items-center text-sm">
            <ArrowRight className="h-4 w-4 mx-2 text-muted-foreground" />
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Projected End of Year</p>
            <div className="flex items-center justify-end space-x-2">
              <p className="text-2xl font-bold">{formatCurrency(total_projected_cost)}</p>
              <Badge 
                variant={year_over_year_change >= 0 ? "default" : "outline"}
                className={year_over_year_change >= 0 ? "bg-destructive" : ""}
              >
                {year_over_year_change >= 0 ? "+" : ""}{year_over_year_change}%
              </Badge>
            </div>
          </div>
        </div>

        <Tabs defaultValue="breakdown">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="breakdown" className="flex items-center">
              <PieChart className="h-4 w-4 mr-2" /> Cost Breakdown
            </TabsTrigger>
            <TabsTrigger value="projection" className="flex items-center">
              <LineChart className="h-4 w-4 mr-2" /> Projection
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="breakdown" className="pt-4">
            <div className="space-y-4">
              {/* Simplified Pie Chart - in a real app, use a chart library */}
              <div className="relative h-[200px] flex items-center justify-center">
                <div className="relative h-[180px] w-[180px] rounded-full overflow-hidden">
                  {/* Simulate a pie chart with absolute positioning */}
                  {categories.map((category, index, array) => {
                    // Calculate the starting position as a percentage based on the sum of all previous segments
                    const previousSum = array.slice(0, index).reduce((sum, cat) => sum + cat.value, 0);
                    const totalSum = array.reduce((sum, cat) => sum + cat.value, 0);
                    const startPercentage = (previousSum / totalSum) * 100;
                    const percentageValue = (category.value / totalSum) * 100;
                    
                    return (
                      <div
                        key={category.name}
                        className="absolute inset-0"
                        style={{
                          background: `conic-gradient(transparent ${startPercentage}%, ${category.color} ${startPercentage}%, ${category.color} ${startPercentage + percentageValue}%, transparent ${startPercentage + percentageValue}%)`
                        }}
                      />
                    );
                  })}
                  <div className="absolute inset-4 bg-background rounded-full flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Total</p>
                      <p className="font-bold">{formatCurrency(total_current_cost)}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                {categories.map((category) => (
                  <div key={category.name} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div 
                        className="h-3 w-3 rounded-full mr-2" 
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="text-sm">{category.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{formatCurrency(category.value)}</span>
                      <span className="text-xs text-muted-foreground">
                        ({Math.round((category.value / total_current_cost) * 100)}%)
                      </span>
                      {category.growthRate !== undefined && (
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            category.growthRate > 0 
                              ? 'text-destructive border-destructive' 
                              : 'text-green-500 border-green-500'
                          }`}
                        >
                          {category.growthRate > 0 ? '+' : ''}{category.growthRate}%
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="projection" className="pt-4">
            <div className="space-y-4">
              {/* Simplified Line Chart - in a real app, use a chart library */}
              <div className="h-[200px] w-full bg-muted rounded-md p-4 relative">
                <div className="absolute inset-x-0 bottom-0 h-[1px] bg-border" />
                <div className="absolute inset-0 flex items-end px-4 pb-4">
                  {projections.map((projection, index) => {
                    const height = (projection.value / maxProjection) * 100;
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div 
                          className="w-1 bg-primary rounded-t" 
                          style={{ height: `${Math.max(height, 1)}%` }}
                        />
                        {index % 2 === 0 && (
                          <div className="text-[10px] text-muted-foreground mt-1">
                            {new Date(projection.month).toLocaleDateString(undefined, { month: 'short' })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {/* Budget line */}
                <div 
                  className="absolute inset-x-0 border-t border-dashed border-amber-500 pointer-events-none"
                  style={{ 
                    bottom: `${(budget_allocation / maxProjection) * 100}%`,
                  }}
                >
                  <div className="absolute right-0 -top-3 bg-background px-1 text-[10px] text-amber-500">
                    Budget
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border rounded-md">
                  <div className="text-sm text-muted-foreground mb-1">YoY Change</div>
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className={`font-medium ${year_over_year_change > 0 ? 'text-destructive' : 'text-green-500'}`}>
                      {year_over_year_change > 0 ? '+' : ''}{year_over_year_change}%
                    </span>
                  </div>
                </div>
                <div className="p-3 border rounded-md">
                  <div className="text-sm text-muted-foreground mb-1">Budget Status</div>
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className={`font-medium ${budget_utilization > 90 ? 'text-destructive' : 'text-green-500'}`}>
                      {budget_utilization}% Utilized
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          <Download className="mr-2 h-4 w-4" />
          Export Cost Model
        </Button>
      </CardFooter>
    </Card>
  );
} 