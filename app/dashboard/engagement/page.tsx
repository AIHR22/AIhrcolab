"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PlusCircle, Search, Filter, Heart, PieChart, MessageSquare, Award, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

interface Survey {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  status: "draft" | "active" | "completed"
  responseRate: number
  sentimentScore: number
}

interface Feedback {
  id: string
  employee: {
    name: string
    avatar: string
  }
  date: string
  category: "general" | "management" | "workplace" | "benefits" | "culture"
  sentiment: "positive" | "neutral" | "negative"
  content: string
}

export default function EngagementPage() {
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Sample data
  const surveys: Survey[] = [
    {
      id: "1",
      title: "Q1 2023 Employee Satisfaction",
      description: "Quarterly survey to measure employee satisfaction and engagement",
      startDate: "2023-01-15",
      endDate: "2023-01-31",
      status: "completed",
      responseRate: 85,
      sentimentScore: 4.2,
    },
    {
      id: "2",
      title: "Remote Work Experience",
      description: "Survey to gather feedback on remote work experience",
      startDate: "2023-02-10",
      endDate: "2023-02-20",
      status: "completed",
      responseRate: 78,
      sentimentScore: 3.8,
    },
    {
      id: "3",
      title: "Benefits Satisfaction",
      description: "Survey to measure satisfaction with current benefits package",
      startDate: "2023-03-05",
      endDate: "2023-03-15",
      status: "completed",
      responseRate: 92,
      sentimentScore: 4.5,
    },
    {
      id: "4",
      title: "Q2 2023 Employee Satisfaction",
      description: "Quarterly survey to measure employee satisfaction and engagement",
      startDate: "2023-04-15",
      endDate: "2023-04-30",
      status: "active",
      responseRate: 45,
      sentimentScore: 0,
    },
    {
      id: "5",
      title: "Management Effectiveness",
      description: "Survey to gather feedback on management effectiveness",
      startDate: "2023-05-20",
      endDate: "2023-05-30",
      status: "draft",
      responseRate: 0,
      sentimentScore: 0,
    },
  ]

  const feedback: Feedback[] = [
    {
      id: "1",
      employee: {
        name: "John Doe",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      date: "2023-04-15",
      category: "general",
      sentiment: "positive",
      content: "I really enjoy working here. The company culture is great and I feel valued as an employee.",
    },
    {
      id: "2",
      employee: {
        name: "Jane Smith",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      date: "2023-04-12",
      category: "benefits",
      sentiment: "neutral",
      content: "The benefits package is good, but I would like to see more options for retirement planning.",
    },
    {
      id: "3",
      employee: {
        name: "Michael Johnson",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      date: "2023-04-10",
      category: "workplace",
      sentiment: "negative",
      content:
        "The office space is too noisy and it's difficult to concentrate. We need more quiet areas for focused work.",
    },
    {
      id: "4",
      employee: {
        name: "Emily Williams",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      date: "2023-04-08",
      category: "management",
      sentiment: "positive",
      content: "My manager is very supportive and provides clear guidance. I appreciate the regular feedback sessions.",
    },
    {
      id: "5",
      employee: {
        name: "David Brown",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      date: "2023-04-05",
      category: "culture",
      sentiment: "positive",
      content: "The company culture is inclusive and supportive. I feel like I can be myself at work.",
    },
  ]

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employee Engagement</h1>
          <p className="text-muted-foreground">Measure and improve employee satisfaction and engagement</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Survey
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Survey</DialogTitle>
              <DialogDescription>Set up a new survey to gather employee feedback</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input id="title" placeholder="Q2 2023 Employee Satisfaction" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Quarterly survey to measure employee satisfaction and engagement"
                  className="col-span-3"
                />
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
                <Label htmlFor="audience" className="text-right">
                  Audience
                </Label>
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select audience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Employees</SelectItem>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="product">Product</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsDialogOpen(false)}>Create Survey</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Engagement Score</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
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
            <CardTitle className="text-sm font-medium">Survey Response Rate</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500">+5%</span> from last quarter
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">eNPS Score</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+42</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500">+8</span> from last quarter
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sentiment Analysis</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78% Positive</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500">+3%</span> from last quarter
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="surveys">
        <TabsList>
          <TabsTrigger value="surveys">Surveys</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="surveys" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search surveys..." className="pl-8" />
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
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Response Rate</TableHead>
                  <TableHead>Sentiment Score</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {surveys.map((survey) => (
                  <TableRow key={survey.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{survey.title}</div>
                        <div className="text-xs text-muted-foreground">{survey.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          survey.status === "active"
                            ? "default"
                            : survey.status === "completed"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {survey.status.charAt(0).toUpperCase() + survey.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(survey.startDate).toLocaleDateString()} -{" "}
                      {new Date(survey.endDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {survey.responseRate > 0 ? (
                        <div className="flex items-center gap-2">
                          <span>{survey.responseRate}%</span>
                          <Progress value={survey.responseRate} className="h-2 w-16" />
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {survey.sentimentScore > 0 ? (
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{survey.sentimentScore}</span>
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" onClick={() => router.push(`/dashboard/engagement/surveys/${survey.id}`)}>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        <TabsContent value="feedback" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search feedback..." className="pl-8" />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="management">Management</SelectItem>
                <SelectItem value="workplace">Workplace</SelectItem>
                <SelectItem value="benefits">Benefits</SelectItem>
                <SelectItem value="culture">Culture</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sentiment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sentiments</SelectItem>
                <SelectItem value="positive">Positive</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
                <SelectItem value="negative">Negative</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {feedback.map((item) => (
              <Card key={item.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={item.employee.avatar} alt={item.employee.name} />
                        <AvatarFallback>
                          {item.employee.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">{item.employee.name}</CardTitle>
                        <CardDescription>{new Date(item.date).toLocaleDateString()}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">
                        {item.category}
                      </Badge>
                      <Badge
                        variant={
                          item.sentiment === "positive"
                            ? "default"
                            : item.sentiment === "neutral"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {item.sentiment.charAt(0).toUpperCase() + item.sentiment.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{item.content}</p>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button variant="outline" size="sm">
                    Reply
                  </Button>
                  <Button size="sm">Take Action</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Engagement Analytics</CardTitle>
              <CardDescription>Analyze employee engagement trends and patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium mb-2">Engagement by Department</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Engineering</span>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">4.5</span>
                          <span className="text-green-500 text-xs">+0.3</span>
                        </div>
                      </div>
                      <Progress value={90} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Product</span>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">4.2</span>
                          <span className="text-green-500 text-xs">+0.1</span>
                        </div>
                      </div>
                      <Progress value={84} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Design</span>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">4.3</span>
                          <span className="text-green-500 text-xs">+0.2</span>
                        </div>
                      </div>
                      <Progress value={86} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Marketing</span>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">3.9</span>
                          <span className="text-red-500 text-xs">-0.1</span>
                        </div>
                      </div>
                      <Progress value={78} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Sales</span>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">4.1</span>
                          <span className="text-green-500 text-xs">+0.4</span>
                        </div>
                      </div>
                      <Progress value={82} />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Engagement Factors</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Work-Life Balance</span>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">4.3</span>
                          <span className="text-green-500 text-xs">+0.5</span>
                        </div>
                      </div>
                      <Progress value={86} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Career Growth</span>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">3.8</span>
                          <span className="text-red-500 text-xs">-0.2</span>
                        </div>
                      </div>
                      <Progress value={76} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Compensation & Benefits</span>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">4.0</span>
                          <span className="text-green-500 text-xs">+0.1</span>
                        </div>
                      </div>
                      <Progress value={80} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Company Culture</span>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">4.5</span>
                          <span className="text-green-500 text-xs">+0.3</span>
                        </div>
                      </div>
                      <Progress value={90} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Management</span>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">4.2</span>
                          <span className="text-green-500 text-xs">+0.2</span>
                        </div>
                      </div>
                      <Progress value={84} />
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

