import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, ArrowRight, Loader2 } from 'lucide-react';
import { Plan } from '@/lib/types/pricing';
import { useRazorpay } from '@/hooks/use-razorpay';

interface PricingCardProps {
  plan: Plan;
}

export function PricingCard({ plan }: PricingCardProps) {
  const { processPayment, isProcessing: isRazorpayProcessing } = useRazorpay();
  const [selectedBilling, setSelectedBilling] = useState<'monthly' | 'annual'>(
    'monthly'
  );

  const monthlyPrice = plan.price_monthly;
  const annualPrice = plan.price_yearly;
  const displayPrice =
    selectedBilling === 'monthly' ? monthlyPrice : annualPrice;
  const savingsPercentage = monthlyPrice
    ? Math.round((1 - annualPrice / (monthlyPrice * 12)) * 100)
    : 0;

  // Format currency
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: plan.currency,
    maximumFractionDigits: 0,
  }).format(displayPrice);

  const billingPeriod = selectedBilling === 'monthly' ? '/month' : '/year';

  const handleSubscribe = async () => {
    await processPayment(plan.id, selectedBilling);
  };

  return (
    <div
      className={`relative group rounded-2xl border p-8 transition-all duration-300 hover:translate-y-[-4px] ${
        plan.is_popular
          ? 'border-primary/50 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent shadow-xl shadow-primary/10'
          : 'border-border bg-card hover:border-border/80 hover:shadow-lg'
      }`}
    >
      {plan.is_popular && (
        <div className='absolute -top-3.5 left-1/2 -translate-x-1/2'>
          <div className='rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-lg shadow-primary/30'>
            Most Popular
          </div>
        </div>
      )}

      {selectedBilling === 'annual' && savingsPercentage > 0 && (
        <div className='absolute top-4 right-4'>
          <div className='rounded-full bg-success/10 text-success px-2.5 py-1 text-xs font-semibold'>
            Save {savingsPercentage}%
          </div>
        </div>
      )}

      <div>
        {/* Plan Name & Description */}
        <div className='mb-6'>
          <h3 className='text-xl font-semibold mb-2'>{plan.name}</h3>
          <p className='text-sm text-muted-foreground'>{plan.description}</p>
        </div>

        {/* Price */}
        <div className='mb-6'>
          <div className='flex items-baseline gap-1'>
            <span className='text-4xl font-bold'>{formattedPrice}</span>
            <span className='text-muted-foreground text-sm'>
              {billingPeriod}
            </span>
          </div>
        </div>

        {/* Billing Cycle Toggle */}
        <div className='mb-8 pb-8 border-b border-border'>
          <div className='flex gap-2'>
            <button
              onClick={() => setSelectedBilling('monthly')}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                selectedBilling === 'monthly'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setSelectedBilling('annual')}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                selectedBilling === 'annual'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Annual
            </button>
          </div>
        </div>

        {/* Limits */}
        <div className='space-y-3 mb-8'>
          <div className='flex items-center justify-between'>
            <span className='text-muted-foreground'>Social Accounts</span>
            <span className='font-semibold'>{plan.limits.social_accounts}</span>
          </div>
          <div className='flex items-center justify-between'>
            <span className='text-muted-foreground'>Automations</span>
            <span className='font-semibold'>{plan.limits.automations}</span>
          </div>
          <div className='flex items-center justify-between'>
            <span className='text-muted-foreground'>Monthly Credits</span>
            <span className='font-semibold'>
              {plan.limits.monthly_credits.toLocaleString()}
            </span>
          </div>
          <div className='flex items-center justify-between'>
            <span className='text-muted-foreground'>Bots</span>
            <span className='font-semibold'>{plan.limits.bots}</span>
          </div>
          <div className='flex items-center justify-between'>
            <span className='text-muted-foreground'>Knowledge Sources</span>
            <span className='font-semibold'>
              {plan.limits.knowledge_sources}
            </span>
          </div>
        </div>

        {/* Features */}
        <div className='space-y-3 mb-8'>
          {plan.features.map((feature, i) => (
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
          variant={plan.is_popular ? 'default' : 'outline'}
          size='lg'
          onClick={handleSubscribe}
          disabled={isRazorpayProcessing || !plan.is_active}
        >
          {isRazorpayProcessing ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Processing...
            </>
          ) : plan.is_active ? (
            <>
              Subscribe to {plan.name}
              <ArrowRight className='ml-2 h-4 w-4' />
            </>
          ) : (
            <>Coming Soon</>
          )}
        </Button>
      </div>
    </div>
  );
}
