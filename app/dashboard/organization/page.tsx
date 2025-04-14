"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from 'next/link'
import { Plus, Search, ZoomIn, ZoomOut, RefreshCw, Wand2, X, Settings, DownloadCloud, Bug, FolderKanban, ClipboardPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { OrgChart } from "@/components/organization/org-chart"
import { DepartmentList } from "@/components/organization/department-list"
import { PositionList } from "@/components/organization/position-list"
import { AIOrgGenerator } from "@/components/organization/ai-org-generator"
import { useToast } from "@/hooks/use-toast"
import { OrgChartNode } from "@/types/organization"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { SetupOrganizationButton } from "@/components/organization/setup-organization-button"
import { ERPIntegrationStatus } from "@/components/organization/erp-integration-status"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import html2canvas from "html2canvas"
import { jsPDF } from "jspdf"
import { saveAs } from "file-saver"
import { OrgDebugPanel } from "@/components/organization/org-debug-panel"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { CreateProjectDialog } from "@/components/projects/create-project-dialog"

export default function OrganizationPage() {
  // Add a console log to help debug
  console.log("Organization Page is being rendered");

  const [searchQuery, setSearchQuery] = useState("")
  const [zoomLevel, setZoomLevel] = useState(100)
  const [showAIGenerator, setShowAIGenerator] = useState(false)
  const [organizationData, setOrganizationData] = useState<OrgChartNode | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [needsSetup, setNeedsSetup] = useState(false)
  const [activeTab, setActiveTab] = useState("org-chart")
  const [showDataSourceInfo, setShowDataSourceInfo] = useState(false)
  const [showDebugPanel, setShowDebugPanel] = useState(false)
  const [isGeneratingChart, setIsGeneratingChart] = useState(false)
  const [showCreateProjectDialog, setShowCreateProjectDialog] = useState(false)
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  // Get selected project from URL and fetch data
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const projectId = searchParams.get('selectedProject')
    if (projectId) {
      setSelectedProject(projectId)
    }
    fetchOrganizationData(projectId)
  }, [])

  // Check if in development mode
  useEffect(() => {
    setShowDebugPanel(process.env.NODE_ENV === 'development')
  }, [])

  const fetchOrganizationData = async (projectId?: string | null) => {
    try {
      setIsLoading(true)
      const url = projectId ? `/api/organization/projects/org-chart?projectId=${projectId}` : '/api/organization'
      const response = await fetch(url)
      if (!response.ok) {
        if (response.status === 404 || response.status === 500) {
          setNeedsSetup(true)
          setIsLoading(false)
          return
        }
        throw new Error('Failed to fetch organization data')
      }
      
      const result = await response.json()
      if (result.success) {
        if (result.data) {
          setOrganizationData(result.data)
          setNeedsSetup(false)
        } else {
          // Only set needsSetup if we explicitly get a setup required response
          setNeedsSetup(response.status === 404)
        }
      } else {
        // Handle other API errors without triggering setup
        toast({
          title: "Error",
          description: result.error || "Failed to load organization data",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error fetching organization data:', error)
      toast({
        title: "Error",
        description: "Failed to load organization data.",
        variant: "destructive",
      })
      setNeedsSetup(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 10, 200))
  }

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 10, 50))
  }

  const handleNodeClick = (node: OrgChartNode) => {
    // Navigate to employee details page
    router.push(`/dashboard/employees/${node.id}`)
  }

  const handleAIGenerated = async (data: OrgChartNode) => {
    try {
      setIsGeneratingChart(true)
      
      if (selectedProject) {
        // Save the generated chart to the project
        const response = await fetch('/api/organization/projects/save-generated-chart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            projectId: selectedProject,
            generatedChart: data
          })
        })

        if (!response.ok) {
          throw new Error('Failed to save organization chart to project')
        }
      }

      setOrganizationData(data)
      toast({
        title: "Success",
        description: selectedProject 
          ? "Organization chart has been saved to the project" 
          : "Organization chart has been updated with the AI-generated structure",
      })

      // Refresh the data to ensure we have the latest version
      if (selectedProject) {
        await fetchOrganizationData(selectedProject)
      }
    } catch (error) {
      console.error('Error handling AI generated chart:', error)
      toast({
        title: "Error",
        description: "Failed to save the generated organization chart",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingChart(false)
    }
  }

  const exportChartToPDF = async () => {
    try {
      const chartElement = document.getElementById('org-chart-container');
      if (!chartElement) return;

      toast({
        title: "Preparing Download",
        description: "Creating PDF of your organization chart...",
      });

      const canvas = await html2canvas(chartElement, {
        scale: 2,
        logging: false,
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
      });

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('organization-chart.pdf');

      toast({
        title: "Success",
        description: "Organization chart exported to PDF successfully",
      });
    } catch (error) {
      console.error('Error exporting chart to PDF:', error);
      toast({
        title: "Error",
        description: "Failed to export organization chart to PDF",
        variant: "destructive",
      });
    }
  };

  const handleProjectCreated = () => {
    setShowCreateProjectDialog(false)
    toast({
      title: "Success",
      description: "Project created successfully."
    })
  }

  return (
    <div className="container-fluid px-4 py-6 h-[calc(100vh-4rem)]">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold">Organization Chart</h1>
          <p className="text-muted-foreground">Visualize your company's structure</p>
        </div>
        <div className="flex items-center space-x-2 flex-wrap gap-2">
          <Button 
            onClick={() => setShowAIGenerator(!showAIGenerator)}
            variant={showAIGenerator ? "secondary" : "default"}
            size="sm"
          >
            <Wand2 className="mr-2 h-4 w-4" />
            {showAIGenerator ? "Hide AI Gen" : "Generate with AI"}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowCreateProjectDialog(true)}
          >
             <ClipboardPlus className="mr-2 h-4 w-4" />
             Create Project
          </Button>
          <Link href="/dashboard/organization/projects" passHref>
             <Button variant="outline" size="sm">
               <FolderKanban className="mr-2 h-4 w-4" />
               View Projects
             </Button>
          </Link>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Chart Options</h4>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={exportChartToPDF}
                >
                  <DownloadCloud className="mr-2 h-4 w-4" />
                  Export to PDF
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={fetchOrganizationData}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Data
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setShowDataSourceInfo(!showDataSourceInfo)}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  {showDataSourceInfo ? 'Hide Data Source Info' : 'Data Source Info'}
                </Button>
                
                {process.env.NODE_ENV === 'development' && (
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => {
                      setShowDataSourceInfo(true);
                      setShowDebugPanel(!showDebugPanel);
                    }}
                  >
                    <Bug className="mr-2 h-4 w-4" />
                    {showDebugPanel ? 'Hide Debug Panel' : 'Show Debug Panel'}
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full">
        {/* Sidebar for info panels and AI generator */}
        {(showDataSourceInfo || showAIGenerator) && (
          <div className="lg:col-span-4 lg:order-2 space-y-4 overflow-auto">
            {showAIGenerator && (
              <Card className="mb-4">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle>AI Organization Chart Generator</CardTitle>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowAIGenerator(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardDescription>
                    Create your organization chart using AI
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AIOrgGenerator 
                    onGenerated={handleAIGenerated} 
                    onGenerationStart={() => setIsGeneratingChart(true)}
                    selectedProject={selectedProject}
                  />
                </CardContent>
              </Card>
            )}
            
            {showDataSourceInfo && (
              <div className="space-y-4">
                <ERPIntegrationStatus />
                {showDebugPanel && <OrgDebugPanel />}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-2 ml-auto block"
                  onClick={() => setShowDataSourceInfo(false)}
                >
                  <X className="h-4 w-4 mr-1" /> Hide
                </Button>
              </div>
            )}
          </div>
        )}
      
        {/* Main content area */}
        <div className={`${(showDataSourceInfo || showAIGenerator) ? 'lg:col-span-8 lg:order-1' : 'lg:col-span-12'} flex flex-col h-full`}>
          <Tabs 
            defaultValue="org-chart" 
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-1 flex flex-col"
          >
            <div className="flex justify-between items-center mb-4">
              <TabsList>
                <TabsTrigger value="org-chart">Org Chart</TabsTrigger>
                <TabsTrigger value="departments">Departments</TabsTrigger>
                <TabsTrigger value="positions">Positions</TabsTrigger>
              </TabsList>
              
              {activeTab === "org-chart" && (
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search employees..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-48 h-9"
                    />
                  </div>
                  <Button variant="outline" size="icon" onClick={handleZoomOut}>
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-sm w-12 text-center">{zoomLevel}%</span>
                  <Button variant="outline" size="icon" onClick={handleZoomIn}>
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-hidden">
              <TabsContent value="org-chart" className="h-full">
                <div id="org-chart-container" className="bg-card rounded-lg h-full overflow-auto">
                  <div 
                    className="min-h-[800px] h-full w-full p-4 transition-transform duration-150 ease-in-out flex items-center justify-center"
                    style={{ transform: `scale(${zoomLevel / 100})` }}
                  >
                    {isLoading || isGeneratingChart ? (
                      <div className="flex justify-center items-center h-full w-full">
                        <LoadingSpinner size="lg" />
                      </div>
                    ) : needsSetup ? (
                      <div className="flex flex-col items-center justify-center h-full w-full space-y-4">
                        <div className="text-center mb-6">
                          <h3 className="text-xl font-semibold mb-2">Organization Setup Required</h3>
                          <p className="text-muted-foreground">
                            The organization structure hasn't been set up yet. Click below to create the necessary tables and sample data.
                          </p>
                        </div>
                        <div className="w-full max-w-md">
                          <SetupOrganizationButton onSetupComplete={fetchOrganizationData} />
                        </div>
                      </div>
                    ) : organizationData ? (
                      <OrgChart
                        data={organizationData}
                        onNodeClick={handleNodeClick}
                      />
                    ) : (
                      <div className="flex justify-center items-center h-full w-full">
                        <p className="text-muted-foreground">No organization data available.</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="departments" className="h-full">
                <div className="bg-card rounded-lg h-full overflow-auto p-4">
                  <DepartmentList onRefresh={fetchOrganizationData} />
                </div>
              </TabsContent>

              <TabsContent value="positions" className="h-full">
                <div className="bg-card rounded-lg h-full overflow-auto p-4">
                  <PositionList />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      <CreateProjectDialog 
        open={showCreateProjectDialog} 
        onOpenChange={setShowCreateProjectDialog} 
        onProjectCreated={handleProjectCreated} 
      />

    </div>
  )
}

