'use client';

import dynamic from 'next/dynamic';
import { ComponentSkeleton } from '@/components/ui/lazy-components';

// Lazy load the dashboard page with a loading skeleton
export const LazyDashboard = dynamic(
  () => import('@/app/dashboard/page').then(mod => ({ default: mod.default })),
  {
    loading: () => <ComponentSkeleton />,
    ssr: false
  }
);

// Lazy load story components
export const LazyStoryViewer = dynamic(
  () => import('@/app/read/[id]/page').then(mod => ({ default: mod.default })),
  {
    loading: () => (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    ),
    ssr: true // Keep SSR for story content for SEO
  }
);

// Lazy load create story form
export const LazyCreateStoryForm = dynamic(
  () => import('@/app/create/page').then(mod => ({ default: mod.default })),
  {
    loading: () => <ComponentSkeleton />,
    ssr: false
  }
);

// Lazy load settings page
export const LazySettingsPage = dynamic(
  () => import('@/app/settings/page').then(mod => ({ default: mod.default })),
  {
    loading: () => <ComponentSkeleton />,
    ssr: false
  }
);

// Lazy load progress page
export const LazyProgressPage = dynamic(
  () => import('@/app/progress/page').then(mod => ({ default: mod.default })),
  {
    loading: () => <ComponentSkeleton />,
    ssr: false
  }
);