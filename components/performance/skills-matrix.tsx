"use client"

import { useState } from "react"
import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Mock data for skills matrix
const skillsData = [
  {
    id: 1,
    name: "JavaScript",
    category: "Technical",
    employees: [
      { id: "EMP001", name: "John Smith", avatar: "/placeholder.svg?height=32&width=32", level: 5 },
      { id: "EMP003", name: "Michael Brown", avatar: "/placeholder.svg?height=32&width=32", level: 3 },
      { id: "EMP007", name: "Robert Taylor", avatar: "/placeholder.svg?height=32&width=32", level: 4 },
      { id: "EMP010", name: "Lisa Rodriguez", avatar: "/placeholder.svg?height=32&width=32", level: 2 },
    ],
  },
  {
    id: 2,
    name: "React",
    category: "Technical",
    employees: [
      { id: "EMP001", name: "John Smith", avatar: "/placeholder.svg?height=32&width=32", level: 4 },
      { id: "EMP007", name: "Robert Taylor", avatar: "/placeholder.svg?height=32&width=32", level: 3 },
      { id: "EMP008", name: "Jennifer Anderson", avatar: "/placeholder.svg?height=32&width=32", level: 5 },
    ],
  },
  {
    id: 3,
    name: "Project Management",
    category: "Management",
    employees: [
      { id: "EMP002", name: "Emily Johnson", avatar: "/placeholder.svg?height=32&width=32", level: 4 },
      { id: "EMP005", name: "David Wilson", avatar: "/placeholder.svg?height=32&width=32", level: 5 },
      { id: "EMP009", name: "Christopher Thomas", avatar: "/placeholder.svg?height=32&width=32", level: 3 },
    ],
  },
  {
    id: 4,
    name: "UI/UX Design",
    category: "Design",
    employees: [
      { id: "EMP008", name: "Jennifer Anderson", avatar: "/placeholder.svg?height=32&width=32", level: 5 },
      { id: "EMP006", name: "Sarah Martinez", avatar: "/placeholder.svg?height=32&width=32", level: 3 },
    ],
  },
  {
    id: 5,
    name: "Communication",
    category: "Soft Skills",
    employees: [
      { id: "EMP002", name: "Emily Johnson", avatar: "/placeholder.svg?height=32&width=32", level: 5 },
      { id: "EMP004", name: "Jessica Davis", avatar: "/placeholder.svg?height=32&width=32", level: 5 },
      { id: "EMP005", name: "David Wilson", avatar: "/placeholder.svg?height=32&width=32", level: 4 },
      { id: "EMP006", name: "Sarah Martinez", avatar: "/placeholder.svg?height=32&width=32", level: 4 },
      { id: "EMP009", name: "Christopher Thomas", avatar: "/placeholder.svg?height=32&width=32", level: 3 },
    ],
  },
]

export function SkillsMatrix() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")

  const filteredSkills = skillsData.filter(
    (skill) =>
      skill.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (categoryFilter === "all" || skill.category === categoryFilter),
  )

  // Get unique categories for filter
  const categories = Array.from(new Set(skillsData.map((skill) => skill.category)))

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search skills..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline">Add Skill</Button>
      </div>

      <div className="space-y-4">
        {filteredSkills.map((skill) => (
          <div key={skill.id} className="rounded-lg border p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">{skill.name}</h3>
                <p className="text-sm text-muted-foreground">Category: {skill.category}</p>
              </div>
              <Button variant="outline" size="sm">
                Manage
              </Button>
            </div>

            <div className="space-y-3">
              {skill.employees.map((employee) => (
                <div key={employee.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={employee.avatar} alt={employee.name} />
                      <AvatarFallback>
                        {employee.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span>{employee.name}</span>
                  </div>
                  <div className="flex items-center">
                    <SkillLevel level={employee.level} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SkillLevel({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className={`h-2 w-6 rounded-sm ${index < level ? "bg-primary" : "bg-muted"}`} />
      ))}
      <span className="ml-2 text-sm">{level}/5</span>
    </div>
  )
}

