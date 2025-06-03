'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

interface Profile {
  id: string
  name: string
  email: string
  role: string
  created_at: string
  isPlatformAdmin?: boolean
}

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  useEffect(() => {
    const getProfile = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (!authUser) throw new Error('Not authenticated')

        // Check if user is a platform admin first
        const { data: platformAdmin, error: platformAdminError } = await supabase
          .from('platform_admins')
          .select(`
            id,
            platform_admin_profiles (
              id,
              email,
              full_name,
              avatar_url,
              phone,
              title,
              department,
              created_at
            )
          `)
          .eq('user_id', authUser.id)
          .maybeSingle()

        if (platformAdminError) {
          throw new Error('Error checking platform admin status')
        }

        // If they are a platform admin
        if (platformAdmin) {
          if (!platformAdmin.platform_admin_profiles) {
            throw new Error('Platform admin profile not found')
          }

          const adminProfile = platformAdmin.platform_admin_profiles
          setProfile({
            id: adminProfile.id,
            email: adminProfile.email,
            name: adminProfile.full_name,
            role: 'platform_admin',
            created_at: new Date(adminProfile.created_at).toLocaleDateString(),
            isPlatformAdmin: true
          })
          setLoading(false)
          return
        }

        // If not a platform admin, check user profile
        const { data: userProfile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', authUser.id)
          .single()

        if (profileError) {
          throw new Error('User profile not found')
        }

        if (!userProfile) {
          throw new Error('User profile not found')
        }

        setProfile({
          ...userProfile,
          created_at: new Date(userProfile.created_at).toLocaleDateString(),
          isPlatformAdmin: false
        })
      } catch (error) {
        console.error('Error loading profile:', error)
        const errorMessage = error instanceof Error ? error.message : 'Failed to load profile'
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive'
        })
      } finally {
        setLoading(false)
      }
    }
    getProfile()
  }, [supabase, toast])

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    setUpdating(true)
    try {
      if (profile.isPlatformAdmin) {
        // Update platform admin profile
        const { error } = await supabase
          .from('platform_admin_profiles')
          .update({
            full_name: profile.name,
            // Add other fields as needed
          })
          .eq('user_id', profile.id)

        if (error) throw error
      } else {
        // Update regular user profile
        const { error } = await supabase
          .from('user_profiles')
          .update({ name: profile.name })
          .eq('user_id', profile.id)

        if (error) throw error
      }

      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      })
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive'
      })
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Button
          variant="ghost"
          className="flex items-center gap-2"
          onClick={() => router.push('/dashboard')}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Manage your profile information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={updateProfile} className="space-y-8">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src="/placeholder.svg" alt={profile?.name} />
                <AvatarFallback>{profile?.name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">
                  {profile?.name}
                  {profile?.isPlatformAdmin && ' (Platform Admin)'}
                </h2>
                <p className="text-sm text-muted-foreground">{profile?.email}</p>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={profile?.name || ''}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, name: e.target.value } : null)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={profile?.email || ''}
                  disabled
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  value={profile?.role || ''}
                  disabled
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="joined">Joined</Label>
                <Input
                  id="joined"
                  value={profile?.created_at || ''}
                  disabled
                />
              </div>
            </div>

            <Button type="submit" disabled={updating}>
              {updating ? 'Updating...' : 'Update Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}