import { NextResponse } from "next/server"
import { generateWithLlama3, generateJsonWithLlama3 } from "@/lib/together"

// A simple test object to verify JSON parsing
interface TestObject {
  message: string;
  success: boolean;
  timestamp: string;
  data: {
    value: number;
    items: string[];
  };
}

export async function GET() {
  try {
    // Simple test of the basic text generation
    const textResult = await generateWithLlama3(
      "What is the capital of France?",
      "You are a helpful assistant that provides concise and accurate answers.",
      0.7,
      100
    );

    // Test the JSON generation
    const jsonResult = await generateJsonWithLlama3<TestObject>(
      "Create a JSON object with the following fields: message, success (boolean), timestamp (current date), and data object with a value (number) and items (array of strings)",
      "You are a helpful assistant that only responds with valid JSON.",
      0.2,
      500
    );

    return NextResponse.json({
      success: true,
      text_result: textResult,
      json_result: jsonResult,
      api_key_provided: !!process.env.TOGETHER_API_KEY,
      api_url: process.env.TOGETHER_API_URL
    });
  } catch (error: any) {
    console.error("Error testing Llama 3 API:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
} 