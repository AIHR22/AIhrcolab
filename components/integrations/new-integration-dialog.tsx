"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  system_type: z.string().min(1, "Please select a system type"),
  auth_type: z.string().min(1, "Please select an authentication type"),
  sync_frequency: z.string().min(1, "Please select a sync frequency"),
  is_active: z.boolean().default(false),
  // The config is a nested object with different shapes depending on system_type and auth_type
  config: z.record(z.string(), z.any()),
})

type SystemConfig = {
  value: string
  label: string
  authTypes: string[]
  configFields: Record<string, {
    type: string
    label: string
    placeholder: string
    required: boolean
    description?: string
  }>
}

interface NewIntegrationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (data: any) => void
}

export function NewIntegrationDialog({ open, onOpenChange, onSuccess }: NewIntegrationDialogProps) {
  const [step, setStep] = useState(1)
  const [systems, setSystems] = useState([
    { value: 'workday', label: 'Workday' },
    { value: 'sap', label: 'SAP' },
    { value: 'oracle', label: 'Oracle' },
    { value: 'dynamics', label: 'Microsoft Dynamics' },
    { value: 'csv', label: 'CSV/File Import' }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [testingConnection, setTestingConnection] = useState(false)
  const [testResult, setTestResult] = useState<{success: boolean, message?: string} | null>(null)
  const { toast } = useToast()

  // Define configuration fields for each system type
  const systemConfigs: Record<string, SystemConfig> = {
    sap: {
      value: 'sap',
      label: 'SAP SuccessFactors',
      authTypes: ['oauth2'],
      configFields: {
        base_url: {
          type: 'text',
          label: 'API Base URL',
          placeholder: 'https://api.successfactors.com',
          required: true
        },
        token_url: {
          type: 'text',
          label: 'Token URL',
          placeholder: 'https://api.successfactors.com/oauth/token',
          required: true
        },
        client_id: {
          type: 'text',
          label: 'Client ID',
          placeholder: 'Enter client ID',
          required: true
        },
        client_secret: {
          type: 'password',
          label: 'Client Secret',
          placeholder: 'Enter client secret',
          required: true
        },
        api_version: {
          type: 'text',
          label: 'API Version',
          placeholder: 'v2',
          required: false,
          description: 'The API version to use. Default: v2'
        }
      }
    },
    workday: {
      value: 'workday',
      label: 'Workday',
      authTypes: ['basic'],
      configFields: {
        tenant_url: {
          type: 'text',
          label: 'Tenant URL',
          placeholder: 'https://tenant.workday.com',
          required: true
        },
        client_id: {
          type: 'text',
          label: 'Client ID',
          placeholder: 'Enter client ID',
          required: true
        },
        client_secret: {
          type: 'password',
          label: 'Client Secret',
          placeholder: 'Enter client secret',
          required: true
        },
        api_version: {
          type: 'text',
          label: 'API Version',
          placeholder: 'v1',
          required: false,
          description: 'The API version to use. Default: v1'
        }
      }
    },
    generic_rest: {
      value: 'generic_rest',
      label: 'Generic REST API',
      authTypes: ['basic', 'api_key', 'oauth2'],
      configFields: {
        base_url: {
          type: 'text',
          label: 'API Base URL',
          placeholder: 'https://api.example.com',
          required: true
        },
        auth_type: {
          type: 'select',
          label: 'Authentication Type',
          placeholder: 'Select authentication type',
          required: true
        },
        username: {
          type: 'text',
          label: 'Username',
          placeholder: 'Enter username',
          required: false
        },
        password: {
          type: 'password',
          label: 'Password',
          placeholder: 'Enter password',
          required: false
        },
        api_key: {
          type: 'password',
          label: 'API Key',
          placeholder: 'Enter API key',
          required: false
        },
        api_key_name: {
          type: 'text',
          label: 'API Key Name',
          placeholder: 'X-API-Key',
          required: false,
          description: 'The name of the header or parameter for the API key'
        },
        api_key_in: {
          type: 'select',
          label: 'API Key Location',
          placeholder: 'header',
          required: false,
          description: 'Where to include the API key'
        },
        access_token: {
          type: 'password',
          label: 'Access Token',
          placeholder: 'Enter OAuth access token',
          required: false
        },
        employees_endpoint: {
          type: 'text',
          label: 'Employees Endpoint',
          placeholder: '/employees',
          required: true
        },
        departments_endpoint: {
          type: 'text',
          label: 'Departments Endpoint',
          placeholder: '/departments',
          required: true
        },
        response_path: {
          type: 'text',
          label: 'Response Data Path',
          placeholder: 'data.results',
          required: false,
          description: 'The path to the data in the response (e.g., data.results)'
        }
      }
    }
  }

  // Load available system types
  useEffect(() => {
    const loadSystems = async () => {
      try {
        const response = await fetch("/api/integrations?systems=true")
        if (!response.ok) {
          throw new Error("Failed to load system types")
        }
        const data = await response.json()
        setSystems(data)
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error loading system types",
          description: error.message,
        })
      }
    }

    if (open) {
      loadSystems()
    }
  }, [open, toast])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      system_type: "",
      auth_type: "",
      sync_frequency: "daily",
      is_active: false,
      config: {}
    },
  })

  // Reset form when dialog is opened/closed
  useEffect(() => {
    if (!open) {
      form.reset()
      setStep(1)
      setTestResult(null)
    }
  }, [open, form])

  // Update config fields when system_type changes
  const selectedSystemType = form.watch("system_type")
  const selectedAuthType = form.watch("auth_type")

  useEffect(() => {
    if (selectedSystemType) {
      const systemConfig = systemConfigs[selectedSystemType]
      if (systemConfig) {
        // Set default auth type if only one is available
        if (systemConfig.authTypes.length === 1) {
          form.setValue("auth_type", systemConfig.authTypes[0])
        }
      }
    }
  }, [selectedSystemType, form])

  // Test the connection
  const testConnection = async () => {
    try {
      setTestingConnection(true)
      setTestResult(null)

      // Validate form data
      await form.trigger(["system_type", "auth_type", "config"])
      if (!form.formState.isValid) {
        return
      }

      const formData = form.getValues()
      const testData = {
        system_type: formData.system_type,
        auth_type: formData.auth_type,
        config: formData.config
      }

      const response = await fetch("/api/integrations?action=test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testData),
      })

      const result = await response.json()
      setTestResult(result)

      if (!result.success) {
        toast({
          variant: "destructive",
          title: "Connection failed",
          description: result.message || "Could not connect to the system",
        })
      } else {
        toast({
          title: "Connection successful",
          description: result.message || "Successfully connected to the system",
        })
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error testing connection",
        description: error.message,
      })
    } finally {
      setTestingConnection(false)
    }
  }

  // Handle form submission
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true)

      // Get default field mappings for this system type
      const employeeMappingsResponse = await fetch("/api/integrations?action=mappings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          system_type: data.system_type,
          entity_type: "employee"
        }),
      })

      const departmentMappingsResponse = await fetch("/api/integrations?action=mappings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          system_type: data.system_type,
          entity_type: "department"
        }),
      })

      const employeeMappings = await employeeMappingsResponse.json()
      const departmentMappings = await departmentMappingsResponse.json()

      // Submit the integration configuration
      const response = await fetch("/api/integrations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          fieldMappings: [...employeeMappings, ...departmentMappings]
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create integration")
      }

      const result = await response.json()
      onSuccess(result)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error creating integration",
        description: error.message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Get configuration fields for the selected system type
  const getConfigFields = () => {
    if (!selectedSystemType) return []

    const systemConfig = systemConfigs[selectedSystemType]
    if (!systemConfig) return []

    // Filter fields based on auth type for generic REST API
    if (selectedSystemType === 'generic_rest') {
      const fields = Object.entries(systemConfig.configFields).filter(([key, field]) => {
        if (key === 'auth_type') return false // Skip this as it's already in the main form
        
        // Show username/password only for basic auth
        if (['username', 'password'].includes(key)) {
          return selectedAuthType === 'basic'
        }
        
        // Show API key fields only for api_key auth
        if (['api_key', 'api_key_name', 'api_key_in'].includes(key)) {
          return selectedAuthType === 'api_key'
        }
        
        // Show access token only for oauth2
        if (key === 'access_token') {
          return selectedAuthType === 'oauth2'
        }
        
        return true
      })
      
      return fields
    }
    
    return Object.entries(systemConfig.configFields)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Integration</DialogTitle>
          <DialogDescription>
            Connect to your enterprise systems to sync employee and department data.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="basics" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basics" disabled={step !== 1}>
                  1. System Details
                </TabsTrigger>
                <TabsTrigger value="connection" disabled={step !== 2}>
                  2. Connection Setup
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basics" className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Integration Name</FormLabel>
                      <FormControl>
                        <Input placeholder="E.g., Company HR System" {...field} />
                      </FormControl>
                      <FormDescription>
                        A friendly name to identify this integration
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="system_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>System Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select system type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {systems.map((system) => (
                            <SelectItem key={system.value} value={system.value}>
                              {system.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        The type of system you want to connect to
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedSystemType === 'generic_rest' && (
                  <FormField
                    control={form.control}
                    name="auth_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Authentication Type</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select authentication type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="basic">Basic Authentication</SelectItem>
                            <SelectItem value="api_key">API Key</SelectItem>
                            <SelectItem value="oauth2">OAuth 2.0</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          How to authenticate with the API
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="sync_frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sync Frequency</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="hourly">Hourly</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="manual">Manual Only</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        How often to sync data from this system
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="button"
                  className="w-full mt-4"
                  onClick={() => {
                    form.trigger(["name", "system_type", "sync_frequency"])
                    if (
                      form.formState.errors.name ||
                      form.formState.errors.system_type ||
                      form.formState.errors.sync_frequency
                    ) {
                      return
                    }
                    setStep(2)
                    document.querySelector('[data-value="connection"]')?.click()
                  }}
                >
                  Continue
                </Button>
              </TabsContent>

              <TabsContent value="connection" className="space-y-4 py-4">
                <div className="space-y-4">
                  {getConfigFields().map(([key, field]) => (
                    <FormField
                      key={key}
                      control={form.control}
                      name={`config.${key}` as any}
                      render={({ field: formField }) => (
                        <FormItem>
                          <FormLabel>{field.label}</FormLabel>
                          <FormControl>
                            {field.type === 'password' ? (
                              <Input 
                                type="password" 
                                placeholder={field.placeholder} 
                                {...formField} 
                              />
                            ) : field.type === 'select' ? (
                              <Select 
                                onValueChange={formField.onChange} 
                                defaultValue={formField.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder={field.placeholder} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {key === 'api_key_in' ? (
                                    <>
                                      <SelectItem value="header">Header</SelectItem>
                                      <SelectItem value="query">Query Parameter</SelectItem>
                                    </>
                                  ) : null}
                                </SelectContent>
                              </Select>
                            ) : (
                              <Input 
                                placeholder={field.placeholder} 
                                {...formField} 
                              />
                            )}
                          </FormControl>
                          {field.description && (
                            <FormDescription>{field.description}</FormDescription>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}

                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full mb-4" 
                    onClick={testConnection}
                    disabled={testingConnection}
                  >
                    {testingConnection ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Testing Connection...
                      </>
                    ) : (
                      "Test Connection"
                    )}
                  </Button>

                  {testResult && (
                    <Alert
                      className={testResult.success ? "bg-green-50" : "bg-destructive/10"}
                    >
                      <AlertDescription className="flex items-center justify-between">
                        <span>{testResult.message}</span>
                        <Badge
                          variant={testResult.success ? "default" : "destructive"}
                          className={testResult.success ? "bg-green-500" : ""}
                        >
                          {testResult.success ? "Success" : "Failed"}
                        </Badge>
                      </AlertDescription>
                    </Alert>
                  )}

                  <FormField
                    control={form.control}
                    name="is_active"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 mt-6">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Activate immediately
                          </FormLabel>
                          <FormDescription>
                            Start syncing data according to the selected frequency
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setStep(1)
                      document.querySelector('[data-value="basics"]')?.click()
                    }}
                  >
                    Back
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Integration"
                    )}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
