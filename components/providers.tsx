'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/lib/auth/context';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { PostHogProvider } from '@/components/app/posthog-provider';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data considered fresh for 60 s — won't refetch unless stale
        staleTime: 60 * 1_000,
        // Keep inactive queries in cache for 5 minutes
        gcTime: 5 * 60 * 1_000,
        // Don't retry on 4xx errors (client mistakes shouldn't be retried)
        retry: (failureCount, error: unknown) => {
          const status = (error as { statusCode?: number })?.statusCode;
          if (status && status >= 400 && status < 500) return false;
          return failureCount < 2;
        },
        // Re-fetch when window regains focus (catches stale data after tab switch)
        refetchOnWindowFocus: true,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

// Module-level singleton so the QueryClient survives hot-reloads in dev
let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new client (no sharing between requests)
    return makeQueryClient();
  }
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

export function Providers({ children }: { children: React.ReactNode }) {
  // Using the singleton getter so we don't recreate the client on every render
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
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
      {/* DevTools only in development — tree-shaken in production build */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
