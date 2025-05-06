"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { MultiSelect } from "@/components/ui/multi-select"

interface Department {
  id: string
  name: string
}

interface Skill {
  id: string
  name: string
  category: string
}

interface EmployeeSkill {
  skill_id: string
  proficiency_level: number
}

const employeeSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  position: z.string().optional(),
  department_id: z.string().optional(),
  hire_date: z.string().optional(),
  status: z.string().optional(),
  address: z.string().optional(),
  bio: z.string().optional(),
  team: z.string().optional(),
  username: z.string().optional(),
  role: z.string().optional(),
  skills: z.array(z.object({
    skill_id: z.string(),
    proficiency_level: z.number().min(1).max(5)
  })).optional(),
  salary: z.string().or(z.number()).optional(),
})

type EmployeeFormValues = z.infer<typeof employeeSchema>

interface EmployeeFormProps {
  initialData?: EmployeeFormValues
  employeeId?: string
}

export function EmployeeForm({ initialData, employeeId }: EmployeeFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [departments, setDepartments] = useState<Department[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [skillProficiencies, setSkillProficiencies] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(false)
  const [fetchingDepartments, setFetchingDepartments] = useState(true)
  const [fetchingSkills, setFetchingSkills] = useState(true)

  const isEditMode = !!employeeId

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: initialData || {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      position: "",
      department_id: "",
      hire_date: new Date().toISOString().split("T")[0],
      status: "active",
      address: "",
      bio: "",
      team: "",
      username: "",
      role: "employee",
      skills: [],
      salary: "",
    },
  })

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch("/api/departments")
        if (!response.ok) {
          throw new Error("Failed to fetch departments")
        }
        const data = await response.json()
        setDepartments(data)
      } catch (error) {
        console.error("Error fetching departments:", error)
        toast({
          title: "Error",
          description: "Failed to load departments. Please try again.",
          variant: "destructive",
        })
      } finally {
        setFetchingDepartments(false)
      }
    }

    const fetchSkills = async () => {
      console.log("Attempting to fetch skills...");
      try {
        const response = await fetch("/api/skills")
        console.log("Skills API response status:", response.status);
        if (!response.ok) {
          throw new Error("Failed to fetch skills")
        }
        const data = await response.json()
        console.log("Skills data fetched:", data);
        setSkills(data)
      } catch (error) {
        console.error("Error fetching skills:", error)
        toast({
          title: "Error",
          description: "Failed to load skills. Please try again.",
          variant: "destructive",
        })
      } finally {
        setFetchingSkills(false)
      }
    }

    fetchDepartments()
    fetchSkills()
  }, [])

  useEffect(() => {
    // Initialize selected skills and proficiencies from initialData if available
    if (initialData?.skills) {
      const skillIds = (initialData.skills as EmployeeSkill[]).map(s => s.skill_id)
      setSelectedSkills(skillIds)
      
      const proficiencies: Record<string, number> = {}
      ;(initialData.skills as EmployeeSkill[]).forEach(s => {
        proficiencies[s.skill_id] = s.proficiency_level
      })
      setSkillProficiencies(proficiencies)
    }
  }, [initialData])

  // Handler for updating skill proficiency
  const handleProficiencyChange = (skillId: string, level: number) => {
    setSkillProficiencies(prev => ({
      ...prev,
      [skillId]: level
    }))

    // Update form value
    const updatedSkills = selectedSkills.map(id => ({
      skill_id: id,
      proficiency_level: id === skillId ? level : (skillProficiencies[id] || 1)
    }))
    form.setValue('skills', updatedSkills)
  }

  const onSubmit = async (data: EmployeeFormValues) => {
    setLoading(true)

    try {
      const url = isEditMode ? `/api/employees/${employeeId}` : "/api/employees"
      const method = isEditMode ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`Failed to ${isEditMode ? "update" : "create"} employee`)
      }

      const result = await response.json()

      toast({
        title: "Success",
        description: `Employee ${isEditMode ? "updated" : "created"} successfully`,
      })

      router.push("/dashboard/employees")
      router.refresh()
    } catch (error) {
      console.error(`Error ${isEditMode ? "updating" : "creating"} employee:`, error)
      toast({
        title: "Error",
        description: `Failed to ${isEditMode ? "update" : "create"} employee. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="John" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="john.doe@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="+1 (555) 123-4567" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="position"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Position</FormLabel>
                <FormControl>
                  <Input placeholder="Software Engineer" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="department_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Department</FormLabel>
                <Select disabled={fetchingDepartments} onValueChange={field.onChange} value={field.value || ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a department" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {fetchingDepartments ? (
                      <div className="flex items-center justify-center p-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="ml-2">Loading...</span>
                      </div>
                    ) : (
                      departments.map((department) => (
                        <SelectItem key={department.id} value={department.id}>
                          {department.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="hire_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hire Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || "active"}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="onboarding">Onboarding</SelectItem>
                    <SelectItem value="offboarding">Offboarding</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="team"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Team</FormLabel>
                <FormControl>
                  <Input placeholder="Frontend" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || "employee"}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="hr">HR</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="skills"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Skills</FormLabel>
                <FormControl>
                  <MultiSelect
                    disabled={fetchingSkills}
                    options={skills.map(skill => ({
                      label: skill.name,
                      value: skill.id,
                      category: skill.category
                    }))}
                    placeholder="Select skills..."
                    selected={selectedSkills}
                    onChange={(selected) => {
                      setSelectedSkills(selected)
                      // Update form value with proficiency levels
                      const skillsWithProficiency = selected.map(skillId => ({
                        skill_id: skillId,
                        proficiency_level: skillProficiencies[skillId] || 1
                      }))
                      form.setValue('skills', skillsWithProficiency)
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {selectedSkills.length > 0 && (
            <div className="col-span-2 border rounded-md p-4">
              <h4 className="font-medium mb-2">Skill Proficiency Levels</h4>
              <div className="space-y-3">
                {selectedSkills.map(skillId => {
                  const skill = skills.find(s => s.id === skillId)
                  return (
                    <div key={skillId} className="flex items-center justify-between gap-2">
                      <span>{skill?.name || 'Unknown Skill'}</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(level => (
                          <button
                            key={level}
                            type="button"
                            onClick={() => handleProficiencyChange(skillId, level)}
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs
                              ${skillProficiencies[skillId] === level 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Set proficiency level for each skill (1: Beginner, 5: Expert)
              </p>
            </div>
          )}

          <FormField
            control={form.control}
            name="salary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Salary</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="50000" 
                    {...field} 
                    value={field.value || ""} 
                    onChange={e => field.onChange(e.target.value ? Number(e.target.value) : "")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="123 Main St, San Francisco, CA 94105" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Brief description about the employee"
                  className="min-h-[100px]"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.push("/dashboard/employees")}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditMode ? "Update" : "Create"} Employee
          </Button>
        </div>
      </form>
    </Form>
  )
}

