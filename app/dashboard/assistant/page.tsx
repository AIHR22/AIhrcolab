"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import {
  Send,
  Mic,
  Paperclip,
  Bot,
  User,
  Clock,
  Calendar,
  FileText,
  CheckCircle,
  AlertCircle,
  Info,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Mock chat history
const initialChatHistory = [
  {
    id: "1",
    sender: "bot",
    message: "Hello! I'm your AI-powered HR Assistant. How can I help you today?",
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
]

// Mock suggested queries
const suggestedQueries = [
  "How many vacation days do I have left?",
  "What's the process for requesting time off?",
  "When is the next performance review cycle?",
  "How do I update my tax withholding?",
  "What benefits am I eligible for?",
  "How do I submit an expense report?",
]

// Mock tasks
const initialTasks = [
  {
    id: "1",
    title: "Complete performance review for Sarah",
    dueDate: "2023-12-20",
    priority: "high",
    completed: false,
  },
  {
    id: "2",
    title: "Approve time off requests",
    dueDate: "2023-12-18",
    priority: "medium",
    completed: false,
  },
  {
    id: "3",
    title: "Review new hire paperwork",
    dueDate: "2023-12-15",
    priority: "low",
    completed: true,
  },
]

export default function AssistantPage() {
  const [chatHistory, setChatHistory] = useState(initialChatHistory)
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [tasks, setTasks] = useState(initialTasks)
  const [activeTab, setActiveTab] = useState("chat")
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatHistory])

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return

    // Add user message to chat
    const userMessage = {
      id: Date.now().toString(),
      sender: "user",
      message: inputMessage,
      timestamp: new Date().toISOString(),
    }

    setChatHistory([...chatHistory, userMessage])
    setInputMessage("")
    setIsTyping(true)

    // Simulate AI response after a delay
    setTimeout(() => {
      let botResponse

      // Simple response logic based on keywords
      if (inputMessage.toLowerCase().includes("vacation") || inputMessage.toLowerCase().includes("time off")) {
        botResponse = {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          message:
            "You have 15 vacation days remaining for this year. Would you like me to help you submit a time off request?",
          timestamp: new Date().toISOString(),
        }
      } else if (inputMessage.toLowerCase().includes("performance") || inputMessage.toLowerCase().includes("review")) {
        botResponse = {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          message:
            "The next performance review cycle begins on January 15, 2024. I've added a reminder to your calendar. Is there anything specific you'd like to prepare for your review?",
          timestamp: new Date().toISOString(),
        }
      } else if (inputMessage.toLowerCase().includes("benefits") || inputMessage.toLowerCase().includes("insurance")) {
        botResponse = {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          message:
            "You're eligible for the following benefits: health insurance, dental insurance, vision insurance, 401(k) with 4% match, and 20 days of PTO per year. Would you like details on any specific benefit?",
          timestamp: new Date().toISOString(),
        }
      } else {
        botResponse = {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          message:
            "I'll help you with that. As your AI HR assistant, I'm here to answer any HR-related questions and help with tasks. Is there anything specific you'd like to know?",
          timestamp: new Date().toISOString(),
        }
      }

      setChatHistory([...chatHistory, userMessage, botResponse])
      setIsTyping(false)
    }, 1500)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleSuggestedQuery = (query: string) => {
    setInputMessage(query)
  }

  const toggleTaskCompletion = (taskId: string) => {
    setTasks(tasks.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task)))
  }

  const getPriorityBadge = (priority: string) => {
    if (priority === "high") {
      return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20">High</Badge>
    } else if (priority === "medium") {
      return <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-yellow-500/20">Medium</Badge>
    } else {
      return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">Low</Badge>
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">HR Assistant</h1>
        <p className="text-muted-foreground">
          Your AI-powered HR assistant for all your HR-related questions and tasks.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <Tabs defaultValue="chat" onValueChange={setActiveTab}>
            <CardHeader className="px-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="chat">Chat</TabsTrigger>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent className="p-0">
              <TabsContent value="chat" className="m-0">
                <div className="h-[500px] flex flex-col">
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {chatHistory.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`flex gap-3 max-w-[80%] ${message.sender === "user" ? "flex-row-reverse" : ""}`}>
                          <Avatar className="h-8 w-8">
                            {message.sender === "bot" ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
                            <AvatarFallback>{message.sender === "bot" ? "AI" : "You"}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div
                              className={`rounded-lg p-3 ${
                                message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                              }`}
                            >
                              {message.message}
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">
                              {new Date(message.timestamp).toLocaleTimeString([], {
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
                        <div className="flex gap-3 max-w-[80%]">
                          <Avatar className="h-8 w-8">
                            <Bot className="h-5 w-5" />
                            <AvatarFallback>AI</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="rounded-lg p-3 bg-muted">
                              <div className="flex items-center gap-1">
                                <div className="h-2 w-2 rounded-full bg-current animate-bounce" />
                                <div className="h-2 w-2 rounded-full bg-current animate-bounce [animation-delay:0.2s]" />
                                <div className="h-2 w-2 rounded-full bg-current animate-bounce [animation-delay:0.4s]" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                  <div className="border-t p-4">
                    <div className="mb-4 flex flex-wrap gap-2">
                      {suggestedQueries.map((query, index) => (
                        <Button key={index} variant="outline" size="sm" onClick={() => handleSuggestedQuery(query)}>
                          {query}
                        </Button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type your message..."
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-1"
                      />
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="icon">
                              <Paperclip className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Attach a file</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="icon">
                              <Mic className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Voice input</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <Button onClick={handleSendMessage}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="tasks" className="m-0">
                <div className="h-[500px] overflow-y-auto p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Your Tasks</h3>
                    <Button size="sm">Add Task</Button>
                  </div>
                  <div className="space-y-3">
                    {tasks.map((task) => (
                      <div
                        key={task.id}
                        className={`flex items-center gap-3 p-3 border rounded-lg hover:bg-accent transition-colors ${
                          task.completed ? "opacity-60" : ""
                        }`}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-6 w-6 rounded-full ${task.completed ? "bg-primary text-primary-foreground" : ""}`}
                          onClick={() => toggleTaskCompletion(task.id)}
                        >
                          {task.completed && <CheckCircle className="h-4 w-4" />}
                        </Button>
                        <div className="flex-1">
                          <p className={`font-medium ${task.completed ? "line-through" : ""}`}>{task.title}</p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>
                            {getPriorityBadge(task.priority)}
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common HR tasks and requests</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                Request Time Off
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                Submit Expense
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Clock className="mr-2 h-4 w-4" />
                Log Work Hours
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>HR Updates</CardTitle>
              <CardDescription>Latest announcements and news</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Info className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium">Open Enrollment</p>
                  <p className="text-sm text-muted-foreground">
                    Benefits enrollment for 2024 is now open. Deadline is December 15.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <p className="font-medium">Holiday Schedule</p>
                  <p className="text-sm text-muted-foreground">
                    The office will be closed December 24-26 for the holidays.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                </div>
                <div>
                  <p className="font-medium">Performance Reviews</p>
                  <p className="text-sm text-muted-foreground">
                    Q4 performance reviews begin January 15. Start preparing now.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
