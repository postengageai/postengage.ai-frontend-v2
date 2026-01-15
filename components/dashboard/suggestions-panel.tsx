'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  MessageCircle,
  Zap,
  Instagram,
  ArrowRight,
  Sparkles,
  LightbulbIcon,
  Info,
  AlertTriangle,
  MousePointerClick,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Suggestion } from '@/lib/types/dashboard';

interface SuggestionsPanelProps {
  suggestions: Suggestion[];
}

export function SuggestionsPanel({ suggestions }: SuggestionsPanelProps) {
  if (suggestions.length === 0) return null;

  return (
    <section className='lg:sticky lg:top-24'>
      <div className='mb-4'>
        <h2 className='text-lg font-semibold flex items-center gap-2'>
          <Sparkles className='h-4 w-4 text-primary' />
          Smart Suggestions
        </h2>
        <p className='text-sm text-muted-foreground'>Opportunities for you</p>
      </div>

      <div className='space-y-3'>
        {suggestions.map(suggestion => (
          <SuggestionCard key={suggestion.id} suggestion={suggestion} />
        ))}
      </div>
    </section>
  );
}

interface SuggestionCardProps {
  suggestion: Suggestion;
}

function SuggestionCard({ suggestion }: SuggestionCardProps) {
  // Get icon based on suggestion type
  const getIcon = () => {
    switch (suggestion.type) {
      case 'connect':
        return Instagram;
      case 'create':
        return MessageCircle;
      case 'upgrade':
        return Zap;
      case 'optimize':
        return TrendingUp;
      case 'action':
        return MousePointerClick;
      case 'info':
        return Info;
      case 'warning':
        return AlertTriangle;
      default:
        return LightbulbIcon;
    }
  };

  // Get styles based on priority
  const getPriorityStyles = () => {
    switch (suggestion.priority) {
      case 'high':
        return {
          borderClass: 'border-primary/30',
          bgClass: 'bg-primary/5',
          iconBgClass: 'bg-primary/10 text-primary',
          indicator: 'bg-primary',
        };
      case 'medium':
        return {
          borderClass: 'border-border',
          bgClass: 'bg-card',
          iconBgClass: 'bg-secondary text-foreground',
          indicator: 'bg-muted-foreground',
        };
      case 'low':
      default:
        return {
          borderClass: 'border-border',
          bgClass: 'bg-card/50',
          iconBgClass: 'bg-secondary text-muted-foreground',
          indicator: 'bg-muted',
        };
    }
  };

  const Icon = getIcon();
  const styles = getPriorityStyles();
  const actionUrl = suggestion.action_url;
  const actionLabel = suggestion.action_label || 'View';

  return (
    <Card
      className={cn(
        'overflow-hidden transition-all hover:shadow-md',
        styles.borderClass,
        styles.bgClass
      )}
    >
      <CardContent className='p-4'>
        <div className='flex gap-3'>
          <div
            className={cn(
              'h-8 w-8 rounded-md flex items-center justify-center flex-shrink-0',
              styles.iconBgClass
            )}
          >
            <Icon className='h-4 w-4' />
          </div>
          <div className='flex-1 space-y-1'>
            <div className='flex items-start justify-between gap-2'>
              <h3 className='font-medium text-sm leading-none'>
                {suggestion.title}
              </h3>
              {suggestion.priority === 'high' && (
                <span className='flex h-2 w-2 rounded-full bg-primary flex-shrink-0' />
              )}
            </div>
            <p className='text-xs text-muted-foreground leading-relaxed'>
              {suggestion.description}
            </p>

            {actionUrl && (
              <Button
                variant='link'
                className='h-auto p-0 text-xs mt-2 text-primary'
                asChild
              >
                <Link href={actionUrl}>
                  {actionLabel}
                  <ArrowRight className='ml-1 h-3 w-3' />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
