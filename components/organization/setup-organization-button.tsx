"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Database, CheckCircle, AlertCircle, RefreshCw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

interface SetupOrganizationButtonProps {
  onSetupComplete?: () => void
}

export function SetupOrganizationButton({ onSetupComplete }: SetupOrganizationButtonProps) {
  const [status, setStatus] = useState<"idle" | "setting_up" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const { toast } = useToast()

  const setupOrganizationTables = async () => {
    setStatus("setting_up")
    setMessage("Setting up organization tables...")

    try {
      // Setup organization tables
      const response = await fetch("/api/setup/organization-tables", {
        method: "POST",
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to setup organization tables")
      }

      const result = await response.json()

      setStatus("success")
      setMessage("Organization structure setup complete!")
      
      toast({
        title: "Setup Successful",
        description: "Organization tables have been created with sample data.",
      })
      
      if (onSetupComplete) {
        onSetupComplete()
      }
    } catch (error) {
      console.error("Organization setup error:", error)
      setStatus("error")
      setMessage(error instanceof Error ? error.message : "An unknown error occurred")
      
      toast({
        title: "Setup Failed",
        description: "Failed to setup organization tables. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      <Button onClick={setupOrganizationTables} disabled={status === "setting_up"} className="w-full">
        {status === "idle" && (
          <>
            <Database className="mr-2 h-4 w-4" />
            Setup Organization
          </>
        )}
        {status === "setting_up" && (
          <>
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Setting up tables...
          </>
        )}
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