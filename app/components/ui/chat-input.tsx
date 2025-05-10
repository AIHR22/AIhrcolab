import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface ChatInputProps {
  placeholder: string;
  onSend: (text: string) => Promise<void>;
}

export function ChatInput({ placeholder, onSend }: ChatInputProps) {
  const [text, setText] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    await onSend(text);
    setText('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        className="flex-1"
      />
      <Button type="submit">Send</Button>
    </form>
  );
} 