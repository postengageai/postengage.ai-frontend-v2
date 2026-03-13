'use client';

// C-4 FIX: dashboard section error boundary.
// Catches errors in any /dashboard/* route and renders a recovery UI that
// keeps the user in the dashboard context rather than wiping the whole page.

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[DashboardError]', error.digest ?? '', error);
  }, [error]);

  return (
    <div className='flex flex-1 flex-col items-center justify-center gap-5 p-8 text-center'>
      <div className='flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10'>
        <AlertTriangle className='h-6 w-6 text-destructive' />
      </div>
      <div className='space-y-1.5'>
        <h2 className='text-xl font-semibold'>Something went wrong</h2>
        <p className='max-w-sm text-sm text-muted-foreground'>
          This page encountered an error. Your data is safe — try refreshing.
        </p>
        {error.digest && (
          <p className='font-mono text-xs text-muted-foreground'>
            Error ID: {error.digest}
          </p>
        )}
      </div>
      <Button onClick={reset} className='gap-2'>
        <RefreshCw className='h-4 w-4' />
        Try again
      </Button>
    </div>
  );
}
