"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, Mic, Paperclip, FileText, Calendar, Users, DollarSign, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your HR AI Assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      let response = ""

      if (input.toLowerCase().includes("time off") || input.toLowerCase().includes("vacation")) {
        response =
          "To request time off, go to the Time Off section in the dashboard and click on 'Request Time Off'. You currently have 15 vacation days available. Would you like me to help you submit a request?"
      } else if (input.toLowerCase().includes("salary") || input.toLowerCase().includes("pay")) {
        response =
          "Your next payday is on May 15th. If you have questions about your salary or benefits, you can view your details in the Payroll & Benefits section or contact HR directly at hr@company.com."
      } else if (input.toLowerCase().includes("onboarding") || input.toLowerCase().includes("new hire")) {
        response =
          "For onboarding a new employee, go to the Onboarding section and click 'New Onboarding'. You'll need to provide their basic information, assign a mentor, and select the appropriate onboarding tasks. Would you like me to help you set this up?"
      } else {
        response =
          "I understand you're asking about " +
          input +
          ". How can I assist you further with this? I can help with time off requests, payroll questions, onboarding, performance reviews, and more."
      }

      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      setIsTyping(false)
    }, 1500)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category)

    let prompt = ""
    switch (category) {
      case "time-off":
        prompt = "I need to request time off"
        break
      case "payroll":
        prompt = "When is the next payday?"
        break
      case "onboarding":
        prompt = "How do I onboard a new employee?"
        break
      case "performance":
        prompt = "How do I conduct a performance review?"
        break
      case "benefits":
        prompt = "What benefits are available to me?"
        break
    }

    setInput(prompt)
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Assistant</h1>
        <p className="text-muted-foreground">Your virtual HR assistant powered by AI</p>
      </div>

      <div className="grid flex-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-2 flex flex-col">
          <Card className="flex-1 flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle>Chat with HR Assistant</CardTitle>
              <CardDescription>Ask questions about HR policies, benefits, time off, and more</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              <ScrollArea className="h-[calc(100vh-20rem)]">
                <div className="space-y-4 pr-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`flex max-w-[80%] items-start gap-3 rounded-lg p-3 ${
                          message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}
                      >
                        {message.role === "assistant" && (
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="/placeholder.svg?height=32&width=32" alt="AI" />
                            <AvatarFallback>AI</AvatarFallback>
                          </Avatar>
                        )}
                        <div>
                          <div className="text-sm">{message.content}</div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            {message.timestamp.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="flex max-w-[80%] items-start gap-3 rounded-lg bg-muted p-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="/placeholder.svg?height=32&width=32" alt="AI" />
                          <AvatarFallback>AI</AvatarFallback>
                        </Avatar>
                        <div className="flex gap-1">
                          <span className="animate-bounce">●</span>
                          <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>
                            ●
                          </span>
                          <span className="animate-bounce" style={{ animationDelay: "0.4s" }}>
                            ●
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter className="pt-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSendMessage()
                }}
                className="flex w-full items-center gap-2"
              >
                <Button type="button" size="icon" variant="outline" className="shrink-0">
                  <Paperclip className="h-4 w-4" />
                  <span className="sr-only">Attach file</span>
                </Button>
                <Button type="button" size="icon" variant="outline" className="shrink-0">
                  <Mic className="h-4 w-4" />
                  <span className="sr-only">Use microphone</span>
                </Button>
                <Textarea
                  placeholder="Type your message..."
                  className="min-h-10 flex-1 resize-none"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <Button type="submit" size="icon" className="shrink-0">
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Send message</span>
                </Button>
              </form>
            </CardFooter>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common HR tasks and questions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleCategorySelect("time-off")}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Request time off
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleCategorySelect("payroll")}
              >
                <DollarSign className="mr-2 h-4 w-4" />
                Payroll information
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleCategorySelect("onboarding")}
              >
                <Users className="mr-2 h-4 w-4" />
                Onboard new employee
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleCategorySelect("performance")}
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Performance reviews
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleCategorySelect("benefits")}
              >
                <FileText className="mr-2 h-4 w-4" />
                Benefits information
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>FAQ</CardTitle>
              <CardDescription>Frequently asked questions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">How do I request time off?</h3>
                <p className="text-sm text-muted-foreground">
                  You can request time off by navigating to the Time Off section in the dashboard and clicking on
                  'Request Time Off'.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">When is the next payday?</h3>
                <p className="text-sm text-muted-foreground">
                  Paydays are on the 15th and last day of each month. If these days fall on a weekend or holiday,
                  payment will be made on the preceding business day.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">How do I update my personal information?</h3>
                <p className="text-sm text-muted-foreground">
                  You can update your personal information by going to your profile settings and clicking on 'Edit
                  Profile'.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

