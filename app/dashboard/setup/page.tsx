"use client"

import { useState } from "react"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, CheckCircle, XCircle, Database, TableProperties } from "lucide-react"

export default function SetupPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [status, setStatus] = useState<Record<string, "success" | "error" | null>>({})

  const setupEndpoints = [
    {
      id: "projects",
      name: "Projects Tables",
      description: "Create projects, skills, and project allocations tables",
      endpoint: "/api/setup/projects-tables",
    },
    {
      id: "workforce",
      name: "Workforce Planning Tables",
      description: "Create workforce planning related tables",
      endpoint: "/api/setup/workforce-planning-tables",
    },
  ]

  // Add time-off tables setup to the setupOptions array

  const setupOptions = [
    {
      id: "employees",
      name: "Employees Tables",
      description: "Create the employees table and related tables",
      endpoint: "/api/setup/employees-tables",
    },
    {
      id: "projects",
      name: "Projects Tables",
      description: "Create the projects table and related tables",
      endpoint: "/api/setup/projects-tables",
    },
    {
      id: "workforce",
      name: "Workforce Planning Tables",
      description: "Create the workforce planning tables",
      endpoint: "/api/setup/workforce-planning-tables",
    },
    {
      id: "timeoff",
      name: "Time Off Tables",
      description: "Create the time off management tables",
      endpoint: "/api/setup/time-off-tables",
    },
  ]

  const runSetup = async (id: string, endpoint: string) => {
    setLoading((prev) => ({ ...prev, [id]: true }))
    setStatus((prev) => ({ ...prev, [id]: null }))

    try {
      const response = await fetch(endpoint, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error(`Failed to run setup for ${id}`)
      }

      const data = await response.json()

      if (data.success) {
        setStatus((prev) => ({ ...prev, [id]: "success" }))
        toast({
          title: "Success",
          description: data.message || `Setup for ${id} completed successfully`,
        })
      } else {
        throw new Error(data.error || `Failed to run setup for ${id}`)
      }
    } catch (error: any) {
      console.error(`Error running setup for ${id}:`, error)
      setStatus((prev) => ({ ...prev, [id]: "error" }))
      toast({
        title: "Error",
        description: error.message || `Failed to run setup for ${id}`,
        variant: "destructive",
      })
    } finally {
      setLoading((prev) => ({ ...prev, [id]: false }))
    }
  }

  const getStatusIcon = (id: string) => {
    if (loading[id]) {
      return <Loader2 className="h-5 w-5 animate-spin text-primary" />
    }

    if (status[id] === "success") {
      return <CheckCircle className="h-5 w-5 text-green-500" />
    }

    if (status[id] === "error") {
      return <XCircle className="h-5 w-5 text-red-500" />
    }

    return null
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col items-center justify-center mb-8">
        <Database className="h-12 w-12 text-primary mb-4" />
        <h1 className="text-3xl font-bold tracking-tight">Database Setup</h1>
        <p className="text-muted-foreground mt-2 text-center max-w-md">
          Initialize the required database tables for the HR Suite application
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
        {setupOptions.map((setup) => (
          <Card key={setup.id} className="relative">
            {getStatusIcon(setup.id) && <div className="absolute top-4 right-4">{getStatusIcon(setup.id)}</div>}
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TableProperties className="h-5 w-5 text-primary" />
                {setup.name}
              </CardTitle>
              <CardDescription>{setup.description}</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button
                className="w-full"
                onClick={() => runSetup(setup.id, setup.endpoint)}
                disabled={loading[setup.id]}
              >
                {loading[setup.id] && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {status[setup.id] === "success" ? "Run Again" : "Run Setup"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-8 text-center">
        <p className="text-muted-foreground mb-4">
          After setting up the database tables, you can navigate to the dashboard
        </p>
        <Button variant="outline" size="lg" asChild>
          <a href="/dashboard">Go to Dashboard</a>
        </Button>
      </div>
    </div>
  )
}

