"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle, Bug, RefreshCw, Check, Info, Database } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface EmployeeNode {
  id: string
  name: string
  title: string
  department: string
  children?: EmployeeNode[]
}

export function OrgDebugPanel() {
  const [employeeData, setEmployeeData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("employees")
  const [testPrompt, setTestPrompt] = useState("Create an org chart with Brad as head of Marketing and Farzana in Sales")
  const [testResult, setTestResult] = useState<any>(null)
  const [isTestingPrompt, setIsTestingPrompt] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchEmployeeData()
  }, [])

  const fetchEmployeeData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/organization/test-employees')
      
      if (!response.ok) {
        throw new Error('Failed to fetch employee data')
      }
      
      const data = await response.json()
      setEmployeeData(data.data)
    } catch (error) {
      console.error('Error fetching employee data:', error)
      toast({
        title: "Error",
        description: "Failed to load employee data.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testGeneratePrompt = async () => {
    try {
      setIsTestingPrompt(true)
      const response = await fetch('/api/organization/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: testPrompt,
          structureType: 'detailed',
          useAI: false // Use fallback for consistent testing
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to generate organization chart')
      }
      
      const data = await response.json()
      setTestResult(data)
      
      toast({
        title: "Success",
        description: "Test generation completed successfully",
      })
    } catch (error) {
      console.error('Error testing prompt:', error)
      toast({
        title: "Error",
        description: "Failed to test prompt generation.",
        variant: "destructive",
      })
    } finally {
      setIsTestingPrompt(false)
    }
  }

  const countDepartmentEmployees = (deptName: string) => {
    if (!employeeData?.employeesByDepartment) return 0
    return employeeData.employeesByDepartment[deptName]?.length || 0
  }

  const findEmployeeInResult = (name: string): EmployeeNode | null => {
    if (!testResult?.data) return null
    
    const searchName = name.toLowerCase()
    let result: EmployeeNode | null = null
    
    const searchNode = (node: EmployeeNode) => {
      if (node.name.toLowerCase().includes(searchName)) {
        result = node
        return true
      }
      
      if (node.children) {
        for (const child of node.children) {
          if (searchNode(child)) return true
        }
      }
      
      return false
    }
    
    searchNode(testResult.data)
    return result
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2">Loading data...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center text-base">
              <Bug className="h-4 w-4 mr-2 text-amber-500" />
              Organization Debug Panel
            </CardTitle>
            <CardDescription>
              Test and debug the organization chart functionality
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={fetchEmployeeData}>
            <RefreshCw className={`h-3 w-3 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="employees">
              <Database className="h-3 w-3 mr-1" />
              Data
            </TabsTrigger>
            <TabsTrigger value="test">
              <Bug className="h-3 w-3 mr-1" />
              Test
            </TabsTrigger>
            <TabsTrigger value="help">
              <Info className="h-3 w-3 mr-1" />
              Help
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="employees" className="p-4">
            {employeeData ? (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="outline" className="bg-primary/10">
                    {employeeData.counts.employees} Employees
                  </Badge>
                  <Badge variant="outline" className="bg-primary/10">
                    {employeeData.counts.departments} Departments
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  {employeeData.departments.map((dept: any) => (
                    <div key={dept.id} className="border rounded-md p-3">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">{dept.name}</h4>
                        <Badge variant="secondary">
                          {countDepartmentEmployees(dept.name)} employees
                        </Badge>
                      </div>
                      
                      <ScrollArea className="h-24">
                        <div className="space-y-1">
                          {employeeData.employeesByDepartment[dept.name]?.map((emp: any) => (
                            <div key={emp.id} className="text-sm flex justify-between">
                              <span>{emp.first_name} {emp.last_name}</span>
                              <span className="text-muted-foreground">{emp.position}</span>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No data</AlertTitle>
                <AlertDescription>
                  Employee data could not be loaded. Try refreshing.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
          
          <TabsContent value="test" className="p-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="test-prompt">Test Prompt</Label>
                <Textarea 
                  id="test-prompt"
                  value={testPrompt}
                  onChange={(e) => setTestPrompt(e.target.value)}
                  placeholder="Enter a prompt to test organization chart generation"
                  className="min-h-[80px]"
                />
              </div>
              
              <Button
                onClick={testGeneratePrompt}
                disabled={isTestingPrompt || !testPrompt.trim()}
                className="w-full"
              >
                {isTestingPrompt ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Bug className="h-4 w-4 mr-2" />
                    Test Generation
                  </>
                )}
              </Button>
              
              {testResult && (
                <div className="space-y-3 mt-4">
                  <Alert className="bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-900/20">
                    <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <AlertTitle>Generation Success</AlertTitle>
                    <AlertDescription className="text-xs">
                      The organization chart was generated successfully using the fallback method.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Employee Placement Check:</h4>
                    {['Brad', 'Farzana'].map(name => {
                      const employeeNode = findEmployeeInResult(name)
                      return (
                        <div key={name} className="flex flex-col p-2 border rounded-md">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{name}</span>
                            {employeeNode ? (
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                                Found
                              </Badge>
                            ) : (
                              <Badge variant="destructive">Not Found</Badge>
                            )}
                          </div>
                          {employeeNode && (
                            <div className="text-xs mt-1 space-y-1">
                              <div><span className="font-medium">Name:</span> {employeeNode.name}</div>
                              <div><span className="font-medium">Title:</span> {employeeNode.title}</div>
                              <div><span className="font-medium">Department:</span> {employeeNode.department}</div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="help" className="p-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Testing Patterns</h4>
                <div className="space-y-2 text-sm">
                  <div className="bg-muted p-2 rounded-md">
                    <div className="font-medium">Employee as Department Head</div>
                    <div className="text-muted-foreground">
                      "Brad as head of Engineering"
                    </div>
                  </div>
                  <div className="bg-muted p-2 rounded-md">
                    <div className="font-medium">Employee in Department</div>
                    <div className="text-muted-foreground">
                      "Farzana in Marketing"
                    </div>
                  </div>
                  <div className="bg-muted p-2 rounded-md">
                    <div className="font-medium">Multiple Assignments</div>
                    <div className="text-muted-foreground">
                      "Brad as manager of Engineering and Farzana in Sales"
                    </div>
                  </div>
                </div>
              </div>
              
              <Alert className="bg-primary/10 border-primary/20">
                <Info className="h-4 w-4 text-primary" />
                <AlertDescription className="text-xs">
                  This debug panel tests the fallback chart generation which runs when AI generation is disabled or unavailable.
                  It uses the same pattern matching logic to extract employee placements from prompts.
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
} 