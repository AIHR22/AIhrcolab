"use client"

import { useState } from "react"
import { Calendar, Clock, Download, FileText, Filter, Search } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Mock data for audit logs
const auditLogsData = [
  {
    id: 1,
    action: "Employee Record Updated",
    description: "Updated salary information for John Smith",
    user: {
      name: "Jessica Davis",
      avatar: "/placeholder.svg?height=32&width=32",
      role: "HR Specialist",
    },
    timestamp: "Mar 25, 2025 10:32 AM",
    category: "Employee Data",
    severity: "Normal",
  },
  {
    id: 2,
    action: "Policy Published",
    description: "Published new version of Information Security Policy",
    user: {
      name: "Lisa Martinez",
      avatar: "/placeholder.svg?height=32&width=32",
      role: "CHRO",
    },
    timestamp: "Mar 24, 2025 2:15 PM",
    category: "Policy Management",
    severity: "Normal",
  },
  {
    id: 3,
    action: "Employee Terminated",
    description: "Processed termination for Christopher Thomas",
    user: {
      name: "David Wilson",
      avatar: "/placeholder.svg?height=32&width=32",
      role: "HR Director",
    },
    timestamp: "Mar 23, 2025 4:45 PM",
    category: "Employee Data",
    severity: "High",
  },
  {
    id: 4,
    action: "Sensitive Document Accessed",
    description: "Accessed salary spreadsheet for Finance department",
    user: {
      name: "Michael Brown",
      avatar: "/placeholder.svg?height=32&width=32",
      role: "Financial Analyst",
    },
    timestamp: "Mar 22, 2025 11:20 AM",
    category: "Document Access",
    severity: "High",
  },
  {
    id: 5,
    action: "Bulk Data Export",
    description: "Exported employee contact information",
    user: {
      name: "Emily Johnson",
      avatar: "/placeholder.svg?height=32&width=32",
      role: "Marketing Manager",
    },
    timestamp: "Mar 21, 2025 3:10 PM",
    category: "Data Export",
    severity: "Medium",
  },
  {
    id: 6,
    action: "System Settings Changed",
    description: "Updated permission settings for HR role",
    user: {
      name: "Robert Johnson",
      avatar: "/placeholder.svg?height=32&width=32",
      role: "System Administrator",
    },
    timestamp: "Mar 20, 2025 9:45 AM",
    category: "System Configuration",
    severity: "High",
  },
  {
    id: 7,
    action: "Login Attempt Failed",
    description: "Multiple failed login attempts for user account",
    user: {
      name: "System",
      avatar: "/placeholder.svg?height=32&width=32",
      role: "Security Alert",
    },
    timestamp: "Mar 19, 2025 7:30 PM",
    category: "Security",
    severity: "Critical",
  },
  {
    id: 8,
    action: "New Employee Added",
    description: "Created new employee record for Sarah Williams",
    user: {
      name: "Jessica Davis",
      avatar: "/placeholder.svg?height=32&width=32",
      role: "HR Specialist",
    },
    timestamp: "Mar 18, 2025 2:20 PM",
    category: "Employee Data",
    severity: "Normal",
  },
]

export function AuditLogs() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [severityFilter, setSeverityFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")

  const filteredLogs = auditLogsData.filter(
    (log) =>
      (log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (categoryFilter === "all" || log.category === categoryFilter) &&
      (severityFilter === "all" || log.severity === severityFilter),
  )

  // Get unique categories and severities for filters
  const categories = Array.from(new Set(auditLogsData.map((log) => log.category)))
  const severities = Array.from(new Set(auditLogsData.map((log) => log.severity)))

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search audit logs..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              {severities.map((severity) => (
                <SelectItem key={severity} value={severity}>
                  {severity}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          Advanced Filters
        </Button>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export Logs
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Action</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  <div className="font-medium">{log.action}</div>
                  <div className="text-xs text-muted-foreground">{log.description}</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={log.user.avatar} alt={log.user.name} />
                      <AvatarFallback>
                        {log.user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium">{log.user.name}</div>
                      <div className="text-xs text-muted-foreground">{log.user.role}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span>{log.timestamp.split(" ")[0]}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span>{log.timestamp.split(" ").slice(1).join(" ")}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{log.category}</Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      log.severity === "Critical"
                        ? "destructive"
                        : log.severity === "High"
                          ? "default"
                          : log.severity === "Medium"
                            ? "secondary"
                            : "outline"
                    }
                  >
                    {log.severity}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">
                    <FileText className="h-4 w-4" />
                    <span className="sr-only">View details</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

