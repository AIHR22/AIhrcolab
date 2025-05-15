"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Loader2, BarChart2, TrendingUp, DollarSign, GraduationCap } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function SkillGapAnalyzePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)
  const [formData, setFormData] = useState({
    department_id: "",
    time_frame: "6_months",
  })

  // In a real app, this would be fetched from the API
  const departments = [
    { id: "all", name: "All Departments" },
    { id: "eng", name: "Engineering" },
    { id: "prod", name: "Product" },
    { id: "des", name: "Design" },
    { id: "mkt", name: "Marketing" },
    { id: "sales", name: "Sales" },
  ]

  const handleSelectChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
  }

  const analyzeSkillGaps = async () => {
    setAnalyzing(true)
    try {
      // In a real app, this would be an API call to /api/workforce/skill-gap
      // For demo purposes, we'll simulate a response
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Simulate different responses based on the department
      let mockAnalysis
      if (formData.department_id === "eng" || formData.department_id === "all") {
        mockAnalysis = {
          skill_gaps: [
            {
              skill_id: "1",
              skill_name: "Machine Learning",
              current_headcount: 2,
              required_headcount: 5,
              gap: 3,
              priority: "critical",
              recommendation: "Hire 2 senior ML engineers and train 1 existing data scientist",
              estimated_cost: 250000,
              training_option: {
                feasible: true,
                duration: "3 months",
                cost: 120000,
                candidates: ["John Smith", "Emma Johnson"],
              },
            },
            {
              skill_id: "2",
              skill_name: "Cloud Architecture",
              current_headcount: 3,
              required_headcount: 6,
              gap: 3,
              priority: "high",
              recommendation:
                "Hire 1 senior cloud architect and provide AWS certification training to 2 existing engineers",
              estimated_cost: 180000,
              training_option: {
                feasible: true,
                duration: "2 months",
                cost: 80000,
                candidates: ["Michael Brown", "David Wilson", "Sarah Davis"],
              },
            },
            {
              skill_id: "3",
              skill_name: "DevOps",
              current_headcount: 2,
              required_headcount: 4,
              gap: 2,
              priority: "medium",
              recommendation: "Hire 1 DevOps engineer and cross-train 1 existing backend developer",
              estimated_cost: 120000,
              training_option: {
                feasible: true,
                duration: "1 month",
                cost: 50000,
                candidates: ["Robert Johnson", "Lisa Wang"],
              },
            },
          ],
          summary: {
            total_gaps: 3,
            critical_gaps: 1,
            total_cost_hiring: 550000,
            total_cost_training: 250000,
            recommended_approach: "hybrid",
            time_to_fill: "3 months",
          },
        }
      } else if (formData.department_id === "des") {
        mockAnalysis = {
          skill_gaps: [
            {
              skill_id: "4",
              skill_name: "UI/UX Design",
              current_headcount: 1,
              required_headcount: 3,
              gap: 2,
              priority: "high",
              recommendation: "Hire 2 UI/UX designers with experience in design systems",
              estimated_cost: 160000,
              training_option: {
                feasible: false,
                duration: "N/A",
                cost: 0,
                candidates: [],
              },
            },
            {
              skill_id: "5",
              skill_name: "Motion Design",
              current_headcount: 0,
              required_headcount: 1,
              gap: 1,
              priority: "medium",
              recommendation: "Hire 1 motion designer or provide training to existing graphic designer",
              estimated_cost: 80000,
              training_option: {
                feasible: true,
                duration: "2 months",
                cost: 40000,
                candidates: ["Jessica Lee"],
              },
            },
          ],
          summary: {
            total_gaps: 2,
            critical_gaps: 0,
            total_cost_hiring: 240000,
            total_cost_training: 40000,
            recommended_approach: "hybrid",
            time_to_fill: "2 months",
          },
        }
      } else {
        mockAnalysis = {
          skill_gaps: [
            {
              skill_id: "6",
              skill_name: "Data Analysis",
              current_headcount: 1,
              required_headcount: 2,
              gap: 1,
              priority: "medium",
              recommendation: "Hire 1 data analyst or train existing marketing specialist",
              estimated_cost: 90000,
              training_option: {
                feasible: true,
                duration: "1 month",
                cost: 30000,
                candidates: ["Mark Thompson"],
              },
            },
          ],
          summary: {
            total_gaps: 1,
            critical_gaps: 0,
            total_cost_hiring: 90000,
            total_cost_training: 30000,
            recommended_approach: "training",
            time_to_fill: "1 month",
          },
        }
      }

      setAnalysis(mockAnalysis)
    } catch (error) {
      console.error("Error analyzing skill gaps:", error)
      toast({
        title: "Error",
        description: "Failed to analyze skill gaps. Please try again.",
        variant: "destructive",
      })
    } finally {
      setAnalyzing(false)
    }
  }

  const getPriorityBadge = (priority: string) => {
    const priorityMap: Record<
      string,
      { variant: "default" | "outline" | "secondary" | "destructive"; className: string }
    > = {
      critical: { variant: "destructive", className: "bg-red-100 text-red-800 border-red-200" },
      high: { variant: "default", className: "bg-orange-100 text-orange-800 border-orange-200" },
      medium: { variant: "secondary", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
      low: { variant: "outline", className: "bg-green-100 text-green-800 border-green-200" },
    }

    const priorityInfo = priorityMap[priority.toLowerCase()] || { variant: "outline", className: "" }

    return (
      <Badge variant={priorityInfo.variant} className={priorityInfo.className}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Skill Gap Analysis</h1>
        <p className="text-muted-foreground">
          Use AI to identify skill shortages and get recommendations for upskilling or hiring
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Analysis Parameters</CardTitle>
          <CardDescription>Select the department and time frame for the skill gap analysis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select
                value={formData.department_id}
                onValueChange={(value) => handleSelectChange("department_id", value)}
              >
                <SelectTrigger id="department">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time_frame">Time Frame</Label>
              <Select value={formData.time_frame} onValueChange={(value) => handleSelectChange("time_frame", value)}>
                <SelectTrigger id="time_frame">
                  <SelectValue placeholder="Select time frame" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3_months">3 Months</SelectItem>
                  <SelectItem value="6_months">6 Months</SelectItem>
                  <SelectItem value="12_months">12 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={analyzeSkillGaps} disabled={analyzing || !formData.department_id} className="w-full">
            {analyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Analyze Skill Gaps"
            )}
          </Button>
        </CardFooter>
      </Card>

      {analysis ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Skill Gaps</CardTitle>
                  <div className="bg-primary/10 p-2 rounded-full">
                    <BarChart2 className="h-4 w-4 text-primary" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{analysis.summary.total_gaps}</div>
                <p className="text-sm text-muted-foreground">
                  {analysis.summary.critical_gaps > 0
                    ? `Including ${analysis.summary.critical_gaps} critical gaps`
                    : "No critical gaps identified"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Cost Comparison</CardTitle>
                  <div className="bg-primary/10 p-2 rounded-full">
                    <DollarSign className="h-4 w-4 text-primary" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Hiring</span>
                    <span className="text-sm font-medium">${analysis.summary.total_cost_hiring.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Training</span>
                    <span className="text-sm font-medium">
                      ${analysis.summary.total_cost_training.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t">
                    <span className="text-sm">Savings</span>
                    <span className="text-sm font-medium text-green-600">
                      ${(analysis.summary.total_cost_hiring - analysis.summary.total_cost_training).toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Recommended Approach</CardTitle>
                  <div className="bg-primary/10 p-2 rounded-full">
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-medium capitalize">{analysis.summary.recommended_approach}</div>
                <p className="text-sm text-muted-foreground">
                  Estimated time to fill gaps: {analysis.summary.time_to_fill}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detailed Skill Gap Analysis</CardTitle>
              <CardDescription>Breakdown of skill gaps with recommendations for each skill</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {analysis.skill_gaps.map((gap: any, index: number) => (
                  <div key={index} className="border rounded-lg overflow-hidden">
                    <div className="p-4 border-b bg-muted/20">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{gap.skill_name}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-sm text-muted-foreground">
                              Current: {gap.current_headcount} / Required: {gap.required_headcount}
                            </span>
                            <Badge variant="outline" className="bg-red-50 text-red-700">
                              Gap: {gap.gap}
                            </Badge>
                            {getPriorityBadge(gap.priority)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">Estimated Cost</div>
                          <div className="text-lg font-bold">${gap.estimated_cost.toLocaleString()}</div>
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="text-xs text-muted-foreground mb-1">Current vs. Required</div>
                        <div className="relative pt-1">
                          <div className="flex items-center justify-between mb-1">
                            <div>
                              <span className="text-xs font-semibold inline-block text-primary">
                                {Math.round((gap.current_headcount / gap.required_headcount) * 100)}%
                              </span>
                            </div>
                            <div>
                              <span className="text-xs font-semibold inline-block text-primary">100%</span>
                            </div>
                          </div>
                          <div className="overflow-hidden h-2 text-xs flex rounded bg-primary/20">
                            <div
                              style={{
                                width: `${Math.round((gap.current_headcount / gap.required_headcount) * 100)}%`,
                              }}
                              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary"
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4">
                      <Tabs defaultValue="recommendation">
                        <TabsList className="mb-4">
                          <TabsTrigger value="recommendation">Recommendation</TabsTrigger>
                          <TabsTrigger value="training">Training Option</TabsTrigger>
                        </TabsList>

                        <TabsContent value="recommendation">
                          <p className="text-sm">{gap.recommendation}</p>
                        </TabsContent>

                        <TabsContent value="training">
                          {gap.training_option.feasible ? (
                            <div className="space-y-3">
                              <div className="flex items-start space-x-3">
                                <GraduationCap className="h-5 w-5 text-primary mt-0.5" />
                                <div>
                                  <h4 className="font-medium">Training Option Available</h4>
                                  <p className="text-sm text-muted-foreground">
                                    Training existing employees is a viable option for this skill gap.
                                  </p>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                                <div>
                                  <div className="text-sm font-medium">Duration</div>
                                  <div className="text-sm">{gap.training_option.duration}</div>
                                </div>
                                <div>
                                  <div className="text-sm font-medium">Cost</div>
                                  <div className="text-sm">${gap.training_option.cost.toLocaleString()}</div>
                                </div>
                                <div>
                                  <div className="text-sm font-medium">Savings</div>
                                  <div className="text-sm text-green-600">
                                    ${(gap.estimated_cost - gap.training_option.cost).toLocaleString()}
                                  </div>
                                </div>
                              </div>

                              <div>
                                <div className="text-sm font-medium mb-1">Recommended Candidates</div>
                                <div className="flex flex-wrap gap-1">
                                  {gap.training_option.candidates.map((candidate: string, i: number) => (
                                    <Badge
                                      key={i}
                                      variant="outline"
                                      className="bg-blue-50 text-blue-700 border-blue-200"
                                    >
                                      {candidate}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground">
                              Training existing employees is not feasible for this skill gap. Hiring is recommended.
                            </div>
                          )}
                        </TabsContent>
                      </Tabs>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setAnalysis(null)}>
                Modify Parameters
              </Button>
              <Button onClick={() => router.push("/dashboard/workforce")}>Save Analysis</Button>
            </CardFooter>
          </Card>
        </div>
      ) : null}
    </div>
  )
}

