"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock } from "lucide-react"
import { format } from "date-fns"
import { getUpcomingReviews } from "@/lib/supabase/api"
import { Skeleton } from "@/components/ui/skeleton"

interface Review {
  id: string
  review_type: "performance" | "probation" | "salary"
  scheduled_date: string
  employees: {
    id: string
    name: string
    avatar_url: string | null
  }
  reviewer: {
    id: string
    name: string
  }
}

export function UpcomingReviews() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchReviews() {
      try {
        const data = await getUpcomingReviews(4)
        setReviews(data)
      } catch (err) {
        console.error("Error fetching upcoming reviews:", err)
        setError("Failed to load upcoming reviews")
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-start gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return <div className="bg-red-50 p-4 rounded-md text-red-500">{error}</div>
  }

  if (reviews.length === 0) {
    return <div className="text-center py-4 text-muted-foreground">No upcoming reviews to display</div>
  }

  const getReviewTypeBadge = (type: Review["review_type"]) => {
    switch (type) {
      case "performance":
        return <Badge className="bg-blue-500">Performance</Badge>
      case "probation":
        return <Badge className="bg-amber-500">Probation</Badge>
      case "salary":
        return <Badge className="bg-green-500">Salary</Badge>
      default:
        return <Badge>Review</Badge>
    }
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="flex items-start gap-4">
          <Avatar>
            <AvatarImage
              src={review.employees.avatar_url || "/placeholder.svg?height=32&width=32"}
              alt={review.employees.name}
            />
            <AvatarFallback>
              {review.employees.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium leading-none">{review.employees.name}</p>
              {getReviewTypeBadge(review.review_type)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Calendar className="mr-1 h-3 w-3" />
              {format(new Date(review.scheduled_date), "MMM d, yyyy")}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="mr-1 h-3 w-3" />
              {format(new Date(review.scheduled_date), "h:mm a")}
            </div>
            <p className="text-xs text-muted-foreground">Reviewer: {review.reviewer.name}</p>
          </div>
          <Button variant="outline" size="sm">
            Prepare
          </Button>
        </div>
      ))}
    </div>
  )
}

