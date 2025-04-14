"use client"

import { useState } from "react"
import { MinusCircle, PlusCircle, Search, ZoomIn, ZoomOut } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

// This is a simplified org chart component
// In a real application, you would use a library like react-org-chart or d3.js
export function OrganizationChart() {
  const [zoomLevel, setZoomLevel] = useState(100)

  const increaseZoom = () => {
    setZoomLevel((prev) => Math.min(prev + 10, 150))
  }

  const decreaseZoom = () => {
    setZoomLevel((prev) => Math.max(prev - 10, 50))
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search employees..." className="pl-8" />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={decreaseZoom}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm">{zoomLevel}%</span>
          <Button variant="outline" size="icon" onClick={increaseZoom}>
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Separator />

      <div
        className="min-h-[500px] overflow-auto rounded-md border p-4"
        style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "top center" }}
      >
        <div className="flex flex-col items-center gap-4">
          {/* CEO */}
          <div className="flex flex-col items-center">
            <OrgChartNode
              name="Robert Johnson"
              position="CEO"
              department="Executive"
              avatar="/placeholder.svg?height=64&width=64"
              isRoot
            />

            <div className="h-8 w-px bg-border" />

            {/* Direct reports to CEO */}
            <div className="flex flex-wrap justify-center gap-8">
              <div className="flex flex-col items-center">
                <div className="h-8 w-px bg-border" />
                <OrgChartNode
                  name="Sarah Williams"
                  position="CTO"
                  department="Technology"
                  avatar="/placeholder.svg?height=64&width=64"
                />

                <div className="h-8 w-px bg-border" />

                {/* Engineering team */}
                <div className="flex flex-wrap justify-center gap-4">
                  <div className="flex flex-col items-center">
                    <div className="h-8 w-px bg-border" />
                    <OrgChartNode
                      name="Michael Chen"
                      position="Engineering Director"
                      department="Engineering"
                      avatar="/placeholder.svg?height=64&width=64"
                      isCollapsible
                    />
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="h-8 w-px bg-border" />
                    <OrgChartNode
                      name="Emily Rodriguez"
                      position="Product Director"
                      department="Product"
                      avatar="/placeholder.svg?height=64&width=64"
                      isCollapsible
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <div className="h-8 w-px bg-border" />
                <OrgChartNode
                  name="David Wilson"
                  position="CFO"
                  department="Finance"
                  avatar="/placeholder.svg?height=64&width=64"
                />

                <div className="h-8 w-px bg-border" />

                {/* Finance team */}
                <div className="flex flex-wrap justify-center gap-4">
                  <div className="flex flex-col items-center">
                    <div className="h-8 w-px bg-border" />
                    <OrgChartNode
                      name="Jennifer Lee"
                      position="Finance Director"
                      department="Finance"
                      avatar="/placeholder.svg?height=64&width=64"
                      isCollapsible
                    />
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="h-8 w-px bg-border" />
                    <OrgChartNode
                      name="Thomas Brown"
                      position="Accounting Manager"
                      department="Finance"
                      avatar="/placeholder.svg?height=64&width=64"
                      isCollapsible
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <div className="h-8 w-px bg-border" />
                <OrgChartNode
                  name="Lisa Martinez"
                  position="CHRO"
                  department="Human Resources"
                  avatar="/placeholder.svg?height=64&width=64"
                />

                <div className="h-8 w-px bg-border" />

                {/* HR team */}
                <div className="flex flex-wrap justify-center gap-4">
                  <div className="flex flex-col items-center">
                    <div className="h-8 w-px bg-border" />
                    <OrgChartNode
                      name="James Taylor"
                      position="HR Director"
                      department="Human Resources"
                      avatar="/placeholder.svg?height=64&width=64"
                      isCollapsible
                    />
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="h-8 w-px bg-border" />
                    <OrgChartNode
                      name="Sophia Garcia"
                      position="Talent Acquisition Manager"
                      department="Human Resources"
                      avatar="/placeholder.svg?height=64&width=64"
                      isCollapsible
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface OrgChartNodeProps {
  name: string
  position: string
  department: string
  avatar: string
  isRoot?: boolean
  isCollapsible?: boolean
}

function OrgChartNode({
  name,
  position,
  department,
  avatar,
  isRoot = false,
  isCollapsible = false,
}: OrgChartNodeProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div
      className={`
        flex flex-col items-center rounded-lg border p-4 shadow-sm
        ${isRoot ? "bg-primary/5 border-primary/20" : "bg-card"}
      `}
    >
      <Avatar className="h-16 w-16 mb-2">
        <AvatarImage src={avatar} alt={name} />
        <AvatarFallback>
          {name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </AvatarFallback>
      </Avatar>
      <h3 className="text-base font-medium">{name}</h3>
      <p className="text-sm text-muted-foreground">{position}</p>
      <Badge variant="outline" className="mt-1">
        {department}
      </Badge>

      {isCollapsible && (
        <Button variant="ghost" size="icon" className="mt-2 h-6 w-6" onClick={() => setIsCollapsed(!isCollapsed)}>
          {isCollapsed ? <PlusCircle className="h-4 w-4" /> : <MinusCircle className="h-4 w-4" />}
        </Button>
      )}
    </div>
  )
}

