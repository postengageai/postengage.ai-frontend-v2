'use client';

import { GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTour } from '@/lib/hooks/use-tour';
import { useUser } from '@/lib/user/store';

export function TourButton() {
  const user = useUser();
  const { startTour, tourEnabled, pageKey, hasSeenTour } = useTour();

  // Don't render if: no user loaded, tour disabled, or no tour for this page
  if (!user || !tourEnabled || !pageKey) return null;

  return (
    <button
      onClick={() => void startTour()}
      data-tour='tour-trigger-btn'
      className={cn(
        'fixed bottom-6 right-6 z-40',
        'flex items-center gap-2',
        'rounded-full px-4 py-2.5',
        'bg-background/95 backdrop-blur-sm',
        'border border-border/60',
        'shadow-lg shadow-black/10',
        'text-sm font-medium text-muted-foreground',
        'hover:text-foreground hover:border-border hover:shadow-xl',
        'transition-all duration-200',
        // Pulse only if user hasn't seen this tour yet
        !hasSeenTour && 'animate-pulse-subtle',
        'group'
      )}
      title='Take a tour of this page'
    >
      <GraduationCap
        className={cn(
          'h-4 w-4 shrink-0 transition-colors duration-200',
          !hasSeenTour
            ? 'text-primary'
            : 'text-muted-foreground group-hover:text-foreground'
        )}
      />
      <span className='hidden sm:block'>
        {hasSeenTour ? 'Tour' : 'Take a tour'}
      </span>
      {/* Dot indicator for unseen tours */}
      {!hasSeenTour && (
        <span className='absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-primary shadow-sm' />
      )}
    </button>
  );
}
