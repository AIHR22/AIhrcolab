"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"

interface GenerateOrgDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onGenerated: () => void
}

export function GenerateOrgDialog({ open, onOpenChange, onGenerated }: GenerateOrgDialogProps) {
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [promptTemplate, setPromptTemplate] = useState<string | null>(null)
  const [structureType, setStructureType] = useState("hierarchical")
  const [companySize, setCompanySize] = useState("medium")
  const { toast } = useToast()

  // Sample prompt templates to help users
  const promptTemplates = {
    tech: "A medium-sized tech company with engineering, product, marketing, and sales departments, focusing on software development.",
    healthcare: "A large healthcare organization with medical, nursing, administration, and support departments.",
    education: "A university with academic departments, student affairs, and administrative divisions.",
    finance: "A financial services firm with investment banking, wealth management, trading, and compliance departments."
  }

  const handleTemplateSelect = (template: keyof typeof promptTemplates) => {
    setPromptTemplate(template)
    setPrompt(promptTemplates[template])
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt describing your organization",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      console.log("Sending request to generate organization structure with prompt:", prompt);
      
      const response = await fetch("/api/organization/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          prompt,
          structure_type: structureType,
          company_size: companySize
        }),
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || "Failed to generate organization structure")
      }

      if (result.success && result.data) {
        toast({
          title: "Success",
          description: "Organization structure generated successfully",
        })
        
        // Notify parent component of successful generation
        onGenerated()
        onOpenChange(false)
        setPrompt("")
      } else {
        throw new Error(result.error || "Unknown error occurred")
      }
    } catch (error: any) {
      console.error("Error generating organization structure:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to generate organization structure",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  // Helper function to update the organization data in the API
  const updateOrganizationData = async (data: any) => {
    try {
      const response = await fetch("/api/organization", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update organization data");
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error updating organization data:", error);
      // We don't want to throw here - the generation was successful
      // Just log the error and let the user know
      toast({
        title: "Warning",
        description: "Organization structure generated but not saved permanently. You may need to regenerate it later.",
        variant: "default",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Generate Organization Structure</DialogTitle>
          <DialogDescription>
            Describe your organization and we'll generate a structure for you using AI.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="prompt">Organization Description</Label>
              <div className="text-xs text-muted-foreground">
                <Button variant="ghost" size="sm" onClick={() => setPromptTemplate(null)}>
                  Clear
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={promptTemplate === "tech" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTemplateSelect("tech")}
                >
                  Tech Company
                </Button>
                <Button
                  variant={promptTemplate === "healthcare" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTemplateSelect("healthcare")}
                >
                  Healthcare
                </Button>
                <Button
                  variant={promptTemplate === "education" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTemplateSelect("education")}
                >
                  Education
                </Button>
                <Button
                  variant={promptTemplate === "finance" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTemplateSelect("finance")}
                >
                  Finance
                </Button>
              </div>
              
              <Textarea
                placeholder="Describe your organization (e.g., 'A tech startup with 25 employees, focused on AI software development with engineering, product, sales, and operations teams')"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="structure-type">Structure Type</Label>
              <Select value={structureType} onValueChange={setStructureType}>
                <SelectTrigger id="structure-type">
                  <SelectValue placeholder="Select structure type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hierarchical">Hierarchical</SelectItem>
                  <SelectItem value="matrix">Matrix/Cross-functional</SelectItem>
                  <SelectItem value="flat">Flat Organization</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company-size">Company Size</Label>
              <Select value={companySize} onValueChange={setCompanySize}>
                <SelectTrigger id="company-size">
                  <SelectValue placeholder="Select company size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small (5-50 employees)</SelectItem>
                  <SelectItem value="medium">Medium (50-200 employees)</SelectItem>
                  <SelectItem value="large">Large (200+ employees)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="bg-muted rounded-md p-3 text-sm text-muted-foreground">
            <p>The generated structure will use real employees from your database where possible, matching them to appropriate positions based on titles and departments.</p>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
