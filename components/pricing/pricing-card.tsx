import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Check, ArrowRight } from 'lucide-react';
import { CreditPackage } from '@/lib/types/pricing';
import { calculateActions } from '@/lib/config/credit-pricing';

interface PricingCardProps {
  pack: CreditPackage;
}

export function PricingCard({ pack }: PricingCardProps) {
  const perCredit = pack.price / pack.credits;
  const basicActions = calculateActions(pack.credits, false);
  const aiActions = calculateActions(pack.credits, true);

  // Format currency
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: pack.currency,
    maximumFractionDigits: 0,
  }).format(pack.price);

  const formattedPerCredit = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: pack.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(perCredit);

  return (
    <div
      className={`relative group rounded-2xl border p-8 transition-all duration-300 hover:translate-y-[-4px] ${
        pack.popular
          ? 'border-primary/50 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent shadow-xl shadow-primary/10'
          : 'border-border bg-card hover:border-border/80 hover:shadow-lg'
      }`}
    >
      {pack.popular && (
        <div className='absolute -top-3.5 left-1/2 -translate-x-1/2'>
          <div className='rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-lg shadow-primary/30'>
            Most Popular
          </div>
        </div>
      )}

      {pack.savings && pack.savings !== '0%' && (
        <div className='absolute top-4 right-4'>
          <div className='rounded-full bg-success/10 text-success px-2.5 py-1 text-xs font-semibold'>
            Save {pack.savings}
          </div>
        </div>
      )}

      <div>
        {/* Pack Name & Description */}
        <div className='mb-6'>
          <h3 className='text-xl font-semibold mb-2'>{pack.name}</h3>
          <p className='text-sm text-muted-foreground'>{pack.description}</p>
        </div>

        {/* Price */}
        <div className='mb-6'>
          <div className='flex items-baseline gap-1'>
            <span className='text-4xl font-bold'>{formattedPrice}</span>
          </div>
          <div className='text-sm text-muted-foreground mt-1'>
            one-time purchase
          </div>
        </div>

        {/* Credits & Actions */}
        <div className='space-y-3 mb-8 pb-8 border-b border-border'>
          <div className='flex items-center justify-between'>
            <span className='text-muted-foreground'>Credits</span>
            <span className='font-semibold'>
              {pack.credits.toLocaleString()}
            </span>
          </div>
          <div className='flex items-center justify-between'>
            <span className='text-muted-foreground'>Basic actions</span>
            <span className='font-semibold'>
              {basicActions.toLocaleString()}
            </span>
          </div>
          <div className='flex items-center justify-between'>
            <span className='text-muted-foreground'>AI actions</span>
            <span className='font-semibold text-primary'>
              {aiActions.toLocaleString()}
            </span>
          </div>
          <div className='flex items-center justify-between'>
            <span className='text-muted-foreground'>Per credit</span>
            <span className='text-sm'>{formattedPerCredit}</span>
          </div>
        </div>

        {/* Features */}
        <div className='space-y-3 mb-8'>
          {[
            'Credits never expire',
            'All features included',
            'Priority support',
          ].map((feature, i) => (
            <div key={i} className='flex items-center gap-3'>
              <div className='w-5 h-5 rounded-full bg-success/10 flex items-center justify-center shrink-0'>
                <Check className='w-3 h-3 text-success' />
              </div>
              <span className='text-sm text-muted-foreground'>{feature}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Button
          className='w-full'
          variant={pack.popular ? 'default' : 'outline'}
          size='lg'
          asChild
        >
          <Link href='/signup'>
            Get {pack.name}
            <ArrowRight className='ml-2 h-4 w-4' />
          </Link>
        </Button>
      </div>
    </div>
  );
}
