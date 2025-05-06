"use client"

import type React from "react"

import { useState } from "react"
import { CalendarIcon, DollarSign, X } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// Mock data for skills
const availableSkills = [
  "JavaScript",
  "TypeScript",
  "React",
  "Angular",
  "Vue.js",
  "Node.js",
  "Python",
  "Java",
  "C#",
  ".NET",
  "PHP",
  "Ruby",
  "Go",
  "Rust",
  "AWS",
  "Azure",
  "GCP",
  "Docker",
  "Kubernetes",
  "CI/CD",
  "SQL",
  "NoSQL",
  "MongoDB",
  "PostgreSQL",
  "MySQL",
  "Oracle",
  "UI/UX Design",
  "Figma",
  "Adobe XD",
  "Sketch",
  "User Research",
  "Product Management",
  "Agile",
  "Scrum",
  "Kanban",
  "JIRA",
  "DevOps",
  "SRE",
  "Security",
  "Performance",
  "Scalability",
  "Machine Learning",
  "AI",
  "Data Science",
  "Big Data",
  "Analytics",
]

interface ProjectAnalysisFormProps {
  onSubmit: (data: any) => void
}

export function ProjectAnalysisForm({ onSubmit }: ProjectAnalysisFormProps) {
  const [projectName, setProjectName] = useState("")
  const [projectDescription, setProjectDescription] = useState("")
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [budget, setBudget] = useState("")
  const [complexity, setComplexity] = useState(50)
  const [priority, setPriority] = useState("medium")
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState("")
  const [filteredSkills, setFilteredSkills] = useState<string[]>([])

  const handleSkillInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSkillInput(value)

    if (value.trim() === "") {
      setFilteredSkills([])
    } else {
      const filtered = availableSkills
        .filter((skill) => skill.toLowerCase().includes(value.toLowerCase()) && !selectedSkills.includes(skill))
        .slice(0, 5)
      setFilteredSkills(filtered)
    }
  }

  const addSkill = (skill: string) => {
    if (!selectedSkills.includes(skill)) {
      setSelectedSkills([...selectedSkills, skill])
    }
    setSkillInput("")
    setFilteredSkills([])
  }

  const removeSkill = (skill: string) => {
    setSelectedSkills(selectedSkills.filter((s) => s !== skill))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Prepare the data for analysis
    const analysisData = {
      projectName,
      projectDescription,
      startDate,
      endDate,
      budget: Number.parseFloat(budget.replace(/[^0-9.]/g, "")),
      complexity,
      priority,
      requiredSkills: selectedSkills,
      // Generate mock data for the AI analysis
      skillMatching: {
        matchedEmployees: selectedSkills.map((skill) => ({
          skill,
          matchedCount: Math.floor(Math.random() * 5) + 1,
          totalRequired: Math.floor(Math.random() * 3) + 2,
          availableEmployees: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, i) => ({
            id: `EMP${Math.floor(Math.random() * 1000)}`,
            name: ["John Smith", "Emily Johnson", "Michael Brown", "Jessica Davis", "David Wilson"][
              Math.floor(Math.random() * 5)
            ],
            matchScore: Math.floor(Math.random() * 30) + 70,
            currentProjects: Math.floor(Math.random() * 3),
          })),
        })),
        overallMatch: Math.floor(Math.random() * 30) + 50,
      },
      capacityAnalysis: {
        totalRequired: Math.floor(Math.random() * 5) + 5,
        availableCapacity: Math.floor(Math.random() * 3) + 1,
        capacityGap: Math.floor(Math.random() * 5) + 2,
        utilizationRate: Math.floor(Math.random() * 20) + 80,
        teamAvailability: [
          {
            department: "Engineering",
            available: Math.floor(Math.random() * 5) + 1,
            required: Math.floor(Math.random() * 5) + 5,
          },
          {
            department: "Design",
            available: Math.floor(Math.random() * 2) + 1,
            required: Math.floor(Math.random() * 2) + 2,
          },
          {
            department: "Product",
            available: Math.floor(Math.random() * 2),
            required: Math.floor(Math.random() * 2) + 1,
          },
        ],
      },
      revenueEstimation: {
        estimatedRevenue: Math.floor(Math.random() * 500000) + 500000,
        costEstimate: Math.floor(Math.random() * 200000) + 200000,
        profitMargin: Math.floor(Math.random() * 20) + 30,
        roi: Math.floor(Math.random() * 100) + 100,
        confidenceScore: Math.floor(Math.random() * 20) + 80,
      },
      hiringRecommendations: {
        recommendedHires: [
          {
            role: "Full-stack Developer",
            count: 2,
            skills: ["React", "Node.js", "TypeScript"],
            employmentType: "Full-time",
            annualCost: 180000,
          },
          {
            role: "UX Designer",
            count: 1,
            skills: ["Figma", "User Research"],
            employmentType: "Freelance",
            annualCost: 45000,
          },
        ],
        totalCost: 225000,
        timeToHire: 45,
        impactOnTimeline: "Medium",
        alternativeSolutions: [
          {
            description: "Outsource development",
            pros: ["Faster start", "Lower upfront cost"],
            cons: ["Less control", "Potential quality issues"],
          },
          {
            description: "Delay project start",
            pros: ["Use existing team", "No hiring costs"],
            cons: ["Miss market opportunity", "Potential revenue loss"],
          },
        ],
      },
    }

    onSubmit(analysisData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="project-name">Project Name</Label>
            <Input
              id="project-name"
              placeholder="Enter project name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="budget">Estimated Budget</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="budget"
                className="pl-8"
                placeholder="0.00"
                value={budget}
                onChange={(e) => {
                  // Format as currency
                  const value = e.target.value.replace(/[^0-9.]/g, "")
                  if (value === "" || /^\d+(\.\d{0,2})?$/.test(value)) {
                    setBudget(value === "" ? "" : `$${value}`)
                  }
                }}
                required
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="project-description">Project Description</Label>
          <Textarea
            id="project-description"
            placeholder="Describe the project scope, objectives, and deliverables"
            className="min-h-[100px]"
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label>End Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                  disabled={(date) => (startDate ? date < startDate : false) || date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Project Complexity</Label>
            <span className="text-sm text-muted-foreground">
              {complexity < 33 ? "Low" : complexity < 66 ? "Medium" : "High"}
            </span>
          </div>
          <Slider
            value={[complexity]}
            min={0}
            max={100}
            step={1}
            onValueChange={(value) => setComplexity(value[0])}
            className="py-4"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Project Priority</Label>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger id="priority">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Required Skills</Label>
          <div className="flex flex-wrap gap-2 rounded-md border p-2">
            {selectedSkills.map((skill) => (
              <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="ml-1 rounded-full p-0.5 hover:bg-muted"
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove {skill}</span>
                </button>
              </Badge>
            ))}
            <div className="relative flex-1 min-w-[120px]">
              <Input
                value={skillInput}
                onChange={handleSkillInputChange}
                placeholder="Add skills..."
                className="border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
              />
              {filteredSkills.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-md border bg-popover shadow-md">
                  {filteredSkills.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => addSkill(skill)}
                      className="flex w-full items-center px-3 py-2 text-left text-sm hover:bg-muted"
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Add skills required for this project. The AI will match these with available employees.
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" className="w-full sm:w-auto">
          Run AI Analysis
        </Button>
      </div>
    </form>
  )
}

