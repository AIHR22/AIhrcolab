"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function WorkforceSetupPage() {
  const [tablesStatus, setTablesStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [tablesMessage, setTablesMessage] = useState("");
  
  const [dataStatus, setDataStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [dataMessage, setDataMessage] = useState("");
  
  const createTables = async () => {
    setTablesStatus("loading");
    setTablesMessage("");
    
    try {
      const response = await fetch("/api/setup/create-workforce-tables", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setTablesStatus("success");
        setTablesMessage(data.message || "Tables created successfully");
      } else {
        setTablesStatus("error");
        setTablesMessage(data.error || "Failed to create tables");
      }
    } catch (error) {
      setTablesStatus("error");
      setTablesMessage("An error occurred while creating tables");
      console.error("Error creating tables:", error);
    }
  };
  
  const populateData = async () => {
    setDataStatus("loading");
    setDataMessage("");
    
    try {
      const response = await fetch("/api/setup/populate-workforce-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setDataStatus("success");
        setDataMessage(data.message || "Data populated successfully");
      } else {
        setDataStatus("error");
        setDataMessage(data.error || "Failed to populate data");
      }
    } catch (error) {
      setDataStatus("error");
      setDataMessage("An error occurred while populating data");
      console.error("Error populating data:", error);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Workforce Planning Setup</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>1. Create Database Tables</CardTitle>
            <CardDescription>
              This will create all necessary tables for workforce planning if they don't exist
              and add required columns to existing tables.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={createTables}
              disabled={tablesStatus === "loading"}
              variant="default"
              size="lg"
              className="w-full"
            >
              {tablesStatus === "loading" && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Tables
            </Button>
            
            {tablesStatus === "success" && (
              <Alert className="mt-4 border-green-500 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>
                  {tablesMessage}
                </AlertDescription>
              </Alert>
            )}
            
            {tablesStatus === "error" && (
              <Alert className="mt-4 border-red-500 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {tablesMessage}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>2. Populate Test Data</CardTitle>
            <CardDescription>
              This will populate tables with sample data for testing the workforce planning module.
              Data will only be added if it doesn't already exist.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={populateData}
              disabled={dataStatus === "loading" || tablesStatus !== "success"}
              variant={tablesStatus === "success" ? "default" : "outline"}
              size="lg"
              className="w-full"
            >
              {dataStatus === "loading" && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Populate Data
            </Button>
            
            {tablesStatus !== "success" && (
              <p className="text-sm text-muted-foreground mt-2">
                Please create tables first before populating data.
              </p>
            )}
            
            {dataStatus === "success" && (
              <Alert className="mt-4 border-green-500 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>
                  {dataMessage}
                </AlertDescription>
              </Alert>
            )}
            
            {dataStatus === "error" && (
              <Alert className="mt-4 border-red-500 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {dataMessage}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
            <CardDescription>
              After setting up your database, you can start using the workforce planning features.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Go to the <a href="/workforce" className="text-blue-600 hover:underline">Workforce Dashboard</a> to see your data
              </li>
              <li>
                Check the <a href="/projects" className="text-blue-600 hover:underline">Projects page</a> to view project allocations
              </li>
              <li>
                Explore the <a href="/employees" className="text-blue-600 hover:underline">Employees section</a> to see skills and performance data
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 