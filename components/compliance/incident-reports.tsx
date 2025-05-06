"use client"

import { useState } from "react"
import { AlertCircle, Calendar, Eye, FileText, MoreHorizontal, Search, Shield } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Mock data for incident reports
const incidentsData = [
  {
    id: "INC-2025-001",
    title: "Workplace Harassment Complaint",
    type: "Harassment",
    status: "Under Investigation",
    reportDate: "Mar 20, 2025",
    reportedBy: {
      name: "Anonymous",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    assignedTo: {
      name: "Lisa Martinez",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    priority: "High",
    confidential: true,
  },
  {
    id: "INC-2025-002",
    title: "Data Breach Incident",
    type: "Security",
    status: "Resolved",
    reportDate: "Mar 15, 2025",
    reportedBy: {
      name: "Michael Brown",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    assignedTo: {
      name: "David Wilson",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    priority: "Critical",
    confidential: true,
  },
  {
    id: "INC-2025-003",
    title: "Workplace Safety Concern",
    type: "Safety",
    status: "Open",
    reportDate: "Mar 18, 2025",
    reportedBy: {
      name: "Jennifer Anderson",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    assignedTo: {
      name: "Unassigned",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    priority: "Medium",
    confidential: false,
  },
  {
    id: "INC-2025-004",
    title: "Discrimination Complaint",
    type: "Discrimination",
    status: "Under Investigation",
    reportDate: "Mar 10, 2025",
    reportedBy: {
      name: "Anonymous",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    assignedTo: {
      name: "Jessica Davis",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    priority: "High",
    confidential: true,
  },
  {
    id: "INC-2025-005",
    title: "Expense Report Fraud",
    type: "Fraud",
    status: "Resolved",
    reportDate: "Feb 28, 2025",
    reportedBy: {
      name: "Anonymous",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    assignedTo: {
      name: "Emily Johnson",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    priority: "High",
    confidential: true,
  },
  {
    id: "INC-2025-006",
    title: "Office Equipment Damage",
    type: "Property",
    status: "Closed",
    reportDate: "Mar 5, 2025",
    reportedBy: {
      name: "Robert Taylor",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    assignedTo: {
      name: "David Wilson",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    priority: "Low",
    confidential: false,
  },
]

export function IncidentReports() {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredIncidents = incidentsData.filter(
    (incident) =>
      (incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.id.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (typeFilter === "all" || incident.type === typeFilter) &&
      (statusFilter === "all" || incident.status === statusFilter),
  )

  // Get unique types and statuses for filters
  const types = Array.from(new Set(incidentsData.map((incident) => incident.type)))
  const statuses = Array.from(new Set(incidentsData.map((incident) => incident.status)))

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search incidents..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {types.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {statuses.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button>Report Incident</Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Incident</TableHead>
              <TableHead>Reported</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredIncidents.map((incident) => (
              <TableRow key={incident.id}>
                <TableCell className="font-medium">{incident.id}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {incident.confidential && <Shield className="h-4 w-4 text-muted-foreground" />}
                    <div>
                      <div className="font-medium">{incident.title}</div>
                      <Badge variant="outline">{incident.type}</Badge>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{incident.reportDate}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={incident.reportedBy.avatar} alt={incident.reportedBy.name} />
                        <AvatarFallback>
                          {incident.reportedBy.name === "Anonymous"
                            ? "AN"
                            : incident.reportedBy.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs">{incident.reportedBy.name}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={incident.assignedTo.avatar} alt={incident.assignedTo.name} />
                      <AvatarFallback>
                        {incident.assignedTo.name === "Unassigned"
                          ? "UN"
                          : incident.assignedTo.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span>{incident.assignedTo.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      incident.status === "Resolved" || incident.status === "Closed"
                        ? "default"
                        : incident.status === "Under Investigation"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {incident.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      incident.priority === "Critical"
                        ? "border-destructive text-destructive"
                        : incident.priority === "High"
                          ? "border-orange-500 text-orange-500"
                          : incident.priority === "Medium"
                            ? "border-yellow-500 text-yellow-500"
                            : "border-green-500 text-green-500"
                    }
                  >
                    {incident.priority}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        View details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <FileText className="mr-2 h-4 w-4" />
                        Update status
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <AlertCircle className="mr-2 h-4 w-4" />
                        Escalate incident
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

