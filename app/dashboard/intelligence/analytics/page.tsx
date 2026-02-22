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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';

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
  const [state, setState] = useState<IntelligenceAnalyticsState>({
    periodLabel: '',
    items: [],
  });

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const response = await IntelligenceApi.getIntelligenceAnalytics({
          period,
        });
        const data = response.data;
        const label =
          data.period && data.period.start && data.period.end
            ? `${data.period.start.slice(0, 10)} → ${data.period.end.slice(
                0,
                10
              )}`
            : '';
        setState({
          periodLabel: label,
          items: data.items || [],
        });
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
            Monitor AI usage, tokens and fallback behaviour over time.
          </p>
          {state.periodLabel && (
            <p className='text-xs text-muted-foreground mt-1'>
              Period: {state.periodLabel}
            </p>
          )}
        </div>
        <div className='flex items-center gap-3'>
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
            <Skeleton className='h-48 w-full' />
            <Skeleton className='h-64 w-full' />
          </div>
        ) : (
          <>
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

            <Card>
              <CardHeader>
                <CardTitle>Daily Breakdown by Social Account</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredItems.length === 0 ? (
                  <p className='text-sm text-muted-foreground'>
                    No analytics data to display.
                  </p>
                ) : (
                  <div className='border rounded-lg overflow-x-auto'>
                    <Table>
                      <TableHeader>
                        <TableRow className='bg-muted/40 hover:bg-muted/40'>
                          <TableHead>Date</TableHead>
                          <TableHead>Social Account</TableHead>
                          <TableHead className='text-right'>AI Calls</TableHead>
                          <TableHead className='text-right'>
                            Prompt Tokens
                          </TableHead>
                          <TableHead className='text-right'>
                            Completion Tokens
                          </TableHead>
                          <TableHead className='text-right'>
                            Total Tokens
                          </TableHead>
                          <TableHead className='text-right'>
                            Fallback Rate
                          </TableHead>
                          <TableHead className='text-right'>
                            Escalation Rate
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredItems.map(item => (
                          <TableRow
                            key={`${item.date}-${item.social_account_id}`}
                          >
                            <TableCell>{item.date}</TableCell>
                            <TableCell>{item.social_account_id}</TableCell>
                            <TableCell className='text-right'>
                              {item.ai_calls}
                            </TableCell>
                            <TableCell className='text-right'>
                              {item.prompt_tokens}
                            </TableCell>
                            <TableCell className='text-right'>
                              {item.completion_tokens}
                            </TableCell>
                            <TableCell className='text-right'>
                              {item.total_tokens}
                            </TableCell>
                            <TableCell className='text-right'>
                              {(item.fallback_rate * 100).toFixed(1)}%
                            </TableCell>
                            <TableCell className='text-right'>
                              {(item.escalation_rate * 100).toFixed(1)}%
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
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
