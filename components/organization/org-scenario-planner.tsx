"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  BarChart, 
  Briefcase, 
  Users, 
  DollarSign, 
  Save, 
  Trash2, 
  FilePlus, 
  Calculator, 
  ChevronDown, 
  ChevronUp
} from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { OrgChart } from "@/components/organization/org-chart"
import type { OrgChartNode, OrgStructure, Department, Position } from "@/types/organization"

interface ScenarioItem {
  id: string
  name: string
  description: string
  baselineId: string | null
  changes: ScenarioChange[]
  costImpact: number
  headcountDelta: number
  createdAt: string
  status: "draft" | "active" | "archived"
}

interface ScenarioChange {
  id: string
  changeType: "add" | "remove" | "move" | "promote" | "modify"
  entityType: "department" | "position" | "employee"
  entityId: string
  entityName: string
  fromDepartmentId?: string
  toDepartmentId?: string
  details: string
  costImpact: number
}

export function OrgScenarioPlanner() {
  const [scenarios, setScenarios] = useState<ScenarioItem[]>([])
  const [activeScenario, setActiveScenario] = useState<ScenarioItem | null>(null)
  const [baselineStructure, setBaselineStructure] = useState<OrgChartNode | null>(null)
  const [scenarioStructure, setScenarioStructure] = useState<OrgChartNode | null>(null)
  const [departments, setDepartments] = useState<Department[]>([])
  const [positions, setPositions] = useState<Position[]>([])
  const [isCreatingScenario, setIsCreatingScenario] = useState(false)
  const [newScenarioName, setNewScenarioName] = useState("")
  const [newScenarioDescription, setNewScenarioDescription] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [comparisonMode, setComparisonMode] = useState<"side-by-side" | "overlay">("side-by-side")
  const [showChangeDialog, setShowChangeDialog] = useState(false)
  const [newChange, setNewChange] = useState<Partial<ScenarioChange>>({
    changeType: "add",
    entityType: "position",
    costImpact: 0
  })
  const { toast } = useToast()

  // Fetch initial data when component mounts
  useEffect(() => {
    fetchDepartments()
    fetchPositions()
    fetchScenarios()
    fetchBaselineStructure()
  }, [])

  // Fetch scenario structure when active scenario changes
  useEffect(() => {
    if (activeScenario) {
      fetchScenarioStructure(activeScenario.id)
    } else {
      setScenarioStructure(null)
    }
  }, [activeScenario])

  const fetchScenarios = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/organization/scenarios')
      
      if (!response.ok) {
        throw new Error('Failed to fetch scenarios')
      }
      
      const data = await response.json()
      setScenarios(data)
      
      // Set the first scenario as active if available
      if (data.length > 0 && !activeScenario) {
        setActiveScenario(data[0])
      }
    } catch (error) {
      console.error("Error fetching scenarios:", error)
      toast({
        title: "Error",
        description: "Failed to load organization scenarios",
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
      setDepartments(data)
    } catch (error) {
      console.error("Error fetching departments:", error)
      toast({
        title: "Error",
        description: "Failed to load departments",
        variant: "destructive",
      })
    }
  }

  const fetchPositions = async () => {
    try {
      const response = await fetch('/api/positions')
      
      if (!response.ok) {
        throw new Error('Failed to fetch positions')
      }
      
      const data = await response.json()
      setPositions(data)
    } catch (error) {
      console.error("Error fetching positions:", error)
      toast({
        title: "Error",
        description: "Failed to load positions",
        variant: "destructive",
      })
    }
  }

  const fetchBaselineStructure = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/organization')
      
      if (!response.ok) {
        throw new Error('Failed to fetch organization structure')
      }
      
      const result = await response.json()
      if (result.success && result.data) {
        setBaselineStructure(result.data)
      }
    } catch (error) {
      console.error("Error fetching baseline structure:", error)
      toast({
        title: "Error",
        description: "Failed to load organization structure",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchScenarioStructure = async (scenarioId: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/organization/scenarios/${scenarioId}/structure`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch scenario structure')
      }
      
      const result = await response.json()
      if (result.success && result.data) {
        setScenarioStructure(result.data)
      }
    } catch (error) {
      console.error("Error fetching scenario structure:", error)
      toast({
        title: "Error",
        description: "Failed to load scenario structure",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const createScenario = async () => {
    if (!newScenarioName.trim()) {
      toast({
        title: "Validation Error",
        description: "Scenario name is required",
        variant: "destructive",
      })
      return
    }
    
    try {
      setIsLoading(true)
      
      const response = await fetch('/api/organization/scenarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newScenarioName,
          description: newScenarioDescription,
          baselineId: null, // Create from current org structure
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to create scenario')
      }
      
      const newScenario = await response.json()
      
      setScenarios([...scenarios, newScenario])
      setActiveScenario(newScenario)
      setNewScenarioName("")
      setNewScenarioDescription("")
      
      toast({
        title: "Scenario Created",
        description: `"${newScenario.name}" has been created successfully`,
      })
    } catch (error) {
      console.error("Error creating scenario:", error)
      toast({
        title: "Error",
        description: "Failed to create organization scenario",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsCreatingScenario(false)
    }
  }

  const addScenarioChange = async () => {
    if (!activeScenario) return
    
    // Validation
    if (!newChange.entityType || !newChange.changeType || !newChange.entityId) {
      toast({
        title: "Validation Error",
        description: "Please fill out all required fields",
        variant: "destructive",
      })
      return
    }
    
    try {
      setIsLoading(true)
      
      const response = await fetch(`/api/organization/scenarios/${activeScenario.id}/changes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newChange),
      })
      
      if (!response.ok) {
        throw new Error('Failed to add change to scenario')
      }
      
      const result = await response.json()
      
      // Update the active scenario with the new change
      const updatedScenario = {
        ...activeScenario,
        changes: [...activeScenario.changes, result.change],
        costImpact: activeScenario.costImpact + (result.change.costImpact || 0),
        headcountDelta: activeScenario.headcountDelta + (result.change.changeType === 'add' ? 1 : result.change.changeType === 'remove' ? -1 : 0)
      }
      
      // Update scenarios list
      const updatedScenarios = scenarios.map(s => 
        s.id === updatedScenario.id ? updatedScenario : s
      )
      
      setScenarios(updatedScenarios)
      setActiveScenario(updatedScenario)
      
      // Reset form
      setNewChange({
        changeType: "add",
        entityType: "position",
        costImpact: 0
      })
      
      // Update the scenario structure
      fetchScenarioStructure(activeScenario.id)
      
      toast({
        title: "Change Added",
        description: `${result.change.changeType} ${result.change.entityType} added to scenario`,
      })
    } catch (error) {
      console.error("Error adding change to scenario:", error)
      toast({
        title: "Error",
        description: "Failed to add change to scenario",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setShowChangeDialog(false)
    }
  }

  const deleteScenario = async (scenarioId: string) => {
    try {
      setIsLoading(true)
      
      const response = await fetch(`/api/organization/scenarios/${scenarioId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete scenario')
      }
      
      // Remove from scenarios list
      const updatedScenarios = scenarios.filter(s => s.id !== scenarioId)
      setScenarios(updatedScenarios)
      
      // If active scenario was deleted, set a new active scenario
      if (activeScenario?.id === scenarioId) {
        setActiveScenario(updatedScenarios.length > 0 ? updatedScenarios[0] : null)
      }
      
      toast({
        title: "Scenario Deleted",
        description: "The scenario has been deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting scenario:", error)
      toast({
        title: "Error",
        description: "Failed to delete organization scenario",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    // ... existing JSX ...
  )
}
