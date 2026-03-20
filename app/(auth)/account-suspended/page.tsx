import type React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AuthLogo } from '@/components/auth/auth-logo';

function CenteredShell({ children }: { children: React.ReactNode }) {
  return (
    <div className='min-h-screen bg-background flex flex-col'>
      <header className='px-8 pt-7'>
        <AuthLogo size='sm' />
      </header>
      <main className='flex-1 flex items-center justify-center px-4 py-12'>
        {children}
      </main>
    </div>
  );
}

export default function AccountSuspendedPage() {
  return (
    <CenteredShell>
      <div className='w-full max-w-[440px] rounded-2xl border border-error/25 bg-[#1a0f0f] p-5 sm:p-12 text-center shadow-xl shadow-black/40'>
        {/* Ban icon */}
        <div className='mx-auto mb-6 h-16 w-16 rounded-full border-2 border-error/30 bg-error/15 flex items-center justify-center'>
          <svg
            className='h-7 w-7 text-error'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='1.75'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <circle cx='12' cy='12' r='10' />
            <line x1='4.93' y1='4.93' x2='19.07' y2='19.07' />
          </svg>
        </div>

        <h1 className='text-2xl font-bold text-foreground'>
          Account Suspended
        </h1>
        <p className='mt-2 text-sm text-muted-foreground leading-relaxed px-2'>
          Your account has been suspended due to a violation of our terms of
          service.
        </p>

        {/* What happens next box */}
        <div className='mt-6 rounded-xl border border-border bg-card p-4 text-left space-y-3'>
          <p className='text-sm font-medium text-foreground'>
            What happens next?
          </p>
          <ul className='space-y-2'>
            {[
              'All automations have been paused',
              'Your data is preserved for 30 days',
              'Contact support to appeal this decision',
            ].map(item => (
              <li
                key={item}
                className='flex items-start gap-2 text-xs text-muted-foreground'
              >
                <svg
                  className='h-3.5 w-3.5 text-error shrink-0 mt-0.5'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <circle cx='12' cy='12' r='10' />
                  <line x1='12' y1='8' x2='12' y2='12' />
                  <line x1='12' y1='16' x2='12.01' y2='16' />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Support button */}
        <Button
          asChild
          className='mt-8 w-full h-10 bg-primary hover:bg-primary-hover text-white font-semibold rounded-[--radius-md]'
        >
          <Link href='mailto:support@postengage.ai'>Contact Support</Link>
        </Button>

        {/* Sign out */}
        <div className='mt-4'>
          <Link
            href='/login'
            className='text-sm text-muted-foreground hover:text-foreground transition-colors'
          >
            Sign out
          </Link>
        </div>

        {/* State badge */}
        <div className='mt-5 flex justify-center'>
          <span className='inline-flex items-center gap-1.5 rounded-full border border-error/30 bg-error/10 px-3 py-1 text-xs text-error'>
            <svg
              className='h-3 w-3'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
            >
              <circle cx='12' cy='12' r='10' />
              <line x1='4.93' y1='4.93' x2='19.07' y2='19.07' />
            </svg>
            Suspended
          </span>
        </div>
      </div>
    </CenteredShell>
  );
}
