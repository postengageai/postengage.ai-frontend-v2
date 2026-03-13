'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Zap, LayoutDashboard, Shield, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const FEATURES = [
  { icon: Zap, label: 'Automation features enabled', color: 'text-warning' },
  { icon: Shield, label: 'Secure connection established', color: 'text-info' },
];

function OAuthSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showAnimation, setShowAnimation] = useState(false);
  const [countdown, setCountdown] = useState(3);

  const id = searchParams.get('id');
  const platform = searchParams.get('platform') || 'instagram';
  const username = searchParams.get('username') || '';
  const avatarUrl = searchParams.get('avatar');

  const platformLabel = platform.charAt(0).toUpperCase() + platform.slice(1);

  useEffect(() => {
    // Redirect if missing critical data
    if (!id || !username) {
      router.push(
        '/oauth/error?error=MISSING_DATA&description=Authentication%20successful%20but%20account%20data%20is%20missing'
      );
      return;
    }

    // Trigger entrance animation
    const animTimer = setTimeout(() => setShowAnimation(true), 100);

    // Countdown tick
    const tickInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(tickInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Notify opener and auto-close after 3 s
    const closeTimer = setTimeout(() => {
      const message = { type: 'OAUTH_SUCCESS', platform, id, username };

      try {
        const channel = new BroadcastChannel('postengage_oauth');
        channel.postMessage(message);
        channel.close();
      } catch {
        /* not supported */
      }

      try {
        if (window.opener) {
          window.opener.postMessage(message, window.location.origin);
        }
      } catch {
        /* opener inaccessible */
      }

      window.close();
    }, 3000);

    return () => {
      clearTimeout(animTimer);
      clearTimeout(closeTimer);
      clearInterval(tickInterval);
    };
  }, [id, username, router, platform]);

  if (!id || !username) return null;

  const handleDashboardClick = () => {
    const message = { type: 'OAUTH_SUCCESS', platform, id, username };

    try {
      const channel = new BroadcastChannel('postengage_oauth');
      channel.postMessage(message);
      channel.close();
    } catch {
      /* not supported */
    }

    try {
      if (window.opener) {
        window.opener.postMessage(message, window.location.origin);
      }
    } catch {
      /* opener inaccessible */
    }

    window.close();
    setTimeout(() => router.push('/dashboard'), 300);
  };

  return (
    <div className='min-h-screen bg-background flex items-center justify-center px-4 py-12'>
      <div className='w-full max-w-[440px] rounded-2xl border border-success/25 bg-[#0d1f14] p-5 sm:p-12 text-center shadow-xl shadow-black/40'>
        {/* Animated checkmark */}
        <div className='flex justify-center mb-6'>
          <div
            className={cn(
              'relative h-16 w-16 rounded-full border-2 border-success/30 bg-success/15 flex items-center justify-center transition-all duration-500',
              showAnimation ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
            )}
          >
            <div className='absolute inset-0 animate-ping rounded-full bg-success/15' />
            <svg
              className='relative h-7 w-7 text-success'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <polyline points='20 6 9 17 4 12' />
            </svg>
          </div>
        </div>

        {/* Instagram platform badge */}
        <div className='inline-flex items-center gap-2 rounded-full border border-success/20 bg-success/10 px-3 py-1 text-xs text-success mb-4'>
          <svg
            className='h-3.5 w-3.5'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <rect x='2' y='2' width='20' height='20' rx='5' ry='5' />
            <circle cx='12' cy='12' r='4' />
            <circle cx='17.5' cy='6.5' r='0.5' fill='currentColor' />
          </svg>
          {platformLabel} Connected
        </div>

        <h1 className='text-2xl font-bold text-foreground'>
          Account Connected!
        </h1>
        <p className='mt-2 text-sm text-muted-foreground leading-relaxed px-2'>
          <span className='font-medium text-foreground'>{username}</span> is now
          securely connected and ready to automate.
        </p>

        {/* Account row */}
        <div className='mt-6 flex items-center gap-4 rounded-xl border border-border bg-card p-4 text-left'>
          {/* Avatar */}
          <div className='relative shrink-0'>
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={username}
                width={48}
                height={48}
                className='rounded-full border-2 border-border'
              />
            ) : (
              <div className='h-12 w-12 rounded-full border-2 border-border bg-primary/20 flex items-center justify-center text-primary font-bold text-lg'>
                {username.charAt(0).toUpperCase()}
              </div>
            )}
            {/* Platform icon badge */}
            <div className='absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-background border border-border flex items-center justify-center'>
              <svg
                className='h-3 w-3 text-pink-400'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <rect x='2' y='2' width='20' height='20' rx='5' ry='5' />
                <circle cx='12' cy='12' r='4' />
                <circle cx='17.5' cy='6.5' r='0.5' fill='currentColor' />
              </svg>
            </div>
          </div>

          {/* Username + status */}
          <div className='flex-1 min-w-0'>
            <div className='flex items-center gap-2'>
              <p className='font-semibold text-foreground text-sm truncate'>
                @{username}
              </p>
              <span className='inline-flex shrink-0 items-center rounded-full border border-success/30 bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success'>
                Active
              </span>
            </div>
            <p className='text-xs text-muted-foreground mt-0.5'>
              Connected just now
            </p>
          </div>
        </div>

        {/* Feature tiles */}
        <div className='mt-4 grid grid-cols-2 gap-3'>
          {FEATURES.map(({ icon: Icon, label, color }) => (
            <div
              key={label}
              className='flex items-center gap-2.5 rounded-xl border border-border bg-card p-3 text-left'
            >
              <Icon className={cn('h-4 w-4 shrink-0', color)} />
              <p className='text-xs text-muted-foreground leading-snug'>
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Button
          onClick={handleDashboardClick}
          className='mt-8 w-full h-10 bg-primary hover:bg-primary-hover text-white font-semibold rounded-[--radius-md]'
        >
          <LayoutDashboard className='mr-2 h-4 w-4' />
          Go to Dashboard
        </Button>

        {/* Auto-close hint */}
        <p className='mt-4 text-xs text-muted-foreground'>
          {countdown > 0
            ? `Closing automatically in ${countdown}s…`
            : 'Closing…'}
        </p>
      </div>
    </div>
  );
}

export default function OAuthSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen bg-background flex items-center justify-center'>
          <Loader2 className='h-8 w-8 animate-spin text-primary' />
        </div>
      }
    >
      <OAuthSuccessContent />
    </Suspense>
  );
}
