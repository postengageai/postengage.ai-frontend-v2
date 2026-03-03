'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  MessageCircle,
  AtSign,
  Mail,
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
import type { Automation } from '@/lib/api/automations';

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
  const isActive = automation.status === 'active';

  // Get trigger icon
  const getTriggerIcon = () => {
    switch (automation.triggers?.[0]?.type) {
      case 'comment_received':
        return MessageCircle;
      case 'keyword_match':
        return AtSign;
      case 'direct_message':
        return Mail;
      case 'story_mention':
        return AtSign;
      default:
        return MessageCircle;
    }
  };

  // Get action icon
  const getActionIcon = () => {
    const firstAction = automation.actions?.[0];
    switch (firstAction?.type) {
      case 'send_message':
        return Mail;
      case 'send_notification':
        return Zap;
      case 'add_tag':
        return AtSign;
      default:
        return MessageCircle;
    }
  };

  // Format last run time
  const formatLastRun = (dateStr?: string) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    const minutes = Math.floor((Date.now() - date.getTime()) / (1000 * 60));
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  // Get trigger/action labels
  const getTriggerLabel = () => {
    const triggerType = automation.triggers?.[0]?.type;
    switch (triggerType) {
      case 'comment_received':
        return 'New comments';
      case 'keyword_match':
        return 'Keyword match';
      case 'direct_message':
        return 'Direct messages';
      case 'story_mention':
        return 'Story mentions';
      default:
        return triggerType || 'Unknown trigger';
    }
  };

  const getActionLabel = () => {
    const firstAction = automation.actions?.[0];
    switch (firstAction?.type) {
      case 'send_message':
        return 'Send message';
      case 'send_notification':
        return 'Send notification';
      case 'add_tag':
        return 'Add tag';
      default:
        return firstAction?.type || 'Unknown action';
    }
  };

  const TriggerIcon = getTriggerIcon();
  const ActionIcon = getActionIcon();

  return (
    <Card
      className={`py-0 overflow-hidden transition-all duration-150 hover:translate-y-[-2px] hover:shadow-lg ${
        !isActive ? 'opacity-75' : ''
      }`}
    >
      <CardContent className='p-5'>
        <div className='flex items-start justify-between gap-4'>
          <div className='flex-1 min-w-0'>
            {/* Header */}
            <div className='flex items-center gap-3'>
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                  isActive
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
                <Zap className='h-3 w-3' />
                <span className='font-mono'>{automation.total_runs || 0}</span>
                <span>total runs</span>
              </div>
              <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                <Clock className='h-3 w-3' />
                <span>{formatLastRun(automation.last_run_at)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className='flex items-center gap-2 shrink-0'>
            <div className='flex items-center gap-2'>
              <Switch
                checked={isActive}
                onCheckedChange={() => onToggle(automation.id)}
              />
              {isActive ? (
                <Badge
                  variant='secondary'
                  className='bg-emerald-500/10 text-emerald-500 border-0 text-xs'
                >
                  Active
                </Badge>
              ) : (
                <Badge variant='secondary' className='text-xs'>
                  Inactive
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
