'use client';

import { useEffect } from 'react';
import { Check, Coins, MessageCircle, Send } from 'lucide-react';
import { usePricing } from '@/hooks/use-pricing';
import { PricingCard } from '@/components/pricing/pricing-card';
import { Skeleton } from '@/components/ui/skeleton';
import { CREDIT_COSTS } from '@/lib/config/credit-pricing';
import { analytics } from '@/lib/analytics';

export default function BuyCreditsPage() {
  const { data, isLoading } = usePricing();

  useEffect(() => {
    analytics.track('buy_credits_page_viewed', {});
  }, []);

  // Show AI-powered action costs (manual actions are always free).
  // Prefer live API values; fall back to local constants when API hasn't loaded yet.
  // AI_REPLY_COMMENT = STANDARD (8) + ai_infra (1) = 9 cr
  // AI_SEND_DM = FULL_CONTEXT (18) + ai_infra (1) = 19 cr
  const commentReplyCost =
    data?.costs.AI_REPLY_COMMENT ?? CREDIT_COSTS.AI_STANDARD + 1;
  const dmCost = data?.costs.AI_SEND_DM ?? CREDIT_COSTS.AI_FULL_CONTEXT + 1;

  const usageExamples = [
    {
      persona: 'Micro-influencer',
      followers: '10K',
      commentsPerDay: '20-30',
      creditsPerMonth: '~270',
      recommendation: 'Starter Pack (500)',
    },
    {
      persona: 'Growing Creator',
      followers: '50K',
      commentsPerDay: '50-100',
      creditsPerMonth: '~900',
      recommendation: 'Pro Pack (2,800)',
    },
    {
      persona: 'Brand / Agency',
      followers: '100K+',
      commentsPerDay: '100-200',
      creditsPerMonth: '~2,000',
      recommendation: 'Pro Pack (2,800)',
    },
  ];

  return (
    <div className='mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 sm:py-8 sm:space-y-8'>
      {/* Header */}
      <div>
        <h1 className='text-xl font-semibold tracking-tight text-foreground sm:text-2xl'>
          Buy Credits
        </h1>
        <p className='mt-1 text-sm text-muted-foreground'>
          Purchase credits to automate your Instagram engagement.
        </p>
      </div>

      {/* Credit Packs */}
      <section>
        <div className='grid gap-8 md:grid-cols-3'>
          {isLoading
            ? [1, 2, 3].map(i => (
                <div key={i} className='rounded-2xl border p-8 space-y-4'>
                  <Skeleton className='h-8 w-3/4' />
                  <Skeleton className='h-4 w-1/2' />
                  <Skeleton className='h-12 w-1/3 mt-8' />
                  <Skeleton className='h-4 w-full mt-8' />
                  <Skeleton className='h-4 w-full' />
                  <Skeleton className='h-4 w-full' />
                </div>
              ))
            : data?.packs.map(pack => (
                <PricingCard key={pack.id} pack={pack} />
              ))}
        </div>
      </section>

      {/* What is a Credit */}
      <section className='pt-4 sm:pt-8'>
        <div className='rounded-2xl border border-border bg-card p-4 sm:p-8'>
          <div className='flex items-center gap-3 mb-6'>
            <Coins className='h-6 w-6 text-primary' />
            <h2 className='text-xl font-semibold'>What's a credit?</h2>
          </div>
          <p className='text-muted-foreground mb-6'>
            Think of credits like stamps. Each action PostEngageAI takes on your
            behalf costs a small number of credits. Simple actions cost less.
            Complex ones cost more.
          </p>

          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3'>
              <MessageCircle className='h-5 w-5 text-muted-foreground' />
              <div>
                <div className='font-medium'>AI Comment Reply</div>
                <div className='text-sm text-muted-foreground'>
                  {commentReplyCost} credits
                </div>
              </div>
            </div>
            <div className='flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3'>
              <Send className='h-5 w-5 text-muted-foreground' />
              <div>
                <div className='font-medium'>AI Auto DM</div>
                <div className='text-sm text-muted-foreground'>
                  {dmCost} credits
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Usage Examples */}
      <section className='pt-8'>
        <h2 className='text-xl font-semibold mb-6'>
          How many credits do I need?
        </h2>
        <div className='rounded-xl border border-border overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead className='bg-muted/30'>
                <tr className='border-b border-border text-left'>
                  <th className='p-4 font-medium'>Creator Type</th>
                  <th className='p-4 font-medium'>Followers</th>
                  <th className='p-4 font-medium'>Daily Comments</th>
                  <th className='p-4 font-medium'>Monthly Credits</th>
                  <th className='p-4 font-medium'>Recommended</th>
                </tr>
              </thead>
              <tbody className='text-sm'>
                {usageExamples.map((example, index) => (
                  <tr
                    key={index}
                    className='border-b border-border/50 last:border-0'
                  >
                    <td className='p-4 font-medium'>{example.persona}</td>
                    <td className='p-4'>{example.followers}</td>
                    <td className='p-4'>{example.commentsPerDay}</td>
                    <td className='p-4'>{example.creditsPerMonth}</td>
                    <td className='p-4'>
                      <span className='inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary'>
                        {example.recommendation}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Why Credits */}
      <section className='pt-8 pb-8'>
        <h2 className='text-xl font-semibold mb-6'>
          Why credits instead of subscriptions?
        </h2>
        <div className='grid gap-6 sm:grid-cols-2'>
          {[
            {
              title: 'No waste',
              description:
                'Only pay for actions taken. Slow month? Use fewer credits.',
            },
            {
              title: 'No commitment',
              description: "Credits don't expire. Use them whenever you need.",
            },
            {
              title: 'Full control',
              description: 'See exactly what each action costs. No surprises.',
            },
            {
              title: 'Scale freely',
              description: "Busy period? Buy more. Quiet time? Don't.",
            },
          ].map((item, index) => (
            <div key={index} className='flex gap-3'>
              <div className='mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10'>
                <Check className='h-3 w-3 text-primary' />
              </div>
              <div>
                <div className='font-medium'>{item.title}</div>
                <div className='text-sm text-muted-foreground'>
                  {item.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
