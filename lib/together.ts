import axios, { AxiosError } from 'axios';

const TOGETHER_API_URL = process.env.TOGETHER_API_URL || 'https://api.together.xyz/v1/chat/completions';
const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY;

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface TogetherResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export async function generateWithLlama3(
  prompt: string,
  systemPrompt: string = "You are a helpful AI assistant that specializes in business analytics, finance, and HR. Provide accurate, concise, and relevant information.",
  temperature: number = 0.7,
  max_tokens: number = 1000
): Promise<string> {
  try {
    if (!TOGETHER_API_KEY) {
      throw new Error('TOGETHER_API_KEY is not defined in environment variables');
    }

    const messages: Message[] = [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    const response = await axios.post<TogetherResponse>(
      TOGETHER_API_URL,
      {
        model: 'meta-llama/Llama-3-8b-chat-hf', // Using Llama 3 8B model
        messages,
        temperature,
        max_tokens
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TOGETHER_API_KEY}`
        }
      }
    );

    return response.data.choices[0].message.content;
  } catch (error: unknown) {
    console.error('Error calling Together.ai API:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    throw error;
  }
}

export async function generateJsonWithLlama3<T>(
  prompt: string,
  systemPrompt: string = "You are a helpful AI assistant that specializes in business analytics, finance, and HR. Your response should ONLY be valid JSON without any explanation or markdown.",
  temperature: number = 0.2,
  max_tokens: number = 1000
): Promise<T> {
  try {
    const textResponse = await generateWithLlama3(prompt, systemPrompt, temperature, max_tokens);
    
    // Extract JSON from the response if it's wrapped in markdown code blocks
    let jsonString = textResponse.trim();
    
    // First, check for markdown JSON code blocks
    const jsonBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/;
    const blockMatch = jsonString.match(jsonBlockRegex);
    if (blockMatch && blockMatch[1]) {
      jsonString = blockMatch[1].trim();
    }
    
    // Remove any leading/trailing text before or after JSON structure
    // Look for array pattern: starts with [ and ends with ]
    const arrayMatch = jsonString.match(/(\[[\s\S]*\])/);
    if (arrayMatch && arrayMatch[1]) {
      jsonString = arrayMatch[1];
    } 
    // Look for object pattern: starts with { and ends with }
    else {
      const objectMatch = jsonString.match(/(\{[\s\S]*\})/);
      if (objectMatch && objectMatch[1]) {
        jsonString = objectMatch[1];
      }
    }
    
    // Fix common JSON issues
    jsonString = jsonString
      // Remove trailing commas in arrays and objects
      .replace(/,\s*([}\]])/g, '$1')
      // Ensure property names are double-quoted
      .replace(/([{,]\s*)(['"])?([a-zA-Z0-9_]+)(['"])?\s*:/g, '$1"$3":')
      // Ensure string values are double-quoted
      .replace(/:\s*['`]([^'`\n]*?)['`]/g, ':"$1"');
    
    console.log("Attempting to parse JSON:", jsonString.substring(0, 200) + (jsonString.length > 200 ? "..." : ""));
    
    try {
      return JSON.parse(jsonString) as T;
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      
      // Last resort: try removing all non-JSON characters
      const cleanedJson = jsonString
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // Remove control characters
        .replace(/\\n/g, "\\n")
        .replace(/\\"/g, '\\"')
        .replace(/\\&/g, "\\&")
        .replace(/\\r/g, "\\r")
        .replace(/\\t/g, "\\t")
        .replace(/\\b/g, "\\b")
        .replace(/\\f/g, "\\f");
      
      try {
        return JSON.parse(cleanedJson) as T;
      } catch (finalError: unknown) {
        console.error("Final JSON parse failure:", finalError);
        // If we can't parse JSON, return a meaningful error
        const errorMessage = finalError instanceof Error ? finalError.message : 'Unknown JSON parsing error';
        throw new Error(`Failed to parse JSON response: ${errorMessage}`);
      }
    }
  } catch (error: unknown) {
    console.error('Error generating or parsing JSON with Llama 3:', error);
    throw error;
  }
} 