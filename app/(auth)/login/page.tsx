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
import { ApiError } from '@/lib/http/errors';

export default function LoginPage() {
  const router = useRouter();
  const { actions, errors } = useAuthStore();
  const userActions = useUserActions();
  const [isLoading, setIsLoading] = useState(false);
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const isFormValid = email.includes('@') && password.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isLoading) return;

    setIsLoading(true);
    actions.setLoading(true);
    errors.clearErrors();
    setShowResendVerification(false);

    try {
      // Use the AuthApi class for proper API integration
      const response = await AuthApi.login({ email, password });

      // Update auth store with user data
      userActions.setUser(response.data.user);
      actions.setIsAuthenticated(true);

      // Redirect to dashboard on success
      router.push('/dashboard');
      router.refresh(); // Refresh to update auth state
    } catch (error: unknown) {
      // console.error('Login error:', error);

      // Handle specific error cases
      if (
        error instanceof ApiError &&
        error.code === 'AUTH_EMAIL_NOT_VERIFIED_000008'
      ) {
        setShowResendVerification(true);
      }

      errors.setError('loginError', error as ApiError);
    } finally {
      setIsLoading(false);
      actions.setLoading(false);
    }
  };

  return (
    <AuthCard>
      <AuthCardHeader
        title='Welcome back'
        description='Log in to your PostEngageAI account'
      />

      <form onSubmit={handleSubmit} className='space-y-5'>
        {errors.loginError && (
          <div className='space-y-3'>
            <FormError message={errors.loginError.message} />
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
            }}
            placeholder='you@example.com'
            disabled={isLoading}
          />
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
            }}
            placeholder='Enter your password'
            disabled={isLoading}
          />
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
