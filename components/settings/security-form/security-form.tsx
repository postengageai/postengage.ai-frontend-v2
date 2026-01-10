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
import { UserApi } from '@/lib/api/user';

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

    try {
      await UserApi.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      setIsSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Reset success message after 5 seconds
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to change password. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
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
                  placeholder='Enter your current password'
                  className='pr-10'
                />
                <button
                  type='button'
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
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
                  placeholder='Enter your new password'
                  className='pr-10'
                />
                <button
                  type='button'
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
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
                  placeholder='Confirm your new password'
                  className='pr-10'
                />
                <button
                  type='button'
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </div>
            </div>

            {/* Password Rules */}
            <div className='space-y-2'>
              <Label>Password requirements</Label>
              <div className='grid gap-2'>
                {passwordRules.map(rule => {
                  const passed = rule.test(newPassword);
                  return (
                    <div
                      key={rule.id}
                      className='flex items-center gap-2 text-sm'
                    >
                      <div
                        className={cn(
                          'flex h-4 w-4 items-center justify-center rounded-full',
                          passed
                            ? 'bg-green-500 text-white'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {passed ? <Check size={12} /> : <X size={12} />}
                      </div>
                      <span
                        className={cn(
                          passed ? 'text-foreground' : 'text-muted-foreground'
                        )}
                      >
                        {rule.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className='rounded-md bg-destructive/15 p-3'>
                <p className='text-sm text-destructive'>{error}</p>
              </div>
            )}

            {/* Success Message */}
            {isSuccess && (
              <div className='rounded-md bg-green-50 p-3'>
                <p className='text-sm text-green-800'>
                  Password changed successfully!
                </p>
              </div>
            )}

            {/* Submit Button */}
            <div className='flex items-center justify-end gap-3'>
              <Button
                type='submit'
                disabled={!canSubmit || isLoading}
                className='min-w-32'
              >
                {isLoading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Changing...
                  </>
                ) : (
                  'Change password'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
