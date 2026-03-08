import { Coins } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Static credit costs — mirrors credit-pricing.config.ts on the backend.
 * Update here if backend pricing changes.
 */
export const CREDIT_COSTS = {
  AI_REPLY: 3, // per AI-generated reply (DM or comment)
  VOICE_DNA_ANALYZE: 15, // per Voice DNA analysis run
  KNOWLEDGE_SOURCE: 5, // per knowledge source ingestion
  BOT_REPLY_BASE: 1, // base cost per non-AI reply
} as const;

interface CreditCostBadgeProps {
  /** Number of credits this action costs */
  amount: number;
  /** Optional label suffix, e.g. "per reply" */
  label?: string;
  /** Size variant */
  size?: 'sm' | 'xs';
  className?: string;
}

/**
 * Inline credit cost indicator shown before a chargeable action.
 * Usage: <CreditCostBadge amount={3} label="per reply" />
 */
export function CreditCostBadge({
  amount,
  label,
  size = 'sm',
  className,
}: CreditCostBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-muted-foreground',
        size === 'xs' ? 'text-xs' : 'text-sm',
        className
      )}
      aria-label={`${amount} credit${amount !== 1 ? 's' : ''}${label ? ` ${label}` : ''}`}
    >
      <Coins
        className={cn(
          'shrink-0 text-amber-500',
          size === 'xs' ? 'h-3 w-3' : 'h-3.5 w-3.5'
        )}
      />
      <span>
        <span className='font-medium text-foreground'>{amount}</span> credit
        {amount !== 1 ? 's' : ''}
        {label && <span className='opacity-70'> {label}</span>}
      </span>
    </span>
  );
}
