"use client"

import { useState } from "react"
import { Calendar, CheckCircle2, FileText, MoreHorizontal, Search, Send, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock data for policy acknowledgments
const policiesData = [
  {
    id: 1,
    name: "Employee Handbook",
    version: "v3.2",
    publishDate: "Jan 15, 2025",
    dueDate: "Feb 15, 2025",
    status: "Active",
    acknowledgmentRate: 85,
    totalEmployees: 120,
    acknowledgedCount: 102,
    documentUrl: "#",
  },
  {
    id: 2,
    name: "Code of Conduct",
    version: "v2.0",
    publishDate: "Feb 1, 2025",
    dueDate: "Mar 1, 2025",
    status: "Active",
    acknowledgmentRate: 72,
    totalEmployees: 120,
    acknowledgedCount: 86,
    documentUrl: "#",
  },
  {
    id: 3,
    name: "Information Security Policy",
    version: "v1.5",
    publishDate: "Mar 10, 2025",
    dueDate: "Apr 10, 2025",
    status: "Active",
    acknowledgmentRate: 45,
    totalEmployees: 120,
    acknowledgedCount: 54,
    documentUrl: "#",
  },
  {
    id: 4,
    name: "Remote Work Policy",
    version: "v2.1",
    publishDate: "Dec 5, 2024",
    dueDate: "Jan 5, 2025",
    status: "Expired",
    acknowledgmentRate: 95,
    totalEmployees: 120,
    acknowledgedCount: 114,
    documentUrl: "#",
  },
  {
    id: 5,
    name: "Anti-Harassment Policy",
    version: "v1.0",
    publishDate: "Feb 20, 2025",
    dueDate: "Mar 20, 2025",
    status: "Active",
    acknowledgmentRate: 68,
    totalEmployees: 120,
    acknowledgedCount: 82,
    documentUrl: "#",
  },
  {
    id: 6,
    name: "Data Privacy Policy",
    version: "v1.2",
    publishDate: "Jan 30, 2025",
    dueDate: "Mar 1, 2025",
    status: "Draft",
    acknowledgmentRate: 0,
    totalEmployees: 120,
    acknowledgedCount: 0,
    documentUrl: "#",
  },
]

export function PolicyAcknowledgments() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredPolicies = policiesData.filter(
    (policy) =>
      policy.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (statusFilter === "all" || policy.status === statusFilter),
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search policies..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Expired">Expired</SelectItem>
            <SelectItem value="Draft">Draft</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline">Add Policy</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredPolicies.map((policy) => (
          <div key={policy.id} className="flex flex-col rounded-lg border overflow-hidden">
            <div className="border-b p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{policy.name}</h3>
                <Badge
                  variant={
                    policy.status === "Active" ? "default" : policy.status === "Expired" ? "destructive" : "outline"
                  }
                >
                  {policy.status}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">Version: {policy.version}</p>
            </div>

            <div className="flex-1 p-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Published: {policy.publishDate}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Due: {policy.dueDate}</span>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-sm">
                  <span>Acknowledgment Rate</span>
                  <span>{policy.acknowledgmentRate}%</span>
                </div>
                <Progress value={policy.acknowledgmentRate} className="mt-2" />
                <p className="mt-1 text-xs text-center text-muted-foreground">
                  {policy.acknowledgedCount} of {policy.totalEmployees} employees
                </p>
              </div>
            </div>

            <div className="flex border-t p-4">
              <Button variant="outline" size="sm" className="flex-1 mr-2">
                <FileText className="mr-2 h-4 w-4" />
                View
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem disabled={policy.status === "Draft"}>
                    <Send className="mr-2 h-4 w-4" />
                    Send reminders
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Users className="mr-2 h-4 w-4" />
                    View acknowledgments
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Update policy
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

