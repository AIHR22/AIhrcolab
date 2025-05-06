import React, { useState } from 'react'
import { Button } from "./button"
import { Input } from "./input"
import { Send } from "lucide-react"

interface ScenarioChatProps {
  onSubmit: (scenario: string) => void
  disabled?: boolean
  placeholder?: string
}

export function ScenarioChat({ onSubmit, disabled = false, placeholder = "Enter your scenario..." }: ScenarioChatProps) {
  const [input, setInput] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    onSubmit(input.trim())
    setInput("")
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1"
      />
      <Button type="submit" size="icon" disabled={disabled || !input.trim()}>
        <Send className="h-4 w-4" />
      </Button>
    </form>
  )
}
