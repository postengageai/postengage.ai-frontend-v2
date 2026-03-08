'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Bot, Dna, Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SocialAccountsApi, SocialAccount } from '@/lib/api/social-accounts';
import { BotForm } from '@/components/intelligence/bot-form';
import { VoiceSetupStep } from '@/components/intelligence/voice-dna/voice-setup-step';
import { OnboardingConnectStep } from '@/components/onboarding/onboarding-connect-step';
import { Skeleton } from '@/components/ui/skeleton';
import { analytics } from '@/lib/analytics';

// ─── Step definitions ─────────────────────────────────────────────────────────

const STEPS = [
  {
    id: 'connect',
    label: 'Connect Account',
    description: 'Link your Instagram',
    icon: Wifi,
  },
  {
    id: 'bot',
    label: 'Create Your Bot',
    description: 'Configure AI assistant',
    icon: Bot,
  },
  {
    id: 'voice',
    label: 'Set Up Voice',
    description: 'Make it sound like you',
    icon: Dna,
  },
] as const;

type StepId = (typeof STEPS)[number]['id'];

interface CreatedBotInfo {
  botId: string;
  socialAccountId: string;
  brandVoiceId?: string;
}

// ─── Step indicator ────────────────────────────────────────────────────────────

function StepIndicator({
  steps,
  currentStep,
}: {
  steps: typeof STEPS;
  currentStep: StepId;
}) {
  const currentIdx = steps.findIndex(s => s.id === currentStep);

  return (
    <div className='flex items-center justify-center gap-0 mb-8'>
      {steps.map((step, idx) => {
        const isCompleted = idx < currentIdx;
        const isCurrent = idx === currentIdx;
        const Icon = step.icon;

        return (
          <div key={step.id} className='flex items-center'>
            {/* Step circle */}
            <div className='flex flex-col items-center gap-1.5'>
              <div
                className={cn(
                  'h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all',
                  isCompleted
                    ? 'bg-primary border-primary text-primary-foreground'
                    : isCurrent
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'bg-muted border-border text-muted-foreground'
                )}
              >
                {isCompleted ? (
                  <CheckCircle2 className='h-5 w-5' />
                ) : (
                  <Icon className='h-5 w-5' />
                )}
              </div>
              <div className='text-center hidden sm:block'>
                <p
                  className={cn(
                    'text-xs font-medium',
                    isCurrent ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {step.label}
                </p>
              </div>
            </div>

            {/* Connector line */}
            {idx < steps.length - 1 && (
              <div
                className={cn(
                  'h-0.5 w-16 sm:w-24 mx-1 mt-[-18px] sm:mt-[-22px] transition-all',
                  idx < currentIdx ? 'bg-primary' : 'bg-border'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<StepId>('connect');
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createdBot, setCreatedBot] = useState<CreatedBotInfo | null>(null);

  useEffect(() => {
    fetchSocialAccounts();
  }, []);

  const fetchSocialAccounts = async () => {
    try {
      const response = await SocialAccountsApi.list();
      const accounts = response?.data ?? [];
      setSocialAccounts(accounts);
      // If already connected, skip straight to bot creation
      if (accounts.length > 0) {
        setCurrentStep('bot');
      }
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectComplete = async () => {
    // Refresh accounts then advance
    try {
      const response = await SocialAccountsApi.list();
      setSocialAccounts(response?.data ?? []);
    } catch {
      // silent
    }
    analytics.track('onboarding_step_completed', {
      step: 'connect',
      step_index: 0,
    });
    setCurrentStep('bot');
  };

  const handleBotCreated = (botInfo: CreatedBotInfo) => {
    setCreatedBot(botInfo);
    analytics.track('onboarding_step_completed', {
      step: 'bot',
      step_index: 1,
    });
    setCurrentStep('voice');
  };

  const handleVoiceComplete = () => {
    analytics.track('onboarding_step_completed', {
      step: 'voice',
      step_index: 2,
    });
    analytics.track('onboarding_wizard_completed', {});
    // Mark onboarding done so dashboard doesn't redirect again
    try {
      localStorage.setItem('onboarding_complete', 'true');
    } catch {
      // Ignore if localStorage unavailable
    }
    router.push('/dashboard');
    router.refresh();
  };

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center p-6'>
        <div className='w-full max-w-2xl space-y-6'>
          <Skeleton className='h-16 w-full' />
          <Skeleton className='h-[400px] w-full' />
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen flex flex-col items-center justify-start p-4 sm:p-8 pt-10'>
      <div className='w-full max-w-2xl'>
        {/* Header */}
        <div className='text-center mb-6'>
          <h1 className='text-2xl sm:text-3xl font-bold tracking-tight'>
            Let&apos;s get you set up
          </h1>
          <p className='text-muted-foreground mt-1 text-sm'>
            Takes about 3 minutes. We&apos;ll walk you through every step.
          </p>
        </div>

        {/* Step indicator */}
        <StepIndicator steps={STEPS} currentStep={currentStep} />

        {/* Step content */}
        <div className='rounded-xl border border-border bg-card p-6 sm:p-8 shadow-sm'>
          {currentStep === 'connect' && (
            <OnboardingConnectStep onComplete={handleConnectComplete} />
          )}

          {currentStep === 'bot' && (
            <BotForm
              socialAccounts={socialAccounts}
              onCreated={handleBotCreated}
            />
          )}

          {currentStep === 'voice' && createdBot && (
            <VoiceSetupStep
              botId={createdBot.botId}
              socialAccountId={createdBot.socialAccountId}
              brandVoiceId={createdBot.brandVoiceId}
              onComplete={handleVoiceComplete}
              onSkip={handleVoiceComplete}
            />
          )}
        </div>

        {/* Skip onboarding */}
        <div className='text-center mt-4'>
          <button
            className='text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline transition-colors'
            onClick={handleVoiceComplete}
          >
            Skip setup — take me to the dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
