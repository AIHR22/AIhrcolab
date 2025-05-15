"use client"

import { useState } from "react"
import { Calendar, Clock, Edit, MoreHorizontal, Search, Users } from "lucide-react"
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

// Mock data for job openings
const jobsData = [
  {
    id: "JOB-2025-001",
    title: "Senior Software Engineer",
    department: "Engineering",
    location: "Remote",
    status: "Active",
    postedDate: "Mar 10, 2025",
    closingDate: "Apr 10, 2025",
    applicants: 24,
    targetHires: 2,
    progress: {
      screening: 12,
      interview: 5,
      offer: 1,
      hired: 0,
    },
  },
  {
    id: "JOB-2025-002",
    title: "Product Manager",
    department: "Product",
    location: "New York, NY",
    status: "Active",
    postedDate: "Mar 5, 2025",
    closingDate: "Apr 5, 2025",
    applicants: 18,
    targetHires: 1,
    progress: {
      screening: 8,
      interview: 3,
      offer: 0,
      hired: 0,
    },
  },
  {
    id: "JOB-2025-003",
    title: "UX Designer",
    department: "Design",
    location: "San Francisco, CA",
    status: "Active",
    postedDate: "Mar 15, 2025",
    closingDate: "Apr 15, 2025",
    applicants: 15,
    targetHires: 1,
    progress: {
      screening: 7,
      interview: 4,
      offer: 1,
      hired: 0,
    },
  },
  {
    id: "JOB-2025-004",
    title: "Marketing Specialist",
    department: "Marketing",
    location: "Remote",
    status: "Active",
    postedDate: "Mar 12, 2025",
    closingDate: "Apr 12, 2025",
    applicants: 12,
    targetHires: 1,
    progress: {
      screening: 6,
      interview: 2,
      offer: 0,
      hired: 0,
    },
  },
  {
    id: "JOB-2025-005",
    title: "HR Coordinator",
    department: "Human Resources",
    location: "Chicago, IL",
    status: "Closed",
    postedDate: "Feb 10, 2025",
    closingDate: "Mar 10, 2025",
    applicants: 20,
    targetHires: 1,
    progress: {
      screening: 10,
      interview: 5,
      offer: 1,
      hired: 1,
    },
  },
  {
    id: "JOB-2025-006",
    title: "Sales Representative",
    department: "Sales",
    location: "Dallas, TX",
    status: "Draft",
    postedDate: "N/A",
    closingDate: "N/A",
    applicants: 0,
    targetHires: 2,
    progress: {
      screening: 0,
      interview: 0,
      offer: 0,
      hired: 0,
    },
  },
]

export function JobOpenings() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [departmentFilter, setDepartmentFilter] = useState("all")

  const filteredJobs = jobsData.filter(
    (job) =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (statusFilter === "all" || job.status === statusFilter) &&
      (departmentFilter === "all" || job.department === departmentFilter),
  )

  // Get unique departments for filter
  const departments = Array.from(new Set(jobsData.map((job) => job.department)))

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search job openings..."
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
            <SelectItem value="Closed">Closed</SelectItem>
            <SelectItem value="Draft">Draft</SelectItem>
          </SelectContent>
        </Select>
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((department) => (
              <SelectItem key={department} value={department}>
                {department}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Timeline</TableHead>
              <TableHead>Applicants</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredJobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell>
                  <div className="font-medium">{job.title}</div>
                  <div className="text-xs text-muted-foreground">{job.id}</div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={job.status === "Active" ? "default" : job.status === "Closed" ? "secondary" : "outline"}
                  >
                    {job.status}
                  </Badge>
                </TableCell>
                <TableCell>{job.department}</TableCell>
                <TableCell>{job.location}</TableCell>
                <TableCell>
                  <div className="flex flex-col text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span>Posted: {job.postedDate}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span>Closing: {job.closingDate}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{job.applicants} applicants</span>
                      </div>
                      <span>
                        {job.progress.hired}/{job.targetHires} hired
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-blue-500"
                          style={{ width: `${(job.progress.screening / job.applicants) * 100}%` }}
                        />
                      </div>
                      <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-yellow-500"
                          style={{ width: `${(job.progress.interview / job.applicants) * 100}%` }}
                        />
                      </div>
                      <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-green-500"
                          style={{ width: `${(job.progress.offer / job.applicants) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
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
                        <Users className="mr-2 h-4 w-4" />
                        View applicants
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit job
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {job.status === "Active" && (
                        <DropdownMenuItem>
                          <Clock className="mr-2 h-4 w-4" />
                          Close job
                        </DropdownMenuItem>
                      )}
                      {job.status === "Draft" && (
                        <DropdownMenuItem>
                          <Calendar className="mr-2 h-4 w-4" />
                          Publish job
                        </DropdownMenuItem>
                      )}
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

