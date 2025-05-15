"use client"

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { TrendingUp, DollarSign, Users, Building2, AlertCircle, BarChart } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ScenarioParams {
  name: string
  targetRevenue: number
  targetDate: string
  startDate: string
  currentRevenue: number
  growthModel: 'linear' | 'exponential' | 'stepwise'
  efficiencyFactor: number
}

interface DepartmentHeadcount {
  id: string
  name: string
  currentHeadcount: number
  projectedHeadcount: number
  growthPercentage: number
  revenuePerEmployee: number
  hiringNeeded: number
}

interface ScenarioResult {
  totalCurrentHeadcount: number
  totalProjectedHeadcount: number
  overallGrowthPercentage: number
  averageRevenuePerEmployee: number
  timeToHire: number // in days
  departments: DepartmentHeadcount[]
  monthlyProjections: {
    month: string
    revenue: number
    headcount: number
    revenuePerEmployee: number
  }[]
}

export default function StrategicGrowthPlanner() {
  const { toast } = useToast()
  const [scenarioParams, setScenarioParams] = useState<ScenarioParams>({
    name: "Growth Scenario 1",
    targetRevenue: 10000000,
    targetDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    startDate: new Date().toISOString().split('T')[0],
    currentRevenue: 5000000,
    growthModel: 'linear',
    efficiencyFactor: 1.0 // 1.0 = neutral, <1.0 = more efficient, >1.0 = less efficient
  })
  
  const [scenarioResult, setScenarioResult] = useState<ScenarioResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setScenarioParams(prev => ({
      ...prev,
      [name]: name.includes('Revenue') ? parseFloat(value) : value
    }))
  }
  
  const handleSelectChange = (name: string, value: string) => {
    setScenarioParams(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  const handleEfficiencyChange = (value: number[]) => {
    setScenarioParams(prev => ({
      ...prev,
      efficiencyFactor: value[0]
    }))
  }
  
  const runScenario = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/strategic-planning/growth-scenarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(scenarioParams)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to process growth scenario')
      }
      
      const result = await response.json()
      setScenarioResult(result)
      toast({
        title: "Scenario Analysis Complete",
        description: `Projected ${result.totalProjectedHeadcount - result.totalCurrentHeadcount} new hires across departments.`,
      })
    } catch (err: any) {
      console.error('Error running growth scenario:', err)
      setError(err.message || 'An error occurred while processing the scenario')
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || 'Failed to run scenario analysis',
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount)
  }
  
  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`
  }
  
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Strategic Growth Planner</h1>
        <Button variant="outline" onClick={() => {
          setScenarioParams({
            name: `Growth Scenario ${Math.floor(Math.random() * 1000)}`,
            targetRevenue: 10000000,
            targetDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
            startDate: new Date().toISOString().split('T')[0],
            currentRevenue: 5000000,
            growthModel: 'linear',
            efficiencyFactor: 1.0
          })
          setScenarioResult(null)
        }}>Reset</Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scenario Parameters */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Growth Scenario Parameters</CardTitle>
            <CardDescription>Define your revenue targets and growth model</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Scenario Name</Label>
              <Input 
                id="name" 
                name="name" 
                value={scenarioParams.name} 
                onChange={handleInputChange} 
                placeholder="Growth Scenario 1" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="currentRevenue">Current Annual Revenue</Label>
              <div className="flex">
                <span className="flex items-center bg-muted px-3 rounded-l-md">
                  <DollarSign className="h-4 w-4" />
                </span>
                <Input 
                  id="currentRevenue" 
                  name="currentRevenue" 
                  type="number" 
                  value={scenarioParams.currentRevenue} 
                  onChange={handleInputChange} 
                  className="rounded-l-none" 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="targetRevenue">Target Annual Revenue</Label>
              <div className="flex">
                <span className="flex items-center bg-muted px-3 rounded-l-md">
                  <DollarSign className="h-4 w-4" />
                </span>
                <Input 
                  id="targetRevenue" 
                  name="targetRevenue" 
                  type="number" 
                  value={scenarioParams.targetRevenue} 
                  onChange={handleInputChange} 
                  className="rounded-l-none" 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input 
                  id="startDate" 
                  name="startDate" 
                  type="date" 
                  value={scenarioParams.startDate} 
                  onChange={handleInputChange} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="targetDate">Target Date</Label>
                <Input 
                  id="targetDate" 
                  name="targetDate" 
                  type="date" 
                  value={scenarioParams.targetDate} 
                  onChange={handleInputChange} 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="growthModel">Growth Model</Label>
              <Select 
                value={scenarioParams.growthModel} 
                onValueChange={(value) => handleSelectChange('growthModel', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select growth model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="linear">Linear Growth</SelectItem>
                  <SelectItem value="exponential">Exponential Growth</SelectItem>
                  <SelectItem value="stepwise">Stepwise Growth</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                {scenarioParams.growthModel === 'linear' && 'Steady and consistent growth over time'}
                {scenarioParams.growthModel === 'exponential' && 'Accelerating growth rate over time'}
                {scenarioParams.growthModel === 'stepwise' && 'Growth occurs in distinct increments'}
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="efficiencyFactor">Operational Efficiency</Label>
                <span className="text-sm">
                  {scenarioParams.efficiencyFactor < 1 ? 'More Efficient' : 
                   scenarioParams.efficiencyFactor > 1 ? 'Less Efficient' : 'Neutral'}
                </span>
              </div>
              <Slider
                id="efficiencyFactor"
                min={0.5}
                max={1.5}
                step={0.1}
                value={[scenarioParams.efficiencyFactor]}
                onValueChange={handleEfficiencyChange}
                className="py-4"
              />
              <p className="text-xs text-muted-foreground">
                Determines how efficiently revenue translates to headcount needs
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={runScenario} 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Run Scenario Analysis'}
            </Button>
          </CardFooter>
        </Card>
        
        {/* Results and Visualizations */}
        <div className="lg:col-span-2 space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {isLoading ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-64" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
                <div className="mt-6">
                  <Skeleton className="h-[200px] w-full" />
                </div>
              </CardContent>
            </Card>
          ) : scenarioResult ? (
            <>
              {/* Summary Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Growth Analysis Summary</CardTitle>
                  <CardDescription>
                    {`Target: ${formatCurrency(scenarioResult.totalCurrentHeadcount === 0 ? 0 : scenarioParams.targetRevenue - scenarioParams.currentRevenue)} additional revenue by ${new Date(scenarioParams.targetDate).toLocaleDateString()}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Current Headcount</p>
                      <p className="text-2xl font-bold">{scenarioResult.totalCurrentHeadcount}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Projected Headcount</p>
                      <p className="text-2xl font-bold">{scenarioResult.totalProjectedHeadcount}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Growth</p>
                      <p className="text-2xl font-bold">{formatPercentage(scenarioResult.overallGrowthPercentage)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Revenue/Employee</p>
                      <p className="text-2xl font-bold">{formatCurrency(scenarioResult.averageRevenuePerEmployee)}</p>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-2">Timeline</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Based on historical hiring rates, you'll need approximately {scenarioResult.timeToHire} days
                      to hire {scenarioResult.totalProjectedHeadcount - scenarioResult.totalCurrentHeadcount} new employees.
                    </p>
                    
                    {/* Placeholder for timeline visualization - could be replaced with a real chart */}
                    <div className="w-full h-10 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary" 
                        style={{
                          width: `${Math.min(100, (new Date().getTime() - new Date(scenarioParams.startDate).getTime()) / 
                            (new Date(scenarioParams.targetDate).getTime() - new Date(scenarioParams.startDate).getTime()) * 100)}%`
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>{new Date(scenarioParams.startDate).toLocaleDateString()}</span>
                      <span>{new Date(scenarioParams.targetDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Department Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Department Headcount Projections</CardTitle>
                  <CardDescription>Estimated personnel needs by department to reach revenue targets</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Department</TableHead>
                        <TableHead className="text-right">Current</TableHead>
                        <TableHead className="text-right">Projected</TableHead>
                        <TableHead className="text-right">Hiring Needed</TableHead>
                        <TableHead className="text-right">Growth %</TableHead>
                        <TableHead className="text-right">Revenue/Employee</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {scenarioResult.departments.map((dept) => (
                        <TableRow key={dept.id}>
                          <TableCell className="font-medium">{dept.name}</TableCell>
                          <TableCell className="text-right">{dept.currentHeadcount}</TableCell>
                          <TableCell className="text-right">{dept.projectedHeadcount}</TableCell>
                          <TableCell className="text-right">
                            <span className={dept.hiringNeeded > 0 ? 'text-green-600' : ''}>
                              {dept.hiringNeeded > 0 ? `+${dept.hiringNeeded}` : dept.hiringNeeded}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">{formatPercentage(dept.growthPercentage)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(dept.revenuePerEmployee)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              
              {/* Monthly Projections */}
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Projections</CardTitle>
                  <CardDescription>Projected revenue and headcount over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full relative mb-6">
                    {/* Custom Chart Implementation */}
                    <div className="absolute inset-0 flex flex-col">
                      {/* Y-axis labels */}
                      <div className="flex h-full">
                        <div className="w-16 h-full relative text-xs text-muted-foreground">
                          {[0, 1, 2, 3, 4].map((i) => (
                            <div key={i} className="absolute transform -translate-y-1/2" style={{ top: `${100 - i * 25}%` }}>
                              {formatCurrency(scenarioParams.targetRevenue * (i * 0.25))}
                            </div>
                          ))}
                        </div>
                        
                        {/* Chart area */}
                        <div className="flex-1 h-full relative">
                          {/* Grid lines */}
                          <div className="absolute inset-0 border-l border-b border-border">
                            {[0, 1, 2, 3, 4].map((i) => (
                              <div key={i} className="absolute w-full border-t border-muted" style={{ top: `${100 - i * 25}%` }} />
                            ))}
                          </div>
                          
                          {/* Revenue bars */}
                          <div className="absolute inset-0 flex items-end justify-between pt-6 pb-6">
                            {scenarioResult.monthlyProjections.map((projection, index) => {
                              const barWidth = 100 / scenarioResult.monthlyProjections.length - 2
                              const revenueHeight = (projection.revenue / scenarioParams.targetRevenue) * 100
                              const headcountPercentage = (projection.headcount / scenarioResult.totalProjectedHeadcount) * 100
                              
                              return (
                                <div 
                                  key={index} 
                                  className="flex flex-col items-center relative" 
                                  style={{ width: `${barWidth}%` }}
                                >
                                  {/* Revenue bar */}
                                  <div 
                                    className="w-full bg-primary/80 rounded-t" 
                                    style={{ height: `${revenueHeight}%` }}
                                    title={`Revenue: ${formatCurrency(projection.revenue)}`}
                                  />
                                  
                                  {/* Headcount line */}
                                  <div 
                                    className="absolute w-full h-1 bg-secondary z-10 rounded" 
                                    style={{ bottom: `${headcountPercentage}%` }}
                                    title={`Headcount: ${projection.headcount}`}
                                  />
                                </div>
                              )
                            })}
                          </div>
                          
                          {/* Legend */}
                          <div className="absolute top-2 right-2 flex items-center space-x-4 text-xs">
                            <div className="flex items-center">
                              <div className="w-3 h-3 mr-1 bg-primary/80" />
                              <span>Revenue</span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-6 h-1 mr-1 bg-secondary" />
                              <span>Headcount</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* X-axis labels */}
                      <div className="flex h-6 text-xs text-muted-foreground pl-16">
                        {scenarioResult.monthlyProjections.map((projection, index) => (
                          <div 
                            key={index} 
                            className="flex-1 text-center truncate"
                          >
                            {projection.month}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <Table className="mt-4">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Month</TableHead>
                        <TableHead className="text-right">Revenue</TableHead>
                        <TableHead className="text-right">Headcount</TableHead>
                        <TableHead className="text-right">Revenue/Employee</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {scenarioResult.monthlyProjections.map((projection, index) => (
                        <TableRow key={index}>
                          <TableCell>{projection.month}</TableCell>
                          <TableCell className="text-right">{formatCurrency(projection.revenue)}</TableCell>
                          <TableCell className="text-right">{projection.headcount}</TableCell>
                          <TableCell className="text-right">{formatCurrency(projection.revenuePerEmployee)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="h-full flex flex-col justify-center items-center p-10">
              <TrendingUp className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Run a Growth Scenario</h3>
              <p className="text-center text-muted-foreground mt-2 mb-6">
                Set your revenue targets and growth model, then run the analysis to see projected headcount needs.
              </p>
              <Button onClick={runScenario}>Run Analysis</Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
