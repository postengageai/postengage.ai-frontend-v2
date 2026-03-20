'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { TrendingUp, Loader2, AlertTriangle, Info } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { VoiceDnaApi } from '@/lib/api/voice-dna';
import type {
  VoiceDnaTimelineResponse,
  TimelineSnapshot,
} from '@/lib/types/voice-dna';

interface VoiceDnaTimelineChartProps {
  voiceDnaId: string;
}

type PeriodOption = { label: string; days: number };

const PERIOD_OPTIONS: PeriodOption[] = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 14 days', days: 14 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 60 days', days: 60 },
  { label: 'Last 90 days', days: 90 },
];

// Normalize consistency score (0–1 decimal) to 0–100 so it shares Y axis with quality score
type NormalizedSnapshot = Omit<TimelineSnapshot, 'voice_consistency_score'> & {
  voice_consistency_score: number; // now 0–100
};

function normalizeTimeline(timeline: TimelineSnapshot[]): NormalizedSnapshot[] {
  return timeline.map(snap => ({
    ...snap,
    voice_consistency_score: Math.round(snap.voice_consistency_score * 100),
  }));
}

// ── Custom tooltip ─────────────────────────────────────────────────────────

interface TooltipPayloadEntry {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
  snapshots: TimelineSnapshot[];
}

function CustomTooltip({
  active,
  payload,
  label,
  snapshots,
}: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  const snap = snapshots.find(s => s.date === label);

  return (
    <div className='rounded-lg border bg-background p-3 shadow-lg text-sm space-y-1.5 max-w-xs'>
      <p className='font-semibold'>{label}</p>
      {payload.map(entry => (
        <div
          key={entry.name}
          className='flex items-center justify-between gap-4'
        >
          <span className='flex items-center gap-1.5'>
            <span
              className='inline-block h-2 w-2 rounded-full'
              style={{ backgroundColor: entry.color }}
            />
            <span className='text-muted-foreground'>{entry.name}</span>
          </span>
          <span className='font-medium tabular-nums'>{entry.value}</span>
        </div>
      ))}
      {snap && snap.events.length > 0 && (
        <div className='pt-1.5 border-t space-y-0.5'>
          {snap.events.map((ev, i) => (
            <p key={i} className='text-xs text-muted-foreground'>
              • {ev}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main chart component ───────────────────────────────────────────────────

export function VoiceDnaTimelineChart({
  voiceDnaId,
}: VoiceDnaTimelineChartProps) {
  const [response, setResponse] = useState<VoiceDnaTimelineResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDays, setSelectedDays] = useState(30);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await VoiceDnaApi.getTimeline(voiceDnaId, selectedDays);
        if (!cancelled && res?.data) setResponse(res.data);
      } catch {
        if (!cancelled) setError('Could not load timeline data');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [voiceDnaId, selectedDays]);

  // Normalize consistency decimal to percentage once, memoized
  const chartData: NormalizedSnapshot[] = useMemo(
    () => (response ? normalizeTimeline(response.timeline) : []),
    [response]
  );

  return (
    <Card>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between flex-wrap gap-2'>
          <div>
            <CardTitle className='text-base font-semibold flex items-center gap-2'>
              <TrendingUp className='h-4 w-4' />
              Voice Learning Graph
            </CardTitle>
            <CardDescription>Quality and consistency over time</CardDescription>
          </div>
          <Select
            value={String(selectedDays)}
            onValueChange={v => setSelectedDays(Number(v))}
          >
            <SelectTrigger className='w-36 h-8 text-xs'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERIOD_OPTIONS.map(opt => (
                <SelectItem key={opt.days} value={String(opt.days)}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className='space-y-4'>
        {/* Loading */}
        {isLoading && (
          <div className='flex items-center justify-center py-12'>
            <Loader2 className='h-5 w-5 animate-spin text-muted-foreground' />
          </div>
        )}

        {/* Error */}
        {!isLoading && error && (
          <div className='flex items-center gap-2 py-8 justify-center text-muted-foreground'>
            <AlertTriangle className='h-4 w-4' />
            <span className='text-sm'>{error}</span>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && chartData.length < 2 && (
          <div className='flex flex-col items-center gap-2 py-10 text-center text-muted-foreground'>
            <Info className='h-8 w-8 opacity-40' />
            <p className='text-sm font-medium'>Not enough data yet</p>
            <p className='text-xs max-w-xs'>
              Keep using the bot and reviewing replies — your voice learning
              graph will appear here.
            </p>
          </div>
        )}

        {/* Chart */}
        {!isLoading && !error && chartData.length >= 2 && response && (
          <>
            <ResponsiveContainer width='100%' height={260}>
              <LineChart
                data={chartData}
                margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray='3 3'
                  className='stroke-border/50'
                />
                <XAxis
                  dataKey='date'
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(d: string) => {
                    const parts = d.split('-');
                    return `${parts[1]}/${parts[2]}`;
                  }}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  content={<CustomTooltip snapshots={response.timeline} />}
                />
                <Legend
                  wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                  iconType='circle'
                  iconSize={8}
                />

                {/* Milestone reference lines */}
                {response.milestones.map(m => (
                  <ReferenceLine
                    key={`${m.date}-${m.type ?? 'milestone'}`}
                    x={m.date}
                    stroke='hsl(var(--primary))'
                    strokeDasharray='4 2'
                    strokeOpacity={0.5}
                    label={{
                      value: m.label ?? '',
                      position: 'insideTopRight',
                      fontSize: 10,
                      fill: 'hsl(var(--muted-foreground))',
                    }}
                  />
                ))}

                <Line
                  type='monotone'
                  dataKey='voice_quality_score'
                  name='Quality Score'
                  stroke='hsl(var(--primary))'
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line
                  type='monotone'
                  dataKey='voice_consistency_score'
                  name='Consistency %'
                  stroke='hsl(142 76% 36%)'
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>

            {/* Insight callout */}
            {response.insight && (
              <div className='flex items-start gap-2 rounded-lg bg-muted/40 px-3 py-2.5 text-sm'>
                <Info className='h-4 w-4 text-primary shrink-0 mt-0.5' />
                <span className='text-muted-foreground leading-snug'>
                  {response.insight}
                </span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
