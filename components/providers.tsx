'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/lib/auth/context';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { PostHogProvider } from '@/components/app/posthog-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute='class'
      defaultTheme='dark'
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        {children}
        <Toaster />
        <Sonner />
        {/* PostHog analytics — Suspense required for useSearchParams */}
        <Suspense fallback={null}>
          <PostHogProvider />
        </Suspense>
      </AuthProvider>
    </ThemeProvider>
  );
}
