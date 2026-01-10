'use client';

import type React from 'react';

import { useState } from 'react';
import Link from 'next/link';
import { Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthApi } from '@/lib/api/auth';
import {
  AuthCard,
  AuthCardHeader,
  AuthCardFooter,
} from '@/components/auth/auth-card';
import { FormSuccess } from '@/components/auth/form-success';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const isFormValid = email.includes('@');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isLoading) return;

    setIsLoading(true);

    try {
      await AuthApi.forgotPassword({ email });

      // Always show success (privacy-safe)
      setIsSubmitted(true);
    } catch {
      // Still show success for privacy
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <AuthCard>
        <div className='text-center'>
          <div className='mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10'>
            <Mail className='h-8 w-8 text-primary' />
          </div>
          <h1 className='text-2xl font-semibold text-foreground'>
            Check your email
          </h1>
          <p className='mt-2 text-muted-foreground'>
            If an account exists for{' '}
            <span className='font-medium text-foreground'>{email}</span>,
            we&apos;ve sent password reset instructions.
          </p>
        </div>

        <div className='mt-8 space-y-4'>
          <FormSuccess message="The email should arrive within a few minutes. Check your spam folder if you don't see it." />

          <div className='rounded-lg bg-muted/50 p-4'>
            <p className='text-sm text-muted-foreground'>
              The reset link will expire in 1 hour for security reasons.
            </p>
          </div>
        </div>

        <AuthCardFooter>
          <Link href='/login' className='text-primary hover:underline'>
            Back to login
          </Link>
        </AuthCardFooter>
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <AuthCardHeader
        title='Reset your password'
        description="Enter your email and we'll send you a reset link"
      />

      <form onSubmit={handleSubmit} className='space-y-5'>
        <div className='space-y-2'>
          <Label htmlFor='email'>Email</Label>
          <Input
            id='email'
            type='email'
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder='you@example.com'
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
              Sending...
            </>
          ) : (
            'Send reset link'
          )}
        </Button>
      </form>

      <AuthCardFooter>
        Remember your password?{' '}
        <Link href='/login' className='text-primary hover:underline'>
          Log in
        </Link>
      </AuthCardFooter>
    </AuthCard>
  );
}
