"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PlusCircle, Users, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export default function WorkforcePlanningPage() {
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isAIAnalyzing, setIsAIAnalyzing] = useState(false)
  const [aiResults, setAiResults] = useState<any>(null)

  const handleAIAnalysis = async () => {
    setIsAIAnalyzing(true)

    // Simulate AI analysis
    setTimeout(() => {
      setIsAIAnalyzing(false)
      setAiResults({
        feasible: true,
        skillGaps: [
          { skill: "Machine Learning", gap: "High", recommendation: "Hire 2 ML Engineers" },
          { skill: "Cloud Architecture", gap: "Medium", recommendation: "Train existing staff" },
          { skill: "DevOps", gap: "Low", recommendation: "Contract temporarily" },
        ],
        hiringCosts: 250000,
        revenueImpact: 1200000,
        resourceAllocation: [
          { team: "Engineering", allocation: 45 },
          { team: "Design", allocation: 20 },
          { team: "Product", allocation: 25 },
          { team: "QA", allocation: 10 },
        ],
      })
    }, 2000)
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workforce Planning</h1>
          <p className="text-muted-foreground">AI-powered workforce planning and resource allocation</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Workforce Plan</DialogTitle>
              <DialogDescription>
                Enter the details of your new project to analyze workforce requirements
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="plan-name" className="text-right">
                  Plan Name
                </Label>
                <Input id="plan-name" placeholder="Mobile App Development" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea id="description" placeholder="Describe the project and its goals" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="department" className="text-right">
                  Department
                </Label>
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="product">Product</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="start-date" className="text-right">
                  Start Date
                </Label>
                <Input id="start-date" type="date" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="end-date" className="text-right">
                  End Date
                </Label>
                <Input id="end-date" type="date" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="budget" className="text-right">
                  Budget
                </Label>
                <Input id="budget" type="number" placeholder="100000" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="required-skills" className="text-right">
                  Required Skills
                </Label>
                <Textarea id="required-skills" placeholder="React, Node.js, AWS, UI/UX Design" className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAIAnalysis} disabled={isAIAnalyzing}>
                {isAIAnalyzing ? "Analyzing..." : "Analyze with AI"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active Plans</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Mobile App Development</CardTitle>
                <CardDescription>Engineering Department</CardDescription>
                <Badge className="w-fit">In Progress</Badge>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div>Apr 2023 - Oct 2023</div>
                  <div>75% Complete</div>
                </div>
                <Progress value={75} className="mt-2" />
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">12 Employees</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">$120,000</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push("/dashboard/workforce-planning/1")}
                >
                  View Details
                </Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Website Redesign</CardTitle>
                <CardDescription>Marketing Department</CardDescription>
                <Badge className="w-fit">In Progress</Badge>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div>Jun 2023 - Sep 2023</div>
                  <div>40% Complete</div>
                </div>
                <Progress value={40} className="mt-2" />
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">8 Employees</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">$85,000</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push("/dashboard/workforce-planning/2")}
                >
                  View Details
                </Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Sales Expansion</CardTitle>
                <CardDescription>Sales Department</CardDescription>
                <Badge className="w-fit">In Progress</Badge>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div>May 2023 - Dec 2023</div>
                  <div>60% Complete</div>
                </div>
                <Progress value={60} className="mt-2" />
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">15 Employees</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">$200,000</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push("/dashboard/workforce-planning/3")}
                >
                  View Details
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="draft" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>AI Integration Project</CardTitle>
                <CardDescription>Engineering Department</CardDescription>
                <Badge variant="outline" className="w-fit">
                  Draft
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div>Planned: Nov 2023 - May 2024</div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Est. 10 Employees</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Est. $150,000</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Edit Draft
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="completed" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>CRM Implementation</CardTitle>
                <CardDescription>Sales Department</CardDescription>
                <Badge variant="secondary" className="w-fit">
                  Completed
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div>Jan 2023 - Mar 2023</div>
                  <div>100% Complete</div>
                </div>
                <Progress value={100} className="mt-2" />
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">7 Employees</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">$90,000</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  View Report
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {aiResults && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>AI Analysis Results</CardTitle>
            <CardDescription>Based on your project requirements and current workforce</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Project Feasibility</h3>
                <div className="mt-2 flex items-center gap-2">
                  {aiResults.feasible ? (
                    <Badge className="bg-green-500">Feasible</Badge>
                  ) : (
                    <Badge variant="destructive">Not Feasible</Badge>
                  )}
                  <span className="text-sm text-muted-foreground">
                    {aiResults.feasible
                      ? "This project can be completed with some adjustments to the current workforce."
                      : "This project requires significant changes to the current workforce."}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium">Skill Gaps & Hiring Recommendations</h3>
                <Table className="mt-2">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Skill</TableHead>
                      <TableHead>Gap Level</TableHead>
                      <TableHead>Recommendation</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {aiResults.skillGaps.map((gap: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{gap.skill}</TableCell>
                        <TableCell>
                          <Badge
                            variant={gap.gap === "High" ? "destructive" : gap.gap === "Medium" ? "default" : "outline"}
                          >
                            {gap.gap}
                          </Badge>
                        </TableCell>
                        <TableCell>{gap.recommendation}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="text-lg font-medium">Financial Impact</h3>
                  <Card className="mt-2">
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Estimated Hiring Costs:</span>
                          <span className="font-medium">${aiResults.hiringCosts.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Projected Revenue Impact:</span>
                          <span className="font-medium text-green-500">
                            ${aiResults.revenueImpact.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">ROI:</span>
                          <span className="font-medium text-green-500">
                            {Math.round(
                              ((aiResults.revenueImpact - aiResults.hiringCosts) / aiResults.hiringCosts) * 100,
                            )}
                            %
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h3 className="text-lg font-medium">Resource Allocation</h3>
                  <Card className="mt-2">
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        {aiResults.resourceAllocation.map((resource: any, index: number) => (
                          <div key={index} className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">{resource.team}</span>
                              <span className="text-sm">{resource.allocation}%</span>
                            </div>
                            <Progress value={resource.allocation} />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">Download Report</Button>
            <Button>Approve Plan</Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}

