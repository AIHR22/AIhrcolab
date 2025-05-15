"use client"

import { useState } from "react"
import { Calendar, FileText, Mail, MoreHorizontal, Phone, Search, Star } from "lucide-react"
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

// Mock data for candidates
const candidatesData = [
  {
    id: "CAND-2025-001",
    name: "Alex Johnson",
    avatar: "/placeholder.svg?height=40&width=40",
    email: "alex.johnson@example.com",
    phone: "(555) 123-4567",
    jobTitle: "Senior Software Engineer",
    jobId: "JOB-2025-001",
    stage: "Interview",
    rating: 4,
    appliedDate: "Mar 15, 2025",
    lastActivity: "Technical Interview - Mar 20, 2025",
    tags: ["JavaScript", "React", "Node.js"],
  },
  {
    id: "CAND-2025-002",
    name: "Samantha Lee",
    avatar: "/placeholder.svg?height=40&width=40",
    email: "samantha.lee@example.com",
    phone: "(555) 234-5678",
    jobTitle: "Product Manager",
    jobId: "JOB-2025-002",
    stage: "Screening",
    rating: 3,
    appliedDate: "Mar 18, 2025",
    lastActivity: "Application Received - Mar 18, 2025",
    tags: ["Product Management", "Agile", "B2B"],
  },
  {
    id: "CAND-2025-003",
    name: "Marcus Williams",
    avatar: "/placeholder.svg?height=40&width=40",
    email: "marcus.williams@example.com",
    phone: "(555) 345-6789",
    jobTitle: "UX Designer",
    jobId: "JOB-2025-003",
    stage: "Offer",
    rating: 5,
    appliedDate: "Mar 12, 2025",
    lastActivity: "Offer Sent - Mar 22, 2025",
    tags: ["UI/UX", "Figma", "User Research"],
  },
  {
    id: "CAND-2025-004",
    name: "Priya Patel",
    avatar: "/placeholder.svg?height=40&width=40",
    email: "priya.patel@example.com",
    phone: "(555) 456-7890",
    jobTitle: "Marketing Specialist",
    jobId: "JOB-2025-004",
    stage: "Interview",
    rating: 4,
    appliedDate: "Mar 14, 2025",
    lastActivity: "First Interview - Mar 19, 2025",
    tags: ["Digital Marketing", "Content Strategy", "SEO"],
  },
  {
    id: "CAND-2025-005",
    name: "David Chen",
    avatar: "/placeholder.svg?height=40&width=40",
    email: "david.chen@example.com",
    phone: "(555) 567-8901",
    jobTitle: "Senior Software Engineer",
    jobId: "JOB-2025-001",
    stage: "Rejected",
    rating: 2,
    appliedDate: "Mar 10, 2025",
    lastActivity: "Technical Assessment Failed - Mar 16, 2025",
    tags: ["Java", "Spring", "Microservices"],
  },
  {
    id: "CAND-2025-006",
    name: "Olivia Martinez",
    avatar: "/placeholder.svg?height=40&width=40",
    email: "olivia.martinez@example.com",
    phone: "(555) 678-9012",
    jobTitle: "HR Coordinator",
    jobId: "JOB-2025-005",
    stage: "Hired",
    rating: 5,
    appliedDate: "Feb 20, 2025",
    lastActivity: "Offer Accepted - Mar 5, 2025",
    tags: ["HR", "Recruiting", "Employee Relations"],
  },
]

export function Candidates() {
  const [searchTerm, setSearchTerm] = useState("")
  const [stageFilter, setStageFilter] = useState("all")
  const [jobFilter, setJobFilter] = useState("all")

  const filteredCandidates = candidatesData.filter(
    (candidate) =>
      (candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))) &&
      (stageFilter === "all" || candidate.stage === stageFilter) &&
      (jobFilter === "all" || candidate.jobId === jobFilter),
  )

  // Get unique jobs and stages for filters
  const jobs = Array.from(
    new Set(candidatesData.map((candidate) => ({ id: candidate.jobId, title: candidate.jobTitle }))),
  ).filter((job, index, self) => self.findIndex((j) => j.id === job.id) === index)

  const stages = Array.from(new Set(candidatesData.map((candidate) => candidate.stage)))

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search candidates..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            {stages.map((stage) => (
              <SelectItem key={stage} value={stage}>
                {stage}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={jobFilter} onValueChange={setJobFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Job" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Jobs</SelectItem>
            {jobs.map((job) => (
              <SelectItem key={job.id} value={job.id}>
                {job.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidate</TableHead>
              <TableHead>Job</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Applied</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCandidates.map((candidate) => (
              <TableRow key={candidate.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={candidate.avatar} alt={candidate.name} />
                      <AvatarFallback>
                        {candidate.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{candidate.name}</div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <span>{candidate.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <span>{candidate.phone}</span>
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{candidate.jobTitle}</div>
                  <div className="text-xs text-muted-foreground">{candidate.jobId}</div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      candidate.stage === "Hired"
                        ? "default"
                        : candidate.stage === "Offer"
                          ? "secondary"
                          : candidate.stage === "Rejected"
                            ? "destructive"
                            : "outline"
                    }
                  >
                    {candidate.stage}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span>{candidate.appliedDate}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{candidate.lastActivity}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= candidate.rating ? "fill-yellow-400 text-yellow-400" : "text-muted"
                        }`}
                      />
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {candidate.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
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
                        <FileText className="mr-2 h-4 w-4" />
                        View profile
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Mail className="mr-2 h-4 w-4" />
                        Send email
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Calendar className="mr-2 h-4 w-4" />
                        Schedule interview
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

