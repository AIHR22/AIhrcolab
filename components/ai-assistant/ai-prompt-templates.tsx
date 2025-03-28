"use client"

import { Button } from "@/components/ui/button"

type PromptTemplate = {
  id: string
  title: string
  prompt: string
}

const templates: PromptTemplate[] = [
  {
    id: "1",
    title: "Current Headcount",
    prompt: "What is our current headcount by department?",
  },
  {
    id: "2",
    title: "Turnover Analysis",
    prompt: "Analyze our turnover rates by department for the last quarter.",
  },
  {
    id: "3",
    title: "Hiring Plan",
    prompt: "Generate a hiring plan for Q3 based on our growth projections.",
  },
  {
    id: "4",
    title: "Open Positions",
    prompt: "Summarize all open positions and their status.",
  },
  {
    id: "5",
    title: "Org Chart",
    prompt: "Create an org chart for the engineering team.",
  },
  {
    id: "6",
    title: "Compensation Analysis",
    prompt: "Analyze our compensation structure compared to industry benchmarks.",
  },
  {
    id: "7",
    title: "Training Needs",
    prompt: "Identify training needs based on recent performance reviews.",
  },
]

export function AIPromptTemplates() {
  // In a real app, this would communicate with the AI chat component
  const handleTemplateClick = (prompt: string) => {
    console.log("Selected prompt:", prompt)
    // This would typically dispatch an event or call a function to update the chat
  }

  return (
    <div className="space-y-2">
      {templates.map((template) => (
        <Button
          key={template.id}
          variant="outline"
          className="w-full justify-start text-left"
          onClick={() => handleTemplateClick(template.prompt)}
        >
          {template.title}
        </Button>
      ))}
    </div>
  )
}

