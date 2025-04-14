"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDistanceToNow } from "date-fns"

interface Notification {
  id: string
  title: string
  description: string
  time: Date
  read: boolean
  user?: {
    name: string
    avatar: string
    initials: string
  }
  type: "mention" | "task" | "system" | "alert"
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "New employee onboarding",
    description: "Sarah Johnson has completed her onboarding process",
    time: new Date(Date.now() - 1000 * 60 * 15),
    read: false,
    user: {
      name: "Sarah Johnson",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "SJ",
    },
    type: "system",
  },
  {
    id: "2",
    title: "Project analysis complete",
    description: "AI has completed analysis for Project X",
    time: new Date(Date.now() - 1000 * 60 * 60 * 2),
    read: false,
    type: "system",
  },
  {
    id: "3",
    title: "You were mentioned",
    description: "Michael Brown mentioned you in a comment on Project Y",
    time: new Date(Date.now() - 1000 * 60 * 60 * 5),
    read: false,
    user: {
      name: "Michael Brown",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "MB",
    },
    type: "mention",
  },
  {
    id: "4",
    title: "Task assigned",
    description: "You have been assigned to review 3 job applications",
    time: new Date(Date.now() - 1000 * 60 * 60 * 24),
    read: true,
    type: "task",
  },
  {
    id: "5",
    title: "ERP Integration successful",
    description: "SAP integration has been successfully completed",
    time: new Date(Date.now() - 1000 * 60 * 60 * 48),
    read: true,
    type: "system",
  },
]

interface NotificationsListProps {
  type: "all" | "mentions" | "tasks"
}

export function NotificationsList({ type }: NotificationsListProps) {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)

  const filteredNotifications = notifications.filter((notification) => {
    if (type === "all") return true
    if (type === "mentions") return notification.type === "mention"
    if (type === "tasks") return notification.type === "task"
    return true
  })

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  if (filteredNotifications.length === 0) {
    return <div className="p-8 text-center text-muted-foreground">No notifications to display</div>
  }

  return (
    <ScrollArea className="h-[300px]">
      <div className="divide-y">
        {filteredNotifications.map((notification) => (
          <div
            key={notification.id}
            className={`flex items-start gap-4 p-4 ${notification.read ? "" : "bg-muted/50"}`}
            onClick={() => markAsRead(notification.id)}
          >
            {notification.user ? (
              <Avatar className="h-9 w-9">
                <AvatarImage src={notification.user.avatar} alt={notification.user.name} />
                <AvatarFallback>{notification.user.initials}</AvatarFallback>
              </Avatar>
            ) : (
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 text-primary"
                >
                  {notification.type === "mention" && <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />}
                  {notification.type === "task" && <path d="M9 11l3 3L22 4" />}
                  {notification.type === "system" && <path d="M22 12h-4l-3 9L9 3l-3 9H2" />}
                  {notification.type === "alert" && (
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  )}
                </svg>
              </div>
            )}
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">{notification.title}</p>
              <p className="text-sm text-muted-foreground">{notification.description}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(notification.time, { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}

