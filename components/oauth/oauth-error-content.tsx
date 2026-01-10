'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Instagram, RefreshCw, Users, Info } from 'lucide-react';
import { SupportModal } from '@/components/oauth/support-modal';
import {
  getOAuthErrorMessage,
  isRetryableError,
  capitalizeProvider,
  type OAuthError,
} from '@/lib/oauth-errors';

// Mock error for demonstration - in production this comes from URL params or API
const mockError: OAuthError = {
  message: 'Authorization was cancelled by the user or access was denied.',
  code: 'EXT_INST_OAUTH_ACCESS_DENIED_000526',
  details: {
    provider: 'instagram',
    provider_error: 'access_denied',
    provider_reason: 'user_denied',
    action: 'retry_authorization',
    documentation_url:
      'https://docs.postengage.ai/errors#EXT_INST_OAUTH_ACCESS_DENIED_000526',
    support_reference: 'af31-4215-b3a1',
  },
  timestamp: new Date().toISOString(),
};

export function OAuthErrorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // In production, parse error from URL params
  const error = mockError;
  const { heading, message } = getOAuthErrorMessage(error);
  const canRetry = isRetryableError(error);
  const provider = capitalizeProvider(error.details.provider);

  const handleRetry = () => {
    // In production, redirect to OAuth flow
    router.push('/settings/social-accounts');
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
          {canRetry && (
            <Button onClick={handleRetry} className='w-full' size='lg'>
              <RefreshCw className='mr-2 h-5 w-5' />
              Try Connecting Again
            </Button>
          )}

          {/* Secondary CTAs */}
          <div className='grid grid-cols-2 gap-3'>
            <Button variant='outline' asChild>
              <Link href='/settings/social-accounts'>
                <Users className='mr-2 h-4 w-4' />
                Different Account
              </Link>
            </Button>
            <SupportModal
              errorCode={error.code}
              supportReference={error.details.support_reference || 'N/A'}
              timestamp={error.timestamp}
              documentationUrl={error.details.documentation_url}
            />
          </div>
        </div>

        {/* Back to Dashboard */}
        <div className='text-center'>
          <Button variant='link' asChild className='text-muted-foreground'>
            <Link href='/dashboard'>Return to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
