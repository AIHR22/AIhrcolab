"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Database, CheckCircle, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Add organization setup to the setupOptions array
const setupOptions = [
  {
    title: "Basic Tables",
    description: "Create all essential tables needed by the application.",
    endpoint: "/api/setup/all",
  },
  {
    title: "Organization Tables",
    description: "Setup organization structure tables with sample data.",
    endpoint: "/api/setup/organization-tables",
  },
  {
    title: "Employee Tables",
    description: "Setup employees and related tables.",
    endpoint: "/api/setup/employees",
  },
  // ... keep existing options ...
];

export function SetupDatabaseButton() {
  const [status, setStatus] = useState<"idle" | "setting_up" | "seeding" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const setupDatabase = async () => {
    setStatus("setting_up")
    setMessage("Creating database tables...")

    try {
      // Step 1: Create tables
      const setupResponse = await fetch("/api/setup-db")
      if (!setupResponse.ok) {
        const error = await setupResponse.json()
        throw new Error(error.error || "Failed to create database tables")
      }

      // Step 2: Seed database
      setStatus("seeding")
      setMessage("Seeding database with sample data...")

      const seedResponse = await fetch("/api/seed-db")
      if (!seedResponse.ok) {
        const error = await seedResponse.json()
        throw new Error(error.error || "Failed to seed database")
      }

      const seedResult = await seedResponse.json()

      setStatus("success")
      setMessage(
        `Database setup complete! Created ${seedResult.counts.employees} employees, ${seedResult.counts.timeOffRequests} time off requests, and ${seedResult.counts.reviews} reviews.`,
      )
    } catch (error) {
      console.error("Database setup error:", error)
      setStatus("error")
      setMessage(error instanceof Error ? error.message : "An unknown error occurred")
    }
  }

  return (
    <div className="space-y-4">
      <Button onClick={setupDatabase} disabled={status === "setting_up" || status === "seeding"} className="w-full">
        {status === "idle" && (
          <>
            <Database className="mr-2 h-4 w-4" />
            Setup Database
          </>
        )}
        {status === "setting_up" && "Creating tables..."}
        {status === "seeding" && "Seeding database..."}
        {status === "success" && (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            Setup Complete
          </>
        )}
        {status === "error" && (
          <>
            <AlertCircle className="mr-2 h-4 w-4" />
            Retry Setup
          </>
        )}
      </Button>

      {status === "success" && (
        <Alert className="bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-50">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Setup Successful</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {status === "error" && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Setup Failed</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

