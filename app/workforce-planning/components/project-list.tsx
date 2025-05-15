"use client"

import React from 'react'
import Link from 'next/link'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { format } from 'date-fns' // For date formatting

interface Project {
  id: string
  name: string | null
  start_date: string | null
  end_date: string | null
  status: string | null
}

interface ProjectListProps {
  projects: Project[]
  isLoading: boolean
}

export function ProjectList({ projects, isLoading }: ProjectListProps) {
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    try {
      return format(new Date(dateString), 'MMM dd, yyyy')
    } catch (error) {
      console.error("Error formatting date:", dateString, error)
      return 'Invalid Date'
    }
  }

  const getStatusBadgeVariant = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case 'planning': return 'secondary'
      case 'in_progress': return 'default'
      case 'completed': return 'outline'
      case 'on_hold': return 'destructive'
      default: return 'secondary'
    }
  }

  if (isLoading) {
    return <div className="text-center p-4">Loading projects...</div>
  }

  if (!projects || projects.length === 0) {
    return <div className="text-center p-4 text-muted-foreground">No projects found.</div>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Project Name</TableHead>
          <TableHead>Start Date</TableHead>
          <TableHead>End Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {projects.map((project) => (
          <TableRow key={project.id}>
            <TableCell className="font-medium">{project.name || 'Unnamed Project'}</TableCell>
            <TableCell>{formatDate(project.start_date)}</TableCell>
            <TableCell>{formatDate(project.end_date)}</TableCell>
            <TableCell>
              <Badge variant={getStatusBadgeVariant(project.status)}>
                {project.status || 'Unknown'}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <Link href={`/workforce-planning/projects/${project.id}`} passHref>
                <Button variant="outline" size="sm">View Details</Button>
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
} 