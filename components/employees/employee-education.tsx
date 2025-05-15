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
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import type { EmployeeEducation as EducationType } from "@/types/employees"
import { useRealtime } from "@/hooks/use-realtime"
import { GraduationCap, Trash } from "lucide-react"

const educationSchema = z.object({
  institution: z.string().min(1, { message: "Institution is required" }),
  degree: z.string().min(1, { message: "Degree is required" }),
  field_of_study: z.string().min(1, { message: "Field of study is required" }),
  start_date: z.string().min(1, { message: "Start date is required" }),
  end_date: z.string().optional(),
  is_current: z.boolean().default(false),
})

type EducationFormValues = z.infer<typeof educationSchema>

interface EmployeeEducationProps {
  employeeId: string
}

const supabase = createClient()

export function EmployeeEducation({ employeeId }: EmployeeEducationProps) {
  const [isAddingEducation, setIsAddingEducation] = useState(false)
  const { toast } = useToast()

  const {
    data: educationRecords,
    loading,
    error,
    setData,
  } = useRealtime<EducationType>("employee_education", [], { filterColumn: "employee_id", filterValue: employeeId })

  const form = useForm<EducationFormValues>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      institution: "",
      degree: "",
      field_of_study: "",
      start_date: "",
      end_date: "",
      is_current: false,
    },
  })

  const onSubmit = async (data: EducationFormValues) => {
    try {
      const { error } = await supabase.from("employee_education").insert({
        employee_id: employeeId,
        institution: data.institution,
        degree: data.degree,
        field_of_study: data.field_of_study,
        start_date: data.start_date,
        end_date: data.is_current ? null : data.end_date,
        is_current: data.is_current,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (error) throw error

      toast({
        title: "Education record added",
        description: "The education record has been added successfully.",
      })

      setIsAddingEducation(false)
      form.reset()
    } catch (error) {
      console.error("Error adding education record:", error)
      toast({
        title: "Error",
        description: "Failed to add education record. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("employee_education").delete().eq("id", id)

      if (error) throw error

      // Optimistically update the UI
      setData(educationRecords.filter((record) => record.id !== id))

      toast({
        title: "Education record deleted",
        description: "The education record has been deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting education record:", error)
      toast({
        title: "Error",
        description: "Failed to delete education record. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Education</h2>
        <Button onClick={() => setIsAddingEducation(true)}>Add Education</Button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading education records...</div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-md text-red-500">Error loading education records: {error.message}</div>
      ) : educationRecords.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">No education records available</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {educationRecords
            .sort((a, b) => {
              if (a.is_current && !b.is_current) return -1
              if (!a.is_current && b.is_current) return 1
              return new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
            })
            .map((record) => (
              <Card key={record.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle>{record.institution}</CardTitle>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(record.id)}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <p className="font-medium">{record.degree}</p>
                      <p className="text-sm text-muted-foreground">{record.field_of_study}</p>
                    </div>
                    <p className="text-sm">
                      {new Date(record.start_date).toLocaleDateString()} -
                      {record.is_current
                        ? " Present"
                        : record.end_date
                          ? ` ${new Date(record.end_date).toLocaleDateString()}`
                          : " N/A"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      <Dialog open={isAddingEducation} onOpenChange={(open) => !open && setIsAddingEducation(false)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Education</DialogTitle>
            <DialogDescription>Add a new education record for this employee.</DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="institution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Institution</FormLabel>
                    <FormControl>
                      <Input placeholder="University or School Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="degree"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Degree</FormLabel>
                      <FormControl>
                        <Input placeholder="Bachelor's, Master's, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="field_of_study"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Field of Study</FormLabel>
                      <FormControl>
                        <Input placeholder="Computer Science, Business, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} disabled={form.watch("is_current")} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="is_current"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Currently studying here</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddingEducation(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Education</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}

