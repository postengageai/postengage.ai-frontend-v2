'use client';

/**
 * LowCreditBanner — persistent top-of-page warning when balance < 100.
 * Renders inside the dashboard layout so it appears on every dashboard page.
 * Dismissible per session (not persisted — reappears on refresh to stay prominent).
 * Self-fetches balance so it works independently of other credit store initialisers.
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, X, Zap } from 'lucide-react';
import { CreditsApi } from '@/lib/api/credits';

const LOW_CREDIT_THRESHOLD = 100;

export function LowCreditBanner() {
  const [available, setAvailable] = useState<number | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    CreditsApi.getBalance()
      .then(res => {
        if (res?.data) setAvailable(res.data.available_credits);
      })
      .catch(() => {
        /* silent */
      });
  }, []);

  if (dismissed) return null;
  if (available === null) return null;
  if (available >= LOW_CREDIT_THRESHOLD) return null;

  return (
    <div className='sticky top-0 z-50 flex items-center gap-3 bg-orange-500/95 backdrop-blur-sm px-4 py-2.5 text-white shadow-md'>
      <AlertTriangle className='h-4 w-4 shrink-0' />
      <p className='flex-1 text-sm font-medium'>
        Low credit balance — only{' '}
        <span className='font-bold'>{available} credits</span> remaining. Your
        bots may stop running soon.
      </p>
      <Link
        href='/dashboard/credits'
        className='flex items-center gap-1.5 rounded-md bg-white/20 hover:bg-white/30 transition-colors px-3 py-1 text-xs font-semibold whitespace-nowrap'
      >
        <Zap className='h-3 w-3' />
        Top Up
      </Link>
      <button
        onClick={() => setDismissed(true)}
        aria-label='Dismiss'
        className='ml-1 rounded p-0.5 hover:bg-white/20 transition-colors'
      >
        <X className='h-4 w-4' />
      </button>
    </div>
  );
}
