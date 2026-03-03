'use client';

import { Check } from 'lucide-react';
import { usePricing } from '@/hooks/use-pricing';
import { PricingCard } from '@/components/pricing/pricing-card';
import { Skeleton } from '@/components/ui/skeleton';

export default function BuyCreditsPage() {
  const { data: plans, isLoading } = usePricing();

  const features = [
    {
      title: 'Flexible Billing',
      description:
        'Choose between monthly or annual billing. Save 20% with annual plans.',
    },
    {
      title: 'Scale Your Business',
      description:
        'Upgrade or downgrade plans anytime. No long-term contracts.',
    },
    {
      title: 'Full Feature Access',
      description:
        'All plans include access to our complete feature set with different limits.',
    },
    {
      title: 'Priority Support',
      description:
        'Higher plans include priority support for faster responses.',
    },
  ];

  const sortedPlans = (plans || []).sort((a, b) => {
    // Sort by price (monthly) to show Free, Starter, Pro, Enterprise order
    return a.price_monthly - b.price_monthly;
  });

  return (
    <div className='mx-auto max-w-6xl space-y-8'>
      {/* Header */}
      <div>
        <h1 className='text-2xl font-semibold tracking-tight text-foreground'>
          Choose Your Plan
        </h1>
        <p className='mt-1 text-sm text-muted-foreground'>
          Select the perfect plan for your business needs. All plans include a
          14-day free trial.
        </p>
      </div>

      {/* Pricing Cards */}
      <section>
        <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-4'>
          {isLoading
            ? [1, 2, 3, 4].map(i => (
                <div key={i} className='rounded-2xl border p-8 space-y-4'>
                  <Skeleton className='h-8 w-3/4' />
                  <Skeleton className='h-4 w-1/2' />
                  <Skeleton className='h-12 w-1/3 mt-8' />
                  <Skeleton className='h-4 w-full mt-8' />
                  <Skeleton className='h-4 w-full' />
                  <Skeleton className='h-4 w-full' />
                  <Skeleton className='h-10 w-full mt-8' />
                </div>
              ))
            : sortedPlans.map(plan => (
                <PricingCard key={plan.id} plan={plan} />
              ))}
        </div>
      </section>

      {/* Features */}
      <section className='pt-8'>
        <h2 className='text-xl font-semibold mb-6'>Why choose PostEngageAI?</h2>
        <div className='grid gap-6 sm:grid-cols-2'>
          {features.map((item, index) => (
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

      {/* FAQ Section */}
      <section className='pt-8 pb-8'>
        <h2 className='text-xl font-semibold mb-6'>
          Frequently Asked Questions
        </h2>
        <div className='space-y-4'>
          <div className='rounded-lg border border-border bg-card p-6'>
            <h3 className='font-medium mb-2'>Can I change my plan later?</h3>
            <p className='text-sm text-muted-foreground'>
              Yes, you can upgrade or downgrade your plan anytime. Changes take
              effect at the next billing cycle.
            </p>
          </div>
          <div className='rounded-lg border border-border bg-card p-6'>
            <h3 className='font-medium mb-2'>
              What payment methods do you accept?
            </h3>
            <p className='text-sm text-muted-foreground'>
              We accept all major credit cards and debit cards through Razorpay
              secure payment gateway.
            </p>
          </div>
          <div className='rounded-lg border border-border bg-card p-6'>
            <h3 className='font-medium mb-2'>Is there a free trial?</h3>
            <p className='text-sm text-muted-foreground'>
              Yes, all plans include a 14-day free trial with full access to
              features.
            </p>
          </div>
          <div className='rounded-lg border border-border bg-card p-6'>
            <h3 className='font-medium mb-2'>Can I cancel anytime?</h3>
            <p className='text-sm text-muted-foreground'>
              Yes, you can cancel your subscription anytime. No questions asked.
              Your access continues until the end of your current billing
              period.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
