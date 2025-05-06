"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, Paperclip, Mic, X } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { useAI } from "@/lib/ai/ai-provider"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  attachments?: string[]
}

export function HRAssistant() {
  const { isLoading: aiLoading } = useAI()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your HR Assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [attachments, setAttachments] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() && attachments.length === 0) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
      attachments: attachments.length > 0 ? [...attachments] : undefined,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setAttachments([])
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(input)
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiResponse,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1000)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newAttachments = Array.from(e.target.files).map((file) => file.name)
      setAttachments((prev) => [...prev, ...newAttachments])
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  // Function to generate AI responses based on user input
  const generateAIResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase()

    if (lowerQuery.includes("headcount") || lowerQuery.includes("employee count")) {
      return "Currently, we have 1,248 employees across all departments. This represents a 3.5% increase from the previous quarter. Would you like to see a breakdown by department?"
    }

    if (lowerQuery.includes("turnover") || lowerQuery.includes("attrition")) {
      return "The current employee turnover rate is 8.2%, which is below the industry average of 12.5%. The Engineering department has the lowest turnover at 5.1%, while Sales has the highest at 14.3%. Would you like me to prepare a detailed report on this?"
    }

    if (lowerQuery.includes("hiring") || lowerQuery.includes("recruitment")) {
      return "We currently have 24 open positions across the company. The average time-to-hire is 18.5 days, which is an improvement from 22 days in the previous quarter. The most in-demand skills are React, Node.js, and Data Science. Would you like to see the full recruitment dashboard?"
    }

    if (lowerQuery.includes("benefits") || lowerQuery.includes("compensation")) {
      return "Our benefits package includes health insurance (medical, dental, vision), 401(k) matching up to 4%, flexible work arrangements, and professional development stipends. The average compensation is currently at the 65th percentile of the market. Would you like more details on any specific benefit?"
    }

    if (lowerQuery.includes("performance") || lowerQuery.includes("review")) {
      return "The next performance review cycle begins on April 15, 2025. Currently, 85% of employees have completed their goal-setting for this quarter. Would you like me to send you a report of employees who haven't set their goals yet?"
    }

    if (lowerQuery.includes("training") || lowerQuery.includes("learning")) {
      return "We have 45 active learning programs. The most popular courses are 'Advanced JavaScript Programming', 'Leadership Skills', and 'Effective Communication'. Employees have completed an average of 12 training hours this quarter. Would you like to see the full learning analytics?"
    }

    if (lowerQuery.includes("org chart") || lowerQuery.includes("organization")) {
      return "I can help you with organizational structure information. Would you like to view the current org chart, make changes to reporting relationships, or generate a new org chart based on specific criteria?"
    }

    if (lowerQuery.includes("time off") || lowerQuery.includes("vacation") || lowerQuery.includes("leave")) {
      return "There are currently 16 pending time-off requests awaiting approval. The average vacation time used this year is 8.5 days per employee. Would you like to review the pending requests or see the time-off calendar?"
    }

    if (lowerQuery.includes("compliance") || lowerQuery.includes("policy")) {
      return "All compliance requirements are up to date. The employee handbook acknowledgment rate is 94%. There are 2 policies due for review next month: 'Remote Work Policy' and 'Information Security Policy'. Would you like me to prepare these for review?"
    }

    if (lowerQuery.includes("budget") || lowerQuery.includes("cost")) {
      return "The current HR budget utilization is at 68% for this fiscal year. The largest expenses are employee salaries (72%), benefits (18%), and recruitment (5%). We're currently under budget by approximately $120,000. Would you like to see the detailed financial report?"
    }

    if (lowerQuery.includes("generate") || lowerQuery.includes("report")) {
      return "I can generate various HR reports for you. Some popular reports include: Headcount Analysis, Turnover Report, Recruitment Metrics, Compensation Analysis, and Training Completion. Which report would you like me to prepare?"
    }

    // Default response if no specific topic is detected
    return (
      "I understand you're asking about \"" +
      query +
      "\". I can provide information on employee headcount, turnover rates, hiring status, benefits, performance reviews, training programs, organizational structure, time-off management, compliance, and budget. Could you please specify which area you'd like to know more about?"
    )
  }

  return (
    <Card className="flex h-[600px] flex-col">
      <CardHeader>
        <CardTitle>HR Assistant</CardTitle>
        <CardDescription>Ask questions about employees, policies, analytics, or any HR-related topic</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full px-4">
          <div className="space-y-4 pt-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`flex max-w-[80%] items-start gap-3 rounded-lg p-3 ${
                    message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  {message.role === "assistant" && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder.svg?height=32&width=32" alt="AI Assistant" />
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                  )}
                  <div className="flex flex-col gap-1">
                    <div className="text-sm">{message.content}</div>
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {message.attachments.map((attachment, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {attachment}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  {message.role === "user" && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex max-w-[80%] items-start gap-3 rounded-lg bg-muted p-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="AI Assistant" />
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-foreground/50"></div>
                    <div
                      className="h-2 w-2 animate-bounce rounded-full bg-foreground/50"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="h-2 w-2 animate-bounce rounded-full bg-foreground/50"
                      style={{ animationDelay: "0.4s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="flex-col items-stretch gap-2 p-4 pt-0">
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 rounded-md border p-2">
            {attachments.map((file, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {file}
                <button onClick={() => removeAttachment(index)} className="ml-1 rounded-full p-0.5 hover:bg-background">
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove {file}</span>
                </button>
              </Badge>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0" onClick={triggerFileInput}>
                  <Paperclip className="h-4 w-4" />
                  <span className="sr-only">Attach file</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Attach file</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} multiple />
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question..."
            className="min-h-10 flex-1 resize-none"
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0" disabled={isLoading}>
                  <Mic className="h-4 w-4" />
                  <span className="sr-only">Voice input</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Voice input</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button
            onClick={handleSend}
            disabled={(!input.trim() && attachments.length === 0) || isLoading}
            className="shrink-0"
          >
            <Send className="mr-2 h-4 w-4" />
            Send
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

