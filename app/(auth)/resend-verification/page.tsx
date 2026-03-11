'use client';

import type React from 'react';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthLogo } from '@/components/auth/auth-logo';
import { AuthApi } from '@/lib/api/auth';

const COUNTDOWN_SECONDS = 45;

function ResendVerificationContent() {
  const searchParams = useSearchParams();
  const emailFromUrl = searchParams.get('email') || '';

  const [email, setEmail] = useState(emailFromUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Countdown timer after submission
  useEffect(() => {
    if (!isSubmitted) return;
    setCountdown(COUNTDOWN_SECONDS);
  }, [isSubmitted]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@') || isLoading) return;
    setIsLoading(true);
    try {
      await AuthApi.resendVerification({ email });
    } catch {
      // privacy-safe: always show success
    } finally {
      setIsLoading(false);
      setIsSubmitted(true);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setIsLoading(true);
    try {
      await AuthApi.resendVerification({ email });
    } catch {
      // noop
    } finally {
      setIsLoading(false);
      setCountdown(COUNTDOWN_SECONDS);
    }
  };

  return (
    <div className='min-h-screen bg-background flex flex-col'>
      <header className='px-8 pt-7'>
        <AuthLogo size='sm' />
      </header>

      <main className='flex-1 flex items-center justify-center px-4 py-12'>
        {isSubmitted ? (
          /* ── State B: Sent ──────────────────────────────────────── */
          <div className='w-full max-w-[440px] rounded-2xl border border-success/25 bg-[#0d1f14] p-5 sm:p-12 text-center shadow-xl shadow-black/40'>
            {/* Green checkmark */}
            <div className='mx-auto mb-6 h-16 w-16 rounded-full border-2 border-success/30 bg-success/15 flex items-center justify-center'>
              <svg
                className='h-7 w-7 text-success'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <path d='M20 6L9 17l-5-5' />
              </svg>
            </div>

            <h1 className='text-2xl font-bold text-foreground'>
              Verification Email Sent!
            </h1>
            <p className='mt-3 text-sm text-muted-foreground leading-relaxed'>
              If this email is registered, we&apos;ve sent a new verification
              link. Check your inbox or spam.
            </p>

            {/* Countdown resend button */}
            <Button
              onClick={handleResend}
              disabled={countdown > 0 || isLoading}
              variant='outline'
              className='mt-8 w-full h-10 border-success/40 text-success hover:bg-success/10 disabled:opacity-60 rounded-[--radius-md]'
            >
              {isLoading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Sending...
                </>
              ) : countdown > 0 ? (
                <>
                  <svg
                    className='mr-2 h-4 w-4'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  >
                    <circle cx='12' cy='12' r='10' />
                    <polyline points='12 6 12 12 16 14' />
                  </svg>
                  Resend in {countdown}s
                </>
              ) : (
                'Resend Again'
              )}
            </Button>
          </div>
        ) : (
          /* ── State A: Form ──────────────────────────────────────── */
          <div className='w-full max-w-[440px] rounded-2xl border border-border bg-card p-5 sm:p-12 shadow-xl shadow-black/40'>
            <div className='text-center mb-8'>
              {/* Envelope icon */}
              <div className='mx-auto mb-6 h-16 w-16 rounded-full border-2 border-primary/25 bg-primary/15 flex items-center justify-center'>
                <svg
                  className='h-7 w-7 text-primary'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='1.75'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <rect x='2' y='4' width='20' height='16' rx='2' />
                  <path d='M2 7l10 7 10-7' />
                </svg>
              </div>
              <h1 className='text-2xl font-bold text-foreground'>
                Resend Verification Email
              </h1>
              <p className='mt-2 text-sm text-muted-foreground'>
                Enter your email address and we&apos;ll send you a fresh
                verification link.
              </p>
            </div>

            <form onSubmit={handleSubmit} className='space-y-5'>
              <div className='space-y-2'>
                <Label htmlFor='email'>Email Address</Label>
                <div className='relative'>
                  <svg
                    className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='1.75'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  >
                    <rect x='2' y='4' width='20' height='16' rx='2' />
                    <path d='M2 7l10 7 10-7' />
                  </svg>
                  <Input
                    id='email'
                    type='email'
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder='you@example.com'
                    disabled={isLoading}
                    className='pl-9'
                  />
                </div>
              </div>

              <Button
                type='submit'
                className='w-full h-10 bg-primary hover:bg-primary-hover text-white font-semibold rounded-[--radius-md]'
                disabled={!email.includes('@') || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className='mr-2 h-4 w-4' />
                    Send Verification Email
                  </>
                )}
              </Button>
            </form>

            <p className='mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground/60'>
              <svg
                className='h-3.5 w-3.5'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <circle cx='12' cy='12' r='10' />
                <polyline points='12 6 12 12 16 14' />
              </svg>
              Resend available again in 60s if already sent recently
            </p>

            {/* Divider */}
            <div className='my-6 flex items-center gap-3'>
              <div className='flex-1 h-px bg-border' />
              <span className='text-xs text-muted-foreground'>or</span>
              <div className='flex-1 h-px bg-border' />
            </div>

            <p className='text-sm text-center text-muted-foreground'>
              Already verified?{' '}
              <Link
                href='/login'
                className='text-primary hover:text-primary-hover font-medium transition-colors'
              >
                Sign in
              </Link>
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default function ResendVerificationPage() {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen bg-background flex items-center justify-center'>
          <Loader2 className='h-8 w-8 animate-spin text-primary' />
        </div>
      }
    >
      <ResendVerificationContent />
    </Suspense>
  );
}
