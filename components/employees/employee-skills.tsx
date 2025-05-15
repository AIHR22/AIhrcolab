"use client"

import { useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent } from "@/components/ui/card"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import type { EmployeeSkill } from "@/types/employees"
import { useRealtime } from "@/hooks/use-realtime"
import { Award, Trash } from "lucide-react"

const supabase = createClient()

const skillSchema = z.object({
  skill_name: z.string().min(1, { message: "Skill name is required" }),
  proficiency_level: z.enum(["beginner", "intermediate", "advanced", "expert"]),
  years_of_experience: z.string().min(1, { message: "Years of experience is required" }),
})

type SkillFormValues = z.infer<typeof skillSchema>

interface EmployeeSkillsProps {
  employeeId: string
}

export function EmployeeSkills({ employeeId }: EmployeeSkillsProps) {
  const [isAddingSkill, setIsAddingSkill] = useState(false)
  const { toast } = useToast()

  const {
    data: skills,
    loading,
    error,
    setData,
  } = useRealtime<EmployeeSkill>("employee_skills", [], { filterColumn: "employee_id", filterValue: employeeId })

  const form = useForm<SkillFormValues>({
    resolver: zodResolver(skillSchema),
    defaultValues: {
      skill_name: "",
      proficiency_level: "intermediate",
      years_of_experience: "",
    },
  })

  const onSubmit = async (data: SkillFormValues) => {
    try {
      const { error } = await supabase.from("employee_skills").insert({
        employee_id: employeeId,
        skill_name: data.skill_name,
        proficiency_level: data.proficiency_level,
        years_of_experience: Number.parseInt(data.years_of_experience),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (error) throw error

      toast({
        title: "Skill added",
        description: "The skill has been added successfully.",
      })

      setIsAddingSkill(false)
      form.reset()
    } catch (error) {
      console.error("Error adding skill:", error)
      toast({
        title: "Error",
        description: "Failed to add skill. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("employee_skills").delete().eq("id", id)

      if (error) throw error

      // Optimistically update the UI
      setData(skills.filter((skill) => skill.id !== id))

      toast({
        title: "Skill deleted",
        description: "The skill has been deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting skill:", error)
      toast({
        title: "Error",
        description: "Failed to delete skill. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getProficiencyColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-blue-100 text-blue-800"
      case "intermediate":
        return "bg-green-100 text-green-800"
      case "advanced":
        return "bg-purple-100 text-purple-800"
      case "expert":
        return "bg-red-100 text-red-800"
      default:
        return ""
    }
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Skills</h2>
        <Button onClick={() => setIsAddingSkill(true)}>Add Skill</Button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading skills...</div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-md text-red-500">Error loading skills: {error.message}</div>
      ) : skills.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Award className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">No skills available</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {skills
                .sort((a, b) => {
                  const proficiencyOrder = { expert: 0, advanced: 1, intermediate: 2, beginner: 3 }
                  return (
                    // @ts-ignore
                    proficiencyOrder[a.proficiency_level] - proficiencyOrder[b.proficiency_level]
                  )
                })
                .map((skill) => (
                  <div key={skill.id} className="flex justify-between items-center p-3 border rounded-md">
                    <div>
                      <div className="font-medium">{skill.skill_name}</div>
                      <div className="flex items-center mt-1">
                        <Badge className={getProficiencyColor(skill.proficiency_level)}>
                          {skill.proficiency_level.charAt(0).toUpperCase() + skill.proficiency_level.slice(1)}
                        </Badge>
                        <span className="text-xs text-muted-foreground ml-2">
                          {skill.years_of_experience} {skill.years_of_experience === 1 ? "year" : "years"}
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(skill.id)}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={isAddingSkill} onOpenChange={(open) => !open && setIsAddingSkill(false)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Skill</DialogTitle>
            <DialogDescription>Add a new skill for this employee.</DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="skill_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Skill Name</FormLabel>
                    <FormControl>
                      <Input placeholder="JavaScript, Project Management, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="proficiency_level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Proficiency Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                          <SelectItem value="expert">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="years_of_experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Years of Experience</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddingSkill(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Skill</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}

