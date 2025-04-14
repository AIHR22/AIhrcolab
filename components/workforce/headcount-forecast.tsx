"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, TrendingUp, Download } from "lucide-react"

interface HeadcountForecastProps {
  forecastData: {
    department_id: string;
    current_headcount: number;
    projections: {
      month: string; // Format: "YYYY-MM"
      headcount: number;
    }[];
    growth_rate: number;
    confidence: number;
    key_findings: string[];
  };
}

export function HeadcountForecast({ forecastData }: HeadcountForecastProps) {
  const {
    current_headcount,
    projections,
    growth_rate,
    confidence,
    key_findings,
  } = forecastData;

  const lastProjection = projections[projections.length - 1];
  const firstProjection = projections[0];
  const netChange = lastProjection.headcount - current_headcount;
  const percentChange = (netChange / current_headcount) * 100;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center text-xl">
              <Users className="mr-2 h-5 w-5" /> Headcount Forecast
            </CardTitle>
            <CardDescription>
              12-month headcount prediction
            </CardDescription>
          </div>
          <Badge variant={percentChange >= 0 ? "default" : "destructive"} className="ml-auto">
            {percentChange >= 0 ? "+" : ""}{percentChange.toFixed(1)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Current</p>
            <p className="text-2xl font-bold">{current_headcount}</p>
          </div>
          <div className="text-center">
            <TrendingUp className="mx-auto h-5 w-5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Growth</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Projected</p>
            <p className="text-2xl font-bold">{lastProjection.headcount}</p>
          </div>
        </div>

        {/* Simplified Chart - In a production app, you would use a real chart library */}
        <div className="h-[150px] w-full bg-muted rounded-md p-4 relative">
          <div className="absolute inset-0 flex items-end px-4 pb-4">
            {projections.map((projection, index) => {
              const height = (projection.headcount / (lastProjection.headcount * 1.1)) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className={`w-6 rounded-t ${
                      projection.headcount > current_headcount 
                        ? "bg-primary" 
                        : "bg-destructive"
                    }`} 
                    style={{ height: `${height}%` }}
                  />
                  {index % 3 === 0 && (
                    <div className="text-[10px] text-muted-foreground mt-1">
                      {new Date(projection.month).toLocaleDateString(undefined, { month: 'short' })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Key Findings */}
        <div>
          <h4 className="font-medium mb-2 text-sm">Key Findings</h4>
          <ul className="text-sm space-y-1">
            {key_findings.map((finding, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-2">•</span>
                <span>{finding}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div>Confidence: {confidence}%</div>
          <div>Based on historical data and industry trends</div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" className="w-full">
          <Download className="mr-2 h-4 w-4" />
          Export Forecast Data
        </Button>
      </CardFooter>
    </Card>
  );
} 