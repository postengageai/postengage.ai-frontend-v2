import type React from 'react';
import { cn } from '@/lib/utils';

interface AuthCardProps {
  children: React.ReactNode;
  className?: string;
}

export function AuthCard({ children, className }: AuthCardProps) {
  return (
    <div
      className={cn(
        'w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-lg',
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
    <div className='mb-8 text-center'>
      <h1 className='text-2xl font-semibold text-foreground'>{title}</h1>
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
  return (
    <div className='mt-6 text-center text-sm text-muted-foreground'>
      {children}
    </div>
  );
}
