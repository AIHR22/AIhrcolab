"use client"

import { useState, useRef, useEffect } from "react"
import { DndProvider, useDrag, useDrop } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { Edit, Plus, Trash2, Save, ChevronDown, ChevronUp, Users } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Types for org chart
interface OrgChartNode {
  id: string
  name: string
  position: string
  department: string
  email?: string
  avatar?: string
  children: OrgChartNode[]
  isCollapsed?: boolean
}

// Sample org chart data
const initialOrgChart: OrgChartNode = {
  id: "1",
  name: "Robert Johnson",
  position: "CEO",
  department: "Executive",
  email: "robert.johnson@example.com",
  avatar: "/placeholder.svg?height=64&width=64",
  children: [
    {
      id: "2",
      name: "Sarah Williams",
      position: "CTO",
      department: "Technology",
      email: "sarah.williams@example.com",
      avatar: "/placeholder.svg?height=64&width=64",
      children: [
        {
          id: "5",
          name: "Michael Chen",
          position: "Engineering Director",
          department: "Engineering",
          email: "michael.chen@example.com",
          avatar: "/placeholder.svg?height=64&width=64",
          children: [
            {
              id: "9",
              name: "Alex Johnson",
              position: "Senior Developer",
              department: "Engineering",
              email: "alex.johnson@example.com",
              avatar: "/placeholder.svg?height=64&width=64",
              children: [],
            },
            {
              id: "10",
              name: "Priya Patel",
              position: "DevOps Engineer",
              department: "Engineering",
              email: "priya.patel@example.com",
              avatar: "/placeholder.svg?height=64&width=64",
              children: [],
            },
          ],
        },
        {
          id: "6",
          name: "Emily Rodriguez",
          position: "Product Director",
          department: "Product",
          email: "emily.rodriguez@example.com",
          avatar: "/placeholder.svg?height=64&width=64",
          children: [],
        },
      ],
    },
    {
      id: "3",
      name: "David Wilson",
      position: "CFO",
      department: "Finance",
      email: "david.wilson@example.com",
      avatar: "/placeholder.svg?height=64&width=64",
      children: [
        {
          id: "7",
          name: "Jennifer Lee",
          position: "Finance Director",
          department: "Finance",
          email: "jennifer.lee@example.com",
          avatar: "/placeholder.svg?height=64&width=64",
          children: [],
        },
        {
          id: "8",
          name: "Thomas Brown",
          position: "Accounting Manager",
          department: "Finance",
          email: "thomas.brown@example.com",
          avatar: "/placeholder.svg?height=64&width=64",
          children: [],
        },
      ],
    },
    {
      id: "4",
      name: "Lisa Martinez",
      position: "CHRO",
      department: "Human Resources",
      email: "lisa.martinez@example.com",
      avatar: "/placeholder.svg?height=64&width=64",
      children: [],
    },
  ],
}

// Drag and drop types
const ItemTypes = {
  NODE: "node",
}

// Node component with drag and drop
const OrgNode = ({
  node,
  onToggleCollapse,
  onEdit,
  onDelete,
  onAddChild,
  onDrop,
  path = [],
}: {
  node: OrgChartNode
  onToggleCollapse: (nodeId: string) => void
  onEdit: (node: OrgChartNode) => void
  onDelete: (nodeId: string, path: number[]) => void
  onAddChild: (nodeId: string) => void
  onDrop: (dragPath: number[], dropPath: number[]) => void
  path?: number[]
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.NODE,
    item: { path },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ItemTypes.NODE,
    drop: (item: { path: number[] }, monitor) => {
      if (monitor.didDrop()) {
        return
      }
      onDrop(item.path, path)
    },
    canDrop: (item: { path: number[] }) => {
      // Prevent dropping on itself or its children
      if (item.path.length <= path.length) {
        for (let i = 0; i < item.path.length; i++) {
          if (item.path[i] !== path[i]) {
            return true
          }
        }
        return false
      }
      for (let i = 0; i < path.length; i++) {
        if (item.path[i] !== path[i]) {
          return true
        }
      }
      return false
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver({ shallow: true }),
      canDrop: !!monitor.canDrop(),
    }),
  }))

  const nodeRef = useRef<HTMLDivElement>(null)
  drag(drop(nodeRef))

  return (
    <div className="flex flex-col items-center">
      <div
        ref={nodeRef}
        className={`
          flex flex-col items-center rounded-lg border p-4 shadow-sm
          ${isDragging ? "opacity-50" : ""}
          ${isOver && canDrop ? "border-primary bg-primary/10" : ""}
          ${node.id === "1" ? "bg-primary/5 border-primary/20" : "bg-card"}
        `}
        style={{ opacity: isDragging ? 0.5 : 1 }}
      >
        <div className="flex items-center gap-2 self-end">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onEdit(node)}>
                  <Edit className="h-3 w-3" />
                  <span className="sr-only">Edit</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onAddChild(node.id)}>
                  <Plus className="h-3 w-3" />
                  <span className="sr-only">Add</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add Direct Report</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {node.id !== "1" && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive"
                    onClick={() => onDelete(node.id, path)}
                  >
                    <Trash2 className="h-3 w-3" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        <Avatar className="h-16 w-16 mb-2">
          <AvatarImage src={node.avatar} alt={node.name} />
          <AvatarFallback>
            {node.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <h3 className="text-base font-medium">{node.name}</h3>
        <p className="text-sm text-muted-foreground">{node.position}</p>
        <Badge variant="outline" className="mt-1">
          {node.department}
        </Badge>

        {node.children.length > 0 && (
          <Button variant="ghost" size="icon" className="mt-2 h-6 w-6" onClick={() => onToggleCollapse(node.id)}>
            {node.isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
        )}
      </div>

      {node.children.length > 0 && !node.isCollapsed && (
        <>
          <div className="h-8 w-px bg-border"></div>
          <div className="flex flex-wrap justify-center gap-8">
            {node.children.map((child, index) => (
              <div key={child.id} className="flex flex-col items-center">
                <OrgNode
                  node={child}
                  onToggleCollapse={onToggleCollapse}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onAddChild={onAddChild}
                  onDrop={onDrop}
                  path={[...path, index]}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// Node edit dialog
const NodeEditDialog = ({
  node,
  isOpen,
  onClose,
  onSave,
}: {
  node: OrgChartNode | null
  isOpen: boolean
  onClose: () => void
  onSave: (updatedNode: OrgChartNode) => void
}) => {
  const [name, setName] = useState("")
  const [position, setPosition] = useState("")
  const [department, setDepartment] = useState("")
  const [email, setEmail] = useState("")

  useEffect(() => {
    if (node) {
      setName(node.name)
      setPosition(node.position)
      setDepartment(node.department)
      setEmail(node.email || "")
    }
  }, [node])

  const handleSave = () => {
    if (!node) return

    onSave({
      ...node,
      name,
      position,
      department,
      email,
    })

    onClose()
  }

  if (!node) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{node.id === "new" ? "Add Employee" : "Edit Employee"}</DialogTitle>
          <DialogDescription>
            {node.id === "new"
              ? "Add a new employee to the organization chart."
              : "Update employee information in the organization chart."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="position">Position</Label>
            <Input
              id="position"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="Job Title"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="department">Department</Label>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger>
                <SelectValue placeholder="Select Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Executive">Executive</SelectItem>
                <SelectItem value="Technology">Technology</SelectItem>
                <SelectItem value="Engineering">Engineering</SelectItem>
                <SelectItem value="Product">Product</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Human Resources">Human Resources</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Sales">Sales</SelectItem>
                <SelectItem value="Operations">Operations</SelectItem>
                <SelectItem value="Customer Support">Customer Support</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name || !position || !department}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Org Chart Generator Dialog
const OrgChartGeneratorDialog = ({
  isOpen,
  onClose,
  onGenerate,
}: {
  isOpen: boolean
  onClose: () => void
  onGenerate: (prompt: string, structure: string, size: string) => void
}) => {
  const [prompt, setPrompt] = useState("")
  const [structure, setStructure] = useState("hierarchical")
  const [size, setSize] = useState("medium")

  const handleGenerate = () => {
    onGenerate(prompt, structure, size)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Generate Organization Chart</DialogTitle>
          <DialogDescription>
            Describe the organization you want to create, and our AI will generate a chart for you.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="prompt">Description</Label>
            <Input
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g., A tech startup with engineering, product, and marketing teams"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="structure">Structure Type</Label>
            <Select value={structure} onValueChange={setStructure}>
              <SelectTrigger id="structure">
                <SelectValue placeholder="Select Structure" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hierarchical">Hierarchical</SelectItem>
                <SelectItem value="flat">Flat</SelectItem>
                <SelectItem value="matrix">Matrix</SelectItem>
                <SelectItem value="divisional">Divisional</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="size">Organization Size</Label>
            <Select value={size} onValueChange={setSize}>
              <SelectTrigger id="size">
                <SelectValue placeholder="Select Size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small (5-20 employees)</SelectItem>
                <SelectItem value="medium">Medium (20-100 employees)</SelectItem>
                <SelectItem value="large">Large (100-500 employees)</SelectItem>
                <SelectItem value="enterprise">Enterprise (500+ employees)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleGenerate} disabled={!prompt}>
            Generate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Main Org Chart Editor component
export function OrgChartEditor() {
  const [orgChart, setOrgChart] = useState<OrgChartNode>(initialOrgChart)
  const [editNode, setEditNode] = useState<OrgChartNode | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isGeneratorDialogOpen, setIsGeneratorDialogOpen] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(100)

  // Function to toggle node collapse
  const handleToggleCollapse = (nodeId: string) => {
    const toggleNode = (node: OrgChartNode): OrgChartNode => {
      if (node.id === nodeId) {
        return { ...node, isCollapsed: !node.isCollapsed }
      }

      return {
        ...node,
        children: node.children.map(toggleNode),
      }
    }

    setOrgChart(toggleNode(orgChart))
  }

  // Function to edit a node
  const handleEditNode = (node: OrgChartNode) => {
    setEditNode(node)
    setIsEditDialogOpen(true)
  }

  // Function to save edited node
  const handleSaveNode = (updatedNode: OrgChartNode) => {
    if (updatedNode.id === "new") {
      // Add new node
      const parentId = updatedNode.children[0]?.id

      const addChild = (node: OrgChartNode): OrgChartNode => {
        if (node.id === parentId) {
          return {
            ...node,
            children: [
              ...node.children,
              {
                ...updatedNode,
                id: `${Date.now()}`,
                children: [],
                avatar: "/placeholder.svg?height=64&width=64",
              },
            ],
          }
        }

        return {
          ...node,
          children: node.children.map(addChild),
        }
      }

      setOrgChart(addChild(orgChart))
    } else {
      // Update existing node
      const updateNode = (node: OrgChartNode): OrgChartNode => {
        if (node.id === updatedNode.id) {
          return updatedNode
        }

        return {
          ...node,
          children: node.children.map(updateNode),
        }
      }

      setOrgChart(updateNode(orgChart))
    }
  }

  // Function to delete a node
  const handleDeleteNode = (nodeId: string, path: number[]) => {
    const deleteNodeByPath = (node: OrgChartNode, currentPath: number[] = []): OrgChartNode => {
      // If we're at the parent of the node to delete
      if (currentPath.length === path.length - 1 && currentPath.every((index, i) => index === path[i])) {
        return {
          ...node,
          children: node.children.filter((_, index) => index !== path[path.length - 1]),
        }
      }

      // If we're still traversing the path
      if (currentPath.length < path.length && currentPath.every((index, i) => index === path[i])) {
        const childIndex = path[currentPath.length]
        const updatedChildren = [...node.children]
        updatedChildren[childIndex] = deleteNodeByPath(node.children[childIndex], [...currentPath, childIndex])
        return { ...node, children: updatedChildren }
      }

      return node
    }

    setOrgChart(deleteNodeByPath(orgChart))
  }

  // Function to add a child node
  const handleAddChild = (parentId: string) => {
    const newNode: OrgChartNode = {
      id: "new",
      name: "",
      position: "",
      department: "",
      children: [{ id: parentId, name: "", position: "", department: "", children: [] }], // Store parent ID
    }

    setEditNode(newNode)
    setIsEditDialogOpen(true)
  }

  // Function to handle node drop
  const handleDrop = (dragPath: number[], dropPath: number[]) => {
    // Get the node being dragged
    const getNodeByPath = (node: OrgChartNode, path: number[]): OrgChartNode | null => {
      if (path.length === 0) return node

      if (path.length === 1) {
        return node.children[path[0]] || null
      }

      const childNode = node.children[path[0]]
      if (!childNode) return null

      return getNodeByPath(childNode, path.slice(1))
    }

    const draggedNode = getNodeByPath(orgChart, dragPath)
    if (!draggedNode) return

    // Create a deep copy of the org chart
    const newOrgChart = JSON.parse(JSON.stringify(orgChart))

    // Remove the dragged node from its original position
    const removeNodeByPath = (node: OrgChartNode, path: number[]): OrgChartNode => {
      if (path.length === 1) {
        return {
          ...node,
          children: node.children.filter((_, index) => index !== path[0]),
        }
      }

      const childIndex = path[0]
      const updatedChildren = [...node.children]
      updatedChildren[childIndex] = removeNodeByPath(node.children[childIndex], path.slice(1))
      return { ...node, children: updatedChildren }
    }

    const orgChartWithoutDraggedNode = removeNodeByPath(newOrgChart, dragPath)

    // Add the dragged node to its new position
    const addNodeByPath = (node: OrgChartNode, path: number[], nodeToAdd: OrgChartNode): OrgChartNode => {
      if (path.length === 0) {
        return {
          ...node,
          children: [...node.children, nodeToAdd],
        }
      }

      const childIndex = path[0]
      const updatedChildren = [...node.children]
      updatedChildren[childIndex] = addNodeByPath(node.children[childIndex], path.slice(1), nodeToAdd)
      return { ...node, children: updatedChildren }
    }

    const finalOrgChart = addNodeByPath(orgChartWithoutDraggedNode, dropPath, draggedNode)

    setOrgChart(finalOrgChart)
  }

  // Function to generate org chart from prompt
  const handleGenerateOrgChart = (prompt: string, structure: string, size: string) => {
    // In a real implementation, this would call an AI service
    // For now, we'll generate a sample org chart based on the inputs

    let generatedChart: OrgChartNode

    if (prompt.toLowerCase().includes("tech") || prompt.toLowerCase().includes("startup")) {
      // Generate a tech startup org chart
      generatedChart = {
        id: "1",
        name: "Alex Morgan",
        position: "CEO",
        department: "Executive",
        avatar: "/placeholder.svg?height=64&width=64",
        children: [
          {
            id: "2",
            name: "Jamie Chen",
            position: "CTO",
            department: "Technology",
            avatar: "/placeholder.svg?height=64&width=64",
            children: [
              {
                id: "5",
                name: "Taylor Reed",
                position: "Engineering Lead",
                department: "Engineering",
                avatar: "/placeholder.svg?height=64&width=64",
                children: [],
              },
              {
                id: "6",
                name: "Jordan Smith",
                position: "Product Lead",
                department: "Product",
                avatar: "/placeholder.svg?height=64&width=64",
                children: [],
              },
            ],
          },
          {
            id: "3",
            name: "Casey Johnson",
            position: "CMO",
            department: "Marketing",
            avatar: "/placeholder.svg?height=64&width=64",
            children: [],
          },
          {
            id: "4",
            name: "Riley Brown",
            position: "COO",
            department: "Operations",
            avatar: "/placeholder.svg?height=64&width=64",
            children: [],
          },
        ],
      }
    } else if (prompt.toLowerCase().includes("healthcare") || prompt.toLowerCase().includes("hospital")) {
      // Generate a healthcare org chart
      generatedChart = {
        id: "1",
        name: "Dr. Sarah Johnson",
        position: "Medical Director",
        department: "Executive",
        avatar: "/placeholder.svg?height=64&width=64",
        children: [
          {
            id: "2",
            name: "Dr. Michael Chen",
            position: "Chief of Surgery",
            department: "Surgery",
            avatar: "/placeholder.svg?height=64&width=64",
            children: [],
          },
          {
            id: "3",
            name: "Dr. Emily Rodriguez",
            position: "Chief of Medicine",
            department: "Medicine",
            avatar: "/placeholder.svg?height=64&width=64",
            children: [],
          },
          {
            id: "4",
            name: "James Wilson",
            position: "Head of Nursing",
            department: "Nursing",
            avatar: "/placeholder.svg?height=64&width=64",
            children: [],
          },
          {
            id: "5",
            name: "Lisa Martinez",
            position: "Administrative Director",
            department: "Administration",
            avatar: "/placeholder.svg?height=64&width=64",
            children: [],
          },
        ],
      }
    } else {
      // Default generic org chart
      generatedChart = {
        id: "1",
        name: "Sam Taylor",
        position: "CEO",
        department: "Executive",
        avatar: "/placeholder.svg?height=64&width=64",
        children: [
          {
            id: "2",
            name: "Alex Johnson",
            position: "VP of Operations",
            department: "Operations",
            avatar: "/placeholder.svg?height=64&width=64",
            children: [],
          },
          {
            id: "3",
            name: "Jordan Smith",
            position: "VP of Sales",
            department: "Sales",
            avatar: "/placeholder.svg?height=64&width=64",
            children: [],
          },
          {
            id: "4",
            name: "Taylor Reed",
            position: "VP of Marketing",
            department: "Marketing",
            avatar: "/placeholder.svg?height=64&width=64",
            children: [],
          },
        ],
      }
    }

    // Adjust based on structure type
    if (structure === "flat") {
      // Make all employees report directly to CEO
      const flatChildren = []
      const collectAllNodes = (node: OrgChartNode) => {
        for (const child of node.children) {
          flatChildren.push({
            ...child,
            children: [],
          })
          collectAllNodes(child)
        }
      }

      collectAllNodes(generatedChart)
      generatedChart.children = flatChildren
    } else if (structure === "matrix") {
      // Add some cross-functional reporting
      const projectLead = {
        id: "matrix-1",
        name: "Quinn Davis",
        position: "Project Lead",
        department: "Project Management",
        avatar: "/placeholder.svg?height=64&width=64",
        children: [],
      }

      generatedChart.children.push(projectLead)
    }

    // Adjust based on size
    if (size === "small") {
      // Trim down the org chart
      generatedChart.children = generatedChart.children.slice(0, 2)
    } else if (size === "large" || size === "enterprise") {
      // Add more depth and breadth
      for (const child of generatedChart.children) {
        if (child.children.length === 0) {
          child.children = [
            {
              id: `${child.id}-1`,
              name: `Team Lead 1`,
              position: "Team Lead",
              department: child.department,
              avatar: "/placeholder.svg?height=64&width=64",
              children: [],
            },
            {
              id: `${child.id}-2`,
              name: `Team Lead 2`,
              position: "Team Lead",
              department: child.department,
              avatar: "/placeholder.svg?height=64&width=64",
              children: [],
            },
          ]
        }
      }
    }

    setOrgChart(generatedChart)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Organization Chart Editor</CardTitle>
            <CardDescription>Drag and drop to reorganize, edit nodes to update information</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm">{zoomLevel}%</span>
            <Button variant="outline" size="sm" onClick={() => setZoomLevel(Math.min(150, zoomLevel + 10))}>
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{countNodes(orgChart)} Employees</span>
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Building className="h-3 w-3" />
              <span>{countDepartments(orgChart)} Departments</span>
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsGeneratorDialogOpen(true)}>
              <Wand2 className="mr-2 h-4 w-4" />
              Generate
            </Button>
            <Button variant="outline" size="sm">
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
          </div>
        </div>

        <div
          className="min-h-[500px] overflow-auto rounded-md border p-4"
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "top center" }}
        >
          <DndProvider backend={HTML5Backend}>
            <OrgNode
              node={orgChart}
              onToggleCollapse={handleToggleCollapse}
              onEdit={handleEditNode}
              onDelete={handleDeleteNode}
              onAddChild={handleAddChild}
              onDrop={handleDrop}
            />
          </DndProvider>
        </div>
      </CardContent>

      <NodeEditDialog
        node={editNode}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSave={handleSaveNode}
      />

      <OrgChartGeneratorDialog
        isOpen={isGeneratorDialogOpen}
        onClose={() => setIsGeneratorDialogOpen(false)}
        onGenerate={handleGenerateOrgChart}
      />
    </Card>
  )
}

// Helper function to count total nodes
function countNodes(node: OrgChartNode): number {
  let count = 1 // Count the node itself
  for (const child of node.children) {
    count += countNodes(child)
  }
  return count
}

// Helper function to count unique departments
function countDepartments(node: OrgChartNode): number {
  const departments = new Set<string>()

  const collectDepartments = (node: OrgChartNode) => {
    departments.add(node.department)
    for (const child of node.children) {
      collectDepartments(child)
    }
  }

  collectDepartments(node)
  return departments.size
}

// Missing imports
import { ZoomIn, ZoomOut, Building, Wand2 } from "lucide-react"

