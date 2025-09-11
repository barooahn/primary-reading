'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

function AuthRedirectHandlerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  
  useEffect(() => {
    const code = searchParams.get('code');
    
    if (code) {
      const handleAuthRedirect = async () => {
        // Check if user is currently logged in
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          await supabase.auth.signOut();
          // Wait a moment for signout to complete
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        // Always use the callback route - it has better logic to handle different auth flows
        router.replace(`/auth/callback?${searchParams.toString()}`);
      };
      
      handleAuthRedirect();
    }
  }, [searchParams, router, supabase.auth]);
  
  return null; // This component doesn't render anything
}

export function AuthRedirectHandler() {
  return (
    <Suspense fallback={null}>
      <AuthRedirectHandlerContent />
    </Suspense>
  );
}