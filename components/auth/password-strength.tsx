'use client';

import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordStrengthProps {
  password: string;
  showRules?: boolean;
}

interface Rule {
  label: string;
  test: (password: string) => boolean;
}

const rules: Rule[] = [
  { label: 'At least 8 characters', test: p => p.length >= 8 },
  { label: 'One uppercase letter', test: p => /[A-Z]/.test(p) },
  { label: 'One lowercase letter', test: p => /[a-z]/.test(p) },
  { label: 'One number', test: p => /[0-9]/.test(p) },
  {
    label: 'One special character',
    test: p => /[!@#$%^&*(),.?":{}|<>]/.test(p),
  },
];

export function PasswordStrength({
  password,
  showRules = true,
}: PasswordStrengthProps) {
  const passedCount = rules.filter(rule => rule.test(password)).length;
  const strength = passedCount / rules.length;

  if (!password) return null;

  return (
    <div className='space-y-3'>
      {/* Strength bar */}
      <div className='flex gap-1'>
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors',
              i < passedCount
                ? strength === 1
                  ? 'bg-green-500'
                  : strength >= 0.6
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                : 'bg-muted'
            )}
          />
        ))}
      </div>

      {/* Rules list */}
      {showRules && (
        <ul className='space-y-1.5'>
          {rules.map((rule, i) => {
            const passed = rule.test(password);
            return (
              <li
                key={i}
                className={cn(
                  'flex items-center gap-2 text-sm transition-colors',
                  passed ? 'text-green-500' : 'text-muted-foreground'
                )}
              >
                {passed ? (
                  <Check className='h-3.5 w-3.5' />
                ) : (
                  <X className='h-3.5 w-3.5' />
                )}
                {rule.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function isPasswordValid(password: string): boolean {
  return rules.every(rule => rule.test(password));
}
