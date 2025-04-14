/**
 * Utility functions for interacting with Together AI API
 */

const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY
const TOGETHER_API_URL = "https://api.together.xyz/v1/chat/completions"

export type LLMMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

/**
 * Generate text using Together AI's Mixtral 8x7B Instruct model
 */
export async function generateWithMixtral(
  prompt: string,
  systemPrompt: string = "You are a helpful AI assistant.",
  temperature: number = 0.7,
  maxTokens: number = 1000
): Promise<string> {
  if (!TOGETHER_API_KEY) {
    throw new Error("TOGETHER_API_KEY environment variable is not set")
  }

  const response = await fetch(TOGETHER_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${TOGETHER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      temperature,
      max_tokens: maxTokens,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Together AI API error: ${response.status} ${response.statusText} - ${errorText}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

/**
 * Generate text using Together AI's Llama 3 70B Instruct model
 */
export async function generateWithLlama3(
  prompt: string,
  systemPrompt: string = "You are a helpful AI assistant.",
  temperature: number = 0.7,
  maxTokens: number = 1000
): Promise<string> {
  if (!TOGETHER_API_KEY) {
    throw new Error("TOGETHER_API_KEY environment variable is not set")
  }

  const response = await fetch(TOGETHER_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${TOGETHER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "meta-llama/Llama-3-70b-instruct",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      temperature,
      max_tokens: maxTokens,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Together AI API error: ${response.status} ${response.statusText} - ${errorText}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

/**
 * Generate JSON structure using Together AI's Mixtral model
 * This function is optimized for generating valid JSON structures
 */
export async function generateJsonWithAI<T>(
  prompt: string, 
  systemPrompt: string, 
  jsonExample?: string
): Promise<T> {
  const enhancedSystemPrompt = `${systemPrompt}
  
  You MUST respond with ONLY valid JSON that can be parsed by JSON.parse().
  Do not include any non-JSON text in your response, not even markdown code blocks.
  Your entire response should be parseable JSON.
  
  ${jsonExample ? `Example JSON structure: ${jsonExample}` : ''}`;

  try {
    const response = await generateWithMixtral(prompt, enhancedSystemPrompt, 0.2, 2000);
    
    // Handle case where model might still include markdown code blocks despite instructions
    let jsonString = response;
    if (jsonString.includes('```')) {
      jsonString = jsonString.replace(/```json\n?/, '').replace(/```\n?/, '');
    }
    
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error('Error generating JSON with AI:', error);
    throw new Error('Failed to generate valid JSON from AI response');
  }
} 