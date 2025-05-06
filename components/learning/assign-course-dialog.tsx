"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useEmployees } from "@/hooks/use-employees"
import { MultiSelect } from "@/components/ui/multi-select"
import type { Course } from "@/types/learning"

const assignSchema = z.object({
  employeeIds: z.array(z.string()).min(1, "Select at least one employee"),
})

interface AssignCourseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  course: Course | null
}

export function AssignCourseDialog({ open, onOpenChange, course }: AssignCourseDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const { employees, isLoading: isLoadingEmployees } = useEmployees()

  const form = useForm<z.infer<typeof assignSchema>>({
    resolver: zodResolver(assignSchema),
    defaultValues: {
      employeeIds: [],
    },
  })

  const employeeOptions =
    employees?.map((employee) => ({
      value: employee.id,
      label: `${employee.first_name} ${employee.last_name}`,
    })) || []

  async function onSubmit(values: z.infer<typeof assignSchema>) {
    if (!course) return

    try {
      setIsSubmitting(true)

      const response = await fetch("/api/courses/assign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId: course.id,
          employeeIds: values.employeeIds,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to assign course")
      }

      toast({
        title: "Success",
        description: "Course assigned successfully",
      })

      form.reset()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign course. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Assign Course</DialogTitle>
          <DialogDescription>Select employees to assign {course?.title || "the selected course"} to.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="employeeIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employees</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={employeeOptions}
                      selected={field.value}
                      onChange={field.onChange}
                      placeholder="Select employees..."
                      loading={isLoadingEmployees}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting ? "Assigning..." : "Assign Course"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

