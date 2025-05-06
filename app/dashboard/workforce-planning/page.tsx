"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { PlusCircle, Users, DollarSign, BarChart3, Activity, BrainCircuit, SendHorizonal, FileQuestion, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { workforcePlanningService } from '@/lib/services/workforce-planning-service'

// Import the new workforce planning components
import { DepartmentOverview } from "@/components/workforce/department-overview"
import { HeadcountForecast } from "@/components/workforce/headcount-forecast"
import { SkillGapAnalysis } from "@/components/workforce/skill-gap-analysis"
import { WorkforceInsights } from "@/components/workforce/workforce-insights"
import { ScenarioModeling } from "@/components/workforce/scenario-modeling"
import { CostModelingChart } from "@/components/workforce/cost-modeling-chart"

// Types
import type { Department } from "@/types/organization"
import type { WorkforcePlan as BaseWorkforcePlan, WorkforcePlanningAnalysis } from "@/types/workforce-components"

// Add type for department overview data
interface DepartmentOverviewData {
  id: string
  name: string
  currentHeadcount: number
  requiredHeadcount: number
}

// Extended WorkforcePlan with additional properties needed for UI
interface WorkforcePlan extends BaseWorkforcePlan {
  department_name?: string;
  budget_amount?: number;
}

export default function WorkforcePlanningPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("active")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isAIAnalyzing, setIsAIAnalyzing] = useState(false)
  const [aiResults, setAiResults] = useState<any>(null)
  
  // New state variables for API integration
  const [departments, setDepartments] = useState<Department[]>([])
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null)
  const [activePlans, setActivePlans] = useState<WorkforcePlan[]>([])
  const [draftPlans, setDraftPlans] = useState<WorkforcePlan[]>([])
  const [completedPlans, setCompletedPlans] = useState<WorkforcePlan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [departmentOverviewData, setDepartmentOverviewData] = useState<DepartmentOverviewData[]>([])
  
  // New state for form data
  const [formData, setFormData] = useState({
    planName: "",
    description: "",
    department: "",
    startDate: "",
    endDate: "",
    budget: "",
    requiredSkills: "",
  })
  
  // Fetch departments, plans, and overview data on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true)
      try {
        // Fetch departments
        const deptResponse = await fetch('/api/departments')
        if (deptResponse.ok) {
          const deptData = await deptResponse.json()
          setDepartments(deptData.departments || [])
        }
        
        // Fetch workforce plans
        const plansResponse = await fetch('/api/workforce/plans')
        if (plansResponse.ok) {
          const plansData = await plansResponse.json()
          
          // Filter plans by status
          setActivePlans(plansData.plans?.filter((p: WorkforcePlan) => p.status === 'active') || [])
          setDraftPlans(plansData.plans?.filter((p: WorkforcePlan) => p.status === 'draft') || [])
          setCompletedPlans(plansData.plans?.filter((p: WorkforcePlan) => p.status === 'completed') || [])
        }

        // Fetch Department Overview data using our service
        const overviewData = await workforcePlanningService.getDepartmentOverview()
        setDepartmentOverviewData(overviewData)

      } catch (error) {
        console.error("Error fetching initial data:", error)
        toast({
          title: "Error",
          description: "Failed to load initial workforce data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchInitialData()
  }, [toast])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCreatePlan = async () => {
    try {
      const response = await fetch('/api/workforce/plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Workforce plan created successfully",
        })
        setIsDialogOpen(false)
        
        // Refresh the plans list
        const plansResponse = await fetch('/api/workforce/plans')
        if (plansResponse.ok) {
          const plansData = await plansResponse.json()
          setDraftPlans(plansData.plans?.filter((p: WorkforcePlan) => p.status === 'draft') || [])
        }
        
        // Reset form
        setFormData({
          planName: "",
          description: "",
          department: "",
          startDate: "",
          endDate: "",
          budget: "",
          requiredSkills: "",
        })
      }
    } catch (error) {
      console.error("Error creating plan:", error)
      toast({
        title: "Error",
        description: "Failed to create workforce plan",
        variant: "destructive",
      })
    }
  }

  const handleAIAnalysis = async () => {
    if (!selectedDepartment) {
      toast({
        title: "Error",
        description: "Please select a department for analysis",
        variant: "destructive",
      })
      return
    }
    
    setIsAIAnalyzing(true)
    setAiResults(null)
    
    try {
      // Get headcount forecasting data
      const forecastResponse = await fetch('/api/workforce/forecasting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          departmentId: selectedDepartment,
          months: 12
        })
      })
      
      // Get skill gap analysis
      const skillGapResponse = await fetch('/api/workforce/skill-gap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          departmentId: selectedDepartment
        })
      })
      
      // Get workforce insights
      const insightsResponse = await fetch('/api/workforce/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          departmentId: selectedDepartment
        })
      })
      
      if (forecastResponse.ok && skillGapResponse.ok && insightsResponse.ok) {
        const forecastData = await forecastResponse.json()
        const skillGapData = await skillGapResponse.json()
        const insightsData = await insightsResponse.json()
        
        setAiResults({
          forecast: forecastData,
          skillGap: skillGapData,
          insights: insightsData
        })
      } else {
        throw new Error("One or more API requests failed")
      }
    } catch (error) {
      console.error("AI analysis error:", error)
      toast({
        title: "Analysis Error",
        description: "Failed to complete workforce analysis",
        variant: "destructive",
      })
    } finally {
      setIsAIAnalyzing(false)
    }
  }

  // Helper function to render plan cards
  const renderPlanCards = (plans: WorkforcePlan[]) => {
    if (isLoading) {
      return Array(3).fill(0).map((_, i) => (
        <Card key={i} className="w-full">
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mt-2" />
            <Skeleton className="h-4 w-3/4 mt-2" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-20" />
          </CardFooter>
        </Card>
      ))
    }

    if (plans.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-6 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mb-2" />
          <h3 className="text-lg font-medium">No plans found</h3>
          <p className="text-sm text-muted-foreground">
            Get started by creating a new workforce plan
          </p>
        </div>
      )
    }

    return plans.map((plan) => (
      <Card key={plan.id} className="w-full">
        <CardHeader>
          <CardTitle>{plan.name}</CardTitle>
          <CardDescription>
            {plan.department_name} • Budget: ${parseInt(plan.budget_amount?.toString() || "0").toLocaleString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {plan.description}
          </p>
          <div className="flex items-center justify-between text-sm">
            <div>
              <span className="text-muted-foreground">Timeline:</span> {new Date(plan.start_date).toLocaleDateString()} - {new Date(plan.end_date).toLocaleDateString()}
            </div>
            <Badge>{plan.status}</Badge>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/workforce-planning/${plan.id}`)}>
            View Details
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setSelectedDepartment(plan.department_id)}
          >
            Analyze
          </Button>
        </CardFooter>
      </Card>
    ))
  }

  return (
    <div className="h-full flex-1 flex-col space-y-8 p-8 flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Workforce Planning</h2>
          <p className="text-muted-foreground">
            Create and manage strategic workforce plans for your organization
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Workforce Plan</DialogTitle>
                <DialogDescription>
                  Design a new workforce plan to meet your organization's future needs
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="planName">Plan Name</Label>
                  <Input
                    id="planName"
                    name="planName"
                    value={formData.planName}
                    onChange={handleInputChange}
                    placeholder="Q4 Engineering Expansion"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe the purpose and goals of this workforce plan"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="department">Department</Label>
                    <Select 
                      name="department" 
                      value={formData.department} 
                      onValueChange={(value) => handleInputChange({
                        target: { name: 'department', value }
                      } as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="budget">Budget</Label>
                    <Input
                      id="budget"
                      name="budget"
                      type="number"
                      value={formData.budget}
                      onChange={handleInputChange}
                      placeholder="500000"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      name="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      name="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="requiredSkills">Required Skills</Label>
                  <Textarea
                    id="requiredSkills"
                    name="requiredSkills"
                    value={formData.requiredSkills}
                    onChange={handleInputChange}
                    placeholder="Java, Python, Cloud Architecture, Machine Learning, etc."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreatePlan}>Create Plan</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <div className="ml-2">
            <Select 
              value={selectedDepartment || ""} 
              onValueChange={(value) => setSelectedDepartment(value || null)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button 
            variant="outline" 
            onClick={handleAIAnalysis} 
            disabled={isAIAnalyzing || !selectedDepartment}
          >
            {isAIAnalyzing ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Analyzing...
              </>
            ) : (
              <>
                <BrainCircuit className="mr-2 h-4 w-4" />
                AI Analysis
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="active" className="flex items-center">
            <Activity className="mr-2 h-4 w-4" />
            Active Plans
            {activePlans.length > 0 && (
              <Badge className="ml-2" variant="outline">{activePlans.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="draft" className="flex items-center">
            <FileQuestion className="mr-2 h-4 w-4" />
            Draft Plans
            {draftPlans.length > 0 && (
              <Badge className="ml-2" variant="outline">{draftPlans.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center">
            <FileText className="mr-2 h-4 w-4" />
            Completed Plans
            {completedPlans.length > 0 && (
              <Badge className="ml-2" variant="outline">{completedPlans.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center">
            <BarChart3 className="mr-2 h-4 w-4" />
            Analysis Results
          </TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {renderPlanCards(activePlans)}
          </div>
        </TabsContent>
        <TabsContent value="draft" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {renderPlanCards(draftPlans)}
          </div>
        </TabsContent>
        <TabsContent value="completed" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {renderPlanCards(completedPlans)}
          </div>
        </TabsContent>
        <TabsContent value="analysis" className="mt-6">
          {!aiResults && departmentOverviewData.length === 0 && !isLoading ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <BrainCircuit className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium">Workforce Analysis</h3>
              <p className="text-sm text-muted-foreground max-w-md mt-2">
                View department headcount overview below, or select a department and run AI analysis for forecasting and insights.
              </p>
            </div>
          ) : null}
          
          <div className="mb-6">
             <DepartmentOverview data={departmentOverviewData} isLoading={isLoading} />
          </div>

          {aiResults && (
            <div className="grid gap-6 md:grid-cols-2">
              {/* Headcount Forecast */}
              {aiResults.forecast && (
                <HeadcountForecast forecastData={aiResults.forecast} />
              )}

              {/* Skill Gap Analysis */}
              {aiResults.skillGap && (
                <SkillGapAnalysis data={aiResults.skillGap} />
              )}
              
              {/* Workforce Insights - Full Width */}
              {aiResults.insights && (
                <div className="md:col-span-2">
                  <WorkforceInsights data={aiResults.insights} />
                </div>
              )}

              {/* Scenario Modeling Placeholder */}
              {selectedDepartment && (
                 <div className="md:col-span-2 mt-6">
                   <ScenarioModeling 
                     departmentId={selectedDepartment}
                     departmentName={departments.find(d => d.id === selectedDepartment)?.name}
                     factorDefinitions={[
                       {
                         name: "Hiring Rate",
                         currentValue: 5,
                         minValue: 0,
                         maxValue: 20,
                         unit: "%",
                         description: "Percentage of new hires per quarter relative to total headcount"
                       },
                       {
                         name: "Attrition Rate",
                         currentValue: 10,
                         minValue: 0,
                         maxValue: 30,
                         unit: "%",
                         description: "Percentage of employees leaving per year"
                       },
                       {
                         name: "Efficiency Improvement",
                         currentValue: 5,
                         minValue: 0,
                         maxValue: 20,
                         unit: "%",
                         description: "Expected productivity increase from training and tools"
                       }
                     ]}
                     presetScenarios={[
                       {
                         name: "Growth Strategy",
                         description: "Aggressive hiring with focus on efficiency",
                         factors: {
                           "Hiring Rate": 15,
                           "Attrition Rate": 8,
                           "Efficiency Improvement": 10
                         },
                         outcomes: {
                           costImpact: 250000,
                           headcountDelta: 12,
                           timelineImpact: -15,
                           riskLevel: "medium",
                           benefitLevel: "high"
                         }
                       },
                       {
                         name: "Stability Strategy",
                         description: "Maintain current staffing with improved efficiency",
                         factors: {
                           "Hiring Rate": 8,
                           "Attrition Rate": 8,
                           "Efficiency Improvement": 12
                         },
                         outcomes: {
                           costImpact: 50000,
                           headcountDelta: 0,
                           timelineImpact: -20,
                           riskLevel: "low",
                           benefitLevel: "medium"
                         }
                       }
                     ]}
                   />
                 </div>
              )}
              
              {/* Cost Modeling Chart Placeholder */}
              {selectedDepartment && (
                <div className="md:col-span-2 mt-6">
                  <CostModelingChart 
                    data={{
                      department_id: selectedDepartment,
                      department_name: departments.find(d => d.id === selectedDepartment)?.name,
                      total_current_cost: 1250000,
                      total_projected_cost: 1425000,
                      year_over_year_change: 14,
                      budget_utilization: 95,
                      budget_allocation: 1500000,
                      categories: [
                        { name: "Salaries", value: 950000, color: "#2563eb", growthRate: 12 },
                        { name: "Benefits", value: 180000, color: "#16a34a", growthRate: 8 },
                        { name: "Training", value: 45000, color: "#d97706", growthRate: 25 },
                        { name: "Equipment", value: 75000, color: "#dc2626", growthRate: 5 }
                      ],
                      projections: Array(12).fill(0).map((_, i) => {
                        const month = new Date();
                        month.setMonth(month.getMonth() + i);
                        const monthStr = month.toISOString().substring(0, 7);
                        return {
                          month: monthStr,
                          value: 1250000 + (i * 15000)
                        };
                      })
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

