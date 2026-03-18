'use client';

import React, { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, ShieldCheck, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AuthLogo } from '@/components/auth/auth-logo';
import { AuthApi } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/auth/store';
import { useUserStore } from '@/lib/user/store';
import { ApiError, parseApiError } from '@/lib/http/errors';
import { cn } from '@/lib/utils';

// ── OTP digit input ────────────────────────────────────────────────────────────

const DIGITS = 6;

interface OtpInputProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  hasError?: boolean;
}

function OtpInput({ value, onChange, disabled, hasError }: OtpInputProps) {
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  const digits = Array.from({ length: DIGITS }, (_, i) => value[i] ?? '');

  const focus = (index: number) => {
    inputs.current[index]?.focus();
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const next = digits.map((d, i) => (i === index ? '' : d));
      if (next[index] === '') {
        // Already empty, move focus back
        if (index > 0) focus(index - 1);
      }
      onChange(next.join(''));
    } else if (e.key === 'ArrowLeft' && index > 0) {
      focus(index - 1);
    } else if (e.key === 'ArrowRight' && index < DIGITS - 1) {
      focus(index + 1);
    }
  };

  const handleInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (!raw) return;

    if (raw.length > 1) {
      // Pasted a full code
      const pasted = raw.slice(0, DIGITS);
      onChange(pasted.padEnd(DIGITS, '').slice(0, DIGITS));
      focus(Math.min(pasted.length, DIGITS - 1));
      return;
    }

    const next = digits.map((d, i) => (i === index ? raw[0] : d));
    onChange(next.join(''));
    if (index < DIGITS - 1) focus(index + 1);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '');
    if (!pasted) return;
    const code = pasted.slice(0, DIGITS).padEnd(DIGITS, '');
    onChange(code);
    focus(Math.min(pasted.length, DIGITS - 1));
  };

  return (
    <div className='flex gap-2.5 justify-center' onPaste={handlePaste}>
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={el => {
            inputs.current[i] = el;
          }}
          type='text'
          inputMode='numeric'
          pattern='[0-9]*'
          maxLength={1}
          value={digit}
          disabled={disabled}
          autoFocus={i === 0}
          autoComplete='one-time-code'
          onChange={e => handleInput(e, i)}
          onKeyDown={e => handleKeyDown(e, i)}
          className={cn(
            'h-14 w-12 rounded-xl border bg-card text-center text-xl font-bold tracking-tight',
            'transition-all duration-150 outline-none',
            'focus:ring-2 focus:ring-primary focus:border-primary',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            hasError
              ? 'border-error text-error ring-1 ring-error/40 animate-shake'
              : digit
                ? 'border-primary/60 text-foreground'
                : 'border-border text-foreground'
          )}
        />
      ))}
    </div>
  );
}

// ── Inner page ─────────────────────────────────────────────────────────────────

function TwoFactorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') ?? '/dashboard';

  const { actions } = useAuthStore();
  const { actions: userActions } = useUserStore();

  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);

  // Read challenge token from sessionStorage
  const [challengeToken, setChallengeToken] = useState<string | null>(null);
  const [tokenMissing, setTokenMissing] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem('totp_challenge_token');
    if (!token) {
      setTokenMissing(true);
    } else {
      setChallengeToken(token);
    }
  }, []);

  // Auto-submit when all 6 digits are entered
  useEffect(() => {
    if (code.replace(/\D/g, '').length === DIGITS && challengeToken) {
      void handleVerify(code);
    }
  }, [code]);

  const handleVerify = async (currentCode: string) => {
    if (!challengeToken) return;
    if (currentCode.replace(/\D/g, '').length !== DIGITS) return;

    setIsSubmitting(true);
    setError(null);
    setHasError(false);

    try {
      const response = await AuthApi.verifyTotpChallenge({
        challenge_token: challengeToken,
        code: currentCode,
      });

      // Success — clean up token and authenticate
      sessionStorage.removeItem('totp_challenge_token');
      const user = response.data.user;
      userActions.setUser(user);
      actions.setIsAuthenticated(true);

      if (!user.onboarding_completed_at) {
        router.push('/dashboard/onboarding');
      } else {
        router.push(redirectTo);
      }
      router.refresh();
    } catch (err) {
      setHasError(true);
      setCode(''); // Clear digits so user can re-enter

      if (err instanceof ApiError) {
        // Token expired — send back to login
        if (err.code === 'PE-AUTH-009' || err.code === 'PE-AUTH-010') {
          sessionStorage.removeItem('totp_challenge_token');
          setError(
            'Your verification session has expired. Please sign in again.'
          );
          setTimeout(() => router.push('/login'), 2500);
          return;
        }
        const parsed = parseApiError(err);
        setError(parsed.message);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void handleVerify(code);
  };

  if (tokenMissing) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center px-4'>
        <div className='w-full max-w-[400px] text-center space-y-5'>
          <div className='mx-auto h-14 w-14 rounded-full bg-error/10 flex items-center justify-center'>
            <AlertCircle className='h-7 w-7 text-error' />
          </div>
          <div>
            <h2 className='text-xl font-bold text-foreground'>
              Session not found
            </h2>
            <p className='mt-2 text-sm text-muted-foreground'>
              This page requires a valid login session. Please sign in again.
            </p>
          </div>
          <Button asChild className='w-full'>
            <Link href='/login'>Back to sign in</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-background flex'>
      {/* ── Left panel (desktop only) ──────────────────────────────────── */}
      <div className='hidden lg:flex lg:w-[44%] shrink-0 relative flex-col overflow-hidden'>
        <div className='absolute inset-0 bg-grid-faint' />
        <div className='absolute inset-0 bg-hero-radial' />
        <div className='absolute inset-0 bg-auth-glow-bottom' />

        <div className='relative z-10 p-9'>
          <AuthLogo />
        </div>

        <div className='relative z-10 flex-1 flex flex-col justify-center px-10 xl:px-14 pb-16'>
          <div className='mb-6 h-16 w-16 rounded-2xl bg-white/10 backdrop-blur border border-white/15 flex items-center justify-center'>
            <ShieldCheck className='h-8 w-8 text-white' />
          </div>
          <h2 className='text-[2.75rem] font-bold leading-[1.1] tracking-tight text-white mb-4'>
            Two-factor
            <br />
            authentication
          </h2>
          <p className='text-white/55 text-base leading-relaxed max-w-xs'>
            Your account is protected with an extra layer of security. Enter the
            code from your authenticator app to continue.
          </p>
        </div>

        <div className='relative z-10 px-10 xl:px-14 pb-9'>
          <p className='text-xs text-white/35'>
            Lost access to your authenticator?{' '}
            <Link
              href='/login'
              className='text-white/55 hover:text-white/80 transition-colors'
            >
              Contact support
            </Link>
          </p>
        </div>
      </div>

      {/* ── Right panel ─────────────────────────────────────────────────── */}
      <div className='flex-1 flex flex-col'>
        <header className='flex items-center justify-between px-6 pt-6 pb-4'>
          <div className='lg:hidden'>
            <AuthLogo size='sm' />
          </div>
          <Link
            href='/login'
            className='flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors ml-auto'
          >
            <ArrowLeft className='h-3.5 w-3.5' />
            Back to sign in
          </Link>
        </header>

        <main className='flex-1 flex items-center justify-center px-4 py-10'>
          <div className='w-full max-w-[420px] rounded-2xl border border-border bg-card p-5 sm:p-10 shadow-xl shadow-black/40'>
            {/* Icon */}
            <div className='mb-6 flex justify-center'>
              <div className='h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center'>
                <ShieldCheck className='h-7 w-7 text-primary' />
              </div>
            </div>

            <h1 className='text-[1.625rem] font-bold text-foreground tracking-tight text-center'>
              Verify your identity
            </h1>
            <p className='mt-2 text-sm text-muted-foreground text-center mb-8'>
              Enter the 6-digit code from your authenticator app.
            </p>

            {/* Error banner */}
            {error && (
              <div className='mb-6 flex items-start gap-2.5 rounded-lg border border-error/40 bg-error-muted px-4 py-3 text-sm text-error'>
                <AlertCircle className='h-4 w-4 mt-0.5 shrink-0' />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleManualSubmit} className='space-y-6'>
              {/* OTP digits */}
              <OtpInput
                value={code}
                onChange={setCode}
                disabled={isSubmitting}
                hasError={hasError}
              />

              {isSubmitting && (
                <div className='flex items-center justify-center gap-2 text-sm text-muted-foreground'>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  Verifying…
                </div>
              )}

              {/* Submit — only shown when auto-submit isn't triggered */}
              {!isSubmitting && code.replace(/\D/g, '').length === DIGITS && (
                <Button
                  type='submit'
                  className='w-full h-10 bg-primary hover:bg-primary-hover text-white font-semibold rounded-[--radius-md]'
                  disabled={isSubmitting}
                >
                  Verify &amp; Sign In
                </Button>
              )}

              {!isSubmitting && code.replace(/\D/g, '').length < DIGITS && (
                <p className='text-center text-xs text-muted-foreground'>
                  Code auto-submits when all 6 digits are entered
                </p>
              )}
            </form>

            <p className='mt-8 text-xs text-center text-muted-foreground'>
              Open{' '}
              <span className='font-medium text-foreground'>
                Google Authenticator
              </span>
              , <span className='font-medium text-foreground'>Authy</span>, or
              any TOTP app and enter the current 6-digit code.
            </p>
          </div>
        </main>

        <footer className='px-6 pb-6 text-center'>
          <p className='text-xs text-muted-foreground/50'>
            <Link
              href='https://postengage.ai/privacy'
              className='hover:text-muted-foreground transition-colors'
            >
              Privacy
            </Link>
            <span className='mx-2'>·</span>
            <Link
              href='https://postengage.ai/terms'
              className='hover:text-muted-foreground transition-colors'
            >
              Terms
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function TwoFactorPage() {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen bg-background flex items-center justify-center'>
          <Loader2 className='h-8 w-8 animate-spin text-primary' />
        </div>
      }
    >
      <TwoFactorContent />
    </Suspense>
  );
}
