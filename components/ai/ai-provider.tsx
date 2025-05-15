"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

interface AIContextType {
  analyzeProject: (projectData: any) => Promise<any>
  generateHiringRecommendations: (skillGaps: any) => Promise<any>
  predictCosts: (projectData: any, hiringNeeds: any) => Promise<any>
  generateOrgChart: (criteria: any) => Promise<any>
  analyzeEmployeeData: (employeeData: any) => Promise<any>
  generateWorkflowSuggestions: (triggers: any) => Promise<any>
  isLoading: boolean
  error: string | null
}

interface AIProviderProps {
  children: ReactNode
}

const AIContext = createContext<AIContextType | undefined>(undefined)

export function AIProvider({ children }: AIProviderProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analyzeProject = async (projectData: any) => {
    setIsLoading(true)
    setError(null)
    try {
      // In a real implementation, this would use the AI SDK to analyze the project
      const prompt = `
        Analyze this project data and provide insights on:
        1. Required skills and expertise
        2. Current capacity to handle the project
        3. Potential revenue and ROI
        4. Hiring recommendations
        
        Project data: ${JSON.stringify(projectData)}
      `

      const { text } = await generateText({
        model: openai("gpt-4o"),
        prompt,
      })

      // Parse the AI response into structured data
      const analysis = parseAIResponse(text)
      setIsLoading(false)
      return analysis
    } catch (err) {
      setError("Failed to analyze project data")
      setIsLoading(false)
      throw err
    }
  }

  const generateHiringRecommendations = async (skillGaps: any) => {
    setIsLoading(true)
    setError(null)
    try {
      const prompt = `
        Based on these skill gaps, provide detailed hiring recommendations:
        1. Roles that need to be filled
        2. Required experience and qualifications
        3. Estimated salary ranges
        4. Hiring timeline recommendations
        
        Skill gaps: ${JSON.stringify(skillGaps)}
      `

      const { text } = await generateText({
        model: openai("gpt-4o"),
        prompt,
      })

      const recommendations = parseAIResponse(text)
      setIsLoading(false)
      return recommendations
    } catch (err) {
      setError("Failed to generate hiring recommendations")
      setIsLoading(false)
      throw err
    }
  }

  const predictCosts = async (projectData: any, hiringNeeds: any) => {
    setIsLoading(true)
    setError(null)
    try {
      const prompt = `
        Predict the costs for this project including:
        1. Current employee allocation costs
        2. New hiring costs
        3. Training and onboarding costs
        4. Total project cost estimate
        5. ROI projection
        
        Project data: ${JSON.stringify(projectData)}
        Hiring needs: ${JSON.stringify(hiringNeeds)}
      `

      const { text } = await generateText({
        model: openai("gpt-4o"),
        prompt,
      })

      const costPrediction = parseAIResponse(text)
      setIsLoading(false)
      return costPrediction
    } catch (err) {
      setError("Failed to predict costs")
      setIsLoading(false)
      throw err
    }
  }

  const generateOrgChart = async (criteria: any) => {
    setIsLoading(true)
    setError(null)
    try {
      const prompt = `
        Generate an organizational chart based on these criteria:
        1. Organization type (hierarchical, flat, matrix, etc.)
        2. Department structure
        3. Reporting relationships
        4. Team sizes and compositions
        
        Criteria: ${JSON.stringify(criteria)}
      `

      const { text } = await generateText({
        model: openai("gpt-4o"),
        prompt,
      })

      const orgChart = parseAIResponse(text)
      setIsLoading(false)
      return orgChart
    } catch (err) {
      setError("Failed to generate org chart")
      setIsLoading(false)
      throw err
    }
  }

  const analyzeEmployeeData = async (employeeData: any) => {
    setIsLoading(true)
    setError(null)
    try {
      const prompt = `
        Analyze this employee data and provide insights on:
        1. Skill distribution across the organization
        2. Capacity utilization
        3. Performance metrics
        4. Retention risk factors
        5. Development opportunities
        
        Employee data: ${JSON.stringify(employeeData)}
      `

      const { text } = await generateText({
        model: openai("gpt-4o"),
        prompt,
      })

      const analysis = parseAIResponse(text)
      setIsLoading(false)
      return analysis
    } catch (err) {
      setError("Failed to analyze employee data")
      setIsLoading(false)
      throw err
    }
  }

  const generateWorkflowSuggestions = async (triggers: any) => {
    setIsLoading(true)
    setError(null)
    try {
      const prompt = `
        Based on these workflow triggers, suggest automated actions:
        1. Event triggers and conditions
        2. Appropriate automated responses
        3. Integration points with other systems
        4. Expected outcomes and benefits
        
        Triggers: ${JSON.stringify(triggers)}
      `

      const { text } = await generateText({
        model: openai("gpt-4o"),
        prompt,
      })

      const suggestions = parseAIResponse(text)
      setIsLoading(false)
      return suggestions
    } catch (err) {
      setError("Failed to generate workflow suggestions")
      setIsLoading(false)
      throw err
    }
  }

  // Helper function to parse AI responses into structured data
  const parseAIResponse = (text: string) => {
    try {
      // In a real implementation, this would parse the AI response into structured data
      // For now, we'll return a mock structured response
      return {
        data: text,
        timestamp: new Date().toISOString(),
        success: true,
      }
    } catch (err) {
      console.error("Failed to parse AI response", err)
      return {
        data: text,
        timestamp: new Date().toISOString(),
        success: false,
        error: "Failed to parse AI response",
      }
    }
  }

  return (
    <AIContext.Provider
      value={{
        analyzeProject,
        generateHiringRecommendations,
        predictCosts,
        generateOrgChart,
        analyzeEmployeeData,
        generateWorkflowSuggestions,
        isLoading,
        error,
      }}
    >
      {children}
    </AIContext.Provider>
  )
}

export function useAI() {
  const context = useContext(AIContext)
  if (context === undefined) {
    throw new Error("useAI must be used within an AIProvider")
  }
  return context
}

