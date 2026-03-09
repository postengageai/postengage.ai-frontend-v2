'use client';

import type React from 'react';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthLogo } from '@/components/auth/auth-logo';
import { AuthApi } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/auth/store';
import { useUserActions } from '@/lib/user/store';
import { ApiError, parseApiError } from '@/lib/http/errors';

/* ─── Left panel stat card ──────────────────────────────────────────────── */
function StatCard({
  value,
  label,
  color = 'text-foreground',
}: {
  value: string;
  label: string;
  color?: string;
}) {
  return (
    <div className='flex-1 rounded-xl border border-white/8 bg-white/5 px-4 py-4'>
      <p className={`text-2xl font-bold tracking-tight ${color}`}>{value}</p>
      <p className='mt-0.5 text-xs text-white/50'>{label}</p>
    </div>
  );
}

/* ─── Inner page (needs search params) ─────────────────────────────────── */
function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionExpired = searchParams.get('session') === 'expired';

  const { actions, errors } = useAuthStore();
  const userActions = useUserActions();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const isFormValid = email.includes('@') && password.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isLoading) return;

    setIsLoading(true);
    actions.setLoading(true);
    errors.clearErrors();
    setShowResend(false);
    setFieldErrors({});

    try {
      const response = await AuthApi.login({ email, password });
      userActions.setUser(response.data.user);
      actions.setIsAuthenticated(true);
      router.push('/dashboard');
      router.refresh();
    } catch (error: unknown) {
      if (error instanceof ApiError && error.code === 'PE-AUTH-007') {
        setShowResend(true);
      }
      if (error instanceof ApiError && error.isValidationError) {
        setFieldErrors(error.getFieldErrors());
      }
      errors.setError('loginError', error as ApiError);
    } finally {
      setIsLoading(false);
      actions.setLoading(false);
    }
  };

  const errorDisplay = errors.loginError ? parseApiError(errors.loginError) : null;

  return (
    <div className='min-h-screen bg-background flex'>
      {/* ── Left panel (desktop only) ────────────────────────────────────── */}
      <div className='hidden lg:flex lg:w-[44%] shrink-0 relative flex-col overflow-hidden'>
        {/* Layered backgrounds */}
        <div className='absolute inset-0 bg-grid-faint' />
        <div className='absolute inset-0 bg-hero-radial' />
        <div className='absolute inset-0 bg-auth-glow-bottom' />

        {/* Logo */}
        <div className='relative z-10 p-9'>
          <AuthLogo />
        </div>

        {/* Content */}
        <div className='relative z-10 flex-1 flex flex-col justify-center px-10 xl:px-14 pb-16'>
          <h2 className='text-[2.75rem] font-bold leading-[1.1] tracking-tight text-white mb-4'>
            Welcome back.
          </h2>
          <p className='text-white/55 text-base leading-relaxed mb-10 max-w-xs'>
            Your automations are running. Pick up where you left off.
          </p>

          {/* Stat cards */}
          <div className='flex gap-3'>
            <StatCard value='2.4M+' label='Replies sent' />
            <StatCard value='98%'   label='Response rate' color='text-primary' />
            <StatCard value='4.2×'  label='Avg ROI uplift' color='text-success' />
          </div>
        </div>

        {/* Trust footer */}
        <div className='relative z-10 px-10 xl:px-14 pb-9'>
          <p className='text-xs text-white/35'>Trusted by 10,000+ creators worldwide</p>
        </div>
      </div>

      {/* ── Right panel ─────────────────────────────────────────────────── */}
      <div className='flex-1 flex flex-col'>
        {/* Mobile logo */}
        <header className='lg:hidden px-6 pt-6 pb-4'>
          <AuthLogo size='sm' />
        </header>

        {/* Form */}
        <main className='flex-1 flex items-center justify-center px-4 py-10'>
          <div className='w-full max-w-[440px] rounded-2xl border border-border bg-card p-10 shadow-xl shadow-black/40'>

            {/* Session-expired banner */}
            {sessionExpired && (
              <div className='mb-6 flex items-center gap-2.5 rounded-lg border border-warning/40 bg-warning-muted px-4 py-3 text-sm text-warning'>
                <Clock className='h-4 w-4 shrink-0' />
                Your session has expired. Please log in again.
              </div>
            )}

            <h1 className='text-[1.625rem] font-bold text-foreground tracking-tight'>
              Sign in to your account
            </h1>
            <p className='mt-1.5 text-sm text-muted-foreground mb-7'>
              Enter your credentials to continue.
            </p>

            {/* Error banner */}
            {errorDisplay && (
              <div className='mb-5 flex items-start gap-2.5 rounded-lg border border-error/40 bg-error-muted px-4 py-3 text-sm text-error'>
                <AlertCircle className='h-4 w-4 mt-0.5 shrink-0' />
                <div>
                  <span>{errorDisplay.message}</span>
                  {showResend && (
                    <span>
                      {' '}
                      <Link
                        href={`/resend-verification?email=${encodeURIComponent(email)}`}
                        className='underline underline-offset-2 font-medium'
                      >
                        Resend verification email
                      </Link>
                    </span>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className='space-y-5'>
              {/* Email */}
              <div className='space-y-2'>
                <Label htmlFor='email' className='text-sm font-medium text-foreground'>
                  Email Address
                </Label>
                <Input
                  id='email'
                  type='email'
                  value={email}
                  onChange={e => { setEmail(e.target.value); errors.clearErrors(); setFieldErrors({}); }}
                  placeholder='you@example.com'
                  disabled={isLoading}
                  className={fieldErrors.email ? 'border-destructive' : ''}
                />
                {fieldErrors.email && (
                  <p className='text-xs text-destructive'>{fieldErrors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <Label htmlFor='password' className='text-sm font-medium text-foreground'>
                    Password
                  </Label>
                  <Link
                    href='/forgot-password'
                    className='text-sm text-primary hover:text-primary-hover transition-colors'
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id='password'
                  type='password'
                  value={password}
                  onChange={e => { setPassword(e.target.value); errors.clearErrors(); setFieldErrors({}); }}
                  placeholder='Enter your password'
                  disabled={isLoading}
                  className={fieldErrors.password ? 'border-destructive' : ''}
                />
                {fieldErrors.password && (
                  <p className='text-xs text-destructive'>{fieldErrors.password}</p>
                )}
              </div>

              <Button
                type='submit'
                className='w-full h-10 bg-primary hover:bg-primary-hover text-white font-semibold rounded-[--radius-md]'
                disabled={!isFormValid || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <p className='mt-6 text-sm text-center text-muted-foreground'>
              Don&apos;t have an account?{' '}
              <Link href='/signup' className='text-primary hover:text-primary-hover font-medium transition-colors'>
                Sign up
              </Link>
            </p>
          </div>
        </main>

        {/* Footer */}
        <footer className='px-6 pb-6 text-center'>
          <p className='text-xs text-muted-foreground/50'>
            <Link href='https://postengage.ai/privacy' className='hover:text-muted-foreground transition-colors'>Privacy</Link>
            <span className='mx-2'>·</span>
            <Link href='https://postengage.ai/terms' className='hover:text-muted-foreground transition-colors'>Terms</Link>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
