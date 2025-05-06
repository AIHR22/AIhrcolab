"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Layers, PlusCircle, Search, Filter, CheckCircle, RefreshCw, Link, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

interface Integration {
  id: string
  name: string
  provider: string
  description: string
  status: "active" | "inactive" | "error"
  lastSync: string
  category: "hr" | "payroll" | "recruiting" | "learning" | "other"
  logo: string
}

interface SyncLog {
  id: string
  integration: string
  timestamp: string
  status: "success" | "warning" | "error"
  message: string
  details: string
}

export default function IntegrationsPage() {
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  // Sample data
  const integrations: Integration[] = [
    {
      id: "1",
      name: "SAP HR",
      provider: "SAP",
      description: "Integration with SAP HR system for employee data synchronization",
      status: "active",
      lastSync: "2023-05-15T10:30:00",
      category: "hr",
      logo: "/placeholder.svg?height=40&width=40"
    },
    {
      id: "2",
      name: "Oracle HCM",
      provider: "Oracle",
      description: "Integration with Oracle HCM for employee data and payroll",
      status: "inactive",
      lastSync: "2023-04-20T14:45:00",
      category: "hr",
      logo: "/placeholder.svg?height=40&width=40"
    },
    {
      id: "3",
      name: "Workday",
      provider: "Workday",
      description: "Integration with Workday for HR and payroll data",
      status: "active",
      lastSync: "2023-05-14T09:15:00",
      category: "payroll",
      logo: "/placeholder.svg?height=40&width=40"
    },
    {
      id: "4",
      name: "ADP Payroll",
      provider: "ADP",
      description: "Integration with ADP for payroll processing",
      status: "error",
      lastSync: "2023-05-10T11:20:00",
      category: "payroll",
      logo: "/placeholder.svg?height=40&width=40"
    },
    {
      id: "5",
      name: "LinkedIn Recruiter",
      provider: "LinkedIn",
      description: "Integration with LinkedIn Recruiter for job postings and candidate sourcing",
      status: "active",
      lastSync: "2023-05-12T16:30:00",
      category: "recruiting",
      logo: "/placeholder.svg?height=40&width=40"
    },
    {
      id: "6",
      name: "Udemy",
      provider: "Udemy",
      description: "Integration with Udemy for employee learning and development",
      status: "active",
      lastSync: "2023-05-13T13:45:00",
      category: "learning",
      logo: "/placeholder.svg?height=40&width=40"
    }
  ]

  const syncLogs: SyncLog[] = [
    {
      id: "1",
      integration: "SAP HR",
      timestamp: "2023-05-15T10:30:00",
      status: "success",
      message: "Sync completed successfully",
      details: "Synchronized 150 employee records"
    },
    {
      id: "2",
      integration: "Workday",
      timestamp: "2023-05-14T09:15:00",
      status: "success",
      message: "Sync completed successfully",
      details: "Synchronized 120 employee records and 45 payroll records"
    },
    {
      id: "3",
      integration: "ADP Payroll",
      timestamp: "2023-05-10T11:20:00",
      status: "error",
      message: "Sync failed",
      details: "API authentication error. Please check credentials."
    },
    {
      id: "4",
      integration: "LinkedIn Recruiter",
      timestamp: "2023-05-12T16:30:00",
      status: "warning",
      message: "Sync completed with warnings",
      details: "Synchronized 25 job postings. 3 postings failed to sync due to invalid data."
    },
    {
      id: "5",
      integration: "Udemy",
      timestamp: "2023-05-13T13:45:00",
      status: "success",
      message: "Sync completed successfully",
      details: "Synchronized 35 course completions and 12 course enrollments"
    }
  ]

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
          <p className="text-muted-foreground">
            Manage integrations with external systems and services
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Integration
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Integration</DialogTitle>
              <DialogDescription>
                Connect to an external system or service
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="provider" className="text-right">
                  Provider
                </Label>
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sap">SAP</SelectItem>
                    <SelectItem value="oracle">Oracle</SelectItem>
                    <SelectItem value="workday">Workday</SelectItem>
                    <SelectItem value="adp">ADP</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="udemy">Udemy</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input id="name" placeholder="Integration name" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the integration"
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
                    <SelectItem value="payroll">Payroll</SelectItem>
                    <SelectItem value="recruiting">Recruiting</SelectItem>
                    <SelectItem value="learning">Learning & Development</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="api-key" className="text-right">
                  API Key
                </Label>
                <Input id="api-key" type="password" placeholder="••••••••••••••••" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="api-url" className="text-right">
                  API URL
                </Label>
                <Input id="api-url" placeholder="https://api.example.com" className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsDialogOpen(false)}>
                Add Integration
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Integrations
            </CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500">+1</span> from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Integrations
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500">+2</span> from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Sync Success Rate
            </CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">80%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-500">-5%</span> from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Data Synced
            </CardTitle>
            <Link className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">390 records</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500">+45</span> from last sync
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Integrations</TabsTrigger>
          <TabsTrigger value="hr">HR</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
          <TabsTrigger value="recruiting">Recruiting</TabsTrigger>
          <TabsTrigger value="learning">Learning</TabsTrigger>
          <TabsTrigger value="logs">Sync Logs</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search integrations..."
                className="pl-8"
              />
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
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {integrations.map((integration) => (
              <Card key={integration.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={integration.logo} alt={integration.name} />
                        <AvatarFallback>{integration.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle>{integration.name}</CardTitle>
                        <CardDescription>{integration.provider}</CardDescription>
                      </div>
                    </div>
                    <Badge 
                      variant={
                        integration.status === "active" ? "default" : 
                        integration.status === "inactive" ? "secondary" : 
                        "destructive"
                      }
                    >
                      {integration.status.charAt(0).toUpperCase() + integration.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{integration.description}</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Category</span>
                      <Badge variant="outline" className="capitalize">
                        {integration.category}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Last Sync</span>
                      <span>{new Date(integration.lastSync).toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm">
                    <Settings className="mr-2 h-4 w-4" />
                    Configure
                  </Button>
                  <Button size="sm" disabled={integration.status === "inactive"}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Sync Now
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="hr" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {integrations.filter(i => i.category === "hr").map((integration) => (
              <Card key={integration.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={integration.logo} alt={integration.name} />
                        <AvatarFallback>{integration.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle>{integration.name}</CardTitle>
                        <CardDescription>{integration.provider}</CardDescription>
                      </div>
                    </div>
                    <Badge 
                      variant={
                        integration.status === "active" ? "default" : 
                        integration.status === "inactive" ? "secondary" : 
                        "destructive"
                      }
                    >
                      {integration.status.charAt(0).toUpperCase() + integration.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{integration.description}</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Category</span>
                      <Badge variant="outline" className="capitalize">
                        {integration.category}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Last Sync</span>
                      <span>{new Date(integration.lastSync).toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm">
                    <Settings className="mr-2 h-4 w-4" />
                    Configure
                  </Button>
                  <Button size="sm" disabled={integration.status === "inactive"}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Sync Now
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="payroll" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {integrations.filter(i => i.category === "payroll").map((integration) => (
              <Card key={integration.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={integration.logo} alt={integration.name} />
                        <AvatarFallback>{integration.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle>{integration.name}</CardTitle>
                        <CardDescription>{integration.provider}</CardDescription>
                      </div>
                    </div>
                    <Badge 
                      variant={
                        integration.status === "active" ? "default" : 
                        integration.status === "inactive" ? "secondary" : 
                        "destructive"
                      }
                    >
                      {integration.status.charAt(0).toUpperCase() + integration.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{integration.description}</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Category</span>
                      <Badge variant="outline" className="capitalize">
                        {integration.category}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Last Sync</span>
                      <span>{new Date(integration.lastSync).toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm">
                    <Settings className="mr-2 h-4 w-4" />
                    Configure
                  </Button>
                  <Button size="sm" disabled={integration.status === "inactive"}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Sync Now
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="recruiting" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {integrations.filter(i => i.category === "recruiting").map((integration) => (
              <Card key={integration.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={integration.logo} alt={integration.name} />
                        <AvatarFallback>{integration.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle>{integration.name}</CardTitle>
                        <CardDescription>{integration.provider}</CardDescription>
                      </div>
                    </div>
                    <Badge 
                      variant={
                        integration.status === "active" ? "default" : 
                        integration.status === "inactive" ? "secondary" : 
                        "destructive"
                      }
                    >
                      {integration.status.charAt(0).toUpperCase() + integration.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{integration.description}</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Category</span>
                      <Badge variant="outline" className="capitalize">
                        {integration.category}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Last Sync</span>
                      <span>{new Date(integration.lastSync).toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm">
                    <Settings className="mr-2 h-4 w-4" />
                    Configure
                  </Button>
                  <Button size="sm" disabled={integration.status === "inactive"}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Sync Now
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="learning" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {integrations.filter(i => i.category === "learning").map((integration) => (
              <Card key={integration.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={integration.logo} alt={integration.name} />
                        <AvatarFallback>{integration.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle>{integration.name}</CardTitle>
                        <CardDescription>{integration.provider}</CardDescription>
                      </div>
                    </div>
                    <Badge 
                      variant={
                        integration.status === "active" ? "default" : 
                        integration.status === "inactive" ? "secondary" : 
                        "destructive"
                      }
                    >
                      {integration.status.charAt(0).toUpperCase() + integration.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{integration.description}</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Category</span>
                      <Badge variant="outline" className="capitalize">
                        {integration.category}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Last Sync</span>
                      <span>{new Date(integration.lastSync).toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm">
                    <Settings className="mr-2 h-4 w-4" />
                    Configure
                  </Button>
                  <Button size="sm" disabled={integration.status === "inactive"}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Sync Now
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="logs" className="space-y-4">
          <div className="rounded-md border">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-950">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Integration
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Timestamp
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Message
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {syncLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{log.integration}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Badge 
                        variant={
                          log.status === "success" ? "default" : 
                          log.status === "warning" ? "secondary" : 
                          "destructive"
                        }
                      >
                        {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{log.message}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

