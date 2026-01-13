'use client';
import { Instagram, Facebook, Check } from 'lucide-react';
import type { AutomationFormData } from '../automation-wizard';
import {
  AutomationPlatform,
  type AutomationPlatformType,
} from '@/lib/constants/automations';

interface SelectAccountTypeStepProps {
  formData: AutomationFormData;
  updateFormData: (data: Partial<AutomationFormData>) => void;
  nextStep: () => void;
}

export function SelectAccountTypeStep({
  formData,
  updateFormData,
  nextStep,
}: SelectAccountTypeStepProps) {
  const handleSelectPlatform = (platform: AutomationPlatformType) => {
    updateFormData({ platform });
    nextStep();
  };

  return (
    <div>
      <h2 className='mb-2 text-xl font-bold text-foreground sm:text-2xl'>
        Choose Platform
      </h2>
      <p className='mb-6 text-sm text-muted-foreground sm:mb-8 sm:text-base'>
        Select which social media platform you want to automate
      </p>

      <div className='grid gap-4 sm:grid-cols-2'>
        <button
          onClick={() => handleSelectPlatform(AutomationPlatform.INSTAGRAM)}
          className='group relative overflow-hidden rounded-lg border-2 border-border bg-card p-6 text-left transition-all hover:border-primary hover:bg-card/80 sm:p-8'
        >
          <div className='flex items-start gap-3 sm:gap-4'>
            <div className='rounded-lg bg-linear-to-br from-purple-600 to-pink-600 p-2.5 sm:p-3'>
              <Instagram className='h-6 w-6 text-white sm:h-8 sm:w-8' />
            </div>
            <div className='flex-1'>
              <h3 className='text-lg font-semibold text-foreground sm:text-xl'>
                Instagram
              </h3>
              <p className='mt-1 text-xs text-muted-foreground sm:mt-2 sm:text-sm'>
                Automate comments, DMs, and engagement on Instagram
              </p>
              <div className='mt-3 flex flex-wrap gap-2 sm:mt-4'>
                <span className='rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary sm:px-3 sm:py-1'>
                  Comments
                </span>
                <span className='rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary sm:px-3 sm:py-1'>
                  DMs
                </span>
              </div>
            </div>
          </div>
          {formData.platform === AutomationPlatform.INSTAGRAM && (
            <div className='absolute right-4 top-4 rounded-full bg-primary p-1'>
              <Check className='h-4 w-4 text-white' />
            </div>
          )}
        </button>

        <button
          onClick={() => handleSelectPlatform(AutomationPlatform.FACEBOOK)}
          disabled
          className='group relative cursor-not-allowed overflow-hidden rounded-lg border-2 border-border bg-card p-6 text-left opacity-50 transition-all sm:p-8'
        >
          <div className='flex items-start gap-3 sm:gap-4'>
            <div className='rounded-lg bg-linear-to-br from-blue-600 to-blue-800 p-2.5 sm:p-3'>
              <Facebook className='h-6 w-6 text-white sm:h-8 sm:w-8' />
            </div>
            <div className='flex-1'>
              <h3 className='text-lg font-semibold text-foreground sm:text-xl'>
                Facebook
              </h3>
              <p className='mt-1 text-xs text-muted-foreground sm:mt-2 sm:text-sm'>
                Automate comments and posts on Facebook
              </p>
              <div className='mt-3 sm:mt-4'>
                <span className='rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground sm:px-3 sm:py-1'>
                  Coming Soon
                </span>
              </div>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
