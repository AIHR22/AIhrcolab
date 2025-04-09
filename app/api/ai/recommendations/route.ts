import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const verifyApiKey = () => {
  if (!process.env.TOGETHER_API_KEY) {
    throw new Error('TOGETHER_API_KEY is missing from environment variables');
  }
  return process.env.TOGETHER_API_KEY;
};

export async function POST(request: NextRequest) {
  try {
    // Verify API key first
    const apiKey = verifyApiKey();
    
    // Parse request
    const { prompt } = await request.json();
    
    // Call Together AI API
    const response = await fetch('https://api.together.xyz/inference', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'togethercomputer/llama-2-70b-chat',
        prompt,
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Together AI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      recommendations: data.output.choices[0].text
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.NODE_ENV === 'development' 
        ? (error instanceof Error ? error.stack : undefined) 
        : undefined
    }, {
      status: 500
    });
  }
}

export const runtime = 'edge';
