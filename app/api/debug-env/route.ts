import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    togetherApiKeySet: !!process.env.TOGETHER_API_KEY,
    envKeys: Object.keys(process.env)
  });
}

export const runtime = 'edge';
