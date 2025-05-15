import { NextRequest, NextResponse } from 'next/server';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const GMAIL_CLIENT_ID = process.env.GMAIL_CLIENT_ID;
const GMAIL_CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
const OUTLOOK_CLIENT_ID = process.env.OUTLOOK_CLIENT_ID;
const OUTLOOK_CLIENT_SECRET = process.env.OUTLOOK_CLIENT_SECRET;
const REDIRECT_URI = process.env.NEXT_PUBLIC_SITE_URL + '/api/auth/callback';

export async function GET(request: NextRequest, { params }: { params: { provider: string } }) {
  const { provider } = params;
  const supabase = createClientComponentClient();

  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Configure OAuth parameters based on provider
  const config = {
    gmail: {
      authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      scope: 'https://www.googleapis.com/auth/gmail.send',
      clientId: GMAIL_CLIENT_ID,
    },
    outlook: {
      authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
      scope: 'https://graph.microsoft.com/mail.send',
      clientId: OUTLOOK_CLIENT_ID,
    },
  }[provider];

  if (!config) {
    return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
  }

  // Generate and store state parameter to prevent CSRF
  const state = Math.random().toString(36).substring(7);
  await supabase
    .from('oauth_states')
    .insert({
      state,
      user_id: user.id,
      provider,
    });

  // Construct OAuth URL
  const authUrl = new URL(config.authUrl);
  authUrl.searchParams.append('client_id', config.clientId);
  authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('scope', config.scope);
  authUrl.searchParams.append('state', state);
  authUrl.searchParams.append('access_type', 'offline');
  authUrl.searchParams.append('prompt', 'consent');

  return NextResponse.redirect(authUrl.toString());
}