'use client';

import { CheckCircle2, AlertCircle, Zap, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SystemHealthBarProps {
  isConnected: boolean;
  activeAutomations: number;
  creditsRemaining: number;
  lastActivityTime?: Date;
}

export function SystemHealthBar({
  isConnected,
  activeAutomations,
  creditsRemaining,
  lastActivityTime,
}: SystemHealthBarProps) {
  const isHealthy =
    isConnected && activeAutomations > 0 && creditsRemaining > 10;
  const needsAttention =
    !isConnected || activeAutomations === 0 || creditsRemaining <= 10;

  const getLastActivityText = () => {
    if (!lastActivityTime) return 'No activity yet';
    const diff = Date.now() - lastActivityTime.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Active just now';
    if (minutes < 60) return `Active ${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Active ${hours}h ago`;
    return `Active ${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div
      className={cn(
        'rounded-lg border px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 transition-colors',
        isHealthy
          ? 'bg-success/5 border-success/20'
          : needsAttention
            ? 'bg-warning/5 border-warning/20'
            : 'bg-card border-border'
      )}
    >
      {/* Status indicator */}
      <div className='flex items-center gap-2'>
        {isHealthy ? (
          <CheckCircle2 className='h-5 w-5 text-success' />
        ) : (
          <AlertCircle className='h-5 w-5 text-warning' />
        )}
        <span className='font-medium text-sm'>
          {isHealthy
            ? 'Everything is working'
            : needsAttention
              ? 'Needs attention'
              : 'System status'}
        </span>
      </div>

      {/* Divider - hidden on mobile */}
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
            {activeAutomations}{' '}
            {activeAutomations === 1 ? 'automation' : 'automations'} active
          </span>
        </div>

        {/* Credits */}
        <div className='flex items-center gap-1.5'>
          <Zap className='h-3.5 w-3.5' />
          <span>{creditsRemaining} credits left</span>
        </div>

        {/* Last activity */}
        <div className='flex items-center gap-1.5 text-muted-foreground/70'>
          <span>{getLastActivityText()}</span>
        </div>
      </div>
    </div>
  );
}
