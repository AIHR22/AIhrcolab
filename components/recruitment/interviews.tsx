"use client"

import { useState } from "react"
import { Calendar, Clock, Edit, FileText, MoreHorizontal, Search, Users, Video } from "lucide-react"
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

// Mock data for interviews
const interviewsData = [
  {
    id: "INT-2025-001",
    candidate: {
      id: "CAND-2025-001",
      name: "Alex Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
      jobTitle: "Senior Software Engineer",
    },
    type: "Technical Interview",
    date: "Mar 25, 2025",
    time: "10:00 AM - 11:00 AM",
    status: "Scheduled",
    location: "Video Call",
    interviewers: [
      {
        name: "Michael Chen",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      {
        name: "Sarah Williams",
        avatar: "/placeholder.svg?height=32&width=32",
      },
    ],
  },
  {
    id: "INT-2025-002",
    candidate: {
      id: "CAND-2025-004",
      name: "Priya Patel",
      avatar: "/placeholder.svg?height=40&width=40",
      jobTitle: "Marketing Specialist",
    },
    type: "Second Interview",
    date: "Mar 26, 2025",
    time: "2:00 PM - 3:00 PM",
    status: "Scheduled",
    location: "Video Call",
    interviewers: [
      {
        name: "Emily Johnson",
        avatar: "/placeholder.svg?height=32&width=32",
      },
    ],
  },
  {
    id: "INT-2025-003",
    candidate: {
      id: "CAND-2025-002",
      name: "Samantha Lee",
      avatar: "/placeholder.svg?height=40&width=40",
      jobTitle: "Product Manager",
    },
    type: "First Interview",
    date: "Mar 24, 2025",
    time: "11:30 AM - 12:30 PM",
    status: "Scheduled",
    location: "In-person",
    interviewers: [
      {
        name: "David Wilson",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      {
        name: "Jennifer Anderson",
        avatar: "/placeholder.svg?height=32&width=32",
      },
    ],
  },
  {
    id: "INT-2025-004",
    candidate: {
      id: "CAND-2025-003",
      name: "Marcus Williams",
      avatar: "/placeholder.svg?height=40&width=40",
      jobTitle: "UX Designer",
    },
    type: "Final Interview",
    date: "Mar 20, 2025",
    time: "1:00 PM - 2:30 PM",
    status: "Completed",
    location: "Video Call",
    interviewers: [
      {
        name: "Jennifer Anderson",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      {
        name: "Robert Johnson",
        avatar: "/placeholder.svg?height=32&width=32",
      },
    ],
    feedback: "Excellent candidate, recommended for offer",
  },
  {
    id: "INT-2025-005",
    candidate: {
      id: "CAND-2025-005",
      name: "David Chen",
      avatar: "/placeholder.svg?height=40&width=40",
      jobTitle: "Senior Software Engineer",
    },
    type: "Technical Interview",
    date: "Mar 16, 2025",
    time: "3:00 PM - 4:30 PM",
    status: "Cancelled",
    location: "Video Call",
    interviewers: [
      {
        name: "Michael Chen",
        avatar: "/placeholder.svg?height=32&width=32",
      },
    ],
  },
]

export function Interviews() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("upcoming")

  const filteredInterviews = interviewsData
    .filter(
      (interview) =>
        (interview.candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          interview.type.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (statusFilter === "all" || interview.status === statusFilter),
    )
    .sort((a, b) => {
      const dateA = new Date(a.date + " " + a.time.split(" - ")[0])
      const dateB = new Date(b.date + " " + b.time.split(" - ")[0])
      return dateFilter === "upcoming" ? dateA - dateB : dateB - dateA
    })

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search interviews..."
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
            <SelectItem value="Scheduled">Scheduled</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="past">Past</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Candidate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Interviewers
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredInterviews.map((interview) => (
              <tr key={interview.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Avatar className="mr-2 h-8 w-8">
                      <AvatarImage src={interview.candidate.avatar} alt={interview.candidate.name} />
                      <AvatarFallback>{interview.candidate.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4">
                      <div className="font-medium text-gray-900">{interview.candidate.name}</div>
                      <div className="text-gray-500">{interview.candidate.jobTitle}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-gray-900">{interview.type}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                    <span>{interview.date}</span>
                    <Clock className="ml-2 mr-2 h-4 w-4 text-gray-500" />
                    <span>{interview.time}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant="secondary">{interview.status}</Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-gray-900">{interview.location}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex -space-x-2">
                    {interview.interviewers.map((interviewer, index) => (
                      <Avatar key={index} className="h-7 w-7">
                        <AvatarImage src={interviewer.avatar} alt={interviewer.name} />
                        <AvatarFallback>{interviewer.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Users className="mr-2 h-4 w-4" />
                        View Candidate
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Video className="mr-2 h-4 w-4" />
                        Start Video Call
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <FileText className="mr-2 h-4 w-4" />
                        View Feedback
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

