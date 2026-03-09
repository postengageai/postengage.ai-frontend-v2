'use client';

import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Play,
  Edit,
  Trash2,
  MoreHorizontal,
  Instagram,
  MessageCircle,
  Clock,
  Zap,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Copy,
  ArrowRight,
  BarChart3,
  List,
  Eye,
  ChevronDown,
  ChevronUp,
  Search,
  AlertCircle,
  Pause,
  Filter,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

// ─── Preserved AutomationData interface (backward compat) ───────────────────

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
      change: number;
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

// ─── Types ───────────────────────────────────────────────────────────────────

type ActiveTab = 'Overview' | 'Analytics' | 'Logs';
type LogFilter = 'all' | 'success' | 'failed' | 'skipped';
type StatsPeriod = '7d' | '30d' | '90d';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getTriggerLabel(type: string, scope?: string): string {
  switch (type) {
    case 'new_comment':
      return scope === 'specific'
        ? 'New Comment (Specific Posts)'
        : 'New Comment (All Posts)';
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

function getStatusStyle(status: string) {
  switch (status) {
    case 'active':
      return 'bg-[color:var(--success,#22c55e)]/10 text-[color:var(--success,#22c55e)]';
    case 'paused':
      return 'bg-amber-500/10 text-amber-500';
    case 'draft':
      return 'bg-muted text-muted-foreground';
    case 'archived':
      return 'bg-muted text-muted-foreground';
    default:
      return 'bg-muted text-muted-foreground';
  }
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
            <p className={cn('mt-1 text-2xl font-bold', valueColor)}>
              {value}
            </p>
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
                  {Math.abs(trend.value ?? trend.change ?? 0)}% this {trend.period}
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

// ─── OverviewTab ─────────────────────────────────────────────────────────────

function OverviewTab({ automation }: { automation: AutomationData }) {
  return (
    <div className='space-y-4'>
      {/* Automation Flow */}
      <Card className='overflow-hidden bg-card/50'>
        <CardHeader className='border-b border-border/50 bg-muted/20 pb-4'>
          <CardTitle className='flex items-center gap-2 text-base'>
            <Zap className='h-4 w-4 text-primary' />
            Automation Flow
          </CardTitle>
        </CardHeader>
        <CardContent className='p-6'>
          <div className='flex flex-col gap-6 lg:flex-row lg:items-stretch'>
            {/* Trigger */}
            <div className='flex flex-1 flex-col'>
              <div className='flex-1 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 transition-all hover:border-blue-500/30 hover:shadow-md'>
                <div className='mb-3 flex items-center gap-2'>
                  <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 shadow-sm'>
                    <Play className='h-4 w-4 text-blue-500' />
                  </div>
                  <span className='text-xs font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400'>
                    Trigger
                  </span>
                </div>
                <p className='text-lg font-semibold'>
                  {getTriggerLabel(
                    automation.trigger.type,
                    automation.trigger.scope
                  )}
                </p>
                {automation.trigger.content_count ? (
                  <div className='mt-2 inline-flex items-center rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-400'>
                    {automation.trigger.content_count} post
                    {automation.trigger.content_count !== 1 ? 's' : ''} selected
                  </div>
                ) : null}
                {automation.trigger.scope === 'all' && (
                  <p className='mt-2 text-xs text-muted-foreground'>
                    Triggers on all posts &amp; reels
                  </p>
                )}
              </div>
            </div>

            <div className='flex items-center justify-center text-muted-foreground/30 lg:w-8'>
              <ArrowRight className='h-6 w-6 rotate-90 lg:rotate-0' />
            </div>

            {/* Condition */}
            {automation.condition && automation.condition.keywords.length > 0 ? (
              <>
                <div className='flex flex-1 flex-col'>
                  <div className='flex-1 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 transition-all hover:border-amber-500/30 hover:shadow-md'>
                    <div className='mb-3 flex items-center gap-2'>
                      <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 shadow-sm'>
                        <Filter className='h-4 w-4 text-amber-500' />
                      </div>
                      <span className='text-xs font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400'>
                        Condition
                      </span>
                    </div>
                    <p className='text-lg font-semibold'>Keyword Filter</p>
                    <p className='mt-0.5 text-xs text-muted-foreground capitalize'>
                      Match {automation.condition.mode} keyword
                      {automation.condition.mode !== 'any' ? '' : 's'}
                    </p>
                    <div className='mt-3 flex flex-wrap gap-1.5'>
                      {automation.condition.keywords.slice(0, 5).map(kw => (
                        <Badge
                          key={kw}
                          variant='secondary'
                          className='border border-amber-200 bg-background/80 text-xs font-normal dark:border-amber-800'
                        >
                          {kw}
                        </Badge>
                      ))}
                      {automation.condition.keywords.length > 5 && (
                        <Badge
                          variant='secondary'
                          className='border border-amber-200 bg-background/80 text-xs font-normal dark:border-amber-800'
                        >
                          +{automation.condition.keywords.length - 5} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className='flex items-center justify-center text-muted-foreground/30 lg:w-8'>
                  <ArrowRight className='h-6 w-6 rotate-90 lg:rotate-0' />
                </div>
              </>
            ) : null}

            {/* Actions */}
            <div className='flex flex-1 flex-col'>
              <div className='flex-1 rounded-xl border border-[color:var(--success,#22c55e)]/20 bg-[color:var(--success,#22c55e)]/5 p-4 transition-all hover:border-[color:var(--success,#22c55e)]/30 hover:shadow-md'>
                <div className='mb-3 flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-[color:var(--success,#22c55e)]/10 shadow-sm'>
                      <Zap className='h-4 w-4 text-[color:var(--success,#22c55e)]' />
                    </div>
                    <span className='text-xs font-bold uppercase tracking-wide text-[color:var(--success,#22c55e)]'>
                      Actions
                    </span>
                  </div>
                  <Badge
                    variant='outline'
                    className='border-[color:var(--success,#22c55e)]/30 text-[color:var(--success,#22c55e)]'
                  >
                    {automation.actions.length} Step
                    {automation.actions.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
                <div className='space-y-2.5'>
                  {automation.actions.map((action, index) => (
                    <div
                      key={index}
                      className='flex items-start gap-3 rounded-lg border border-border/50 bg-background/60 p-2.5'
                    >
                      <span className='flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground'>
                        {index + 1}
                      </span>
                      <div className='min-w-0 flex-1'>
                        <p className='text-sm font-medium'>
                          {getActionLabel(action.type)}
                        </p>
                        {action.text && (
                          <p className='mt-0.5 truncate text-xs text-muted-foreground'>
                            "{action.text}"
                          </p>
                        )}
                      </div>
                      {action.delay_seconds > 0 && (
                        <Badge
                          variant='secondary'
                          className='flex h-5 shrink-0 items-center gap-1 px-1.5 text-[10px] font-normal'
                        >
                          <Clock className='h-3 w-3' />
                          {action.delay_seconds}s
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await automationsApi.getStats(automationId, period);
      if (res?.data) setStats(res.data);
    } catch {
      // Fallback to mock data so UI renders during development
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      setStats({
        total_executions: automation.statistics.total_executions,
        successful: automation.statistics.successful_executions,
        failed: automation.statistics.failed_executions,
        skipped: 0,
        avg_duration_ms: 0,
        credits_used: automation.statistics.total_credits_used,
        daily: days.map(date => ({ date, successful: 0, failed: 0, skipped: 0 })),
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

  const PERIOD_OPTIONS: { label: string; value: StatsPeriod }[] = [
    { label: '7 days', value: '7d' },
    { label: '30 days', value: '30d' },
    { label: '90 days', value: '90d' },
  ];

  return (
    <div className='space-y-5'>
      {/* Period selector */}
      <div className='flex items-center justify-between'>
        <p className='text-sm font-medium text-muted-foreground'>
          Performance overview
        </p>
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
      </div>

      {/* Stat cards */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <StatCard
          label='Total Executions'
          value={stats?.total_executions?.toLocaleString() ?? '—'}
          icon={<MessageCircle className='h-5 w-5 text-primary' />}
          iconBg='bg-primary/10'
          sub={`in last ${period}`}
        />
        <StatCard
          label='Success Rate'
          value={`${successRate}%`}
          icon={<CheckCircle2 className='h-5 w-5 text-[color:var(--success,#22c55e)]' />}
          iconBg='bg-[color:var(--success,#22c55e)]/10'
          valueColor={
            successRate >= 90
              ? 'text-[color:var(--success,#22c55e)]'
              : successRate >= 70
                ? 'text-amber-500'
                : 'text-[color:var(--error,#ef4444)]'
          }
          sub={`${stats?.successful ?? 0} successful`}
        />
        <StatCard
          label='Failed'
          value={stats?.failed?.toLocaleString() ?? '—'}
          icon={<XCircle className='h-5 w-5 text-[color:var(--error,#ef4444)]' />}
          iconBg='bg-[color:var(--error,#ef4444)]/10'
          valueColor={
            (stats?.failed ?? 0) > 0
              ? 'text-[color:var(--error,#ef4444)]'
              : undefined
          }
          sub={`${stats?.skipped ?? 0} skipped`}
        />
        <StatCard
          label='Credits Used'
          value={stats?.credits_used?.toLocaleString() ?? '—'}
          icon={<Zap className='h-5 w-5 text-blue-500' />}
          iconBg='bg-blue-500/10'
          sub={
            stats && stats.total_executions > 0
              ? `~${(stats.credits_used / stats.total_executions).toFixed(1)} per run`
              : 'No executions yet'
          }
        />
      </div>

      {/* Chart */}
      <Card className='bg-card/50'>
        <CardHeader className='pb-2'>
          <CardTitle className='flex items-center gap-2 text-sm font-medium'>
            <BarChart3 className='h-4 w-4 text-muted-foreground' />
            Daily Executions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className='flex h-48 items-center justify-center'>
              <RefreshCw className='h-5 w-5 animate-spin text-muted-foreground' />
            </div>
          ) : (
            <>
              <div className='h-52'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart
                    data={stats?.daily ?? []}
                    margin={{ top: 4, right: 4, left: -24, bottom: 0 }}
                    barCategoryGap='30%'
                  >
                    <CartesianGrid
                      strokeDasharray='3 3'
                      vertical={false}
                      stroke='hsl(var(--border))'
                    />
                    <XAxis
                      dataKey='date'
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
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
                      fill='var(--success,#22c55e)'
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
                      fill='var(--error,#ef4444)'
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div className='mt-3 flex items-center gap-4'>
                {[
                  { color: 'bg-[color:var(--success,#22c55e)]', label: 'Successful' },
                  { color: 'bg-amber-400', label: 'Skipped' },
                  { color: 'bg-[color:var(--error,#ef4444)]', label: 'Failed' },
                ].map(item => (
                  <div key={item.label} className='flex items-center gap-1.5'>
                    <div className={cn('h-2.5 w-2.5 rounded-sm', item.color)} />
                    <span className='text-xs text-muted-foreground'>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Action Performance */}
      {stats?.action_performance && stats.action_performance.length > 0 && (
        <Card className='bg-card/50'>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium'>
              Action Performance
            </CardTitle>
          </CardHeader>
          <CardContent className='p-0'>
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead>
                  <tr className='border-b border-border bg-muted/30'>
                    {['Step', 'Action', 'Timing', 'Sent', 'Success', 'Rate', 'Avg Time'].map(
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
                      <td className='px-4 py-3 text-muted-foreground'>
                        #{row.step}
                      </td>
                      <td className='px-4 py-3 font-medium'>
                        {getActionLabel(row.action_type)}
                      </td>
                      <td className='px-4 py-3 text-muted-foreground capitalize'>
                        {row.timing}
                      </td>
                      <td className='px-4 py-3'>{row.sent}</td>
                      <td className='px-4 py-3 text-[color:var(--success,#22c55e)]'>
                        {row.success}
                      </td>
                      <td className='px-4 py-3'>
                        <span
                          className={cn(
                            'font-medium',
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
                        {row.avg_time_ms < 1000
                          ? `${row.avg_time_ms}ms`
                          : `${(row.avg_time_ms / 1000).toFixed(1)}s`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── LogsTab ──────────────────────────────────────────────────────────────────

function LogsTab({
  automationId,
  initialHistory,
}: {
  automationId: string;
  initialHistory: AutomationData['execution_history'];
}) {
  const [filter, setFilter] = useState<LogFilter>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [executions, setExecutions] = useState<AutomationExecution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const PAGE_SIZE = 10;

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await automationsApi.getHistory(automationId, page, PAGE_SIZE);
      if (res?.data) setExecutions(res.data);
    } catch {
      // Fall back to initial history passed from parent
      setExecutions(
        initialHistory.map(h => ({
          _id: h.id,
          automation_id: automationId,
          trigger_event_id: h.id,
          status:
            h.status === 'success'
              ? 'success'
              : h.status === 'failed'
                ? 'failed'
                : 'skipped',
          duration_ms: 0,
          executed_at: h.executed_at,
          credits_used: h.credits_used,
          trigger_data: { username: h.trigger_data.username, text: h.trigger_data.text },
        }))
      );
    } finally {
      setIsLoading(false);
    }
  }, [automationId, page, initialHistory]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const filtered = executions.filter(e => {
    if (filter !== 'all' && e.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        e.trigger_data?.username?.toLowerCase().includes(q) ||
        e.trigger_data?.text?.toLowerCase().includes(q) ||
        false
      );
    }
    return true;
  });

  const LOG_FILTERS: { label: string; value: LogFilter; color?: string }[] = [
    { label: 'All', value: 'all' },
    {
      label: 'Success',
      value: 'success',
      color: 'text-[color:var(--success,#22c55e)] bg-[color:var(--success,#22c55e)]/10',
    },
    {
      label: 'Failed',
      value: 'failed',
      color: 'text-[color:var(--error,#ef4444)] bg-[color:var(--error,#ef4444)]/10',
    },
    { label: 'Skipped', value: 'skipped', color: 'text-amber-500 bg-amber-500/10' },
  ];

  function getExecStatusIcon(status: string) {
    switch (status) {
      case 'success':
        return <CheckCircle2 className='h-4 w-4 text-[color:var(--success,#22c55e)]' />;
      case 'failed':
        return <XCircle className='h-4 w-4 text-[color:var(--error,#ef4444)]' />;
      case 'partial_success':
        return <AlertCircle className='h-4 w-4 text-amber-500' />;
      default:
        return <Clock className='h-4 w-4 text-amber-500' />;
    }
  }

  function getExecStatusBg(status: string) {
    switch (status) {
      case 'success':
        return 'bg-[color:var(--success,#22c55e)]/10';
      case 'failed':
        return 'bg-[color:var(--error,#ef4444)]/10';
      default:
        return 'bg-amber-500/10';
    }
  }

  function getExecStatusBadge(status: string) {
    switch (status) {
      case 'success':
        return 'bg-[color:var(--success,#22c55e)]/10 text-[color:var(--success,#22c55e)]';
      case 'failed':
        return 'bg-[color:var(--error,#ef4444)]/10 text-[color:var(--error,#ef4444)]';
      case 'partial_success':
        return 'bg-amber-500/10 text-amber-500';
      default:
        return 'bg-amber-500/10 text-amber-500';
    }
  }

  return (
    <div className='space-y-4'>
      {/* Filter + Search bar */}
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex items-center gap-1.5'>
          {LOG_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => { setFilter(f.value); setPage(1); }}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                filter === f.value
                  ? f.color ?? 'bg-foreground text-background'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className='relative'>
          <Search className='absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground' />
          <Input
            placeholder='Search by user or content...'
            value={search}
            onChange={e => setSearch(e.target.value)}
            className='h-8 w-full pl-8 text-xs sm:w-56'
          />
        </div>
      </div>

      {/* Table */}
      <Card className='bg-card/50'>
        <CardContent className='p-0'>
          {isLoading ? (
            <div className='flex h-48 items-center justify-center'>
              <RefreshCw className='h-5 w-5 animate-spin text-muted-foreground' />
            </div>
          ) : filtered.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-12'>
              <List className='mb-3 h-8 w-8 text-muted-foreground/40' />
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
              {filtered.map((exec, i) => {
                const isExpanded = expandedId === exec._id;
                return (
                  <div
                    key={exec._id}
                    className={cn(
                      'border-b border-border/50 last:border-0',
                      i === 0 ? '' : ''
                    )}
                  >
                    <div
                      className={cn(
                        'flex items-center gap-3 p-3 transition-colors',
                        exec.status === 'failed' && 'cursor-pointer hover:bg-muted/30'
                      )}
                      onClick={() => {
                        if (exec.status === 'failed') {
                          setExpandedId(isExpanded ? null : exec._id);
                        }
                      }}
                    >
                      {/* Status icon */}
                      <div
                        className={cn(
                          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                          getExecStatusBg(exec.status)
                        )}
                      >
                        {getExecStatusIcon(exec.status)}
                      </div>

                      {/* Content */}
                      <div className='min-w-0 flex-1'>
                        <div className='flex flex-wrap items-center gap-2'>
                          <span className='text-sm font-medium'>
                            @{exec.trigger_data?.username ?? 'Instagram User'}
                          </span>
                          <Badge
                            variant='secondary'
                            className={cn('text-xs', getExecStatusBadge(exec.status))}
                          >
                            {exec.status === 'partial_success'
                              ? 'Partial'
                              : exec.status}
                          </Badge>
                        </div>
                        {exec.trigger_data?.text && (
                          <p className='mt-0.5 truncate text-xs text-muted-foreground'>
                            &ldquo;{exec.trigger_data.text}&rdquo;
                          </p>
                        )}
                      </div>

                      {/* Meta */}
                      <div className='shrink-0 text-right'>
                        {exec.credits_used !== undefined && (
                          <p className='text-xs font-medium'>
                            {exec.credits_used} cr
                          </p>
                        )}
                        <p className='text-xs text-muted-foreground'>
                          {formatTimeAgo(exec.executed_at)}
                        </p>
                      </div>

                      {/* Expand toggle for failed */}
                      {exec.status === 'failed' && (
                        <div className='ml-1 shrink-0 text-muted-foreground'>
                          {isExpanded ? (
                            <ChevronUp className='h-4 w-4' />
                          ) : (
                            <ChevronDown className='h-4 w-4' />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Expanded error detail */}
                    {isExpanded && exec.error_message && (
                      <div className='mx-3 mb-3 rounded-lg border border-[color:var(--error,#ef4444)]/20 bg-[color:var(--error,#ef4444)]/5 p-3'>
                        <p className='mb-1 text-xs font-semibold text-[color:var(--error,#ef4444)]'>
                          Error Details
                        </p>
                        <p className='font-mono text-xs text-muted-foreground'>
                          {exec.error_message}
                        </p>
                        {exec.transaction_id && (
                          <p className='mt-1.5 text-[10px] text-muted-foreground/60'>
                            Transaction: {exec.transaction_id}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {executions.length >= PAGE_SIZE && (
        <div className='flex items-center justify-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            Previous
          </Button>
          <span className='text-xs text-muted-foreground'>Page {page}</span>
          <Button
            variant='outline'
            size='sm'
            disabled={executions.length < PAGE_SIZE}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
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
    { label: 'Logs', icon: <List className='h-3.5 w-3.5' /> },
  ];

  return (
    <div className='flex h-full flex-col'>
      {/* ── Header ── */}
      <div className='border-b border-border bg-card/30 p-4 sm:p-6'>
        <div className='mx-auto max-w-6xl'>
          {/* Back */}
          <Button variant='ghost' size='sm' asChild className='mb-4'>
            <Link href='/dashboard/automations'>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to Automations
            </Link>
          </Button>

          <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
            <div className='flex items-start gap-4'>
              {/* Platform icon */}
              <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400'>
                <Instagram className='h-6 w-6 text-white' />
              </div>

              <div>
                <div className='mb-2 flex flex-wrap items-center gap-2'>
                  <h1 className='text-xl font-bold sm:text-2xl'>
                    {automation.name}
                  </h1>
                  <Badge
                    variant='secondary'
                    className={cn('capitalize', getStatusStyle(automation.status))}
                  >
                    {automation.status}
                  </Badge>
                </div>

                {automation.description && (
                  <p className='mb-2 text-sm text-muted-foreground'>
                    {automation.description}
                  </p>
                )}

                <div className='flex flex-wrap items-center gap-3 text-sm text-muted-foreground'>
                  <div className='flex items-center gap-1'>
                    <Image
                      src={automation.social_account.avatar || '/placeholder.svg'}
                      alt=''
                      width={16}
                      height={16}
                      className='h-4 w-4 rounded-full'
                    />
                    <span>@{automation.social_account.username}</span>
                  </div>
                  <span className='text-muted-foreground/30'>•</span>
                  <span>Updated {formatTimeAgo(automation.updated_at)}</span>
                  {automation.last_executed_at && (
                    <>
                      <span className='text-muted-foreground/30'>•</span>
                      <div className='flex items-center gap-1'>
                        <Clock className='h-3 w-3' />
                        <span>Last run {formatTimeAgo(automation.last_executed_at)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className='flex shrink-0 items-center gap-2'>
              {/* Toggle switch */}
              <div className='flex items-center gap-2 rounded-lg border border-border bg-card/50 px-3 py-2'>
                <span className='text-sm text-muted-foreground'>
                  {isActive ? 'Active' : 'Paused'}
                </span>
                <Switch
                  checked={isActive}
                  onCheckedChange={checked =>
                    onStatusChange(checked ? 'active' : 'paused')
                  }
                  className='data-[state=checked]:bg-[color:var(--success,#22c55e)]'
                />
              </div>

              <Button asChild>
                <Link href={`/dashboard/automations/${automation.id}/edit`}>
                  <Edit className='mr-2 h-4 w-4' />
                  Edit
                </Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='outline' size='icon'>
                    <MoreHorizontal className='h-4 w-4' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/automations/${automation.id}/edit`}>
                      <Edit className='mr-2 h-4 w-4' />
                      Edit
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Copy className='mr-2 h-4 w-4' />
                    Duplicate
                  </DropdownMenuItem>
                  {isActive ? (
                    <DropdownMenuItem
                      onClick={() => onStatusChange('paused')}
                    >
                      <Pause className='mr-2 h-4 w-4' />
                      Pause
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      onClick={() => onStatusChange('active')}
                    >
                      <Play className='mr-2 h-4 w-4' />
                      Activate
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className='text-destructive focus:text-destructive'
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    <Trash2 className='mr-2 h-4 w-4' />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Paused reason banner */}
          {automation.paused_reason && !isActive && (
            <div className='mt-4 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3'>
              <p className='text-sm text-amber-500'>
                <strong>Paused:</strong> {automation.paused_reason}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className='flex-1 overflow-y-auto p-4 sm:p-6'>
        <div className='mx-auto max-w-6xl space-y-6'>
          {/* Top stat cards */}
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            <StatCard
              label='Total Executions'
              value={automation.statistics.total_executions.toLocaleString()}
              icon={<MessageCircle className='h-5 w-5 text-primary' />}
              iconBg='bg-primary/10'
              trend={automation.statistics.trend}
            />
            <StatCard
              label='Success Rate'
              value={`${successRate}%`}
              icon={<CheckCircle2 className='h-5 w-5 text-[color:var(--success,#22c55e)]' />}
              iconBg='bg-[color:var(--success,#22c55e)]/10'
              valueColor={
                successRate >= 90
                  ? 'text-[color:var(--success,#22c55e)]'
                  : successRate >= 70
                    ? 'text-amber-500'
                    : 'text-[color:var(--error,#ef4444)]'
              }
              sub={`${automation.statistics.successful_executions} successful`}
            />
            <StatCard
              label='Failed'
              value={automation.statistics.failed_executions.toString()}
              icon={<XCircle className='h-5 w-5 text-[color:var(--error,#ef4444)]' />}
              iconBg='bg-[color:var(--error,#ef4444)]/10'
              valueColor={
                automation.statistics.failed_executions > 0
                  ? 'text-[color:var(--error,#ef4444)]'
                  : undefined
              }
              sub={
                automation.statistics.total_executions > 0
                  ? `${((automation.statistics.failed_executions / automation.statistics.total_executions) * 100).toFixed(1)}% failure rate`
                  : 'No failures'
              }
            />
            <StatCard
              label='Credits Used'
              value={automation.statistics.total_credits_used.toLocaleString()}
              icon={<Zap className='h-5 w-5 text-blue-500' />}
              iconBg='bg-blue-500/10'
              sub={
                automation.statistics.total_executions > 0
                  ? `~${(automation.statistics.total_credits_used / automation.statistics.total_executions).toFixed(1)} per execution`
                  : 'No executions yet'
              }
            />
          </div>

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
          {activeTab === 'Overview' && (
            <OverviewTab automation={automation} />
          )}
          {activeTab === 'Analytics' && (
            <AnalyticsTab
              automationId={automation.id}
              automation={automation}
            />
          )}
          {activeTab === 'Logs' && (
            <LogsTab
              automationId={automation.id}
              initialHistory={automation.execution_history}
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
                    <AlertCircle className='mb-1 inline h-4 w-4' />{' '}
                    This automation has run{' '}
                    <strong>{automation.statistics.total_executions}</strong>{' '}
                    time{automation.statistics.total_executions !== 1 ? 's' : ''}.
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
