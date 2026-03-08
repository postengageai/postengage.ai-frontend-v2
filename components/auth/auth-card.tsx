import type React from 'react';
import { cn } from '@/lib/utils';

interface AuthCardProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Auth card — used inside the right panel of the split auth layout.
 * On desktop the right panel provides the visual container, so the card
 * itself is just a clean max-width wrapper with no heavy border/shadow.
 * On mobile it keeps a subtle card treatment for clarity.
 */
export function AuthCard({ children, className }: AuthCardProps) {
  return (
    <div
      className={cn(
        // Full width on small screens with a subtle card feel
        // On large screens: no card chrome — right panel is the container
        'w-full max-w-sm',
        'rounded-2xl border border-border/50 bg-card/30 p-8 shadow-sm',
        'lg:border-transparent lg:bg-transparent lg:shadow-none lg:p-0',
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
    <div className='mb-8'>
      <h1 className='text-2xl font-bold text-foreground tracking-tight'>
        {title}
      </h1>
      {description && (
        <p className='mt-2 text-sm text-muted-foreground'>{description}</p>
      )}
    </div>
  );
}

interface AuthCardFooterProps {
  children: React.ReactNode;
}

export function AuthCardFooter({ children }: AuthCardFooterProps) {
  return <div className='mt-6 text-sm text-muted-foreground'>{children}</div>;
}
