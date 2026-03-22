'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Circle,
  Instagram,
  Zap,
  Users,
  CreditCard,
  UserCheck,
  ChevronDown,
  ChevronUp,
  PartyPopper,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  useDashboardStats,
  useSocialAccounts,
  useCreditsBalance,
} from '@/lib/hooks';

const STORAGE_KEY = 'postengage:onboarding-dismissed';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  href: string;
  ctaLabel: string;
  icon: React.ReactNode;
}

export function OnboardingChecklist() {
  const { data: dashboardData } = useDashboardStats();
  const { data: socialAccounts } = useSocialAccounts();
  const { data: creditsData } = useCreditsBalance();

  const [dismissed, setDismissed] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Check localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'true') setDismissed(true);
    }
  }, []);

  // Determine step completion
  const hasConnectedAccount = useMemo(() => {
    // Check dashboard connected_account or social accounts list
    if (dashboardData?.connected_account?.username) return true;
    if (
      socialAccounts &&
      Array.isArray(socialAccounts) &&
      socialAccounts.length > 0
    )
      return true;
    return false;
  }, [dashboardData?.connected_account, socialAccounts]);

  const hasAutomations = useMemo(() => {
    return (dashboardData?.overview?.total_automations ?? 0) > 0;
  }, [dashboardData?.overview?.total_automations]);

  const hasLeads = useMemo(() => {
    return (dashboardData?.overview?.total_leads ?? 0) > 0;
  }, [dashboardData?.overview?.total_leads]);

  const hasPurchasedCredits = useMemo(() => {
    // If credits_used_this_month > 0 or credits > free tier amount, likely purchased
    // A more reliable indicator: check if total credits used this month indicates purchases
    const remaining =
      creditsData?.available_credits ??
      dashboardData?.overview?.credits_remaining ??
      0;
    const usedThisMonth = dashboardData?.overview?.credits_used_this_month ?? 0;
    // If they've had more than the typical free 50 credits, they've purchased
    // Simple heuristic: total credits ever had = remaining + used
    const totalEver = remaining + usedThisMonth;
    return totalEver > 50;
  }, [creditsData, dashboardData?.overview]);

  const steps: OnboardingStep[] = useMemo(
    () => [
      {
        id: 'account',
        title: 'Create your account',
        description: "You're signed in and ready to go!",
        completed: true, // Always completed — they're logged in
        href: '/dashboard/settings',
        ctaLabel: 'View profile',
        icon: <UserCheck className='h-5 w-5' />,
      },
      {
        id: 'instagram',
        title: 'Connect Instagram',
        description: 'Link your Instagram account to enable automations.',
        completed: hasConnectedAccount,
        href: '/dashboard/accounts',
        ctaLabel: 'Connect now',
        icon: <Instagram className='h-5 w-5' />,
      },
      {
        id: 'automation',
        title: 'Create first automation',
        description: 'Set up an AI-powered DM or comment automation.',
        completed: hasAutomations,
        href: '/dashboard/automations/new',
        ctaLabel: 'Create automation',
        icon: <Zap className='h-5 w-5' />,
      },
      {
        id: 'lead',
        title: 'Get your first lead',
        description: 'Leads are captured automatically when people engage.',
        completed: hasLeads,
        href: '/dashboard/leads',
        ctaLabel: 'View leads',
        icon: <Users className='h-5 w-5' />,
      },
      {
        id: 'credits',
        title: 'Buy credits',
        description: 'Purchase credits to power your AI automations.',
        completed: hasPurchasedCredits,
        href: '/dashboard/credits/buy',
        ctaLabel: 'Buy credits',
        icon: <CreditCard className='h-5 w-5' />,
      },
    ],
    [hasConnectedAccount, hasAutomations, hasLeads, hasPurchasedCredits]
  );

  const completedCount = steps.filter(s => s.completed).length;
  const allComplete = completedCount === steps.length;
  const progressPercent = (completedCount / steps.length) * 100;

  // Handle all-complete celebration
  useEffect(() => {
    if (allComplete && !dismissed) {
      setShowCelebration(true);
      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => {
        localStorage.setItem(STORAGE_KEY, 'true');
        setDismissed(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [allComplete, dismissed]);

  // Don't render if dismissed or still loading
  if (dismissed) return null;
  if (!dashboardData) return null;

  // Celebration state
  if (showCelebration && allComplete) {
    return (
      <Card className='relative overflow-hidden border-primary/30 bg-gradient-to-r from-primary/5 via-primary/10 to-violet-500/5'>
        <CardContent className='py-6'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <div className='flex h-12 w-12 items-center justify-center rounded-full bg-primary/10'>
                <PartyPopper className='h-6 w-6 text-primary' />
              </div>
              <div>
                <h3 className='text-lg font-bold text-foreground'>
                  You&apos;re all set!
                </h3>
                <p className='text-sm text-muted-foreground'>
                  Congratulations! You&apos;ve completed all onboarding steps.
                  Your automations are ready to grow your business.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                localStorage.setItem(STORAGE_KEY, 'true');
                setDismissed(true);
              }}
              aria-label='Dismiss'
              className='rounded-md p-1.5 hover:bg-muted transition-colors'
            >
              <X className='h-4 w-4 text-muted-foreground' />
            </button>
          </div>
          {/* Confetti dots */}
          <div className='absolute inset-0 pointer-events-none overflow-hidden'>
            {Array.from({ length: 20 }).map((_, i) => (
              <span
                key={i}
                className='absolute inline-block h-1.5 w-1.5 rounded-full animate-bounce'
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  backgroundColor: [
                    '#a855f7',
                    '#3b82f6',
                    '#22c55e',
                    '#f59e0b',
                    '#ef4444',
                    '#ec4899',
                  ][i % 6],
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random() * 2}s`,
                  opacity: 0.6 + Math.random() * 0.4,
                }}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='border-primary/20 bg-gradient-to-r from-card to-primary/[0.02]'>
      <CardContent className='py-5'>
        {/* Header */}
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center gap-3'>
            <h3 className='text-base font-semibold text-foreground'>
              Getting Started
            </h3>
            <span className='text-xs font-medium text-muted-foreground bg-muted rounded-full px-2.5 py-0.5'>
              {completedCount}/{steps.length} completed
            </span>
          </div>
          <button
            onClick={() => setCollapsed(c => !c)}
            className='rounded-md p-1.5 hover:bg-muted transition-colors'
            aria-label={collapsed ? 'Expand checklist' : 'Collapse checklist'}
          >
            {collapsed ? (
              <ChevronDown className='h-4 w-4 text-muted-foreground' />
            ) : (
              <ChevronUp className='h-4 w-4 text-muted-foreground' />
            )}
          </button>
        </div>

        {/* Progress bar */}
        <Progress value={progressPercent} className='h-2 mb-4' />

        {/* Steps list */}
        {!collapsed && (
          <div className='space-y-1'>
            {steps.map(step => (
              <div
                key={step.id}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors',
                  step.completed ? 'opacity-70' : 'hover:bg-muted/50'
                )}
              >
                {/* Checkbox icon */}
                <div className='shrink-0'>
                  {step.completed ? (
                    <CheckCircle2 className='h-5 w-5 text-primary' />
                  ) : (
                    <Circle className='h-5 w-5 text-muted-foreground/40' />
                  )}
                </div>

                {/* Step icon */}
                <div
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                    step.completed
                      ? 'bg-primary/10 text-primary'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {step.icon}
                </div>

                {/* Text */}
                <div className='flex-1 min-w-0'>
                  <p
                    className={cn(
                      'text-sm font-medium',
                      step.completed
                        ? 'text-muted-foreground line-through'
                        : 'text-foreground'
                    )}
                  >
                    {step.title}
                  </p>
                  <p className='text-xs text-muted-foreground truncate'>
                    {step.description}
                  </p>
                </div>

                {/* CTA */}
                {!step.completed && (
                  <Button
                    asChild
                    size='sm'
                    variant='outline'
                    className='shrink-0 h-7 text-xs font-medium'
                  >
                    <Link href={step.href}>{step.ctaLabel}</Link>
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
