'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Instagram,
  Check,
  Loader2,
  ChevronLeft,
  Zap,
  Calendar,
  Clock,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AutomationFormData } from '../automation-wizard';
import {
  SocialAccountsApi,
  type SocialAccount,
} from '@/lib/api/social-accounts';
import { parseApiError } from '@/lib/http/errors';
import { useToast } from '@/components/ui/use-toast';
import {
  AutomationPlatform,
  AutomationExecutionMode,
  type AutomationExecutionModeType,
} from '@/lib/constants/automations';

interface BasicsStepProps {
  formData: AutomationFormData;
  updateFormData: (data: Partial<AutomationFormData>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const EXECUTION_MODES = [
  {
    value: AutomationExecutionMode.REAL_TIME,
    label: 'Instant',
    icon: Zap,
    description: 'Responds the moment a trigger fires',
    badge: 'Recommended',
  },
  {
    value: AutomationExecutionMode.SCHEDULED,
    label: 'Scheduled',
    icon: Calendar,
    description: 'Runs on a fixed schedule or time window',
    badge: null,
  },
  {
    value: AutomationExecutionMode.DELAYED,
    label: 'Delayed',
    icon: Clock,
    description: 'Waits a set time before responding',
    badge: null,
  },
] as const;

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
  const [executionMode, setExecutionMode] =
    useState<AutomationExecutionModeType>(
      formData.execution_mode || AutomationExecutionMode.REAL_TIME
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
    updateFormData({ execution_mode: executionMode });
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
        Choose your connected account and how this automation runs
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
              onClick={() => (window.location.href = '/dashboard/settings')}
              className='flex w-full items-center gap-3 rounded-xl border-2 border-dashed border-border px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground'
            >
              <Plus className='h-4 w-4' />
              Add another account
            </button>
          </div>
        )}
      </div>

      {/* Execution Mode */}
      <div className='mb-8'>
        <h3 className='mb-3 text-sm font-semibold text-foreground'>
          Execution Mode
        </h3>
        <div className='grid gap-3 sm:grid-cols-3'>
          {EXECUTION_MODES.map(mode => {
            const Icon = mode.icon;
            const isSelected = executionMode === mode.value;
            return (
              <Card
                key={mode.value}
                onClick={() => setExecutionMode(mode.value)}
                className={cn(
                  'cursor-pointer p-4 transition-all hover:border-primary/60',
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card'
                )}
              >
                <div className='mb-3 flex items-center justify-between'>
                  <div
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-lg',
                      isSelected ? 'bg-primary text-white' : 'bg-muted'
                    )}
                  >
                    <Icon className='h-4 w-4' />
                  </div>
                  {mode.badge && (
                    <Badge className='bg-primary/10 text-xs text-primary'>
                      {mode.badge}
                    </Badge>
                  )}
                  {isSelected && !mode.badge && (
                    <div className='flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white'>
                      <Check className='h-3 w-3' />
                    </div>
                  )}
                </div>
                <p className='font-semibold text-foreground'>{mode.label}</p>
                <p className='mt-1 text-xs text-muted-foreground'>
                  {mode.description}
                </p>
              </Card>
            );
          })}
        </div>
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
