import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface NotificationData {
  userId: string
  title: string
  message: string
  type: 'task' | 'mention' | 'system' | 'alert'
  entityId?: string
  entityType?: 'employee' | 'project' | 'task' | 'workflow'
}

export async function sendNotification(data: NotificationData) {
  try {
    const response = await fetch('/api/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        created_at: new Date().toISOString(),
        read: false
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to send notification')
    }

    return await response.json()
  } catch (error) {
    console.error('Error sending notification:', error)
    throw error
  }
}

export async function getNotifications(userId: string) {
  try {
    const response = await fetch(`/api/notifications?userId=${userId}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch notifications')
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching notifications:', error)
    throw error
  }
}

export function subscribeToNotifications(userId: string, onNotification: (notification: any) => void) {
  const supabase = createClientComponentClient()

  const channel = supabase
    .channel(`notifications_${userId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${userId}`,
    }, (payload) => {
      onNotification(payload.new)
    })
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${userId}`,
    }, (payload) => {
      onNotification(payload.new)
    })
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}