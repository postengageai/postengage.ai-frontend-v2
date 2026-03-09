'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthLogo } from '@/components/auth/auth-logo';
import { AuthApi } from '@/lib/api/auth';
import { parseApiError } from '@/lib/http/errors';
import { PasswordStrength, PasswordRequirements, isPasswordValid } from '@/components/auth/password-strength';

type ResetState = 'form' | 'success' | 'error';

/* ─── Centered shell (duplicated from verify-email to keep self-contained) ── */
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

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [state, setState] = useState<ResetState>(token ? 'form' : 'error');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<{ title: string; message: string } | null>(null);

  useEffect(() => {
    if (!token) {
      setErrorMsg({
        title: 'Invalid link',
        message: 'This password reset link is invalid. Please request a new one.',
      });
    }
  }, [token]);

  const passwordsMatch = confirmPassword.length === 0 || password === confirmPassword;
  const isFormValid = isPasswordValid(password) && password === confirmPassword && confirmPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting || !token) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await AuthApi.resetPassword({ token, password });
      setState('success');
    } catch (err: unknown) {
      setState('error');
      const parsed = parseApiError(err, {
        title: 'Reset failed',
        message: "We couldn't reset your password. The link may have expired.",
      });
      setErrorMsg({ title: parsed.title, message: parsed.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── Error state ─────────────────────────────────────────────── */
  if (state === 'error') {
    return (
      <CenteredShell>
        <div className='w-full max-w-[440px] rounded-2xl border border-error/25 bg-[#1a0f0f] p-12 text-center shadow-xl shadow-black/40'>
          <div className='mx-auto mb-6 h-16 w-16 rounded-full border-2 border-error/30 bg-error/15 flex items-center justify-center'>
            <svg className='h-7 w-7 text-error' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.75' strokeLinecap='round' strokeLinejoin='round'>
              <circle cx='12' cy='12' r='10'/><line x1='12' y1='8' x2='12' y2='12'/><line x1='12' y1='16' x2='12.01' y2='16'/>
            </svg>
          </div>
          <h1 className='text-2xl font-bold text-foreground'>{errorMsg?.title ?? 'Something went wrong'}</h1>
          <p className='mt-2 text-sm text-muted-foreground'>{errorMsg?.message ?? 'Please try again.'}</p>
          <div className='mt-8 space-y-3'>
            <Button asChild className='w-full h-10 bg-primary hover:bg-primary-hover text-white font-semibold rounded-[--radius-md]'>
              <Link href='/forgot-password'>Request new reset link</Link>
            </Button>
            <Button asChild variant='outline' className='w-full h-10 bg-transparent rounded-[--radius-md]'>
              <Link href='/login'>Back to login</Link>
            </Button>
          </div>
        </div>
      </CenteredShell>
    );
  }

  /* ── Success state ───────────────────────────────────────────── */
  if (state === 'success') {
    return (
      <CenteredShell>
        <div className='w-full max-w-[440px] rounded-2xl border border-success/25 bg-[#0d1f14] p-12 text-center shadow-xl shadow-black/40'>
          <div className='mx-auto mb-6 h-16 w-16 rounded-full border-2 border-success/30 bg-success/15 flex items-center justify-center'>
            <svg className='h-7 w-7 text-success' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
              <path d='M20 6L9 17l-5-5' />
            </svg>
          </div>
          <h1 className='text-2xl font-bold text-foreground'>Password Updated!</h1>
          <p className='mt-2 text-sm text-muted-foreground'>Your password has been reset successfully.</p>

          <div className='mt-6 flex items-start gap-3 rounded-xl border border-border bg-card p-4 text-left'>
            <ShieldCheck className='h-5 w-5 text-primary shrink-0 mt-0.5' />
            <div>
              <p className='text-sm font-medium text-foreground'>All sessions terminated</p>
              <p className='text-xs text-muted-foreground mt-0.5'>For your security, you&apos;ve been logged out of all devices.</p>
            </div>
          </div>

          <Button asChild className='mt-6 w-full h-10 bg-primary hover:bg-primary-hover text-white font-semibold rounded-[--radius-md]'>
            <Link href='/login'>Log in with new password</Link>
          </Button>
        </div>
      </CenteredShell>
    );
  }

  /* ── Form state ──────────────────────────────────────────────── */
  return (
    <CenteredShell>
      <div className='w-full max-w-[480px] rounded-2xl border border-border bg-card p-12 shadow-xl shadow-black/40'>
        {/* Lock icon */}
        <div className='text-center mb-8'>
          <div className='mx-auto mb-6 h-16 w-16 rounded-full border-2 border-primary/25 bg-primary/15 flex items-center justify-center'>
            <svg className='h-7 w-7 text-primary' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.75' strokeLinecap='round' strokeLinejoin='round'>
              <rect x='3' y='11' width='18' height='11' rx='2' ry='2'/><path d='M7 11V7a5 5 0 0110 0v4'/>
            </svg>
          </div>
          <h1 className='text-2xl font-bold text-foreground'>Create new password</h1>
          <p className='mt-2 text-sm text-muted-foreground'>
            Make it strong. Mix uppercase, numbers and special characters.
          </p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-5'>
          {/* New password */}
          <div className='space-y-2'>
            <Label htmlFor='password'>New Password</Label>
            <Input
              id='password'
              type='password'
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder='Enter new password'
              disabled={isSubmitting}
            />
            {/* 4-segment bar + label */}
            <PasswordStrength password={password} />
          </div>

          {/* Confirm password */}
          <div className='space-y-2'>
            <Label htmlFor='confirmPassword'>Confirm New Password</Label>
            <Input
              id='confirmPassword'
              type='password'
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder='Confirm new password'
              disabled={isSubmitting}
              className={confirmPassword && !passwordsMatch ? 'border-destructive' : ''}
            />
            {confirmPassword && !passwordsMatch && (
              <p className='text-xs text-destructive'>Passwords don&apos;t match</p>
            )}
          </div>

          {/* Requirements checklist */}
          {password.length > 0 && <PasswordRequirements password={password} />}

          <Button
            type='submit'
            className='w-full h-10 bg-primary hover:bg-primary-hover text-white font-semibold rounded-[--radius-md]'
            disabled={!isFormValid || isSubmitting}
          >
            {isSubmitting ? (
              <><Loader2 className='mr-2 h-4 w-4 animate-spin' />Resetting...</>
            ) : (
              'Reset Password'
            )}
          </Button>
        </form>

        {/* State badge */}
        <div className='mt-6 flex justify-center'>
          <span className='inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary'>
            <svg className='h-3 w-3' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
              <rect x='3' y='11' width='18' height='11' rx='2'/><path d='M7 11V7a5 5 0 0110 0v4'/>
            </svg>
            From reset link
          </span>
        </div>
      </div>
    </CenteredShell>
  );
}
