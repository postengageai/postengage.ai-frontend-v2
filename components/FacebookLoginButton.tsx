'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FacebookAuth } from '@/lib/facebook';
import { FacebookAuthResponse } from '@/types/facebook';

interface FacebookLoginButtonProps {
  onLoginSuccess: (authResponse: FacebookAuthResponse) => void;
  onLoginError: (error: Error) => void;
  label?: string;
  className?: string;
}

export function FacebookLoginButton({
  onLoginSuccess,
  onLoginError,
  label = 'Continue with Facebook',
  className,
}: FacebookLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const response = await FacebookAuth.login();
      onLoginSuccess(response);
    } catch (error) {
      onLoginError(
        error instanceof Error ? error : new Error('Facebook login failed')
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleLogin}
      className={className}
      disabled={isLoading}
      variant='outline'
    >
      {isLoading ? (
        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
      ) : (
        // You might want to add a Facebook icon here
        <span className='mr-2 font-bold text-blue-600'>f</span>
      )}
      {label}
    </Button>
  );
}
