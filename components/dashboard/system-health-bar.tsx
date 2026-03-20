'use client';

import { CheckCircle2, AlertCircle, XCircle, Zap, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DashboardHealth } from '@/lib/api/dashboard';

interface SystemHealthBarProps {
  health?: DashboardHealth;
  // Legacy props for backward compat when health endpoint isn't loaded yet
  isConnected?: boolean;
  activeAutomations?: number;
  creditsRemaining?: number;
  lastActivityTime?: Date;
}

function getLastActivityText(dateStr: string | null | undefined): string {
  if (!dateStr) return 'No activity yet';
  const date = new Date(dateStr);
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Active just now';
  if (minutes < 60) return `Active ${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Active ${hours}h ago`;
  return `Active ${Math.floor(hours / 24)}d ago`;
}

export function SystemHealthBar({
  health,
  isConnected: legacyConnected,
  activeAutomations: legacyActive,
  creditsRemaining: legacyCredits,
  lastActivityTime,
}: SystemHealthBarProps) {
  // Prefer health endpoint data if available, fall back to legacy props
  const status = health?.status ?? (legacyConnected && (legacyActive ?? 0) > 0 && (legacyCredits ?? 0) > 10 ? 'healthy' : 'warning');
  const statusMessage = health?.status_message ?? (status === 'healthy' ? 'Everything is working' : 'Needs attention');
  const isConnected = health?.is_connected ?? legacyConnected ?? false;
  const activeCount = health?.active_automations ?? legacyActive ?? 0;
  const creditsLeft = health?.credits_remaining ?? legacyCredits ?? 0;
  const burnRate = health?.burn_rate_daily;
  const lastActivityStr = health?.last_activity_at ?? lastActivityTime?.toISOString();

  return (
    <div
      className={cn(
        'rounded-lg border px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 transition-colors',
        status === 'healthy'
          ? 'bg-success/5 border-success/20'
          : status === 'warning'
            ? 'bg-warning/5 border-warning/20'
            : 'bg-destructive/5 border-destructive/20'
      )}
    >
      {/* Status indicator with animated pulse */}
      <div className='flex items-center gap-2'>
        {/* Animated dot */}
        <div className='relative flex items-center justify-center h-5 w-5'>
          {status === 'healthy' ? (
            <>
              <span className='absolute inline-flex h-3 w-3 rounded-full bg-success opacity-75 animate-ping' />
              <span className='relative inline-flex h-2 w-2 rounded-full bg-success' />
            </>
          ) : status === 'warning' ? (
            <AlertCircle className='h-5 w-5 text-warning' />
          ) : (
            <XCircle className='h-5 w-5 text-destructive' />
          )}
        </div>
        <span className='font-medium text-sm'>{statusMessage}</span>
      </div>

      {/* Divider */}
      <div className='hidden sm:block h-4 w-px bg-border' />

      {/* Stats */}
      <div className='flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-muted-foreground'>
        {/* Connection status */}
        <div className='flex items-center gap-1.5'>
          <div
            className={cn(
              'h-2 w-2 rounded-full',
              isConnected ? 'bg-success' : 'bg-muted-foreground'
            )}
          />
          <span>{isConnected ? 'Connected' : 'Not connected'}</span>
        </div>

        {/* Active automations */}
        <div className='flex items-center gap-1.5'>
          <Activity className='h-3.5 w-3.5' />
          <span>
            {activeCount} {activeCount === 1 ? 'automation' : 'automations'} active
          </span>
        </div>

        {/* Credits with burn rate */}
        <div className='flex items-center gap-1.5'>
          <Zap className='h-3.5 w-3.5' />
          <span>
            {creditsLeft} credits
            {burnRate !== undefined && burnRate > 0
              ? ` · ~${burnRate}/day`
              : ''}
          </span>
        </div>

        {/* Last activity */}
        <div className='flex items-center gap-1.5 text-muted-foreground/70'>
          <span>{getLastActivityText(lastActivityStr)}</span>
        </div>
      </div>
    </div>
  );
}
