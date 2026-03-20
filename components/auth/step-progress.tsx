import { cn } from '@/lib/utils';

interface StepProgressProps {
  steps: string[];
  currentStep: number; // 1-based
}

/**
 * 3-step progress indicator used on the verify-email page.
 * Step 1 = Check email, Step 2 = Verify email, Step 3 = Start automating
 */
export function StepProgress({ steps, currentStep }: StepProgressProps) {
  return (
    <div className='flex items-center justify-center gap-0'>
      {steps.map((step, idx) => {
        const stepNum = idx + 1;
        const isActive = stepNum === currentStep;
        const isCompleted = stepNum < currentStep;

        return (
          <div key={step} className='flex items-center'>
            {/* Connector line (before each step except first) */}
            {idx > 0 && (
              <div
                className={cn(
                  'w-12 h-px mx-1',
                  isCompleted ? 'bg-primary' : 'bg-border'
                )}
              />
            )}

            <div className='flex flex-col items-center gap-2'>
              {/* Circle */}
              <div
                className={cn(
                  'h-9 w-9 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors',
                  isActive
                    ? 'bg-primary border-primary text-white'
                    : isCompleted
                      ? 'bg-primary/20 border-primary text-primary'
                      : 'bg-muted border-border text-muted-foreground'
                )}
              >
                {isCompleted ? (
                  <svg className='h-4 w-4' viewBox='0 0 16 16' fill='none'>
                    <path
                      d='M3 8l3.5 3.5L13 5'
                      stroke='currentColor'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                ) : (
                  stepNum
                )}
              </div>

              {/* Label */}
              <span
                className={cn(
                  'text-xs font-medium whitespace-nowrap',
                  isActive ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {step}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
