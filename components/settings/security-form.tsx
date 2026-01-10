'use client';

import type React from 'react';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Check, Eye, EyeOff, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const passwordRules = [
  {
    id: 'length',
    label: 'At least 8 characters',
    test: (p: string) => p.length >= 8,
  },
  {
    id: 'upper',
    label: 'One uppercase letter',
    test: (p: string) => /[A-Z]/.test(p),
  },
  {
    id: 'lower',
    label: 'One lowercase letter',
    test: (p: string) => /[a-z]/.test(p),
  },
  { id: 'number', label: 'One number', test: (p: string) => /[0-9]/.test(p) },
  {
    id: 'special',
    label: 'One special character',
    test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p),
  },
];

export function SecurityForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allRulesPassed = passwordRules.every(rule => rule.test(newPassword));
  const passwordsMatch =
    newPassword === confirmPassword && confirmPassword.length > 0;
  const canSubmit =
    currentPassword.length > 0 && allRulesPassed && passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsLoading(true);
    setError(null);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate success
    setIsLoading(false);
    setIsSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');

    // Reset success message after 5 seconds
    setTimeout(() => setIsSuccess(false), 5000);
  };

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>Change password</CardTitle>
          <CardDescription>
            Update your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* Current Password */}
            <div className='space-y-2'>
              <Label htmlFor='current_password'>Current password</Label>
              <div className='relative'>
                <Input
                  id='current_password'
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  className='pr-10'
                />
                <button
                  type='button'
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                >
                  {showCurrentPassword ? (
                    <EyeOff className='h-4 w-4' />
                  ) : (
                    <Eye className='h-4 w-4' />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className='space-y-2'>
              <Label htmlFor='new_password'>New password</Label>
              <div className='relative'>
                <Input
                  id='new_password'
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className='pr-10'
                />
                <button
                  type='button'
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                >
                  {showNewPassword ? (
                    <EyeOff className='h-4 w-4' />
                  ) : (
                    <Eye className='h-4 w-4' />
                  )}
                </button>
              </div>

              {/* Password Rules */}
              {newPassword.length > 0 && (
                <ul className='mt-3 space-y-1.5'>
                  {passwordRules.map(rule => {
                    const passed = rule.test(newPassword);
                    return (
                      <li
                        key={rule.id}
                        className={cn(
                          'flex items-center gap-2 text-xs transition-colors',
                          passed ? 'text-green-500' : 'text-muted-foreground'
                        )}
                      >
                        {passed ? (
                          <Check className='h-3 w-3' />
                        ) : (
                          <X className='h-3 w-3' />
                        )}
                        {rule.label}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Confirm Password */}
            <div className='space-y-2'>
              <Label htmlFor='confirm_password'>Confirm new password</Label>
              <div className='relative'>
                <Input
                  id='confirm_password'
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className={cn(
                    'pr-10',
                    confirmPassword.length > 0 &&
                      (passwordsMatch
                        ? 'border-green-500 focus-visible:ring-green-500/20'
                        : 'border-destructive focus-visible:ring-destructive/20')
                  )}
                />
                <button
                  type='button'
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                >
                  {showConfirmPassword ? (
                    <EyeOff className='h-4 w-4' />
                  ) : (
                    <Eye className='h-4 w-4' />
                  )}
                </button>
              </div>
              {confirmPassword.length > 0 && !passwordsMatch && (
                <p className='text-xs text-destructive'>
                  Passwords do not match
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className='rounded-lg bg-destructive/10 p-3 text-sm text-destructive'>
                {error}
              </div>
            )}

            {/* Success Message */}
            {isSuccess && (
              <div className='rounded-lg bg-green-500/10 p-3 text-sm text-green-500'>
                Password changed successfully
              </div>
            )}

            {/* Submit Button */}
            <div className='flex justify-end'>
              <Button type='submit' disabled={!canSubmit || isLoading}>
                {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                Change password
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Security Info */}
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Security information</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className='grid gap-4 text-sm sm:grid-cols-2'>
            <div>
              <dt className='text-muted-foreground'>Last password change</dt>
              <dd className='font-medium text-foreground'>December 15, 2024</dd>
            </div>
            <div>
              <dt className='text-muted-foreground'>Active sessions</dt>
              <dd className='font-medium text-foreground'>1 device</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
