'use client';

import { cn } from '@/lib/utils';

interface PasswordStrengthProps {
  password: string;
}

const requirements = [
  { label: 'At least 8 characters',             test: (p: string) => p.length >= 8 },
  { label: 'At least one uppercase letter',      test: (p: string) => /[A-Z]/.test(p) },
  { label: 'At least one number',                test: (p: string) => /[0-9]/.test(p) },
  { label: 'At least one special character (@$!%*?&)', test: (p: string) => /[@$!%*?&]/.test(p) },
];

type Strength = 'weak' | 'fair' | 'strong';

function getStrength(password: string): { level: Strength; label: string; score: number } {
  const score = requirements.filter(r => r.test(password)).length;
  if (score <= 1) return { level: 'weak',   label: 'Weak',   score };
  if (score <= 2) return { level: 'fair',   label: 'Fair',   score };
  if (score <= 3) return { level: 'fair',   label: 'Fair',   score };
  return               { level: 'strong', label: 'Strong', score };
}

const segmentColors: Record<Strength, string> = {
  weak:   'bg-destructive',
  fair:   'bg-warning',
  strong: 'bg-success',
};

const labelColors: Record<Strength, string> = {
  weak:   'text-destructive',
  fair:   'text-warning',
  strong: 'text-success',
};

/**
 * Simple 4-segment strength bar used on signup.
 * Shows a label like "Weak — Add uppercase, number & special character".
 */
export function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null;

  const { level, label, score } = getStrength(password);
  const activeColor = segmentColors[level];

  // Generate hint text for weak/fair passwords
  const failedLabels = requirements
    .filter(r => !r.test(password))
    .map(r => r.label.replace('At least one ', '').replace('At least ', ''))
    .slice(0, 2);
  const hintText = failedLabels.length > 0
    ? `${label} — Add ${failedLabels.join(' & ')}`
    : label;

  return (
    <div className='space-y-1.5'>
      {/* 4-segment bar */}
      <div className='flex gap-1'>
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors duration-300',
              i <= score ? activeColor : 'bg-border'
            )}
          />
        ))}
      </div>
      {/* Label */}
      <p className={cn('text-xs font-medium', labelColors[level])}>
        {hintText}
      </p>
    </div>
  );
}

/**
 * Requirements checklist — used on reset password page.
 */
export function PasswordRequirements({ password }: { password: string }) {
  if (!password) return null;

  return (
    <div className='rounded-lg border border-border bg-muted/30 p-4'>
      <p className='text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3'>
        Requirements
      </p>
      <ul className='space-y-2'>
        {requirements.map((req) => {
          const passed = req.test(password);
          return (
            <li key={req.label} className='flex items-center gap-2.5 text-sm'>
              {passed ? (
                <svg className='h-4 w-4 shrink-0 text-success' viewBox='0 0 16 16' fill='none'>
                  <path d='M3 8l3.5 3.5L13 5' stroke='currentColor' strokeWidth='1.75' strokeLinecap='round' strokeLinejoin='round' />
                </svg>
              ) : (
                <svg className='h-4 w-4 shrink-0 text-destructive' viewBox='0 0 16 16' fill='none'>
                  <path d='M5 5l6 6M11 5l-6 6' stroke='currentColor' strokeWidth='1.75' strokeLinecap='round' />
                </svg>
              )}
              <span className={passed ? 'text-foreground/80' : 'text-destructive'}>
                {req.label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function isPasswordValid(password: string): boolean {
  return requirements.every(r => r.test(password));
}
