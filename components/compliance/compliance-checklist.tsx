"use client"

import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"

type ChecklistItem = {
  id: string
  title: string
  description: string
  completed: boolean
  dueDate: string
}

const initialItems: ChecklistItem[] = [
  {
    id: "1",
    title: "Annual Security Training",
    description: "All employees must complete annual security awareness training",
    completed: true,
    dueDate: "2023-12-31",
  },
  {
    id: "2",
    title: "Data Protection Assessment",
    description: "Complete quarterly data protection assessment",
    completed: false,
    dueDate: "2023-09-30",
  },
  {
    id: "3",
    title: "Vendor Security Reviews",
    description: "Review security practices of all third-party vendors",
    completed: false,
    dueDate: "2023-10-15",
  },
  {
    id: "4",
    title: "Policy Updates",
    description: "Update all HR policies to reflect current regulations",
    completed: true,
    dueDate: "2023-08-31",
  },
  {
    id: "5",
    title: "Compliance Training",
    description: "Conduct compliance training for all managers",
    completed: false,
    dueDate: "2023-11-30",
  },
  {
    id: "6",
    title: "Internal Audit",
    description: "Complete internal audit of HR processes",
    completed: true,
    dueDate: "2023-07-31",
  },
]

export function ComplianceChecklist() {
  const [items, setItems] = useState<ChecklistItem[]>(initialItems)

  const toggleItem = (id: string) => {
    setItems(items.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)))
  }

  const completedCount = items.filter((item) => item.completed).length
  const progressPercentage = (completedCount / items.length) * 100

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm font-medium">Overall Progress</span>
          <span className="text-sm text-muted-foreground">
            {completedCount}/{items.length} completed
          </span>
        </div>
        <Progress value={progressPercentage} />
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-start space-x-3 rounded-md border p-4">
            <Checkbox id={`item-${item.id}`} checked={item.completed} onCheckedChange={() => toggleItem(item.id)} />
            <div className="space-y-1">
              <div className="flex items-center">
                <Label
                  htmlFor={`item-${item.id}`}
                  className={`font-medium ${item.completed ? "line-through text-muted-foreground" : ""}`}
                >
                  {item.title}
                </Label>
                <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs">
                  Due: {new Date(item.dueDate).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

