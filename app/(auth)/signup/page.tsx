'use client';

import type React from 'react';
import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Loader2,
  MessageCircle,
  Users,
  BarChart3,
  ShieldCheck,
  CreditCard,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthLogo } from '@/components/auth/auth-logo';
import {
  PasswordStrength,
  isPasswordValid,
} from '@/components/auth/password-strength';
import { FormError } from '@/components/auth/form-error';
import { AuthApi } from '@/lib/api/auth';
import { AffiliateApi } from '@/lib/api/affiliate';
import { parseApiError } from '@/lib/http/errors';
import { useAuthStore } from '@/lib/auth/store';
import { analytics } from '@/lib/analytics';

/* ─── Feature bullet ───────────────────────────────────────────────────── */
function FeatureBullet({
  icon: Icon,
  text,
}: {
  icon: React.ElementType;
  text: string;
}) {
  return (
    <div className='flex items-center gap-3 rounded-xl border border-white/8 bg-white/5 px-4 py-3'>
      <div className='h-8 w-8 shrink-0 flex items-center justify-center rounded-lg border border-primary/25 bg-primary/15'>
        <Icon className='h-4 w-4 text-primary' />
      </div>
      <span className='text-sm text-white/75'>{text}</span>
    </div>
  );
}

/* ─── Social proof avatars ─────────────────────────────────────────────── */
const AVATAR_COLORS = [
  'bg-[#7C3AED]',
  'bg-[#D946EF]',
  'bg-[#06B6D4]',
  'bg-[#F59E0B]',
];
const AVATAR_INITIALS = ['S', 'M', 'A', '+'];

function SocialProof() {
  return (
    <div className='flex items-center gap-3 mt-10'>
      {/* Avatar stack */}
      <div className='flex -space-x-2'>
        {AVATAR_COLORS.map((color, i) => (
          <div
            key={i}
            className={`h-8 w-8 rounded-full border-2 border-background ${color} flex items-center justify-center text-xs font-bold text-white`}
          >
            {AVATAR_INITIALS[i]}
          </div>
        ))}
      </div>

      <div>
        <p className='text-sm font-semibold text-white'>
          8,200+ creators already growing
        </p>
        <div className='flex items-center gap-1.5 mt-0.5'>
          {/* Star icons */}
          <div className='flex gap-0.5'>
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className='h-3 w-3 text-warning'
                fill='currentColor'
                viewBox='0 0 20 20'
              >
                <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
              </svg>
            ))}
          </div>
          <span className='text-xs text-white/50'>4.9/5 average rating</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Main page ─────────────────────────────────────────────────────────── */
function SignupPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const [isLoading, setIsLoading] = useState(false);

  // Already logged-in users should not see signup — send them to buy credits
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard/credits/buy');
    }
  }, [isAuthenticated, router]);
  const [error, setError] = useState<{ title: string; message: string } | null>(
    null
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Persist the ?aff= affiliate code so it survives redirects.
  //
  // Priority order:
  //   1. ?aff= query param in the current URL  (direct click on affiliate link)
  //   2. sessionStorage 'affiliate_code'        (survived a same-tab navigation)
  //   3. document.cookie 'affiliate_code'       (set before any middleware redirect)
  const [refCode, setRefCode] = useState<string | null>(null);
  useEffect(() => {
    const param = searchParams.get('aff');
    if (param) {
      sessionStorage.setItem('affiliate_code', param);
      document.cookie = `affiliate_code=${encodeURIComponent(param)}; max-age=${60 * 60 * 24 * 7}; path=/; samesite=lax`;
      setRefCode(param);
      void AffiliateApi.trackClick(param).catch(() => void 0);
    } else {
      const fromSession = sessionStorage.getItem('affiliate_code');
      if (fromSession) {
        setRefCode(fromSession);
      } else {
        const cookieMatch = document.cookie.match(
          /(?:^|;\s*)affiliate_code=([^;]+)/
        );
        const fromCookie = cookieMatch
          ? decodeURIComponent(cookieMatch[1])
          : null;
        if (fromCookie) {
          sessionStorage.setItem('affiliate_code', fromCookie);
          setRefCode(fromCookie);
        }
      }
    }
  }, [searchParams]);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  const handleChange =
    (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData(prev => ({ ...prev, [field]: e.target.value }));
      setError(null);
      if (fieldErrors[field]) {
        setFieldErrors(prev => {
          const n = { ...prev };
          delete n[field];
          return n;
        });
      }
    };

  const isFormValid =
    formData.firstName.length >= 2 &&
    formData.lastName.length >= 2 &&
    formData.email.includes('@') &&
    isPasswordValid(formData.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isLoading) return;

    setIsLoading(true);
    setError(null);
    setFieldErrors({});

    try {
      await AuthApi.signup({
        email: formData.email,
        first_name: formData.firstName,
        last_name: formData.lastName,
        password: formData.password,
        ...(refCode ? { ref: refCode } : {}),
      });
      // Clear stored affiliate code once successfully used
      sessionStorage.removeItem('affiliate_code');
      document.cookie = 'affiliate_code=; max-age=0; path=/; samesite=lax';
      analytics.track('user_signed_up', { has_ref_code: !!refCode });
      router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`);
    } catch (err: unknown) {
      const parsed = parseApiError(err, { title: 'Signup failed' });
      setError({ title: parsed.title, message: parsed.message });
      if (Object.keys(parsed.fields).length > 0) {
        setFieldErrors(parsed.fields);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-background flex'>
      {/* ── Left panel (desktop only) ────────────────────────────────────── */}
      <div className='hidden lg:flex lg:w-[44%] shrink-0 relative flex-col overflow-hidden'>
        <div className='absolute inset-0 bg-grid-faint' />
        <div className='absolute inset-0 bg-hero-radial' />
        <div className='absolute inset-0 bg-auth-glow-bottom' />

        {/* Logo */}
        <div className='relative z-10 p-9'>
          <AuthLogo />
        </div>

        {/* Content */}
        <div className='relative z-10 flex-1 flex flex-col justify-center px-10 xl:px-14 pb-10'>
          <h2 className='text-[2.5rem] font-bold leading-[1.1] tracking-tight text-white mb-4'>
            Turn Instagram
            <br />
            into a revenue
            <br />
            machine.
          </h2>
          <p className='text-white/55 text-base leading-relaxed mb-8 max-w-sm'>
            AI replies to every comment and DM — 24/7. You focus on creating. We
            handle the rest.
          </p>

          {/* Feature bullets */}
          <div className='space-y-2.5'>
            <FeatureBullet
              icon={MessageCircle}
              text='AI replies to every comment & DM instantly'
            />
            <FeatureBullet
              icon={Users}
              text='Auto-collect leads from comments & DMs'
            />
            <FeatureBullet
              icon={BarChart3}
              text='Real-time analytics across all accounts'
            />
          </div>

          {/* Social proof */}
          <SocialProof />
        </div>

        {/* Trust footer */}
        <div className='relative z-10 px-10 xl:px-14 pb-9'>
          <p className='text-xs text-white/35'>
            Trusted by 8,200+ creators · 1.2M+ replies sent
          </p>
        </div>
      </div>

      {/* ── Right panel ─────────────────────────────────────────────────── */}
      <div className='flex-1 flex flex-col'>
        {/* Mobile logo */}
        <header className='lg:hidden px-6 pt-6 pb-4'>
          <AuthLogo size='sm' />
        </header>

        <main className='flex-1 flex items-center justify-center px-4 py-10'>
          <div className='w-full max-w-[480px] rounded-2xl border border-border bg-card p-5 sm:p-10 shadow-xl shadow-black/40'>
            <h1 className='text-[1.625rem] font-bold text-foreground tracking-tight'>
              Create your free account
            </h1>
            <p className='mt-1.5 text-sm text-muted-foreground'>
              No credit card required. 100 credits free on signup.
            </p>

            {refCode && (
              <div className='mt-3 mb-7 inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-3 py-1'>
                <svg
                  className='h-3.5 w-3.5 text-success'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2.5'
                >
                  <path
                    d='M20 6L9 17l-5-5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
                <span className='text-xs font-medium text-success'>
                  Referral code applied: {refCode}
                </span>
              </div>
            )}
            {!refCode && <div className='mb-7' />}

            {error && (
              <div className='mb-5'>
                <FormError title={error.title} message={error.message} />
              </div>
            )}

            <form onSubmit={handleSubmit} className='space-y-5'>
              {/* First / Last name */}
              <div className='grid gap-4 sm:grid-cols-2'>
                <div className='space-y-2'>
                  <Label htmlFor='firstName'>First Name</Label>
                  <Input
                    id='firstName'
                    type='text'
                    value={formData.firstName}
                    onChange={handleChange('firstName')}
                    placeholder='Enter your first name'
                    disabled={isLoading}
                    className={
                      fieldErrors.first_name ? 'border-destructive' : ''
                    }
                  />
                  {fieldErrors.first_name && (
                    <p className='text-xs text-destructive'>
                      {fieldErrors.first_name}
                    </p>
                  )}
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='lastName'>Last Name</Label>
                  <Input
                    id='lastName'
                    type='text'
                    value={formData.lastName}
                    onChange={handleChange('lastName')}
                    placeholder='Enter your last name'
                    disabled={isLoading}
                    className={
                      fieldErrors.last_name ? 'border-destructive' : ''
                    }
                  />
                  {fieldErrors.last_name && (
                    <p className='text-xs text-destructive'>
                      {fieldErrors.last_name}
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className='space-y-2'>
                <Label htmlFor='email'>Email Address</Label>
                <Input
                  id='email'
                  type='email'
                  value={formData.email}
                  onChange={handleChange('email')}
                  placeholder='you@example.com'
                  disabled={isLoading}
                  className={fieldErrors.email ? 'border-destructive' : ''}
                />
                {fieldErrors.email && (
                  <p className='text-xs text-destructive'>
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className='space-y-2'>
                <Label htmlFor='password'>Password</Label>
                <Input
                  id='password'
                  type='password'
                  value={formData.password}
                  onChange={handleChange('password')}
                  placeholder='Create a password'
                  disabled={isLoading}
                  className={fieldErrors.password ? 'border-destructive' : ''}
                />
                <PasswordStrength password={formData.password} />
                {fieldErrors.password && (
                  <p className='text-xs text-destructive'>
                    {fieldErrors.password}
                  </p>
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
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>

            <p className='mt-6 text-sm text-center text-muted-foreground'>
              Already have an account?{' '}
              <Link
                href='/login'
                className='text-primary hover:text-primary-hover font-medium transition-colors'
              >
                Log in
              </Link>
            </p>

            {/* Trust footer */}
            <div className='mt-6 flex items-center justify-center gap-5 text-xs text-muted-foreground/60'>
              <span className='flex items-center gap-1.5'>
                <ShieldCheck className='h-3.5 w-3.5' />
                SSL Encrypted
              </span>
              <span className='flex items-center gap-1.5'>
                <CreditCard className='h-3.5 w-3.5' />
                No credit card
              </span>
              <span className='flex items-center gap-1.5'>
                <Clock className='h-3.5 w-3.5' />
                Cancel anytime
              </span>
            </div>
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

export default function SignupPage() {
  return (
    <Suspense>
      <SignupPageInner />
    </Suspense>
  );
}
