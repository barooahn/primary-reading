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
    
    // Try to sign in and capture the full error details
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json({
        success: false,
        error: {
          message: error.message,
          status: error.status,
          code: error.code || 'unknown',
          details: error
        },
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      user: data.user?.email,
      hasSession: !!data.session
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

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Check if we can reach Supabase
    const { error } = await supabase.from('profiles').select('count').limit(1);
    
    return NextResponse.json({
      supabaseConnection: !error,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      error: error?.message || null
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}