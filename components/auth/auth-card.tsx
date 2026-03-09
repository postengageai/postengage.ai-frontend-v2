import type React from 'react';
import { cn } from '@/lib/utils';

interface AuthCardProps {
  children: React.ReactNode;
  className?: string;
  /** Tints the card background for status states (success/error/warning) */
  variant?: 'default' | 'success' | 'error' | 'warning';
}

const variantStyles = {
  default: 'bg-card border-border',
  success: 'bg-[#0d1f14] border-[#22C55E]/25',
  error:   'bg-[#1a0f0f] border-[#EF4444]/25',
  warning: 'bg-[#1a150a] border-[#F59E0B]/25',
};

/**
 * Centered auth card — always fully visible (border + bg).
 * Used on: forgot-password, reset-password, verify-email,
 *          resend-verification, account-locked, account-suspended, oauth-error.
 */
export function AuthCard({ children, className, variant = 'default' }: AuthCardProps) {
  return (
    <div
      className={cn(
        'w-full max-w-[480px] rounded-[--radius-xl] border p-12 shadow-xl shadow-black/40',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </div>
  );
}

interface AuthCardHeaderProps {
  title: string;
  description?: string;
}

export function AuthCardHeader({ title, description }: AuthCardHeaderProps) {
  return (
    <div className='mb-6'>
      <h1 className='text-2xl font-bold text-foreground tracking-tight'>{title}</h1>
      {description && (
        <p className='mt-1.5 text-sm text-muted-foreground'>{description}</p>
      )}
    </div>
  );
}

interface AuthCardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function AuthCardFooter({ children, className }: AuthCardFooterProps) {
  return (
    <div className={cn('mt-6 text-sm text-center text-muted-foreground', className)}>
      {children}
    </div>
  );
}
