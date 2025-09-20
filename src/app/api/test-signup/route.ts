import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json({
        error: 'Email and password are required'
      }, { status: 400 });
    }

    const supabase = await createClient();
    
    // Try to sign up
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
      }
    });

    if (error) {
      return NextResponse.json({
        success: false,
        error: {
          message: error.message,
          status: error.status,
          code: error.code || 'unknown',
          details: error
        }
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      user: data.user?.email,
      needsConfirmation: !data.user?.email_confirmed_at,
      message: data.user?.email_confirmed_at 
        ? 'Account created successfully!' 
        : 'Please check your email for the confirmation link.'
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        type: 'server_error'
      }
    }, { status: 500 });
  }
}