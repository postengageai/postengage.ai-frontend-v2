'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Instagram, RefreshCw, Info } from 'lucide-react';
import {
  getOAuthErrorMessage,
  isRetryableError,
  capitalizeProvider,
  type OAuthError,
} from '@/lib/oauth-errors';

export function OAuthErrorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  const errorParam = searchParams.get('error');
  const errorDescription = searchParams.get('description');

  // Construct error object from URL params
  const error: OAuthError = {
    message:
      errorDescription || 'An unknown error occurred during authentication.',
    code: errorParam || 'UNKNOWN_ERROR',
    details: {
      provider: 'instagram',
      provider_error: errorParam || 'unknown',
      provider_reason: errorDescription || 'unknown',
      action: 'retry_authorization',
    },
    timestamp: new Date().toISOString(),
  };

  const { heading, message } = getOAuthErrorMessage(error);
  const canRetry = isRetryableError(error);
  const provider = capitalizeProvider(error.details.provider);

  const [isPopup, setIsPopup] = useState(false);

  useEffect(() => {
    // Detect if this is a popup window.
    // After cross-origin redirect, window.opener may be null even in a popup.
    // Also check if window was opened by script (history.length === 1 in popups).
    const openedAsPopup = !!window.opener || window.history.length <= 2;
    setIsPopup(openedAsPopup);

    if (!openedAsPopup) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          const message = {
            type: 'OAUTH_ERROR',
            error: errorParam,
            description: errorDescription,
          };

          // Primary: BroadcastChannel (works after cross-origin redirect)
          try {
            const channel = new BroadcastChannel('postengage_oauth');
            channel.postMessage(message);
            channel.close();
          } catch {
            // BroadcastChannel not supported
          }

          // Fallback: window.opener
          try {
            if (window.opener) {
              window.opener.postMessage(message, window.location.origin);
            }
          } catch {
            // opener inaccessible
          }

          window.close();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [errorParam, errorDescription]);

  const handleRetry = () => {
    const message = {
      type: 'OAUTH_ERROR',
      error: errorParam,
      description: errorDescription,
    };

    // Notify opener via BroadcastChannel + window.opener
    try {
      const channel = new BroadcastChannel('postengage_oauth');
      channel.postMessage(message);
      channel.close();
    } catch {
      // BroadcastChannel not supported
    }

    try {
      if (window.opener) {
        window.opener.postMessage(message, window.location.origin);
      }
    } catch {
      // opener inaccessible
    }

    // Try to close; fallback to redirect
    window.close();
    setTimeout(() => router.push('/dashboard/settings/social-accounts'), 300);
  };

  return (
    <div className='flex min-h-screen flex-col items-center justify-center p-4'>
      <div className='w-full max-w-md space-y-6'>
        {/* Warning Icon */}
        <div className='flex justify-center'>
          <div className='flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/10'>
            <AlertCircle className='h-10 w-10 text-amber-500' />
          </div>
        </div>

        {/* Primary Heading */}
        <div className='space-y-2 text-center'>
          <h1 className='text-2xl font-semibold text-foreground'>
            {provider} {heading}
          </h1>
          <p className='text-muted-foreground'>{message}</p>
        </div>

        {/* Status Card */}
        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center gap-4'>
              {/* Platform Icon */}
              <div className='flex h-12 w-12 items-center justify-center rounded-full bg-muted'>
                <Instagram className='h-6 w-6 text-muted-foreground' />
              </div>

              {/* Status Info */}
              <div className='flex-1'>
                <p className='font-medium text-foreground'>{provider}</p>
                <p className='text-sm text-muted-foreground'>
                  No changes were made to your account
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Helpful Hint */}
        <div className='flex items-start gap-3 rounded-lg border border-border/50 bg-muted/30 p-4'>
          <Info className='mt-0.5 h-5 w-5 flex-shrink-0 text-muted-foreground' />
          <p className='text-sm text-muted-foreground'>
            Make sure you allow all requested permissions to enable automations.
            You can safely try connecting again at any time.
          </p>
        </div>

        {/* CTAs */}
        <div className='space-y-3'>
          {/* Primary CTA */}
          <Button onClick={handleRetry} className='w-full' size='lg'>
            <RefreshCw className='mr-2 h-5 w-5' />
            {canRetry ? 'Try Connecting Again' : 'Return to Settings'}
          </Button>
        </div>
        {/* Auto-close notice */}
        {isPopup && countdown > 0 && (
          <p className='mt-4 text-center text-xs text-muted-foreground'>
            Closing automatically in {countdown}s...
          </p>
        )}
      </div>
    </div>
  );
}
