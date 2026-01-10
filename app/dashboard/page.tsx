'use client';

import { useState } from 'react';
import { WelcomeSection } from '@/components/dashboard/welcome-section';
import { AutomationsSection } from '@/components/dashboard/automations-section';
import { ActivityFeed } from '@/components/dashboard/activity-feed';
import { SuggestionsPanel } from '@/components/dashboard/suggestions-panel';
import {
  mockDashboardState,
  mockSuggestions,
  mockAutomations,
  mockActivities,
} from '@/lib/mock-data/dashboard';
import type { Automation } from '@/lib/types/dashboard';

export default function DashboardPage() {
  const [automations, setAutomations] = useState<Automation[]>(mockAutomations);

  const dashboardState = {
    ...mockDashboardState,
    automations,
  };

  const activeAutomationCount = automations.filter(
    a => a.status === 'running'
  ).length;

  const handleToggleAutomation = (id: string) => {
    setAutomations(prev =>
      prev.map(automation =>
        automation.id === id
          ? {
              ...automation,
              status: automation.status === 'running' ? 'paused' : 'running',
            }
          : automation
      )
    );
  };

  return (
    <main className='p-6 lg:p-8'>
      <WelcomeSection
        user={dashboardState.user}
        connectedAccount={dashboardState.connectedAccount}
        automationCount={automations.length}
        activeAutomationCount={activeAutomationCount}
      />

      <div className='mt-8 grid gap-8 lg:grid-cols-3'>
        <div className='lg:col-span-2 space-y-8'>
          <AutomationsSection
            automations={automations}
            onToggleAutomation={handleToggleAutomation}
          />
          <ActivityFeed activities={mockActivities} />
        </div>

        <div className='lg:col-span-1'>
          <SuggestionsPanel suggestions={mockSuggestions} />
        </div>
      </div>
    </main>
  );
}
