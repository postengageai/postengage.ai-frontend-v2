import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='skeleton'
      className={cn(
        'bg-muted animate-pulse rounded-md',
        'dark:bg-muted/70',
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
