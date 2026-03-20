'use client';

import {
  Instagram,
  Facebook,
  Linkedin,
  Check,
  ChevronLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { AutomationFormData } from '../automation-wizard';
import {
  AutomationPlatform,
  type AutomationPlatformType,
} from '@/lib/constants/automations';

interface SelectAccountTypeStepProps {
  formData: AutomationFormData;
  updateFormData: (data: Partial<AutomationFormData>) => void;
  nextStep: () => void;
  onCancel: () => void;
}

const PLATFORMS = [
  {
    value: AutomationPlatform.INSTAGRAM,
    label: 'Instagram',
    icon: Instagram,
    gradient: 'from-purple-600 to-pink-600',
    description: 'Automate comments, DMs, and engagement on Instagram',
    features: ['Comments', 'Direct Messages', 'Story Replies'],
    social_proof: '2,400+ creators · Most automations run here',
    available: true,
  },
  {
    value: AutomationPlatform.FACEBOOK,
    label: 'Facebook',
    icon: Facebook,
    gradient: 'from-blue-600 to-blue-800',
    description: 'Automate comments and messages on Facebook pages',
    features: ['Comments', 'Messenger'],
    social_proof: null,
    available: false,
  },
  {
    value: AutomationPlatform.LINKEDIN,
    label: 'LinkedIn',
    icon: Linkedin,
    gradient: 'from-sky-600 to-blue-700',
    description: 'Automate connection messages and post engagement',
    features: ['Comments', 'Messages'],
    social_proof: null,
    available: false,
  },
] as const;

export function SelectAccountTypeStep({
  formData,
  updateFormData,
  nextStep,
  onCancel,
}: SelectAccountTypeStepProps) {
  const handleSelectPlatform = (platform: AutomationPlatformType) => {
    updateFormData({ platform });
    nextStep();
  };

  return (
    <div>
      <h2 className='mb-2 text-2xl font-bold text-foreground'>
        Choose Platform
      </h2>
      <p className='mb-8 text-muted-foreground'>
        Select which social media platform you want to automate
      </p>

      <div className='space-y-3'>
        {PLATFORMS.map(platform => {
          const Icon = platform.icon;
          const isSelected = formData.platform === platform.value;

          return (
            <button
              key={platform.value}
              onClick={() =>
                platform.available && handleSelectPlatform(platform.value)
              }
              disabled={!platform.available}
              className={cn(
                'group relative w-full overflow-hidden rounded-xl border-2 p-5 text-left transition-all',
                platform.available
                  ? isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card hover:border-primary/60 hover:bg-card/80'
                  : 'cursor-not-allowed border-border bg-card opacity-60'
              )}
            >
              <div className='flex items-start gap-4'>
                <div
                  className={cn(
                    'flex-shrink-0 rounded-xl bg-linear-to-br p-3',
                    platform.gradient
                  )}
                >
                  <Icon className='h-6 w-6 text-white' />
                </div>
                <div className='flex-1 min-w-0'>
                  <div className='mb-1 flex flex-wrap items-center gap-2'>
                    <h3 className='text-base font-semibold text-foreground'>
                      {platform.label}
                    </h3>
                    {!platform.available && (
                      <Badge
                        variant='secondary'
                        className='bg-muted text-xs text-muted-foreground'
                      >
                        Coming Soon
                      </Badge>
                    )}
                  </div>
                  <p className='mb-3 text-sm text-muted-foreground'>
                    {platform.description}
                  </p>
                  <div className='flex flex-wrap gap-1.5'>
                    {platform.features.map(feature => (
                      <span
                        key={feature}
                        className='rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary'
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                  {platform.social_proof && (
                    <p className='mt-2 text-xs text-muted-foreground'>
                      {platform.social_proof}
                    </p>
                  )}
                </div>
                {isSelected && (
                  <div className='flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white'>
                    <Check className='h-3.5 w-3.5' />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className='mt-8 flex justify-start'>
        <Button
          variant='outline'
          onClick={onCancel}
          className='w-full bg-transparent sm:w-auto'
        >
          <ChevronLeft className='mr-2 h-4 w-4' />
          Back
        </Button>
      </div>
    </div>
  );
}
