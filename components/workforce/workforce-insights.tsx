"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BrainCircuit, AlertTriangle, TrendingUp, UserCog, SendHorizonal } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface InsightCategory {
  name: string;
  description: string;
  insights: {
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
    actionable: boolean;
  }[];
}

interface WorkforceInsightsProps {
  data: {
    department_id: string;
    department_name?: string;
    analysis_date: string;
    categories: InsightCategory[];
    summary: string;
  };
}

export function WorkforceInsights({ data }: WorkforceInsightsProps) {
  const { categories, summary } = data;
  
  // Count high priority insights for highlighting
  const highPriorityCount = categories.reduce(
    (count, category) => 
      count + category.insights.filter(insight => insight.priority === "high").length, 
    0
  );
  
  // Count actionable insights
  const actionableCount = categories.reduce(
    (count, category) => 
      count + category.insights.filter(insight => insight.actionable).length, 
    0
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center text-xl">
              <BrainCircuit className="mr-2 h-5 w-5" /> AI-Powered Insights
            </CardTitle>
            <CardDescription>
              Strategic recommendations and observations
            </CardDescription>
          </div>
          {highPriorityCount > 0 && (
            <Badge variant="destructive" className="ml-auto">
              {highPriorityCount} High Priority
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 border rounded-md bg-muted/50">
          <p className="italic text-sm">{summary}</p>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <div className="text-center p-2 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground">Insights</p>
              <p className="text-lg font-semibold">
                {categories.reduce((count, category) => count + category.insights.length, 0)}
              </p>
            </div>
            <div className="text-center p-2 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground">Actionable</p>
              <p className="text-lg font-semibold text-primary">{actionableCount}</p>
            </div>
            <div className="text-center p-2 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground">Categories</p>
              <p className="text-lg font-semibold">{categories.length}</p>
            </div>
          </div>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {categories.map((category, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-base font-medium">
                {category.name}
                {category.insights.some(i => i.priority === "high") && (
                  <AlertTriangle className="ml-2 h-4 w-4 text-destructive" />
                )}
              </AccordionTrigger>
              <AccordionContent>
                <div className="pt-2 pb-4">
                  <p className="text-sm text-muted-foreground mb-4">{category.description}</p>
                  <div className="space-y-4">
                    {category.insights.map((insight, i) => (
                      <div 
                        key={i} 
                        className={`p-3 border rounded-md ${
                          insight.priority === "high" 
                            ? "border-destructive/30 bg-destructive/5" 
                            : insight.priority === "medium"
                              ? "border-amber-500/30 bg-amber-500/5"
                              : "border-muted"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-medium flex items-center">
                            {insight.priority === "high" ? (
                              <AlertTriangle className="mr-2 h-4 w-4 text-destructive" />
                            ) : insight.priority === "medium" ? (
                              <TrendingUp className="mr-2 h-4 w-4 text-amber-500" />
                            ) : (
                              <UserCog className="mr-2 h-4 w-4 text-muted-foreground" />
                            )}
                            {insight.title}
                          </h4>
                          {insight.priority === "high" && (
                            <Badge variant="outline" className="text-destructive border-destructive">
                              High Priority
                            </Badge>
                          )}
                          {insight.priority === "medium" && (
                            <Badge variant="outline" className="text-amber-500 border-amber-500">
                              Medium Priority
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{insight.description}</p>
                        {insight.actionable && (
                          <div className="mt-2 flex justify-end">
                            <Button size="sm" variant="outline" className="text-xs h-7">
                              Create Action
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
      <CardFooter>
        <Button className="w-full">
          <SendHorizonal className="mr-2 h-4 w-4" />
          Generate Detailed Report
        </Button>
      </CardFooter>
    </Card>
  );
} 