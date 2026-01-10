'use client';

import type { User as UserType, ConnectedAccount } from '@/lib/types/dashboard';

interface WelcomeSectionProps {
  user: UserType;
  connectedAccount: ConnectedAccount | null;
  automationCount: number;
  activeAutomationCount: number;
}

export function WelcomeSection({
  user,
  connectedAccount,
  automationCount,
  activeAutomationCount,
}: WelcomeSectionProps) {
  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Get contextual status message
  const getStatusMessage = () => {
    if (!connectedAccount) {
      return 'Connect your Instagram to get started.';
    }
    if (automationCount === 0) {
      return 'Create your first automation to start engaging.';
    }
    if (activeAutomationCount === 0) {
      return 'All automations are paused. Resume one to start engaging.';
    }
    return `${activeAutomationCount} automation${activeAutomationCount > 1 ? 's' : ''} actively working for you.`;
  };

  const firstName = user.name.split(' ')[0];

  return (
    <div className='mb-8'>
      <h1 className='text-2xl sm:text-3xl font-semibold tracking-tight'>
        {getGreeting()}, {firstName}
      </h1>
      <p className='mt-1 text-muted-foreground'>{getStatusMessage()}</p>
    </div>
  );
}
