"use client"

import { useState } from "react"
import { Award, Calendar, Clock, FileText, MoreHorizontal, Search } from "lucide-react"
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

// Mock data for certifications
const certificationsData = [
  {
    id: 1,
    name: "Project Management Professional (PMP)",
    provider: "Project Management Institute",
    employeeId: "EMP005",
    employeeName: "David Wilson",
    avatar: "/placeholder.svg?height=40&width=40",
    issueDate: "Jun 15, 2024",
    expiryDate: "Jun 15, 2027",
    status: "Active",
    documentUrl: "#",
  },
  {
    id: 2,
    name: "AWS Certified Solutions Architect",
    provider: "Amazon Web Services",
    employeeId: "EMP001",
    employeeName: "John Smith",
    avatar: "/placeholder.svg?height=40&width=40",
    issueDate: "Mar 10, 2024",
    expiryDate: "Mar 10, 2027",
    status: "Active",
    documentUrl: "#",
  },
  {
    id: 3,
    name: "Certified ScrumMaster (CSM)",
    provider: "Scrum Alliance",
    employeeId: "EMP002",
    employeeName: "Emily Johnson",
    avatar: "/placeholder.svg?height=40&width=40",
    issueDate: "Jan 20, 2023",
    expiryDate: "Jan 20, 2025",
    status: "Active",
    documentUrl: "#",
  },
  {
    id: 4,
    name: "Google Analytics Certification",
    provider: "Google",
    employeeId: "EMP006",
    employeeName: "Sarah Martinez",
    avatar: "/placeholder.svg?height=40&width=40",
    issueDate: "Nov 5, 2023",
    expiryDate: "Nov 5, 2024",
    status: "Active",
    documentUrl: "#",
  },
  {
    id: 5,
    name: "Certified Information Systems Security Professional (CISSP)",
    provider: "ISC²",
    employeeId: "EMP003",
    employeeName: "Michael Brown",
    avatar: "/placeholder.svg?height=40&width=40",
    issueDate: "Aug 12, 2022",
    expiryDate: "Aug 12, 2025",
    status: "Active",
    documentUrl: "#",
  },
  {
    id: 6,
    name: "ITIL Foundation",
    provider: "Axelos",
    employeeId: "EMP009",
    employeeName: "Christopher Thomas",
    avatar: "/placeholder.svg?height=40&width=40",
    issueDate: "May 8, 2022",
    expiryDate: "May 8, 2025",
    status: "Expiring Soon",
    documentUrl: "#",
  },
]

export function LearningCertifications() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredCertifications = certificationsData.filter(
    (cert) =>
      (cert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.employeeName.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (statusFilter === "all" || cert.status === statusFilter),
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search certifications or employees..."
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
            <SelectItem value="Expiring Soon">Expiring Soon</SelectItem>
            <SelectItem value="Expired">Expired</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline">Add Certification</Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Certification</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Issue Date</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCertifications.map((cert) => (
              <TableRow key={cert.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <div className="font-medium">{cert.name}</div>
                    <div className="text-xs text-muted-foreground">{cert.provider}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={cert.avatar} alt={cert.employeeName} />
                      <AvatarFallback>
                        {cert.employeeName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span>{cert.employeeName}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{cert.issueDate}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{cert.expiryDate}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      cert.status === "Active"
                        ? "default"
                        : cert.status === "Expiring Soon"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {cert.status}
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
                        <Award className="mr-2 h-4 w-4" />
                        View details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <FileText className="mr-2 h-4 w-4" />
                        View document
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Calendar className="mr-2 h-4 w-4" />
                        Update expiry
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

