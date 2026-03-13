'use client';

// C-4 FIX: intelligence section error boundary.
// Scoped to /dashboard/intelligence/* — covers bots, voice DNA, brand voices,
// analytics, and leads pages.

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';

export default function IntelligenceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error('[IntelligenceError]', error.digest ?? '', error);
  }, [error]);

  return (
    <div className='flex flex-1 flex-col items-center justify-center gap-5 p-8 text-center'>
      <div className='flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10'>
        <AlertTriangle className='h-6 w-6 text-destructive' />
      </div>
      <div className='space-y-1.5'>
        <h2 className='text-xl font-semibold'>Intelligence error</h2>
        <p className='max-w-sm text-sm text-muted-foreground'>
          Something went wrong in this section. Your configuration is safe — try
          refreshing.
        </p>
        {error.digest && (
          <p className='font-mono text-xs text-muted-foreground'>
            Error ID: {error.digest}
          </p>
        )}
      </div>
      <div className='flex gap-3'>
        <Button onClick={reset} className='gap-2'>
          <RefreshCw className='h-4 w-4' />
          Try again
        </Button>
        <Button
          variant='outline'
          className='gap-2'
          onClick={() => router.push('/dashboard')}
        >
          <ArrowLeft className='h-4 w-4' />
          Dashboard
        </Button>
      </div>
    </div>
  );
}
