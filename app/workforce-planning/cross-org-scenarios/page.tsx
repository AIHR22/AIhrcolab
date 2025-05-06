"use client"

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, TrendingUp, Users, Building2, DollarSign, LineChart, Briefcase } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Import mock data for fallback
import { mockScenarioResult } from "./mock-data/mock-scenario-result"

interface Department {
  id: string
  name: string
  current_headcount: number
  revenue_contribution: number
  revenue_per_employee: number
  projections: Array<{
    month: number
    date: string
    headcount: number
    new_hires_needed: number
  }>
}

interface CriticalSkill {
  id: string
  name: string
  category: string
  current_count: number
  needed_count: number
  gap: number
  severity: string
}

interface MonthlyProjection {
  month: number
  date: string
  formatted_date: string
  revenue: number
}

interface ScenarioResult {
  revenue_analysis: {
    current_revenue: number
    target_revenue: number
    growth_percentage: number
    months_to_target: number
  }
  hiring_analysis: {
    total_current_headcount: number
    total_new_hires_needed: number
    hiring_capacity_per_month: number
    hiring_feasible: boolean
    hiring_timeline_months: number
  }
  departments: Department[]
  critical_skills: CriticalSkill[]
  monthly_projections: MonthlyProjection[]
  recommendations: string[]
}

export default function CrossOrgScenarios() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<ScenarioResult | null>(null)
  
  // Form state
  const [currentRevenue, setCurrentRevenue] = useState(5000000)
  const [targetRevenue, setTargetRevenue] = useState(10000000)
  const [targetDate, setTargetDate] = useState(() => {
    const date = new Date()
    date.setFullYear(date.getFullYear() + 1)
    return date.toISOString().split('T')[0]
  })
  const [growthModel, setGrowthModel] = useState('linear')
  const [efficiencyFactor, setEfficiencyFactor] = useState(1.0)
  const [attritionRate, setAttritionRate] = useState(15)
  const [hiringCapacity, setHiringCapacity] = useState(10)
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([])
  const [availableDepartments, setAvailableDepartments] = useState<{id: string, name: string}[]>([])
  
  // Fetch departments on component mount
  React.useEffect(() => {
    async function fetchDepartments() {
      try {
        const response = await fetch('/api/departments')
        if (response.ok) {
          const data = await response.json()
          setAvailableDepartments(data.map((dept: any) => ({ 
            id: dept.id, 
            name: dept.name 
          })))
        }
      } catch (error) {
        console.error('Error fetching departments:', error)
      }
    }
    
    fetchDepartments()
  }, [])
  
  const runScenario = async () => {
    setIsLoading(true)
    
    try {
      // Log the request data for debugging
      const requestData = {
        revenue_targets: {
          current_revenue: currentRevenue,
          target_revenue: targetRevenue,
          target_date: targetDate
        },
        growth_model: growthModel,
        efficiency_factor: efficiencyFactor,
        attrition_rate: attritionRate,
        hiring_capacity_per_month: hiringCapacity,
        prioritize_departments: selectedDepartments.length > 0 ? selectedDepartments : undefined
      };
      console.log('Sending scenario request:', requestData);
      
      try {
        const response = await fetch('/api/workforce/cross-org-scenarios', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestData)
        })
        
        if (!response.ok) {
          // More defensive error handling
          let errorMessage = 'Failed to run scenario';
          try {
            const errorData = await response.json();
            console.error('Error response:', errorData);
            errorMessage = errorData.error || errorMessage;
          } catch (parseError) {
            console.error('Could not parse error response:', parseError);
            errorMessage = `API Error: ${response.status} ${response.statusText}`;
          }
          throw new Error(errorMessage);
        }
        
        const data = await response.json()
        setResult(data)
        
        toast({
          title: "Scenario Analysis Complete",
          description: `Projected ${data.hiring_analysis.total_new_hires_needed} new hires across departments.`
        })
      } catch (error) {
        console.error('API error, using mock data instead:', error)
        // Use mock data as fallback
        setResult(mockScenarioResult)
        
        toast({
          variant: "default",
          title: "Using Demo Data",
          description: "Could not connect to the server, showing sample data instead."
        })
      }
    } catch (error) {
      console.error('Error in scenario planning:', error)
      setResult(mockScenarioResult) // Fallback to mock data in case of any errors
      
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Showing demo data instead."
      })
      setIsLoading(false)
    } finally {
      setIsLoading(false)
    }
  }
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value)
  }
  
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Cross-Organization Scenario Planning</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Scenario Parameters */}
        <Card>
          <CardHeader>
            <CardTitle>Scenario Parameters</CardTitle>
            <CardDescription>Define organization-wide revenue and growth targets</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentRevenue">Current Annual Revenue</Label>
              <div className="flex">
                <span className="flex items-center bg-muted px-3 rounded-l-md">
                  <DollarSign className="h-4 w-4" />
                </span>
                <Input
                  id="currentRevenue"
                  type="number"
                  value={currentRevenue}
                  onChange={(e) => setCurrentRevenue(Number(e.target.value))}
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
                  type="number"
                  value={targetRevenue}
                  onChange={(e) => setTargetRevenue(Number(e.target.value))}
                  className="rounded-l-none"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="targetDate">Target Date</Label>
              <Input
                id="targetDate"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="growthModel">Growth Model</Label>
              <Select value={growthModel} onValueChange={setGrowthModel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select growth model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="linear">Linear Growth</SelectItem>
                  <SelectItem value="exponential">Exponential Growth</SelectItem>
                  <SelectItem value="stepwise">Stepwise Growth</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {growthModel === 'linear' && 'Consistent month-over-month growth'}
                {growthModel === 'exponential' && 'Accelerating growth rate over time'}
                {growthModel === 'stepwise' && 'Growth occurs in defined steps'}
              </p>
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="efficiencyFactor">Efficiency Factor</Label>
                <span className="text-sm">{efficiencyFactor.toFixed(1)}</span>
              </div>
              <Slider
                value={[efficiencyFactor]}
                min={0.5}
                max={1.5}
                step={0.1}
                onValueChange={(values) => setEfficiencyFactor(values[0])}
              />
              <p className="text-xs text-muted-foreground">
                How efficiently revenue growth translates to headcount (lower is more efficient)
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="attritionRate">Annual Attrition Rate</Label>
                <span className="text-sm">{attritionRate}%</span>
              </div>
              <Slider
                value={[attritionRate]}
                min={0}
                max={30}
                step={1}
                onValueChange={(values) => setAttritionRate(values[0])}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="hiringCapacity">Monthly Hiring Capacity</Label>
              <Input
                id="hiringCapacity"
                type="number"
                value={hiringCapacity}
                onChange={(e) => setHiringCapacity(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Maximum number of new employees that can be hired per month
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>Prioritize Departments (Optional)</Label>
              {availableDepartments.map((dept) => (
                <div key={dept.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`dept-${dept.id}`}
                    checked={selectedDepartments.includes(dept.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedDepartments([...selectedDepartments, dept.id])
                      } else {
                        setSelectedDepartments(selectedDepartments.filter(id => id !== dept.id))
                      }
                    }}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor={`dept-${dept.id}`} className="text-sm font-normal">
                    {dept.name}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
          
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={runScenario} 
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Run Scenario'}
            </Button>
          </CardFooter>
        </Card>
        
        {/* Results Area */}
        <div className="md:col-span-2 space-y-6">
          {!result && !isLoading ? (
            <Card className="h-full flex flex-col justify-center items-center p-10">
              <TrendingUp className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Cross-Organization Scenario Planning</h3>
              <p className="text-center text-muted-foreground mt-2 mb-6">
                Set your organization-wide revenue targets and growth parameters, then run the analysis to see projected headcount needs by department and skill.
              </p>
              <Button onClick={runScenario}>Run Analysis</Button>
            </Card>
          ) : isLoading ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-64" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ) : result && (
            <>
              {/* Summary Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Scenario Overview</CardTitle>
                  <CardDescription>
                    {formatCurrency(result.revenue_analysis.current_revenue)} → {formatCurrency(result.revenue_analysis.target_revenue)} ({formatPercentage(result.revenue_analysis.growth_percentage)} growth)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Current Headcount</p>
                      <p className="text-2xl font-bold">{result.hiring_analysis.total_current_headcount}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">New Hires Needed</p>
                      <p className="text-2xl font-bold">{result.hiring_analysis.total_new_hires_needed}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Hiring Timeline</p>
                      <p className="text-2xl font-bold">{result.hiring_analysis.hiring_timeline_months} months</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Feasibility</p>
                      <p className={`text-2xl font-bold ${result.hiring_analysis.hiring_feasible ? 'text-green-600' : 'text-red-600'}`}>
                        {result.hiring_analysis.hiring_feasible ? 'Achievable' : 'Challenging'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Recommendations */}
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-2">Recommendations</h3>
                    <ul className="space-y-2">
                      {result.recommendations.map((recommendation, index) => (
                        <li key={index} className="flex items-start">
                          <div className="mr-2 mt-1 text-primary">
                            <TrendingUp className="h-4 w-4" />
                          </div>
                          <span>{recommendation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
              
              {/* Department Projections */}
              <Tabs defaultValue="departments">
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="departments">
                    <Building2 className="mr-2 h-4 w-4" />
                    Departments
                  </TabsTrigger>
                  <TabsTrigger value="skills">
                    <Briefcase className="mr-2 h-4 w-4" />
                    Critical Skills
                  </TabsTrigger>
                  <TabsTrigger value="timeline">
                    <LineChart className="mr-2 h-4 w-4" />
                    Growth Timeline
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="departments" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Department Headcount Projections</CardTitle>
                      <CardDescription>Projected headcount needs by department</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Department</TableHead>
                            <TableHead className="text-right">Current</TableHead>
                            <TableHead className="text-right">Projected</TableHead>
                            <TableHead className="text-right">New Hires</TableHead>
                            <TableHead className="text-right">Growth %</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {result.departments.map((dept) => {
                            const finalProjection = dept.projections[dept.projections.length - 1];
                            const growthPercent = ((finalProjection.headcount - dept.current_headcount) / dept.current_headcount * 100);
                            
                            return (
                              <TableRow key={dept.id}>
                                <TableCell className="font-medium">{dept.name}</TableCell>
                                <TableCell className="text-right">{dept.current_headcount}</TableCell>
                                <TableCell className="text-right">{finalProjection.headcount}</TableCell>
                                <TableCell className="text-right">
                                  <span className={finalProjection.new_hires_needed > 0 ? 'text-green-600' : ''}>
                                    {finalProjection.new_hires_needed > 0 ? `+${finalProjection.new_hires_needed}` : '0'}
                                  </span>
                                </TableCell>
                                <TableCell className="text-right">{formatPercentage(growthPercent)}</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="skills" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Critical Skills Analysis</CardTitle>
                      <CardDescription>Skills with the largest projected gaps</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Skill</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead className="text-right">Current</TableHead>
                            <TableHead className="text-right">Needed</TableHead>
                            <TableHead className="text-right">Gap</TableHead>
                            <TableHead>Severity</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {result.critical_skills.map((skill) => (
                            <TableRow key={skill.id}>
                              <TableCell className="font-medium">{skill.name}</TableCell>
                              <TableCell>{skill.category}</TableCell>
                              <TableCell className="text-right">{skill.current_count}</TableCell>
                              <TableCell className="text-right">{skill.needed_count}</TableCell>
                              <TableCell className="text-right text-red-600">+{skill.gap}</TableCell>
                              <TableCell>
                                <span 
                                  className={`px-2 py-1 rounded text-xs font-medium ${skill.severity === 'Critical' ? 'bg-red-100 text-red-800' : skill.severity === 'High' ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800'}`}
                                >
                                  {skill.severity}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="timeline" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Revenue & Headcount Growth Timeline</CardTitle>
                      <CardDescription>Monthly projections over the scenario period</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px] w-full relative mb-6">
                        {/* Growth Chart */}
                        <div className="absolute inset-0 flex flex-col">
                          {/* Y-axis labels */}
                          <div className="flex h-full">
                            <div className="w-16 h-full relative text-xs text-muted-foreground">
                              {[0, 1, 2, 3, 4].map((i) => (
                                <div 
                                  key={i} 
                                  className="absolute transform -translate-y-1/2" 
                                  style={{ top: `${100 - i * 25}%` }}
                                >
                                  {formatCurrency(targetRevenue * (i * 0.25))}
                                </div>
                              ))}
                            </div>
                            
                            {/* Chart area */}
                            <div className="flex-1 h-full relative">
                              {/* Grid lines */}
                              <div className="absolute inset-0 border-l border-b border-border">
                                {[0, 1, 2, 3, 4].map((i) => (
                                  <div 
                                    key={i} 
                                    className="absolute w-full border-t border-muted" 
                                    style={{ top: `${100 - i * 25}%` }} 
                                  />
                                ))}
                              </div>
                              
                              {/* Connect the revenue points with a line */}
                              <svg className="absolute inset-0" style={{ overflow: 'visible' }}>
                                <path
                                  d={result.monthly_projections.map((point, i) => {
                                    const x = `${(i / (result.monthly_projections.length - 1)) * 100}%`;
                                    const y = `${100 - (point.revenue / targetRevenue) * 100}%`;
                                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                                  }).join(' ')}
                                  fill="none"
                                  stroke="hsl(var(--primary))"
                                  strokeWidth="2"
                                />
                              </svg>
                              
                              {/* Points for each projection */}
                              <div className="absolute inset-0">
                                {result.monthly_projections.map((projection, i) => {
                                  const totalHeadcount = result.departments.reduce(
                                    (sum, dept) => sum + (dept.projections[projection.month]?.headcount || 0), 
                                    0
                                  );
                                  const headcountPercentage = totalHeadcount / (result.hiring_analysis.total_current_headcount + result.hiring_analysis.total_new_hires_needed) * 100;
                                  
                                  return (
                                    <div 
                                      key={i} 
                                      className="absolute" 
                                      style={{
                                        left: `${(i / (result.monthly_projections.length - 1)) * 100}%`,
                                        top: `${100 - (projection.revenue / targetRevenue) * 100}%`
                                      }}
                                    >
                                      {/* Revenue point */}
                                      <div 
                                        className="h-3 w-3 rounded-full bg-primary" 
                                        title={`${projection.formatted_date}: ${formatCurrency(projection.revenue)}`}
                                      />
                                      
                                      {/* Headcount indicator */}
                                      <div 
                                        className="absolute h-1 w-1 rounded-full bg-secondary" 
                                        style={{
                                          bottom: `${-headcountPercentage}%`,
                                          left: '1px'
                                        }}
                                        title={`Headcount: ${totalHeadcount}`}
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                              
                              {/* Legend */}
                              <div className="absolute top-2 right-2 flex items-center space-x-4 text-xs">
                                <div className="flex items-center">
                                  <div className="w-3 h-3 mr-1 rounded-full bg-primary" />
                                  <span>Revenue</span>
                                </div>
                                <div className="flex items-center">
                                  <div className="w-3 h-3 mr-1 rounded-full bg-secondary" />
                                  <span>Headcount</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* X-axis labels */}
                          <div className="flex h-6 pl-16">
                            {result.monthly_projections
                              .filter((_, i) => i % Math.ceil(result.monthly_projections.length / 6) === 0 || i === result.monthly_projections.length - 1)
                              .map((projection, i) => (
                                <div 
                                  key={i} 
                                  className="text-xs text-muted-foreground"
                                  style={{
                                    position: 'absolute',
                                    left: `${(projection.month / (result.monthly_projections.length - 1)) * 100}%`,
                                    bottom: 0,
                                    transform: 'translateX(-50%)'
                                  }}
                                >
                                  {projection.formatted_date}
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <h3 className="text-lg font-medium mb-2">Monthly Projections</h3>
                        <div className="rounded border overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Revenue</TableHead>
                                <TableHead className="text-right">Headcount</TableHead>
                                <TableHead className="text-right">Revenue/Employee</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {result.monthly_projections
                                .filter((_, i) => i % 3 === 0 || i === result.monthly_projections.length - 1)
                                .map((projection, i) => {
                                  const totalHeadcount = result.departments.reduce(
                                    (sum, dept) => sum + (dept.projections[projection.month]?.headcount || 0), 
                                    0
                                  );
                                  return (
                                    <TableRow key={i}>
                                      <TableCell>{projection.formatted_date}</TableCell>
                                      <TableCell className="text-right">{formatCurrency(projection.revenue)}</TableCell>
                                      <TableCell className="text-right">{totalHeadcount}</TableCell>
                                      <TableCell className="text-right">
                                        {formatCurrency(projection.revenue / totalHeadcount)}
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
