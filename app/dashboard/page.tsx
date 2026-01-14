'use client';

import { useState, useEffect } from 'react';
import { SystemHealthBar } from '@/components/dashboard/system-health-bar';
import { LiveActivityFeed } from '@/components/dashboard/live-activity-feed';
import { AutomationSummary } from '@/components/dashboard/automation-summary';
import { QuickInsights } from '@/components/dashboard/quick-insights';
import { dashboardApi } from '@/lib/api/dashboard';
import type {
  Automation,
  Activity,
  ConnectedAccount,
} from '@/lib/types/dashboard';

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);

  const [connectedAccount, setConnectedAccount] =
    useState<ConnectedAccount | null>(null);
  const [credits, setCredits] = useState({
    remaining: 0,
    total: 500,
    estimatedReplies: 0,
  });
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [todayReplies, setTodayReplies] = useState(0);
  const [weeklyGrowth, setWeeklyGrowth] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await dashboardApi.getStats();
        const data = response.data;

        if (data.connected_account) {
          setConnectedAccount({
            id: 'instagram_1',
            platform: 'instagram',
            username: data.connected_account.username,
            isConnected: data.connected_account.status === 'connected',
            lastSync: new Date(data.connected_account.last_sync),
            profilePicture: data.connected_account.avatar_url,
          });
        }

        setCredits({
          remaining: data.overview.credits_remaining,
          total: 500, // Placeholder
          estimatedReplies: data.overview.credits_remaining,
        });

        setTodayReplies(data.overview.credits_used_today);
        setWeeklyGrowth(data.overview.weekly_growth);

        setAutomations(
          data.automations.map(a => ({
            id: a.id,
            name: a.name,
            trigger: a.trigger as Automation['trigger'],
            action: a.action as Automation['action'],
            triggers: a.triggers,
            actions: a.actions,
            status: a.status === 'active' ? 'running' : 'paused',
            creditCost: a.credit_cost,
            handledCount: a.handled_count,
            lastRun: new Date(a.last_active),
            createdAt: new Date(a.created_at),
          }))
        );

        setActivities(
          data.recent_activity.map(a => ({
            id: a.id,
            type:
              a.status === 'failed'
                ? 'error'
                : a.status === 'skipped'
                  ? 'skipped'
                  : 'reply_sent',
            automationName: a.automation_name,
            description: a.description,
            creditCost: a.credits_used,
            timestamp: new Date(a.timestamp),
            metadata: a.metadata,
          }))
        );
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const activeAutomationCount = automations.filter(
    a => a.status === 'running'
  ).length;
  const lastActivity = activities[0]?.timestamp;

  const handleToggleAutomation = async (id: string) => {
    // TODO: Implement toggle API call
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

  if (isLoading) {
    return (
      <main className='p-6 lg:p-8 flex items-center justify-center min-h-[50vh]'>
        <div className='text-muted-foreground'>Loading dashboard...</div>
      </main>
    );
  }

  return (
    <main className='p-4 sm:p-6 lg:p-8 space-y-6'>
      {/* System Health Bar - Instant reassurance */}
      <SystemHealthBar
        isConnected={connectedAccount?.isConnected ?? false}
        activeAutomations={activeAutomationCount}
        creditsRemaining={credits.remaining}
        lastActivityTime={lastActivity}
      />

      {/* Quick Insights - Key metrics at a glance */}
      <QuickInsights
        credits={credits}
        todayReplies={todayReplies}
        weeklyGrowth={weeklyGrowth}
      />

      {/* Main content grid */}
      <div className='grid gap-6 lg:grid-cols-5'>
        {/* Live Activity Feed - Primary focus (takes more space) */}
        <div className='lg:col-span-3'>
          <LiveActivityFeed
            activities={activities}
            maxItems={8}
            hasAutomations={automations.length > 0}
          />
        </div>

        {/* Automation Summary - Secondary */}
        <div className='lg:col-span-2'>
          <AutomationSummary
            automations={automations}
            onToggle={handleToggleAutomation}
          />
        </div>
      </div>
    </main>
  );
}
