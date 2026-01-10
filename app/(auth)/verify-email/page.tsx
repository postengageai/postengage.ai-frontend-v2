'use client';

import type React from 'react';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthCard } from '@/components/auth/auth-card';
import { FormSuccess } from '@/components/auth/form-success';

type VerificationState = 'waiting' | 'verifying' | 'success' | 'error';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromUrl = searchParams.get('email') || '';
  const tokenFromUrl = searchParams.get('token');

  const [state, setState] = useState<VerificationState>(
    tokenFromUrl ? 'verifying' : 'waiting'
  );
  const [manualToken, setManualToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<{ title: string; message: string } | null>(
    null
  );

  // Auto-verify if token is in URL
  useEffect(() => {
    if (tokenFromUrl) {
      verifyToken(tokenFromUrl);
    }
  }, [tokenFromUrl]);

  const verifyToken = async (token: string) => {
    setState('verifying');
    setError(null);

    try {
      const res = await fetch('/api/v1/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (!res.ok) {
        const data = await res.json();
        setState('error');
        setError({
          title: data.code?.includes('EXPIRED')
            ? 'Link expired'
            : 'Invalid link',
          message: data.code?.includes('EXPIRED')
            ? 'This verification link has expired. Please request a new one.'
            : 'This link is invalid or has already been used.',
        });
        return;
      }

      setState('success');
      // Redirect to dashboard after 2 seconds
      setTimeout(() => router.push('/dashboard'), 2000);
    } catch {
      setState('error');
      setError({
        title: 'Connection issue',
        message: "We're having trouble connecting. Please try again.",
      });
    }
  };

  const handleManualVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualToken || isSubmitting) return;
    setIsSubmitting(true);
    await verifyToken(manualToken);
    setIsSubmitting(false);
  };

  // Waiting state - check your email
  if (state === 'waiting') {
    return (
      <AuthCard>
        <div className='text-center'>
          <div className='mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10'>
            <Mail className='h-8 w-8 text-primary' />
          </div>
          <h1 className='text-2xl font-semibold text-foreground'>
            Check your email
          </h1>
          <p className='mt-2 text-muted-foreground'>
            We sent a verification link to{' '}
            <span className='font-medium text-foreground'>{emailFromUrl}</span>
          </p>
        </div>

        <div className='mt-8 space-y-6'>
          <div className='rounded-lg bg-muted/50 p-4'>
            <h3 className='font-medium text-foreground text-sm mb-2'>
              What happens next?
            </h3>
            <ul className='space-y-2 text-sm text-muted-foreground'>
              <li className='flex items-start gap-2'>
                <CheckCircle2 className='h-4 w-4 text-green-500 mt-0.5 shrink-0' />
                Your account will be activated
              </li>
              <li className='flex items-start gap-2'>
                <CheckCircle2 className='h-4 w-4 text-green-500 mt-0.5 shrink-0' />
                Free credits will be unlocked
              </li>
            </ul>
          </div>

          {/* Manual token entry */}
          <div className='border-t border-border pt-6'>
            <p className='text-sm text-muted-foreground mb-4'>
              Or paste your verification code manually:
            </p>
            <form onSubmit={handleManualVerify} className='space-y-3'>
              <div className='space-y-2'>
                <Label htmlFor='token' className='sr-only'>
                  Verification code
                </Label>
                <Input
                  id='token'
                  type='text'
                  value={manualToken}
                  onChange={e => setManualToken(e.target.value)}
                  placeholder='Paste verification code'
                  disabled={isSubmitting}
                />
              </div>
              <Button
                type='submit'
                variant='outline'
                className='w-full bg-transparent'
                disabled={!manualToken || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Verifying...
                  </>
                ) : (
                  'Verify'
                )}
              </Button>
            </form>
          </div>

          <p className='text-center text-sm text-muted-foreground'>
            Didn&apos;t receive the email?{' '}
            <Link
              href={`/resend-verification?email=${encodeURIComponent(emailFromUrl)}`}
              className='text-primary hover:underline'
            >
              Resend
            </Link>
          </p>
        </div>
      </AuthCard>
    );
  }

  // Verifying state
  if (state === 'verifying') {
    return (
      <AuthCard>
        <div className='text-center py-8'>
          <Loader2 className='h-12 w-12 animate-spin text-primary mx-auto mb-4' />
          <h1 className='text-xl font-semibold text-foreground'>
            Verifying your email...
          </h1>
          <p className='mt-2 text-muted-foreground'>Just a moment</p>
        </div>
      </AuthCard>
    );
  }

  // Success state
  if (state === 'success') {
    return (
      <AuthCard>
        <div className='text-center py-4'>
          <div className='mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10'>
            <CheckCircle2 className='h-8 w-8 text-green-500' />
          </div>
          <h1 className='text-2xl font-semibold text-foreground'>
            Email verified
          </h1>
          <p className='mt-2 text-muted-foreground'>
            Your account is now active. Redirecting to dashboard...
          </p>
          <FormSuccess
            title='Welcome aboard!'
            message='Your free credits have been unlocked.'
          />
        </div>
      </AuthCard>
    );
  }

  // Error state
  return (
    <AuthCard>
      <div className='text-center py-4'>
        <div className='mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10'>
          <AlertCircle className='h-8 w-8 text-destructive' />
        </div>
        <h1 className='text-2xl font-semibold text-foreground'>
          {error?.title || 'Verification failed'}
        </h1>
        <p className='mt-2 text-muted-foreground'>
          {error?.message || 'Something went wrong.'}
        </p>
      </div>

      <div className='mt-6 space-y-3'>
        <Button asChild className='w-full'>
          <Link
            href={`/resend-verification?email=${encodeURIComponent(emailFromUrl)}`}
          >
            Request new verification link
          </Link>
        </Button>
        <Button asChild variant='outline' className='w-full bg-transparent'>
          <Link href='/login'>Back to login</Link>
        </Button>
      </div>
    </AuthCard>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <AuthCard>
          <div className='text-center py-8'>
            <Loader2 className='h-12 w-12 animate-spin text-primary mx-auto mb-4' />
            <p className='text-muted-foreground'>Loading...</p>
          </div>
        </AuthCard>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
