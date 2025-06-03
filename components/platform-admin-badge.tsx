"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Shield } from "lucide-react"
import { useAuth } from "@/contexts/auth-provider"
import { makePostgrestRequest } from "@/lib/supabase/postgrest"

export function PlatformAdminBadge() {
  const { user } = useAuth()
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false)

  useEffect(() => {
    const checkPlatformAdmin = async () => {
      if (!user?.id) return
      
      try {
        const data = await makePostgrestRequest(
          'GET',
          `platform_admins?user_id=eq.${user.id}&select=id`
        )
        
        setIsPlatformAdmin(Array.isArray(data) && data.length > 0)
      } catch (error) {
        console.error('Error checking platform admin status:', error)
        setIsPlatformAdmin(false)
      }
    }

    checkPlatformAdmin()
  }, [user?.id])

  if (!isPlatformAdmin) return null

  return (
    <Badge variant="secondary" className="ml-2 flex items-center gap-1">
      <Shield className="h-3 w-3" />
      Super Admin
    </Badge>
  )
} 