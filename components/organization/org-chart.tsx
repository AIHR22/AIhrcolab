"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { 
  Search, 
  ZoomIn, 
  ZoomOut, 
  RefreshCw, 
  Download, 
  Settings, 
  Database, 
  FileDown, 
  Printer,
  Link, 
  Link2,
  FileText,
  BarChart,
  Network
} from "lucide-react"
import type { OrgChartNode, OrgChartExportOptions } from "@/types/organization"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { saveAs } from "file-saver"
import html2canvas from "html2canvas"
import { jsPDF } from "jspdf"
import * as d3 from "d3"

// Sample data for initial rendering
const sampleData: OrgChartNode = {
  id: "1",
  name: "Robert Johnson",
  title: "CEO",
  department: "Executive",
  children: [
    {
      id: "2",
      name: "Sarah Williams",
      title: "CTO",
      department: "Technology",
      children: [],
    },
    {
      id: "3",
      name: "Michael Chen",
      title: "CFO",
      department: "Finance",
      children: [],
    },
    {
      id: "4",
      name: "Jessica Rodriguez",
      title: "COO",
      department: "Operations",
      children: [],
    },
  ],
}

interface OrgChartProps {
  data?: OrgChartNode
  onNodeClick?: (node: OrgChartNode) => void
  allowExport?: boolean
  showComplexRelationships?: boolean
}

export function OrgChart({ 
  data, 
  onNodeClick,
  allowExport = true,
  showComplexRelationships = true 
}: OrgChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(100)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAIPrompt, setShowAIPrompt] = useState(false)
  const [prompt, setPrompt] = useState("")
  const [isClient, setIsClient] = useState(false)
  const [orgData, setOrgData] = useState<OrgChartNode | null>(data || null)
  const [isLoading, setIsLoading] = useState(!data)
  
  // New state for enhanced features
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showIntegrationDialog, setShowIntegrationDialog] = useState(false)
  const [viewMode, setViewMode] = useState<"standard" | "complex" | "analytics">("standard")
  const [exportOptions, setExportOptions] = useState<OrgChartExportOptions>({
    format: "pdf",
    showMetadata: true,
    showDottedLines: true,
    showMatrixRelationships: true,
    includeDate: true,
    orientation: "landscape",
    paperSize: "a4",
  })
  const [showSettings, setShowSettings] = useState(false)
  const [integrationStatus, setIntegrationStatus] = useState<"connected" | "disconnected" | "error">("disconnected")
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null)

  const { toast } = useToast()

  // Set isClient to true once component mounts
  useEffect(() => {
    setIsClient(true)
    if (!data) {
      fetchOrgData()
    }
    
    // Check integration status
    checkIntegrationStatus()
  }, [data])

  const fetchOrgData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/organization')
      if (!response.ok) {
        throw new Error('Failed to fetch organization data')
      }
      const result = await response.json()
      if (result.success && result.data) {
        setOrgData(result.data)
      } else {
        // If API returns no data, use sample data for demonstration
        setOrgData(sampleData)
      }
    } catch (error) {
      console.error('Error fetching org data:', error)
      // Fallback to sample data
      setOrgData(sampleData)
      toast({
        title: "Error",
        description: "Failed to load organization data. Using sample data instead.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const renderChart = useCallback(() => {
    if (!isClient || !chartContainerRef.current || !orgData) return

    // Clear existing chart
    const container = chartContainerRef.current
    container.innerHTML = ""

    // Only import d3 on the client side
    const width = 1200
    const height = 800
    const margin = { top: 20, right: 120, bottom: 20, left: 120 }

    const svg = d3
      .select(container)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    const tree = d3
      .tree<OrgChartNode>()
      .size([height - margin.top - margin.bottom, width - margin.left - margin.right])

    const root = d3.hierarchy(orgData)
    const nodes = tree(root)

    // Add links for direct reports
    svg
      .selectAll(".link")
      .data(nodes.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr(
        "d",
        d3.linkHorizontal<d3.HierarchyPointLink<OrgChartNode>, d3.HierarchyPointNode<OrgChartNode>>()
          .x((d) => d.y)
          .y((d) => d.x)
      )
      .attr("fill", "none")
      .attr("stroke", "#666")
      .attr("stroke-width", 1.5)

    // If complex relationships are enabled, add dotted lines for matrix and dotted-line relationships
    if (showComplexRelationships && viewMode === "complex") {
      // Helper function to find a node by ID
      const findNodeById = (id: string): d3.HierarchyPointNode<OrgChartNode> | undefined => {
        let result: d3.HierarchyPointNode<OrgChartNode> | undefined
        
        nodes.descendants().forEach(node => {
          if (node.data.id === id) {
            result = node
          }
        })
        
        return result
      }
      
      // Collect all dotted line relationships
      const dottedLineLinks: {source: d3.HierarchyPointNode<OrgChartNode>, target: d3.HierarchyPointNode<OrgChartNode>}[] = []
      const matrixLinks: {source: d3.HierarchyPointNode<OrgChartNode>, target: d3.HierarchyPointNode<OrgChartNode>}[] = []
      
      nodes.descendants().forEach(node => {
        // Add dotted-line relationships
        if (node.data.dotted_line_reports) {
          node.data.dotted_line_reports.forEach(report => {
            const targetNode = findNodeById(report.id)
            if (targetNode) {
              dottedLineLinks.push({
                source: node,
                target: targetNode
              })
            }
          })
        }
        
        // Add matrix relationships
        if (node.data.matrix_reports) {
          node.data.matrix_reports.forEach(report => {
            const targetNode = findNodeById(report.id)
            if (targetNode) {
              matrixLinks.push({
                source: node,
                target: targetNode
              })
            }
          })
        }
      })
      
      // Add dotted line relationships
      svg
        .selectAll(".dotted-link")
        .data(dottedLineLinks)
        .enter()
        .append("path")
        .attr("class", "dotted-link")
        .attr(
          "d",
          d3.linkHorizontal<any, any>()
            .x((d) => d.source.y)
            .y((d) => d.source.x)
        )
        .attr("fill", "none")
        .attr("stroke", "#0ea5e9")  // Sky blue color
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", "5,5")
      
      // Add matrix relationships
      svg
        .selectAll(".matrix-link")
        .data(matrixLinks)
        .enter()
        .append("path")
        .attr("class", "matrix-link")
        .attr(
          "d",
          d3.linkHorizontal<any, any>()
            .x((d) => d.source.y)
            .y((d) => d.source.x)
        )
        .attr("fill", "none")
        .attr("stroke", "#7c3aed")  // Purple color
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", "10,2,2,2")
    }

    // Add nodes
    const node = svg
      .selectAll(".node")
      .data(nodes.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d) => `translate(${d.y},${d.x})`)
      .on("click", (event, d) => onNodeClick?.(d.data))

    // Add node cards
    node
      .append("foreignObject")
      .attr("width", 220)
      .attr("height", (d) => viewMode === "complex" && d.data.metadata ? 150 : 100)
      .attr("x", -110)
      .attr("y", -50)
      .append("xhtml:div")
      .html(
        (d) => `
        <div class="bg-card p-4 rounded-lg shadow-lg border border-border ${d.data.reporting_type === 'dotted-line' ? 'border-sky-400' : d.data.reporting_type === 'matrix' ? 'border-purple-400' : ''}">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
              ${
                d.data.imageUrl
                  ? `<img src="${d.data.imageUrl}" alt="${d.data.name}" class="w-full h-full object-cover" />`
                  : `<span class="text-xl font-semibold">${d.data.name.charAt(0)}</span>`
              }
            </div>
            <div>
              <div class="font-semibold">${d.data.name}</div>
              <div class="text-sm text-muted-foreground">${d.data.title}</div>
              <div class="text-xs text-muted-foreground">${d.data.department}</div>
              ${viewMode === "complex" && d.data.metadata ? `
                <div class="mt-2 text-xs">
                  ${d.data.metadata.location ? `<div class="text-muted-foreground">Location: ${d.data.metadata.location}</div>` : ''}
                  ${d.data.metadata.skills && d.data.metadata.skills.length ? `<div class="text-muted-foreground">Skills: ${d.data.metadata.skills.slice(0, 2).join(', ')}${d.data.metadata.skills.length > 2 ? '...' : ''}</div>` : ''}
                  ${d.data.metadata.performance_rating ? `<div class="text-muted-foreground">Performance: ${d.data.metadata.performance_rating}/5</div>` : ''}
                </div>
              ` : ''}
              ${d.data.reporting_type ? `
                <div class="mt-1">
                  <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    d.data.reporting_type === 'dotted-line' 
                      ? 'bg-sky-100 text-sky-800' 
                      : d.data.reporting_type === 'matrix' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-gray-100 text-gray-800'
                  }">
                    ${d.data.reporting_type === 'dotted-line' ? 'Dotted Line' : d.data.reporting_type === 'matrix' ? 'Matrix' : 'Direct'}
                  </span>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      `
      )
  }, [orgData, isClient, onNodeClick, showComplexRelationships, viewMode])

  // Only render chart on client side after component mounts
  useEffect(() => {
    if (isClient && orgData && !isLoading) {
      renderChart()
    }
  }, [renderChart, isClient, orgData, isLoading])

  const handleZoomChange = (newZoom: number) => {
    setZoom(newZoom)
    if (chartContainerRef.current) {
      chartContainerRef.current.style.transform = `scale(${newZoom / 100})`
      chartContainerRef.current.style.transformOrigin = "center top"
    }
  }

  const handleGenerateFromPrompt = async () => {
    try {
      const response = await fetch("/api/organization/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      })

      if (!response.ok) throw new Error("Failed to generate organization chart")

      const result = await response.json()
      
      if (result.success && result.data) {
        setOrgData(result.data)
        toast({
          title: "Organization Chart Generated",
          description: "The new structure has been created based on your prompt.",
        })
      } else {
        throw new Error("Failed to generate organization chart")
      }
      
      setShowAIPrompt(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate organization chart",
        variant: "destructive",
      })
    }
  }

  // New function to handle exporting org chart
  const handleExport = async () => {
    if (!chartContainerRef.current) return
    
    try {
      setIsLoading(true)
      toast({
        title: "Preparing Export",
        description: "Please wait while we prepare your export...",
      })
      
      switch (exportOptions.format) {
        case "pdf":
          const canvas = await html2canvas(chartContainerRef.current, {
            scale: 2,
            logging: false,
            backgroundColor: "#ffffff"
          })
          
          const imgData = canvas.toDataURL('image/png')
          const pdf = new jsPDF({
            orientation: exportOptions.orientation || 'landscape',
            unit: 'mm',
            format: exportOptions.paperSize || 'a4',
          })
          
          const title = exportOptions.title || 'Organization Chart'
          const date = exportOptions.includeDate ? `Generated on: ${new Date().toLocaleDateString()}` : ''
          
          // Add title
          pdf.setFontSize(16)
          pdf.text(title, 14, 15)
          
          // Add date if needed
          if (exportOptions.includeDate) {
            pdf.setFontSize(10)
            pdf.text(date, 14, 22)
          }
          
          // Add the image (with suitable scaling to fit on the page)
          const pdfWidth = pdf.internal.pageSize.getWidth()
          const pdfHeight = pdf.internal.pageSize.getHeight()
          const imgWidth = canvas.width
          const imgHeight = canvas.height
          
          const ratio = Math.min(pdfWidth / imgWidth, (pdfHeight - 30) / imgHeight)
          const imgX = (pdfWidth - imgWidth * ratio) / 2
          const imgY = 30 // Position below the title
          
          pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio)
          
          pdf.save(`${title.replace(/\s+/g, '_')}.pdf`)
          break
          
        case "png":
          const pngCanvas = await html2canvas(chartContainerRef.current, {
            scale: 2,
            logging: false,
            backgroundColor: "#ffffff"
          })
          pngCanvas.toBlob((blob: Blob | null) => {
            if (blob) {
              saveAs(blob, `${(exportOptions.title || 'Organization_Chart').replace(/\s+/g, '_')}.png`)
            }
          })
          break
          
        case "svg":
          // Get the SVG from the chart container
          const svgElement = chartContainerRef.current.querySelector('svg')
          if (svgElement) {
            // Clone the SVG to avoid modifying the displayed one
            const svgClone = svgElement.cloneNode(true) as SVGSVGElement
            
            // Add title and date if needed
            if (exportOptions.title || exportOptions.includeDate) {
              const titleG = document.createElementNS('http://www.w3.org/2000/svg', 'g')
              
              if (exportOptions.title) {
                const titleText = document.createElementNS('http://www.w3.org/2000/svg', 'text')
                titleText.setAttribute('x', '20')
                titleText.setAttribute('y', '30')
                titleText.setAttribute('font-size', '24')
                titleText.textContent = exportOptions.title
                titleG.appendChild(titleText)
              }
              
              if (exportOptions.includeDate) {
                const dateText = document.createElementNS('http://www.w3.org/2000/svg', 'text')
                dateText.setAttribute('x', '20')
                dateText.setAttribute('y', '60')
                dateText.setAttribute('font-size', '16')
                dateText.textContent = `Generated on: ${new Date().toLocaleDateString()}`
                titleG.appendChild(dateText)
              }
              
              svgClone.insertBefore(titleG, svgClone.firstChild)
            }
            
            // Get the SVG as a string with XML declaration
            const serializer = new XMLSerializer()
            let svgString = serializer.serializeToString(svgClone)
            svgString = '<?xml version="1.0" standalone="no"?>\r\n' + svgString
            
            // Create a blob with the SVG data
            const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
            saveAs(svgBlob, `${(exportOptions.title || 'Organization_Chart').replace(/\s+/g, '_')}.svg`)
          }
          break
          
        case "excel":
          // For Excel, we'll export a simplified version of the org chart as a CSV
          const rows: string[] = []
          
          // Add header row
          const header = ['ID', 'Name', 'Title', 'Department', 'Reports To']
          if (exportOptions.showMetadata) {
            header.push('Skills', 'Performance Rating', 'Risk', 'Impact', 'Location')
          }
          rows.push(header.join(','))
          
          // Function to traverse the org chart tree and collect data
          const traverseOrgChart = (node: OrgChartNode, parentName: string = '') => {
            const row: string[] = [
              node.id,
              `"${node.name}"`,
              `"${node.title}"`,
              `"${node.department}"`,
              `"${parentName}"`
            ]
            
            if (exportOptions.showMetadata && node.metadata) {
              row.push(
                `"${node.metadata.skills?.join('; ') || ''}"`,
                `"${node.metadata.performance_rating || ''}"`,
                `"${node.metadata.risk_of_loss || ''}"`,
                `"${node.metadata.impact_of_loss || ''}"`,
                `"${node.metadata.location || ''}"`
              )
            } else if (exportOptions.showMetadata) {
              row.push('', '', '', '', '')
            }
            
            rows.push(row.join(','))
            
            // Process children
            node.children.forEach(child => traverseOrgChart(child, node.name))
            
            // Process dotted-line and matrix relationships if requested
            if (exportOptions.showDottedLines && node.dotted_line_reports) {
              node.dotted_line_reports.forEach(dotted => {
                const dottedRow = [
                  dotted.id,
                  `"${dotted.name}"`,
                  `"${dotted.title}"`,
                  `"${dotted.department}"`,
                  `"${node.name} (Dotted Line)"`
                ]
                rows.push(dottedRow.join(','))
              })
            }
            
            if (exportOptions.showMatrixRelationships && node.matrix_reports) {
              node.matrix_reports.forEach(matrix => {
                const matrixRow = [
                  matrix.id,
                  `"${matrix.name}"`,
                  `"${matrix.title}"`,
                  `"${matrix.department}"`,
                  `"${node.name} (Matrix)"`
                ]
                rows.push(matrixRow.join(','))
              })
            }
          }
          
          // Start traversing from the root node
          if (orgData) {
            traverseOrgChart(orgData)
          }
          
          // Create blob and trigger download
          const csvContent = rows.join('\n')
          const csvBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
          saveAs(csvBlob, `${(exportOptions.title || 'Organization_Chart').replace(/\s+/g, '_')}.csv`)
          break
      }
      
      toast({
        title: "Export Complete",
        description: `Your organization chart has been exported as ${exportOptions.format.toUpperCase()}.`,
      })
    } catch (error) {
      console.error('Error exporting org chart:', error)
      toast({
        title: "Export Failed",
        description: "There was an error exporting the organization chart.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setShowExportDialog(false)
    }
  }
  
  // Function to check integration status
  const checkIntegrationStatus = async () => {
    try {
      const response = await fetch('/api/organization/integration/status')
      
      if (response.ok) {
        const data = await response.json()
        
        if (data.success) {
          setIntegrationStatus(data.status)
          setLastSyncTime(data.lastSyncTime)
        } else {
          setIntegrationStatus("error")
        }
      } else {
        setIntegrationStatus("disconnected")
      }
    } catch (error) {
      console.error('Error checking integration status:', error)
      setIntegrationStatus("error")
    }
  }
  
  // Function to sync with ERP/HCM system
  const syncWithERP = async () => {
    try {
      setIsLoading(true)
      
      const response = await fetch('/api/organization/integration/sync', {
        method: 'POST',
      })
      
      if (!response.ok) {
        throw new Error('Failed to sync with ERP/HCM system')
      }
      
      const result = await response.json()
      
      if (result.success) {
        toast({
          title: "Sync Complete",
          description: `Successfully synchronized with ERP/HCM system. ${result.stats?.added || 0} employees added, ${result.stats?.updated || 0} updated.`,
        })
        fetchOrgData() // Refresh org data
        setLastSyncTime(new Date().toISOString())
        setIntegrationStatus("connected")
      } else {
        throw new Error(result.error || 'Sync operation failed')
      }
    } catch (error) {
      console.error('Error syncing with ERP/HCM:', error)
      toast({
        title: "Sync Failed",
        description: error instanceof Error ? error.message : "Failed to sync with ERP/HCM system",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setShowIntegrationDialog(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 pl-10"
            />
          </div>
          
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "standard" | "complex" | "analytics")}>
            <TabsList>
              <TabsTrigger value="standard">Standard</TabsTrigger>
              <TabsTrigger value="complex">Complex</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="flex items-center gap-4">
          {/* ERP Integration Control */}
          <Button 
            variant={integrationStatus === "connected" ? "default" : "outline"}
            onClick={() => setShowIntegrationDialog(true)}
          >
            <Database className="h-4 w-4 mr-2" />
            {integrationStatus === "connected" 
              ? "Connected" 
              : integrationStatus === "error" 
                ? "Connection Error" 
                : "Connect ERP"}
          </Button>
          
          {allowExport && (
            <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <FileDown className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Export Organization Chart</DialogTitle>
                  <DialogDescription>
                    Choose your preferred export format and options
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                  <div className="grid grid-cols-4 items-center gap-2">
                    <Label htmlFor="format" className="text-right">Format</Label>
                    <Select 
                      value={exportOptions.format} 
                      onValueChange={(value) => setExportOptions({...exportOptions, format: value as any})}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF Document</SelectItem>
                        <SelectItem value="png">PNG Image</SelectItem>
                        <SelectItem value="svg">SVG Vector</SelectItem>
                        <SelectItem value="excel">Excel/CSV</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-2">
                    <Label htmlFor="title" className="text-right">Title</Label>
                    <Input
                      id="title"
                      placeholder="Organization Chart"
                      className="col-span-3"
                      value={exportOptions.title || ""}
                      onChange={e => setExportOptions({...exportOptions, title: e.target.value})}
                    />
                  </div>
                  
                  {(exportOptions.format === "pdf") && (
                    <>
                      <div className="grid grid-cols-4 items-center gap-2">
                        <Label htmlFor="paperSize" className="text-right">Paper Size</Label>
                        <Select 
                          value={exportOptions.paperSize || "a4"} 
                          onValueChange={(value) => setExportOptions({...exportOptions, paperSize: value as any})}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select paper size" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="a4">A4</SelectItem>
                            <SelectItem value="letter">Letter</SelectItem>
                            <SelectItem value="legal">Legal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="grid grid-cols-4 items-center gap-2">
                        <Label htmlFor="orientation" className="text-right">Orientation</Label>
                        <Select 
                          value={exportOptions.orientation || "landscape"} 
                          onValueChange={(value) => setExportOptions({...exportOptions, orientation: value as any})}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select orientation" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="landscape">Landscape</SelectItem>
                            <SelectItem value="portrait">Portrait</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                  
                  <div className="grid grid-cols-4 items-start gap-2">
                    <div className="text-right pt-2">Options</div>
                    <div className="col-span-3 space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="includeDate" 
                          checked={exportOptions.includeDate}
                          onCheckedChange={(checked) => 
                            setExportOptions({...exportOptions, includeDate: !!checked})
                          }
                        />
                        <Label htmlFor="includeDate">Include generation date</Label>
                      </div>
                      
                      {(exportOptions.format === "excel" || exportOptions.format === "svg") && (
                        <>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="showMetadata" 
                              checked={exportOptions.showMetadata}
                              onCheckedChange={(checked) => 
                                setExportOptions({...exportOptions, showMetadata: !!checked})
                              }
                            />
                            <Label htmlFor="showMetadata">Include employee metadata</Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="showDottedLines" 
                              checked={exportOptions.showDottedLines}
                              onCheckedChange={(checked) => 
                                setExportOptions({...exportOptions, showDottedLines: !!checked})
                              }
                            />
                            <Label htmlFor="showDottedLines">Include dotted-line relationships</Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="showMatrixRelationships" 
                              checked={exportOptions.showMatrixRelationships}
                              onCheckedChange={(checked) => 
                                setExportOptions({...exportOptions, showMatrixRelationships: !!checked})
                              }
                            />
                            <Label htmlFor="showMatrixRelationships">Include matrix relationships</Label>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowExportDialog(false)}>Cancel</Button>
                  <Button onClick={handleExport}>Export</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          
          <Dialog open={showAIPrompt} onOpenChange={setShowAIPrompt}>
            <DialogTrigger asChild>
              <Button>Generate from Prompt</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate Organization Chart</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Describe your organization structure..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[100px]"
                />
                <Button onClick={handleGenerateFromPrompt}>Generate</Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" onClick={fetchOrgData} title="Refresh organization data">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleZoomChange(Math.max(25, zoom - 25))}
              disabled={zoom <= 25}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="w-16 text-center">{zoom}%</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleZoomChange(Math.min(200, zoom + 25))}
              disabled={zoom >= 200}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Integration Dialog */}
      <Dialog open={showIntegrationDialog} onOpenChange={setShowIntegrationDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>ERP/HCM Integration</DialogTitle>
            <DialogDescription>
              Connect to your HR system to automatically keep your organization chart up to date
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="rounded-md bg-muted p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Integration Status</h4>
                  <p className="text-sm text-muted-foreground">
                    {integrationStatus === "connected" 
                      ? `Connected. Last sync: ${lastSyncTime ? new Date(lastSyncTime).toLocaleString() : 'Never'}` 
                      : integrationStatus === "error" 
                        ? "Error connecting to ERP/HCM system" 
                        : "Not connected to any ERP/HCM system"}
                  </p>
                </div>
                <div>
                  <div className={`h-3 w-3 rounded-full ${
                    integrationStatus === "connected" 
                      ? "bg-green-500" 
                      : integrationStatus === "error" 
                        ? "bg-red-500" 
                        : "bg-yellow-500"
                  }`} />
                </div>
              </div>
            </div>
            
            <div>
              <Label htmlFor="erp-provider">ERP/HCM Provider</Label>
              <Select defaultValue="workday">
                <SelectTrigger>
                  <SelectValue placeholder="Select ERP Provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="workday">Workday</SelectItem>
                  <SelectItem value="sap">SAP SuccessFactors</SelectItem>
                  <SelectItem value="oracle">Oracle HCM</SelectItem>
                  <SelectItem value="adp">ADP</SelectItem>
                  <SelectItem value="custom">Custom API</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="api-endpoint">API Endpoint</Label>
              <Input id="api-endpoint" placeholder="https://api.example.com/v1" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="client-id">Client ID</Label>
                <Input id="client-id" type="password" />
              </div>
              
              <div>
                <Label htmlFor="client-secret">Client Secret</Label>
                <Input id="client-secret" type="password" />
              </div>
            </div>
            
            <div>
              <Label htmlFor="sync-frequency">Sync Frequency</Label>
              <Select defaultValue="daily">
                <SelectTrigger>
                  <SelectValue placeholder="Select Sync Frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="manual">Manual Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch id="auto-sync" />
              <Label htmlFor="auto-sync">Enable automatic synchronization</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="destructive" 
              className={integrationStatus === "disconnected" ? "hidden" : ""}
              onClick={() => {
                setIntegrationStatus("disconnected")
                setLastSyncTime(null)
                toast({
                  title: "Disconnected",
                  description: "Successfully disconnected from ERP/HCM system.",
                })
                setShowIntegrationDialog(false)
              }}
            >
              Disconnect
            </Button>
            <Button variant="outline" onClick={() => setShowIntegrationDialog(false)}>Cancel</Button>
            <Button onClick={syncWithERP} disabled={isLoading}>
              {isLoading ? <LoadingSpinner size="sm" /> : null}
              {integrationStatus === "connected" ? "Sync Now" : "Connect & Sync"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Card className="overflow-auto p-4">
        {/* Add legend for complex view */}
        {viewMode === "complex" && (
          <div className="flex items-center gap-6 mb-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-0.5 w-6 bg-gray-600"></div>
              <span>Direct Report</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-0.5 w-6 bg-sky-400 border-t border-dashed"></div>
              <span>Dotted Line</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-0.5 w-6 bg-purple-400 border-t border-dashed"></div>
              <span>Matrix Relationship</span>
            </div>
          </div>
        )}
      
        {isLoading ? (
          <div className="flex justify-center items-center h-[800px]">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div ref={chartContainerRef} className="min-w-[1200px] min-h-[800px] transition-transform duration-200" />
        )}
      </Card>
    </div>
  )
}

export default OrgChart
