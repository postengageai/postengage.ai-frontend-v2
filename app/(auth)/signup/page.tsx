'use client';

import type React from 'react';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AuthCard,
  AuthCardHeader,
  AuthCardFooter,
} from '@/components/auth/auth-card';
import {
  PasswordStrength,
  isPasswordValid,
} from '@/components/auth/password-strength';
import { FormError } from '@/components/auth/form-error';
import { AuthApi } from '@/lib/api/auth';

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{ title: string; message: string } | null>(
    null
  );

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    referralCode: '',
    acceptTerms: false,
  });

  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    email: false,
    password: false,
    referralCode: false,
    acceptTerms: false,
  });

  const handleChange =
    (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData(prev => ({ ...prev, [field]: e.target.value }));
      setError(null);
    };

  const handleCheckboxChange = (checked: boolean | 'indeterminate') => {
    setFormData(prev => ({ ...prev, acceptTerms: checked === true }));
    setError(null);
  };

  const handleBlur = (field: keyof typeof touched) => () => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const isFormValid =
    formData.firstName.length >= 2 &&
    formData.lastName.length >= 2 &&
    formData.email.includes('@') &&
    isPasswordValid(formData.password) &&
    formData.acceptTerms;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      await AuthApi.signup({
        email: formData.email,
        first_name: formData.firstName,
        last_name: formData.lastName,
        password: formData.password,
        referral_code: formData.referralCode || undefined,
        accept_terms: true,
      });

      // Redirect to verification pending page
      router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`);
    } catch (error) {
      setError({
        title: 'Signup failed',
        message:
          error instanceof Error
            ? error.message
            : 'Unable to create your account. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard>
      <AuthCardHeader
        title='Create your account'
        description='Start automating your Instagram engagement'
      />

      <form onSubmit={handleSubmit} className='space-y-5'>
        {error && <FormError title={error.title} message={error.message} />}

        <div className='grid grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <Label htmlFor='firstName'>First name</Label>
            <Input
              id='firstName'
              type='text'
              value={formData.firstName}
              onChange={handleChange('firstName')}
              onBlur={handleBlur('firstName')}
              placeholder='Jane'
              disabled={isLoading}
              className={
                touched.firstName && formData.firstName.length < 2
                  ? 'border-destructive'
                  : ''
              }
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='lastName'>Last name</Label>
            <Input
              id='lastName'
              type='text'
              value={formData.lastName}
              onChange={handleChange('lastName')}
              onBlur={handleBlur('lastName')}
              placeholder='Creator'
              disabled={isLoading}
              className={
                touched.lastName && formData.lastName.length < 2
                  ? 'border-destructive'
                  : ''
              }
            />
          </div>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='email'>Email</Label>
          <Input
            id='email'
            type='email'
            value={formData.email}
            onChange={handleChange('email')}
            onBlur={handleBlur('email')}
            placeholder='you@example.com'
            disabled={isLoading}
            className={
              touched.email && !formData.email.includes('@')
                ? 'border-destructive'
                : ''
            }
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='password'>Password</Label>
          <Input
            id='password'
            type='password'
            value={formData.password}
            onChange={handleChange('password')}
            onBlur={handleBlur('password')}
            placeholder='Create a strong password'
            disabled={isLoading}
          />
          <PasswordStrength password={formData.password} />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='referralCode'>Referral Code (Optional)</Label>
          <Input
            id='referralCode'
            type='text'
            value={formData.referralCode}
            onChange={handleChange('referralCode')}
            onBlur={handleBlur('referralCode')}
            placeholder='e.g. SUMMER2026'
            disabled={isLoading}
          />
        </div>

        <div className='flex items-start space-x-2'>
          <Checkbox
            id='terms'
            checked={formData.acceptTerms}
            onCheckedChange={handleCheckboxChange}
            disabled={isLoading}
          />
          <div className='grid gap-1.5 leading-none'>
            <Label
              htmlFor='terms'
              className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
            >
              I accept the{' '}
              <Link href='/terms' className='text-primary hover:underline'>
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href='/privacy' className='text-primary hover:underline'>
                Privacy Policy
              </Link>
            </Label>
          </div>
        </div>

        <Button
          type='submit'
          className='w-full'
          disabled={!isFormValid || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Creating account...
            </>
          ) : (
            'Create account'
          )}
        </Button>
      </form>

      <AuthCardFooter>
        Already have an account?{' '}
        <Link href='/login' className='text-primary hover:underline'>
          Log in
        </Link>
      </AuthCardFooter>
    </AuthCard>
  );
}
