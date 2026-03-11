'use client';

import type React from 'react';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuthLogo } from '@/components/auth/auth-logo';
import { AuthApi } from '@/lib/api/auth';

function CenteredShell({ children }: { children: React.ReactNode }) {
  return (
    <div className='min-h-screen bg-background flex flex-col'>
      <header className='px-8 pt-7'>
        <AuthLogo size='sm' />
      </header>
      <main className='flex-1 flex items-center justify-center px-4 py-12'>
        {children}
      </main>
    </div>
  );
}

function formatUnlocksAt(unlocksAt: string): string {
  const unlockDate = new Date(unlocksAt);
  const now = new Date();
  const diffMs = unlockDate.getTime() - now.getTime();
  if (diffMs <= 0) return 'shortly';
  const diffMins = Math.ceil(diffMs / 60_000);
  if (diffMins < 60) return `~${diffMins} minute${diffMins !== 1 ? 's' : ''}`;
  return `~${Math.ceil(diffMins / 60)} hour${Math.ceil(diffMins / 60) !== 1 ? 's' : ''}`;
}

function AccountLockedContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';

  const [unlocksAt, setUnlocksAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(!!email);

  useEffect(() => {
    if (!email) return;
    AuthApi.getAccountStatus(email)
      .then(s => {
        if (s.unlocksAt) setUnlocksAt(s.unlocksAt);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [email]);

  const unlockText = unlocksAt
    ? `Account will unlock in ${formatUnlocksAt(unlocksAt)}.`
    : 'Your account will be unlocked in approximately 30 minutes.';

  return (
    <div className='w-full max-w-[440px] rounded-2xl border border-warning/25 bg-[#1a150a] p-5 sm:p-12 text-center shadow-xl shadow-black/40'>
      {/* Lock icon */}
      <div className='mx-auto mb-6 h-16 w-16 rounded-full border-2 border-warning/30 bg-warning/15 flex items-center justify-center'>
        <svg
          className='h-7 w-7 text-warning'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='1.75'
          strokeLinecap='round'
          strokeLinejoin='round'
        >
          <rect x='3' y='11' width='18' height='11' rx='2' ry='2' />
          <path d='M7 11V7a5 5 0 0110 0v4' />
        </svg>
      </div>

      <h1 className='text-2xl font-bold text-foreground'>Account Locked</h1>
      <p className='mt-2 text-sm text-muted-foreground leading-relaxed px-2'>
        Too many failed login attempts. Your account has been temporarily locked
        for security.
      </p>

      {/* Info box */}
      <div className='mt-6 flex items-start gap-3 rounded-xl border border-border bg-card p-4 text-left'>
        <Clock className='h-5 w-5 text-warning shrink-0 mt-0.5' />
        <div>
          <p className='text-sm font-medium text-foreground'>
            Account unlocks automatically
          </p>
          {loading ? (
            <div className='mt-1 h-3 w-40 rounded bg-white/10 animate-pulse' />
          ) : (
            <p className='text-xs text-muted-foreground mt-0.5'>
              {unlockText} No action required.
            </p>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className='mt-8 grid grid-cols-2 gap-3'>
        <Button
          asChild
          className='w-full h-10 bg-primary hover:bg-primary-hover text-white font-semibold rounded-[--radius-md]'
        >
          <Link href='mailto:support@postengage.ai'>Contact Support</Link>
        </Button>
        <Button
          asChild
          variant='outline'
          className='w-full h-10 bg-transparent rounded-[--radius-md]'
        >
          <Link href='/forgot-password'>Reset Password</Link>
        </Button>
      </div>

      {/* Try a different account */}
      <div className='mt-5'>
        <Link
          href='/login'
          className='inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors'
        >
          Try a different account
          <svg
            className='h-3.5 w-3.5'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <path d='M5 12h14m-7-7 7 7-7 7' />
          </svg>
        </Link>
      </div>

      {/* State badge */}
      <div className='mt-5 flex justify-center'>
        <span className='inline-flex items-center gap-1.5 rounded-full border border-warning/30 bg-warning/10 px-3 py-1 text-xs text-warning'>
          <svg
            className='h-3 w-3'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <path d='M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z' />
            <line x1='12' y1='9' x2='12' y2='13' />
            <line x1='12' y1='17' x2='12.01' y2='17' />
          </svg>
          Locked
        </span>
      </div>
    </div>
  );
}

export default function AccountLockedPage() {
  return (
    <CenteredShell>
      <Suspense
        fallback={
          <div className='flex items-center justify-center h-64'>
            <Loader2 className='h-8 w-8 animate-spin text-primary' />
          </div>
        }
      >
        <AccountLockedContent />
      </Suspense>
    </CenteredShell>
  );
}
