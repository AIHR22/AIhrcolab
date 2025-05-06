import * as React from "react"
import { Textarea } from "./textarea"
import { Button } from "./button"
import { Send } from "lucide-react"

interface ChatInputProps {
  onSubmit: (message: string) => void
  placeholder?: string
  disabled?: boolean
}

export function ChatInput({
  onSubmit,
  placeholder = "Type your message...",
  disabled = false,
}: ChatInputProps) {
  const [input, setInput] = React.useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      onSubmit(input)
      setInput("")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="min-h-[40px] flex-1"
      />
      <Button type="submit" size="icon" disabled={disabled || !input.trim()}>
        <Send className="h-4 w-4" />
      </Button>
    </form>
  )
}
