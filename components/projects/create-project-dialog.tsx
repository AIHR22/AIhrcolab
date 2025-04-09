"use client"

import { useState, useEffect } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MultiSelect } from "@/components/ui/multi-select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Department, Skill } from "@/types/organization" // Assuming types are defined here
import { Label } from "@/components/ui/label"

// Type for individual required skill detail
const requiredSkillDetailSchema = z.object({
  skill_id: z.string().uuid(),
  skill_name: z.string(), // Keep name for display purposes in the form state
  required_proficiency: z.number().min(1, "Min 1").max(5, "Max 5"),
  headcount_needed: z.number().int().min(1, "Min 1"),
});

// Define the schema for the project form
const projectSchema = z.object({
  name: z.string().min(3, { message: "Project name must be at least 3 characters." }),
  description: z.string().optional(),
  department_id: z.string().uuid("Please select a department."),
  // Ensure date strings are valid before comparing
  start_date: z.string().refine((val) => /\d{4}-\d{2}-\d{2}/.test(val), { message: "Start date is required."}),
  end_date: z.string().refine((val) => /\d{4}-\d{2}-\d{2}/.test(val), { message: "End date is required."}),
  budget: z.coerce.number().positive({ message: "Budget must be a positive number." }).optional().nullable(),
  status: z.string().default('Planning'), 
  required_skills: z.array(requiredSkillDetailSchema).optional().default([]),
}).superRefine((data, ctx) => {
  // Compare dates only if both are valid strings
  if (data.start_date && data.end_date) {
     try {
       const startDate = new Date(data.start_date);
       const endDate = new Date(data.end_date);
       // Add time to avoid timezone issues making same day invalid
       startDate.setUTCHours(0,0,0,0); 
       endDate.setUTCHours(0,0,0,0); 
       
       if (endDate < startDate) {
         ctx.addIssue({
           code: z.ZodIssueCode.custom,
           message: "End date cannot be earlier than start date.",
           path: ["end_date"], // Attach error to the end_date field
         });
       }
     } catch (e) {
        // Handle potential invalid date parsing, though refine should catch format issues
        console.error("Date parsing error during superRefine:", e)
     }
  }
});

type ProjectFormValues = z.infer<typeof projectSchema>;

interface CreateProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onProjectCreated: () => void
}

export function CreateProjectDialog({ open, onOpenChange, onProjectCreated }: CreateProjectDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [allSkills, setAllSkills] = useState<Skill[]>([]); // Store all available skills
  const [fetchingSkills, setFetchingSkills] = useState(false);
  const { toast } = useToast();

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
      department_id: "",
      start_date: new Date().toISOString().split("T")[0],
      end_date: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split("T")[0], 
      budget: undefined, // Use undefined for optional number
      status: 'Planning',
      required_skills: [], 
    },
  });

  // Fetch departments and skills
  useEffect(() => {
    if (open) {
      const fetchDeps = async () => {
        console.log("Fetching departments...");
        try {
          const res = await fetch('/api/departments');
          console.log("Department API Response Status:", res.status);
          if (!res.ok) {
            throw new Error(`Failed to fetch departments: ${res.statusText}`);
          }
          const data = await res.json();
          console.log("Fetched Departments Data:", data);
          // Directly use the data if it's an array, otherwise default to empty array
          if (Array.isArray(data)) {
             setDepartments(data);
          } else {
             console.warn("Department data received is not an array:", data);
             setDepartments([]);
          }
        } catch (e: any) { 
          console.error("Failed to fetch departments", e); 
          toast({ title: "Error Loading Departments", description: e.message || "Could not load departments list.", variant: "destructive" });
          setDepartments([]); 
        }
      };
      
      const fetchSkills = async () => {
        setFetchingSkills(true);
        try {
          const res = await fetch('/api/skills'); 
          const data = await res.json();
          setAllSkills(data || []);
        } catch (e) { 
          console.error("Failed to fetch skills", e); 
          toast({ title: "Error", description: "Could not load skills list.", variant: "destructive" });
        } finally {
          setFetchingSkills(false);
        }
      }; 

      fetchDeps();
      fetchSkills();
    }
  }, [open, toast]);

  // Watch the required_skills array from the form state
  const currentRequiredSkills = form.watch('required_skills');

  // Handler for MultiSelect component changes
  const handleSkillsChange = (selectedIds: string[]) => {
    const currentSkillsMap = new Map(currentRequiredSkills.map(s => [s.skill_id, s]));
    const newRequiredSkills: z.infer<typeof requiredSkillDetailSchema>[] = selectedIds.map(id => {
      const existing = currentSkillsMap.get(id);
      if (existing) {
        return existing; // Keep existing details if skill is re-selected or stays selected
      }
      const skillInfo = allSkills.find(s => s.id === id);
      return {
        skill_id: id,
        skill_name: skillInfo?.name || 'Unknown Skill',
        required_proficiency: 1, // Default value
        headcount_needed: 1, // Default value
      };
    });
    form.setValue('required_skills', newRequiredSkills, { shouldValidate: true });
  };

  // Handler for proficiency/headcount input changes
  const handleSkillDetailChange = (
    index: number, 
    field: 'required_proficiency' | 'headcount_needed', 
    value: number
  ) => {
    const updatedSkills = [...currentRequiredSkills];
    updatedSkills[index] = { ...updatedSkills[index], [field]: value };
    form.setValue('required_skills', updatedSkills, { shouldValidate: true });
  };

  const onSubmit = async (values: ProjectFormValues) => {
    setIsSubmitting(true);
    try {
      // Prepare payload - remove skill_name as it's not needed in DB
      const payload = {
        ...values,
        required_skills: values.required_skills?.map(({ skill_name, ...rest }) => rest) || []
      };

      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create project.");
      }

      onProjectCreated();
      form.reset();

    } catch (error: any) {
      console.error("Error creating project:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // <<< Add log here to check state during render >>>
  console.log(`Rendering CreateProjectDialog. Departments count: ${departments.length}`); 

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isSubmitting) onOpenChange(isOpen); }}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>Fill in the details for the new project.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <FormField control={form.control} name="name" render={({ field }) => ( <FormItem> <FormLabel>Project Name</FormLabel> <FormControl><Input placeholder="Q1 Marketing Campaign" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
            <FormField control={form.control} name="department_id" render={({ field }) => ( <FormItem> <FormLabel>Department</FormLabel> <Select onValueChange={field.onChange} value={field.value} disabled={departments.length === 0}> <FormControl><SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger></FormControl> <SelectContent> {departments.length > 0 && console.log("Mapping departments for Select...")} {departments.map((dept) => (<SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>))} </SelectContent> </Select> <FormMessage /> </FormItem> )}/>
            <FormField control={form.control} name="description" render={({ field }) => ( <FormItem> <FormLabel>Description (Optional)</FormLabel> <FormControl><Textarea placeholder="Brief description of the project goals..." {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="start_date" render={({ field }) => ( <FormItem> <FormLabel>Start Date</FormLabel> <FormControl><Input type="date" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
              <FormField control={form.control} name="end_date" render={({ field }) => ( <FormItem> <FormLabel>End Date</FormLabel> <FormControl><Input type="date" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
            </div>
            <FormField control={form.control} name="budget" render={({ field }) => ( <FormItem> <FormLabel>Budget (Optional)</FormLabel> <FormControl><Input type="number" placeholder="50000" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} value={field.value ?? ''} /></FormControl> <FormMessage /> </FormItem> )}/>

            {/* Required Skills Section */}
            <FormField
              control={form.control}
              name="required_skills"
              render={() => ( // We don't use the field directly here, manage state separately
                <FormItem>
                  <FormLabel>Required Skills</FormLabel>
                  <FormControl>
                     <MultiSelect
                        options={allSkills.map(skill => ({ label: skill.name, value: skill.id }))}
                        selected={currentRequiredSkills.map(s => s.skill_id)} // Pass only IDs to MultiSelect
                        onChange={handleSkillsChange} // Custom handler
                        placeholder="Select required skills..."
                        disabled={fetchingSkills}
                        className="min-w-[200px]" // Example styling
                      />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Inputs for Proficiency and Headcount for selected skills */}
            {currentRequiredSkills.length > 0 && (
              <div className="space-y-4 rounded-md border p-4">
                <h4 className="text-sm font-medium leading-none mb-2">Skill Details</h4>
                {currentRequiredSkills.map((skillDetail, index) => (
                  <div key={skillDetail.skill_id} className="grid grid-cols-3 gap-x-4 gap-y-2 items-center">
                    {/* Skill Name Badge */}
                    <div className="col-span-3 sm:col-span-1">
                      <Badge variant="secondary">{skillDetail.skill_name}</Badge>
                    </div>
                    
                    {/* Proficiency Input */}
                     <FormField
                      // Nested control doesn't work well here, manage manually
                      name={`required_skills.${index}.required_proficiency`}
                      render={() => ( // Not using field render directly
                        <FormItem className="col-span-3 sm:col-span-1">
                          <Label className="text-xs">Proficiency (1-5)</Label>
                          <FormControl>
                            <Input 
                              type="number"
                              min={1} max={5} step={1}
                              value={skillDetail.required_proficiency}
                              onChange={(e) => handleSkillDetailChange(index, 'required_proficiency', parseInt(e.target.value) || 1)}
                              className="h-8"
                            />
                          </FormControl>
                          {/* Cannot easily show FormMessage here without full field registration */}
                        </FormItem>
                       )}
                    />
                    
                    {/* Headcount Input */}
                     <FormField
                      name={`required_skills.${index}.headcount_needed`}
                      render={() => (
                        <FormItem className="col-span-3 sm:col-span-1">
                           <Label className="text-xs">Headcount Needed</Label>
                          <FormControl>
                            <Input 
                              type="number"
                              min={1} step={1}
                              value={skillDetail.headcount_needed}
                              onChange={(e) => handleSkillDetailChange(index, 'headcount_needed', parseInt(e.target.value) || 1)}
                              className="h-8"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
              </div>
            )}

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Project"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 