'use client';

import { usePathname } from 'next/navigation';
import { Header } from './header';

export function ConditionalHeader() {
  const pathname = usePathname();
  
  // Hide header on auth pages
  const hideHeaderPaths = ['/login', '/auth/callback'];
  
  if (hideHeaderPaths.includes(pathname)) {
    return null;
  }
  
  return <Header />;
}
