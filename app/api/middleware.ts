import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

export interface ErrorResponse {
  error: string;
  message: string;
  code: number;
}

export async function withErrorHandler(handler: Function) {
  return async (request: Request) => {
    try {
      return await handler(request)
    } catch (error: any) {
      console.error(`API Error:`, error)
      const response: ErrorResponse = {
        error: error.name || 'InternalServerError',
        message: error.message || 'An unexpected error occurred',
        code: error.status || 500
      }
      return NextResponse.json(response, { status: response.code })
    }
  }
}

export async function withAuth(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) {
    throw { status: 401, message: 'Missing authorization header' }
  }

  const token = authHeader.replace('Bearer ', '')
  
  try {
    // The token is already a JWT, no need to parse it
    const actualToken = token;
    console.log('Using token:', actualToken);
    
    // Use test values in test/development environment
    if ((process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') && actualToken === 'test_token') {
      return {
        user: { id: 'test_user' },
        tenantId: 'test_tenant'
      }
    }

    console.log('Calling Supabase getUser...');
    const { data, error } = await supabaseAdmin.auth.getUser(actualToken)
    console.log('Supabase response:', { data, error });
  
    if (error || !data?.user) {
      console.error('Auth error:', error)
      throw { status: 401, message: error?.message || 'Invalid authorization token' }
    }
    const { user } = data;

  const { data: tenant } = await supabaseAdmin
    .from('tenants')
    .select('id')
    .eq('user_id', user.id)
    .single()

    if (!tenant) {
      console.error('No tenant found for user:', user.id)
      throw { status: 403, message: 'User not associated with a tenant' }
    }

    return { user, tenantId: tenant.id }
  } catch (error) {
    console.error('Error in withAuth:', error)
    if (error instanceof Error && error.message.includes('supabase')) {
      throw { status: 401, message: 'Invalid Supabase token' }
    }
    if (error instanceof Error) {
      throw { status: 401, message: error.message }
    }
    throw { status: 401, message: 'Invalid token format' }
  }
}

export const supabase = supabaseAdmin
