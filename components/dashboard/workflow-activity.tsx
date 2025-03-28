"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Plus, Settings, Trash2 } from "lucide-react"
import { useWorkflow } from "@/lib/workflow/workflow-provider"
import { formatDistanceToNow } from "date-fns"

export function WorkflowActivity() {
  const { workflows, triggers, actions, executeWorkflow, updateWorkflow } = useWorkflow()

  const handleToggleWorkflow = (id: string, active: boolean) => {
    updateWorkflow(id, { active })
  }

  const handleExecuteWorkflow = (id: string) => {
    executeWorkflow(id)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Workflow Automation</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Workflow
        </Button>
      </div>

      <Tabs defaultValue="workflows" className="space-y-4">
        <TabsList>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="triggers">Triggers</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="workflows" className="space-y-4">
          {workflows.map((workflow) => (
            <Card key={workflow.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle>{workflow.name}</CardTitle>
                  <Switch
                    checked={workflow.active}
                    onCheckedChange={(checked) => handleToggleWorkflow(workflow.id, checked)}
                  />
                </div>
                <CardDescription>{workflow.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Triggers</p>
                      <div className="space-y-2">
                        {workflow.triggers.map((triggerId) => {
                          const trigger = triggers.find((t) => t.id === triggerId)
                          return trigger ? (
                            <div key={trigger.id} className="flex items-center gap-2">
                              <Badge variant="outline">{trigger.name}</Badge>
                            </div>
                          ) : null
                        })}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">Actions</p>
                      <div className="space-y-2">
                        {workflow.actions.map((actionId) => {
                          const action = actions.find((a) => a.id === actionId)
                          return action ? (
                            <div key={action.id} className="flex items-center gap-2">
                              <Badge variant="outline">{action.name}</Badge>
                            </div>
                          ) : null
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                      {workflow.lastRun
                        ? `Last run: ${formatDistanceToNow(new Date(workflow.lastRun), { addSuffix: true })}`
                        : "Never run"}
                    </span>
                    <span>Created: {formatDistanceToNow(new Date(workflow.createdAt), { addSuffix: true })}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleExecuteWorkflow(workflow.id)}
                      disabled={!workflow.active}
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Run Now
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Settings className="mr-2 h-4 w-4" />
                      Configure
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="triggers" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {triggers.map((trigger) => (
              <Card key={trigger.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{trigger.name}</CardTitle>
                    <Switch checked={trigger.active} />
                  </div>
                  <CardDescription>{trigger.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-1">Event</p>
                      <Badge variant="outline">{trigger.event}</Badge>
                    </div>

                    {trigger.conditions.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-1">Conditions</p>
                        <div className="space-y-1">
                          {trigger.conditions.map((condition, index) => (
                            <div key={index} className="text-sm">
                              {condition.field} {condition.operator} {condition.value}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Settings className="mr-2 h-4 w-4" />
                        Configure
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {actions.map((action) => (
              <Card key={action.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{action.name}</CardTitle>
                    <Switch checked={action.active} />
                  </div>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-1">Type</p>
                      <Badge variant="outline">{action.type}</Badge>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-1">Parameters</p>
                      <div className="space-y-1">
                        {Object.entries(action.parameters).map(([key, value]) => (
                          <div key={key} className="text-sm">
                            <span className="font-medium">{key}:</span> {JSON.stringify(value)}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Settings className="mr-2 h-4 w-4" />
                        Configure
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

