'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from './header';

function ConditionalHeaderContent() {
  const searchParams = useSearchParams();

  // Hide header only when in fullscreen reading mode
  const isFullscreen = searchParams.get('fullscreen') === 'true';

  if (isFullscreen) {
    return null;
  }

  return <Header />;
}

export function ConditionalHeader() {
  return (
    <Suspense fallback={null}>
      <ConditionalHeaderContent />
    </Suspense>
  );
}
