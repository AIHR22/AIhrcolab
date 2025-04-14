"use client"

import { useState } from "react"
import { Calendar, CheckCircle2, FileText, MoreHorizontal, Search, ShieldAlert } from "lucide-react"
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Mock data for compliance requirements
const complianceData = [
  {
    id: 1,
    name: "GDPR Compliance",
    category: "Data Protection",
    status: "Compliant",
    dueDate: "Annual Review: Jun 15, 2025",
    lastReview: "Jun 15, 2024",
    assignedTo: "Jessica Davis",
    progress: 100,
    priority: "High",
    description: "Ensure compliance with General Data Protection Regulation requirements",
  },
  {
    id: 2,
    name: "ISO 27001 Certification",
    category: "Information Security",
    status: "In Progress",
    dueDate: "Certification: Sep 30, 2025",
    lastReview: "N/A",
    assignedTo: "Michael Brown",
    progress: 65,
    priority: "High",
    description: "Prepare for and obtain ISO 27001 information security certification",
  },
  {
    id: 3,
    name: "HIPAA Compliance",
    category: "Healthcare",
    status: "At Risk",
    dueDate: "Quarterly Review: Apr 30, 2025",
    lastReview: "Jan 30, 2025",
    assignedTo: "Lisa Martinez",
    progress: 40,
    priority: "Critical",
    description: "Ensure compliance with Health Insurance Portability and Accountability Act",
  },
  {
    id: 4,
    name: "SOC 2 Compliance",
    category: "Security",
    status: "Compliant",
    dueDate: "Annual Audit: Nov 15, 2025",
    lastReview: "Nov 15, 2024",
    assignedTo: "David Wilson",
    progress: 100,
    priority: "High",
    description: "Maintain SOC 2 compliance for security, availability, and confidentiality",
  },
  {
    id: 5,
    name: "ADA Compliance",
    category: "Accessibility",
    status: "In Progress",
    dueDate: "Implementation: Jul 31, 2025",
    lastReview: "N/A",
    assignedTo: "Jennifer Anderson",
    progress: 75,
    priority: "Medium",
    description: "Ensure compliance with Americans with Disabilities Act requirements",
  },
  {
    id: 6,
    name: "PCI DSS Compliance",
    category: "Payment Security",
    status: "Not Started",
    dueDate: "Implementation: Aug 15, 2025",
    lastReview: "N/A",
    assignedTo: "Unassigned",
    progress: 0,
    priority: "Medium",
    description: "Implement Payment Card Industry Data Security Standard requirements",
  },
]

export function ComplianceTracker() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")

  const filteredCompliance = complianceData.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (statusFilter === "all" || item.status === statusFilter) &&
      (categoryFilter === "all" || item.category === categoryFilter),
  )

  // Get unique categories for filter
  const categories = Array.from(new Set(complianceData.map((item) => item.category)))

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search compliance requirements..."
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
            <SelectItem value="Compliant">Compliant</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="At Risk">At Risk</SelectItem>
            <SelectItem value="Not Started">Not Started</SelectItem>
          </SelectContent>
        </Select>
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
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Requirement</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCompliance.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-muted-foreground">{item.category}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      item.status === "Compliant"
                        ? "default"
                        : item.status === "In Progress"
                          ? "secondary"
                          : item.status === "At Risk"
                            ? "destructive"
                            : "outline"
                    }
                  >
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{item.dueDate}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="w-[100px]">
                    <div className="flex items-center justify-between text-xs">
                      <span>{item.progress}%</span>
                    </div>
                    <Progress value={item.progress} className="h-2" />
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      item.priority === "Critical"
                        ? "border-destructive text-destructive"
                        : item.priority === "High"
                          ? "border-orange-500 text-orange-500"
                          : "border-yellow-500 text-yellow-500"
                    }
                  >
                    {item.priority}
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
                        <FileText className="mr-2 h-4 w-4" />
                        View details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Update status
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <ShieldAlert className="mr-2 h-4 w-4" />
                        Run assessment
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

