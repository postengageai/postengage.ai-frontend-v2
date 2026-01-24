'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  MessageCircle,
  AtSign,
  Mail,
  Heart,
  Zap,
  Clock,
  MoreHorizontal,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import type { Automation } from '@/lib/types/dashboard';

interface AutomationCardProps {
  automation: Automation;
  onToggle: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function AutomationCard({
  automation,
  onToggle,
  onDelete,
}: AutomationCardProps) {
  const isRunning = automation.status === 'running';

  // Get trigger icon
  const getTriggerIcon = () => {
    switch (automation.trigger) {
      case 'comment':
        return MessageCircle;
      case 'keyword':
        return AtSign;
      case 'dm':
        return Mail;
      case 'mention':
        return AtSign;
      default:
        return MessageCircle;
    }
  };

  // Get action icon
  const getActionIcon = () => {
    switch (automation.action) {
      case 'reply':
        return MessageCircle;
      case 'dm':
        return Mail;
      case 'like':
        return Heart;
      default:
        return MessageCircle;
    }
  };

  // Format last run time
  const formatLastRun = (date?: Date) => {
    if (!date) return 'Never';
    const minutes = Math.floor((Date.now() - date.getTime()) / (1000 * 60));
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  // Get trigger/action labels
  const getTriggerLabel = () => {
    switch (automation.trigger) {
      case 'comment':
        return 'New comments';
      case 'keyword':
        return 'Keyword match';
      case 'dm':
        return 'Direct messages';
      case 'mention':
        return 'Mentions';
      default:
        return automation.trigger;
    }
  };

  const getActionLabel = () => {
    switch (automation.action) {
      case 'reply':
        return 'Auto-reply';
      case 'dm':
        return 'Send DM';
      case 'like':
        return 'Like';
      default:
        return automation.action;
    }
  };

  const TriggerIcon = getTriggerIcon();
  const ActionIcon = getActionIcon();

  return (
    <Card
      className={`py-0 overflow-hidden transition-all duration-150 hover:translate-y-[-2px] hover:shadow-lg ${
        !isRunning ? 'opacity-75' : ''
      }`}
    >
      <CardContent className='p-5'>
        <div className='flex items-start justify-between gap-4'>
          <div className='flex-1 min-w-0'>
            {/* Header */}
            <div className='flex items-center gap-3'>
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                  isRunning
                    ? 'bg-primary/10 text-primary'
                    : 'bg-secondary text-muted-foreground'
                }`}
              >
                <TriggerIcon className='h-4 w-4' />
              </div>
              <div className='min-w-0'>
                <h3 className='font-medium truncate'>{automation.name}</h3>
                <div className='flex items-center gap-2 mt-0.5'>
                  <span className='text-xs text-muted-foreground'>
                    {getTriggerLabel()}
                  </span>
                  <span className='text-xs text-muted-foreground'>→</span>
                  <span className='text-xs text-muted-foreground flex items-center gap-1'>
                    <ActionIcon className='h-3 w-3' />
                    {getActionLabel()}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className='flex items-center gap-4 mt-4 pt-3 border-t border-border'>
              <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                <MessageCircle className='h-3 w-3' />
                <span className='font-mono'>{automation.handledCount}</span>
                <span>handled</span>
              </div>
              <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                <Zap className='h-3 w-3' />
                <span className='font-mono'>{automation.creditCost}</span>
                <span>
                  credit{automation.creditCost !== 1 ? 's' : ''}/action
                </span>
              </div>
              <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                <Clock className='h-3 w-3' />
                <span>{formatLastRun(automation.lastRun)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className='flex items-center gap-2 shrink-0'>
            <div className='flex items-center gap-2'>
              <Switch
                checked={isRunning}
                onCheckedChange={() => onToggle(automation.id)}
              />
              {isRunning ? (
                <Badge
                  variant='secondary'
                  className='bg-success/10 text-success border-0 text-xs'
                >
                  Active
                </Badge>
              ) : (
                <Badge variant='secondary' className='text-xs'>
                  Paused
                </Badge>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' size='icon' className='h-8 w-8'>
                  <MoreHorizontal className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuItem>Duplicate</DropdownMenuItem>
                <DropdownMenuItem>View history</DropdownMenuItem>
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
      </CardContent>
    </Card>
  );
}
