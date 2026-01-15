'use client';

import { useState, useEffect } from 'react';
import { SystemHealthBar } from '@/components/dashboard/system-health-bar';
import { AutomationSummary } from '@/components/dashboard/automation-summary';
import { QuickInsights } from '@/components/dashboard/quick-insights';
import { dashboardApi } from '@/lib/api/dashboard';
import { notificationsApi } from '@/lib/api/notifications';
import type { Automation, ConnectedAccount } from '@/lib/types/dashboard';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import type { Notification } from '@/lib/types/notifications';

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
  const [todayReplies, setTodayReplies] = useState(0);
  const [weeklyGrowth, setWeeklyGrowth] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const dashboardResponse = await dashboardApi.getStats();
        const data = dashboardResponse.data;

        // Cast recent_activity to Notification[] since the backend now returns notifications
        setNotifications(data.recent_activity as unknown as Notification[]);

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
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead({ notification_ids: [id] });
      setNotifications(prev =>
        prev.map(n =>
          n.id === id
            ? {
                ...n,
                status: 'read' as const,
                read_at: new Date().toISOString(),
              }
            : n
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications(prev =>
        prev.map(n =>
          n.status === 'unread'
            ? {
                ...n,
                status: 'read' as const,
                read_at: new Date().toISOString(),
              }
            : n
        )
      );
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const activeAutomationCount = automations.filter(
    a => a.status === 'running'
  ).length;
  const lastActivity = notifications[0]?.created_at
    ? new Date(notifications[0].created_at)
    : undefined;

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
          <RecentActivity
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
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
