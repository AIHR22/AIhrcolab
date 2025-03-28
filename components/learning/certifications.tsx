"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MultiSelect } from "@/components/ui/multi-select"
import { Award, Calendar, Clock, Plus, Search } from "lucide-react"
import { useEmployees } from "@/hooks/use-employees"

interface Certification {
  id: string
  name: string
  provider: string
  description: string
  duration_months: number
  skills: string[]
  created_at: string
  updated_at: string
}

interface EmployeeCertification {
  id: string
  employee_id: string
  certification_id: string
  issue_date: string
  expiry_date: string | null
  status: "in_progress" | "completed" | "expired"
  created_at: string
  updated_at: string
  certification: Certification
  employee: {
    first_name: string
    last_name: string
  }
}

export function Certifications() {
  const [certifications, setCertifications] = useState<Certification[]>([])
  const [employeeCertifications, setEmployeeCertifications] = useState<EmployeeCertification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    provider: "",
    description: "",
    duration_months: 3,
    skills: [] as string[],
  })
  const [assignData, setAssignData] = useState({
    employee_id: "",
    certification_id: "",
    issue_date: new Date().toISOString().split("T")[0],
    expiry_date: "",
    status: "in_progress",
  })
  const { toast } = useToast()
  const { employees } = useEmployees()

  const skillOptions = [
    { label: "Leadership", value: "leadership" },
    { label: "Project Management", value: "project_management" },
    { label: "Communication", value: "communication" },
    { label: "Technical", value: "technical" },
    { label: "Programming", value: "programming" },
    { label: "Data Analysis", value: "data_analysis" },
    { label: "Design", value: "design" },
    { label: "Marketing", value: "marketing" },
    { label: "Sales", value: "sales" },
    { label: "Customer Service", value: "customer_service" },
  ]

  const fetchCertifications = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase.from("certifications").select("*").order("name")

      if (error) throw error
      setCertifications(data || [])
    } catch (error) {
      console.error("Error fetching certifications:", error)
      toast({
        title: "Error",
        description: "Failed to load certifications",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchEmployeeCertifications = async () => {
    try {
      const { data, error } = await supabase
        .from("employee_certifications")
        .select(`
          *,
          certification:certifications(*),
          employee:employees(first_name, last_name)
        `)
        .order("created_at", { ascending: false })

      if (error) throw error
      setEmployeeCertifications(data || [])
    } catch (error) {
      console.error("Error fetching employee certifications:", error)
      toast({
        title: "Error",
        description: "Failed to load employee certifications",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    fetchCertifications()
    fetchEmployeeCertifications()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleAssignInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setAssignData({ ...assignData, [name]: value })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value })
  }

  const handleAssignSelectChange = (name: string, value: string) => {
    setAssignData({ ...assignData, [name]: value })
  }

  const resetForm = () => {
    setFormData({
      name: "",
      provider: "",
      description: "",
      duration_months: 3,
      skills: [],
    })
  }

  const resetAssignForm = () => {
    setAssignData({
      employee_id: "",
      certification_id: "",
      issue_date: new Date().toISOString().split("T")[0],
      expiry_date: "",
      status: "in_progress",
    })
  }

  const handleAddCertification = async () => {
    try {
      const { data, error } = await supabase
        .from("certifications")
        .insert([
          {
            name: formData.name,
            provider: formData.provider,
            description: formData.description,
            duration_months: formData.duration_months,
            skills: formData.skills,
          },
        ])
        .select()

      if (error) throw error

      toast({
        title: "Success",
        description: "Certification added successfully",
      })

      setShowAddDialog(false)
      resetForm()
      fetchCertifications()
    } catch (error) {
      console.error("Error adding certification:", error)
      toast({
        title: "Error",
        description: "Failed to add certification",
        variant: "destructive",
      })
    }
  }

  const handleAssignCertification = async () => {
    try {
      // Calculate expiry date if not provided
      let expiryDate = assignData.expiry_date
      if (!expiryDate && assignData.status === "completed") {
        const certification = certifications.find((c) => c.id === assignData.certification_id)
        if (certification) {
          const issueDate = new Date(assignData.issue_date)
          issueDate.setMonth(issueDate.getMonth() + certification.duration_months)
          expiryDate = issueDate.toISOString().split("T")[0]
        }
      }

      const { data, error } = await supabase
        .from("employee_certifications")
        .insert([
          {
            employee_id: assignData.employee_id,
            certification_id: assignData.certification_id,
            issue_date: assignData.issue_date,
            expiry_date: expiryDate || null,
            status: assignData.status,
          },
        ])
        .select()

      if (error) throw error

      toast({
        title: "Success",
        description: "Certification assigned successfully",
      })

      setShowAssignDialog(false)
      resetAssignForm()
      fetchEmployeeCertifications()
    } catch (error) {
      console.error("Error assigning certification:", error)
      toast({
        title: "Error",
        description: "Failed to assign certification",
        variant: "destructive",
      })
    }
  }

  const filteredCertifications = certifications.filter(
    (cert) =>
      cert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.provider.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search certifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64 pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">Assign Certification</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign Certification to Employee</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="employee_id">Employee</Label>
                  <Select
                    value={assignData.employee_id}
                    onValueChange={(value) => handleAssignSelectChange("employee_id", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.first_name} {employee.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="certification_id">Certification</Label>
                  <Select
                    value={assignData.certification_id}
                    onValueChange={(value) => handleAssignSelectChange("certification_id", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a certification" />
                    </SelectTrigger>
                    <SelectContent>
                      {certifications.map((certification) => (
                        <SelectItem key={certification.id} value={certification.id}>
                          {certification.name} ({certification.provider})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="issue_date">Issue Date</Label>
                  <Input
                    id="issue_date"
                    name="issue_date"
                    type="date"
                    value={assignData.issue_date}
                    onChange={handleAssignInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={assignData.status}
                    onValueChange={(value) => handleAssignSelectChange("status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="expiry_date">Expiry Date (optional)</Label>
                  <Input
                    id="expiry_date"
                    name="expiry_date"
                    type="date"
                    value={assignData.expiry_date}
                    onChange={handleAssignInputChange}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAssignCertification}>Assign</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Certification
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Certification</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Certification Name</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="provider">Provider</Label>
                  <Input
                    id="provider"
                    name="provider"
                    value={formData.provider}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="duration_months">Duration (months)</Label>
                  <Input
                    id="duration_months"
                    name="duration_months"
                    type="number"
                    min="1"
                    value={formData.duration_months}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="skills">Skills</Label>
                  <MultiSelect
                    options={skillOptions}
                    selected={formData.skills}
                    onChange={(selected) => setFormData({ ...formData, skills: selected })}
                    placeholder="Select skills"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddCertification}>Add Certification</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading certifications...</div>
      ) : filteredCertifications.length === 0 ? (
        <div className="text-center py-8">No certifications found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCertifications.map((certification) => (
            <Card key={certification.id}>
              <CardHeader>
                <CardTitle>{certification.name}</CardTitle>
                <CardDescription>{certification.provider}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{certification.description}</p>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{certification.duration_months} months</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {certification.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skillOptions.find((s) => s.value === skill)?.label || skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setAssignData({
                      ...assignData,
                      certification_id: certification.id,
                    })
                    setShowAssignDialog(true)
                  }}
                >
                  <Award className="mr-2 h-4 w-4" />
                  Assign to Employee
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {employeeCertifications.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Recent Certifications</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {employeeCertifications.slice(0, 6).map((ec) => (
              <Card key={ec.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{ec.certification.name}</CardTitle>
                  <CardDescription>
                    {ec.employee.first_name} {ec.employee.last_name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Issued: {new Date(ec.issue_date).toLocaleDateString()}</span>
                  </div>
                  {ec.expiry_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Expires: {new Date(ec.expiry_date).toLocaleDateString()}</span>
                    </div>
                  )}
                  <Badge
                    className="mt-2"
                    variant={
                      ec.status === "completed" ? "default" : ec.status === "in_progress" ? "outline" : "destructive"
                    }
                  >
                    {ec.status === "completed" ? "Completed" : ec.status === "in_progress" ? "In Progress" : "Expired"}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

