'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { format } from 'date-fns'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useNotifications } from '@/contexts/notification-provider'
import { Skeleton } from '@/components/ui/skeleton'
import { Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

type NotificationType = 'info' | 'warning' | 'success' | 'error'

interface NotificationWithType extends Notification {
  type: NotificationType
  timestamp: string
  title: string
}

const NotificationIcon = ({ type }: { type: NotificationType }) => {
  const icons = {
    info: <Info className="w-5 h-5 text-blue-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />
  }
  return icons[type]
}

export default function NotificationsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get('filter') || 'all'
  const [activeTab, setActiveTab] = useState(defaultTab)
  
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotifications()

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    const params = new URLSearchParams(searchParams.toString())
    params.set('filter', value)
    router.push(`?${params.toString()}`)
  }

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'unread') return !notification.isRead
    if (activeTab === 'info') return notification.type === 'info'
    if (activeTab === 'warning') return notification.type === 'warning'
    if (activeTab === 'success') return notification.type === 'success'
    if (activeTab === 'error') return notification.type === 'error'
    return true
  })

  const handleMarkAsRead = (id: string) => {
    markAsRead(id)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Notifications</h1>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllAsRead}>
            Mark all as read
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="all">
            All
            <Badge variant="secondary" className="ml-2">
              {notifications.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="unread">
            Unread
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="info">Info</TabsTrigger>
          <TabsTrigger value="warning">Warning</TabsTrigger>
          <TabsTrigger value="success">Success</TabsTrigger>
          <TabsTrigger value="error">Error</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center space-y-2">
                  <p className="text-lg font-medium">No notifications</p>
                  <p className="text-sm text-muted-foreground">
                    {activeTab === 'unread'
                      ? "You're all caught up! No unread notifications."
                      : "You don't have any notifications yet."}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`transition-colors ${
                  !notification.isRead ? 'bg-muted/50' : ''
                }`}
              >
                <CardHeader className="flex flex-row items-start space-y-0 gap-4 pb-2">
                  <NotificationIcon type={notification.type} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{notification.title}</CardTitle>
                      <time className="text-sm text-muted-foreground">
                        {notification.timestamp}
                      </time>
                    </div>
                    <CardDescription className="mt-1.5">
                      {notification.message}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="flex justify-end pt-2">
                  {!notification.isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      Mark as read
                    </Button>
                  )}
                  {notification.link && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(notification.link!)}
                    >
                      View details
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
