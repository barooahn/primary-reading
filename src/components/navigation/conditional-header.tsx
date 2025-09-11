'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { Header } from './header';

export function ConditionalHeader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Hide header on auth pages
  const hideHeaderPaths = ['/login', '/auth/callback'];
  
  // Hide header when in fullscreen reading mode
  const isFullscreen = searchParams.get('fullscreen') === 'true';
  
  if (hideHeaderPaths.includes(pathname) || isFullscreen) {
    return null;
  }
  
  return <Header />;
}
