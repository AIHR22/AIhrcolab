"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"

interface GenerateReviewProps {
  employeeId: string
  employeeName: string
  onReviewGenerated?: () => void
}

export function GenerateReview({ employeeId, employeeName, onReviewGenerated }: GenerateReviewProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [review, setReview] = useState<any>(null)
  const { toast } = useToast()

  const handleGenerateReview = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch("/api/ai/generate-review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ employeeId }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate review")
      }

      const data = await response.json()
      setReview(data.review)

      if (onReviewGenerated) {
        onReviewGenerated()
      }

      toast({
        title: "Success",
        description: "Performance review generated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate performance review",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Generate AI Review</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>AI-Generated Performance Review</DialogTitle>
          <DialogDescription>Generate a performance review for {employeeName} using AI</DialogDescription>
        </DialogHeader>

        {!review ? (
          <div className="py-6 flex flex-col items-center justify-center">
            <p className="text-center mb-4">
              Our AI will analyze the employee's profile and generate a comprehensive performance review.
            </p>
            <Button onClick={handleGenerateReview} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Review"
              )}
            </Button>
          </div>
        ) : (
          <ScrollArea className="h-[400px] mt-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Date</h3>
                <p className="text-sm text-muted-foreground">{new Date(review.date).toLocaleDateString()}</p>
              </div>
              <div>
                <h3 className="font-medium">Reviewer</h3>
                <p className="text-sm text-muted-foreground">{review.reviewer}</p>
              </div>
              <div>
                <h3 className="font-medium">Rating</h3>
                <p className="text-sm text-muted-foreground">{review.rating}/5</p>
              </div>
              <div>
                <h3 className="font-medium">Review</h3>
                <div className="mt-2 text-sm whitespace-pre-wrap">{review.content}</div>
              </div>
            </div>
          </ScrollArea>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

