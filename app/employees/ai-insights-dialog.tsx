"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { generateEmployeeInsights } from "@/lib/ai-prompts"
import type { Database } from "@/lib/database.types"

type Employee = Database["public"]["Tables"]["employees"]["Row"]

interface AIInsightsDialogProps {
  employee: Employee
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AIInsightsDialog({ employee, open, onOpenChange }: AIInsightsDialogProps) {
  const [insights, setInsights] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  const loadInsights = async () => {
    setIsLoading(true)
    try {
      const response = await generateEmployeeInsights(employee)
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const text = decoder.decode(value)
          setInsights((prev) => prev + text)
        }
      }
    } catch (error) {
      console.error("Failed to generate insights:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (newOpen) {
          setInsights("")
          loadInsights()
        }
        onOpenChange(newOpen)
      }}
    >
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>AI Insights for {employee.name}</DialogTitle>
          <DialogDescription>AI-generated analysis and recommendations based on employee data</DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[400px] mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap">{insights}</div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

