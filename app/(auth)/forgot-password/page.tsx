'use client';

import type React from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { Loader2, ArrowLeft, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthLogo } from '@/components/auth/auth-logo';
import { AuthApi } from '@/lib/api/auth';

/* ─── Icon circle helper ─────────────────────────────────────────────────── */
function IconCircle({ children, color = 'bg-primary/15 border-primary/25' }: { children: React.ReactNode; color?: string }) {
  return (
    <div className={`mx-auto mb-6 h-16 w-16 rounded-full border-2 ${color} flex items-center justify-center`}>
      {children}
    </div>
  );
}

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
    } catch {
      // show success regardless (privacy-safe)
    } finally {
      setIsSubmitted(true);
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-background flex flex-col'>
      {/* Logo header */}
      <header className='px-8 pt-7'>
        <AuthLogo size='sm' />
      </header>

      {/* Centered content */}
      <main className='flex-1 flex items-center justify-center px-4 py-12'>
        {isSubmitted ? (
          /* ── State B: Check inbox ─────────────────────────────── */
          <div className='w-full max-w-[440px] rounded-2xl border border-border bg-card p-12 text-center shadow-xl shadow-black/40'>
            <IconCircle color='bg-info/15 border-info/25'>
              {/* Envelope */}
              <svg className='h-7 w-7 text-info' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.75' strokeLinecap='round' strokeLinejoin='round'>
                <rect x='2' y='4' width='20' height='16' rx='2' />
                <path d='M2 7l10 7 10-7' />
              </svg>
            </IconCircle>

            <h1 className='text-2xl font-bold text-foreground'>Check your inbox</h1>
            <p className='mt-3 text-sm text-muted-foreground leading-relaxed'>
              If an account exists with this email, we&apos;ve sent a reset link.
              Check spam if you don&apos;t see it.
            </p>

            <div className='mt-8'>
              <Link
                href='/login'
                className='text-sm text-primary hover:text-primary-hover font-medium transition-colors'
              >
                Back to Login
              </Link>
            </div>

            {/* State badge */}
            <div className='mt-6 inline-flex items-center gap-1.5 rounded-full border border-info/30 bg-info/10 px-3 py-1 text-xs text-info'>
              <svg className='h-3 w-3' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                <rect x='2' y='4' width='20' height='16' rx='2' /><path d='M2 7l10 7 10-7' />
              </svg>
              Success State
            </div>
          </div>
        ) : (
          /* ── State A: Enter email ──────────────────────────────── */
          <div className='w-full max-w-[440px] rounded-2xl border border-border bg-card p-12 shadow-xl shadow-black/40'>
            <div className='text-center mb-8'>
              <IconCircle>
                {/* Key icon */}
                <svg className='h-7 w-7 text-primary' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.75' strokeLinecap='round' strokeLinejoin='round'>
                  <circle cx='7.5' cy='15.5' r='5.5' />
                  <path d='M21 2l-9.6 9.6' />
                  <path d='M15.5 7.5L19 4l1.5 1.5L19 7' />
                </svg>
              </IconCircle>
              <h1 className='text-2xl font-bold text-foreground'>Forgot password?</h1>
              <p className='mt-2 text-sm text-muted-foreground'>
                Enter your email and we&apos;ll send a secure reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit} className='space-y-5'>
              <div className='space-y-2'>
                <Label htmlFor='email'>Email Address</Label>
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
                className='w-full h-10 bg-primary hover:bg-primary-hover text-white font-semibold rounded-[--radius-md]'
                disabled={!isFormValid || isLoading}
              >
                {isLoading ? (
                  <><Loader2 className='mr-2 h-4 w-4 animate-spin' />Sending...</>
                ) : (
                  <><Send className='mr-2 h-4 w-4' />Send Reset Link</>
                )}
              </Button>
            </form>

            <div className='mt-6 text-center'>
              <Link
                href='/login'
                className='inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors'
              >
                <ArrowLeft className='h-4 w-4' />
                Back to Login
              </Link>
            </div>

            {/* State badge */}
            <div className='mt-6 flex justify-center'>
              <span className='inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary'>
                <svg className='h-3 w-3' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                  <rect x='2' y='4' width='20' height='16' rx='2' /><path d='M2 7l10 7 10-7' />
                </svg>
                Enter Email
              </span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
