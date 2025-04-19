/**
 * Utility functions for interacting with OpenRouter API
 */

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"

export type LLMMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

/**
 * Generate text using OpenRouter's Llama 4 Scout model
 */
export async function generateWithLlama4(
  prompt: string,
  systemPrompt: string = "You are a helpful AI assistant.",
  temperature: number = 0.7,
  maxTokens: number = 1000
): Promise<string> {
  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY environment variable is not set")
  }

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://aihrcolab.com",
      "X-Title": "AIHRColab"
    },
    body: JSON.stringify({
      model: "meta-llama/llama-4-scout",
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
    throw new Error(`OpenRouter API error: ${response.status} ${response.statusText} - ${errorText}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

/**
 * Generate JSON structure using Llama 4
 * This function is optimized for generating valid JSON structures
 */
export async function generateJsonWithLlama4<T>(
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
    const response = await generateWithLlama4(prompt, enhancedSystemPrompt, 0.2, 2000);
    
    // Handle case where model might still include markdown code blocks despite instructions
    let jsonString = response;
    if (jsonString.includes('```')) {
      jsonString = jsonString.replace(/```json\n?/, '').replace(/```\n?/, '');
    }
    
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error('Error generating JSON with Llama 4:', error);
    throw new Error('Failed to generate valid JSON from AI response');
  }
}
