'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useBestTimes } from '@/lib/hooks';
import type { BestTimeRecommendation } from '@/lib/api/scheduler';

// ── Constants ─────────────────────────────────────────────────────────────────

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
// 6 time buckets: 0-3, 4-7, 8-11, 12-15, 16-19, 20-23
const TIME_BUCKETS = [
  '12a–4a',
  '4a–8a',
  '8a–12p',
  '12p–4p',
  '4p–8p',
  '8p–12a',
] as const;

function getBucket(hour: number): number {
  return Math.floor(hour / 4);
}

function intensityClass(score: number): string {
  if (score >= 0.8) return 'bg-primary/90 text-primary-foreground';
  if (score >= 0.6) return 'bg-primary/60 text-primary-foreground';
  if (score >= 0.4) return 'bg-primary/35 text-foreground';
  if (score >= 0.2) return 'bg-primary/15 text-foreground';
  return 'bg-muted/40 text-muted-foreground';
}

// ── Build heatmap matrix: [day][bucket] → max score ───────────────────────────

function buildMatrix(recs: BestTimeRecommendation[]): number[][] {
  const matrix: number[][] = Array.from({ length: 7 }, () =>
    Array<number>(6).fill(0)
  );
  for (const rec of recs) {
    const bucket = getBucket(rec.hour_utc);
    const current = matrix[rec.day_of_week][bucket];
    if (rec.engagement_score_normalized > current) {
      matrix[rec.day_of_week][bucket] = rec.engagement_score_normalized;
    }
  }
  return matrix;
}

// ── Low-data banner ──────────────────────────────────────────────────────────

interface LowDataBannerProps {
  readonly show: boolean;
}

function LowDataBanner({ show }: LowDataBannerProps) {
  if (!show) return null;
  return (
    <div className='rounded-lg border border-warning/30 bg-warning/5 px-3 py-2 text-xs text-warning mb-3'>
      Limited data — recommendations will improve as you post more
    </div>
  );
}

// ── Top recommendations list ──────────────────────────────────────────────────

interface TopRecProps {
  readonly recs: BestTimeRecommendation[];
}

function TopRecommendations({ recs }: TopRecProps) {
  const top3 = [...recs]
    .sort(
      (a, b) => b.engagement_score_normalized - a.engagement_score_normalized
    )
    .slice(0, 3);

  if (top3.length === 0) return null;

  return (
    <div className='mt-4 space-y-2'>
      <p className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>
        Top 3 Times
      </p>
      {top3.map((rec, i) => (
        <div key={i} className='flex items-center justify-between text-xs'>
          <span className='text-foreground font-medium'>
            {DAY_LABELS[rec.day_of_week]} · {rec.hour_utc}:00 UTC
          </span>
          <span
            className={cn(
              'text-xs font-semibold',
              rec.confidence_level === 'high'
                ? 'text-success'
                : rec.confidence_level === 'medium'
                  ? 'text-warning'
                  : 'text-muted-foreground'
            )}
          >
            {rec.confidence_level}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function BestTimeHeatmap() {
  const { data: recs = [], isLoading } = useBestTimes();

  const lowData = recs.length > 0 && recs[0].based_on_post_count < 10;
  const matrix = buildMatrix(recs);

  return (
    <Card>
      <CardHeader className='pb-3'>
        <CardTitle className='text-sm font-semibold'>
          Best Times to Post
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className='space-y-2'>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className='h-6 w-full' />
            ))}
          </div>
        ) : (
          <>
            <LowDataBanner show={lowData} />

            {/* Grid */}
            <div className='overflow-x-auto'>
              <table className='w-full text-xs border-collapse'>
                <thead>
                  <tr>
                    <th className='w-10 text-left text-muted-foreground font-normal pb-1' />
                    {TIME_BUCKETS.map(t => (
                      <th
                        key={t}
                        className='text-center text-muted-foreground font-normal pb-1 px-0.5 whitespace-nowrap'
                      >
                        {t}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DAY_LABELS.map((day, d) => (
                    <tr key={day}>
                      <td className='pr-2 text-muted-foreground text-right font-medium py-0.5'>
                        {day}
                      </td>
                      {matrix[d].map((score, b) => (
                        <td key={b} className='py-0.5 px-0.5'>
                          <div
                            className={cn(
                              'rounded h-5 flex items-center justify-center text-[10px] tabular-nums',
                              intensityClass(score)
                            )}
                            title={`${day} ${TIME_BUCKETS[b]}: ${(score * 100).toFixed(0)}%`}
                          >
                            {score > 0 ? `${Math.round(score * 100)}` : ''}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <TopRecommendations recs={recs} />
          </>
        )}
      </CardContent>
    </Card>
  );
}
