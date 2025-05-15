import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';
import type { ChatInputProps } from '@/types/shared';

export function ChatInput({
  onSubmit,
  onSend,
  placeholder = "Type your message...",
  disabled = false,
}: ChatInputProps) {
  const [input, setInput] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return;

    if (onSubmit) {
      onSubmit(input.trim())
    } else if (onSend) {
      await onSend(input.trim())
    }
    
    setInput("")
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
