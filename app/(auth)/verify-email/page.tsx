'use client';

import type React from 'react';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Loader2,
  Zap,
  Instagram,
  BarChart3,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuthLogo } from '@/components/auth/auth-logo';
import { StepProgress } from '@/components/auth/step-progress';
import { AuthApi } from '@/lib/api/auth';

const STEPS = ['Check email', 'Verify email', 'Start automating'];

/* ─── Centered page shell ────────────────────────────────────────────────── */
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

/* ─── Inner content (reads search params) ───────────────────────────────── */
function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const emailFromUrl = searchParams.get('email') || '';
  const tokenFromUrl = searchParams.get('token');
  const statusFromUrl = searchParams.get('status');

  // Handle ?status=success or ?status=expired (from email link)
  if (statusFromUrl === 'success') {
    return (
      <CenteredShell>
        <EmailVerifiedCard />
      </CenteredShell>
    );
  }

  if (statusFromUrl === 'expired') {
    return (
      <CenteredShell>
        <LinkExpiredCard emailFromUrl={emailFromUrl} />
      </CenteredShell>
    );
  }

  // Token in URL → auto-verify
  if (tokenFromUrl) {
    return <AutoVerify token={tokenFromUrl} email={emailFromUrl} />;
  }

  // Default: check your inbox state
  return (
    <CenteredShell>
      <CheckInboxCard email={emailFromUrl} />
    </CenteredShell>
  );
}

/* ─── State 1: Check your inbox ─────────────────────────────────────────── */
function CheckInboxCard({ email }: { email: string }) {
  return (
    <div className='w-full max-w-[480px] rounded-2xl border border-border bg-card p-5 sm:p-12 text-center shadow-xl shadow-black/40'>
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
          <path d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
        </svg>
      </div>

      <h1 className='text-2xl font-bold text-foreground'>Check your inbox!</h1>

      {/* Sent-to badge */}
      {email && (
        <div className='mt-3 inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 text-sm text-primary'>
          <svg
            className='h-3.5 w-3.5'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <path d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
          </svg>
          Sent to {email}
        </div>
      )}

      <p className='mt-5 text-sm text-muted-foreground leading-relaxed px-2'>
        We&apos;ve sent a verification link to your email. Click the link to
        activate your account and get 500 free credits to start automating.
      </p>

      {/* 3-step progress */}
      <div className='mt-8'>
        <StepProgress steps={STEPS} currentStep={1} />
      </div>

      <p className='mt-8 text-sm text-muted-foreground'>
        Didn&apos;t receive the email?{' '}
        <Link
          href={`/resend-verification?email=${encodeURIComponent(email)}`}
          className='text-primary hover:text-primary-hover font-medium transition-colors'
        >
          Resend verification
        </Link>
      </p>

      <div className='mt-4'>
        <Link
          href='/login'
          className='inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors'
        >
          <svg
            className='h-4 w-4'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <path d='M19 12H5m7-7l-7 7 7 7' />
          </svg>
          Back to login
        </Link>
      </div>
    </div>
  );
}

/* ─── State 2: Email Verified success ───────────────────────────────────── */
function EmailVerifiedCard({ countdown }: { countdown?: number }) {
  return (
    <div className='w-full max-w-[480px] rounded-2xl border border-success/25 bg-[#0d1f14] p-5 sm:p-12 text-center shadow-xl shadow-black/40'>
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

      <h1 className='text-2xl font-bold text-foreground'>Email Verified!</h1>
      <p className='mt-2 text-sm text-muted-foreground'>
        Your account is now active and ready to go.
      </p>

      {/* Credits banner */}
      <div className='mt-6 flex items-center gap-3 rounded-xl border border-success/20 bg-success/10 px-5 py-4 text-left'>
        <svg
          className='h-5 w-5 shrink-0 text-success'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        >
          <path d='M20 12V22H4V12M22 7H2v5h20V7zM12 22V7M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z' />
        </svg>
        <div>
          <p className='text-sm font-semibold text-success'>
            500 Free Credits Added!
          </p>
          <p className='text-xs text-muted-foreground mt-0.5'>
            Use them to power your first automations
          </p>
        </div>
      </div>

      {/* Feature tiles */}
      <div className='mt-5 grid grid-cols-3 gap-3'>
        {[
          { icon: Zap, label: 'AI Automations' },
          { icon: Instagram, label: 'Instagram Connect' },
          { icon: BarChart3, label: 'Analytics' },
        ].map(({ icon: Icon, label }) => (
          <div
            key={label}
            className='rounded-xl border border-border bg-card p-4 flex flex-col items-center gap-2'
          >
            <Icon className='h-5 w-5 text-muted-foreground' />
            <span className='text-xs text-muted-foreground'>{label}</span>
          </div>
        ))}
      </div>

      <Button
        asChild
        className='mt-6 w-full h-10 bg-primary hover:bg-primary-hover text-white font-semibold rounded-[--radius-md]'
      >
        <Link href='/login?verified=true'>
          <ArrowRight className='mr-2 h-4 w-4' />
          {countdown !== undefined && countdown > 0
            ? `Continuing to login in ${countdown}s...`
            : 'Continue to Login'}
        </Link>
      </Button>

      <p className='mt-5 flex items-center justify-center gap-1.5 text-xs text-muted-foreground/50'>
        <ShieldCheck className='h-3.5 w-3.5' />
        All your data is encrypted and secure
      </p>
    </div>
  );
}

/* ─── State 3: Link Expired ──────────────────────────────────────────────── */
function LinkExpiredCard({ emailFromUrl }: { emailFromUrl: string }) {
  return (
    <div className='w-full max-w-[440px] rounded-2xl border border-error/25 bg-[#1a0f0f] p-5 sm:p-12 text-center shadow-xl shadow-black/40'>
      {/* Broken link icon */}
      <div className='mx-auto mb-6 h-16 w-16 rounded-full border-2 border-error/30 bg-error/15 flex items-center justify-center'>
        <svg
          className='h-7 w-7 text-error'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='1.75'
          strokeLinecap='round'
          strokeLinejoin='round'
        >
          <path d='M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71' />
          <path d='M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71' />
          <line x1='2' y1='2' x2='22' y2='22' />
        </svg>
      </div>

      <h1 className='text-2xl font-bold text-foreground'>Link Expired</h1>
      <p className='mt-3 text-sm text-muted-foreground leading-relaxed'>
        This verification link has expired or already been used. Get a new one.
      </p>

      <Button
        asChild
        className='mt-8 w-full h-10 bg-primary hover:bg-primary-hover text-white font-semibold rounded-[--radius-md]'
      >
        <Link
          href={`/resend-verification?email=${encodeURIComponent(emailFromUrl)}`}
        >
          <svg
            className='mr-2 h-4 w-4'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <rect x='2' y='4' width='20' height='16' rx='2' />
            <path d='M2 7l10 7 10-7' />
          </svg>
          Request New Link
        </Link>
      </Button>

      <div className='mt-4 inline-flex items-center gap-1.5 rounded-full border border-error/30 bg-error/10 px-3 py-1 text-xs text-error'>
        <svg
          className='h-3 w-3'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
        >
          <circle cx='12' cy='12' r='10' />
          <line x1='12' y1='8' x2='12' y2='12' />
          <line x1='12' y1='16' x2='12.01' y2='16' />
        </svg>
        Error State
      </div>
    </div>
  );
}

/* ─── Auto-verify via token in URL ──────────────────────────────────────── */
function AutoVerify({ token, email }: { token: string; email: string }) {
  const router = useRouter();
  const [result, setResult] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    let cancelled = false;
    AuthApi.verifyEmail({ token })
      .then(() => {
        if (!cancelled) setResult('success');
      })
      .catch(() => {
        if (!cancelled) setResult('error');
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  // Auto-redirect to login after 3 seconds on success
  useEffect(() => {
    if (result !== 'success') return;
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          router.push('/login?verified=true');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [result, router]);

  if (result === 'success') {
    return (
      <CenteredShell>
        <EmailVerifiedCard countdown={countdown} />
      </CenteredShell>
    );
  }
  if (result === 'error') {
    return (
      <CenteredShell>
        <LinkExpiredCard emailFromUrl={email} />
      </CenteredShell>
    );
  }
  return (
    <CenteredShell>
      <div className='w-full max-w-[440px] rounded-2xl border border-border bg-card p-5 sm:p-12 text-center shadow-xl shadow-black/40'>
        <Loader2 className='mx-auto h-10 w-10 animate-spin text-primary mb-4' />
        <p className='text-muted-foreground'>Verifying your email...</p>
      </div>
    </CenteredShell>
  );
}

/* ─── Page export ────────────────────────────────────────────────────────── */
export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen bg-background flex items-center justify-center'>
          <Loader2 className='h-8 w-8 animate-spin text-primary' />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
