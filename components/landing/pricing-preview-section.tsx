import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Check, ArrowRight } from 'lucide-react';
import { usePricing } from '@/hooks/use-pricing';
import { Skeleton } from '@/components/ui/skeleton';

export function PricingPreviewSection() {
  const { data, isLoading } = usePricing();

  // Find starter pack (usually the one with lowest price or specific credits)
  // We'll use the first pack or the one with ~500 credits if available
  const starterPack =
    data?.packs.find(p => p.credits === 500) || data?.packs[0];

  if (isLoading) {
    return (
      <section className='py-16 sm:py-24 border-t border-border'>
        <div className='mx-auto max-w-4xl px-4 sm:px-6'>
          <div className='text-center max-w-2xl mx-auto mb-12'>
            <Skeleton className='h-8 w-64 mx-auto mb-4' />
            <Skeleton className='h-4 w-48 mx-auto' />
          </div>
          <Skeleton className='h-[400px] w-full rounded-2xl' />
        </div>
      </section>
    );
  }

  // Fallback values if data fetch fails but not loading
  const currency = starterPack?.currency || 'USD';
  const price = starterPack?.price || 9;
  const credits = starterPack?.credits || 100;

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  }).format(price);

  return (
    <section className='py-16 sm:py-24 border-t border-border'>
      <div className='mx-auto max-w-4xl px-4 sm:px-6'>
        <div className='text-center max-w-2xl mx-auto mb-12'>
          <h2 className='text-2xl sm:text-3xl font-bold tracking-tight'>
            Simple, credit-based pricing
          </h2>
          <p className='mt-3 text-muted-foreground'>
            Pay for what you use. No subscriptions. No surprises.
          </p>
        </div>

        <div className='rounded-2xl border border-border bg-card p-8 sm:p-10'>
          <div className='flex flex-col sm:flex-row items-center justify-between gap-6 mb-8 pb-8 border-b border-border'>
            <div>
              <div className='text-sm text-muted-foreground mb-1'>
                Starting at
              </div>
              <div className='flex items-baseline gap-2'>
                <span className='text-4xl sm:text-5xl font-bold'>
                  {formattedPrice}
                </span>
                <span className='text-muted-foreground'>
                  / {credits} credits
                </span>
              </div>
            </div>
            <div className='text-center sm:text-right'>
              <div className='text-2xl font-bold text-primary'>
                1 credit = 1 action
              </div>
              <div className='text-sm text-muted-foreground'>
                Comment reply or DM sent
              </div>
            </div>
          </div>

          <div className='grid sm:grid-cols-2 gap-4 mb-8'>
            {[
              `${credits} credits to start`,
              'No monthly commitment',
              'Credits never expire',
              'Bulk discounts available',
              'Cancel anytime',
              'Priority support included',
            ].map((feature, i) => (
              <div key={i} className='flex items-center gap-3'>
                <div className='w-5 h-5 rounded-full bg-success/10 flex items-center justify-center shrink-0'>
                  <Check className='w-3 h-3 text-success' />
                </div>
                <span className='text-sm'>{feature}</span>
              </div>
            ))}
          </div>

          <div className='flex flex-col sm:flex-row items-center gap-4'>
            <Button
              size='lg'
              className='w-full sm:w-auto min-w-[200px]'
              asChild
            >
              <Link href='/signup'>
                Start Free Trial
                <ArrowRight className='ml-2 h-4 w-4' />
              </Link>
            </Button>
            <Button variant='ghost' className='w-full sm:w-auto' asChild>
              <Link href='/pricing'>See full pricing</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
