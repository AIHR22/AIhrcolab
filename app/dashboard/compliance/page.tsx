"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  PlusCircle,
  Search,
  Filter,
  ShieldCheck,
  FileText,
  AlertTriangle,
  Clock,
  Download,
  Globe,
  MoreHorizontal,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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

interface CompliancePolicy {
  id: string
  title: string
  description: string
  category: "hr" | "data" | "financial" | "security" | "legal"
  region: string
  lastUpdated: string
  status: "active" | "draft" | "archived"
  documentUrl: string
}

interface EmployeeDocument {
  id: string
  employee: {
    name: string
    avatar: string
  }
  documentType: string
  status: "valid" | "expiring" | "expired"
  expirationDate: string
  documentUrl: string
}

interface ComplianceTask {
  id: string
  title: string
  description: string
  dueDate: string
  status: "pending" | "in-progress" | "completed" | "overdue"
  assignee: {
    name: string
    avatar: string
  }
  priority: "low" | "medium" | "high"
}

export default function CompliancePage() {
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Sample data
  const compliancePolicies: CompliancePolicy[] = [
    {
      id: "1",
      title: "Code of Conduct",
      description: "Guidelines for professional behavior in the workplace",
      category: "hr",
      region: "Global",
      lastUpdated: "2023-01-15",
      status: "active",
      documentUrl: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "2",
      title: "Data Privacy Policy",
      description: "Guidelines for handling sensitive data",
      category: "data",
      region: "Global",
      lastUpdated: "2023-02-10",
      status: "active",
      documentUrl: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "3",
      title: "GDPR Compliance",
      description: "Guidelines for compliance with GDPR regulations",
      category: "data",
      region: "Europe",
      lastUpdated: "2023-03-05",
      status: "active",
      documentUrl: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "4",
      title: "Financial Reporting Policy",
      description: "Guidelines for financial reporting and compliance",
      category: "financial",
      region: "Global",
      lastUpdated: "2023-04-15",
      status: "active",
      documentUrl: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "5",
      title: "Information Security Policy",
      description: "Guidelines for information security and data protection",
      category: "security",
      region: "Global",
      lastUpdated: "2023-05-20",
      status: "draft",
      documentUrl: "/placeholder.svg?height=40&width=40",
    },
  ]

  const employeeDocuments: EmployeeDocument[] = [
    {
      id: "1",
      employee: {
        name: "John Doe",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      documentType: "Work Visa",
      status: "valid",
      expirationDate: "2024-05-15",
      documentUrl: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "2",
      employee: {
        name: "Jane Smith",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      documentType: "Driver's License",
      status: "expiring",
      expirationDate: "2023-06-10",
      documentUrl: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "3",
      employee: {
        name: "Michael Johnson",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      documentType: "Certification",
      status: "expired",
      expirationDate: "2023-04-05",
      documentUrl: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "4",
      employee: {
        name: "Emily Williams",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      documentType: "Work Permit",
      status: "valid",
      expirationDate: "2024-08-20",
      documentUrl: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "5",
      employee: {
        name: "David Brown",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      documentType: "Health Insurance",
      status: "valid",
      expirationDate: "2023-12-31",
      documentUrl: "/placeholder.svg?height=40&width=40",
    },
  ]

  const complianceTasks: ComplianceTask[] = [
    {
      id: "1",
      title: "Update Privacy Policy",
      description: "Review and update the privacy policy to comply with new regulations",
      dueDate: "2023-06-15",
      status: "in-progress",
      assignee: {
        name: "John Doe",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      priority: "high",
    },
    {
      id: "2",
      title: "Annual Security Training",
      description: "Conduct annual security training for all employees",
      dueDate: "2023-07-10",
      status: "pending",
      assignee: {
        name: "Jane Smith",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      priority: "medium",
    },
    {
      id: "3",
      title: "Quarterly Compliance Review",
      description: "Conduct quarterly compliance review for all departments",
      dueDate: "2023-06-30",
      status: "pending",
      assignee: {
        name: "Michael Johnson",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      priority: "high",
    },
    {
      id: "4",
      title: "Update Employee Handbook",
      description: "Review and update the employee handbook with new policies",
      dueDate: "2023-08-15",
      status: "pending",
      assignee: {
        name: "Emily Williams",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      priority: "medium",
    },
    {
      id: "5",
      title: "GDPR Compliance Audit",
      description: "Conduct GDPR compliance audit for European operations",
      dueDate: "2023-05-20",
      status: "overdue",
      assignee: {
        name: "David Brown",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      priority: "high",
    },
  ]

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Compliance & Legal</h1>
          <p className="text-muted-foreground">Manage compliance policies, documents, and legal requirements</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Policy
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Compliance Policy</DialogTitle>
              <DialogDescription>Add a new compliance policy or legal document</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input id="title" placeholder="Information Security Policy" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Guidelines for information security and data protection"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category
                </Label>
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hr">HR</SelectItem>
                    <SelectItem value="data">Data Privacy</SelectItem>
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="legal">Legal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="region" className="text-right">
                  Region
                </Label>
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="global">Global</SelectItem>
                    <SelectItem value="us">United States</SelectItem>
                    <SelectItem value="eu">Europe</SelectItem>
                    <SelectItem value="asia">Asia</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="document" className="text-right">
                  Document
                </Label>
                <Input id="document" type="file" className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsDialogOpen(false)}>Create Policy</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500">+3%</span> from last quarter
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Policies</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500">+2</span> from last quarter
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Documents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-500">+2</span> from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-500">+3</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="policies">
        <TabsList>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="documents">Employee Documents</TabsTrigger>
          <TabsTrigger value="tasks">Compliance Tasks</TabsTrigger>
        </TabsList>
        <TabsContent value="policies" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search policies..." className="pl-8" />
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
                <SelectItem value="hr">HR</SelectItem>
                <SelectItem value="data">Data Privacy</SelectItem>
                <SelectItem value="financial">Financial</SelectItem>
                <SelectItem value="security">Security</SelectItem>
                <SelectItem value="legal">Legal</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="global">Global</SelectItem>
                <SelectItem value="us">United States</SelectItem>
                <SelectItem value="eu">Europe</SelectItem>
                <SelectItem value="asia">Asia</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {compliancePolicies.map((policy) => (
                  <TableRow key={policy.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{policy.title}</div>
                        <div className="text-xs text-muted-foreground">{policy.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {policy.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span>{policy.region}</span>
                      </div>
                    </TableCell>
                    <TableCell>{new Date(policy.lastUpdated).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          policy.status === "active" ? "default" : policy.status === "draft" ? "secondary" : "outline"
                        }
                      >
                        {policy.status.charAt(0).toUpperCase() + policy.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">More options</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/compliance/policies/${policy.id}`)}>
                            View Policy
                          </DropdownMenuItem>
                          <DropdownMenuItem>Edit Policy</DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-500">Archive Policy</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        <TabsContent value="documents" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search documents..." className="pl-8" />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Document Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="visa">Work Visa</SelectItem>
                <SelectItem value="license">Driver's License</SelectItem>
                <SelectItem value="certification">Certification</SelectItem>
                <SelectItem value="permit">Work Permit</SelectItem>
                <SelectItem value="insurance">Health Insurance</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="valid">Valid</SelectItem>
                <SelectItem value="expiring">Expiring Soon</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Document Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expiration Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employeeDocuments.map((document) => (
                  <TableRow key={document.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={document.employee.avatar} alt={document.employee.name} />
                          <AvatarFallback>
                            {document.employee.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span>{document.employee.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{document.documentType}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          document.status === "valid"
                            ? "default"
                            : document.status === "expiring"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {document.status === "valid"
                          ? "Valid"
                          : document.status === "expiring"
                            ? "Expiring Soon"
                            : "Expired"}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(document.expirationDate).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">More options</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => router.push(`/dashboard/compliance/documents/${document.id}`)}
                          >
                            View Document
                          </DropdownMenuItem>
                          <DropdownMenuItem>Update Document</DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-500">Mark as Expired</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        <TabsContent value="tasks" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search tasks..." className="pl-8 w-[300px]" />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
            <Button onClick={() => router.push("/dashboard/compliance/tasks/new")}>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Task
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {complianceTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{task.title}</div>
                        <div className="text-xs text-muted-foreground">{task.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={task.assignee.avatar} alt={task.assignee.name} />
                          <AvatarFallback>
                            {task.assignee.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span>{task.assignee.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{new Date(task.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          task.status === "completed"
                            ? "default"
                            : task.status === "in-progress"
                              ? "secondary"
                              : task.status === "pending"
                                ? "outline"
                                : "destructive"
                        }
                      >
                        {task.status === "in-progress"
                          ? "In Progress"
                          : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          task.priority === "high"
                            ? "text-red-500 border-red-500"
                            : task.priority === "medium"
                              ? "text-yellow-500 border-yellow-500"
                              : "text-green-500 border-green-500"
                        }
                      >
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" onClick={() => router.push(`/dashboard/compliance/tasks/${task.id}`)}>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

