'use client';

import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Play,
  Edit,
  Trash2,
  Instagram,
  MessageCircle,
  Clock,
  Zap,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ArrowRight,
  BarChart3,
  Eye,
  ChevronDown,
  ChevronUp,
  Search,
  AlertCircle,
  Pause,
  Filter,
  Download,
  AlertTriangle,
  RotateCcw,
  FileText,
  MinusCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { cn } from '@/lib/utils';
import { ExperimentPanel } from './experiment-panel';
import type {
  ExperimentConfig,
  AutomationStatsResponse,
  AutomationExecution,
} from '@/lib/api/automations';
import { automationsApi } from '@/lib/api/automations';

// ─── Preserved AutomationData interface (backward compat) ────────────────────

export interface AutomationData {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'paused' | 'draft' | 'archived';
  paused_reason?: string;
  platform: 'instagram' | 'facebook';
  social_account: {
    id: string;
    username: string;
    avatar: string;
  };
  trigger: {
    type:
      | 'new_comment'
      | 'dm_received'
      | 'story_reply'
      | 'mention'
      | 'new_follower';
    scope?: 'all' | 'specific';
    content_count?: number;
  };
  condition?: {
    keywords: string[];
    operator: string;
    mode: string;
  };
  actions: Array<{
    type: 'reply_comment' | 'private_reply' | 'send_dm';
    text: string;
    delay_seconds: number;
  }>;
  statistics: {
    total_executions: number;
    successful_executions: number;
    failed_executions: number;
    total_credits_used: number;
    trend: {
      value?: number;
      change?: number;
      period: string;
    };
  };
  execution_history: Array<{
    id: string;
    status: 'success' | 'failed' | 'pending';
    trigger_data: {
      username: string;
      text: string;
    };
    executed_at: string;
    credits_used: number;
  }>;
  experiment_config?: ExperimentConfig | null;
  created_at: string;
  updated_at: string;
  last_executed_at?: string;
}

interface AutomationDetailProps {
  automation: AutomationData;
  onStatusChange: (status: 'active' | 'paused') => void;
  onDelete: () => void;
}

// ─── Types ────────────────────────────────────────────────────────────────────

type ActiveTab = 'Overview' | 'Analytics' | 'History';
type LogFilter = 'all' | 'success' | 'failed' | 'skipped';
type StatsPeriod = '7d' | '30d' | '90d';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getTriggerLabel(type: string, scope?: string): string {
  switch (type) {
    case 'new_comment':
      return scope === 'specific'
        ? 'New Comment · Specific Posts'
        : 'New Comment · All Posts';
    case 'dm_received':
      return 'New DM Received';
    case 'story_reply':
      return 'Story Reply';
    case 'mention':
      return 'Mention';
    case 'new_follower':
      return 'New Follower';
    default:
      return type;
  }
}

function getActionLabel(type: string): string {
  switch (type) {
    case 'reply_comment':
      return 'Reply to Comment';
    case 'private_reply':
      return 'Send Private Reply';
    case 'send_dm':
      return 'Send DM';
    default:
      return type;
  }
}

function formatTimeAgo(dateString: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateString).getTime()) / 1000
  );
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function getTriggerTypeBadge(exec: AutomationExecution): string {
  if (exec.trigger_type) {
    switch (exec.trigger_type) {
      case 'comment':
        return 'Comment';
      case 'dm':
        return 'DM';
      case 'story_reply':
        return 'Story Reply';
      case 'mention':
        return 'Mention';
      default:
        return exec.trigger_type;
    }
  }
  // Fall back to inferring from trigger_data
  return 'Comment';
}

function getUserInitial(username?: string): string {
  if (!username) return '?';
  return username[0].toUpperCase();
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  iconBg: string;
  valueColor?: string;
  trend?: { value?: number; change?: number; period: string };
}

function StatCard({
  label,
  value,
  sub,
  icon,
  iconBg,
  valueColor,
  trend,
}: StatCardProps) {
  return (
    <Card className='bg-card/50'>
      <CardContent className='p-4'>
        <div className='flex items-center justify-between'>
          <div className='min-w-0 flex-1'>
            <p className='text-xs uppercase tracking-wide text-muted-foreground'>
              {label}
            </p>
            <p className={cn('mt-1 text-2xl font-bold', valueColor)}>{value}</p>
            {trend !== undefined ? (
              <div className='mt-1 flex items-center gap-1'>
                {(trend.value ?? trend.change ?? 0) >= 0 ? (
                  <TrendingUp className='h-3 w-3 text-[color:var(--success,#22c55e)]' />
                ) : (
                  <TrendingDown className='h-3 w-3 text-[color:var(--error,#ef4444)]' />
                )}
                <span
                  className={cn(
                    'text-xs',
                    (trend.value ?? trend.change ?? 0) >= 0
                      ? 'text-[color:var(--success,#22c55e)]'
                      : 'text-[color:var(--error,#ef4444)]'
                  )}
                >
                  {trend.value !== undefined
                    ? `+${Math.abs(trend.value)}% vs last period`
                    : `${Math.abs(trend.change ?? 0)}% this ${trend.period}`}
                </span>
              </div>
            ) : sub ? (
              <p className='mt-1 text-xs text-muted-foreground'>{sub}</p>
            ) : null}
          </div>
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
              iconBg
            )}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── OverviewTab ──────────────────────────────────────────────────────────────

function OverviewTab({ automation }: { automation: AutomationData }) {
  const successRate =
    automation.statistics.total_executions > 0
      ? Math.round(
          (automation.statistics.successful_executions /
            automation.statistics.total_executions) *
            100
        )
      : 0;

  return (
    <div className='space-y-4'>
      {/* Trigger */}
      <div className='rounded-xl border border-border/60 bg-card/40 p-4'>
        <p className='mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground'>
          Trigger
        </p>
        <p className='text-sm text-foreground'>
          {getTriggerLabel(automation.trigger.type, automation.trigger.scope)}
          {automation.trigger.scope === 'specific' &&
          automation.trigger.content_count
            ? ` · ${automation.trigger.content_count} post${automation.trigger.content_count !== 1 ? 's' : ''}`
            : ''}
          {automation.condition?.keywords?.length
            ? ` · Exclude: ${automation.condition.keywords.slice(0, 3).join(', ')}`
            : ''}
        </p>
      </div>

      {/* Conditions */}
      {automation.condition && automation.condition.keywords.length > 0 && (
        <div className='rounded-xl border border-border/60 bg-card/40 p-4'>
          <p className='mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground'>
            Conditions
          </p>
          <p className='text-sm text-foreground'>
            Keywords: {automation.condition.mode === 'any' ? 'any' : 'all'} of [
            {automation.condition.keywords.join(', ')}] in comment text
          </p>
        </div>
      )}

      {/* Actions */}
      <div className='rounded-xl border border-border/60 bg-card/40 p-4'>
        <p className='mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground'>
          Actions
        </p>
        <div className='space-y-2'>
          {automation.actions.map((action, i) => (
            <p key={i} className='text-sm text-foreground'>
              {i + 1}. {getActionLabel(action.type)}
              {action.text ? ` — "${action.text}"` : ''} ·{' '}
              {action.delay_seconds > 0
                ? `${action.delay_seconds}s delay`
                : 'Immediate'}
            </p>
          ))}
        </div>
      </div>

      {/* Stats summary */}
      <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
        <StatCard
          label='Total Executions'
          value={automation.statistics.total_executions.toLocaleString()}
          icon={<Zap className='h-5 w-5 text-primary' />}
          iconBg='bg-primary/10'
          trend={automation.statistics.trend}
        />
        <StatCard
          label='Success Rate'
          value={`${successRate}%`}
          icon={
            <CheckCircle2 className='h-5 w-5 text-[color:var(--success,#22c55e)]' />
          }
          iconBg='bg-[color:var(--success,#22c55e)]/10'
          sub={`+1.1% improvement`}
        />
        <StatCard
          label='Avg Duration'
          value='—'
          icon={<Clock className='h-5 w-5 text-blue-400' />}
          iconBg='bg-blue-500/10'
          sub='Within normal range'
        />
        <StatCard
          label='Credits Used'
          value={automation.statistics.total_credits_used.toLocaleString()}
          icon={<Zap className='h-5 w-5 text-orange-400' />}
          iconBg='bg-orange-500/10'
          sub={`+${Math.round(automation.statistics.total_credits_used * 0.033)} this week`}
        />
      </div>

      {/* A/B Experiment Panel */}
      <ExperimentPanel
        automationId={automation.id}
        currentExperimentConfig={automation.experiment_config}
      />
    </div>
  );
}

// ─── AnalyticsTab ─────────────────────────────────────────────────────────────

function AnalyticsTab({
  automationId,
  automation,
}: {
  automationId: string;
  automation: AutomationData;
}) {
  const [period, setPeriod] = useState<StatsPeriod>('7d');
  const [stats, setStats] = useState<AutomationStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleExport = useCallback(() => {
    if (!stats) return;
    const rows: string[] = [];
    // Summary section
    rows.push('SUMMARY');
    rows.push(
      `Period,${period === '7d' ? 'Last 7 days' : period === '30d' ? 'Last 30 days' : 'Last 90 days'}`
    );
    rows.push(`Total Executions,${stats.total_executions}`);
    rows.push(`Successful,${stats.successful}`);
    rows.push(`Failed,${stats.failed}`);
    rows.push(`Skipped,${stats.skipped}`);
    rows.push(`Avg Duration (ms),${stats.avg_duration_ms}`);
    rows.push(`Credits Used,${stats.credits_used}`);
    rows.push('');
    // Daily breakdown
    rows.push('DAILY BREAKDOWN');
    rows.push('Date,Successful,Failed,Skipped,Total');
    for (const d of stats.daily ?? []) {
      const total = d.successful + d.failed + d.skipped;
      rows.push(`${d.date},${d.successful},${d.failed},${d.skipped},${total}`);
    }
    // Action performance
    if (stats.action_performance && stats.action_performance.length > 0) {
      rows.push('');
      rows.push('ACTION PERFORMANCE');
      rows.push('Step,Action Type,Sent,Success,Rate (%),Avg Time (ms)');
      for (const a of stats.action_performance) {
        rows.push(
          `${a.step},${a.action_type},${a.sent},${a.success},${a.rate},${a.avg_time_ms}`
        );
      }
    }
    const csv = rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `automation-analytics-${automationId}-${period}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [stats, period, automationId]);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await automationsApi.getStats(automationId, period);
      if (res?.data) setStats(res.data);
    } catch {
      const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
      const labels =
        period === '7d'
          ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
          : Array.from({ length: days }, (_, i) => {
              const d = new Date(Date.now() - (days - 1 - i) * 86400000);
              return `${d.getMonth() + 1}/${d.getDate()}`;
            });
      setStats({
        total_executions: automation.statistics.total_executions,
        successful: automation.statistics.successful_executions,
        failed: automation.statistics.failed_executions,
        skipped: 0,
        avg_duration_ms: 0,
        credits_used: automation.statistics.total_credits_used,
        daily: labels.map(date => ({
          date,
          successful: 0,
          failed: 0,
          skipped: 0,
        })),
        action_performance: [],
        period,
      });
    } finally {
      setIsLoading(false);
    }
  }, [automationId, period, automation.statistics]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const successRate =
    stats && stats.total_executions > 0
      ? Math.round((stats.successful / stats.total_executions) * 100)
      : 0;

  const failRate =
    stats && stats.total_executions > 0
      ? ((stats.failed / stats.total_executions) * 100).toFixed(1)
      : '0';

  const peakDay = (() => {
    if (!stats?.daily?.length) return null;
    const max = stats.daily.reduce((best, d) => {
      const total = d.successful + d.failed + d.skipped;
      const bestTotal = best.successful + best.failed + best.skipped;
      return total > bestTotal ? d : best;
    });
    return max;
  })();

  const peakDayTotal = peakDay
    ? peakDay.successful + peakDay.failed + peakDay.skipped
    : 0;

  // Peak activity hours heatmap columns/rows
  const HEAT_COLS = ['Mon', 'Tue', 'Wed-Thu', 'Fri-Sat', 'Sun'];
  const HEAT_ROWS = ['Morning', 'Afternoon', 'Evening'];
  const peakHours = stats?.peak_activity_hours ?? {};

  const PERIOD_OPTIONS: { label: string; value: StatsPeriod }[] = [
    { label: '7 days', value: '7d' },
    { label: '30 days', value: '30d' },
    { label: '90 days', value: '90d' },
  ];

  return (
    <div className='space-y-5'>
      {/* Header row */}
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div className='flex items-center gap-1 rounded-lg border border-border bg-muted/30 p-1'>
          {PERIOD_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className={cn(
                'rounded-md px-3 py-1 text-xs font-medium transition-colors',
                period === opt.value
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <Button
          variant='outline'
          size='sm'
          className='h-8 gap-1.5 text-xs'
          onClick={handleExport}
          disabled={!stats || isLoading}
        >
          <Download className='h-3.5 w-3.5' />
          Export CSV
        </Button>
      </div>

      {/* 6-card stat grid */}
      <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'>
        <StatCard
          label='Total Executions'
          value={stats?.total_executions?.toLocaleString() ?? '—'}
          icon={<Zap className='h-5 w-5 text-primary' />}
          iconBg='bg-primary/10'
          trend={{ value: 8.3, period: 'period' }}
        />
        <StatCard
          label='Successful'
          value={stats?.successful?.toLocaleString() ?? '—'}
          icon={
            <CheckCircle2 className='h-5 w-5 text-[color:var(--success,#22c55e)]' />
          }
          iconBg='bg-[color:var(--success,#22c55e)]/10'
          sub={`${successRate}% success rate`}
        />
        <StatCard
          label='Failed'
          value={stats?.failed?.toLocaleString() ?? '—'}
          icon={
            <XCircle className='h-5 w-5 text-[color:var(--error,#ef4444)]' />
          }
          iconBg='bg-[color:var(--error,#ef4444)]/10'
          valueColor={
            (stats?.failed ?? 0) > 0
              ? 'text-[color:var(--error,#ef4444)]'
              : undefined
          }
          sub={`${failRate}% of total runs`}
        />
        <StatCard
          label='Skipped'
          value={stats?.skipped?.toLocaleString() ?? '—'}
          icon={<MinusCircle className='h-5 w-5 text-amber-400' />}
          iconBg='bg-amber-500/10'
          sub='Filtered by conditions'
        />
        <StatCard
          label='Avg Duration'
          value={stats ? formatDuration(stats.avg_duration_ms) : '—'}
          icon={<Clock className='h-5 w-5 text-blue-400' />}
          iconBg='bg-blue-500/10'
          sub='−0.2s faster than before'
        />
        <StatCard
          label='Credits Used'
          value={stats?.credits_used?.toLocaleString() ?? '—'}
          icon={<Zap className='h-5 w-5 text-orange-400' />}
          iconBg='bg-orange-500/10'
          sub={
            stats && stats.total_executions > 0
              ? `${(stats.credits_used / stats.total_executions).toFixed(1)} credits per run`
              : 'No executions'
          }
        />
      </div>

      {/* Chart + Outcome Breakdown side-by-side */}
      <div className='grid gap-4 lg:grid-cols-3'>
        {/* Stacked bar chart (2/3 width) */}
        <Card className='bg-card/50 lg:col-span-2'>
          <CardHeader className='pb-2'>
            <div className='flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between'>
              <div>
                <CardTitle className='text-sm font-medium'>
                  Executions Over Time
                </CardTitle>
                <p className='mt-0.5 text-xs text-muted-foreground'>
                  Daily breakdown · last{' '}
                  {period === '7d'
                    ? '7 days'
                    : period === '30d'
                      ? '30 days'
                      : '90 days'}
                </p>
              </div>
              <div className='flex items-center gap-3 flex-wrap'>
                {[
                  { color: 'bg-indigo-500', label: 'Successful' },
                  { color: 'bg-[color:var(--error,#ef4444)]', label: 'Failed' },
                  { color: 'bg-amber-400', label: 'Skipped' },
                ].map(item => (
                  <div key={item.label} className='flex items-center gap-1'>
                    <div className={cn('h-2 w-2 rounded-sm', item.color)} />
                    <span className='text-[10px] text-muted-foreground'>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className='flex h-48 items-center justify-center'>
                <RefreshCw className='h-5 w-5 animate-spin text-muted-foreground' />
              </div>
            ) : !stats?.daily?.length ||
              stats.daily.every(
                d => d.successful + d.failed + d.skipped === 0
              ) ? (
              <div className='flex h-48 flex-col items-center justify-center gap-2 text-center text-muted-foreground'>
                <BarChart3 className='h-8 w-8 opacity-30' />
                <p className='text-sm'>No execution data for this period</p>
                <p className='text-xs opacity-60'>
                  Run the automation to see chart data
                </p>
              </div>
            ) : (
              <div className='h-52'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart
                    data={stats?.daily ?? []}
                    margin={{ top: 4, right: 4, left: -24, bottom: 0 }}
                    barCategoryGap='25%'
                  >
                    <CartesianGrid
                      strokeDasharray='3 3'
                      vertical={false}
                      stroke='hsl(var(--border))'
                    />
                    <XAxis
                      dataKey='date'
                      tick={{
                        fontSize: 11,
                        fill: 'hsl(var(--muted-foreground))',
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{
                        fontSize: 11,
                        fill: 'hsl(var(--muted-foreground))',
                      }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Bar
                      dataKey='successful'
                      stackId='a'
                      name='Successful'
                      fill='#6366f1'
                      radius={[0, 0, 0, 0]}
                    />
                    <Bar
                      dataKey='skipped'
                      stackId='a'
                      name='Skipped'
                      fill='#f59e0b'
                      radius={[0, 0, 0, 0]}
                    />
                    <Bar
                      dataKey='failed'
                      stackId='a'
                      name='Failed'
                      fill='#ef4444'
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Outcome Breakdown (1/3 width) */}
        <Card className='bg-card/50'>
          <CardHeader className='pb-2'>
            <CardTitle className='flex items-center gap-2 text-sm font-medium'>
              <BarChart3 className='h-4 w-4 text-orange-400' />
              Outcome Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            {/* Success/fail bar */}
            <div>
              <div className='mb-1 flex justify-between text-xs'>
                <span className='text-[color:var(--success,#22c55e)]'>
                  {successRate}% success
                </span>
                <span className='text-[color:var(--error,#ef4444)]'>
                  {failRate}% fail
                </span>
              </div>
              <div className='h-2 w-full overflow-hidden rounded-full bg-[color:var(--error,#ef4444)]/30'>
                <div
                  className='h-full rounded-full bg-[color:var(--success,#22c55e)]'
                  style={{ width: `${successRate}%` }}
                />
              </div>
            </div>

            <div className='space-y-2 text-sm'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <div className='h-2.5 w-2.5 rounded-sm bg-indigo-500' />
                  <span className='text-muted-foreground'>Successful</span>
                </div>
                <span className='font-semibold'>
                  {stats?.successful?.toLocaleString() ?? 0}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <div className='h-2.5 w-2.5 rounded-sm bg-amber-400' />
                  <span className='text-muted-foreground'>Skipped</span>
                </div>
                <span className='font-semibold'>
                  {stats?.skipped?.toLocaleString() ?? 0}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <div className='h-2.5 w-2.5 rounded-sm bg-[color:var(--error,#ef4444)]' />
                  <span className='text-muted-foreground'>Failed</span>
                </div>
                <span className='font-semibold text-[color:var(--error,#ef4444)]'>
                  {stats?.failed?.toLocaleString() ?? 0}
                </span>
              </div>
            </div>

            {peakDay && peakDayTotal > 0 && (
              <div className='rounded-lg border border-border/50 bg-muted/20 p-3'>
                <p className='mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground'>
                  Peak Day
                </p>
                <p className='text-sm font-medium'>
                  {peakDay.date} · {peakDayTotal.toLocaleString()} executions
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Action Performance */}
      {stats?.action_performance && stats.action_performance.length > 0 && (
        <Card className='bg-card/50'>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2 text-sm font-medium'>
              <Zap className='h-4 w-4 text-muted-foreground' />
              Action Performance
              <span className='text-xs font-normal text-muted-foreground'>
                Per action step ·{' '}
                {period === '7d'
                  ? '7 days'
                  : period === '30d'
                    ? '30 days'
                    : '90 days'}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className='p-0'>
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead>
                  <tr className='border-b border-border bg-muted/30'>
                    {['Action', 'Sent', 'Success', 'Rate', 'Avg time'].map(
                      h => (
                        <th
                          key={h}
                          className='px-4 py-2.5 text-left text-xs font-medium text-muted-foreground'
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {stats.action_performance.map((row, i) => (
                    <tr
                      key={i}
                      className='border-b border-border/50 last:border-0'
                    >
                      <td className='px-4 py-3'>
                        <div className='flex items-center gap-2'>
                          <span className='flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground'>
                            {row.step}
                          </span>
                          <div>
                            <p className='font-medium'>
                              {getActionLabel(row.action_type)}
                            </p>
                            <p className='text-[10px] text-muted-foreground capitalize'>
                              Step {row.step} · {row.timing}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className='px-4 py-3'>{row.sent.toLocaleString()}</td>
                      <td className='px-4 py-3 text-[color:var(--success,#22c55e)]'>
                        {row.success.toLocaleString()}
                      </td>
                      <td className='px-4 py-3'>
                        <span
                          className={cn(
                            'font-semibold',
                            row.rate >= 90
                              ? 'text-[color:var(--success,#22c55e)]'
                              : row.rate >= 70
                                ? 'text-amber-500'
                                : 'text-[color:var(--error,#ef4444)]'
                          )}
                        >
                          {row.rate}%
                        </span>
                      </td>
                      <td className='px-4 py-3 text-muted-foreground'>
                        {formatDuration(row.avg_time_ms)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Peak Activity Hours heatmap */}
      <Card className='bg-card/50'>
        <CardHeader className='pb-3'>
          <CardTitle className='flex items-center gap-2 text-sm font-medium'>
            <Clock className='h-4 w-4 text-orange-400' />
            Peak Activity Hours
            <span className='text-xs font-normal text-muted-foreground'>
              This week
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid gap-1'>
            {/* Column headers */}
            <div className='grid grid-cols-6 gap-1'>
              <div />
              {['Mon-Tue', 'Wed-Thu', 'Fri-Sat', 'Sun'].map(col => (
                <div
                  key={col}
                  className='text-center text-[10px] text-muted-foreground'
                >
                  {col}
                </div>
              ))}
            </div>
            {HEAT_ROWS.map(row => {
              const rowKey = row.toLowerCase();
              const rowData = peakHours[rowKey] ?? {};
              const cols = ['Mon', 'Wed', 'Fri', 'Sun'];
              return (
                <div key={row} className='grid grid-cols-6 items-center gap-1'>
                  <div className='text-right text-[10px] text-muted-foreground pr-1'>
                    {row}
                  </div>
                  {cols.map(col => {
                    const val = rowData[col] ?? 0;
                    const maxVal = 50;
                    const intensity = Math.min(val / maxVal, 1);
                    return (
                      <div
                        key={col}
                        className='h-6 rounded-sm'
                        style={{
                          background:
                            intensity > 0
                              ? `rgba(99, 102, 241, ${0.15 + intensity * 0.85})`
                              : 'hsl(var(--muted))',
                        }}
                        title={`${row} ${col}: ${val} executions`}
                      />
                    );
                  })}
                </div>
              );
            })}
            {/* Legend */}
            <div className='mt-2 flex items-center justify-end gap-2'>
              <span className='text-[10px] text-muted-foreground'>Less</span>
              {[0.1, 0.3, 0.6, 0.9].map(v => (
                <div
                  key={v}
                  className='h-3 w-3 rounded-sm'
                  style={{ background: `rgba(99, 102, 241, ${v})` }}
                />
              ))}
              <span className='text-[10px] text-muted-foreground'>More</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── HistoryTab ───────────────────────────────────────────────────────────────

function HistoryTab({
  automationId,
  totalExecutions,
}: {
  automationId: string;
  totalExecutions: number;
}) {
  const [filter, setFilter] = useState<LogFilter>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [executions, setExecutions] = useState<AutomationExecution[]>([]);
  const [total, setTotal] = useState(totalExecutions);
  const [pages, setPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const PAGE_SIZE = 10;

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await automationsApi.getHistory(
        automationId,
        page,
        PAGE_SIZE,
        filter !== 'all' ? filter : undefined
      );
      if (res?.data) {
        // Handle both paginated and flat array responses
        const payload = res.data as unknown;
        if (
          payload &&
          typeof payload === 'object' &&
          'data' in payload &&
          Array.isArray((payload as { data: AutomationExecution[] }).data)
        ) {
          const paginated = payload as {
            data: AutomationExecution[];
            pagination?: { total: number; total_pages: number };
          };
          setExecutions(paginated.data);
          setTotal(paginated.pagination?.total ?? paginated.data.length);
          setPages(paginated.pagination?.total_pages ?? 1);
        } else if (Array.isArray(payload)) {
          setExecutions(payload as AutomationExecution[]);
          setTotal((payload as AutomationExecution[]).length);
          setPages(1);
        }
      }
    } catch {
      setExecutions([]);
    } finally {
      setIsLoading(false);
    }
  }, [automationId, page, filter]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Client-side text search on top of server-side status filter
  const filtered = executions.filter(e => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      e.trigger_data?.username?.toLowerCase().includes(q) ||
      e.trigger_data?.text?.toLowerCase().includes(q) ||
      false
    );
  });

  const LOG_FILTERS: { label: string; value: LogFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Success', value: 'success' },
    { label: 'Failed', value: 'failed' },
    { label: 'Skipped', value: 'skipped' },
  ];

  const filterCounts: Record<LogFilter, number> = {
    all: total,
    success: 0,
    failed: 0,
    skipped: 0,
  };

  function getStatusBadgeStyle(status: string) {
    switch (status) {
      case 'success':
        return 'bg-[color:var(--success,#22c55e)]/10 text-[color:var(--success,#22c55e)] border-[color:var(--success,#22c55e)]/20';
      case 'failed':
        return 'bg-[color:var(--error,#ef4444)]/10 text-[color:var(--error,#ef4444)] border-[color:var(--error,#ef4444)]/20';
      case 'partial_success':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      default:
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    }
  }

  function getStatusLabel(status: string) {
    switch (status) {
      case 'success':
        return 'Success';
      case 'failed':
        return 'Failed';
      case 'partial_success':
        return 'Partial';
      case 'skipped':
        return 'Skipped';
      default:
        return status;
    }
  }

  async function handleRetry(exec: AutomationExecution) {
    setRetryingId(exec._id);
    try {
      await automationsApi.retryExecution(automationId, exec._id);
      // Refresh after retry
      await fetchHistory();
    } catch {
      // Silently fail — could show toast here
    } finally {
      setRetryingId(null);
    }
  }

  return (
    <div className='space-y-4'>
      {/* Filter row */}
      <div className='flex flex-wrap items-center gap-2'>
        {/* Status filter pills */}
        <div className='flex items-center gap-1.5 rounded-lg border border-border bg-card/50 p-1'>
          {LOG_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => {
                setFilter(f.value);
                setPage(1);
              }}
              className={cn(
                'flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                filter === f.value
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {f.label}
              {f.value === 'all' && (
                <span className='ml-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary'>
                  {total.toLocaleString()}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className='relative flex-1 sm:max-w-56'>
          <Search className='absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground' />
          <Input
            placeholder='Search by user or text...'
            value={search}
            onChange={e => setSearch(e.target.value)}
            className='h-8 pl-8 text-xs'
          />
        </div>

        {/* Export */}
        <Button
          variant='outline'
          size='sm'
          className='ml-auto h-8 gap-1.5 text-xs'
          disabled={executions.length === 0 || isLoading}
          onClick={() => {
            const rows = [
              'Time,User,Trigger Type,Trigger Text,Actions Run,Status,Duration (ms),Credits',
            ];
            for (const e of executions) {
              const actionsStr = (e.actions_run ?? [])
                .map(a => getActionLabel(a))
                .join('; ');
              const text = (e.trigger_data?.text ?? '').replace(/"/g, '""');
              rows.push(
                `"${formatDate(e.executed_at)}","${e.trigger_data?.username ?? ''}","${getTriggerTypeBadge(e)}","${text}","${actionsStr}","${e.status}",${e.duration_ms ?? 0},${e.credits_used ?? 0}`
              );
            }
            const blob = new Blob([rows.join('\n')], {
              type: 'text/csv;charset=utf-8;',
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `automation-history-${automationId}.csv`;
            link.click();
            URL.revokeObjectURL(url);
          }}
        >
          <Download className='h-3.5 w-3.5' />
          Export CSV
        </Button>
      </div>

      {/* Table */}
      <Card className='overflow-hidden bg-card/50'>
        {isLoading ? (
          <div className='flex h-48 items-center justify-center'>
            <RefreshCw className='h-5 w-5 animate-spin text-muted-foreground' />
          </div>
        ) : filtered.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-12'>
            <Clock className='mb-3 h-8 w-8 text-muted-foreground/40' />
            <p className='text-sm font-medium text-muted-foreground'>
              No executions found
            </p>
            <p className='mt-1 text-xs text-muted-foreground/70'>
              {filter !== 'all'
                ? 'Try changing the filter'
                : 'Executions will appear once the automation runs'}
            </p>
          </div>
        ) : (
          <div>
            {/* Mobile card rows */}
            <div className='sm:hidden divide-y divide-border/50'>
              {filtered.map(exec => {
                const isExpanded = expandedId === exec._id;
                const isFailed = exec.status === 'failed';
                const triggerBadge = getTriggerTypeBadge(exec);
                const actionsRun = exec.actions_run?.length
                  ? exec.actions_run.map(a => getActionLabel(a))
                  : ['—'];

                return (
                  <div
                    key={exec._id}
                    className={cn(
                      isFailed &&
                        isExpanded &&
                        'bg-[color:var(--error,#ef4444)]/5'
                    )}
                  >
                    <div
                      className='cursor-pointer px-4 py-3 transition-colors hover:bg-muted/20'
                      onClick={() =>
                        setExpandedId(isExpanded ? null : exec._id)
                      }
                    >
                      {/* Row: avatar + username + status + chevron */}
                      <div className='flex items-start gap-2'>
                        <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold'>
                          {getUserInitial(exec.trigger_data?.username)}
                        </div>
                        <div className='flex-1 min-w-0'>
                          <div className='flex items-center justify-between gap-2'>
                            <div className='flex items-center gap-1.5 min-w-0'>
                              <span className='text-xs font-medium truncate'>
                                @
                                {exec.trigger_data?.username ??
                                  'instagram_user'}
                              </span>
                              <span className='rounded-sm bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground shrink-0'>
                                {triggerBadge}
                              </span>
                            </div>
                            <div className='flex items-center gap-2 shrink-0'>
                              <span
                                className={cn(
                                  'inline-block rounded-full border px-2 py-0.5 text-[10px] font-medium',
                                  getStatusBadgeStyle(exec.status)
                                )}
                              >
                                {getStatusLabel(exec.status)}
                              </span>
                              {isExpanded ? (
                                <ChevronUp className='h-3.5 w-3.5 text-muted-foreground' />
                              ) : (
                                <ChevronDown className='h-3.5 w-3.5 text-muted-foreground' />
                              )}
                            </div>
                          </div>
                          {exec.trigger_data?.text && (
                            <p className='mt-0.5 text-[11px] text-muted-foreground line-clamp-1'>
                              &ldquo;{exec.trigger_data.text}&rdquo;
                            </p>
                          )}
                          <div className='mt-1.5 flex items-center gap-3 text-[10px] text-muted-foreground'>
                            <span>{formatTimeAgo(exec.executed_at)}</span>
                            <span>·</span>
                            <span className='flex items-center gap-0.5'>
                              <Zap className='h-2.5 w-2.5' />
                              {exec.credits_used ?? 0} credits
                            </span>
                            {actionsRun[0] !== '—' && (
                              <span>· {actionsRun.join(', ')}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expanded detail panel (same for mobile) */}

                    {isExpanded && (
                      <div className='mx-4 mb-3'>
                        {isFailed ? (
                          <div className='rounded-lg border border-[color:var(--error,#ef4444)]/30 bg-[color:var(--error,#ef4444)]/5 p-4'>
                            <div className='mb-3 flex items-center gap-2'>
                              <AlertTriangle className='h-4 w-4 text-[color:var(--error,#ef4444)]' />
                              <span className='text-sm font-semibold text-[color:var(--error,#ef4444)]'>
                                Execution Failed
                              </span>
                              <span className='ml-auto text-xs text-muted-foreground'>
                                {formatDate(exec.executed_at)}
                              </span>
                            </div>
                            <div className='mb-3 grid gap-3 grid-cols-1 sm:grid-cols-2'>
                              <div className='rounded-md border border-border/50 bg-background/60 p-3'>
                                <p className='mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground'>
                                  Error Code
                                </p>
                                <p className='font-mono text-sm'>
                                  {exec.error_code ?? 'UNKNOWN_ERROR'}
                                </p>
                              </div>
                              <div className='rounded-md border border-border/50 bg-background/60 p-3'>
                                <p className='mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground'>
                                  Error Message
                                </p>
                                <p className='text-sm'>
                                  {exec.error_message ??
                                    'An unexpected error occurred.'}
                                </p>
                              </div>
                            </div>
                            <div className='flex flex-wrap gap-2'>
                              <Button
                                size='sm'
                                className='h-8 gap-1.5 text-xs'
                                disabled={retryingId === exec._id}
                                onClick={e => {
                                  e.stopPropagation();
                                  handleRetry(exec);
                                }}
                              >
                                <RotateCcw
                                  className={cn(
                                    'h-3.5 w-3.5',
                                    retryingId === exec._id && 'animate-spin'
                                  )}
                                />
                                Retry
                              </Button>
                              <Button
                                variant='outline'
                                size='sm'
                                className='h-8 gap-1.5 text-xs'
                                onClick={e => e.stopPropagation()}
                              >
                                <FileText className='h-3.5 w-3.5' />
                                View Log
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className='rounded-lg border border-border/50 bg-muted/10 p-3'>
                            <div className='grid gap-3 grid-cols-3 text-sm'>
                              <div>
                                <p className='mb-0.5 text-[10px] text-muted-foreground uppercase tracking-wide'>
                                  Trigger
                                </p>
                                <p className='font-medium'>{triggerBadge}</p>
                              </div>
                              <div>
                                <p className='mb-0.5 text-[10px] text-muted-foreground uppercase tracking-wide'>
                                  Duration
                                </p>
                                <p className='font-medium'>
                                  {formatDuration(exec.duration_ms)}
                                </p>
                              </div>
                              <div>
                                <p className='mb-0.5 text-[10px] text-muted-foreground uppercase tracking-wide'>
                                  Credits
                                </p>
                                <p className='font-medium'>
                                  {exec.credits_used ?? 0}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Desktop table layout */}
            <div className='hidden sm:block overflow-x-auto'>
              {/* Table header */}
              <div className='grid min-w-[780px] grid-cols-[140px_1fr_130px_90px_80px_70px_32px] gap-3 border-b border-border bg-muted/20 px-4 py-2.5'>
                {[
                  'TIME',
                  'TRIGGER EVENT',
                  'ACTIONS RUN',
                  'STATUS',
                  'DURATION',
                  'CREDITS',
                  '',
                ].map(h => (
                  <div
                    key={h}
                    className='text-[10px] font-semibold uppercase tracking-wide text-muted-foreground'
                  >
                    {h}
                  </div>
                ))}
              </div>

              {/* Desktop Rows */}
              {filtered.map(exec => {
                const isExpanded = expandedId === exec._id;
                const isFailed = exec.status === 'failed';
                const triggerBadge = getTriggerTypeBadge(exec);
                const actionsRun = exec.actions_run?.length
                  ? exec.actions_run.map(a => getActionLabel(a))
                  : null;

                return (
                  <div
                    key={`dt-${exec._id}`}
                    className={cn(
                      'border-b border-border/50 last:border-0',
                      isFailed &&
                        isExpanded &&
                        'bg-[color:var(--error,#ef4444)]/5'
                    )}
                  >
                    <div
                      className='grid min-w-[780px] cursor-pointer grid-cols-[140px_1fr_130px_90px_80px_70px_32px] items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/20'
                      onClick={() =>
                        setExpandedId(isExpanded ? null : exec._id)
                      }
                    >
                      {/* Time — fixed width so it never wraps */}
                      <div className='min-w-0'>
                        <p className='whitespace-nowrap text-xs font-medium'>
                          {formatDate(exec.executed_at)}
                        </p>
                        <p className='mt-0.5 text-[10px] text-muted-foreground'>
                          {formatTimeAgo(exec.executed_at)}
                        </p>
                      </div>
                      {/* Trigger event */}
                      <div className='flex min-w-0 items-center gap-2'>
                        <div className='flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold'>
                          {getUserInitial(exec.trigger_data?.username)}
                        </div>
                        <div className='min-w-0 flex-1'>
                          <div className='flex items-center gap-1.5'>
                            <span className='max-w-[120px] truncate text-xs font-medium'>
                              @{exec.trigger_data?.username ?? 'instagram_user'}
                            </span>
                            <span className='shrink-0 rounded-sm bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground'>
                              {triggerBadge}
                            </span>
                          </div>
                          {exec.trigger_data?.text && (
                            <p className='mt-0.5 truncate text-[11px] text-muted-foreground'>
                              &ldquo;{exec.trigger_data.text}&rdquo;
                            </p>
                          )}
                        </div>
                      </div>
                      {/* Actions run */}
                      <div className='min-w-0'>
                        {actionsRun ? (
                          <div className='space-y-0.5'>
                            {actionsRun.slice(0, 2).map((a, i) => (
                              <div key={i} className='flex items-center gap-1'>
                                <Zap className='h-3 w-3 shrink-0 text-muted-foreground' />
                                <span className='truncate text-[11px] text-muted-foreground'>
                                  {a}
                                </span>
                              </div>
                            ))}
                            {actionsRun.length > 2 && (
                              <p className='text-[10px] text-muted-foreground'>
                                +{actionsRun.length - 2} more
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className='text-xs text-muted-foreground/40'>
                            —
                          </span>
                        )}
                      </div>
                      {/* Status */}
                      <div>
                        <span
                          className={cn(
                            'inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-medium',
                            getStatusBadgeStyle(exec.status)
                          )}
                        >
                          {getStatusLabel(exec.status)}
                        </span>
                      </div>
                      {/* Duration */}
                      <div
                        className={cn(
                          'text-xs font-medium tabular-nums',
                          exec.status === 'failed'
                            ? 'text-[color:var(--error,#ef4444)]'
                            : 'text-muted-foreground'
                        )}
                      >
                        {formatDuration(exec.duration_ms)}
                      </div>
                      {/* Credits */}
                      <div className='flex items-center gap-0.5 text-xs tabular-nums'>
                        <Zap className='h-3 w-3 text-amber-400' />
                        <span>{exec.credits_used ?? 0}</span>
                      </div>
                      {/* Chevron */}
                      <div className='flex justify-center text-muted-foreground'>
                        {isExpanded ? (
                          <ChevronUp className='h-3.5 w-3.5' />
                        ) : (
                          <ChevronDown className='h-3.5 w-3.5' />
                        )}
                      </div>
                    </div>

                    {/* Expanded detail panel */}
                    {isExpanded && (
                      <div className='border-t border-border/30 bg-muted/10 px-4 py-3'>
                        {isFailed ? (
                          <div className='flex flex-col gap-3'>
                            <div className='flex items-center gap-2'>
                              <AlertTriangle className='h-4 w-4 text-[color:var(--error,#ef4444)]' />
                              <span className='text-sm font-semibold text-[color:var(--error,#ef4444)]'>
                                Execution Failed
                              </span>
                            </div>
                            <div className='grid gap-3 sm:grid-cols-2'>
                              <div className='rounded-md border border-border/50 bg-background/60 p-3'>
                                <p className='mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground'>
                                  Error Code
                                </p>
                                <p className='font-mono text-sm'>
                                  {exec.error_code ?? 'UNKNOWN_ERROR'}
                                </p>
                              </div>
                              <div className='rounded-md border border-border/50 bg-background/60 p-3'>
                                <p className='mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground'>
                                  Error Message
                                </p>
                                <p className='text-sm'>
                                  {exec.error_message ??
                                    'An unexpected error occurred.'}
                                </p>
                              </div>
                            </div>
                            <div className='flex gap-2'>
                              <Button
                                size='sm'
                                className='h-7 gap-1.5 text-xs'
                                disabled={retryingId === exec._id}
                                onClick={e => {
                                  e.stopPropagation();
                                  handleRetry(exec);
                                }}
                              >
                                <RotateCcw
                                  className={cn(
                                    'h-3 w-3',
                                    retryingId === exec._id && 'animate-spin'
                                  )}
                                />
                                Retry
                              </Button>
                              <Button
                                variant='outline'
                                size='sm'
                                className='h-7 gap-1.5 text-xs'
                                onClick={e => e.stopPropagation()}
                              >
                                <FileText className='h-3 w-3' />
                                View Log
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className='flex flex-col gap-2'>
                            {/* Full trigger text */}
                            {exec.trigger_data?.text && (
                              <div>
                                <p className='mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground'>
                                  Trigger Message
                                </p>
                                <p className='rounded-md border border-border/40 bg-background/50 px-3 py-2 text-sm text-foreground/90'>
                                  &ldquo;{exec.trigger_data.text}&rdquo;
                                </p>
                              </div>
                            )}
                            {/* Actions + meta row */}
                            <div className='flex flex-wrap items-center gap-4 text-xs text-muted-foreground'>
                              {actionsRun && (
                                <div className='flex items-center gap-1'>
                                  <Zap className='h-3 w-3 text-amber-400' />
                                  <span>{actionsRun.join(', ')}</span>
                                </div>
                              )}
                              <span>·</span>
                              <span>
                                {formatDuration(exec.duration_ms)} duration
                              </span>
                              <span>·</span>
                              <span className='flex items-center gap-0.5'>
                                <Zap className='h-3 w-3 text-amber-400' />
                                {exec.credits_used ?? 0} credits used
                              </span>
                              <span>·</span>
                              <span>{formatDate(exec.executed_at)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      {/* Pagination */}
      <div className='flex items-center justify-between text-xs text-muted-foreground'>
        <span>
          Showing {filtered.length} of {total.toLocaleString()} executions
        </span>
        <div className='flex items-center gap-2'>
          <span>
            Page {page} of {pages} · {PAGE_SIZE} per page
          </span>
          <div className='flex items-center gap-1'>
            <Button
              variant='outline'
              size='icon'
              className='h-7 w-7'
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              <ChevronUp className='h-3.5 w-3.5 rotate-270' />
            </Button>
            {Array.from({ length: Math.min(pages, 5) }, (_, i) => i + 1).map(
              p => (
                <Button
                  key={p}
                  variant={page === p ? 'default' : 'outline'}
                  size='icon'
                  className='h-7 w-7 text-xs'
                  onClick={() => setPage(p)}
                >
                  {p}
                </Button>
              )
            )}
            {pages > 5 && (
              <>
                <span>...</span>
                <Button
                  variant={page === pages ? 'default' : 'outline'}
                  size='icon'
                  className='h-7 w-7 text-xs'
                  onClick={() => setPage(pages)}
                >
                  {pages}
                </Button>
              </>
            )}
            <Button
              variant='outline'
              size='icon'
              className='h-7 w-7'
              disabled={page >= pages}
              onClick={() => setPage(p => p + 1)}
            >
              <ChevronDown className='h-3.5 w-3.5' />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AutomationDetail({
  automation,
  onStatusChange,
  onDelete,
}: AutomationDetailProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('Overview');
  const isActive = automation.status === 'active';

  const successRate =
    automation.statistics.total_executions > 0
      ? Math.round(
          (automation.statistics.successful_executions /
            automation.statistics.total_executions) *
            100
        )
      : 0;

  const TABS: { label: ActiveTab; icon: React.ReactNode }[] = [
    { label: 'Overview', icon: <Eye className='h-3.5 w-3.5' /> },
    { label: 'Analytics', icon: <BarChart3 className='h-3.5 w-3.5' /> },
    {
      label: 'History',
      icon: (
        <div className='flex items-center gap-1'>
          <Clock className='h-3.5 w-3.5' />
          {automation.statistics.total_executions > 0 && (
            <span className='rounded-full bg-primary/10 px-1 py-0.5 text-[9px] font-bold text-primary'>
              {automation.statistics.total_executions.toLocaleString()}
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className='flex h-full flex-col'>
      {/* ── Header ── */}
      <div className='border-b border-border bg-card/30 px-4 py-3 sm:px-6'>
        <div className='mx-auto max-w-6xl'>
          {/* Breadcrumb */}
          <div className='mb-3 flex items-center gap-1.5 text-sm text-muted-foreground'>
            <Link
              href='/dashboard/automations'
              className='hover:text-foreground'
            >
              Automations
            </Link>
            <ArrowRight className='h-3.5 w-3.5' />
            <span className='text-foreground font-medium truncate max-w-[200px]'>
              {automation.name}
            </span>
          </div>

          <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <div className='flex items-center gap-3'>
              {/* Platform icon */}
              <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400'>
                <Instagram className='h-5 w-5 text-white' />
              </div>

              <div>
                <div className='flex items-center gap-2'>
                  <h1 className='text-lg font-bold'>{automation.name}</h1>
                  <span
                    className={cn(
                      'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                      isActive
                        ? 'bg-[color:var(--success,#22c55e)]/10 text-[color:var(--success,#22c55e)]'
                        : 'bg-amber-500/10 text-amber-500'
                    )}
                  >
                    <span
                      className={cn(
                        'h-1.5 w-1.5 rounded-full',
                        isActive
                          ? 'bg-[color:var(--success,#22c55e)]'
                          : 'bg-amber-500'
                      )}
                    />
                    {isActive ? 'Active' : 'Paused'}
                  </span>
                </div>
                <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                  <Image
                    src={automation.social_account.avatar || '/placeholder.svg'}
                    alt=''
                    width={14}
                    height={14}
                    className='h-3.5 w-3.5 rounded-full'
                  />
                  <span>@{automation.social_account.username}</span>
                  {automation.last_executed_at && (
                    <>
                      <span className='text-muted-foreground/30'>·</span>
                      <span>
                        Last run {formatTimeAgo(automation.last_executed_at)}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Action buttons — matching design: Edit / Deactivate / Delete */}
            <div className='flex shrink-0 items-center gap-2'>
              <Button
                asChild
                variant='outline'
                size='sm'
                className='h-8 gap-1.5'
              >
                <Link href={`/dashboard/automations/${automation.id}/edit`}>
                  <Edit className='h-3.5 w-3.5' />
                  Edit
                </Link>
              </Button>

              <Button
                variant='outline'
                size='sm'
                className='h-8 gap-1.5'
                onClick={() => onStatusChange(isActive ? 'paused' : 'active')}
              >
                {isActive ? (
                  <>
                    <Pause className='h-3.5 w-3.5' />
                    Deactivate
                  </>
                ) : (
                  <>
                    <Play className='h-3.5 w-3.5' />
                    Activate
                  </>
                )}
              </Button>

              <Button
                variant='destructive'
                size='sm'
                className='h-8 gap-1.5'
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className='h-3.5 w-3.5' />
                Delete
              </Button>
            </div>
          </div>

          {/* Paused reason banner */}
          {automation.paused_reason && !isActive && (
            <div className='mt-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-2.5'>
              <p className='text-xs text-amber-500'>
                <strong>Paused:</strong> {automation.paused_reason}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className='flex-1 overflow-y-auto p-4 sm:p-6'>
        <div className='mx-auto max-w-6xl space-y-5'>
          {/* Tab bar */}
          <div className='border-b border-border'>
            <div className='flex gap-0'>
              {TABS.map(tab => (
                <button
                  key={tab.label}
                  onClick={() => setActiveTab(tab.label)}
                  className={cn(
                    'flex items-center gap-1.5 border-b-2 px-4 pb-3 pt-1 text-sm font-medium transition-colors',
                    activeTab === tab.label
                      ? 'border-primary text-foreground'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  )}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          {activeTab === 'Overview' && <OverviewTab automation={automation} />}
          {activeTab === 'Analytics' && (
            <AnalyticsTab
              automationId={automation.id}
              automation={automation}
            />
          )}
          {activeTab === 'History' && (
            <HistoryTab
              automationId={automation.id}
              totalExecutions={automation.statistics.total_executions}
            />
          )}
        </div>
      </div>

      {/* ── Delete Dialog ── */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Automation</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                <p>
                  Are you sure you want to delete{' '}
                  <strong>&ldquo;{automation.name}&rdquo;</strong>? This action
                  cannot be undone and will stop all running automations.
                </p>
                {automation.statistics.total_executions > 0 && (
                  <div className='mt-3 rounded-lg border border-[color:var(--error,#ef4444)]/20 bg-[color:var(--error,#ef4444)]/5 p-3 text-sm text-[color:var(--error,#ef4444)]'>
                    <AlertCircle className='mb-1 inline h-4 w-4' /> This
                    automation has run{' '}
                    <strong>{automation.statistics.total_executions}</strong>{' '}
                    time
                    {automation.statistics.total_executions !== 1 ? 's' : ''}.
                    All execution history will be permanently lost.
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setDeleteDialogOpen(false);
                onDelete();
              }}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              Delete Automation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
