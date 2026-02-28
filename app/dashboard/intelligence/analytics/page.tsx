'use client';

import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { IntelligenceApi } from '@/lib/api/intelligence';
import {
  AnalyticsPeriod,
  IntelligenceAnalyticsItem,
} from '@/lib/types/analytics';
import type { IntelligenceQualityAnalytics } from '@/lib/types/quality';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

// Lazy-loaded chart components for code-splitting
const QualityScorecard = lazy(() =>
  import('@/components/intelligence/analytics/quality-scorecard').then(m => ({
    default: m.QualityScorecard,
  }))
);
const ResponseActions = lazy(() =>
  import('@/components/intelligence/analytics/response-actions').then(m => ({
    default: m.ResponseActions,
  }))
);
const IntentBreakdown = lazy(() =>
  import('@/components/intelligence/analytics/intent-breakdown').then(m => ({
    default: m.IntentBreakdown,
  }))
);
const ConfidenceDistribution = lazy(() =>
  import('@/components/intelligence/analytics/confidence-distribution').then(
    m => ({ default: m.ConfidenceDistribution })
  )
);
const DiversityChart = lazy(() =>
  import('@/components/intelligence/analytics/diversity-chart').then(m => ({
    default: m.DiversityChart,
  }))
);

// Fallback component for charts
function ChartFallback() {
  return <Skeleton className='h-[300px] w-full rounded-lg' />;
}

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

  return (
    <div className='space-y-6 p-6'>
      <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Intelligence Analytics
          </h1>
          <p className='text-muted-foreground'>
            Monitor AI performance, response quality, and automation impact.
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Select
            value={period}
            onValueChange={(v: AnalyticsPeriod) => setPeriod(v)}
          >
            <SelectTrigger className='w-[180px]'>
              <SelectValue placeholder='Select period' />
            </SelectTrigger>
            <SelectContent>
              {periodOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant='outline'
            size='icon'
            onClick={() => setPeriod(period)} // Trigger reload
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
            />
          </Button>
        </div>
      </div>

      <div className='flex flex-col gap-4 md:flex-row md:items-center'>
        <div className='flex-1'>
          <Input
            placeholder='Filter by account ID...'
            value={filterAccount}
            onChange={e => setFilterAccount(e.target.value)}
            className='max-w-sm'
          />
        </div>
        <div className='flex items-center space-x-2'>
          <Switch
            id='advanced-mode'
            checked={showAdvanced}
            onCheckedChange={setShowAdvanced}
          />
          <Label htmlFor='advanced-mode'>Show Advanced Metrics</Label>
        </div>
      </div>

      <Tabs defaultValue='overview' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='quality'>Quality & Safety</TabsTrigger>
          <TabsTrigger value='diversity'>Response Diversity</TabsTrigger>
          <TabsTrigger value='intents'>Intent Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Total Processed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {state.items.reduce(
                    (acc, item) => acc + item.total_processed,
                    0
                  )}
                </div>
                <p className='text-xs text-muted-foreground'>
                  Across all accounts
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Response Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {state.items.length > 0
                    ? Math.round(
                        (state.items.reduce(
                          (acc, item) => acc + item.replied_count,
                          0
                        ) /
                          state.items.reduce(
                            (acc, item) => acc + item.total_processed,
                            0
                          )) *
                          100
                      )
                    : 0}
                  %
                </div>
                <p className='text-xs text-muted-foreground'>
                  Replied vs Processed
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Avg. Latency
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {state.items.length > 0
                    ? Math.round(
                        state.items.reduce(
                          (acc, item) => acc + item.avg_latency_ms,
                          0
                        ) / state.items.length
                      )
                    : 0}
                  ms
                </div>
                <p className='text-xs text-muted-foreground'>Per interaction</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Actions Taken
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {state.items.reduce(
                    (acc, item) => acc + item.actions_taken,
                    0
                  )}
                </div>
                <p className='text-xs text-muted-foreground'>
                  Total actions executed
                </p>
              </CardContent>
            </Card>
          </div>

          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
            <Card className='col-span-4'>
              <CardHeader>
                <CardTitle>Response Actions</CardTitle>
              </CardHeader>
              <CardContent className='pl-2'>
                <Suspense fallback={<ChartFallback />}>
                  <ResponseActions data={filteredItems} />
                </Suspense>
              </CardContent>
            </Card>
            <Card className='col-span-3'>
              <CardHeader>
                <CardTitle>Confidence Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<ChartFallback />}>
                  <ConfidenceDistribution data={filteredItems} />
                </Suspense>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='quality' className='space-y-4'>
          {qualityData ? (
            <Suspense fallback={<ChartFallback />}>
              <QualityScorecard data={qualityData} />
            </Suspense>
          ) : (
            <Alert>
              <AlertCircle className='h-4 w-4' />
              <AlertTitle>No Quality Data</AlertTitle>
              <AlertDescription>
                Quality metrics are not available for this period.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value='diversity' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Response Diversity Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              {qualityData?.diversity ? (
                <Suspense fallback={<ChartFallback />}>
                  <DiversityChart data={qualityData.diversity} />
                </Suspense>
              ) : (
                <div className='flex h-[300px] items-center justify-center text-muted-foreground'>
                  No diversity data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='intents' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Intent Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {qualityData?.intents ? (
                <Suspense fallback={<ChartFallback />}>
                  <IntentBreakdown data={qualityData.intents} />
                </Suspense>
              ) : (
                <div className='flex h-[300px] items-center justify-center text-muted-foreground'>
                  No intent data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
