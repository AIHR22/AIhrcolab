"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Papa from "papaparse"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, Upload, CheckCircle, XCircle } from "lucide-react"

interface EmployeeRow {
  employee_name: string
  email: string
  department_name: string
  salary: string
  skills: string
  project_name: string
  project_budget: string
}

interface ProcessingResult {
  success: boolean
  message: string
  details?: string
}

export default function CsvUploadEmployees() {
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<ProcessingResult | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setResult(null)
    }
  }

  const processDepartment = async (departmentName: string): Promise<string> => {
    // Check if department exists
    const { data: existingDept } = await supabase
      .from("departments")
      .select("id")
      .eq("name", departmentName)
      .single()

    if (existingDept) {
      return existingDept.id
    }

    // Create new department
    const { data: newDept, error } = await supabase
      .from("departments")
      .insert([{ name: departmentName }])
      .select()
      .single()

    if (error) throw new Error(`Failed to create department: ${error.message}`)
    return newDept.id
  }

  const processEmployee = async (row: EmployeeRow, departmentId: string): Promise<string> => {
    // Check if employee exists
    const { data: existingEmp } = await supabase
      .from("employees")
      .select("id")
      .eq("email", row.email)
      .single()

    if (existingEmp) {
      // Update existing employee
      const { error } = await supabase
        .from("employees")
        .update({
          name: row.employee_name,
          salary: parseFloat(row.salary),
          department_id: departmentId,
          skills: row.skills.split(",").map(s => s.trim())
        })
        .eq("id", existingEmp.id)

      if (error) throw new Error(`Failed to update employee: ${error.message}`)
      return existingEmp.id
    }

    // Create new employee
    const { data: newEmp, error } = await supabase
      .from("employees")
      .insert([{
        name: row.employee_name,
        email: row.email,
        salary: parseFloat(row.salary),
        department_id: departmentId,
        skills: row.skills.split(",").map(s => s.trim())
      }])
      .select()
      .single()

    if (error) throw new Error(`Failed to create employee: ${error.message}`)
    return newEmp.id
  }

  const processProject = async (projectName: string, projectBudget: string): Promise<string> => {
    // Check if project exists
    const { data: existingProj } = await supabase
      .from("projects")
      .select("id")
      .eq("name", projectName)
      .single()

    if (existingProj) {
      // Update existing project's budget
      const { error: updateError } = await supabase
        .from("projects")
        .update({ budget: parseFloat(projectBudget) })
        .eq("id", existingProj.id)

      if (updateError) throw new Error(`Failed to update project budget: ${updateError.message}`)
      return existingProj.id
    }

    // Create new project
    const { data: newProj, error } = await supabase
      .from("projects")
      .insert([{ 
        name: projectName,
        budget: parseFloat(projectBudget)
      }])
      .select()
      .single()

    if (error) throw new Error(`Failed to create project: ${error.message}`)
    return newProj.id
  }

  const processRow = async (row: EmployeeRow): Promise<void> => {
    try {
      // Process department
      const departmentId = await processDepartment(row.department_name)

      // Process employee
      const employeeId = await processEmployee(row, departmentId)

      // Process projects and assignments
      const projectNames = row.project_name.split(",").map(p => p.trim())
      const projectBudgets = row.project_budget.split(",").map(b => b.trim())
      
      if (projectNames.length !== projectBudgets.length) {
        throw new Error(`Number of project names (${projectNames.length}) does not match number of budgets (${projectBudgets.length})`)
      }

      for (let i = 0; i < projectNames.length; i++) {
        const projectId = await processProject(projectNames[i], projectBudgets[i])

        // Create project assignment
        const { error } = await supabase
          .from("project_assignments")
          .insert([{
            employee_id: employeeId,
            project_id: projectId
          }])

        if (error) throw new Error(`Failed to create project assignment: ${error.message}`)
      }
    } catch (error: any) {
      throw new Error(`Error processing row for ${row.email}: ${error.message}`)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setIsProcessing(true)
    setResult(null)

    try {
      const text = await file.text()
      const { data, errors } = Papa.parse<EmployeeRow>(text, {
        header: true,
        skipEmptyLines: true
      })

      if (errors.length > 0) {
        throw new Error(`CSV parsing errors: ${errors.map((e: Papa.ParseError) => e.message).join(", ")}`)
      }

      let successCount = 0
      let errorCount = 0
      const errorMessages: string[] = []

      for (const row of data) {
        try {
          await processRow(row)
          successCount++
        } catch (error: any) {
          errorCount++
          errorMessages.push(error.message)
        }
      }

      setResult({
        success: errorCount === 0,
        message: `Processed ${successCount} rows successfully${errorCount > 0 ? ` with ${errorCount} errors` : ""}`,
        details: errorMessages.length > 0 ? errorMessages.join("\n") : undefined
      })

      // Refresh the page data
      router.refresh()
    } catch (error: any) {
      setResult({
        success: false,
        message: "Failed to process CSV file",
        details: error.message
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Upload Employee Data</CardTitle>
        <CardDescription>
          Upload a CSV file containing employee information. The file should include columns for employee_name, email, department_name, salary, skills, project_name, and project_budget.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={isProcessing}
            />
            <Button
              onClick={handleUpload}
              disabled={!file || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </>
              )}
            </Button>
          </div>

          {result && (
            <Alert variant={result.success ? "default" : "destructive"}>
              <div className="flex items-center gap-2">
                {result.success ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <AlertTitle>{result.message}</AlertTitle>
              </div>
              {result.details && (
                <AlertDescription className="mt-2 whitespace-pre-wrap">
                  {result.details}
                </AlertDescription>
              )}
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 