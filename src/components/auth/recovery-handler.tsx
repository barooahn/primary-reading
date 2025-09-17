'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function RecoveryHandler() {
  const router = useRouter();

  useEffect(() => {
    // Check if there's a recovery token in the URL hash
    const handleRecoveryRedirect = () => {
      if (typeof window !== 'undefined') {
        const hash = window.location.hash;
        
        // Check for recovery-related parameters in the URL hash
        if (hash.includes('access_token=') && hash.includes('type=recovery')) {
          // Redirect to the reset password page
          router.replace('/auth/reset-password');
        }
      }
    };

    // Run immediately
    handleRecoveryRedirect();

    // Also run on hash change in case URL changes
    window.addEventListener('hashchange', handleRecoveryRedirect);

    return () => {
      window.removeEventListener('hashchange', handleRecoveryRedirect);
    };
  }, [router]);

  return null; // This component doesn't render anything
}