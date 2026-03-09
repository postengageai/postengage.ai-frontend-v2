'use client';

import { MessageSquare, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { ConversationSummary } from '@/lib/types/memory';

interface MemoryTimelineProps {
  conversations: ConversationSummary[];
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getMoodEmoji(mood: string): string {
  const moodMap: Record<string, string> = {
    positive: '😊',
    negative: '😞',
    neutral: '😐',
    angry: '😠',
    excited: '🤩',
    confused: '😕',
    satisfied: '😌',
    frustrated: '😤',
  };
  return moodMap[mood.toLowerCase()] || '💬';
}

export function MemoryTimeline({ conversations }: MemoryTimelineProps) {
  if (conversations.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-8 text-center'>
        <MessageSquare className='h-8 w-8 text-muted-foreground mb-2 opacity-40' />
        <p className='text-sm text-muted-foreground'>
          No conversation summaries yet. Summaries are generated after
          multi-turn interactions.
        </p>
      </div>
    );
  }

  const sorted = [...conversations].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className='relative'>
      {/* Timeline line */}
      <div className='absolute left-4 top-0 bottom-0 w-px bg-border' />

      <div className='space-y-4'>
        {sorted.map((conv, index) => (
          <div key={conv.conversation_id} className='relative pl-10'>
            {/* Timeline dot */}
            <div className='absolute left-[10px] top-2 h-3 w-3 rounded-full border-2 border-primary bg-background' />

            <div className='rounded-lg border p-4 bg-card hover:shadow-sm transition-shadow'>
              <div className='flex items-start justify-between gap-2 mb-2'>
                <div className='flex items-center gap-2'>
                  <span className='text-lg' title={conv.mood}>
                    {getMoodEmoji(conv.mood)}
                  </span>
                  <span className='text-xs text-muted-foreground'>
                    {formatDate(conv.created_at)}
                  </span>
                </div>
                <Badge variant='secondary' className='text-[10px]'>
                  {conv.message_count} messages
                </Badge>
              </div>

              <p className='text-sm leading-relaxed'>{conv.summary}</p>

              {conv.topics.length > 0 && (
                <div className='flex flex-wrap gap-1 mt-2'>
                  {conv.topics.map(topic => (
                    <Badge
                      key={topic}
                      variant='outline'
                      className='text-[10px]'
                    >
                      {topic}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Date divider between items with different dates */}
            {index < sorted.length - 1 &&
              formatDate(conv.created_at) !==
                formatDate(sorted[index + 1].created_at) && (
                <div className='flex items-center gap-2 my-2 ml-[-24px]'>
                  <ArrowRight className='h-3 w-3 text-muted-foreground' />
                </div>
              )}
          </div>
        ))}
      </div>
    </div>
  );
}
