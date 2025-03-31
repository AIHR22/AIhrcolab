"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Activity, FileText, GraduationCap } from "lucide-react"

interface SkillGap {
  skill: string;
  level: "High" | "Medium" | "Low";
  current_count: number;
  required_count: number;
  recommendation: string;
}

interface SkillGapAnalysisProps {
  data: {
    department_id: string;
    department_name?: string;
    analysis_date: string;
    gaps: SkillGap[];
    training_recommendations: string[];
    hiring_recommendations: string[];
  };
}

export function SkillGapAnalysis({ data }: SkillGapAnalysisProps) {
  const { gaps, training_recommendations, hiring_recommendations } = data;
  
  // Count gaps by severity
  const highGaps = gaps.filter(gap => gap.level === "High").length;
  const mediumGaps = gaps.filter(gap => gap.level === "Medium").length;
  const lowGaps = gaps.filter(gap => gap.level === "Low").length;
  
  // Calculate total gap count (required - current)
  const totalGapCount = gaps.reduce((sum, gap) => sum + (gap.required_count - gap.current_count), 0);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center text-xl">
              <Activity className="mr-2 h-5 w-5" /> Skill Gap Analysis
            </CardTitle>
            <CardDescription>
              Current skill deficits and recommendations
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <div className="text-center p-2 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground">High Priority</p>
              <p className="text-lg font-semibold text-destructive">{highGaps}</p>
            </div>
            <div className="text-center p-2 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground">Medium</p>
              <p className="text-lg font-semibold text-amber-500">{mediumGaps}</p>
            </div>
            <div className="text-center p-2 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground">Low</p>
              <p className="text-lg font-semibold text-green-500">{lowGaps}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total Gap</p>
            <p className="text-lg font-semibold">{totalGapCount}</p>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Skill</TableHead>
              <TableHead>Gap</TableHead>
              <TableHead className="text-right">Current</TableHead>
              <TableHead className="text-right">Required</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {gaps.map((gap) => (
              <TableRow key={gap.skill}>
                <TableCell className="font-medium">{gap.skill}</TableCell>
                <TableCell>
                  <Badge variant={
                    gap.level === 'High' ? 'destructive' : 
                    gap.level === 'Medium' ? 'default' : 'outline'
                  }>
                    {gap.level}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{gap.current_count}</TableCell>
                <TableCell className="text-right">{gap.required_count}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center">
              <GraduationCap className="mr-2 h-4 w-4" /> Training Recommendations
            </h4>
            <ul className="text-sm space-y-1 pl-2">
              {training_recommendations.map((rec, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center">
              <FileText className="mr-2 h-4 w-4" /> Hiring Recommendations
            </h4>
            <ul className="text-sm space-y-1 pl-2">
              {hiring_recommendations.map((rec, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm">
          Generate Training Plan
        </Button>
        <Button size="sm">
          Create Job Requisitions
        </Button>
      </CardFooter>
    </Card>
  );
} 