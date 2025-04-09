"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  Users, 
  BrainCircuit, 
  BarChart3, 
  Loader2,
  Plus,
  Trash2
} from "lucide-react"
import { analyzeProjectFeasibility } from "@/lib/api/workforce"
import { toast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

interface SkillRequirement {
  skill_id: string
  skill_name?: string
  required_level: number
  required_count: number
}

interface ProjectFeasibilityProps {
  projectId?: string
  onSave?: (data: any) => void
}

export function ProjectFeasibility({ projectId, onSave }: ProjectFeasibilityProps) {
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [projectName, setProjectName] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [budget, setBudget] = useState<number | undefined>(undefined)
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium")
  const [complexity, setComplexity] = useState<"high" | "medium" | "low">("medium")
  const [requiredSkills, setRequiredSkills] = useState<SkillRequirement[]>([])
  const [feasibilityResult, setFeasibilityResult] = useState<any>(null)
  const [availableSkills, setAvailableSkills] = useState<Array<{id: string, name: string}>>([])

  useEffect(() => {
    // Fetch available skills
    const fetchSkills = async () => {
      try {
        const response = await fetch('/api/skills')
        if (response.ok) {
          const data = await response.json()
          console.log("Skills API response:", data) // Debug log
          
          // Fix: The API returns { success: true, skills: [...] }
          // Make sure we extract the skills array correctly
          if (data.skills && Array.isArray(data.skills)) {
            console.log("Using data.skills array:", data.skills)
            setAvailableSkills(data.skills)
          } else if (Array.isArray(data)) {
            console.log("Using direct data array:", data)
            setAvailableSkills(data)
          } else {
            console.error("Unexpected skills data format:", data)
            setAvailableSkills([])
          }
        }
      } catch (error) {
        console.error("Error fetching skills:", error)
        setAvailableSkills([])
      }
    }
    
    fetchSkills()
    
    // If projectId is provided, fetch project details
    if (projectId) {
      const fetchProject = async () => {
        try {
          setLoading(true)
          const response = await fetch(`/api/projects/${projectId}`)
          if (response.ok) {
            const data = await response.json()
            setProjectName(data.name)
            setStartDate(data.start_date)
            setEndDate(data.end_date)
            setBudget(data.budget)
            setDescription(data.description || "")
            setPriority(data.priority || "medium")
            setComplexity(data.complexity || "medium")
            
            // Fetch project skills
            const skillsResponse = await fetch(`/api/projects/${projectId}/skills`)
            if (skillsResponse.ok) {
              const skillsData = await skillsResponse.json()
              setRequiredSkills(skillsData.map((skill: any) => ({
                skill_id: skill.skill_id,
                skill_name: skill.skill_name,
                required_level: skill.required_level,
                required_count: skill.required_count
              })))
            }
          }
        } catch (error) {
          console.error("Error fetching project:", error)
          toast({
            title: "Error",
            description: "Failed to fetch project details",
            variant: "destructive"
          })
        } finally {
          setLoading(false)
        }
      }
      
      fetchProject()
    }
  }, [projectId])

  const handleAddSkill = () => {
    setRequiredSkills([
      ...requiredSkills,
      { skill_id: "", required_level: 1, required_count: 1 }
    ])
  }

  const handleRemoveSkill = (index: number) => {
    const newSkills = [...requiredSkills]
    newSkills.splice(index, 1)
    setRequiredSkills(newSkills)
  }

  const handleSkillChange = (index: number, field: keyof SkillRequirement, value: any) => {
    const newSkills = [...requiredSkills]
    newSkills[index] = { ...newSkills[index], [field]: value }
    setRequiredSkills(newSkills)
  }

  const handleAnalyzeFeasibility = async () => {
    if (!projectName || !startDate || !endDate || requiredSkills.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    try {
      setAnalyzing(true)
      
      const response = await analyzeProjectFeasibility({
        project_id: projectId,
        project_name: projectName,
        start_date: startDate,
        end_date: endDate,
        budget: budget || 0,
        required_skills: requiredSkills,
        description,
        priority,
        complexity
      })
      
      setFeasibilityResult(response)
      
      toast({
        title: "Analysis Complete",
        description: `Feasibility Score: ${response.feasibility_score}%`,
      })
    } catch (error) {
      console.error("Error analyzing feasibility:", error)
      toast({
        title: "Error",
        description: "Failed to analyze project feasibility",
        variant: "destructive"
      })
    } finally {
      setAnalyzing(false)
    }
  }

  const handleSave = () => {
    if (onSave) {
      onSave({
        project_id: projectId,
        project_name: projectName,
        start_date: startDate,
        end_date: endDate,
        budget,
        required_skills: requiredSkills,
        description,
        priority,
        complexity,
        feasibility_result: feasibilityResult
      })
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Critical": return "bg-red-500"
      case "High": return "bg-orange-500"
      case "Medium": return "bg-yellow-500"
      case "Low": return "bg-green-500"
      default: return "bg-gray-500"
    }
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32 mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <BrainCircuit className="mr-2 h-5 w-5" /> Project Feasibility Analysis
        </CardTitle>
        <CardDescription>
          Analyze the feasibility of a project based on available resources and required skills
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="details">
          <TabsList className="mb-4">
            <TabsTrigger value="details">Project Details</TabsTrigger>
            <TabsTrigger value="analysis" disabled={!feasibilityResult}>Analysis Results</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="project-name">Project Name *</Label>
                <Input 
                  id="project-name" 
                  value={projectName} 
                  onChange={(e) => setProjectName(e.target.value)} 
                  placeholder="Enter project name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="budget">Budget (Optional)</Label>
                <Input 
                  id="budget" 
                  type="number" 
                  value={budget || ""} 
                  onChange={(e) => setBudget(e.target.value ? Number(e.target.value) : undefined)} 
                  placeholder="Enter budget"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date *</Label>
                <Input 
                  id="start-date" 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date *</Label>
                <Input 
                  id="end-date" 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={priority} onValueChange={(value: "high" | "medium" | "low") => setPriority(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="complexity">Complexity</Label>
                <Select value={complexity} onValueChange={(value: "high" | "medium" | "low") => setComplexity(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select complexity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Enter project description"
                rows={3}
              />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Required Skills *</Label>
                <Button size="sm" onClick={handleAddSkill}>
                  <Plus className="mr-2 h-4 w-4" /> Add Skill
                </Button>
              </div>
              
              {requiredSkills.length === 0 ? (
                <div className="text-center p-4 border border-dashed rounded-md">
                  <p className="text-muted-foreground">No skills added yet. Click "Add Skill" to get started.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {requiredSkills.map((skill, index) => (
                    <div key={index} className="grid gap-4 md:grid-cols-4 items-end">
                      <div className="space-y-2">
                        <Label>Skill</Label>
                        <Select 
                          value={skill.skill_id} 
                          onValueChange={(value) => handleSkillChange(index, "skill_id", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select skill" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.isArray(availableSkills) ? (
                              availableSkills.map((s) => (
                                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                              ))
                            ) : (
                              <SelectItem value="">No skills available</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Required Level</Label>
                        <Select 
                          value={skill.required_level.toString()} 
                          onValueChange={(value) => handleSkillChange(index, "required_level", Number(value))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Beginner</SelectItem>
                            <SelectItem value="2">Intermediate</SelectItem>
                            <SelectItem value="3">Advanced</SelectItem>
                            <SelectItem value="4">Expert</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Required Count</Label>
                        <Input 
                          type="number" 
                          min="1"
                          value={skill.required_count} 
                          onChange={(e) => handleSkillChange(index, "required_count", Number(e.target.value))} 
                        />
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => handleRemoveSkill(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={handleSave}
                disabled={!projectName || !startDate || !endDate || requiredSkills.length === 0}
              >
                Save
              </Button>
              <Button 
                onClick={handleAnalyzeFeasibility}
                disabled={analyzing || !projectName || !startDate || !endDate || requiredSkills.length === 0}
              >
                {analyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <BrainCircuit className="mr-2 h-4 w-4" />
                    Analyze Feasibility
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="analysis" className="space-y-6">
            {feasibilityResult ? (
              <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Feasibility Score</CardTitle>
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{feasibilityResult.feasibility_score}%</div>
                      <div className="flex items-center mt-2">
                        {feasibilityResult.feasibility_score >= 70 ? (
                          <CheckCircle className="mr-1 h-4 w-4 text-green-500" />
                        ) : feasibilityResult.feasibility_score >= 40 ? (
                          <AlertTriangle className="mr-1 h-4 w-4 text-yellow-500" />
                        ) : (
                          <AlertTriangle className="mr-1 h-4 w-4 text-red-500" />
                        )}
                        <p className="text-xs text-muted-foreground">
                          {feasibilityResult.feasibility_score >= 70 
                            ? "Project is feasible" 
                            : feasibilityResult.feasibility_score >= 40 
                              ? "Project has some challenges" 
                              : "Project is not feasible"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Resource Availability</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{Math.round(feasibilityResult.resource_analysis.resource_ratio * 100)}%</div>
                      <p className="text-xs text-muted-foreground">
                        {feasibilityResult.resource_analysis.available_resources} of {feasibilityResult.resource_analysis.required_resources} resources available
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Budget Feasibility</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{Math.round(feasibilityResult.budget_analysis.budget_ratio * 100)}%</div>
                      <p className="text-xs text-muted-foreground">
                        {feasibilityResult.budget_analysis.estimated_cost > feasibilityResult.budget_analysis.available_budget 
                          ? "Budget shortfall" 
                          : "Within budget"}
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Timeline Feasibility</CardTitle>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{Math.round(feasibilityResult.time_analysis.time_ratio * 100)}%</div>
                      <p className="text-xs text-muted-foreground">
                        {feasibilityResult.time_analysis.estimated_time_days} days estimated
                      </p>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Skill Gap Analysis</CardTitle>
                    <CardDescription>Analysis of required skills vs. available skills</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4">Skill</th>
                            <th className="text-center py-3 px-4">Required</th>
                            <th className="text-center py-3 px-4">Available</th>
                            <th className="text-center py-3 px-4">Gap</th>
                            <th className="text-center py-3 px-4">Severity</th>
                          </tr>
                        </thead>
                        <tbody>
                          {feasibilityResult.skill_gaps.map((gap: any, index: number) => (
                            <tr key={index} className="border-b hover:bg-muted/50 transition-colors">
                              <td className="py-3 px-4 font-medium">{gap.skill_name || gap.skill_id}</td>
                              <td className="text-center py-3 px-4">{gap.required_count}</td>
                              <td className="text-center py-3 px-4">{gap.available_count}</td>
                              <td className="text-center py-3 px-4">{gap.gap}</td>
                              <td className="text-center py-3 px-4">
                                <Badge className={getSeverityColor(gap.severity)}>
                                  {gap.severity}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Cost Analysis</CardTitle>
                      <CardDescription>Estimated costs to address skill gaps</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span>Hiring Costs:</span>
                          <span className="font-medium">${feasibilityResult.cost_analysis.hiring_costs.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Training Costs:</span>
                          <span className="font-medium">${feasibilityResult.cost_analysis.training_costs.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Timeline Impact:</span>
                          <span className="font-medium">{feasibilityResult.cost_analysis.timeline_impact_days} days</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Risk Factors</CardTitle>
                      <CardDescription>Potential risks to project success</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc pl-5 space-y-1">
                        {feasibilityResult.risk_factors.map((risk: string, index: number) => (
                          <li key={index} className="text-sm">{risk}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>AI Recommendations</CardTitle>
                    <CardDescription>Strategic recommendations to improve feasibility</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-5 space-y-2">
                      {feasibilityResult.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="text-sm">{rec}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="text-center p-8">
                <p className="text-muted-foreground">No analysis results available. Run the analysis to see results.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
} 