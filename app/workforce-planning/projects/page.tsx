"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { workforcePlanningService } from '@/lib/services/workforce-planning-service'
import { ProjectList } from '../components/project-list' // Adjusted path

interface Project {
  id: string
  name: string | null
  start_date: string | null
  end_date: string | null
  status: string | null
}

export default function ProjectsListPage() {
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
      } catch (err) {
        console.error("Failed to fetch projects:", err)
        setError("Failed to load projects. Please try again later.")
        setProjects([])
      } finally {
        setIsLoading(false)
      }
    }
    loadProjects()
  }, [])

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Link href="/workforce-planning/projects/new" passHref>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Create Project
          </Button>
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-md">
          {error}
        </div>
      )}

      <div className="bg-card p-4 rounded-lg shadow">
        <ProjectList projects={projects} isLoading={isLoading} />
      </div>
    </div>
  )
} 