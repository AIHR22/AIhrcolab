"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Plus, Trash2, AlertTriangle, CheckCircle2, BarChart2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function AnalyzeProjectPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [skills, setSkills] = useState<any[]>([])
  const [analysis, setAnalysis] = useState<any>(null)
  const [formData, setFormData] = useState({
    project_name: "",
    description: "",
    start_date: "",
    end_date: "",
    budget: "",
    required_skills: [{ skill_id: "", skill_name: "", required_level: 3, required_count: 1 }],
  })

  // In a real app, this would be fetched from the API
  const availableSkills = [
    { id: "1", name: "JavaScript" },
    { id: "2", name: "React" },
    { id: "3", name: "Node.js" },
    { id: "4", name: "Python" },
    { id: "5", name: "Machine Learning" },
    { id: "6", name: "DevOps" },
    { id: "7", name: "Cloud Architecture" },
    { id: "8", name: "UI/UX Design" },
    { id: "9", name: "Mobile Development" },
    { id: "10", name: "Data Science" },
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleDateChange = (name: string, date: Date | undefined) => {
    if (date) {
      setFormData({ ...formData, [name]: date.toISOString().split("T")[0] })
    }
  }

  const handleSkillChange = (index: number, field: string, value: string | number) => {
    const updatedSkills = [...formData.required_skills]
    updatedSkills[index] = { ...updatedSkills[index], [field]: value }

    // If skill_id changed, update skill_name
    if (field === "skill_id") {
      const skill = availableSkills.find((s) => s.id === value)
      if (skill) {
        updatedSkills[index].skill_name = skill.name
      }
    }

    setFormData({ ...formData, required_skills: updatedSkills })
  }

  const addSkill = () => {
    setFormData({
      ...formData,
      required_skills: [
        ...formData.required_skills,
        { skill_id: "", skill_name: "", required_level: 3, required_count: 1 },
      ],
    })
  }

  const removeSkill = (index: number) => {
    const updatedSkills = [...formData.required_skills]
    updatedSkills.splice(index, 1)
    setFormData({ ...formData, required_skills: updatedSkills })
  }

  const fetchSkills = async () => {
    setLoading(true)
    try {
      // In a real app, this would be an API call
      // For demo purposes, we'll use the availableSkills array
      setSkills(availableSkills)
    } catch (error) {
      console.error("Error fetching skills:", error)
      toast({
        title: "Error",
        description: "Failed to load skills. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const analyzeProject = async () => {
    setAnalyzing(true)
    try {
      // In a real app, this would be an API call to /api/workforce/project-feasibility
      // For demo purposes, we'll simulate a response
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Simulate different responses based on the project name
      let mockAnalysis
      if (
        formData.project_name.toLowerCase().includes("ai") ||
        formData.project_name.toLowerCase().includes("machine learning")
      ) {
        mockAnalysis = {
          feasibility_score: 40,
          resource_gap: {
            message: "Significant resource gap identified",
            details: "Current team lacks sufficient ML engineers and data scientists",
          },
          skill_gap: {
            message: "Critical skill gaps in Machine Learning and Data Science",
            missing_skills: ["Machine Learning (3 needed)", "Data Science (2 needed)"],
          },
          recommendation:
            "This project is not feasible with the current workforce. Consider hiring 3 ML engineers and 2 data scientists, or postponing the project by 3 months to allow for training and upskilling.",
        }
      } else if (
        formData.project_name.toLowerCase().includes("web") ||
        formData.project_name.toLowerCase().includes("app")
      ) {
        mockAnalysis = {
          feasibility_score: 85,
          resource_gap: {
            message: "Minor resource gap identified",
            details: "Current team has most required resources, but may need additional frontend developer",
          },
          skill_gap: {
            message: "Minor skill gaps in React and UI/UX Design",
            missing_skills: ["React (1 needed)", "UI/UX Design (1 needed)"],
          },
          recommendation:
            "This project is feasible with the current workforce with minor adjustments. Consider hiring 1 additional React developer or reallocating resources from Project X which is ending next month.",
        }
      } else {
        mockAnalysis = {
          feasibility_score: 65,
          resource_gap: {
            message: "Moderate resource gap identified",
            details: "Current team has some required resources, but additional specialists needed",
          },
          skill_gap: {
            message: "Moderate skill gaps in several areas",
            missing_skills: ["Cloud Architecture (1 needed)", "DevOps (1 needed)"],
          },
          recommendation:
            "This project is challenging but potentially feasible with the current workforce. Consider hiring 1 cloud architect and providing DevOps training to 2 existing engineers. Alternatively, consider extending the project timeline by 2 months.",
        }
      }

      setAnalysis(mockAnalysis)
    } catch (error) {
      console.error("Error analyzing project:", error)
      toast({
        title: "Error",
        description: "Failed to analyze project. Please try again.",
        variant: "destructive",
      })
    } finally {
      setAnalyzing(false)
    }
  }

  // Fetch skills when component mounts
  useState(() => {
    fetchSkills()
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Project Feasibility Analysis</h1>
        <p className="text-muted-foreground">
          Use AI to analyze if a new project is feasible with your current workforce
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>Enter the details of the project you want to analyze</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="project_name">Project Name</Label>
              <Input
                id="project_name"
                name="project_name"
                value={formData.project_name}
                onChange={handleInputChange}
                placeholder="Enter project name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter project description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <DatePicker
                  date={formData.start_date ? new Date(formData.start_date) : undefined}
                  onSelect={(date) => handleDateChange("start_date", date)}
                />
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <DatePicker
                  date={formData.end_date ? new Date(formData.end_date) : undefined}
                  onSelect={(date) => handleDateChange("end_date", date)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">Budget (USD)</Label>
              <Input
                id="budget"
                name="budget"
                value={formData.budget}
                onChange={handleInputChange}
                placeholder="Enter project budget"
                type="number"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Required Skills</Label>
                <Button variant="outline" size="sm" onClick={addSkill} type="button">
                  <Plus className="h-4 w-4 mr-1" /> Add Skill
                </Button>
              </div>

              {formData.required_skills.map((skill, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5">
                    <Label htmlFor={`skill_${index}`} className="text-xs">
                      Skill
                    </Label>
                    <Select
                      value={skill.skill_id}
                      onValueChange={(value) => handleSkillChange(index, "skill_id", value)}
                    >
                      <SelectTrigger id={`skill_${index}`}>
                        <SelectValue placeholder="Select skill" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSkills.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-3">
                    <Label htmlFor={`level_${index}`} className="text-xs">
                      Level (1-5)
                    </Label>
                    <Select
                      value={skill.required_level.toString()}
                      onValueChange={(value) => handleSkillChange(index, "required_level", Number.parseInt(value))}
                    >
                      <SelectTrigger id={`level_${index}`}>
                        <SelectValue placeholder="Level" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map((level) => (
                          <SelectItem key={level} value={level.toString()}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-3">
                    <Label htmlFor={`count_${index}`} className="text-xs">
                      Count
                    </Label>
                    <Input
                      id={`count_${index}`}
                      type="number"
                      min="1"
                      value={skill.required_count}
                      onChange={(e) => handleSkillChange(index, "required_count", Number.parseInt(e.target.value))}
                    />
                  </div>

                  <div className="col-span-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSkill(index)}
                      disabled={formData.required_skills.length === 1}
                      type="button"
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={analyzeProject}
              disabled={analyzing || !formData.project_name || !formData.start_date || !formData.end_date}
              className="w-full"
            >
              {analyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Analyze Project Feasibility"
              )}
            </Button>
          </CardFooter>
        </Card>

        {analysis ? (
          <Card>
            <CardHeader>
              <CardTitle>Feasibility Analysis Results</CardTitle>
              <CardDescription>AI-powered analysis of project feasibility with your current workforce</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
                <div className="text-4xl font-bold mb-2">{analysis.feasibility_score}%</div>
                <div className="text-sm font-medium">
                  {analysis.feasibility_score >= 80 ? (
                    <span className="text-green-600">Feasible</span>
                  ) : analysis.feasibility_score >= 60 ? (
                    <span className="text-yellow-600">Challenging</span>
                  ) : (
                    <span className="text-red-600">Not Feasible</span>
                  )}
                </div>
                <div className="w-full mt-4">
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        analysis.feasibility_score >= 80
                          ? "bg-green-500"
                          : analysis.feasibility_score >= 60
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                      style={{ width: `${analysis.feasibility_score}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Resource Gap Analysis</h3>
                  <p className="text-sm text-muted-foreground mb-2">{analysis.resource_gap.message}</p>
                  <p className="text-sm">{analysis.resource_gap.details}</p>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Skill Gap Analysis</h3>
                  <p className="text-sm text-muted-foreground mb-2">{analysis.skill_gap.message}</p>
                  <ul className="text-sm list-disc list-inside">
                    {analysis.skill_gap.missing_skills.map((skill: string, index: number) => (
                      <li key={index}>{skill}</li>
                    ))}
                  </ul>
                </div>

                <div
                  className={`border rounded-lg p-4 ${
                    analysis.feasibility_score >= 80
                      ? "bg-green-50"
                      : analysis.feasibility_score >= 60
                        ? "bg-yellow-50"
                        : "bg-red-50"
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {analysis.feasibility_score >= 80 ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                    ) : analysis.feasibility_score >= 60 ? (
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                    )}
                    <div>
                      <h3 className="font-medium mb-1">AI Recommendation</h3>
                      <p className="text-sm">{analysis.recommendation}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setAnalysis(null)}>
                Modify Project
              </Button>
              <Button onClick={() => router.push("/dashboard/workforce")}>Save Analysis</Button>
            </CardFooter>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Analysis Results</CardTitle>
              <CardDescription>
                Enter project details and click "Analyze" to see AI-powered feasibility analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-10 text-center">
              <div className="rounded-full bg-primary/10 p-3 mb-4">
                <BarChart2 className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">No Analysis Yet</h3>
              <p className="text-muted-foreground max-w-md">
                Fill out the project details form and click "Analyze Project Feasibility" to get an AI-powered analysis
                of whether your current workforce can handle this project.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

