'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { useNotifications } from '@/contexts/notification-provider'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const emailProviderSchema = z.object({
  provider: z.enum(['gmail', 'outlook']),
  email: z.string().email('Please enter a valid email address'),
})

const companyFormSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  address: z.string().min(5, 'Please enter a valid address'),
  website: z.string().url('Please enter a valid website URL'),
})

const notificationPreferencesSchema = z.object({
  emailNotifications: z.boolean(),
  inAppNotifications: z.boolean(),
  systemUpdates: z.boolean(),
  taskNotifications: z.boolean(),
  employeeUpdates: z.boolean(),
})

export function GeneralSettings() {
  const { toast } = useToast()
  const { preferences, updatePreferences } = useNotifications()
  const [isLoading, setIsLoading] = useState(false)
  const [connectedProvider, setConnectedProvider] = useState<{ provider: string; email: string } | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    // Check for connected email provider
    const checkEmailProvider = async () => {
      const { data, error } = await supabase
        .from('email_provider_tokens')
        .select('provider, user_email')
        .single()

      if (!error && data) {
        setConnectedProvider({
          provider: data.provider,
          email: data.user_email
        })
      }
    }

    checkEmailProvider()
  }, [supabase])

  const companyForm = useForm<z.infer<typeof companyFormSchema>>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      companyName: '',
      email: '',
      phone: '',
      address: '',
      website: '',
    },
  })

  const notificationForm = useForm<z.infer<typeof notificationPreferencesSchema>>({
    resolver: zodResolver(notificationPreferencesSchema),
    defaultValues: {
      emailNotifications: preferences.email_notifications,
      inAppNotifications: preferences.in_app_notifications,
      systemUpdates: preferences.email_preferences?.systemUpdates ?? true,
      taskNotifications: preferences.email_preferences?.taskNotifications ?? true,
      employeeUpdates: preferences.email_preferences?.employeeUpdates ?? true,
    },
  })

  async function onCompanySubmit(values: z.infer<typeof companyFormSchema>) {
    try {
      setIsLoading(true)
      // TODO: Implement company info update logic
      toast({
        title: 'Success',
        description: 'Company information updated successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update company information',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function onNotificationSubmit(values: z.infer<typeof notificationPreferencesSchema>) {
    try {
      setIsLoading(true)
      await updatePreferences({
        email_notifications: values.emailNotifications,
        in_app_notifications: values.inAppNotifications,
        email_preferences: {
          systemUpdates: values.systemUpdates,
          taskNotifications: values.taskNotifications,
          employeeUpdates: values.employeeUpdates,
        },
      })
      toast({
        title: 'Success',
        description: 'Notification preferences updated successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update notification preferences',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const [emailProvider, setEmailProvider] = useState<'gmail' | 'outlook' | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  const handleEmailConnect = async (provider: 'gmail' | 'outlook') => {
    setIsConnecting(true)
    try {
      // Initialize OAuth flow based on provider
      const authUrl = `/api/auth/${provider}`
      window.location.href = authUrl
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to connect to ${provider}`,
        variant: 'destructive',
      })
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Email Integration</CardTitle>
          <CardDescription>
            Connect your email provider to enable email notifications.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {connectedProvider ? (
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium capitalize">{connectedProvider.provider}</p>
                  <p className="text-sm text-gray-500">{connectedProvider.email}</p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleEmailDisconnect}
                >
                  Disconnect
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Select
                  value={emailProvider || undefined}
                  onValueChange={(value: 'gmail' | 'outlook') => setEmailProvider(value)}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gmail">Gmail</SelectItem>
                    <SelectItem value="outlook">Outlook</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => emailProvider && handleEmailConnect(emailProvider)}
                  disabled={!emailProvider || isConnecting}
                >
                  {isConnecting ? 'Connecting...' : 'Connect'}
                </Button>
              </div>
            )}
            <FormDescription>
              Connect your email provider to enable sending notifications via email.
              Your credentials are securely stored and can be revoked at any time.
            </FormDescription>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>
            Update your company's basic information and contact details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...companyForm}>
            <form onSubmit={companyForm.handleSubmit(onCompanySubmit)} className="space-y-4">
              <FormField
                control={companyForm.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter company name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={companyForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter company email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={companyForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="Enter company phone" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={companyForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter company address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={companyForm.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input type="url" placeholder="Enter company website" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                Save Changes
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>
            Manage how you receive notifications and updates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...notificationForm}>
            <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-6">
              <div className="space-y-4">
                <FormField
                  control={notificationForm.control}
                  name="emailNotifications"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <div>
                        <FormLabel>Email Notifications</FormLabel>
                        <FormDescription>Receive notifications via email</FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={!connectedProvider}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={notificationForm.control}
                  name="inAppNotifications"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <div>
                        <FormLabel>In-App Notifications</FormLabel>
                        <FormDescription>Show notifications within the application</FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Email Notification Types</h3>
                <div className="space-y-4 border rounded-lg p-4">

              <FormField
                control={notificationForm.control}
                name="emailNotifications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Email Notifications</FormLabel>
                      <FormDescription>
                        Receive notifications via email
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={notificationForm.control}
                name="inAppNotifications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">In-App Notifications</FormLabel>
                      <FormDescription>
                        Receive notifications within the application
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={notificationForm.control}
                name="systemUpdates"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">System Updates</FormLabel>
                      <FormDescription>
                        Receive notifications about system updates and maintenance
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={notificationForm.control}
                name="taskNotifications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Task Notifications</FormLabel>
                      <FormDescription>
                        Receive notifications about task assignments and updates
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={notificationForm.control}
                name="employeeUpdates"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Employee Updates</FormLabel>
                      <FormDescription>
                        Receive notifications about employee-related changes
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                Save Preferences
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}