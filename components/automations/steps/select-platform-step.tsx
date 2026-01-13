'use client';

import { Instagram } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Platform } from '@/lib/types/automation-builder';

interface SelectPlatformStepProps {
  platform?: Platform;
  onChange: (platform: Platform) => void;
}

export function SelectPlatformStep({
  platform,
  onChange,
}: SelectPlatformStepProps) {
  const platforms = [
    {
      id: 'INSTAGRAM' as Platform,
      name: 'Instagram',
      icon: Instagram,
      description: 'Auto-reply to comments, DMs, and more',
      available: true,
    },
  ];

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-2xl font-semibold'>Choose your platform</h2>
        <p className='text-muted-foreground mt-2'>
          Select which social media platform you want to automate
        </p>
      </div>

      <div className='grid gap-4'>
        {platforms.map(p => (
          <Card
            key={p.id}
            className={cn(
              'p-6 cursor-pointer transition-all hover:border-primary/50',
              platform === p.id
                ? 'border-primary bg-primary/5'
                : 'border-border',
              !p.available && 'opacity-50 cursor-not-allowed'
            )}
            onClick={() => p.available && onChange(p.id)}
          >
            <div className='flex items-start gap-4'>
              <div
                className={cn(
                  'w-12 h-12 rounded-lg flex items-center justify-center shrink-0',
                  platform === p.id ? 'bg-primary/10' : 'bg-muted'
                )}
              >
                <p.icon
                  className={cn(
                    'h-6 w-6',
                    platform === p.id ? 'text-primary' : 'text-muted-foreground'
                  )}
                />
              </div>
              <div className='flex-1'>
                <div className='flex items-center gap-2'>
                  <h3 className='font-semibold'>{p.name}</h3>
                  {!p.available && (
                    <span className='text-xs text-muted-foreground'>
                      (Coming Soon)
                    </span>
                  )}
                </div>
                <p className='text-sm text-muted-foreground mt-1'>
                  {p.description}
                </p>
              </div>
              {platform === p.id && (
                <div className='w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0'>
                  <svg
                    className='w-4 h-4 text-primary-foreground'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M5 13l4 4L19 7'
                    />
                  </svg>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
