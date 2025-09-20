'use client';

import dynamic from 'next/dynamic';
import { Suspense, ComponentType } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Loading components for different UI elements
export function ComponentSkeleton() {
  return (
    <Card className="w-full">
      <CardHeader>
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </CardContent>
    </Card>
  );
}

export function StorySkeleton() {
  return (
    <div className="group relative overflow-hidden rounded-3xl bg-white/80 backdrop-blur-xl border-2 border-gray-200/60 shadow-lg min-h-[280px]">
      <div className="relative overflow-hidden rounded-t-3xl">
        <Skeleton className="w-full h-44" />
      </div>
      <div className="p-5 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      </div>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <Skeleton className="h-8 w-3/4 mx-auto" />
        <Skeleton className="h-4 w-2/3 mx-auto" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-12 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-12 w-full" />
        </div>
        <Skeleton className="h-12 w-full" />
      </CardContent>
    </Card>
  );
}

// Create lazy-loaded components with proper fallbacks
export function createLazyComponent<T = Record<string, unknown>>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  FallbackComponent: ComponentType = ComponentSkeleton
) {
  const LazyComponent = dynamic(importFn, {
    loading: () => <FallbackComponent />,
    ssr: false, // Disable SSR for heavy components that don't need it
  });

  return function LazyWrapper(props: T) {
    return (
      <Suspense fallback={<FallbackComponent />}>
        <LazyComponent {...(props as any)} />
      </Suspense>
    );
  };
}

// Pre-configured lazy components for common use cases
// Note: Uncomment and modify these as needed when the components exist
// export const LazyStoryViewer = createLazyComponent(
//   () => import('@/components/stories/story-viewer'),
//   StorySkeleton
// );

// export const LazyCreateStoryForm = createLazyComponent(
//   () => import('@/components/stories/create-story-form'),
//   FormSkeleton
// );

// export const LazyAuthForm = createLazyComponent(
//   () => import('@/components/auth/simple-login-form'),
//   FormSkeleton
// );

// Higher-order component for viewport-based lazy loading
export function withViewportLazyLoading<T extends object>(
  Component: ComponentType<T>,
  FallbackComponent: ComponentType = ComponentSkeleton
) {
  return function ViewportLazyComponent(props: T) {
    return (
      <Suspense fallback={<FallbackComponent />}>
        <Component {...props} />
      </Suspense>
    );
  };
}

// Intersection Observer based lazy loading for components
export function LazyOnView({
  children,
  fallback = <ComponentSkeleton />,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <Suspense fallback={fallback}>
      <div
        style={{
          minHeight: '200px', // Prevent layout shift
        }}
      >
        {children}
      </div>
    </Suspense>
  );
}