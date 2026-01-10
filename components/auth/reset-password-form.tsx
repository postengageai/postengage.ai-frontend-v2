'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthApi } from '@/lib/api/auth';
import { AuthCard, AuthCardHeader } from '@/components/auth/auth-card';
import {
  PasswordStrength,
  isPasswordValid,
} from '@/components/auth/password-strength';
import { FormError } from '@/components/auth/form-error';

type ResetState = 'form' | 'loading' | 'success' | 'error';

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [state, setState] = useState<ResetState>(token ? 'form' : 'error');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<{ title: string; message: string } | null>(
    null
  );

  useEffect(() => {
    if (!token) {
      setError({
        title: 'Invalid link',
        message:
          'This password reset link is invalid. Please request a new one.',
      });
    }
  }, [token]);

  const passwordsMatch = password === confirmPassword;
  const isFormValid =
    isPasswordValid(password) && passwordsMatch && confirmPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting || !token) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await AuthApi.resetPassword({ token, password });

      setState('success');
    } catch {
      setState('error');
      setError({
        title: 'Connection issue',
        message: "We're having trouble connecting. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (state === 'error') {
    return (
      <AuthCard>
        <div className='text-center py-4'>
          <div className='mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10'>
            <AlertCircle className='h-8 w-8 text-destructive' />
          </div>
          <h1 className='text-2xl font-semibold text-foreground'>
            {error?.title || 'Something went wrong'}
          </h1>
          <p className='mt-2 text-muted-foreground'>
            {error?.message || 'Please try again.'}
          </p>
        </div>

        <div className='mt-6 space-y-3'>
          <Button asChild className='w-full'>
            <Link href='/forgot-password'>Request new reset link</Link>
          </Button>
          <Button asChild variant='outline' className='w-full bg-transparent'>
            <Link href='/login'>Back to login</Link>
          </Button>
        </div>
      </AuthCard>
    );
  }

  if (state === 'success') {
    return (
      <AuthCard>
        <div className='text-center py-4'>
          <div className='mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10'>
            <CheckCircle2 className='h-8 w-8 text-green-500' />
          </div>
          <h1 className='text-2xl font-semibold text-foreground'>
            Password updated
          </h1>
          <p className='mt-2 text-muted-foreground'>
            Your password has been reset successfully.
          </p>
        </div>

        <div className='mt-6 space-y-4'>
          <div className='rounded-lg bg-muted/50 p-4'>
            <div className='flex items-start gap-3'>
              <ShieldCheck className='h-5 w-5 text-primary shrink-0 mt-0.5' />
              <div>
                <p className='text-sm font-medium text-foreground'>
                  All sessions terminated
                </p>
                <p className='text-sm text-muted-foreground'>
                  For your security, you&apos;ve been logged out of all devices.
                </p>
              </div>
            </div>
          </div>

          <Button asChild className='w-full'>
            <Link href='/login'>Log in with new password</Link>
          </Button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <AuthCardHeader
        title='Create new password'
        description='Choose a strong password for your account'
      />

      <form onSubmit={handleSubmit} className='space-y-5'>
        {error && <FormError title={error.title} message={error.message} />}

        <div className='space-y-2'>
          <Label htmlFor='password'>New password</Label>
          <Input
            id='password'
            type='password'
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder='Create a strong password'
            disabled={isSubmitting}
          />
          <PasswordStrength password={password} />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='confirmPassword'>Confirm password</Label>
          <Input
            id='confirmPassword'
            type='password'
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder='Confirm your password'
            disabled={isSubmitting}
            className={
              confirmPassword && !passwordsMatch ? 'border-destructive' : ''
            }
          />
          {confirmPassword && !passwordsMatch && (
            <p className='text-sm text-destructive'>
              Passwords don&apos;t match
            </p>
          )}
        </div>

        <Button
          type='submit'
          className='w-full'
          disabled={!isFormValid || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Resetting password...
            </>
          ) : (
            'Reset password'
          )}
        </Button>
      </form>
    </AuthCard>
  );
}
