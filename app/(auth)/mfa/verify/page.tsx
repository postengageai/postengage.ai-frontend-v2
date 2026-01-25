'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
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
import Link from 'next/link';

function MfaVerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { actions, errors } = useAuthStore();
  const userActions = useUserActions();

  const [mfaCode, setMfaCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const mfaToken = searchParams.get('token');

  const isMfaValid = mfaCode.length >= 6;

  useEffect(() => {
    if (!mfaToken) {
      router.push('/login');
    }
  }, [mfaToken, router]);

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMfaValid || !mfaToken || isLoading) return;

    setIsLoading(true);
    actions.setLoading(true);
    errors.clearErrors();

    try {
      const response = await AuthApi.verifyMfaLogin({
        mfa_pending_token: mfaToken,
        code: mfaCode,
      });

      // Update auth store with user data
      if (response.data.user) {
        userActions.setUser(response.data.user);
        actions.setIsAuthenticated(true);

        // Redirect to dashboard on success
        router.push('/dashboard');
        router.refresh();
      }
    } catch (error: unknown) {
      errors.setError('loginError', error as ApiError);
    } finally {
      setIsLoading(false);
      actions.setLoading(false);
    }
  };

  if (!mfaToken) {
    return null;
  }

  return (
    <AuthCard>
      <AuthCardHeader
        title='Two-Factor Authentication'
        description='Enter the code from your authenticator app'
      />

      <form onSubmit={handleMfaSubmit} className='space-y-5'>
        <div className='space-y-2'>
          <Label htmlFor='mfaCode'>Authentication Code</Label>
          <Input
            id='mfaCode'
            type='text'
            value={mfaCode}
            onChange={e => {
              // Allow only numbers and limit to 6 digits
              const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
              setMfaCode(value);
              errors.clearErrors();
            }}
            placeholder='123456'
            className='text-center tracking-widest text-lg'
            disabled={isLoading}
            autoFocus
            maxLength={6}
          />
        </div>

        {errors.loginError && (
          <div className='space-y-3'>
            <FormError message={errors.loginError.message} />
          </div>
        )}

        <Button
          type='submit'
          className='w-full'
          disabled={!isMfaValid || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Verifying...
            </>
          ) : (
            'Verify'
          )}
        </Button>

        <div className='text-center'>
          <Link
            href='/login'
            className='text-sm text-muted-foreground hover:text-primary transition-colors'
          >
            Back to login
          </Link>
        </div>
      </form>

      <AuthCardFooter>
        <div className='text-xs text-center text-muted-foreground w-full'>
          Lost your authenticator device? Contact support.
        </div>
      </AuthCardFooter>
    </AuthCard>
  );
}

export default function MfaVerifyPage() {
  return (
    <Suspense
      fallback={
        <div className='flex justify-center p-8'>
          <Loader2 className='h-6 w-6 animate-spin' />
        </div>
      }
    >
      <MfaVerifyContent />
    </Suspense>
  );
}
