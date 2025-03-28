"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal, AlertCircle, CheckCircle, Database, Code } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function SupabaseSetupGuide() {
  const [setupStatus, setSetupStatus] = useState<"not_started" | "in_progress" | "completed">("not_started")

  const runSetupScript = async () => {
    setSetupStatus("in_progress")

    try {
      // In a real app, this would call an API endpoint to run the setup script
      // For demo purposes, we'll just simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setSetupStatus("completed")
    } catch (error) {
      console.error("Error running setup script:", error)
      setSetupStatus("not_started")
    }
  }

  return (
    <div className="container mx-auto max-w-3xl p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Supabase Setup Required</CardTitle>
          <CardDescription>
            Your HR Suite application requires Supabase tables to be set up before it can function properly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Database Error</AlertTitle>
            <AlertDescription>
              The application encountered errors when trying to access Supabase tables. This usually means the tables
              don't exist yet.
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="automatic">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="automatic">Automatic Setup</TabsTrigger>
              <TabsTrigger value="manual">Manual Setup</TabsTrigger>
            </TabsList>

            <TabsContent value="automatic" className="space-y-4">
              <div className="rounded-md bg-muted p-4">
                <h3 className="mb-2 font-medium">Automatic Database Setup</h3>
                <p className="text-sm text-muted-foreground">
                  Click the button below to automatically create the required tables and seed them with sample data.
                  This will set up everything you need to get started with HR Suite.
                </p>
              </div>

              <div className="flex items-center justify-center">
                <Button
                  onClick={runSetupScript}
                  disabled={setupStatus === "in_progress" || setupStatus === "completed"}
                  className="w-full"
                >
                  {setupStatus === "not_started" && (
                    <>
                      <Database className="mr-2 h-4 w-4" />
                      Initialize Database
                    </>
                  )}
                  {setupStatus === "in_progress" && "Setting up database..."}
                  {setupStatus === "completed" && (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Setup Complete
                    </>
                  )}
                </Button>
              </div>

              {setupStatus === "completed" && (
                <Alert className="bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-50">
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Setup Successful</AlertTitle>
                  <AlertDescription>
                    The database has been successfully initialized. You can now refresh the page to start using HR
                    Suite.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="manual" className="space-y-4">
              <div className="rounded-md bg-muted p-4">
                <h3 className="mb-2 font-medium">Manual Database Setup</h3>
                <p className="text-sm text-muted-foreground">
                  If you prefer to set up the database manually, follow these steps to create the required tables and
                  schema.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="mb-2 font-medium">1. Run the initialization script</h3>
                  <div className="relative rounded-md bg-black p-4">
                    <div className="flex items-center justify-between">
                      <Terminal className="h-4 w-4 text-white" />
                      <Button variant="ghost" size="sm" className="h-6 text-xs text-white">
                        Copy
                      </Button>
                    </div>
                    <pre className="mt-2 text-sm text-white">
                      <code>bun run init-db</code>
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 font-medium">2. Seed the database with sample data</h3>
                  <div className="relative rounded-md bg-black p-4">
                    <div className="flex items-center justify-between">
                      <Terminal className="h-4 w-4 text-white" />
                      <Button variant="ghost" size="sm" className="h-6 text-xs text-white">
                        Copy
                      </Button>
                    </div>
                    <pre className="mt-2 text-sm text-white">
                      <code>bun run seed-db</code>
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 font-medium">3. Verify the tables were created</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Check your Supabase dashboard to verify that the following tables were created:
                  </p>
                  <ul className="list-disc pl-5 text-sm text-muted-foreground">
                    <li>employees</li>
                    <li>time_off_requests</li>
                    <li>reviews</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
          <Button variant="outline" onClick={() => window.open("https://supabase.com/dashboard", "_blank")}>
            <Code className="mr-2 h-4 w-4" />
            Open Supabase Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

