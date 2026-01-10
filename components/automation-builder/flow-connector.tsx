'use client';

import { cn } from '@/lib/utils';

interface FlowConnectorProps {
  className?: string;
  variant?: 'default' | 'dashed';
}

export function FlowConnector({
  className,
  variant = 'default',
}: FlowConnectorProps) {
  return (
    <div className={cn('flex items-center justify-center py-1', className)}>
      <div
        className={cn(
          'w-0.5 h-8 bg-border',
          variant === 'dashed' &&
            'border-l-2 border-dashed border-border bg-transparent'
        )}
      />
    </div>
  );
}
