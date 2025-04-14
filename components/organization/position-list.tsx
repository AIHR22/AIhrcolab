"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Pencil, Plus, Trash2 } from "lucide-react"
import type { Position, Department } from "@/types/organization"

export function PositionList() {
  const [positions, setPositions] = useState<Position[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [currentPosition, setCurrentPosition] = useState<Position | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    department_id: "",
    level: "",
    description: "",
    is_manager: false,
  })
  const { toast } = useToast()

  const fetchPositions = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/positions')
      if (!response.ok) {
        throw new Error('Failed to fetch positions')
      }
      const data = await response.json()
      setPositions(data || [])
    } catch (error) {
      console.error("Error fetching positions:", error)
      toast({
        title: "Error",
        description: "Failed to load positions",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/departments')
      if (!response.ok) {
        throw new Error('Failed to fetch departments')
      }
      const data = await response.json()
      setDepartments(data || [])
    } catch (error) {
      console.error("Error fetching departments:", error)
      toast({
        title: "Error",
        description: "Failed to load departments",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    fetchPositions()
    fetchDepartments()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value })
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData({ ...formData, is_manager: checked })
  }

  const resetForm = () => {
    setFormData({
      title: "",
      department_id: "",
      level: "",
      description: "",
      is_manager: false,
    })
  }

  const handleAddPosition = async () => {
    try {
      const response = await fetch('/api/positions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          department_id: formData.department_id,
          level: formData.level,
          description: formData.description || null,
          is_manager: formData.is_manager,
        }),
      })
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add position')
      }

      toast({
        title: "Success",
        description: "Position added successfully",
      })
      setShowAddDialog(false)
      resetForm()
      fetchPositions()
    } catch (error) {
      console.error("Error adding position:", error)
      toast({
        title: "Error",
        description: "Failed to add position",
        variant: "destructive",
      })
    }
  }

  const handleEditPosition = async () => {
    if (!currentPosition) return

    try {
      const response = await fetch(`/api/positions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: currentPosition.id,
          title: formData.title,
          department_id: formData.department_id,
          level: formData.level,
          description: formData.description || null,
          is_manager: formData.is_manager,
        }),
      })
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update position')
      }

      toast({
        title: "Success",
        description: "Position updated successfully",
      })
      setShowEditDialog(false)
      setCurrentPosition(null)
      resetForm()
      fetchPositions()
    } catch (error) {
      console.error("Error updating position:", error)
      toast({
        title: "Error",
        description: "Failed to update position",
        variant: "destructive",
      })
    }
  }

  const handleDeletePosition = async (id: string) => {
    if (!confirm("Are you sure you want to delete this position?")) return

    try {
      const response = await fetch(`/api/positions?id=${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete position')
      }

      toast({
        title: "Success",
        description: "Position deleted successfully",
      })
      fetchPositions()
    } catch (error) {
      console.error("Error deleting position:", error)
      toast({
        title: "Error",
        description: "Failed to delete position",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (position: Position) => {
    setCurrentPosition(position)
    setFormData({
      title: position.title,
      department_id: position.department_id,
      level: position.level,
      description: position.description || "",
      is_manager: position.is_manager,
    })
    setShowEditDialog(true)
  }

  const filteredPositions = positions.filter((pos) => pos.title.toLowerCase().includes(searchTerm.toLowerCase()))

  const getDepartmentName = (departmentId: string) => {
    const department = departments.find((dept) => dept.id === departmentId)
    return department ? department.name : "Unknown"
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative">
          <Input
            type="search"
            placeholder="Search positions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Position
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Position</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Position Title</Label>
                <Input id="title" name="title" value={formData.title} onChange={handleInputChange} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="department_id">Department</Label>
                <Select
                  value={formData.department_id}
                  onValueChange={(value) => handleSelectChange("department_id", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((department) => (
                      <SelectItem key={department.id} value={department.id}>
                        {department.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="level">Level</Label>
                <Select value={formData.level} onValueChange={(value) => handleSelectChange("level", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Entry">Entry</SelectItem>
                    <SelectItem value="Junior">Junior</SelectItem>
                    <SelectItem value="Mid">Mid</SelectItem>
                    <SelectItem value="Senior">Senior</SelectItem>
                    <SelectItem value="Lead">Lead</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="Director">Director</SelectItem>
                    <SelectItem value="Executive">Executive</SelectItem>
                  </SelectContent>
                </Select>
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
              <div className="flex items-center space-x-2">
                <Checkbox id="is_manager" checked={formData.is_manager} onCheckedChange={handleCheckboxChange} />
                <Label htmlFor="is_manager">This is a management position</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddPosition}>Add Position</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Positions</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading positions...</div>
          ) : filteredPositions.length === 0 ? (
            <div className="text-center py-4">No positions found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPositions.map((position) => (
                  <TableRow key={position.id}>
                    <TableCell className="font-medium">{position.title}</TableCell>
                    <TableCell>{getDepartmentName(position.department_id)}</TableCell>
                    <TableCell>{position.level}</TableCell>
                    <TableCell>{position.is_manager ? "Yes" : "No"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(position)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeletePosition(position.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Position</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Position Title</Label>
              <Input id="edit-title" name="title" value={formData.title} onChange={handleInputChange} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-department_id">Department</Label>
              <Select
                value={formData.department_id}
                onValueChange={(value) => handleSelectChange("department_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((department) => (
                    <SelectItem key={department.id} value={department.id}>
                      {department.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-level">Level</Label>
              <Select value={formData.level} onValueChange={(value) => handleSelectChange("level", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Entry">Entry</SelectItem>
                  <SelectItem value="Junior">Junior</SelectItem>
                  <SelectItem value="Mid">Mid</SelectItem>
                  <SelectItem value="Senior">Senior</SelectItem>
                  <SelectItem value="Lead">Lead</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="Director">Director</SelectItem>
                  <SelectItem value="Executive">Executive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="edit-is_manager" checked={formData.is_manager} onCheckedChange={handleCheckboxChange} />
              <Label htmlFor="edit-is_manager">This is a management position</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditPosition}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
