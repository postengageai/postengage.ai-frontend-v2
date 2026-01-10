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
} from 'lucide-react';
import type { Suggestion } from '@/lib/types/dashboard';

interface SuggestionsPanelProps {
  suggestions: Suggestion[];
}

export function SuggestionsPanel({ suggestions }: SuggestionsPanelProps) {
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
        return {
          borderClass: 'border-border',
          bgClass: 'bg-card/50',
          iconBgClass: 'bg-secondary text-muted-foreground',
          indicator: 'bg-muted',
        };
      default:
        return {
          borderClass: 'border-border',
          bgClass: 'bg-card',
          iconBgClass: 'bg-secondary text-muted-foreground',
          indicator: 'bg-muted',
        };
    }
  };

  // Get action link based on type
  const getActionLink = () => {
    switch (suggestion.type) {
      case 'connect':
        return '/dashboard/connect';
      case 'create':
        return '/dashboard/automations/new';
      case 'upgrade':
        return '/dashboard/billing';
      case 'optimize':
        return '/dashboard/automations/new';
      default:
        return '/dashboard';
    }
  };

  const Icon = getIcon();
  const styles = getPriorityStyles();

  return (
    <Card
      className={`py-0 overflow-hidden transition-all duration-150 hover:translate-y-[-2px] hover:shadow-lg ${styles.borderClass} ${styles.bgClass}`}
    >
      <CardContent className='p-4'>
        <div className='flex gap-3'>
          {/* Priority indicator */}
          <div className='flex flex-col items-center gap-2'>
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${styles.iconBgClass}`}
            >
              <Icon className='h-4 w-4' />
            </div>
            {suggestion.priority === 'high' && (
              <div className='relative flex h-2 w-2'>
                <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75' />
                <span className='relative inline-flex h-2 w-2 rounded-full bg-primary' />
              </div>
            )}
          </div>

          {/* Content */}
          <div className='flex-1 min-w-0'>
            <h3 className='font-medium text-sm'>{suggestion.title}</h3>
            <p className='text-xs text-muted-foreground mt-0.5 line-clamp-2'>
              {suggestion.description}
            </p>

            <Button
              variant='ghost'
              size='sm'
              className='mt-2 -ml-2 h-7 px-2 text-xs text-primary'
              asChild
            >
              <Link href={getActionLink()}>
                {suggestion.action}
                <ArrowRight className='ml-1 h-3 w-3' />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
