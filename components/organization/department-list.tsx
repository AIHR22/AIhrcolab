"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pencil, Plus, Trash2, PlusCircle, Edit, RefreshCw } from "lucide-react"
import type { Department } from "@/types/organization"
import { useEmployees } from "@/hooks/use-employees"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface DepartmentListProps {
  onRefresh?: () => void
}

export function DepartmentList({ onRefresh }: DepartmentListProps) {
  const [departments, setDepartments] = useState<Department[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [currentDepartment, setCurrentDepartment] = useState<Department | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    manager_id: "",
    parent_department_id: "",
  })
  const { toast } = useToast()
  const { employees } = useEmployees()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null)

  const fetchDepartments = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/departments')
      if (!response.ok) {
        throw new Error('Failed to fetch departments')
      }
      const data = await response.json()
      setDepartments(data)
    } catch (error) {
      console.error('Error fetching departments:', error)
      toast({
        title: "Error",
        description: "Failed to load departments.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDepartments()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value })
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      manager_id: "",
      parent_department_id: "",
    })
  }

  const handleAddDepartment = async () => {
    try {
      if (!formData.name) {
        toast({
          title: "Validation Error",
          description: "Department name is required.",
          variant: "destructive",
        })
        return
      }

      const response = await fetch('/api/departments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to create department')
      }

      await fetchDepartments()
      
      resetForm()
      setShowAddDialog(false)
      
      if (onRefresh) {
        onRefresh()
      }

      toast({
        title: "Success",
        description: "Department created successfully!",
      })
    } catch (error) {
      console.error('Error creating department:', error)
      toast({
        title: "Error",
        description: "Failed to create department.",
        variant: "destructive",
      })
    }
  }

  const handleEditDepartment = async () => {
    if (!currentDepartment) return

    try {
      const response = await fetch(`/api/departments`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          id: currentDepartment.id
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update department')
      }

      await fetchDepartments()
      
      resetForm()
      setCurrentDepartment(null)
      setShowEditDialog(false)
      
      if (onRefresh) {
        onRefresh()
      }

      toast({
        title: "Success",
        description: "Department updated successfully!",
      })
    } catch (error) {
      console.error('Error updating department:', error)
      toast({
        title: "Error",
        description: "Failed to update department.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteDepartment = async () => {
    try {
      if (!departmentToDelete) return

      const response = await fetch(`/api/departments?id=${departmentToDelete.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete department')
      }

      await fetchDepartments()
      
      setDepartmentToDelete(null)
      setShowDeleteDialog(false)
      
      if (onRefresh) {
        onRefresh()
      }

      toast({
        title: "Success",
        description: "Department deleted successfully!",
      })
    } catch (error) {
      console.error('Error deleting department:', error)
      toast({
        title: "Error",
        description: "Failed to delete department.",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (department: Department) => {
    setCurrentDepartment(department)
    setFormData({
      name: department.name,
      description: department.description || "",
      manager_id: department.manager_id || "",
      parent_department_id: department.parent_department_id || "",
    })
    setShowEditDialog(true)
  }

  const filteredDepartments = departments.filter((dept) => dept.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const getManagerName = (managerId: string | undefined) => {
    if (!managerId) return "None"
    const manager = employees.find((emp) => emp.id === managerId)
    return manager ? manager.name : "Unknown"
  }

  const getParentDepartmentName = (parentId: string | undefined) => {
    if (!parentId) return "None"
    const parent = departments.find((dept) => dept.id === parentId)
    return parent ? parent.name : "Unknown"
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Departments</h2>
        <div className="flex gap-2">
          <Button onClick={fetchDepartments} variant="outline" title="Refresh departments">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Department
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Department</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Department name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Department description"
                  />
                </div>
                <Button onClick={handleAddDepartment} className="w-full">
                  Add Department
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : departments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-muted-foreground mb-4">No departments found</p>
            <Button variant="outline" onClick={() => setShowAddDialog(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Your First Department
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((department) => (
            <Card key={department.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{department.name}</CardTitle>
                    {department.description && (
                      <div className="mt-1 line-clamp-2">{department.description}</div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        openEditDialog(department)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => {
                        setDepartmentToDelete(department)
                        setShowDeleteDialog(true)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Created: {new Date(department.created_at).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Department</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Department name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Department description"
              />
            </div>
            <Button onClick={handleEditDepartment} className="w-full">
              Update Department
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Department</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              Are you sure you want to delete the department "{departmentToDelete?.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteDepartment}>
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
