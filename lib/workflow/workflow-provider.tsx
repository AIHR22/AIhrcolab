"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface Trigger {
  id: string
  name: string
  description: string
  event: string
  conditions: any[]
  active: boolean
}

interface Action {
  id: string
  name: string
  description: string
  type: string
  parameters: any
  active: boolean
}

interface Workflow {
  id: string
  name: string
  description: string
  triggers: string[]
  actions: string[]
  active: boolean
  lastRun: string | null
  createdAt: string
  updatedAt: string
}

interface WorkflowContextType {
  workflows: Workflow[]
  triggers: Trigger[]
  actions: Action[]
  createWorkflow: (workflow: Omit<Workflow, "id" | "createdAt" | "updatedAt" | "lastRun">) => Promise<Workflow>
  updateWorkflow: (id: string, workflow: Partial<Workflow>) => Promise<Workflow>
  deleteWorkflow: (id: string) => Promise<void>
  createTrigger: (trigger: Omit<Trigger, "id">) => Promise<Trigger>
  updateTrigger: (id: string, trigger: Partial<Trigger>) => Promise<Trigger>
  deleteTrigger: (id: string) => Promise<void>
  createAction: (action: Omit<Action, "id">) => Promise<Action>
  updateAction: (id: string, action: Partial<Action>) => Promise<Action>
  deleteAction: (id: string) => Promise<void>
  executeWorkflow: (id: string) => Promise<any>
}

interface WorkflowProviderProps {
  children: ReactNode
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined)

// Sample data
const sampleTriggers: Trigger[] = [
  {
    id: "trigger-1",
    name: "New Employee Hired",
    description: "Triggered when a new employee is added to the system",
    event: "employee.created",
    conditions: [],
    active: true,
  },
  {
    id: "trigger-2",
    name: "Employee Resignation",
    description: "Triggered when an employee submits resignation",
    event: "employee.resignation",
    conditions: [],
    active: true,
  },
  {
    id: "trigger-3",
    name: "Project Delay Detected",
    description: "Triggered when a project falls behind schedule",
    event: "project.delay",
    conditions: [{ field: "delay_days", operator: "gt", value: 5 }],
    active: true,
  },
]

const sampleActions: Action[] = [
  {
    id: "action-1",
    name: "Send Onboarding Email",
    description: "Sends an onboarding email to the new employee",
    type: "email",
    parameters: {
      template: "onboarding-email",
      cc: ["hr@example.com"],
    },
    active: true,
  },
  {
    id: "action-2",
    name: "Update Payroll System",
    description: "Updates the payroll system with new employee information",
    type: "api",
    parameters: {
      endpoint: "payroll-api",
      method: "POST",
    },
    active: true,
  },
  {
    id: "action-3",
    name: "Schedule Exit Interview",
    description: "Schedules an exit interview for the resigning employee",
    type: "calendar",
    parameters: {
      duration: 60,
      participants: ["hr-manager", "employee"],
    },
    active: true,
  },
]

const sampleWorkflows: Workflow[] = [
  {
    id: "workflow-1",
    name: "New Employee Onboarding",
    description: "Automates the onboarding process for new employees",
    triggers: ["trigger-1"],
    actions: ["action-1", "action-2"],
    active: true,
    lastRun: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
  {
    id: "workflow-2",
    name: "Employee Resignation Process",
    description: "Automates the resignation process",
    triggers: ["trigger-2"],
    actions: ["action-3"],
    active: true,
    lastRun: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
  },
]

export function WorkflowProvider({ children }: WorkflowProviderProps) {
  const [workflows, setWorkflows] = useState<Workflow[]>(sampleWorkflows)
  const [triggers, setTriggers] = useState<Trigger[]>(sampleTriggers)
  const [actions, setActions] = useState<Action[]>(sampleActions)

  const createWorkflow = async (workflow: Omit<Workflow, "id" | "createdAt" | "updatedAt" | "lastRun">) => {
    const newWorkflow: Workflow = {
      ...workflow,
      id: `workflow-${Date.now()}`,
      lastRun: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setWorkflows((prev) => [...prev, newWorkflow])
    return newWorkflow
  }

  const updateWorkflow = async (id: string, workflow: Partial<Workflow>) => {
    const updatedWorkflows = workflows.map((w) =>
      w.id === id ? { ...w, ...workflow, updatedAt: new Date().toISOString() } : w,
    )

    setWorkflows(updatedWorkflows)
    return updatedWorkflows.find((w) => w.id === id) as Workflow
  }

  const deleteWorkflow = async (id: string) => {
    setWorkflows((prev) => prev.filter((w) => w.id !== id))
  }

  const createTrigger = async (trigger: Omit<Trigger, "id">) => {
    const newTrigger: Trigger = {
      ...trigger,
      id: `trigger-${Date.now()}`,
    }

    setTriggers((prev) => [...prev, newTrigger])
    return newTrigger
  }

  const updateTrigger = async (id: string, trigger: Partial<Trigger>) => {
    const updatedTriggers = triggers.map((t) => (t.id === id ? { ...t, ...trigger } : t))

    setTriggers(updatedTriggers)
    return updatedTriggers.find((t) => t.id === id) as Trigger
  }

  const deleteTrigger = async (id: string) => {
    setTriggers((prev) => prev.filter((t) => t.id !== id))

    // Also remove this trigger from any workflows that use it
    setWorkflows((prev) =>
      prev.map((w) => ({
        ...w,
        triggers: w.triggers.filter((t) => t !== id),
        updatedAt: new Date().toISOString(),
      })),
    )
  }

  const createAction = async (action: Omit<Action, "id">) => {
    const newAction: Action = {
      ...action,
      id: `action-${Date.now()}`,
    }

    setActions((prev) => [...prev, newAction])
    return newAction
  }

  const updateAction = async (id: string, action: Partial<Action>) => {
    const updatedActions = actions.map((a) => (a.id === id ? { ...a, ...action } : a))

    setActions(updatedActions)
    return updatedActions.find((a) => a.id === id) as Action
  }

  const deleteAction = async (id: string) => {
    setActions((prev) => prev.filter((a) => a.id !== id))

    // Also remove this action from any workflows that use it
    setWorkflows((prev) =>
      prev.map((w) => ({
        ...w,
        actions: w.actions.filter((a) => a !== id),
        updatedAt: new Date().toISOString(),
      })),
    )
  }

  const executeWorkflow = async (id: string) => {
    const workflow = workflows.find((w) => w.id === id)

    if (!workflow) {
      throw new Error(`Workflow with ID ${id} not found`)
    }

    if (!workflow.active) {
      throw new Error(`Workflow ${workflow.name} is not active`)
    }

    // In a real implementation, this would execute the workflow
    // For now, we'll just update the lastRun timestamp
    const updatedWorkflow = {
      ...workflow,
      lastRun: new Date().toISOString(),
    }

    setWorkflows((prev) => prev.map((w) => (w.id === id ? updatedWorkflow : w)))

    return {
      success: true,
      message: `Workflow ${workflow.name} executed successfully`,
      timestamp: new Date().toISOString(),
      workflow: updatedWorkflow,
    }
  }

  return (
    <WorkflowContext.Provider
      value={{
        workflows,
        triggers,
        actions,
        createWorkflow,
        updateWorkflow,
        deleteWorkflow,
        createTrigger,
        updateTrigger,
        deleteTrigger,
        createAction,
        updateAction,
        deleteAction,
        executeWorkflow,
      }}
    >
      {children}
    </WorkflowContext.Provider>
  )
}

export function useWorkflow() {
  const context = useContext(WorkflowContext)
  if (context === undefined) {
    throw new Error("useWorkflow must be used within a WorkflowProvider")
  }
  return context
}

