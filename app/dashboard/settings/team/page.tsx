'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useTenant } from '@/contexts/tenant-context'
import { useToast } from '@/hooks/use-toast'

interface TeamMember {
  id: string
  email: string
  name: string
  role: string
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [newMemberEmail, setNewMemberEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClientComponentClient()
  const { currentTenantId } = useTenant()
  const { toast } = useToast()

  useEffect(() => {
    fetchTeamMembers()
  }, [currentTenantId])

  const fetchTeamMembers = async () => {
    if (!currentTenantId) return

    try {
      const { data: tenantUsers, error } = await supabase
        .from('tenant_users')
        .select(`
          id,
          user_profiles:user_id (email, name),
          role
        `)
        .eq('tenant_id', currentTenantId)

      if (error) throw error

      const formattedMembers = tenantUsers.map((user: any) => ({
        id: user.id,
        email: user.user_profiles.email,
        name: user.user_profiles.name,
        role: user.role
      }))

      setMembers(formattedMembers)
    } catch (error) {
      console.error('Error fetching team members:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch team members',
        variant: 'destructive'
      })
    }
  }

  const addTeamMember = async () => {
    if (!currentTenantId || !newMemberEmail.trim()) return

    setIsLoading(true)
    try {
      // First check if user exists
      const { data: userData, error: userError } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('email', newMemberEmail.toLowerCase())
        .single()

      if (userError) {
        toast({
          title: 'Error',
          description: 'User not found. Please ensure the email is correct.',
          variant: 'destructive'
        })
        return
      }

      // Add user to tenant
      const { error: addError } = await supabase
        .from('tenant_users')
        .insert({
          tenant_id: currentTenantId,
          user_id: userData.user_id,
          role: 'sub_user'
        })

      if (addError) throw addError

      toast({
        title: 'Success',
        description: 'Team member added successfully'
      })

      setNewMemberEmail('')
      fetchTeamMembers()
    } catch (error) {
      console.error('Error adding team member:', error)
      toast({
        title: 'Error',
        description: 'Failed to add team member',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const removeTeamMember = async (memberId: string) => {
    if (!currentTenantId) return

    try {
      const { error } = await supabase
        .from('tenant_users')
        .delete()
        .eq('id', memberId)

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Team member removed successfully'
      })

      fetchTeamMembers()
    } catch (error) {
      console.error('Error removing team member:', error)
      toast({
        title: 'Error',
        description: 'Failed to remove team member',
        variant: 'destructive'
      })
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Team Management</CardTitle>
          <CardDescription>Add or remove team members from your organization.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="email">Add Team Member</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                />
              </div>
              <Button
                className="mt-6"
                onClick={addTeamMember}
                disabled={isLoading || !newMemberEmail.trim()}
              >
                {isLoading ? 'Adding...' : 'Add Member'}
              </Button>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Current Team Members</h3>
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-gray-500">{member.email}</p>
                    <p className="text-xs text-gray-400 capitalize">{member.role}</p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeTeamMember(member.id)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}