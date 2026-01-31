import React from 'react';
import { cn } from '@/lib/utils';

interface InboxLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function InboxLayout({ children, className }: InboxLayoutProps) {
  return (
    <div
      className={cn(
        'flex h-[calc(100vh-4rem)] w-full overflow-hidden',
        className
      )}
    >
      {children}
    </div>
  );
}
