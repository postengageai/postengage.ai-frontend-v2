'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { IntelligenceApi } from '@/lib/api/intelligence';
import {
  AnalyticsPeriod,
  IntelligenceAnalyticsItem,
} from '@/lib/types/analytics';
import type { IntelligenceQualityAnalytics } from '@/lib/types/quality';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { QualityScorecard } from '@/components/intelligence/analytics/quality-scorecard';
import { ResponseActions } from '@/components/intelligence/analytics/response-actions';
import { IntentBreakdown } from '@/components/intelligence/analytics/intent-breakdown';
import { ConfidenceDistribution } from '@/components/intelligence/analytics/confidence-distribution';
import { DiversityChart } from '@/components/intelligence/analytics/diversity-chart';

interface IntelligenceAnalyticsState {
  periodLabel: string;
  items: IntelligenceAnalyticsItem[];
}

const periodOptions: { value: AnalyticsPeriod; label: string }[] = [
  { value: AnalyticsPeriod.LAST_7_DAYS, label: 'Last 7 days' },
  { value: AnalyticsPeriod.LAST_30_DAYS, label: 'Last 30 days' },
  { value: AnalyticsPeriod.TODAY, label: 'Today' },
  { value: AnalyticsPeriod.YESTERDAY, label: 'Yesterday' },
  { value: AnalyticsPeriod.THIS_MONTH, label: 'This month' },
  { value: AnalyticsPeriod.LAST_MONTH, label: 'Last month' },
];

export default function IntelligenceAnalyticsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<AnalyticsPeriod>(
    AnalyticsPeriod.LAST_7_DAYS
  );
  const [filterAccount, setFilterAccount] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [state, setState] = useState<IntelligenceAnalyticsState>({
    periodLabel: '',
    items: [],
  });
  const [qualityData, setQualityData] =
    useState<IntelligenceQualityAnalytics | null>(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [response, qualityResponse] = await Promise.all([
          IntelligenceApi.getIntelligenceAnalytics({ period }),
          IntelligenceApi.getQualityAnalytics({
            period: 'weekly',
            include_quality: true,
            include_diversity: true,
            include_intents: true,
          }).catch(() => null),
        ]);

        const data = response.data;
        const label =
          data.period && data.period.start && data.period.end
            ? `${data.period.start.slice(0, 10)} → ${data.period.end.slice(0, 10)}`
            : '';
        setState({
          periodLabel: label,
          items: data.items || [],
        });

        if (qualityResponse?.data) {
          setQualityData(qualityResponse.data);
        }
      } catch (_error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load intelligence analytics',
        });
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [period, toast]);

  const filteredItems = useMemo(() => {
    if (!filterAccount) return state.items;
    const q = filterAccount.toLowerCase();
    return state.items.filter(item =>
      item.social_account_id.toLowerCase().includes(q)
    );
  }, [state.items, filterAccount]);

  const chartRows = useMemo(
    () =>
      filteredItems.map(item => ({
        label: `${item.date} · ${item.social_account_id}`,
        ai_calls: item.ai_calls,
        total_tokens: item.total_tokens,
      })),
    [filteredItems]
  );

  return (
    <div className='h-full flex flex-col'>
      <div className='flex items-center justify-between p-6 border-b bg-background/50 backdrop-blur-sm sticky top-0 z-10'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>
            Intelligence Analytics
          </h2>
          <p className='text-muted-foreground'>
            Monitor AI quality, response actions, and intent patterns.
          </p>
          {state.periodLabel && (
            <p className='text-xs text-muted-foreground mt-1'>
              Period: {state.periodLabel}
            </p>
          )}
        </div>
        <div className='flex items-center gap-3'>
          <div className='flex items-center gap-2'>
            <Switch
              id='advanced-toggle'
              checked={showAdvanced}
              onCheckedChange={setShowAdvanced}
            />
            <Label htmlFor='advanced-toggle' className='text-xs'>
              Advanced
            </Label>
          </div>
          <Select
            value={period}
            onValueChange={value => setPeriod(value as AnalyticsPeriod)}
          >
            <SelectTrigger className='w-[180px]'>
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
          <Input
            className='w-52'
            placeholder='Filter by social account id'
            value={filterAccount}
            onChange={e => setFilterAccount(e.target.value)}
          />
        </div>
      </div>

      <div className='flex-1 p-6 space-y-6'>
        {isLoading ? (
          <div className='space-y-4'>
            <div className='grid gap-4 md:grid-cols-3'>
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className='h-28 w-full' />
              ))}
            </div>
            <Skeleton className='h-64 w-full' />
            <Skeleton className='h-64 w-full' />
          </div>
        ) : (
          <>
            {/* Quality Scorecard */}
            {qualityData && (
              <>
                <QualityScorecard
                  quality={qualityData.quality}
                  showAdvanced={showAdvanced}
                />

                {/* Response Actions */}
                <ResponseActions actions={qualityData.response_actions} />

                {/* Intent Analytics */}
                <IntentBreakdown intents={qualityData.intents} />

                {/* Advanced: Confidence Distribution + Diversity */}
                {showAdvanced && (
                  <>
                    <Separator />
                    <ConfidenceDistribution quality={qualityData.quality} />
                    <DiversityChart diversity={qualityData.diversity} />
                  </>
                )}

                <Separator />
              </>
            )}

            {/* Original Usage Charts */}
            <Card>
              <CardHeader>
                <CardTitle>AI Calls & Tokens Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                {chartRows.length === 0 ? (
                  <p className='text-sm text-muted-foreground'>
                    No analytics data for the selected period.
                  </p>
                ) : (
                  <div className='h-80'>
                    <ResponsiveContainer width='100%' height='100%'>
                      <BarChart data={chartRows}>
                        <CartesianGrid strokeDasharray='3 3' />
                        <XAxis dataKey='label' />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar
                          dataKey='ai_calls'
                          name='AI calls'
                          fill='#3b82f6'
                        />
                        <Bar
                          dataKey='total_tokens'
                          name='Total tokens'
                          fill='#10b981'
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
