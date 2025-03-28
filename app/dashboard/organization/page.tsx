"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Search, ZoomIn, ZoomOut, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { OrgChart } from "@/components/organization/org-chart"
import { DepartmentList } from "@/components/organization/department-list"
import { PositionList } from "@/components/organization/position-list"
import { GenerateOrgDialog } from "@/components/organization/generate-org-dialog"
import { useToast } from "@/hooks/use-toast"
import { OrgChartNode } from "@/types/organization"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { SetupOrganizationButton } from "@/components/organization/setup-organization-button"

export default function OrganizationPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [zoomLevel, setZoomLevel] = useState(100)
  const [showGenerateDialog, setShowGenerateDialog] = useState(false)
  const [organizationData, setOrganizationData] = useState<OrgChartNode | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [needsSetup, setNeedsSetup] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // Initial data fetch when component mounts
  useEffect(() => {
    fetchOrganizationData()
  }, [])

  const fetchOrganizationData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/organization')
      if (!response.ok) {
        if (response.status === 404 || response.status === 500) {
          setNeedsSetup(true)
          setIsLoading(false)
          return
        }
        throw new Error('Failed to fetch organization data')
      }
      
      const result = await response.json()
      if (result.success && result.data) {
        setOrganizationData(result.data)
        setNeedsSetup(false)
      } else {
        setNeedsSetup(true)
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

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Organization</h1>
          <p className="text-muted-foreground">View and manage your organizational structure</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setShowGenerateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Generate Organization
          </Button>
          <Button variant="outline" onClick={fetchOrganizationData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="org-chart">
        <TabsList className="mb-4">
          <TabsTrigger value="org-chart">Org Chart</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="positions">Positions</TabsTrigger>
        </TabsList>

        <TabsContent value="org-chart">
          <div className="bg-card rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search employees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="icon" onClick={handleZoomOut}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm">{zoomLevel}%</span>
                <Button variant="outline" size="icon" onClick={handleZoomIn}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div style={{ transform: `scale(${zoomLevel / 100})` }}>
              {isLoading ? (
                <div className="flex justify-center items-center h-[800px]">
                  <LoadingSpinner size="lg" />
                </div>
              ) : needsSetup ? (
                <div className="flex flex-col items-center justify-center h-[800px] space-y-4">
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
                <div className="flex justify-center items-center h-[800px]">
                  <p className="text-muted-foreground">No organization data available.</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="departments">
          <DepartmentList onRefresh={fetchOrganizationData} />
        </TabsContent>

        <TabsContent value="positions">
          <PositionList />
        </TabsContent>
      </Tabs>

      <GenerateOrgDialog 
        open={showGenerateDialog} 
        onOpenChange={setShowGenerateDialog} 
        onGenerated={fetchOrganizationData}
      />
    </div>
  )
}

