import { Button } from '@/components/ui/button';
import { Check, Zap } from 'lucide-react';
import { Plan } from '@/lib/types/pricing';
import { useRazorpay } from '@/hooks/use-razorpay';

interface PricingCardProps {
  plan: Plan;
}

export function PricingCard({ plan }: PricingCardProps) {
  const { processPayment, isProcessing } = useRazorpay();

  const handleSubscribe = async () => {
    await processPayment(plan.id);
  };

  // Format currency
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: plan.currency || 'USD',
    maximumFractionDigits: 0,
  }).format(plan.price || 0);

  return (
    <div
      className={`relative group rounded-2xl border p-8 transition-all duration-300 hover:translate-y-[-4px] ${
        plan.is_popular || plan.popular
          ? 'border-primary/50 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent shadow-xl shadow-primary/10'
          : 'border-border bg-card hover:border-border/80 hover:shadow-lg'
      }`}
    >
      {(plan.is_popular || plan.popular) && (
        <div className='absolute -top-3.5 left-1/2 -translate-x-1/2'>
          <div className='rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-lg shadow-primary/30'>
            Most Popular
          </div>
        </div>
      )}

      <div className='space-y-6'>
        {/* Plan Name & Description */}
        <div>
          <h3 className='text-xl font-semibold mb-2'>{plan.name}</h3>
          <p className='text-sm text-muted-foreground'>{plan.description}</p>
        </div>

        {/* Price */}
        <div>
          <div className='flex items-baseline gap-1 mb-2'>
            <span className='text-4xl font-bold'>{formattedPrice}</span>
          </div>
          <p className='text-sm text-muted-foreground'>
            {plan.credits || 0} credits
          </p>
        </div>

        {/* Savings Badge */}
        {plan.savings && (
          <div className='rounded-lg bg-success/10 p-2 flex items-center gap-2'>
            <Zap className='h-4 w-4 text-success' />
            <span className='text-sm font-medium text-success'>
              {plan.savings} savings
            </span>
          </div>
        )}

        {/* Limits/Details */}
        {plan.limits && (
          <div className='space-y-3 pb-6 border-b border-border'>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground text-sm'>
                Social Accounts
              </span>
              <span className='font-semibold'>
                {plan.limits.social_accounts}
              </span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground text-sm'>Automations</span>
              <span className='font-semibold'>{plan.limits.automations}</span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground text-sm'>
                Monthly Credits
              </span>
              <span className='font-semibold'>
                {plan.limits.monthly_credits.toLocaleString()}
              </span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground text-sm'>Bots</span>
              <span className='font-semibold'>{plan.limits.bots}</span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground text-sm'>
                Knowledge Sources
              </span>
              <span className='font-semibold'>
                {plan.limits.knowledge_sources}
              </span>
            </div>
          </div>
        )}

        {/* Features */}
        {plan.features && (
          <div className='space-y-3'>
            {plan.features.map((feature, i) => (
              <div key={i} className='flex items-center gap-3'>
                <div className='w-5 h-5 rounded-full bg-success/10 flex items-center justify-center shrink-0'>
                  <Check className='w-3 h-3 text-success' />
                </div>
                <span className='text-sm text-muted-foreground'>{feature}</span>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <Button
          className='w-full'
          variant={plan.is_popular || plan.popular ? 'default' : 'outline'}
          size='lg'
          onClick={handleSubscribe}
          disabled={isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Get Started'}
        </Button>
      </div>
    </div>
  );
}
