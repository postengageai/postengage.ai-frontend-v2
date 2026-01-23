'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Plus,
  MessageCircle,
  Send,
  ArrowRight,
  Zap,
  TrendingUp,
  MoreHorizontal,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { Automation } from '@/lib/types/dashboard';

interface AutomationSummaryProps {
  automations: Automation[];
  onToggle?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function AutomationSummary({
  automations,
  onToggle,
  onDelete,
}: AutomationSummaryProps) {
  const activeCount = automations.filter(a => a.status === 'running').length;
  const totalHandled = automations.reduce((acc, a) => acc + a.handledCount, 0);

  if (automations.length === 0) {
    return <EmptyAutomationsState />;
  }

  return (
    <Card>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle className='text-lg'>Your Automations</CardTitle>
            <p className='text-sm text-muted-foreground mt-0.5'>
              {activeCount} of {automations.length} active
            </p>
          </div>
          <Button size='sm' asChild>
            <Link href='/dashboard/automations/new'>
              <Plus className='h-4 w-4 mr-1.5' />
              New
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className='pt-0'>
        {/* Summary stats */}
        <div className='flex items-center gap-4 pb-4 mb-4 border-b border-border'>
          <div className='flex items-center gap-2 text-sm'>
            <div className='p-1.5 rounded-md bg-success/10'>
              <TrendingUp className='h-3.5 w-3.5 text-success' />
            </div>
            <span className='text-muted-foreground'>
              <span className='font-semibold text-foreground'>
                {totalHandled.toLocaleString()}
              </span>{' '}
              total handled
            </span>
          </div>
        </div>

        {/* Automation list */}
        <div className='space-y-2'>
          {automations.slice(0, 4).map(automation => (
            <AutomationCard
              key={automation.id}
              automation={automation}
              onToggle={onToggle}
              onDelete={onDelete}
            />
          ))}
        </div>

        {/* View all link */}
        {automations.length > 4 && (
          <div className='mt-4 pt-3 border-t border-border'>
            <Link
              href='/dashboard/automations'
              className='text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1'
            >
              View all {automations.length} automations
              <ArrowRight className='h-3 w-3' />
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface AutomationCardProps {
  automation: Automation;
  onToggle?: (id: string) => void;
  onDelete?: (id: string) => void;
}

function AutomationCard({
  automation,
  onToggle,
  onDelete,
}: AutomationCardProps) {
  const isActive = automation.status === 'running';

  const getActionIcon = () => {
    switch (automation.action) {
      case 'reply':
        return <MessageCircle className='h-3.5 w-3.5' />;
      case 'dm':
        return <Send className='h-3.5 w-3.5' />;
      default:
        return <Zap className='h-3.5 w-3.5' />;
    }
  };

  const formatLastRun = (date?: Date) => {
    if (!date) return 'Never run';
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div
      className={cn(
        'group flex items-center justify-between p-3 rounded-lg border transition-colors',
        isActive
          ? 'bg-card border-border'
          : 'bg-secondary/30 border-transparent'
      )}
    >
      <Link
        href={`/dashboard/automations/${automation.id}`}
        className='flex items-center gap-3 min-w-0 flex-1 cursor-pointer'
      >
        <div
          className={cn(
            'p-2 rounded-md',
            isActive ? 'bg-primary/10' : 'bg-muted'
          )}
        >
          {getActionIcon()}
        </div>
        <div className='min-w-0'>
          <p className='text-sm font-medium truncate group-hover:text-primary transition-colors'>
            {automation.name}
          </p>
          <div className='flex items-center gap-2 mt-0.5'>
            <span className='text-xs text-muted-foreground'>
              {automation.handledCount} handled
            </span>
            <span className='text-xs text-muted-foreground/50'>•</span>
            <span className='text-xs text-muted-foreground'>
              {formatLastRun(automation.lastRun)}
            </span>
          </div>
        </div>
      </Link>
      <div className='flex items-center gap-3 pl-3'>
        <Badge variant={isActive ? 'default' : 'secondary'} className='text-xs'>
          {isActive ? 'Active' : 'Paused'}
        </Badge>
        <Switch
          checked={isActive}
          onCheckedChange={() => onToggle?.(automation.id)}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' size='icon' className='h-8 w-8 -mr-2'>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/automations/${automation.id}`}>Edit</Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className='text-destructive focus:text-destructive'
              onClick={() => onDelete?.(automation.id)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function EmptyAutomationsState() {
  return (
    <Card className='border-dashed'>
      <CardContent className='p-6'>
        <div className='text-center'>
          <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10'>
            <Zap className='h-6 w-6 text-primary' />
          </div>
          <h3 className='mt-4 font-semibold'>No automations yet</h3>
          <p className='mt-2 text-sm text-muted-foreground max-w-sm mx-auto'>
            Set up your first automation to start auto-replying to comments. It
            only takes 2 minutes.
          </p>
          <Button asChild className='mt-4' size='sm'>
            <Link href='/dashboard/automations/new'>
              <Plus className='h-4 w-4 mr-1.5' />
              Create Automation
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
