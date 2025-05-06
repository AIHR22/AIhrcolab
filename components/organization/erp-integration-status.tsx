"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Database, Check, AlertCircle, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function ERPIntegrationStatus() {
  const [status, setStatus] = useState<"connected" | "disconnected" | "loading" | "error">("loading")
  const [message, setMessage] = useState<string>("")
  const [isUsingLocalData, setIsUsingLocalData] = useState(true)

  useEffect(() => {
    // We're not using an actual ERP system, so we'll just set the status directly
    setStatus("connected")
    setMessage("Using Supabase as primary data source")
    setIsUsingLocalData(true)
  }, [])

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Data Source</CardTitle>
            <CardDescription>Organization data source configuration</CardDescription>
          </div>
          <Badge 
            variant={status === "connected" ? "default" : "destructive"}
            className="px-3 py-1"
          >
            {status === "connected" && <Check className="w-3 h-3 mr-1" />}
            {status === "connected" ? "Connected" : "Disconnected"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3 mb-3">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Database className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-medium">Supabase Database</p>
            <p className="text-sm text-muted-foreground">Direct database integration</p>
          </div>
        </div>

        <Alert className="mt-4">
          <Info className="h-4 w-4" />
          <AlertTitle>Information</AlertTitle>
          <AlertDescription>
            You are currently using Supabase directly as your data source. The AI organization chart generator
            will only use employees and departments from your database.
          </AlertDescription>
        </Alert>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground w-full text-center">
          Connect to an external HR system for more advanced features
        </p>
      </CardFooter>
    </Card>
  )
} 