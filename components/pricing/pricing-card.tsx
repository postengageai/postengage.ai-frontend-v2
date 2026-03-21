import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, ArrowRight, Loader2, Phone, CheckCircle } from 'lucide-react';
import { CreditPackage } from '@/lib/types/pricing';
import { calculateActions } from '@/lib/config/credit-pricing';
import { useRazorpay } from '@/hooks/use-razorpay';
import { toast } from '@/hooks/use-toast';

const SUPPORT_EMAIL = 'hello@postengage.ai';
const GMAIL_COMPOSE_URL = `https://mail.google.com/mail/?view=cm&to=${SUPPORT_EMAIL}&subject=${encodeURIComponent('Enterprise Plan Inquiry — PostEngageAI')}`;

interface PricingCardProps {
  pack: CreditPackage;
}

// ── Enterprise Card ────────────────────────────────────────────────────────────
function EnterpriseCard({ pack }: PricingCardProps) {
  const [sent, setSent] = useState(false);

  const handleContactSales = () => {
    window.open(GMAIL_COMPOSE_URL, '_blank', 'noopener,noreferrer');
    toast({
      title: 'Opening your email...',
      description: `Reach us at ${SUPPORT_EMAIL} — we typically reply within a few hours.`,
    });
    setSent(true);
    setTimeout(() => setSent(false), 5000);
  };

  const stats = [
    { label: 'Credits', value: '50,000+' },
    { label: 'Free actions', value: 'Unlimited' },
    { label: 'Per credit', value: 'Lowest rate' },
    { label: 'Billing', value: 'Volume discount' },
  ];

  return (
    <div className='relative group rounded-2xl border border-dashed border-border p-5 sm:p-8 transition-all duration-300 hover:translate-y-[-4px] hover:border-primary/30 hover:shadow-lg bg-card'>
      <div className='mb-6'>
        <div className='inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground mb-3'>
          Enterprise
        </div>
        <h3 className='text-xl font-semibold mb-2'>{pack.name}</h3>
        <p className='text-sm text-muted-foreground'>{pack.description}</p>
      </div>

      <div className='mb-6'>
        <div className='flex items-baseline gap-1'>
          <span className='text-4xl font-bold'>Custom</span>
        </div>
        <div className='text-sm text-muted-foreground mt-1'>volume pricing</div>
      </div>

      {/* Stats rows */}
      <div className='space-y-2 mb-8'>
        {stats.map((stat, i) => (
          <div
            key={i}
            className='flex items-center justify-between rounded-lg bg-muted/40 px-4 py-2.5'
          >
            <span className='text-sm text-muted-foreground'>{stat.label}</span>
            <span className='text-sm font-semibold'>{stat.value}</span>
          </div>
        ))}
      </div>

      <Button
        className='w-full'
        variant='outline'
        size='lg'
        onClick={handleContactSales}
        disabled={sent}
      >
        {sent ? (
          <>
            <CheckCircle className='mr-2 h-4 w-4 text-success' />
            Email opened!
          </>
        ) : (
          <>
            Contact Sales
            <Phone className='ml-2 h-4 w-4' />
          </>
        )}
      </Button>
    </div>
  );
}

// ── Standard Purchasable Card ──────────────────────────────────────────────────
export function PricingCard({ pack }: PricingCardProps) {
  const { processPayment, isProcessing } = useRazorpay();

  if (pack.is_enterprise) {
    return <EnterpriseCard pack={pack} />;
  }

  const credits = pack.credits as number;
  const price = pack.price as number;
  const perCredit = price / credits;
  // Prefer approx_actions from API (already calculated by backend); fall back to local calculation
  const aiActions = pack.approx_actions ?? calculateActions(credits, true);
  const badge = pack.badge ?? (pack.popular ? 'Most Popular' : undefined);

  // Format currency
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: pack.currency,
    maximumFractionDigits: 0,
  }).format(price);

  const formattedPerCredit = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: pack.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(perCredit);

  return (
    <div
      className={`relative group rounded-2xl border p-5 sm:p-8 transition-all duration-300 hover:translate-y-[-4px] ${
        pack.popular
          ? 'border-primary/50 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent shadow-xl shadow-primary/10'
          : 'border-border bg-card hover:border-border/80 hover:shadow-lg'
      }`}
    >
      {badge && (
        <div className='absolute -top-3.5 left-1/2 -translate-x-1/2'>
          <div className='rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-lg shadow-primary/30'>
            {badge}
          </div>
        </div>
      )}

      {pack.savings && (
        <div className='absolute top-4 right-4'>
          <div className='rounded-full bg-success/10 text-success px-2.5 py-1 text-xs font-semibold'>
            {pack.savings}
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
        <div className='space-y-2 mb-8'>
          {[
            {
              label: 'Credits',
              value: credits.toLocaleString(),
              highlight: false,
            },
            { label: 'Free actions', value: 'Unlimited', highlight: false },
            {
              label: 'AI replies',
              value: `~${aiActions.toLocaleString()}`,
              highlight: true,
            },
            {
              label: 'Per credit',
              value: formattedPerCredit,
              highlight: false,
            },
          ].map((row, i) => (
            <div
              key={i}
              className='flex items-center justify-between rounded-lg bg-muted/40 px-4 py-2.5'
            >
              <span className='text-sm text-muted-foreground'>{row.label}</span>
              <span
                className={`text-sm font-semibold ${row.highlight ? 'text-primary' : ''}`}
              >
                {row.value}
              </span>
            </div>
          ))}
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
          onClick={() => processPayment(pack.id)}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Processing...
            </>
          ) : (
            <>
              {pack.cta ?? `Get ${pack.name}`}
              <ArrowRight className='ml-2 h-4 w-4' />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
