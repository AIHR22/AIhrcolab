"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2, Wand2, AlertCircle, CheckCircle2, PanelLeftClose, PanelLeftOpen, Lightbulb, Info } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { OrgChart } from "@/components/organization/org-chart"
import type { OrgChartNode } from "@/types/organization"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"

interface AIOrgGeneratorProps {
  onGenerated: (data: OrgChartNode) => void
  onGenerationStart?: () => void
  selectedProject?: string | null
}

export function AIOrgGenerator({ onGenerated, onGenerationStart, selectedProject }: AIOrgGeneratorProps) {
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [previewData, setPreviewData] = useState<OrgChartNode | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [apiStatus, setApiStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [showTips, setShowTips] = useState(true)
  const [activeTab, setActiveTab] = useState<"prompt" | "preview">("prompt")
  const { toast } = useToast()
  const promptRef = useRef<HTMLTextAreaElement>(null)

  // Example prompts for users
  const examplePrompts = [
    "Create an organization with Engineering, Marketing, and Sales departments",
    "Create an organization with Brad as the head of Engineering and Farzana in Marketing",
    "Design a tech company with department heads for Engineering, Sales, and HR",
    "Build a startup structure with Brad as CEO and Farzana leading the Marketing department"
  ]

  // Tips for better results
  const generationTips = [
    "Mention specific employees by name (e.g., 'Brad', 'Farzana') to include them",
    "Use phrases like 'X as head of Y' or 'Z in the Marketing team' for specific placements",
    "Only employees in your database can be included in the chart",
    "Specify departments that already exist in your system",
    "The more specific your prompt, the better the results"
  ]

  useEffect(() => {
    // Focus the prompt textarea when component mounts
    if (promptRef.current) {
      promptRef.current.focus()
    }
  }, [])

  // When generation is successful, switch to preview tab
  useEffect(() => {
    if (apiStatus === "success" && previewData) {
      setActiveTab("preview")
    }
  }, [apiStatus, previewData])

  const generateOrgChart = async () => {
    if (!prompt.trim()) {
      setError("Please enter a description of your organization structure")
      toast({
        title: "Error",
        description: "Please enter a description of your organization structure",
        variant: "destructive",
      })
      return
    }

    setError(null)
    setIsGenerating(true)
    setApiStatus("loading")
    
    // Notify parent component that generation has started
    if (onGenerationStart) {
      onGenerationStart()
    }
    
    try {
      const response = await fetch("/api/organization/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          structureType: "detailed",
          useAI: true
        }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        console.error("API error:", data)
        setApiStatus("error")
        throw new Error(data.message || `Server error: ${response.status}`)
      }

      if (data.success && data.data) {
        setPreviewData(data.data)
        setApiStatus("success")
        toast({
          title: "Success",
          description: "Organization chart generated successfully",
        })
      } else {
        console.error("Data error:", data)
        setApiStatus("error")
        throw new Error(data.message || "Failed to generate organization chart")
      }
    } catch (error) {
      console.error("Error generating org chart:", error)
      setError(error instanceof Error ? error.message : "Failed to generate organization chart")
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate organization chart. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleApply = async () => {
    if (!previewData) return;

    try {
      if (selectedProject) {
        // Save the generated chart to the project
        const response = await fetch('/api/organization/projects/save-generated-chart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            projectId: selectedProject,
            generatedChart: previewData
          })
        });

        if (!response.ok) {
          throw new Error('Failed to save chart to project');
        }

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error || 'Failed to save chart to project');
        }

        toast({
          title: 'Success',
          description: 'Organization chart saved to project successfully',
        });
      }

      // Update the main view
      onGenerated(previewData);
    } catch (error) {
      console.error('Error saving chart:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save organization chart',
        variant: 'destructive',
      });
    }
  }

  const setExamplePrompt = (example: string) => {
    setPrompt(example)
    if (promptRef.current) {
      promptRef.current.focus()
    }
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "prompt" | "preview")}>
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="prompt" disabled={isGenerating}>
            <div className="flex items-center">
              {apiStatus === "success" ? <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" /> : <Wand2 className="mr-2 h-4 w-4" />}
              Prompt Editor
            </div>
          </TabsTrigger>
          <TabsTrigger value="preview" disabled={!previewData || isGenerating}>
            <div className="flex items-center">
              {apiStatus === "loading" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
              Chart Preview
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="prompt" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Create Your Organization</CardTitle>
                      <CardDescription>
                        Describe the organization structure you want to generate
                      </CardDescription>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => setShowTips(!showTips)}>
                            {showTips ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{showTips ? "Hide" : "Show"} tips panel</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="prompt">
                      Your Prompt
                      <span className="ml-2 text-xs text-muted-foreground">
                        {prompt.length} characters
                      </span>
                    </Label>
                    <Textarea
                      id="prompt"
                      ref={promptRef}
                      placeholder="Example: Create an organization chart with Engineering, Marketing, and Sales departments. Make Brad the head of Engineering, and include Farzana in the Marketing team."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="min-h-[200px]"
                      disabled={isGenerating}
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs py-1 px-2 cursor-pointer" onClick={() => setExamplePrompt(examplePrompts[0])}>
                      Simple structure
                    </Badge>
                    <Badge variant="outline" className="text-xs py-1 px-2 cursor-pointer" onClick={() => setExamplePrompt(examplePrompts[1])}>
                      Specific placements
                    </Badge>
                    <Badge variant="outline" className="text-xs py-1 px-2 cursor-pointer" onClick={() => setExamplePrompt(examplePrompts[2])}>
                      Department-focused
                    </Badge>
                    <Badge variant="outline" className="text-xs py-1 px-2 cursor-pointer" onClick={() => setExamplePrompt(examplePrompts[3])}>
                      Leadership structure
                    </Badge>
                  </div>
                  
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <Button 
                    onClick={generateOrgChart} 
                    disabled={isGenerating || !prompt.trim()}
                    className="w-full"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Chart...
                      </>
                    ) : (
                      <>
                        <Wand2 className="mr-2 h-4 w-4" />
                        Generate Organization Chart
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            {showTips && (
              <div className="md:col-span-1">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center text-base">
                      <Lightbulb className="h-4 w-4 mr-2 text-yellow-500" />
                      Tips for Best Results
                    </CardTitle>
                    <CardDescription>
                      Follow these tips for better AI-generated charts
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px] pr-4">
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium mb-2">Example Patterns:</h4>
                          <div className="space-y-2 text-sm">
                            <div className="bg-muted p-2 rounded-md">
                              <div className="font-medium">Employee Placement</div>
                              <div className="text-muted-foreground">
                                "Brad as head of Engineering"
                              </div>
                            </div>
                            <div className="bg-muted p-2 rounded-md">
                              <div className="font-medium">Department Assignment</div>
                              <div className="text-muted-foreground">
                                "Farzana in Marketing department"
                              </div>
                            </div>
                            <div className="bg-muted p-2 rounded-md">
                              <div className="font-medium">Full Structure</div>
                              <div className="text-muted-foreground">
                                "Create an org with Engineering, Sales, and Marketing departments"
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium mb-2">Key Guidelines:</h4>
                          <ul className="space-y-2 text-sm">
                            {generationTips.map((tip, index) => (
                              <li key={index} className="flex items-start">
                                <Info className="h-3 w-3 mr-2 mt-1 text-primary" />
                                <span>{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <Alert className="bg-primary/10 border-primary/20">
                          <Info className="h-4 w-4 text-primary" />
                          <AlertDescription className="text-xs">
                            The AI will intelligently place employees in departments, but only existing employees and departments in your database can be used.
                          </AlertDescription>
                        </Alert>
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="preview">
          {previewData && (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Generated Organization Chart</CardTitle>
                    <CardDescription>
                      Review the chart before applying it to your organization
                    </CardDescription>
                  </div>
                  {apiStatus === "success" && (
                    <Badge variant="default" className="bg-green-600">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Generation successful
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[500px] border rounded-lg p-4 overflow-auto bg-white dark:bg-gray-950">
                  <OrgChart data={previewData} />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("prompt")}>
                  Edit Prompt
                </Button>
                <Button onClick={handleApply} variant="default">
                  Apply This Chart
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}