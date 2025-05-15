"use client"

import { useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import type { EmployeePerformance as PerformanceType } from "@/types/employees"
import { useRealtime } from "@/hooks/use-realtime"

const supabase = createClient()

const performanceSchema = z.object({
  review_date: z.string().min(1, { message: "Review date is required" }),
  rating: z.string().min(1, { message: "Rating is required" }),
  strengths: z.string().min(1, { message: "Strengths are required" }),
  areas_for_improvement: z.string().min(1, { message: "Areas for improvement are required" }),
  goals: z.string().min(1, { message: "Goals are required" }),
  comments: z.string().optional(),
})

type PerformanceFormValues = z.infer<typeof performanceSchema>

interface EmployeePerformanceProps {
  employeeId: string
}

export function EmployeePerformance({ employeeId }: EmployeePerformanceProps) {
  const [isAddingReview, setIsAddingReview] = useState(false)
  const { toast } = useToast()

  const {
    data: performanceReviews,
    loading,
    error,
  } = useRealtime<PerformanceType>("employee_performance", [], { filterColumn: "employee_id", filterValue: employeeId })

  const form = useForm<PerformanceFormValues>({
    resolver: zodResolver(performanceSchema),
    defaultValues: {
      review_date: new Date().toISOString().split("T")[0],
      rating: "3",
      strengths: "",
      areas_for_improvement: "",
      goals: "",
      comments: "",
    },
  })

  const onSubmit = async (data: PerformanceFormValues) => {
    try {
      const { error } = await supabase.from("employee_performance").insert({
        employee_id: employeeId,
        review_date: data.review_date,
        rating: Number.parseInt(data.rating),
        strengths: data.strengths,
        areas_for_improvement: data.areas_for_improvement,
        goals: data.goals,
        comments: data.comments,
        reviewer_id: "current-user-id", // Replace with actual user ID
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (error) throw error

      toast({
        title: "Performance review added",
        description: "The performance review has been added successfully.",
      })

      setIsAddingReview(false)
      form.reset()
    } catch (error) {
      console.error("Error adding performance review:", error)
      toast({
        title: "Error",
        description: "Failed to add performance review. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "text-green-500"
    if (rating >= 3) return "text-blue-500"
    if (rating >= 2) return "text-yellow-500"
    return "text-red-500"
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Performance Reviews</h2>
        <Button onClick={() => setIsAddingReview(true)}>Add Review</Button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading performance reviews...</div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-md text-red-500">Error loading performance reviews: {error.message}</div>
      ) : performanceReviews.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No performance reviews available</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {performanceReviews
            .sort((a, b) => new Date(b.review_date).getTime() - new Date(a.review_date).getTime())
            .map((review) => (
              <Card key={review.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle>Review: {new Date(review.review_date).toLocaleDateString()}</CardTitle>
                    <div className={`text-2xl font-bold ${getRatingColor(review.rating)}`}>{review.rating}/5</div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-medium">Strengths</h3>
                      <p className="text-sm">{review.strengths}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Areas for Improvement</h3>
                      <p className="text-sm">{review.areas_for_improvement}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Goals</h3>
                      <p className="text-sm">{review.goals}</p>
                    </div>
                    {review.comments && (
                      <div>
                        <h3 className="font-medium">Additional Comments</h3>
                        <p className="text-sm">{review.comments}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      <Dialog open={isAddingReview} onOpenChange={(open) => !open && setIsAddingReview(false)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Performance Review</DialogTitle>
            <DialogDescription>Add a new performance review for this employee.</DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="review_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Review Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rating (1-5)</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" max="5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="strengths"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Strengths</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Employee's key strengths and achievements" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="areas_for_improvement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Areas for Improvement</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Areas where the employee can improve" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="goals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Goals</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Goals for the next review period" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="comments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Comments</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Any additional comments or notes" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddingReview(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Review</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}

