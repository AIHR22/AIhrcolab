'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useToast } from '@/hooks/use-toast'

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'success' | 'error'
  timestamp: string
  isRead: boolean
  link?: string
}

interface NotificationPreferences {
  email_notifications: boolean
  in_app_notifications: boolean
  email_preferences?: {
    systemUpdates: boolean
    taskNotifications: boolean
    employeeUpdates: boolean
  }
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  updatePreferences: (preferences: Partial<NotificationPreferences>) => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | null>(null)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_notifications: true,
    in_app_notifications: true,
    email_preferences: {
      systemUpdates: true,
      taskNotifications: true,
      employeeUpdates: true,
    },
  })
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  useEffect(() => {
    const fetchNotifications = async () => {
      const { data: notificationsData, error: notificationsError } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })

      if (notificationsError) {
        console.error('Error fetching notifications:', notificationsError)
        return
      }

      const { data: preferencesData, error: preferencesError } = await supabase
        .from('notification_preferences')
        .select('*')
        .single()

      if (!preferencesError && preferencesData) {
        setPreferences(preferencesData)
      }

      setNotifications(notificationsData || [])
    }

    fetchNotifications()

    // Subscribe to new notifications
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
      }, async (payload) => {
        setNotifications(prev => [payload.new as Notification, ...prev])
        
        // Handle in-app notifications
        if (preferences.in_app_notifications) {
          toast({
            title: payload.new.title,
            description: payload.new.message,
          })
        }

        // Handle email notifications
        if (preferences.email_notifications) {
          try {
            const { data: userData } = await supabase.auth.getUser()
            if (userData?.user?.email) {
              const emailService = (await import('@/lib/email-service')).emailService
              await emailService.sendEmail({
                to: userData.user.email,
                subject: payload.new.title,
                html: emailService.templates.notification({
                  title: payload.new.title,
                  message: payload.new.message,
                }),
              })
            }
          } catch (error) {
            console.error('Error sending email notification:', error)
          }
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, toast, preferences.in_app_notifications])

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, isRead: true }))
    )
  }

  const updatePreferences = async (newPreferences: Partial<NotificationPreferences>) => {
    const { error } = await supabase
      .from('notification_preferences')
      .upsert({
        ...preferences,
        ...newPreferences,
      })

    if (error) {
      console.error('Error updating notification preferences:', error)
      return
    }

    setPreferences(prev => ({ ...prev, ...newPreferences }))
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        updatePreferences,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}