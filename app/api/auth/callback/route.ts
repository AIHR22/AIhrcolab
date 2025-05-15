import { NextRequest, NextResponse } from 'next/server';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const GMAIL_CLIENT_ID = process.env.GMAIL_CLIENT_ID;
const GMAIL_CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
const OUTLOOK_CLIENT_ID = process.env.OUTLOOK_CLIENT_ID;
const OUTLOOK_CLIENT_SECRET = process.env.OUTLOOK_CLIENT_SECRET;
const REDIRECT_URI = process.env.NEXT_PUBLIC_SITE_URL + '/api/auth/callback';

async function exchangeCodeForTokens(code: string, provider: string) {
  const config = {
    gmail: {
      tokenUrl: 'https://oauth2.googleapis.com/token',
      clientId: GMAIL_CLIENT_ID,
      clientSecret: GMAIL_CLIENT_SECRET,
    },
    outlook: {
      tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
      clientId: OUTLOOK_CLIENT_ID,
      clientSecret: OUTLOOK_CLIENT_SECRET,
    },
  }[provider];

  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to exchange code for tokens');
  }

  return response.json();
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  const supabase = createClientComponentClient();

  if (error) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/settings?error=${error}`
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/settings?error=missing_params`
    );
  }

  try {
    // Verify state and get provider
    const { data: stateData, error: stateError } = await supabase
      .from('oauth_states')
      .select('provider, user_id')
      .eq('state', state)
      .single();

    if (stateError || !stateData) {
      throw new Error('Invalid state');
    }

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code, stateData.provider);

    // Store tokens securely
    await supabase.from('email_provider_tokens').upsert({
      user_id: stateData.user_id,
      provider: stateData.provider,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
    });

    // Clean up state
    await supabase
      .from('oauth_states')
      .delete()
      .eq('state', state);

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/settings?success=true`
    );
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/settings?error=callback_failed`
    );
  }
}