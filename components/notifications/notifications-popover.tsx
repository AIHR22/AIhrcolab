"use client"

import { useState } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NotificationsList } from "@/components/notifications/notifications-list"
import { Badge } from "@/components/ui/badge"

export function NotificationsPopover() {
  const [open, setOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(3)

  const markAllAsRead = () => {
    setUnreadCount(0)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-[1.2rem] w-[1.2rem]" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]"
            >
              {unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[380px] p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </div>
        <Tabs defaultValue="all">
          <TabsList className="w-full grid grid-cols-3 rounded-none border-b">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="mentions">Mentions</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="p-0">
            <NotificationsList type="all" />
          </TabsContent>
          <TabsContent value="mentions" className="p-0">
            <NotificationsList type="mentions" />
          </TabsContent>
          <TabsContent value="tasks" className="p-0">
            <NotificationsList type="tasks" />
          </TabsContent>
        </Tabs>
        <div className="p-2 border-t text-center">
          <Button variant="ghost" size="sm" className="w-full" onClick={() => setOpen(false)}>
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

