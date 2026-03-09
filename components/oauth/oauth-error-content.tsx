'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { RefreshCw, LayoutDashboard } from 'lucide-react';
import {
  getOAuthErrorMessage,
  isRetryableError,
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
          const msg = {
            type: 'OAUTH_ERROR',
            error: errorParam,
            description: errorDescription,
          };

          // Primary: BroadcastChannel (works after cross-origin redirect)
          try {
            const channel = new BroadcastChannel('postengage_oauth');
            channel.postMessage(msg);
            channel.close();
          } catch {
            // BroadcastChannel not supported
          }

          // Fallback: window.opener
          try {
            if (window.opener) {
              window.opener.postMessage(msg, window.location.origin);
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
    const msg = {
      type: 'OAUTH_ERROR',
      error: errorParam,
      description: errorDescription,
    };

    // Notify opener via BroadcastChannel + window.opener
    try {
      const channel = new BroadcastChannel('postengage_oauth');
      channel.postMessage(msg);
      channel.close();
    } catch {
      // BroadcastChannel not supported
    }

    try {
      if (window.opener) {
        window.opener.postMessage(msg, window.location.origin);
      }
    } catch {
      // opener inaccessible
    }

    // Try to close; fallback to redirect
    window.close();
    setTimeout(() => router.push('/dashboard/settings/social-accounts'), 300);
  };

  const handleGoToDashboard = () => {
    window.close();
    setTimeout(() => router.push('/dashboard'), 300);
  };

  return (
    <div className='min-h-screen bg-background flex items-center justify-center px-4 py-12'>
      <div className='w-full max-w-[440px] rounded-2xl border border-error/25 bg-[#1a0f0f] p-12 text-center shadow-xl shadow-black/40'>

        {/* Broken plug icon */}
        <div className='mx-auto mb-6 h-16 w-16 rounded-full border-2 border-error/30 bg-error/15 flex items-center justify-center'>
          {/* Instagram "broken link" concept — unplug icon */}
          <svg className='h-7 w-7 text-error' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.75' strokeLinecap='round' strokeLinejoin='round'>
            <path d='M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71'/>
            <path d='M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'/>
            <line x1='2' y1='2' x2='22' y2='22'/>
          </svg>
        </div>

        {/* Instagram badge */}
        <div className='inline-flex items-center gap-2 rounded-full border border-error/20 bg-error/10 px-3 py-1 text-xs text-error mb-4'>
          {/* Instagram icon (simplified gradient-ish) */}
          <svg className='h-3.5 w-3.5' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
            <rect x='2' y='2' width='20' height='20' rx='5' ry='5'/>
            <circle cx='12' cy='12' r='4'/>
            <circle cx='17.5' cy='6.5' r='0.5' fill='currentColor'/>
          </svg>
          Instagram
        </div>

        <h1 className='text-2xl font-bold text-foreground'>{heading}</h1>
        <p className='mt-2 text-sm text-muted-foreground leading-relaxed px-2'>
          {message}
        </p>

        {/* Error detail box */}
        <div className='mt-6 rounded-xl border border-border bg-card p-4 text-left'>
          <div className='flex items-start gap-3'>
            <svg className='h-4 w-4 text-muted-foreground shrink-0 mt-0.5' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
              <circle cx='12' cy='12' r='10'/><line x1='12' y1='8' x2='12' y2='12'/><line x1='12' y1='16' x2='12.01' y2='16'/>
            </svg>
            <div className='min-w-0'>
              <p className='text-xs font-medium text-foreground'>No changes were made</p>
              <p className='text-xs text-muted-foreground mt-0.5 leading-relaxed'>
                Allow all requested permissions to enable automations. You can safely try connecting again.
              </p>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className='mt-8 space-y-3'>
          <Button
            onClick={handleRetry}
            className='w-full h-10 bg-primary hover:bg-primary-hover text-white font-semibold rounded-[--radius-md]'
          >
            <RefreshCw className='mr-2 h-4 w-4' />
            {canRetry ? 'Try Connecting Again' : 'Return to Settings'}
          </Button>
          <Button
            onClick={handleGoToDashboard}
            variant='outline'
            className='w-full h-10 bg-transparent rounded-[--radius-md]'
          >
            <LayoutDashboard className='mr-2 h-4 w-4' />
            Go to Dashboard
          </Button>
        </div>

        {/* Auto-close notice */}
        {isPopup && countdown > 0 && (
          <p className='mt-5 text-xs text-muted-foreground'>
            Closing automatically in {countdown}s…
          </p>
        )}

        {/* State badge */}
        <div className='mt-5 flex justify-center'>
          <span className='inline-flex items-center gap-1.5 rounded-full border border-error/30 bg-error/10 px-3 py-1 text-xs text-error'>
            <svg className='h-3 w-3' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
              <circle cx='12' cy='12' r='10'/><line x1='4.93' y1='4.93' x2='19.07' y2='19.07'/>
            </svg>
            Connection Failed
          </span>
        </div>

      </div>
    </div>
  );
}
