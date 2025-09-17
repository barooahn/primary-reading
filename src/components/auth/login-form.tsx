'use client';

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function LoginForm() {
  const supabase = createClient();

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle>Welcome to PrimaryReading</CardTitle>
        <CardDescription>
          Sign in to continue your reading adventure
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#3b82f6',
                  brandAccent: '#2563eb',
                },
              },
            },
            className: {
              container: 'w-full',
              button: 'w-full px-4 py-2 rounded-md',
              input: 'w-full px-3 py-2 rounded-md border',
            },
          }}
          localization={{
            variables: {
              sign_in: {
                email_label: 'Email address',
                password_label: 'Password',
                button_label: 'Sign in',
                loading_button_label: 'Signing in...',
                link_text: 'Already have an account? Sign in',
              },
              sign_up: {
                email_label: 'Email address',
                password_label: 'Create a password',
                button_label: 'Sign up',
                loading_button_label: 'Signing up...',
                link_text: "Don't have an account? Sign up",
              },
              forgotten_password: {
                email_label: 'Email address',
                button_label: 'Send reset instructions',
                loading_button_label: 'Sending reset instructions...',
                link_text: 'Forgot your password?',
                confirmation_text: 'Check your email for the password reset link',
              },
            },
          }}
          providers={['google']}
          redirectTo={`${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/auth/callback`}
          onlyThirdPartyProviders={false}
          magicLink={false}
        />
      </CardContent>
    </Card>
  );
}