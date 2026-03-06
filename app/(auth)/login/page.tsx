'use client';

import type React from 'react';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AuthCard,
  AuthCardHeader,
  AuthCardFooter,
} from '@/components/auth/auth-card';
import { FormError } from '@/components/auth/form-error';
import { AuthApi } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/auth/store';
import { useUserActions } from '@/lib/user/store';
import { ApiError, parseApiError } from '@/lib/http/errors';

export default function LoginPage() {
  const router = useRouter();
  const { actions, errors } = useAuthStore();
  const userActions = useUserActions();
  const [isLoading, setIsLoading] = useState(false);
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Field-level errors from backend validation
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const isFormValid = email.includes('@') && password.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isLoading) return;

    setIsLoading(true);
    actions.setLoading(true);
    errors.clearErrors();
    setShowResendVerification(false);
    setFieldErrors({});

    try {
      const response = await AuthApi.login({ email, password });

      userActions.setUser(response.data.user);
      actions.setIsAuthenticated(true);

      router.push('/dashboard');
      router.refresh();
    } catch (error: unknown) {
      // PE-AUTH-007 = email not verified
      if (error instanceof ApiError && error.code === 'PE-AUTH-007') {
        setShowResendVerification(true);
      }

      // Surface any field-level validation errors (e.g. missing password)
      if (error instanceof ApiError && error.isValidationError) {
        setFieldErrors(error.getFieldErrors());
      }

      errors.setError('loginError', error as ApiError);
    } finally {
      setIsLoading(false);
      actions.setLoading(false);
    }
  };

  // Map the stored ApiError to a human-friendly title + message
  const errorDisplay = errors.loginError
    ? parseApiError(errors.loginError)
    : null;

  return (
    <AuthCard>
      <AuthCardHeader
        title='Welcome back'
        description='Log in to your PostEngageAI account'
      />

      <form onSubmit={handleSubmit} className='space-y-5'>
        {errorDisplay && (
          <div className='space-y-3'>
            <FormError
              title={errorDisplay.title}
              message={errorDisplay.message}
            />
            {showResendVerification && (
              <p className='text-sm text-center'>
                <Link
                  href={`/resend-verification?email=${encodeURIComponent(email)}`}
                  className='text-primary hover:underline'
                >
                  Resend verification email
                </Link>
              </p>
            )}
          </div>
        )}

        <div className='space-y-2'>
          <Label htmlFor='email'>Email</Label>
          <Input
            id='email'
            type='email'
            value={email}
            onChange={e => {
              setEmail(e.target.value);
              errors.clearErrors();
              setFieldErrors({});
            }}
            placeholder='you@example.com'
            disabled={isLoading}
            className={fieldErrors.email ? 'border-destructive' : ''}
          />
          {fieldErrors.email && (
            <p className='text-xs text-destructive'>{fieldErrors.email}</p>
          )}
        </div>

        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <Label htmlFor='password'>Password</Label>
            <Link
              href='/forgot-password'
              className='text-sm text-muted-foreground hover:text-primary transition-colors'
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id='password'
            type='password'
            value={password}
            onChange={e => {
              setPassword(e.target.value);
              errors.clearErrors();
              setFieldErrors({});
            }}
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
          className='w-full'
          disabled={!isFormValid || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Logging in...
            </>
          ) : (
            'Log in'
          )}
        </Button>
      </form>

      <AuthCardFooter>
        Don&apos;t have an account?{' '}
        <Link href='/signup' className='text-primary hover:underline'>
          Create one
        </Link>
      </AuthCardFooter>
    </AuthCard>
  );
}
