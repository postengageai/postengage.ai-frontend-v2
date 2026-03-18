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
import {
  Check,
  Eye,
  EyeOff,
  Loader2,
  X,
  ShieldCheck,
  ShieldOff,
  QrCode,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserApi } from '@/lib/api/user';
import { AuthApi } from '@/lib/api/auth';
import { useUserStore } from '@/lib/user/store';
import { parseApiError } from '@/lib/http/errors';
import { QrCodeWithLogo } from '@/components/ui/qr-code-with-logo';

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

// ── 2FA Section ────────────────────────────────────────────────────────────────

type TwoFaStep =
  | 'idle'
  | 'setup-loading'
  | 'setup-qr'
  | 'setup-verify'
  | 'disable-confirm';

function TwoFactorCard() {
  const { user, actions: userActions } = useUserStore();
  const isEnabled = user?.totp_enabled ?? false;

  const [step, setStep] = useState<TwoFaStep>('idle');
  const [otpauthUrl, setOtpauthUrl] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleStartSetup = async () => {
    setStep('setup-loading');
    setError(null);
    try {
      const res = await AuthApi.setup2FA();
      setOtpauthUrl(res.data.otpauth_url);
      setStep('setup-qr');
    } catch (err) {
      const parsed = parseApiError(err);
      setError(parsed.message);
      setStep('idle');
    }
  };

  const handleVerifyAndEnable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return;

    setIsLoading(true);
    setError(null);
    try {
      await AuthApi.verify2FA(code);
      userActions.updateUser({ totp_enabled: true });
      setSuccess('Two-factor authentication enabled successfully.');
      setStep('idle');
      setCode('');
      setOtpauthUrl(null);
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      const parsed = parseApiError(err);
      setError(parsed.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return;

    setIsLoading(true);
    setError(null);
    try {
      await AuthApi.disable2FA(code);
      userActions.updateUser({ totp_enabled: false });
      setSuccess('Two-factor authentication has been disabled.');
      setStep('idle');
      setCode('');
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      const parsed = parseApiError(err);
      setError(parsed.message);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelAndReset = () => {
    setStep('idle');
    setCode('');
    setError(null);
    setOtpauthUrl(null);
  };

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center gap-3'>
          <div
            className={cn(
              'h-9 w-9 rounded-full flex items-center justify-center shrink-0',
              isEnabled
                ? 'bg-success/10 text-success'
                : 'bg-muted text-muted-foreground'
            )}
          >
            {isEnabled ? (
              <ShieldCheck className='h-4.5 w-4.5' />
            ) : (
              <ShieldOff className='h-4.5 w-4.5' />
            )}
          </div>
          <div>
            <CardTitle>Two-factor authentication</CardTitle>
            <CardDescription>
              {isEnabled
                ? 'Your account is protected with TOTP two-factor authentication.'
                : 'Add an extra layer of security using an authenticator app.'}
            </CardDescription>
          </div>
          {isEnabled && (
            <span className='ml-auto text-xs font-semibold text-success bg-success/10 px-2.5 py-1 rounded-full border border-success/20 shrink-0'>
              Enabled
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className='space-y-5'>
        {/* Success message */}
        {success && (
          <div className='flex items-center gap-2 rounded-md bg-success/10 border border-success/20 px-3 py-2.5 text-sm text-success'>
            <Check className='h-4 w-4 shrink-0' />
            {success}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className='flex items-start gap-2 rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2.5 text-sm text-destructive'>
            <AlertCircle className='h-4 w-4 mt-0.5 shrink-0' />
            {error}
          </div>
        )}

        {/* ── State: idle ── */}
        {step === 'idle' && (
          <>
            {!isEnabled ? (
              <div className='space-y-4'>
                <p className='text-sm text-muted-foreground'>
                  When enabled, you&apos;ll be asked for a 6-digit code from
                  your authenticator app every time you sign in.
                </p>
                <Button
                  onClick={handleStartSetup}
                  className='gap-2'
                  variant='default'
                >
                  <QrCode className='h-4 w-4' />
                  Set up two-factor authentication
                </Button>
              </div>
            ) : (
              <div className='space-y-4'>
                <p className='text-sm text-muted-foreground'>
                  Two-factor authentication is active. You&apos;ll be asked for
                  a code when signing in.
                </p>
                <Button
                  onClick={() => {
                    setCode('');
                    setError(null);
                    setStep('disable-confirm');
                  }}
                  variant='destructive'
                  size='sm'
                  className='gap-2'
                >
                  <ShieldOff className='h-4 w-4' />
                  Disable two-factor authentication
                </Button>
              </div>
            )}
          </>
        )}

        {/* ── State: setup loading ── */}
        {step === 'setup-loading' && (
          <div className='flex items-center gap-2 py-4 text-sm text-muted-foreground'>
            <Loader2 className='h-4 w-4 animate-spin' />
            Generating your setup code…
          </div>
        )}

        {/* ── State: setup QR ── */}
        {step === 'setup-qr' && (
          <div className='space-y-5'>
            <div className='rounded-xl border border-border bg-muted/30 p-5 space-y-4'>
              <p className='text-sm font-medium'>
                Step 1 — Scan this QR code with your authenticator app
              </p>
              <p className='text-xs text-muted-foreground'>
                Open{' '}
                <span className='font-medium text-foreground'>
                  Google Authenticator
                </span>
                , <span className='font-medium text-foreground'>Authy</span>, or
                any compatible app, then scan the code below.
              </p>

              {/* QR code with PostEngage logo in the centre */}
              <div className='flex justify-center'>
                {otpauthUrl ? (
                  <div className='p-3 bg-white rounded-xl border border-border shadow-sm'>
                    <QrCodeWithLogo value={otpauthUrl} size={192} />
                  </div>
                ) : (
                  <div className='h-[216px] w-[216px] flex items-center justify-center bg-muted rounded-xl border border-border'>
                    <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
                  </div>
                )}
              </div>

              {/* Manual entry fallback */}
              {otpauthUrl && (
                <details className='text-xs'>
                  <summary className='cursor-pointer text-muted-foreground hover:text-foreground transition-colors select-none'>
                    Can&apos;t scan? Enter the setup key manually
                  </summary>
                  <div className='mt-2 rounded-lg bg-muted p-2.5 font-mono text-[11px] break-all select-all text-foreground'>
                    {otpauthUrl.match(/secret=([^&]+)/)?.[1] ?? otpauthUrl}
                  </div>
                </details>
              )}
            </div>

            <Button
              onClick={() => {
                setCode('');
                setError(null);
                setStep('setup-verify');
              }}
              className='w-full'
            >
              I&apos;ve scanned the code — Continue
            </Button>
            <Button
              variant='ghost'
              size='sm'
              className='w-full'
              onClick={cancelAndReset}
            >
              Cancel
            </Button>
          </div>
        )}

        {/* ── State: verify & enable ── */}
        {step === 'setup-verify' && (
          <form onSubmit={handleVerifyAndEnable} className='space-y-5'>
            <div className='rounded-xl border border-border bg-muted/30 p-5 space-y-3'>
              <p className='text-sm font-medium'>
                Step 2 — Enter the 6-digit code to confirm
              </p>
              <p className='text-xs text-muted-foreground'>
                Enter the current code shown in your authenticator app to
                activate 2FA.
              </p>
              <div className='space-y-1.5'>
                <Label htmlFor='totp-verify-code'>Verification code</Label>
                <Input
                  id='totp-verify-code'
                  type='text'
                  inputMode='numeric'
                  pattern='[0-9]*'
                  maxLength={6}
                  placeholder='123456'
                  value={code}
                  onChange={e =>
                    setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                  }
                  className='font-mono tracking-widest text-center text-lg h-12'
                  disabled={isLoading}
                  autoFocus
                />
              </div>
            </div>

            <div className='flex gap-3'>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={() => setStep('setup-qr')}
                disabled={isLoading}
              >
                Back
              </Button>
              <Button
                type='submit'
                className='flex-1 gap-2'
                disabled={code.length !== 6 || isLoading}
              >
                {isLoading && <Loader2 className='h-4 w-4 animate-spin' />}
                Enable two-factor authentication
              </Button>
            </div>
          </form>
        )}

        {/* ── State: disable confirm ── */}
        {step === 'disable-confirm' && (
          <form onSubmit={handleDisable} className='space-y-5'>
            <div className='rounded-xl border border-destructive/30 bg-destructive/5 p-5 space-y-3'>
              <p className='text-sm font-medium text-destructive'>
                Confirm disabling two-factor authentication
              </p>
              <p className='text-xs text-muted-foreground'>
                This will remove the extra security from your account. Enter
                your current authenticator code to confirm.
              </p>
              <div className='space-y-1.5'>
                <Label htmlFor='totp-disable-code'>Authenticator code</Label>
                <Input
                  id='totp-disable-code'
                  type='text'
                  inputMode='numeric'
                  pattern='[0-9]*'
                  maxLength={6}
                  placeholder='123456'
                  value={code}
                  onChange={e =>
                    setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                  }
                  className='font-mono tracking-widest text-center text-lg h-12'
                  disabled={isLoading}
                  autoFocus
                />
              </div>
            </div>

            <div className='flex gap-3'>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={cancelAndReset}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type='submit'
                variant='destructive'
                className='flex-1 gap-2'
                disabled={code.length !== 6 || isLoading}
              >
                {isLoading && <Loader2 className='h-4 w-4 animate-spin' />}
                Disable two-factor authentication
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

// ── Password Section ───────────────────────────────────────────────────────────

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
      {/* 2FA card comes first — it's the most security-critical setting */}
      <TwoFactorCard />

      {/* Password change */}
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
