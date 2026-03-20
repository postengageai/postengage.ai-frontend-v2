'use client';

import React, { useEffect } from 'react';
import { Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, AlertCircle, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthLogo } from '@/components/auth/auth-logo';
import { AuthApi } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/auth/store';
import { useUserStore } from '@/lib/user/store';
import { ApiError, parseApiError } from '@/lib/http/errors';
import { ErrorCodes } from '@/lib/error-codes';
import { analytics } from '@/lib/analytics';

// ── Zod schema ─────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// ── Left panel stat card ───────────────────────────────────────────────────────

function StatCard({
  value,
  label,
  color = 'text-foreground',
  loading = false,
}: {
  value: string;
  label: string;
  color?: string;
  loading?: boolean;
}) {
  return (
    <div className='flex-1 rounded-xl border border-white/8 bg-white/5 px-4 py-4'>
      {loading ? (
        <div className='h-7 w-16 rounded bg-white/10 animate-pulse mb-1' />
      ) : (
        <p className={`text-2xl font-bold tracking-tight ${color}`}>{value}</p>
      )}
      <p className='mt-0.5 text-xs text-white/50'>{label}</p>
    </div>
  );
}

function formatStat(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M+`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K+`;
  return n.toString();
}

// ── Inner page (needs search params) ──────────────────────────────────────────

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionExpired = searchParams.get('session') === 'expired';
  const justVerified = searchParams.get('verified') === 'true';
  const redirectTo = searchParams.get('redirect') ?? '/dashboard';

  const { actions, errors: authErrors, isAuthenticated } = useAuthStore();
  const { actions: userActions } = useUserStore();

  // Already logged-in users should not see login — send them to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [isAuthenticated, redirectTo, router]);

  // Platform stats via TanStack Query (no useEffect needed)
  const { data: platformStats, isLoading: statsLoading } = useQuery({
    queryKey: ['platform-stats'],
    queryFn: () => AuthApi.getPlatformStats(),
    staleTime: 10 * 60 * 1_000, // Stats rarely change — cache 10 min
  });

  // react-hook-form with Zod resolver
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const [showResend, setShowResend] = React.useState(false);
  const [globalError, setGlobalError] = React.useState<string | null>(null);

  const onSubmit = async (values: LoginFormValues) => {
    setShowResend(false);
    setGlobalError(null);
    authErrors.clearErrors();

    try {
      const response = await AuthApi.login(values);
      const data = response.data;

      // Two-step 2FA: backend returned a challenge token — redirect to TOTP page
      if (data.requires_2fa) {
        sessionStorage.setItem('totp_challenge_token', data.challenge_token);
        if (data.challenge_expires_at != null) {
          sessionStorage.setItem(
            'totp_challenge_expires_at',
            data.challenge_expires_at.toString()
          );
        }
        router.push(`/2fa?redirect=${encodeURIComponent(redirectTo)}`);
        return;
      }

      // No 2FA — login complete
      const user = data.user;
      userActions.setUser(user);
      actions.setIsAuthenticated(true);
      analytics.identify(user.id, {
        email: user.email,
        name: `${user.first_name} ${user.last_name}`.trim(),
      });
      analytics.track('user_logged_in', { method: 'email' });
      // If onboarding not completed, redirect to onboarding wizard
      if (!user.onboarding_completed_at) {
        router.push('/dashboard/onboarding');
      } else {
        router.push(redirectTo);
      }
      router.refresh();
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        if (error.code === ErrorCodes.AUTH.ACCOUNT_LOCKED) {
          router.push(
            `/account-locked?email=${encodeURIComponent(values.email)}`
          );
          return;
        }
        if (error.code === ErrorCodes.AUTH.ACCOUNT_SUSPENDED) {
          router.push('/account-suspended');
          return;
        }
        if (error.code === ErrorCodes.AUTH.EMAIL_NOT_VERIFIED)
          setShowResend(true);

        // Map backend field errors onto react-hook-form fields
        if (error.isValidationError) {
          const fieldErrors = error.getFieldErrors();
          (
            Object.entries(fieldErrors) as [keyof LoginFormValues, string][]
          ).forEach(([field, message]) => setError(field, { message }));
          return;
        }

        const parsed = parseApiError(error);
        setGlobalError(parsed.message);
        authErrors.setError('loginError', error);
        analytics.track('user_login_failed', { reason: parsed.message });
      } else {
        setGlobalError('Something went wrong. Please try again.');
        analytics.track('user_login_failed', { reason: 'unknown_error' });
      }
    }
  };

  return (
    <div className='min-h-screen bg-background flex'>
      {/* ── Left panel (desktop only) ────────────────────────────────────── */}
      <div className='hidden lg:flex lg:w-[44%] shrink-0 relative flex-col overflow-hidden'>
        <div className='absolute inset-0 bg-grid-faint' />
        <div className='absolute inset-0 bg-hero-radial' />
        <div className='absolute inset-0 bg-auth-glow-bottom' />

        <div className='relative z-10 p-9'>
          <AuthLogo />
        </div>

        <div className='relative z-10 flex-1 flex flex-col justify-center px-10 xl:px-14 pb-16'>
          <h2 className='text-[2.75rem] font-bold leading-[1.1] tracking-tight text-white mb-4'>
            Welcome back.
          </h2>
          <p className='text-white/55 text-base leading-relaxed mb-10 max-w-xs'>
            Your automations are running. Pick up where you left off.
          </p>

          <div className='flex gap-3'>
            <StatCard
              value={
                platformStats ? formatStat(platformStats.replies_sent) : '—'
              }
              label='Replies sent'
              loading={statsLoading}
            />
            <StatCard
              value={
                platformStats
                  ? formatStat(platformStats.total_automations)
                  : '—'
              }
              label='Automations live'
              color='text-primary'
              loading={statsLoading}
            />
            <StatCard
              value={
                platformStats ? formatStat(platformStats.active_users) : '—'
              }
              label='Active creators'
              color='text-success'
              loading={statsLoading}
            />
          </div>
        </div>

        <div className='relative z-10 px-10 xl:px-14 pb-9'>
          <p className='text-xs text-white/35'>
            Trusted by 10,000+ creators worldwide
          </p>
        </div>
      </div>

      {/* ── Right panel ─────────────────────────────────────────────────── */}
      <div className='flex-1 flex flex-col'>
        <header className='lg:hidden px-6 pt-6 pb-4'>
          <AuthLogo size='sm' />
        </header>

        <main className='flex-1 flex items-center justify-center px-4 py-10'>
          <div className='w-full max-w-[440px] rounded-2xl border border-border bg-card p-5 sm:p-10 shadow-xl shadow-black/40'>
            {sessionExpired && (
              <div className='mb-6 flex items-center gap-2.5 rounded-lg border border-warning/40 bg-warning-muted px-4 py-3 text-sm text-warning'>
                <Clock className='h-4 w-4 shrink-0' />
                Your session has expired. Please log in again.
              </div>
            )}

            {justVerified && (
              <div className='mb-6 flex items-center gap-2.5 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success'>
                <svg
                  className='h-4 w-4 shrink-0'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                >
                  <path d='M20 6L9 17l-5-5' />
                </svg>
                Email verified! Sign in to start automating.
              </div>
            )}

            <h1 className='text-[1.625rem] font-bold text-foreground tracking-tight'>
              Sign in to your account
            </h1>
            <p className='mt-1.5 text-sm text-muted-foreground mb-7'>
              Enter your credentials to continue.
            </p>

            {globalError && (
              <div className='mb-5 flex items-start gap-2.5 rounded-lg border border-error/40 bg-error-muted px-4 py-3 text-sm text-error'>
                <AlertCircle className='h-4 w-4 mt-0.5 shrink-0' />
                <div>
                  <span>{globalError}</span>
                  {showResend && (
                    <span>
                      {' '}
                      <Link
                        href={`/resend-verification?email=${encodeURIComponent('')}`}
                        className='underline underline-offset-2 font-medium'
                      >
                        Resend verification email
                      </Link>
                    </span>
                  )}
                </div>
              </div>
            )}

            <form
              onSubmit={handleSubmit(onSubmit)}
              className='space-y-5'
              noValidate
            >
              {/* Email */}
              <div className='space-y-2'>
                <Label
                  htmlFor='email'
                  className='text-sm font-medium text-foreground'
                >
                  Email Address
                </Label>
                <Input
                  id='email'
                  type='email'
                  placeholder='you@example.com'
                  disabled={isSubmitting}
                  className={errors.email ? 'border-destructive' : ''}
                  {...register('email')}
                />
                {errors.email && (
                  <p className='text-xs text-destructive'>
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <Label
                    htmlFor='password'
                    className='text-sm font-medium text-foreground'
                  >
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
                  placeholder='Enter your password'
                  disabled={isSubmitting}
                  className={errors.password ? 'border-destructive' : ''}
                  {...register('password')}
                />
                {errors.password && (
                  <p className='text-xs text-destructive'>
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type='submit'
                className='w-full h-10 bg-primary hover:bg-primary-hover text-white font-semibold rounded-[--radius-md]'
                disabled={isSubmitting}
              >
                {isSubmitting ? (
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
              <Link
                href='/signup'
                className='text-primary hover:text-primary-hover font-medium transition-colors'
              >
                Sign up
              </Link>
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

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen bg-background flex items-center justify-center'>
          <Loader2 className='h-8 w-8 animate-spin text-primary' />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
