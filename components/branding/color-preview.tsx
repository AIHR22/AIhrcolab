"use client"

import { useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ColorPreviewProps {
  primaryColor: string
  secondaryColor: string
}

export function ColorPreview({ primaryColor, secondaryColor }: ColorPreviewProps) {
  // Simplified chart-like sample component
  const ChartSample = () => {
    return (
      <div className="w-full h-40 relative">
        <div className="absolute inset-0 p-4">
          <div className="h-full flex items-end space-x-4">
            {/* Primary color bar */}
            <div 
              className="w-10 h-60%" 
              style={{ backgroundColor: primaryColor, height: '60%', borderRadius: '4px 4px 0 0' }}
            ></div>
            {/* Secondary color bar */}
            <div 
              className="w-10 h-80%" 
              style={{ backgroundColor: secondaryColor, height: '80%', borderRadius: '4px 4px 0 0' }}
            ></div>
            {/* Primary color light variant bar */}
            <div 
              className="w-10 h-40%" 
              style={{ 
                backgroundColor: `${primaryColor}99`, 
                height: '40%', 
                borderRadius: '4px 4px 0 0' 
              }}
            ></div>
            {/* Secondary color light variant bar */}
            <div 
              className="w-10 h-30%" 
              style={{ 
                backgroundColor: `${secondaryColor}99`, 
                height: '30%',
                borderRadius: '4px 4px 0 0' 
              }}
            ></div>
          </div>
          {/* X-axis */}
          <div 
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-300"
          ></div>
        </div>
      </div>
    )
  }

  return (
    <Card className="p-4">
      <div className="text-sm font-medium mb-4">Preview</div>
      <CardContent className="space-y-6 p-0">
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">Buttons</div>
          <div className="flex flex-wrap gap-2">
            <Button 
              style={{ backgroundColor: primaryColor }}
            >
              Primary Button
            </Button>
            <Button 
              variant="outline" 
              style={{ 
                borderColor: primaryColor, 
                color: primaryColor 
              }}
            >
              Outline Button
            </Button>
            <Button 
              style={{ backgroundColor: secondaryColor }}
            >
              Secondary Button
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">Chart Elements</div>
          <ChartSample />
        </div>
      </CardContent>
    </Card>
  )
}
