"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Users,
  Briefcase,
  Calendar,
  FileText,
  PlusCircle,
  Loader2,
  Search,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface JobPosting {
  id: string
  title: string
  description: string | null
  department_id: string | null
  location: string | null
  job_type: string | null
  status: string | null
  created_at: string
  departments?: {
    id: string
    name: string
  } | null
}

export default function RecruitmentPage() {
  const { toast } = useToast()
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([])
  const [activeJobs, setActiveJobs] = useState(0)
  const [candidates, setCandidates] = useState(0)
  const [interviews, setInterviews] = useState(0)
  const [offers, setOffers] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchJobPostings = async () => {
      try {
        const response = await fetch("/api/job-postings")

        if (!response.ok) {
          throw new Error("Failed to fetch job postings")
        }

        const data = await response.json()
        setJobPostings(data)

        // Calculate metrics
        const active = data.filter((job: JobPosting) => job.status === "Open").length
        setActiveJobs(active)

        // These would normally come from API calls
        setCandidates(78)
        setInterviews(12)
        setOffers(7)
      } catch (error) {
        console.error("Error fetching job postings:", error)
        toast({
          title: "Error",
          description: "Failed to load job postings. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchJobPostings()
  }, [])

  const getStatusBadge = (status: string | null) => {
    if (!status) return null

    const statusMap: Record<string, { variant: "default" | "outline" | "secondary" | "destructive"; label: string }> = {
      Open: { variant: "default", label: "Open" },
      Closed: { variant: "secondary", label: "Closed" },
      Draft: { variant: "outline", label: "Draft" },
      "On Hold": { variant: "destructive", label: "On Hold" },
    }

    const statusInfo = statusMap[status] || { variant: "outline", label: status }

    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recruitment</h1>
          <p className="text-muted-foreground">Manage job postings, candidates, applications, and interviews</p>
        </div>
        <Link href="/dashboard/recruitment/jobs/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Job Posting
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Job Postings</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeJobs}</div>
            <p className="text-xs text-muted-foreground">
              {activeJobs > 0
                ? `${Math.round((activeJobs / jobPostings.length) * 100)}% of all postings`
                : "No active postings"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Candidates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{candidates}</div>
            <p className="text-xs text-muted-foreground">23 new applications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Interviews</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{interviews}</div>
            <p className="text-xs text-muted-foreground">4 for this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offers Extended</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{offers}</div>
            <p className="text-xs text-muted-foreground">3 accepted, 1 declined</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="jobs">
        <TabsList>
          <TabsTrigger value="jobs">Job Postings</TabsTrigger>
          <TabsTrigger value="candidates">Candidates</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="interviews">Interviews</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs">
          <Card>
            <CardHeader>
              <CardTitle>Active Job Postings</CardTitle>
              <CardDescription>Manage and monitor your job postings</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : jobPostings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No job postings found</h3>
                  <p className="text-muted-foreground mt-1">Add your first job posting to get started</p>
                  <Link href="/dashboard/recruitment/jobs/new">
                    <Button className="mt-4">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Job Posting
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="rounded-md border">
                  <div className="grid grid-cols-5 p-4 font-medium border-b">
                    <div className="col-span-2">Job Title</div>
                    <div>Department</div>
                    <div>Location</div>
                    <div>Status</div>
                  </div>

                  {jobPostings.map((job) => (
                    <div key={job.id} className="grid grid-cols-5 p-4 border-b last:border-0">
                      <div className="col-span-2 font-medium">
                        <Link href={`/dashboard/recruitment/jobs/${job.id}`} className="hover:underline">
                          {job.title}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          Posted on {new Date(job.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div>{job.departments?.name || "—"}</div>
                      <div>{job.location || "Remote"}</div>
                      <div>{getStatusBadge(job.status)}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="candidates">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <div>
                <CardTitle>Candidates</CardTitle>
                <CardDescription>View and manage candidate profiles</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    placeholder="Search candidates..."
                    className="pl-8 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <Button variant="outline" size="sm">
                  Filter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    name: "Sarah Johnson",
                    email: "sarah.johnson@example.com",
                    phone: "+1 (555) 123-4567",
                    location: "San Francisco, CA",
                    status: "Interviewing",
                    applied: "2023-09-28",
                    position: "Senior Software Engineer",
                  },
                  {
                    name: "Michael Chen",
                    email: "michael.chen@example.com",
                    phone: "+1 (555) 987-6543",
                    location: "New York, NY",
                    status: "Application Review",
                    applied: "2023-10-02",
                    position: "Product Manager",
                  },
                  {
                    name: "Emily Rodriguez",
                    email: "emily.rodriguez@example.com",
                    phone: "+1 (555) 456-7890",
                    location: "Chicago, IL",
                    status: "Offer Extended",
                    applied: "2023-09-15",
                    position: "UX Designer",
                  },
                  {
                    name: "David Kim",
                    email: "david.kim@example.com",
                    phone: "+1 (555) 234-5678",
                    location: "Austin, TX",
                    status: "Rejected",
                    applied: "2023-09-20",
                    position: "Marketing Specialist",
                  },
                  {
                    name: "Jessica Taylor",
                    email: "jessica.taylor@example.com",
                    phone: "+1 (555) 876-5432",
                    location: "Seattle, WA",
                    status: "New Application",
                    applied: "2023-10-05",
                    position: "Sales Representative",
                  },
                ].map((candidate, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 rounded-lg border">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={`/placeholder.svg?height=40&width=40`} />
                      <AvatarFallback>
                        {candidate.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{candidate.name}</h4>
                        <Badge
                          variant={
                            candidate.status === "Offer Extended"
                              ? "default"
                              : candidate.status === "Interviewing"
                                ? "secondary"
                                : candidate.status === "Rejected"
                                  ? "destructive"
                                  : "outline"
                          }
                        >
                          {candidate.status}
                        </Badge>
                      </div>

                      <p className="text-sm font-medium">{candidate.position}</p>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Mail className="mr-1 h-3 w-3" />
                          {candidate.email}
                        </div>
                        <div className="flex items-center">
                          <Phone className="mr-1 h-3 w-3" />
                          {candidate.phone}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="mr-1 h-3 w-3" />
                          {candidate.location}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="mr-1 h-3 w-3" />
                          Applied: {new Date(candidate.applied).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/recruitment/candidates/${index + 1}`}>View Profile</Link>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications">
          <Card>
            <CardHeader>
              <CardTitle>Applications</CardTitle>
              <CardDescription>Track and process job applications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="font-medium">Application Pipeline</h3>

                  <div className="space-y-4">
                    {[
                      { stage: "New Applications", count: 32, percentage: 100 },
                      { stage: "Resume Screening", count: 24, percentage: 75 },
                      { stage: "Phone Interview", count: 18, percentage: 56 },
                      { stage: "Technical Assessment", count: 12, percentage: 38 },
                      { stage: "Onsite Interview", count: 8, percentage: 25 },
                      { stage: "Offer Stage", count: 5, percentage: 16 },
                    ].map((stage, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{stage.stage}</span>
                          <span className="text-sm text-muted-foreground">{stage.count} candidates</span>
                        </div>
                        <Progress value={stage.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Recent Application Activity</h3>

                  <div className="space-y-4">
                    {[
                      {
                        action: "New Application Received",
                        candidate: "Alex Wong",
                        position: "Frontend Developer",
                        time: "2 hours ago",
                        icon: <Mail className="h-4 w-4 text-blue-500" />,
                      },
                      {
                        action: "Moved to Interview Stage",
                        candidate: "Priya Patel",
                        position: "Product Manager",
                        time: "Yesterday",
                        icon: <Calendar className="h-4 w-4 text-purple-500" />,
                      },
                      {
                        action: "Offer Accepted",
                        candidate: "James Wilson",
                        position: "DevOps Engineer",
                        time: "2 days ago",
                        icon: <CheckCircle className="h-4 w-4 text-green-500" />,
                      },
                      {
                        action: "Application Rejected",
                        candidate: "Sophia Martinez",
                        position: "UX Designer",
                        time: "3 days ago",
                        icon: <XCircle className="h-4 w-4 text-red-500" />,
                      },
                      {
                        action: "Assessment Completed",
                        candidate: "Daniel Lee",
                        position: "Backend Developer",
                        time: "4 days ago",
                        icon: <FileText className="h-4 w-4 text-yellow-500" />,
                      },
                    ].map((activity, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 rounded-lg border">
                        <div className="mt-0.5">{activity.icon}</div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.action}</p>
                          <p className="text-xs text-muted-foreground">
                            {activity.candidate} • {activity.position}
                          </p>
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center">
                          <Clock className="mr-1 h-3 w-3" />
                          {activity.time}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interviews">
          <Card>
            <CardHeader>
              <CardTitle>Interviews</CardTitle>
              <CardDescription>Schedule and manage interviews</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="font-medium">Upcoming Interviews</h3>

                  <div className="space-y-4">
                    {[
                      {
                        candidate: "Rachel Green",
                        position: "Marketing Manager",
                        type: "Panel Interview",
                        date: "2023-10-12T14:00:00",
                        interviewers: ["John Smith", "Emma Davis"],
                        duration: 60,
                      },
                      {
                        candidate: "Mike Ross",
                        position: "Software Engineer",
                        type: "Technical Interview",
                        date: "2023-10-13T10:30:00",
                        interviewers: ["David Chen", "Sarah Johnson"],
                        duration: 90,
                      },
                      {
                        candidate: "Jessica Pearson",
                        position: "Product Designer",
                        type: "Portfolio Review",
                        date: "2023-10-13T15:00:00",
                        interviewers: ["Lisa Wong", "Michael Brown"],
                        duration: 60,
                      },
                      {
                        candidate: "Harvey Specter",
                        position: "Sales Director",
                        type: "Final Interview",
                        date: "2023-10-16T11:00:00",
                        interviewers: ["Robert Taylor", "Jennifer Lee", "James Wilson"],
                        duration: 120,
                      },
                    ].map((interview, index) => (
                      <div key={index} className="p-4 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-medium">{interview.candidate}</h4>
                            <p className="text-sm text-muted-foreground">{interview.position}</p>
                          </div>
                          <Badge>{interview.type}</Badge>
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
                          <div className="flex items-center">
                            <Calendar className="mr-1 h-4 w-4 text-muted-foreground" />
                            {new Date(interview.date).toLocaleDateString()} at{" "}
                            {new Date(interview.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </div>
                          <div className="flex items-center">
                            <Clock className="mr-1 h-4 w-4 text-muted-foreground" />
                            {interview.duration} minutes
                          </div>
                        </div>

                        <div className="mt-3">
                          <p className="text-xs text-muted-foreground mb-1">Interviewers:</p>
                          <div className="flex flex-wrap gap-2">
                            {interview.interviewers.map((interviewer, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {interviewer}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-3">
                          <Button variant="outline" size="sm">
                            Reschedule
                          </Button>
                          <Button size="sm">View Details</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button>
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule New Interview
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

