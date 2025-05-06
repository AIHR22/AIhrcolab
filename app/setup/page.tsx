"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle, Database, Users, FileText, BarChart4, RefreshCw } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function SetupPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<{
    success: boolean
    message: string
    step: string
  } | null>(null)
  const [debug, setDebug] = useState<string[]>([])

  const createTables = async () => {
    setIsLoading(true)
    setStatus({ success: true, message: "Creating tables...", step: "tables" })
    setDebug([])

    try {
      // Call the API endpoint
      const response = await fetch("/api/setup/create-tables", {
        method: "POST",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to create tables")
      }

      setStatus({ success: true, message: "Tables created successfully!", step: "tables" })
    } catch (error: any) {
      setStatus({ success: false, message: error.message, step: "tables" })
      setDebug((prev) => [...prev, `Create tables error: ${error.message}`])
    } finally {
      setIsLoading(false)
    }
  }

  const createEmployeesTable = async () => {
    setIsLoading(true)
    setStatus({ success: true, message: "Creating employees table...", step: "employees-table" })
    setDebug([])

    try {
      const response = await fetch("/api/setup/create-employees-table", {
        method: "POST",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to create employees table")
      }

      setStatus({ success: true, message: "Employees table created successfully!", step: "employees-table" })
    } catch (error: any) {
      setStatus({ success: false, message: error.message, step: "employees-table" })
      setDebug((prev) => [...prev, `Create employees table error: ${error.message}`])
    } finally {
      setIsLoading(false)
    }
  }

  const recreateEmployeesTable = async () => {
    setIsLoading(true)
    setStatus({ success: true, message: "Recreating employees table...", step: "recreate" })
    setDebug([])

    try {
      // Try each method in sequence until one works
      const methods = ["/api/setup/recreate-employees-direct", "/api/setup/recreate-employees-storage"]

      let success = false
      let lastError = null

      for (const method of methods) {
        try {
          const debugMsg = `Trying method: ${method}`
          console.log(debugMsg)
          setDebug((prev) => [...prev, debugMsg])

          const response = await fetch(method, {
            method: "POST",
          })

          const result = await response.json()

          if (response.ok) {
            const successMsg = `Success with method: ${method}`
            console.log(successMsg)
            setDebug((prev) => [...prev, successMsg])
            success = true
            break
          } else {
            const errorMsg = `Failed with ${method}: ${result.error || "Unknown error"}`
            console.error(errorMsg)
            setDebug((prev) => [...prev, errorMsg])
            lastError = new Error(result.error || `Failed with ${method}`)
          }
        } catch (error: any) {
          const errorMsg = `Error with ${method}: ${error.message}`
          lastError = error
          console.error(errorMsg)
          setDebug((prev) => [...prev, errorMsg])
        }
      }

      if (!success && lastError) {
        throw lastError
      }

      setStatus({
        success: true,
        message: "Employees table recreated successfully!",
        step: "recreate",
      })
    } catch (error: any) {
      setStatus({ success: false, message: error.message, step: "recreate" })
      setDebug((prev) => [...prev, `Final error: ${error.message}`])
    } finally {
      setIsLoading(false)
    }
  }

  const checkTables = async () => {
    setIsLoading(true)
    setStatus({ success: true, message: "Checking table structure...", step: "check" })
    setDebug([])

    try {
      const response = await fetch("/api/setup/check-tables")

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to check tables")
      }

      const data = await response.json()

      setStatus({
        success: true,
        message: `Table structure: ${JSON.stringify(data.columns)}`,
        step: "check",
      })
    } catch (error: any) {
      setStatus({ success: false, message: error.message, step: "check" })
      setDebug((prev) => [...prev, `Check tables error: ${error.message}`])
    } finally {
      setIsLoading(false)
    }
  }

  const seedDepartments = async () => {
    setIsLoading(true)
    setStatus({ success: true, message: "Seeding departments...", step: "departments" })
    setDebug([])

    try {
      const { error } = await supabase.from("departments").insert([
        { name: "Engineering", description: "Software development and technical operations" },
        { name: "Product", description: "Product management and strategy" },
        { name: "Design", description: "User experience and interface design" },
        { name: "Marketing", description: "Brand, communications, and growth" },
        { name: "Sales", description: "Business development and customer acquisition" },
        { name: "Human Resources", description: "Talent acquisition and employee experience" },
        { name: "Finance", description: "Accounting, financial planning, and analysis" },
        { name: "Operations", description: "Business operations and administration" },
        { name: "Customer Success", description: "Customer support and success management" },
        { name: "Legal", description: "Legal compliance and contract management" },
      ])

      if (error) {
        throw new Error(error.message)
      }

      setStatus({ success: true, message: "Departments seeded successfully!", step: "departments" })
    } catch (error: any) {
      setStatus({ success: false, message: error.message, step: "departments" })
      setDebug((prev) => [...prev, `Seed departments error: ${error.message}`])
    } finally {
      setIsLoading(false)
    }
  }

  const seedEmployees = async () => {
    setIsLoading(true)
    setStatus({ success: true, message: "Preparing to seed employees...", step: "employees" })
    setDebug([])

    try {
      // Skip the fix step since we're using a different approach now
      setStatus({ success: true, message: "Seeding employees...", step: "employees" })

      // Get department IDs
      const { data: departments, error: deptError } = await supabase.from("departments").select("id, name")

      if (deptError) {
        throw new Error(deptError.message)
      }

      if (!departments || departments.length === 0) {
        throw new Error("No departments found. Please seed departments first.")
      }

      // Create a map of department names to IDs
      const departmentMap = departments.reduce(
        (acc, dept) => {
          acc[dept.name] = dept.id
          return acc
        },
        {} as Record<string, string>,
      )

      // Seed employees
      const { error } = await supabase.from("employees").insert([
        {
          first_name: "John",
          last_name: "Doe",
          email: "john.doe@example.com",
          phone: "+1 (555) 123-4567",
          position: "Software Engineer",
          department: departmentMap["Engineering"],
          hire_date: "2022-01-15",
          status: "active",
          avatar_url: "/placeholder.svg?height=40&width=40",
          address: "123 Main St, San Francisco, CA 94105",
          bio: "Experienced software engineer with a focus on frontend technologies.",
          team: "Frontend",
          username: "john.doe",
          role: "employee",
        },
        {
          first_name: "Jane",
          last_name: "Smith",
          email: "jane.smith@example.com",
          phone: "+1 (555) 987-6543",
          position: "Product Manager",
          department: departmentMap["Product"],
          hire_date: "2021-11-03",
          status: "active",
          avatar_url: "/placeholder.svg?height=40&width=40",
          address: "456 Market St, San Francisco, CA 94105",
          bio: "Strategic product manager with a background in user research.",
          team: "Product Management",
          username: "jane.smith",
          role: "manager",
        },
        {
          first_name: "Michael",
          last_name: "Johnson",
          email: "michael.johnson@example.com",
          phone: "+1 (555) 456-7890",
          position: "UX Designer",
          department: departmentMap["Design"],
          hire_date: "2023-02-20",
          status: "onboarding",
          avatar_url: "/placeholder.svg?height=40&width=40",
          address: "789 Howard St, San Francisco, CA 94105",
          bio: "Creative UX designer with a passion for user-centered design.",
          team: "Design",
          username: "michael.johnson",
          role: "employee",
        },
        {
          first_name: "Emily",
          last_name: "Williams",
          email: "emily.williams@example.com",
          phone: "+1 (555) 789-0123",
          position: "Marketing Specialist",
          department: departmentMap["Marketing"],
          hire_date: "2022-08-10",
          status: "active",
          avatar_url: "/placeholder.svg?height=40&width=40",
          address: "321 Mission St, San Francisco, CA 94105",
          bio: "Results-driven marketing specialist with expertise in digital marketing.",
          team: "Digital Marketing",
          username: "emily.williams",
          role: "employee",
        },
        {
          first_name: "David",
          last_name: "Brown",
          email: "david.brown@example.com",
          phone: "+1 (555) 234-5678",
          position: "Sales Representative",
          department: departmentMap["Sales"],
          hire_date: "2021-05-15",
          status: "offboarding",
          avatar_url: "/placeholder.svg?height=40&width=40",
          address: "987 Folsom St, San Francisco, CA 94105",
          bio: "Experienced sales representative with a track record of exceeding targets.",
          team: "Enterprise Sales",
          username: "david.brown",
          role: "employee",
        },
      ])

      if (error) {
        throw new Error(error.message)
      }

      setStatus({ success: true, message: "Employees seeded successfully!", step: "employees" })
    } catch (error: any) {
      setStatus({ success: false, message: error.message, step: "employees" })
      setDebug((prev) => [...prev, `Seed employees error: ${error.message}`])
    } finally {
      setIsLoading(false)
    }
  }

  const manualCreateEmployeesTable = async () => {
    setIsLoading(true)
    setStatus({ success: true, message: "Creating employees table manually...", step: "manual" })
    setDebug([])

    try {
      // Try to create the employees table directly using the Supabase API
      const { error } = await supabase.from("employees").insert([
        {
          first_name: "Test",
          last_name: "User",
          email: "test@example.com",
          phone: "123-456-7890",
          position: "Test Position",
          department: "00000000-0000-0000-0000-000000000000",
          hire_date: "2023-01-01",
          status: "active",
          avatar_url: "/placeholder.svg",
          address: "123 Test St",
          bio: "Test bio",
          team: "Test Team",
          username: "test.user",
          role: "employee",
        },
      ])

      if (error) {
        throw new Error(error.message)
      }

      // Delete the test record
      await supabase.from("employees").delete().eq("email", "test@example.com")

      setStatus({
        success: true,
        message: "Employees table created successfully!",
        step: "manual",
      })
    } catch (error: any) {
      setStatus({ success: false, message: error.message, step: "manual" })
      setDebug((prev) => [...prev, `Manual create error: ${error.message}`])
    } finally {
      setIsLoading(false)
    }
  }

  const updateEmployeesTable = async () => {
    setIsLoading(true)
    setStatus({ success: true, message: "Updating employees table...", step: "update-table" })
    setDebug([])

    try {
      // Try the simple approach first
      const response = await fetch("/api/setup/update-employees-simple", {
        method: "POST",
      })

      if (!response.ok) {
        // If that fails, try the original approach
        const fallbackResponse = await fetch("/api/setup/update-employees-table", {
          method: "POST",
        })

        if (!fallbackResponse.ok) {
          const error = await fallbackResponse.json()
          throw new Error(error.message || "Failed to update employees table")
        }

        const result = await fallbackResponse.json()
        setStatus({
          success: true,
          message: `Employees table updated successfully using fallback method! Added columns: ${JSON.stringify(result.columns || [])}`,
          step: "update-table",
        })
        return
      }

      const result = await response.json()
      setStatus({
        success: true,
        message: `Employees table updated successfully! Method: ${result.method || "direct"}`,
        step: "update-table",
      })
    } catch (error: any) {
      setStatus({ success: false, message: error.message, step: "update-table" })
      setDebug((prev) => [...prev, `Update employees table error: ${error.message}`])
    } finally {
      setIsLoading(false)
    }
  }

  const seedEmployeesOnly = async () => {
    setIsLoading(true)
    setStatus({ success: true, message: "Seeding employees...", step: "seed-employees" })
    setDebug([])

    try {
      const response = await fetch("/api/setup/seed-employees", {
        method: "POST",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to seed employees")
      }

      setStatus({ success: true, message: "Employees seeded successfully!", step: "seed-employees" })
    } catch (error: any) {
      setStatus({ success: false, message: error.message, step: "seed-employees" })
      setDebug((prev) => [...prev, `Seed employees error: ${error.message}`])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl">HR Suite Setup</CardTitle>
          <CardDescription>Initialize your HR Suite database and seed it with sample data</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="setup">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="setup">Database Setup</TabsTrigger>
              <TabsTrigger value="seed">Seed Data</TabsTrigger>
              <TabsTrigger value="verify">Verify Setup</TabsTrigger>
            </TabsList>
            <TabsContent value="setup" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Database className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="text-lg font-medium">Create Database Tables</h3>
                    <p className="text-sm text-muted-foreground">
                      Create all necessary tables for the HR Suite application
                    </p>
                  </div>
                </div>
                <Button
                  onClick={createTables}
                  disabled={isLoading || (status?.step === "tables" && status?.success)}
                  className="w-full"
                >
                  {status?.step === "tables" && status?.success ? "Tables Created" : "Create Tables"}
                </Button>

                <div className="flex items-center space-x-4 mt-6">
                  <Database className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="text-lg font-medium">Update Employees Table</h3>
                    <p className="text-sm text-muted-foreground">Add missing columns to the existing employees table</p>
                  </div>
                </div>
                <Button
                  onClick={updateEmployeesTable}
                  disabled={isLoading || (status?.step === "update-table" && status?.success)}
                  className="w-full"
                >
                  {status?.step === "update-table" && status?.success ? "Table Updated" : "Update Employees Table"}
                </Button>

                {status?.step === "update-table" && (
                  <Alert variant={status.success ? "default" : "destructive"}>
                    {status.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    <AlertTitle>{status.success ? "Success" : "Error"}</AlertTitle>
                    <AlertDescription>{status.message}</AlertDescription>
                  </Alert>
                )}

                <div className="flex items-center space-x-4 mt-6">
                  <Database className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="text-lg font-medium">Create Employees Table</h3>
                    <p className="text-sm text-muted-foreground">Create the employees table with the correct schema</p>
                  </div>
                </div>
                <Button
                  onClick={createEmployeesTable}
                  disabled={isLoading || (status?.step === "employees-table" && status?.success)}
                  className="w-full"
                >
                  {status?.step === "employees-table" && status?.success
                    ? "Employees Table Created"
                    : "Create Employees Table"}
                </Button>

                {status?.step === "employees-table" && (
                  <Alert variant={status.success ? "default" : "destructive"}>
                    {status.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    <AlertTitle>{status.success ? "Success" : "Error"}</AlertTitle>
                    <AlertDescription>{status.message}</AlertDescription>
                  </Alert>
                )}

                <div className="flex items-center space-x-4 mt-6">
                  <RefreshCw className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="text-lg font-medium">Fix Employees Table</h3>
                    <p className="text-sm text-muted-foreground">
                      Recreate the employees table with the correct structure
                    </p>
                  </div>
                </div>
                <Button onClick={recreateEmployeesTable} disabled={isLoading} className="w-full">
                  Recreate Employees Table
                </Button>

                <Button onClick={manualCreateEmployeesTable} disabled={isLoading} className="w-full mt-2">
                  Manual Create Employees Table
                </Button>

                {status?.step === "tables" && (
                  <Alert variant={status.success ? "default" : "destructive"}>
                    {status.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    <AlertTitle>{status.success ? "Success" : "Error"}</AlertTitle>
                    <AlertDescription>{status.message}</AlertDescription>
                  </Alert>
                )}

                {status?.step === "recreate" && (
                  <Alert variant={status.success ? "default" : "destructive"}>
                    {status.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    <AlertTitle>{status.success ? "Success" : "Error"}</AlertTitle>
                    <AlertDescription>{status.message}</AlertDescription>
                  </Alert>
                )}

                {status?.step === "manual" && (
                  <Alert variant={status.success ? "default" : "destructive"}>
                    {status.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    <AlertTitle>{status.success ? "Success" : "Error"}</AlertTitle>
                    <AlertDescription>{status.message}</AlertDescription>
                  </Alert>
                )}

                {debug.length > 0 && (
                  <div className="mt-4 p-4 bg-gray-100 rounded-md">
                    <h4 className="font-medium mb-2">Debug Information:</h4>
                    <pre className="text-xs overflow-auto max-h-40">{debug.join("\n")}</pre>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="seed" className="space-y-6 mt-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <FileText className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="text-lg font-medium">Seed Departments</h3>
                    <p className="text-sm text-muted-foreground">Add sample departments to your database</p>
                  </div>
                </div>
                <Button
                  onClick={seedDepartments}
                  disabled={isLoading || (status?.step === "departments" && status?.success)}
                  className="w-full"
                >
                  {status?.step === "departments" && status?.success ? "Departments Seeded" : "Seed Departments"}
                </Button>

                {status?.step === "departments" && (
                  <Alert variant={status.success ? "default" : "destructive"}>
                    {status.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    <AlertTitle>{status.success ? "Success" : "Error"}</AlertTitle>
                    <AlertDescription>{status.message}</AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Users className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="text-lg font-medium">Seed Employees</h3>
                    <p className="text-sm text-muted-foreground">Add sample employees to your database</p>
                  </div>
                </div>
                <Button
                  onClick={seedEmployeesOnly}
                  disabled={isLoading || (status?.step === "seed-employees" && status?.success)}
                  className="w-full"
                >
                  {status?.step === "seed-employees" && status?.success ? "Employees Seeded" : "Seed Employees"}
                </Button>

                {status?.step === "seed-employees" && (
                  <Alert variant={status.success ? "default" : "destructive"}>
                    {status.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    <AlertTitle>{status.success ? "Success" : "Error"}</AlertTitle>
                    <AlertDescription>{status.message}</AlertDescription>
                  </Alert>
                )}

                {debug.length > 0 && (
                  <div className="mt-4 p-4 bg-gray-100 rounded-md">
                    <h4 className="font-medium mb-2">Debug Information:</h4>
                    <pre className="text-xs overflow-auto max-h-40">{debug.join("\n")}</pre>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="verify" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <BarChart4 className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="text-lg font-medium">Check Table Structure</h3>
                    <p className="text-sm text-muted-foreground">Verify the database table structure</p>
                  </div>
                </div>
                <Button onClick={checkTables} className="w-full mb-4">
                  Check Table Structure
                </Button>

                {status?.step === "check" && (
                  <Alert variant={status.success ? "default" : "destructive"}>
                    {status.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    <AlertTitle>{status.success ? "Success" : "Error"}</AlertTitle>
                    <AlertDescription className="break-all">{status.message}</AlertDescription>
                  </Alert>
                )}

                {debug.length > 0 && (
                  <div className="mt-4 p-4 bg-gray-100 rounded-md">
                    <h4 className="font-medium mb-2">Debug Information:</h4>
                    <pre className="text-xs overflow-auto max-h-40">{debug.join("\n")}</pre>
                  </div>
                )}

                <div className="flex items-center space-x-4 mt-6">
                  <BarChart4 className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="text-lg font-medium">Go to Dashboard</h3>
                    <p className="text-sm text-muted-foreground">Access the HR Suite dashboard</p>
                  </div>
                </div>
                <Button onClick={() => router.push("/dashboard")} className="w-full">
                  Go to Dashboard
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <p className="text-sm text-muted-foreground">Need help? Contact support@hrsuite.com</p>
        </CardFooter>
      </Card>
    </div>
  )
}

