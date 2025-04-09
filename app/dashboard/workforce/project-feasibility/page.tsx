"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus, FolderOpen } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from 'next/link'
import { workforcePlanningService } from "@/lib/services/workforce-planning-service"
import { ProjectList } from "@/app/workforce-planning/components/project-list"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"

interface Project {
  id: string
  name: string | null
  start_date: string | null
  end_date: string | null
  status: string | null
}

export default function ProjectFeasibilityListPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadProjects = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await workforcePlanningService.getProjectsList()
        setProjects(data)
      } catch (err: any) {
        console.error("Failed to fetch projects:", err)
        setError(err.message || "Failed to load projects. Please try again later.")
        setProjects([])
      } finally {
        setIsLoading(false)
      }
    }
    loadProjects()
  }, [])

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Project Feasibility Analysis</h1>
        <div className="flex gap-2">
        </div>
      </div>

      {error && (
         <Alert variant="destructive">
           <AlertTriangle className="h-4 w-4" />
           <AlertTitle>Error Loading Projects</AlertTitle>
           <AlertDescription>{error}</AlertDescription>
         </Alert>
      )}

      <div className="bg-card p-4 rounded-lg shadow">
        <ProjectList projects={projects} isLoading={isLoading} />
      </div>

    </div>
  )
} 