'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  RefreshCw,
  Activity,
  Zap,
  Clock,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Flag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { IntelligenceApi } from '@/lib/api/intelligence';
import {
  AnalyticsPeriod,
  IntelligenceAnalyticsItem,
  IntelligenceQualityAnalytics,
} from '@/lib/types/analytics';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { parseApiError } from '@/lib/http/errors';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

// ─── Label / colour lookup maps ──────────────────────────────────────────────

const DECISION_LABELS: Record<string, string> = {
  reply: 'Reply',
  ignore: 'Ignore',
  escalate: 'Escalate',
  fallback: 'Fallback',
  flag: 'Flag',
};

const DECISION_COLORS: Record<string, string> = {
  reply: 'bg-emerald-500',
  ignore: 'bg-slate-400',
  escalate: 'bg-amber-500',
  fallback: 'bg-orange-500',
  flag: 'bg-red-500',
};

const MSG_TYPE_LABELS: Record<string, string> = {
  comment: 'Comment',
  dm: 'Direct Message',
  mention: 'Mention',
  reply: 'Reply',
  story_mention: 'Story Mention',
};

// ─── Reusable sub-components ─────────────────────────────────────────────────

function StatCard({
  title,
  value,
  sub,
  icon: Icon,
  iconClass = 'text-muted-foreground',
  loading,
}: {
  title: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  iconClass?: string;
  loading?: boolean;
}) {
  return (
    <Card>
      <CardContent className='p-4'>
        <div className='flex items-center justify-between'>
          <p className='text-xs font-medium text-muted-foreground'>{title}</p>
          <Icon className={`h-4 w-4 ${iconClass}`} />
        </div>
        {loading ? (
          <Skeleton className='mt-2 h-7 w-20' />
        ) : (
          <p className='mt-1 text-2xl font-bold'>{value}</p>
        )}
        {sub && <p className='mt-0.5 text-xs text-muted-foreground'>{sub}</p>}
      </CardContent>
    </Card>
  );
}

function BarRow({
  label,
  count,
  total,
  colorClass,
  badge,
}: {
  label: string;
  count: number;
  total: number;
  colorClass?: string;
  badge?: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className='space-y-1'>
      <div className='flex items-center justify-between text-sm'>
        <div className='flex items-center gap-2 min-w-0'>
          <span className='truncate font-medium'>{label}</span>
          {badge !== undefined && (
            <Badge
              variant='secondary'
              className='shrink-0 text-[10px] px-1.5 py-0'
            >
              {badge}
            </Badge>
          )}
        </div>
        <span className='ml-2 shrink-0 text-muted-foreground'>
          {count.toLocaleString()} <span className='text-xs'>({pct}%)</span>
        </span>
      </div>
      <div className='h-2 w-full rounded-full bg-muted overflow-hidden'>
        <div
          className={`h-full rounded-full transition-all ${colorClass ?? 'bg-primary'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function LoadingGrid({ cols = 4 }: { cols?: number }) {
  return (
    <div
      className={`grid gap-4 ${cols === 4 ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-3'}`}
    >
      {Array.from({ length: cols }).map((_, i) => (
        <Card key={i}>
          <CardContent className='p-4'>
            <Skeleton className='h-4 w-24' />
            <Skeleton className='mt-2 h-7 w-16' />
            <Skeleton className='mt-1 h-3 w-20' />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Period options ───────────────────────────────────────────────────────────

const periodOptions: { value: AnalyticsPeriod; label: string }[] = [
  { value: AnalyticsPeriod.LAST_7_DAYS, label: 'Last 7 days' },
  { value: AnalyticsPeriod.LAST_30_DAYS, label: 'Last 30 days' },
  { value: AnalyticsPeriod.TODAY, label: 'Today' },
  { value: AnalyticsPeriod.YESTERDAY, label: 'Yesterday' },
  { value: AnalyticsPeriod.THIS_MONTH, label: 'This month' },
  { value: AnalyticsPeriod.LAST_MONTH, label: 'Last month' },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function IntelligenceAnalyticsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<AnalyticsPeriod>(
    AnalyticsPeriod.LAST_7_DAYS
  );
  const [filterAccount, setFilterAccount] = useState('');
  const [items, setItems] = useState<IntelligenceAnalyticsItem[]>([]);
  const [qualityData, setQualityData] =
    useState<IntelligenceQualityAnalytics | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [overviewRes, qualityRes] = await Promise.all([
        IntelligenceApi.getIntelligenceAnalytics({ period }),
        IntelligenceApi.getIntelligenceQualityAnalytics({ period }),
      ]);
      setItems(overviewRes.data?.items ?? []);
      setQualityData(qualityRes.data ?? null);
    } catch (_error) {
      const err = parseApiError(_error);
      toast({
        variant: 'destructive',
        title: err.title,
        description: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  }, [period, toast]);

  useEffect(() => {
    load();
  }, [load]);

  // ── Derived overview stats ────────────────────────────────────────────────
  const filtered = filterAccount
    ? items.filter(i =>
        i.social_account_id?.toLowerCase().includes(filterAccount.toLowerCase())
      )
    : items;

  const totalProcessed = filtered.reduce(
    (a, i) => a + (i.total_processed ?? 0),
    0
  );
  const totalReplied = filtered.reduce((a, i) => a + (i.replied_count ?? 0), 0);
  const responseRate =
    totalProcessed > 0 ? Math.round((totalReplied / totalProcessed) * 100) : 0;
  const avgLatency =
    filtered.length > 0
      ? Math.round(
          filtered.reduce((a, i) => a + (i.avg_latency_ms ?? 0), 0) /
            filtered.length
        )
      : 0;
  const totalActions = filtered.reduce((a, i) => a + (i.actions_taken ?? 0), 0);
  const avgConfidence =
    filtered.length > 0
      ? (
          (filtered.reduce((a, i) => a + (i.avg_confidence ?? 0), 0) /
            filtered.length) *
          100
        ).toFixed(0)
      : '—';
  const avgEscalation =
    filtered.length > 0
      ? (
          (filtered.reduce((a, i) => a + (i.escalation_rate ?? 0), 0) /
            filtered.length) *
          100
        ).toFixed(1)
      : '—';

  // ── Derived quality stats ────────────────────────────────────────────────
  const q = qualityData?.quality;
  const validationPct =
    q && q.total > 0 ? Math.round((q.passed_validation / q.total) * 100) : null;

  const totalDecisions = (qualityData?.decisions ?? []).reduce(
    (a, d) => a + d.count,
    0
  );
  const totalMsgTypes = (qualityData?.message_types ?? []).reduce(
    (a, m) => a + m.count,
    0
  );
  const totalIntents = (qualityData?.intents ?? []).reduce(
    (a, i) => a + i.count,
    0
  );

  return (
    <div className='space-y-6 p-4 sm:p-6'>
      {/* Header */}
      <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
        <div className='min-w-0'>
          <h1 className='text-2xl sm:text-3xl font-bold tracking-tight'>
            Intelligence Analytics
          </h1>
          <p className='mt-1 text-sm text-muted-foreground'>
            Monitor AI performance, response quality, and automation impact.
          </p>
        </div>
        <div className='flex shrink-0 flex-wrap items-center gap-2'>
          <Select
            value={period}
            onValueChange={(v: AnalyticsPeriod) => setPeriod(v)}
          >
            <SelectTrigger className='w-[160px] sm:w-[180px]'>
              <SelectValue placeholder='Select period' />
            </SelectTrigger>
            <SelectContent>
              {periodOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant='outline'
            size='icon'
            onClick={load}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
            />
          </Button>
        </div>
      </div>

      {/* Account filter */}
      <Input
        placeholder='Filter by account ID...'
        value={filterAccount}
        onChange={e => setFilterAccount(e.target.value)}
        className='max-w-sm'
      />

      {/* Tabs */}
      <Tabs defaultValue='overview' className='space-y-4'>
        <div className='overflow-x-auto pb-1'>
          <TabsList className='w-max'>
            <TabsTrigger value='overview'>Overview</TabsTrigger>
            <TabsTrigger value='quality'>Quality &amp; Safety</TabsTrigger>
            <TabsTrigger value='diversity'>Response Diversity</TabsTrigger>
            <TabsTrigger value='intents'>Intent Analysis</TabsTrigger>
          </TabsList>
        </div>

        {/* ── OVERVIEW ─────────────────────────────────────────────────────── */}
        <TabsContent value='overview' className='space-y-4'>
          {isLoading ? (
            <>
              <LoadingGrid cols={4} />
              <LoadingGrid cols={4} />
            </>
          ) : (
            <>
              <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
                <StatCard
                  title='Total Processed'
                  value={totalProcessed}
                  sub='Across all accounts'
                  icon={Activity}
                  iconClass='text-blue-500'
                />
                <StatCard
                  title='Response Rate'
                  value={`${responseRate}%`}
                  sub='Replied vs Processed'
                  icon={TrendingUp}
                  iconClass='text-emerald-500'
                />
                <StatCard
                  title='Avg. Latency'
                  value={`${avgLatency}ms`}
                  sub='Per interaction'
                  icon={Clock}
                  iconClass='text-violet-500'
                />
                <StatCard
                  title='Actions Taken'
                  value={totalActions}
                  sub='Total actions executed'
                  icon={Zap}
                  iconClass='text-amber-500'
                />
              </div>
              <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
                <StatCard
                  title='Avg. Confidence'
                  value={avgConfidence === '—' ? '—' : `${avgConfidence}%`}
                  sub='AI decision confidence'
                  icon={ShieldCheck}
                  iconClass='text-sky-500'
                />
                <StatCard
                  title='Escalation Rate'
                  value={avgEscalation === '—' ? '—' : `${avgEscalation}%`}
                  sub='Handed off to human'
                  icon={AlertTriangle}
                  iconClass='text-orange-500'
                />
                <StatCard
                  title='Validation Pass'
                  value={validationPct !== null ? `${validationPct}%` : '—'}
                  sub={
                    q
                      ? `${q.passed_validation} / ${q.total} passed`
                      : 'Responses validated'
                  }
                  icon={CheckCircle2}
                  iconClass='text-emerald-500'
                />
                <StatCard
                  title='Flagged Replies'
                  value={q?.flagged_count ?? '—'}
                  sub='Require review'
                  icon={Flag}
                  iconClass='text-red-500'
                />
              </div>
            </>
          )}
        </TabsContent>

        {/* ── QUALITY & SAFETY ─────────────────────────────────────────────── */}
        <TabsContent value='quality' className='space-y-4'>
          {isLoading ? (
            <LoadingGrid cols={3} />
          ) : q ? (
            <>
              <div className='grid gap-4 md:grid-cols-3'>
                <StatCard
                  title='Avg. Confidence'
                  value={`${(q.avg_confidence * 100).toFixed(1)}%`}
                  sub='Mean AI certainty'
                  icon={ShieldCheck}
                  iconClass='text-sky-500'
                />
                <StatCard
                  title='Avg. Risk Score'
                  value={(q.avg_risk_score ?? 0).toFixed(2)}
                  sub='Lower is safer'
                  icon={AlertTriangle}
                  iconClass='text-orange-500'
                />
                <StatCard
                  title='Avg. Regenerations'
                  value={(q.avg_regeneration_count ?? 0).toFixed(1)}
                  sub='Re-attempts per reply'
                  icon={RefreshCw}
                  iconClass='text-violet-500'
                />
              </div>
              <div className='grid gap-4 md:grid-cols-2'>
                <Card>
                  <CardHeader className='pb-2'>
                    <CardTitle className='text-sm font-semibold'>
                      Validation Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-3'>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-muted-foreground'>
                        Total Processed
                      </span>
                      <span className='font-bold'>
                        {q.total.toLocaleString()}
                      </span>
                    </div>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-muted-foreground'>
                        Passed Validation
                      </span>
                      <span className='font-bold text-emerald-600'>
                        {q.passed_validation.toLocaleString()}
                      </span>
                    </div>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-muted-foreground'>Flagged</span>
                      <span className='font-bold text-red-500'>
                        {q.flagged_count.toLocaleString()}
                      </span>
                    </div>
                    {q.total > 0 && (
                      <div className='pt-1'>
                        <div className='mb-1 flex justify-between text-xs text-muted-foreground'>
                          <span>Pass rate</span>
                          <span>
                            {Math.round((q.passed_validation / q.total) * 100)}%
                          </span>
                        </div>
                        <div className='h-2 w-full rounded-full bg-muted overflow-hidden'>
                          <div
                            className='h-full rounded-full bg-emerald-500 transition-all'
                            style={{
                              width: `${Math.round((q.passed_validation / q.total) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className='pb-2'>
                    <CardTitle className='text-sm font-semibold'>
                      Decision Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-3'>
                    {qualityData!.decisions.length === 0 ? (
                      <p className='py-6 text-center text-sm text-muted-foreground'>
                        No decision data
                      </p>
                    ) : (
                      qualityData!.decisions
                        .sort((a, b) => b.count - a.count)
                        .map(d => (
                          <BarRow
                            key={d.action}
                            label={DECISION_LABELS[d.action] ?? d.action}
                            count={d.count}
                            total={totalDecisions}
                            colorClass={
                              DECISION_COLORS[d.action] ?? 'bg-primary'
                            }
                          />
                        ))
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <div className='flex h-[300px] items-center justify-center rounded-lg border border-dashed text-muted-foreground'>
              No quality data available for this period
            </div>
          )}
        </TabsContent>

        {/* ── RESPONSE DIVERSITY ───────────────────────────────────────────── */}
        <TabsContent value='diversity' className='space-y-4'>
          {isLoading ? (
            <LoadingGrid cols={3} />
          ) : qualityData && qualityData.message_types.length > 0 ? (
            <>
              <div className='grid gap-4 md:grid-cols-3'>
                {qualityData.message_types
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 3)
                  .map((mt, idx) => {
                    const icons = [Activity, TrendingUp, Zap];
                    const Icon = icons[idx] ?? Activity;
                    return (
                      <StatCard
                        key={mt.type}
                        title={MSG_TYPE_LABELS[mt.type] ?? mt.type}
                        value={mt.count.toLocaleString()}
                        sub={`${totalMsgTypes > 0 ? Math.round((mt.count / totalMsgTypes) * 100) : 0}% of total`}
                        icon={Icon}
                      />
                    );
                  })}
              </div>
              <Card>
                <CardHeader className='pb-2'>
                  <CardTitle className='text-sm font-semibold'>
                    Message Type Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  {qualityData.message_types
                    .sort((a, b) => b.count - a.count)
                    .map(mt => (
                      <BarRow
                        key={mt.type}
                        label={MSG_TYPE_LABELS[mt.type] ?? mt.type}
                        count={mt.count}
                        total={totalMsgTypes}
                      />
                    ))}
                </CardContent>
              </Card>
            </>
          ) : (
            <div className='flex h-[300px] items-center justify-center rounded-lg border border-dashed text-muted-foreground'>
              No message type data available for this period
            </div>
          )}
        </TabsContent>

        {/* ── INTENT ANALYSIS ──────────────────────────────────────────────── */}
        <TabsContent value='intents' className='space-y-4'>
          {isLoading ? (
            <LoadingGrid cols={4} />
          ) : qualityData && qualityData.intents.length > 0 ? (
            <>
              <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
                {qualityData.intents
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 4)
                  .map(intent => (
                    <Card key={intent.label}>
                      <CardContent className='p-4'>
                        <div className='flex items-start justify-between gap-2'>
                          <p className='text-xs font-medium text-muted-foreground capitalize leading-tight'>
                            {intent.label}
                          </p>
                          <Badge
                            variant='outline'
                            className='shrink-0 text-[10px] px-1.5'
                          >
                            {(intent.avg_confidence * 100).toFixed(0)}%
                          </Badge>
                        </div>
                        <p className='mt-1 text-2xl font-bold'>
                          {intent.count.toLocaleString()}
                        </p>
                        <p className='mt-0.5 text-xs text-muted-foreground'>
                          {totalIntents > 0
                            ? Math.round((intent.count / totalIntents) * 100)
                            : 0}
                          % of intents
                        </p>
                      </CardContent>
                    </Card>
                  ))}
              </div>
              <Card>
                <CardHeader className='pb-2'>
                  <CardTitle className='text-sm font-semibold'>
                    All Intents
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  {qualityData.intents
                    .sort((a, b) => b.count - a.count)
                    .map(intent => (
                      <BarRow
                        key={intent.label}
                        label={intent.label}
                        count={intent.count}
                        total={totalIntents}
                        badge={`${(intent.avg_confidence * 100).toFixed(0)}% conf`}
                      />
                    ))}
                </CardContent>
              </Card>
            </>
          ) : (
            <div className='flex h-[300px] items-center justify-center rounded-lg border border-dashed text-muted-foreground'>
              No intent data available for this period
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
