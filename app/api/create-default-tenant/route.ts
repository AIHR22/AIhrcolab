import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseClient';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing user ID' },
        { status: 400 }
      );
    }

    const adminClient = getSupabaseAdmin();

    // First verify this is a new user without any existing tenants or roles
    const { data: existingTenant, error: checkError } = await adminClient
      .from('tenant_users')
      .select('tenant_id')
      .eq('user_id', userId)
      .single();

    if (existingTenant) {
      return NextResponse.json(
        { error: 'User already has a tenant assigned' },
        { status: 400 }
      );
    }

    // Verify user exists in auth.users and has no profile yet
    const { data: userProfile, error: profileError } = await adminClient
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profileError && profileError.code !== 'PGRST116') { // PGRST116 means no rows returned
      console.error('Error checking user profile:', profileError);
      return NextResponse.json(
        { error: 'Error verifying user status' },
        { status: 500 }
      );
    }

    if (userProfile) {
      return NextResponse.json(
        { error: 'User already has a profile' },
        { status: 400 }
      );
    }

    // Create initial tenant for the new signup
    const { data: tenant, error: tenantError } = await adminClient
      .from('tenants')
      .insert({
        status: 'active',
        is_default: true,
        created_by: userId
      })
      .select('id')
      .single();

    if (tenantError) {
      console.error('Error creating tenant:', tenantError);
      return NextResponse.json(
        { error: tenantError.message },
        { status: 500 }
      );
    }

    // Create initial user profile as client_admin
    const { error: profileCreateError } = await adminClient
      .from('user_profiles')
      .insert({
        user_id: userId,
        role: 'client_admin',
        is_platform_admin: false
      });

    if (profileCreateError) {
      console.error('Error creating user profile:', profileCreateError);
      return NextResponse.json(
        { error: profileCreateError.message },
        { status: 500 }
      );
    }

    // Create tenant user relationship
    const { error: membershipError } = await adminClient
      .from('tenant_users')
      .insert({
        tenant_id: tenant.id,
        user_id: userId,
        role: 'client_admin'
      });

    if (membershipError) {
      console.error('Error creating tenant membership:', membershipError);
      return NextResponse.json(
        { error: membershipError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(tenant);
  } catch (error) {
    console.error('Error in create-default-tenant route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 