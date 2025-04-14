"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PlusCircle, Search, Filter, TrendingUp, Calendar, Star, Award, Target, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface PerformanceReview {
  id: string
  employee: {
    name: string
    position: string
    department: string
    avatar: string
  }
  reviewer: {
    name: string
    avatar: string
  }
  period: string
  score: number
  status: "draft" | "in-progress" | "completed"
  completionDate?: string
}

interface Goal {
  id: string
  title: string
  description: string
  employee: {
    name: string
    avatar: string
  }
  dueDate: string
  progress: number
  status: "not-started" | "in-progress" | "completed"
}

export default function PerformancePage() {
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Sample data
  const performanceReviews: PerformanceReview[] = [
    {
      id: "1",
      employee: {
        name: "John Doe",
        position: "Software Engineer",
        department: "Engineering",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      reviewer: {
        name: "Jane Smith",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      period: "Q1 2023",
      score: 4.2,
      status: "completed",
      completionDate: "2023-04-15",
    },
    {
      id: "2",
      employee: {
        name: "Jane Smith",
        position: "Product Manager",
        department: "Product",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      reviewer: {
        name: "Michael Johnson",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      period: "Q1 2023",
      score: 4.5,
      status: "completed",
      completionDate: "2023-04-12",
    },
    {
      id: "3",
      employee: {
        name: "Michael Johnson",
        position: "UX Designer",
        department: "Design",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      reviewer: {
        name: "Emily Williams",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      period: "Q1 2023",
      score: 3.8,
      status: "completed",
      completionDate: "2023-04-10",
    },
    {
      id: "4",
      employee: {
        name: "Emily Williams",
        position: "Marketing Specialist",
        department: "Marketing",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      reviewer: {
        name: "John Doe",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      period: "Q2 2023",
      score: 0,
      status: "in-progress",
    },
    {
      id: "5",
      employee: {
        name: "David Brown",
        position: "Sales Representative",
        department: "Sales",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      reviewer: {
        name: "Jane Smith",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      period: "Q2 2023",
      score: 0,
      status: "draft",
    },
  ]

  const goals: Goal[] = [
    {
      id: "1",
      title: "Improve code quality",
      description: "Reduce bugs by 20% through better testing and code reviews",
      employee: {
        name: "John Doe",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      dueDate: "2023-06-30",
      progress: 75,
      status: "in-progress",
    },
    {
      id: "2",
      title: "Launch new product feature",
      description: "Complete development and launch of the new reporting dashboard",
      employee: {
        name: "Jane Smith",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      dueDate: "2023-07-15",
      progress: 50,
      status: "in-progress",
    },
    {
      id: "3",
      title: "Redesign user interface",
      description: "Complete the redesign of the main application interface",
      employee: {
        name: "Michael Johnson",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      dueDate: "2023-06-15",
      progress: 90,
      status: "in-progress",
    },
    {
      id: "4",
      title: "Increase social media engagement",
      description: "Grow social media engagement by 30% through new content strategy",
      employee: {
        name: "Emily Williams",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      dueDate: "2023-08-01",
      progress: 25,
      status: "in-progress",
    },
    {
      id: "5",
      title: "Exceed quarterly sales target",
      description: "Achieve 120% of quarterly sales target through new client acquisition",
      employee: {
        name: "David Brown",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      dueDate: "2023-06-30",
      progress: 85,
      status: "in-progress",
    },
  ]

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Performance & Productivity</h1>
          <p className="text-muted-foreground">Track employee performance, goals, and productivity metrics</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Review
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Performance Review</DialogTitle>
              <DialogDescription>Set up a new performance review for an employee</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="employee" className="text-right">
                  Employee
                </Label>
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="john">John Doe</SelectItem>
                    <SelectItem value="jane">Jane Smith</SelectItem>
                    <SelectItem value="michael">Michael Johnson</SelectItem>
                    <SelectItem value="emily">Emily Williams</SelectItem>
                    <SelectItem value="david">David Brown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="reviewer" className="text-right">
                  Reviewer
                </Label>
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select reviewer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="john">John Doe</SelectItem>
                    <SelectItem value="jane">Jane Smith</SelectItem>
                    <SelectItem value="michael">Michael Johnson</SelectItem>
                    <SelectItem value="emily">Emily Williams</SelectItem>
                    <SelectItem value="david">David Brown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="period" className="text-right">
                  Review Period
                </Label>
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="q1-2023">Q1 2023</SelectItem>
                    <SelectItem value="q2-2023">Q2 2023</SelectItem>
                    <SelectItem value="q3-2023">Q3 2023</SelectItem>
                    <SelectItem value="q4-2023">Q4 2023</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="due-date" className="text-right">
                  Due Date
                </Label>
                <Input id="due-date" type="date" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="notes" className="text-right pt-2">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Add any additional notes or instructions for the reviewer"
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsDialogOpen(false)}>Create Review</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Performance Score</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.2 / 5.0</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500">+0.3</span> from last quarter
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Goal Completion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500">+5%</span> from last quarter
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productivity Index</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92.5</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500">+2.5</span> from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reviews Completed</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-500">-5%</span> from last quarter
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="reviews">
        <TabsList>
          <TabsTrigger value="reviews">Performance Reviews</TabsTrigger>
          <TabsTrigger value="goals">Goals & Objectives</TabsTrigger>
          <TabsTrigger value="metrics">Productivity Metrics</TabsTrigger>
        </TabsList>
        <TabsContent value="reviews" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search reviews..." className="pl-8" />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="q2-2023">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="q2-2023">Q2 2023</SelectItem>
                <SelectItem value="q1-2023">Q1 2023</SelectItem>
                <SelectItem value="q4-2022">Q4 2022</SelectItem>
                <SelectItem value="q3-2022">Q3 2022</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Reviewer</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Completion Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {performanceReviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={review.employee.avatar} alt={review.employee.name} />
                          <AvatarFallback>
                            {review.employee.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{review.employee.name}</div>
                          <div className="text-xs text-muted-foreground">{review.employee.position}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={review.reviewer.avatar} alt={review.reviewer.name} />
                          <AvatarFallback>
                            {review.reviewer.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span>{review.reviewer.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{review.period}</TableCell>
                    <TableCell>
                      {review.status === "completed" ? (
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{review.score}</span>
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          review.status === "completed"
                            ? "default"
                            : review.status === "in-progress"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {review.status === "in-progress"
                          ? "In Progress"
                          : review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {review.completionDate ? new Date(review.completionDate).toLocaleDateString() : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        onClick={() => router.push(`/dashboard/performance/reviews/${review.id}`)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        <TabsContent value="goals" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search goals..." className="pl-8 w-[300px]" />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
            <Button onClick={() => router.push("/dashboard/performance/goals/new")}>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Goal
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {goals.map((goal) => (
              <Card key={goal.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle>{goal.title}</CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">More options</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/performance/goals/${goal.id}`)}>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>Edit Goal</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-500">Delete Goal</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardDescription>{goal.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={goal.employee.avatar} alt={goal.employee.name} />
                        <AvatarFallback>
                          {goal.employee.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{goal.employee.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Due: {new Date(goal.dueDate).toLocaleDateString()}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span>{goal.progress}%</span>
                      </div>
                      <Progress value={goal.progress} />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push(`/dashboard/performance/goals/${goal.id}`)}
                  >
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Productivity Metrics</CardTitle>
              <CardDescription>Track and analyze employee productivity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium mb-2">Engineering Team</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Code Commits</span>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">125</span>
                          <span className="text-green-500 text-xs">+12%</span>
                        </div>
                      </div>
                      <Progress value={75} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Pull Request Completion</span>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">85%</span>
                          <span className="text-green-500 text-xs">+5%</span>
                        </div>
                      </div>
                      <Progress value={85} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Bug Fix Rate</span>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">92%</span>
                          <span className="text-green-500 text-xs">+3%</span>
                        </div>
                      </div>
                      <Progress value={92} />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Sales Team</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Deals Closed</span>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">32</span>
                          <span className="text-green-500 text-xs">+8%</span>
                        </div>
                      </div>
                      <Progress value={80} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Revenue Generated</span>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">$425,000</span>
                          <span className="text-green-500 text-xs">+15%</span>
                        </div>
                      </div>
                      <Progress value={90} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Customer Satisfaction</span>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">4.8/5.0</span>
                          <span className="text-green-500 text-xs">+0.2</span>
                        </div>
                      </div>
                      <Progress value={96} />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Marketing Team</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Campaign Performance</span>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">88%</span>
                          <span className="text-green-500 text-xs">+6%</span>
                        </div>
                      </div>
                      <Progress value={88} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Lead Generation</span>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">245</span>
                          <span className="text-green-500 text-xs">+12%</span>
                        </div>
                      </div>
                      <Progress value={82} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Social Media Engagement</span>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">78%</span>
                          <span className="text-red-500 text-xs">-2%</span>
                        </div>
                      </div>
                      <Progress value={78} />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                View Detailed Reports
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

