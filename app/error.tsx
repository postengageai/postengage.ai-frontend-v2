'use client';

// C-4 FIX: root-level error boundary.
// Without error.tsx files, any unhandled exception causes the entire page to
// go blank with no recovery path. This file is the last-resort fallback for
// any error that isn't caught by a more specific error.tsx closer to the throw.

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Report to your error monitoring service (Sentry, etc.) here.
    // digest is Next.js's server-side error hash — useful for log correlation.
    // eslint-disable-next-line no-console
    console.error('[RootError]', error.digest ?? '', error);
  }, [error]);

  return (
    <div className='flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center'>
      <div className='flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10'>
        <AlertTriangle className='h-7 w-7 text-destructive' />
      </div>
      <div className='space-y-2'>
        <h1 className='text-2xl font-semibold tracking-tight'>
          Something went wrong
        </h1>
        <p className='max-w-md text-sm text-muted-foreground'>
          An unexpected error occurred. If the problem persists please contact
          support.
        </p>
        {error.digest && (
          <p className='font-mono text-xs text-muted-foreground'>
            Error ID: {error.digest}
          </p>
        )}
      </div>
      <div className='flex gap-3'>
        <Button onClick={reset}>Try again</Button>
        <Button variant='outline' onClick={() => (window.location.href = '/')}>
          Go home
        </Button>
      </div>
    </div>
  );
}
