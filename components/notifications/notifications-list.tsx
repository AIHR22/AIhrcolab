"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDistanceToNow } from "date-fns"

import { useNotifications } from '@/contexts/notification-provider'

interface Notification {
  id: string
  title: string
  message: string
  created_at: string
  read: boolean
  type: "mention" | "task" | "system" | "alert"
  user_id: string
  entity_id?: string
  entity_type?: 'employee' | 'project' | 'task' | 'workflow'
}

interface NotificationsListProps {
  type: "all" | "mentions" | "tasks"
}

export function NotificationsList({ type }: NotificationsListProps) {
  const { notifications, markAsRead } = useNotifications()

  const filteredNotifications = notifications.filter((notification) => {
    if (type === "all") return true
    if (type === "mentions") return notification.type === "mention"
    if (type === "tasks") return notification.type === "task"
    return true
  })

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
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">{notification.title}</p>
              <p className="text-sm text-muted-foreground">{notification.message}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}

