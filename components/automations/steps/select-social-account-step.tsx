'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Instagram, Check, Loader2, ChevronLeft } from 'lucide-react';
import type { AutomationFormData } from '../automation-wizard';
import {
  SocialAccountsApi,
  type SocialAccount,
} from '@/lib/api/social-accounts';
import { useToast } from '@/components/ui/use-toast';
import { AutomationPlatform } from '@/lib/constants/automations';

interface SelectSocialAccountStepProps {
  formData: AutomationFormData;
  updateFormData: (data: Partial<AutomationFormData>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

export function SelectSocialAccountStep({
  formData,
  updateFormData,
  nextStep,
  prevStep,
}: SelectSocialAccountStepProps) {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    formData.social_account_id
  );
  const { toast } = useToast();

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await SocialAccountsApi.list({ status: 'connected' });
        setAccounts(response.data ?? []);
      } catch {
        toast({
          title: 'Error',
          description: 'Failed to load social accounts. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccounts();
  }, [toast]);

  const handleSelectAccount = (account: SocialAccount) => {
    setSelectedAccountId(account.id);
    updateFormData({
      social_account_id: account.id,
      social_account_name: account.username,
      // Store platform to help with subsequent steps
      platform:
        account.platform === 'facebook'
          ? AutomationPlatform.FACEBOOK
          : AutomationPlatform.INSTAGRAM,
    });
  };

  const handleNext = () => {
    if (selectedAccountId) {
      nextStep();
    }
  };

  if (isLoading) {
    return (
      <div className='flex h-64 w-full items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    );
  }

  return (
    <div>
      <h2 className='mb-2 text-xl font-bold text-foreground sm:text-2xl'>
        Select Account
      </h2>
      <p className='mb-6 text-sm text-muted-foreground sm:mb-8 sm:text-base'>
        Choose which social account to use for this automation
      </p>

      {accounts.length === 0 ? (
        <div className='rounded-lg border-2 border-dashed border-border p-8 text-center sm:p-12'>
          <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted sm:h-16 sm:w-16'>
            <Instagram className='h-6 w-6 text-muted-foreground sm:h-8 sm:w-8' />
          </div>
          <h3 className='mb-2 text-base font-semibold text-foreground sm:text-lg'>
            No accounts connected
          </h3>
          <p className='mb-4 text-xs text-muted-foreground sm:mb-6 sm:text-sm'>
            Connect your social account to create automations
          </p>
          <Button
            size='sm'
            className='sm:size-default'
            onClick={() => (window.location.href = '/dashboard/settings')}
          >
            Connect Account
          </Button>
        </div>
      ) : (
        <div className='space-y-3'>
          {accounts.map(account => (
            <button
              key={account.id}
              onClick={() => handleSelectAccount(account)}
              className='group relative w-full overflow-hidden rounded-lg border-2 transition-all hover:border-primary'
              style={{
                borderColor:
                  selectedAccountId === account.id
                    ? 'var(--primary)'
                    : 'var(--border)',
                backgroundColor:
                  selectedAccountId === account.id
                    ? 'var(--muted)'
                    : 'transparent',
              }}
            >
              <div className='flex items-center gap-3 p-3 sm:gap-4 sm:p-4'>
                <Avatar className='h-10 w-10 border border-border sm:h-12 sm:w-12'>
                  <AvatarImage
                    src={account.avatar?.url}
                    alt={account.avatar?.id}
                  />
                  <AvatarFallback>
                    {account?.username?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className='flex-1 text-left'>
                  <div className='flex items-center gap-2'>
                    <span className='font-semibold text-foreground'>
                      {account?.username}
                    </span>
                    <Badge variant='secondary' className='text-xs'>
                      {account.platform}
                    </Badge>
                  </div>
                  <span className='text-xs text-muted-foreground sm:text-sm'>
                    @{account.username}
                  </span>
                </div>
                {selectedAccountId === account.id && (
                  <div className='flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground sm:h-8 sm:w-8'>
                    <Check className='h-3 w-3 sm:h-4 sm:w-4' />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      <div className='mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between'>
        <Button
          variant='outline'
          onClick={prevStep}
          className='w-full bg-transparent sm:w-auto'
        >
          <ChevronLeft className='mr-2 h-4 w-4' />
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!selectedAccountId}
          className='w-full sm:w-auto'
        >
          Next Step
        </Button>
      </div>
    </div>
  );
}
