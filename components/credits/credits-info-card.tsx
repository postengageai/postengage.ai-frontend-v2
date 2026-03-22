'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';
import { useEffect, useState } from 'react';
import { httpClient } from '@/lib/http/client';

interface CreditPricing {
  manual_actions: number;
  ai_standard: number;
  ai_with_knowledge: number;
  ai_full_context: number;
  byom: number;
  ai_range: { min: number; max: number };
}

export function CreditsInfoCard() {
  const [pricing, setPricing] = useState<CreditPricing | null>(null);

  useEffect(() => {
    httpClient
      .get<CreditPricing>('/api/v1/credits/pricing')
      .then(res => {
        const d = res.data as { data?: CreditPricing } & CreditPricing;
        setPricing(d?.data ?? d);
      })
      .catch(() => {});
  }, []);

  const min = pricing?.ai_range?.min ?? '…';
  const max = pricing?.ai_range?.max ?? '…';
  const byom = pricing?.byom ?? '…';

  return (
    <Card className='bg-card border-border'>
      <CardContent className='flex items-start gap-3 p-4'>
        <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10'>
          <Lightbulb className='h-4 w-4 text-primary' />
        </div>
        <div className='space-y-1'>
          <p className='text-sm font-medium text-foreground'>
            How credits work
          </p>
          <div className='text-sm text-muted-foreground space-y-1'>
            <p>
              •{' '}
              <span className='font-medium text-foreground'>
                Manual actions are free
              </span>{' '}
              (0 credits).
            </p>
            <p>
              •{' '}
              <span className='font-medium text-foreground'>
                AI actions cost {min}–{max} credits
              </span>{' '}
              depending on complexity (Standard vs. Full Context).
            </p>
            <p>
              •{' '}
              <span className='font-medium text-foreground'>
                BYOM mode costs only {byom} credit
              </span>{' '}
              (infrastructure fee).
            </p>
            <p>
              • Credits are only deducted for successful AI replies. Failed,
              escalated, or empty responses are refunded.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
