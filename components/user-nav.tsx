"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useEffect, useState } from "react"
import { NotificationBell } from "@/components/notifications/notification-bell"

export function UserNav() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [user, setUser] = useState<{ email: string; name: string; isPlatformAdmin?: boolean } | null>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        // Check if user is a platform admin
        const { data: platformAdmin } = await supabase
          .from('platform_admins')
          .select('id')
          .eq('user_id', authUser.id)
          .maybeSingle()

        // Try to get user profile
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('name, email')
          .eq('user_id', authUser.id)
          .single()

        if (platformAdmin) {
          // For platform admins, use auth user email if no profile exists
          setUser({
            email: authUser.email || '',
            name: profile?.name || 'Platform Admin',
            isPlatformAdmin: true
          })
        } else if (profile) {
          // For regular users with profile
          setUser({
            email: profile.email,
            name: profile.name || 'User',
            isPlatformAdmin: false
          })
        } else {
          // Fallback for users without profile
          setUser({
            email: authUser.email || '',
            name: 'User',
            isPlatformAdmin: false
          })
        }
      }
    }
    getUser()
  }, [supabase])

  return (
    <div className="flex items-center gap-2">
      <NotificationBell />
      <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg?height=32&width=32" alt="@admin" />
            <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user?.name || 'Loading...'}
              {user?.isPlatformAdmin && ' (Admin)'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">{user?.email || ''}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => {
              router.push('/profile')
            }}
          >
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              router.push('/settings')
              router.refresh()
            }}
          >
            Settings
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-600 focus:text-red-600"
          onClick={async () => {
            await supabase.auth.signOut()
            router.push('/login')
            router.refresh()
          }}
        >
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    </div>
  )
}

