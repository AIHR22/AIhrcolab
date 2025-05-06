"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { CheckCircle2, Coffee, Compass, DollarSign, Download, PlusCircle, TrendingDown, TrendingUp, Users } from "lucide-react"

interface ScenarioFactor {
  name: string;
  currentValue: number;
  minValue: number;
  maxValue: number;
  unit: "%" | "#" | "$" | "";
  description: string;
}

interface ScenarioResult {
  name: string;
  description: string;
  factors: {
    [key: string]: number;
  };
  outcomes: {
    costImpact: number;
    headcountDelta: number;
    timelineImpact: number;
    riskLevel: "low" | "medium" | "high";
    benefitLevel: "low" | "medium" | "high";
  };
}

interface ScenarioModelingProps {
  factorDefinitions: ScenarioFactor[];
  presetScenarios: ScenarioResult[];
  departmentId: string;
  departmentName?: string;
}

export function ScenarioModeling({ 
  factorDefinitions, 
  presetScenarios, 
  departmentId,
  departmentName 
}: ScenarioModelingProps) {
  const [activeTab, setActiveTab] = useState("presets");
  const [customFactors, setCustomFactors] = useState(
    factorDefinitions.reduce((acc, factor) => {
      acc[factor.name] = factor.currentValue;
      return acc;
    }, {} as { [key: string]: number })
  );
  const [customScenarioName, setCustomScenarioName] = useState("Custom Scenario");
  const [customScenarioResult, setCustomScenarioResult] = useState<ScenarioResult | null>(null);
  
  const handleFactorChange = (factorName: string, value: number) => {
    setCustomFactors(prev => ({
      ...prev,
      [factorName]: value
    }));
  };
  
  const runCustomScenario = async () => {
    // In a real app, this would call an API
    // For demo purposes, we'll simulate a result
    setCustomScenarioResult({
      name: customScenarioName,
      description: "Custom scenario based on adjusted factors",
      factors: customFactors,
      outcomes: {
        costImpact: Math.round((customFactors["Hiring Rate"] * 10000) - (customFactors["Attrition Rate"] * 8000)),
        headcountDelta: Math.round(customFactors["Hiring Rate"] - customFactors["Attrition Rate"]),
        timelineImpact: Math.round((customFactors["Efficiency Improvement"] - 5) * -3),
        riskLevel: customFactors["Attrition Rate"] > 15 ? "high" : "medium",
        benefitLevel: customFactors["Efficiency Improvement"] > 10 ? "high" : "medium"
      }
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center text-xl">
              <Compass className="mr-2 h-5 w-5" /> Scenario Modeling
            </CardTitle>
            <CardDescription>
              Compare different workforce planning scenarios
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="presets" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="presets">Preset Scenarios</TabsTrigger>
            <TabsTrigger value="custom">Custom Scenario</TabsTrigger>
          </TabsList>
          
          <TabsContent value="presets" className="space-y-4 pt-4">
            <div className="grid gap-4">
              {presetScenarios.map((scenario, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base">{scenario.name}</CardTitle>
                      <Badge 
                        variant={
                          scenario.outcomes.benefitLevel === "high" ? "default" : 
                          scenario.outcomes.benefitLevel === "medium" ? "outline" : "secondary"
                        }
                      >
                        {scenario.outcomes.benefitLevel === "high" ? "Recommended" : 
                         scenario.outcomes.benefitLevel === "medium" ? "Good" : "Neutral"}
                      </Badge>
                    </div>
                    <CardDescription>{scenario.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Cost Impact</p>
                          <p className={`font-medium ${scenario.outcomes.costImpact >= 0 ? 'text-destructive' : 'text-green-500'}`}>
                            {scenario.outcomes.costImpact >= 0 ? '+' : ''}
                            ${Math.abs(scenario.outcomes.costImpact).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Headcount</p>
                          <p className={`font-medium ${scenario.outcomes.headcountDelta >= 0 ? 'text-primary' : 'text-destructive'}`}>
                            {scenario.outcomes.headcountDelta >= 0 ? '+' : ''}
                            {scenario.outcomes.headcountDelta}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Coffee className="h-4 w-4 mr-2 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Timeline</p>
                          <p className={`font-medium ${scenario.outcomes.timelineImpact <= 0 ? 'text-green-500' : 'text-destructive'}`}>
                            {scenario.outcomes.timelineImpact <= 0 ? '' : '+'}
                            {scenario.outcomes.timelineImpact} days
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {scenario.outcomes.riskLevel === "low" ? (
                          <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                        ) : scenario.outcomes.riskLevel === "medium" ? (
                          <TrendingUp className="h-4 w-4 mr-2 text-amber-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 mr-2 text-destructive" />
                        )}
                        <div>
                          <p className="text-xs text-muted-foreground">Risk Level</p>
                          <p className={`font-medium capitalize ${
                            scenario.outcomes.riskLevel === "low" ? 'text-green-500' : 
                            scenario.outcomes.riskLevel === "medium" ? 'text-amber-500' : 'text-destructive'
                          }`}>
                            {scenario.outcomes.riskLevel}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium mb-2">Key Factors:</p>
                      <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                        {Object.entries(scenario.factors).map(([name, value]) => (
                          <div key={name} className="flex justify-between text-xs">
                            <span className="text-muted-foreground">{name}:</span>
                            <span>{value}{factorDefinitions.find(f => f.name === name)?.unit || ''}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-muted/50 flex justify-between">
                    <Button variant="ghost" size="sm">Compare</Button>
                    <Button size="sm">Apply Scenario</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="custom" className="space-y-6 pt-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <Label htmlFor="scenario-name">Scenario Name</Label>
                  <Input 
                    id="scenario-name" 
                    value={customScenarioName} 
                    onChange={(e) => setCustomScenarioName(e.target.value)} 
                    className="max-w-xs"
                  />
                </div>
                <Button onClick={runCustomScenario}>
                  Run Scenario
                </Button>
              </div>
              
              <div className="grid gap-6 pb-6">
                {factorDefinitions.map((factor) => (
                  <div key={factor.name} className="space-y-2">
                    <div className="flex justify-between">
                      <Label>{factor.name}</Label>
                      <div className="flex items-center">
                        <span className="font-medium">
                          {customFactors[factor.name]}
                        </span>
                        <span className="text-muted-foreground ml-1">
                          {factor.unit}
                        </span>
                      </div>
                    </div>
                    <Slider
                      defaultValue={[factor.currentValue]}
                      max={factor.maxValue}
                      min={factor.minValue}
                      step={(factor.maxValue - factor.minValue) / 20}
                      onValueChange={(values) => handleFactorChange(factor.name, values[0])}
                    />
                    <p className="text-xs text-muted-foreground">{factor.description}</p>
                  </div>
                ))}
              </div>
              
              {customScenarioResult && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Results: {customScenarioResult.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Cost Impact</p>
                          <p className={`font-medium ${customScenarioResult.outcomes.costImpact >= 0 ? 'text-destructive' : 'text-green-500'}`}>
                            {customScenarioResult.outcomes.costImpact >= 0 ? '+' : ''}
                            ${Math.abs(customScenarioResult.outcomes.costImpact).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Headcount</p>
                          <p className={`font-medium ${customScenarioResult.outcomes.headcountDelta >= 0 ? 'text-primary' : 'text-destructive'}`}>
                            {customScenarioResult.outcomes.headcountDelta >= 0 ? '+' : ''}
                            {customScenarioResult.outcomes.headcountDelta}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Coffee className="h-4 w-4 mr-2 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Timeline</p>
                          <p className={`font-medium ${customScenarioResult.outcomes.timelineImpact <= 0 ? 'text-green-500' : 'text-destructive'}`}>
                            {customScenarioResult.outcomes.timelineImpact <= 0 ? '' : '+'}
                            {customScenarioResult.outcomes.timelineImpact} days
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {customScenarioResult.outcomes.riskLevel === "low" ? (
                          <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                        ) : customScenarioResult.outcomes.riskLevel === "medium" ? (
                          <TrendingUp className="h-4 w-4 mr-2 text-amber-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 mr-2 text-destructive" />
                        )}
                        <div>
                          <p className="text-xs text-muted-foreground">Risk Level</p>
                          <p className={`font-medium capitalize ${
                            customScenarioResult.outcomes.riskLevel === "low" ? 'text-green-500' : 
                            customScenarioResult.outcomes.riskLevel === "medium" ? 'text-amber-500' : 'text-destructive'
                          }`}>
                            {customScenarioResult.outcomes.riskLevel}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Export Results
                    </Button>
                    <Button size="sm">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Save Scenario
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 