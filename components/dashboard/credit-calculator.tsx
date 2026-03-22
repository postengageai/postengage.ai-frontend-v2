'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Calculator, Clock, Coins, ArrowRight, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { CREDIT_PACKS } from '@/lib/config/credit-pricing';

// ── Constants ────────────────────────────────────────────────────────────────

/** Standard AI reply cost: AI_STANDARD (8) + ai_infra (1) = 9 credits */
const CREDITS_PER_REPLY = 9;
/** Average time to manually reply to a comment/DM in minutes */
const MINUTES_PER_MANUAL_REPLY = 2;
/** Days per month for calculations */
const DAYS_PER_MONTH = 30;
/** AI handles replies in roughly this many seconds */
const AI_SECONDS_PER_REPLY = 5;

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatHours(minutes: number): string {
  const hours = minutes / 60;
  if (hours >= 1) {
    return `${hours.toFixed(1)} hrs`;
  }
  return `${Math.round(minutes)} min`;
}

function formatNumber(n: number): string {
  return n.toLocaleString('en-IN');
}

/** Find the cheapest credit pack that covers the required credits */
function recommendedPack(creditsNeeded: number) {
  const sorted = [...CREDIT_PACKS]
    .filter(p => p.credits >= creditsNeeded)
    .sort((a, b) => a.price - b.price);
  return sorted[0] ?? CREDIT_PACKS[CREDIT_PACKS.length - 1];
}

// ── Component ────────────────────────────────────────────────────────────────

export function CreditCalculator() {
  const [dailyComments, setDailyComments] = useState(30);
  const [dailyDMs, setDailyDMs] = useState(10);
  const [aiPercentage, setAiPercentage] = useState(80);

  const calc = useMemo(() => {
    const totalDaily = dailyComments + dailyDMs;
    const monthlyReplies = Math.round(
      totalDaily * DAYS_PER_MONTH * (aiPercentage / 100)
    );
    const creditsNeeded = monthlyReplies * CREDITS_PER_REPLY;
    const manualMinutes = monthlyReplies * MINUTES_PER_MANUAL_REPLY;
    const aiMinutes = (monthlyReplies * AI_SECONDS_PER_REPLY) / 60;
    const timeSavedMinutes = manualMinutes - aiMinutes;
    const pack = recommendedPack(creditsNeeded);

    return {
      monthlyReplies,
      creditsNeeded,
      manualMinutes,
      aiMinutes,
      timeSavedMinutes,
      pack,
    };
  }, [dailyComments, dailyDMs, aiPercentage]);

  return (
    <Card className='overflow-hidden'>
      <CardHeader className='pb-3'>
        <div className='flex items-center gap-2'>
          <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10'>
            <Calculator className='h-4 w-4 text-primary' />
          </div>
          <CardTitle className='text-base font-semibold'>
            Credit Usage Calculator
          </CardTitle>
        </div>
        <p className='text-xs text-muted-foreground mt-1'>
          Estimate how many credits you need based on your engagement volume.
        </p>
      </CardHeader>

      <CardContent className='space-y-5'>
        {/* ── Inputs ──────────────────────────────────────────────────────── */}
        <div className='space-y-4'>
          {/* Daily comments */}
          <div className='space-y-2'>
            <div className='flex items-center justify-between text-sm'>
              <span className='text-muted-foreground'>
                Daily comments you receive
              </span>
              <span className='font-semibold tabular-nums text-foreground'>
                {dailyComments}
              </span>
            </div>
            <Slider
              value={[dailyComments]}
              onValueChange={v => setDailyComments(v[0])}
              min={0}
              max={500}
              step={5}
            />
            <div className='flex justify-between text-[10px] text-muted-foreground'>
              <span>0</span>
              <span>500</span>
            </div>
          </div>

          {/* Daily DMs */}
          <div className='space-y-2'>
            <div className='flex items-center justify-between text-sm'>
              <span className='text-muted-foreground'>
                Daily DMs you receive
              </span>
              <span className='font-semibold tabular-nums text-foreground'>
                {dailyDMs}
              </span>
            </div>
            <Slider
              value={[dailyDMs]}
              onValueChange={v => setDailyDMs(v[0])}
              min={0}
              max={200}
              step={5}
            />
            <div className='flex justify-between text-[10px] text-muted-foreground'>
              <span>0</span>
              <span>200</span>
            </div>
          </div>

          {/* AI percentage */}
          <div className='space-y-2'>
            <div className='flex items-center justify-between text-sm'>
              <span className='text-muted-foreground'>
                % you want AI to handle
              </span>
              <span className='font-semibold tabular-nums text-foreground'>
                {aiPercentage}%
              </span>
            </div>
            <Slider
              value={[aiPercentage]}
              onValueChange={v => setAiPercentage(v[0])}
              min={0}
              max={100}
              step={5}
            />
            <div className='flex justify-between text-[10px] text-muted-foreground'>
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* ── Calculated outputs ──────────────────────────────────────────── */}
        <div className='rounded-xl border border-border bg-muted/20 p-4 space-y-3'>
          <div className='flex items-center justify-between text-sm'>
            <span className='text-muted-foreground'>
              Monthly AI replies needed
            </span>
            <span className='font-semibold text-foreground'>
              {formatNumber(calc.monthlyReplies)}
            </span>
          </div>
          <div className='flex items-center justify-between text-sm'>
            <span className='text-muted-foreground'>
              Credits needed / month
            </span>
            <span className='font-semibold text-foreground'>
              {formatNumber(calc.creditsNeeded)}
            </span>
          </div>
          <div className='flex items-center justify-between text-sm'>
            <span className='text-muted-foreground'>
              Estimated monthly cost
            </span>
            <span className='font-bold text-primary'>
              {calc.creditsNeeded === 0
                ? 'Free'
                : `₹${formatNumber(calc.pack.price)}`}
            </span>
          </div>
          <div className='flex items-center justify-between text-sm'>
            <span className='text-muted-foreground'>Time saved / month</span>
            <span className='font-semibold text-success'>
              {formatHours(calc.timeSavedMinutes)}
            </span>
          </div>
        </div>

        {/* ── Visual comparison ───────────────────────────────────────────── */}
        {calc.monthlyReplies > 0 && (
          <div className='grid grid-cols-2 gap-3'>
            {/* Without PostEngage */}
            <div className='rounded-xl border border-border bg-muted/10 p-3 space-y-2'>
              <p className='text-[10px] font-semibold uppercase tracking-wider text-muted-foreground'>
                Without PostEngage
              </p>
              <div className='flex items-center gap-1.5 text-sm'>
                <Clock className='h-3.5 w-3.5 text-muted-foreground' />
                <span className='text-foreground font-medium'>
                  {formatHours(calc.manualMinutes)}
                </span>
              </div>
              <p className='text-[10px] text-muted-foreground'>
                spent replying manually
              </p>
            </div>

            {/* With PostEngage */}
            <div className='rounded-xl border border-primary/30 bg-primary/5 p-3 space-y-2'>
              <p className='text-[10px] font-semibold uppercase tracking-wider text-primary'>
                With PostEngage
              </p>
              <div className='flex items-center gap-1.5 text-sm'>
                <Zap className='h-3.5 w-3.5 text-primary' />
                <span className='text-foreground font-medium'>
                  {formatHours(calc.aiMinutes)}
                </span>
              </div>
              <div className='flex items-center gap-1.5 text-xs'>
                <Coins className='h-3 w-3 text-muted-foreground' />
                <span className='text-muted-foreground'>
                  {calc.pack.name} pack (₹{formatNumber(calc.pack.price)})
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── CTA ─────────────────────────────────────────────────────────── */}
        <Button asChild className='w-full gap-2'>
          <Link href='/dashboard/credits/buy'>
            <Coins className='h-4 w-4' />
            Buy Credits
            <ArrowRight className='h-4 w-4' />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
