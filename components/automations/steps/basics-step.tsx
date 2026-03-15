'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Instagram, Check, Loader2, ChevronLeft, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AutomationFormData } from '../automation-wizard';
import {
  SocialAccountsApi,
  type SocialAccount,
} from '@/lib/api/social-accounts';
import { parseApiError } from '@/lib/http/errors';
import { useToast } from '@/components/ui/use-toast';
import { AutomationPlatform } from '@/lib/constants/automations';

interface BasicsStepProps {
  formData: AutomationFormData;
  updateFormData: (data: Partial<AutomationFormData>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

export function BasicsStep({
  formData,
  updateFormData,
  nextStep,
  prevStep,
}: BasicsStepProps) {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    formData.social_account_id || null
  );
  const { toast } = useToast();

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await SocialAccountsApi.list({ status: 'connected' });
        setAccounts(response.data ?? []);
      } catch (error) {
        const err = parseApiError(error);
        toast({
          title: err.title,
          description: err.message,
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
      platform:
        account.platform === 'facebook'
          ? AutomationPlatform.FACEBOOK
          : AutomationPlatform.INSTAGRAM,
    });
  };

  const handleNext = () => {
    if (!selectedAccountId) return;
    nextStep();
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
      <h2 className='mb-2 text-2xl font-bold text-foreground'>Basics</h2>
      <p className='mb-8 text-muted-foreground'>
        Choose your connected account for this automation
      </p>

      {/* Account Selection */}
      <div className='mb-8'>
        <h3 className='mb-3 text-sm font-semibold text-foreground'>
          Connected Account
        </h3>

        {accounts.length === 0 ? (
          <div className='rounded-lg border-2 border-dashed border-border p-8 text-center'>
            <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted'>
              <Instagram className='h-6 w-6 text-muted-foreground' />
            </div>
            <h3 className='mb-2 text-base font-semibold text-foreground'>
              No accounts connected
            </h3>
            <p className='mb-4 text-sm text-muted-foreground'>
              Connect your social account to create automations
            </p>
            <Button
              size='sm'
              onClick={() => (window.location.href = '/dashboard/settings')}
            >
              Connect Account
            </Button>
          </div>
        ) : (
          <div className='space-y-2'>
            {accounts.map(account => (
              <button
                key={account.id}
                onClick={() => handleSelectAccount(account)}
                className={cn(
                  'group relative w-full overflow-hidden rounded-xl border-2 transition-all hover:border-primary/60',
                  selectedAccountId === account.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card'
                )}
              >
                <div className='flex items-center gap-4 p-4'>
                  <Avatar className='h-11 w-11 border border-border'>
                    <AvatarImage
                      src={account.avatar?.url}
                      alt={account.username}
                    />
                    <AvatarFallback>
                      {account?.username?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className='flex-1 text-left'>
                    <div className='flex items-center gap-2'>
                      <span className='font-semibold text-foreground'>
                        @{account.username}
                      </span>
                      <Badge variant='secondary' className='text-xs capitalize'>
                        {account.platform}
                      </Badge>
                    </div>
                    <p className='text-xs text-muted-foreground'>
                      Connected account
                    </p>
                  </div>
                  {selectedAccountId === account.id && (
                    <div className='flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white'>
                      <Check className='h-3.5 w-3.5' />
                    </div>
                  )}
                </div>
              </button>
            ))}

            <button
              onClick={() =>
                (window.location.href = '/dashboard/settings/social-accounts')
              }
              className='flex w-full items-center gap-3 rounded-xl border-2 border-dashed border-border px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground'
            >
              <Plus className='h-4 w-4' />
              Add another account
            </button>
          </div>
        )}
      </div>

      <div className='flex flex-col gap-3 sm:flex-row sm:justify-between'>
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
          Continue
        </Button>
      </div>
    </div>
  );
}
