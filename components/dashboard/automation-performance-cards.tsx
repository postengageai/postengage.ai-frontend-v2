'use client';

import Link from 'next/link';
import { MessageSquare, Target, Mail, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useAutomationCards } from '@/lib/hooks';
import type { AutomationCardResponse } from '@/lib/api/value-analytics';

// ── AutomationCard ────────────────────────────────────────────────────────────

interface AutomationCardProps {
  readonly data: AutomationCardResponse;
}

function AutomationCard({ data }: AutomationCardProps) {
  const dmOpenRate =
    data.dms_sent > 0
      ? Math.round((data.dms_opened / data.dms_sent) * 100)
      : null;

  return (
    <Card className='flex flex-col justify-between overflow-hidden hover:border-primary/40 transition-colors duration-150'>
      <CardContent className='p-4 space-y-4'>
        {/* Name */}
        <div>
          <p className='text-sm font-semibold text-foreground leading-snug line-clamp-1'>
            {data.automation_name}
          </p>
        </div>

        {/* Stats */}
        <div className='space-y-2'>
          <div className='flex items-center gap-2 text-xs text-muted-foreground'>
            <MessageSquare className='h-3.5 w-3.5 text-primary/70 shrink-0' />
            <span>
              <strong className='text-foreground font-semibold'>
                {data.replies_sent.toLocaleString()}
              </strong>{' '}
              replies sent
            </span>
          </div>
          <div className='flex items-center gap-2 text-xs text-muted-foreground'>
            <Target className='h-3.5 w-3.5 text-success/70 shrink-0' />
            <span>
              <strong className='text-foreground font-semibold'>
                {data.leads_captured.toLocaleString()}
              </strong>{' '}
              leads captured
            </span>
          </div>
          {dmOpenRate !== null && (
            <div className='flex items-center gap-2 text-xs text-muted-foreground'>
              <Mail className='h-3.5 w-3.5 text-info/70 shrink-0' />
              <span>
                <strong className='text-foreground font-semibold'>
                  {dmOpenRate}%
                </strong>{' '}
                DM open rate
              </span>
            </div>
          )}
        </div>

        {/* CTA */}
        <Button
          asChild
          variant='ghost'
          size='sm'
          className='w-full h-8 text-xs text-muted-foreground hover:text-primary justify-start px-0'
        >
          <Link href={`/dashboard/automations/${data.automation_id}`}>
            <ExternalLink className='h-3 w-3 mr-1.5' />
            View details
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

// ── AutomationPerformanceCards (section wrapper) ──────────────────────────────

export function AutomationPerformanceCards() {
  const { data, isLoading } = useAutomationCards();

  if (isLoading) {
    return (
      <div className='space-y-3'>
        <Skeleton className='h-5 w-48' />
        <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className='h-44 rounded-xl' />
          ))}
        </div>
      </div>
    );
  }

  if (!data?.length) {
    return null; // Hide section entirely when no automations yet
  }

  return (
    <div className='space-y-3'>
      <h2 className='text-sm font-semibold text-foreground'>
        Automation Performance
      </h2>
      <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'>
        {data.map(card => (
          <AutomationCard key={card.automation_id} data={card} />
        ))}
      </div>
    </div>
  );
}
