'use client';

import type React from 'react';
import Image from 'next/image';

import {
  MessageCircle,
  Hash,
  Mail,
  MessageSquare,
  UserPlus,
  ImageIcon,
  Video,
  Film,
  LayoutGrid,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type {
  TriggerConfig,
  TriggerType,
  TriggerScope,
} from '@/lib/types/automation-builder';
import { getTriggerTypeLabel } from '@/lib/mock/automation-builder-data';

interface TriggerCardProps {
  trigger: TriggerConfig;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<TriggerConfig>) => void;
}

const triggerIcons: Record<TriggerType, React.ReactNode> = {
  new_comment: <MessageCircle className='h-4 w-4' />,
  keyword_mention: <Hash className='h-4 w-4' />,
  new_dm: <Mail className='h-4 w-4' />,
  story_reply: <MessageSquare className='h-4 w-4' />,
  new_follower: <UserPlus className='h-4 w-4' />,
};

const postTypeIcons = {
  image: <ImageIcon className='h-3 w-3' />,
  video: <Video className='h-3 w-3' />,
  reel: <Film className='h-3 w-3' />,
  carousel: <LayoutGrid className='h-3 w-3' />,
};

export function TriggerCard({
  trigger,
  isSelected,
  onSelect,
  onUpdate,
}: TriggerCardProps) {
  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:translate-y-[-2px]',
        isSelected
          ? 'ring-2 ring-primary border-primary shadow-lg shadow-primary/10'
          : 'border-border hover:border-primary/50'
      )}
      onClick={onSelect}
    >
      <CardContent className='p-4'>
        {/* Header */}
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center gap-2'>
            <div className='w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center'>
              {triggerIcons[trigger.type]}
            </div>
            <div>
              <p className='text-xs text-muted-foreground uppercase tracking-wide'>
                When
              </p>
              <p className='font-medium text-sm'>
                {getTriggerTypeLabel(trigger.type)}
              </p>
            </div>
          </div>
          <Badge
            variant='secondary'
            className='bg-blue-500/10 text-blue-500 border-blue-500/20'
          >
            Trigger
          </Badge>
        </div>

        {/* Trigger Type Selector */}
        <div className='space-y-3' onClick={e => e.stopPropagation()}>
          <div className='space-y-1.5'>
            <label className='text-xs text-muted-foreground'>
              Trigger Type
            </label>
            <Select
              value={trigger.type}
              onValueChange={(value: TriggerType) => onUpdate({ type: value })}
            >
              <SelectTrigger className='bg-background/50'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='new_comment'>
                  <div className='flex items-center gap-2'>
                    <MessageCircle className='h-4 w-4' />
                    <span>New Comment</span>
                  </div>
                </SelectItem>
                <SelectItem value='keyword_mention'>
                  <div className='flex items-center gap-2'>
                    <Hash className='h-4 w-4' />
                    <span>Keyword Mention</span>
                  </div>
                </SelectItem>
                <SelectItem value='new_dm'>
                  <div className='flex items-center gap-2'>
                    <Mail className='h-4 w-4' />
                    <span>New DM</span>
                  </div>
                </SelectItem>
                <SelectItem value='story_reply'>
                  <div className='flex items-center gap-2'>
                    <MessageSquare className='h-4 w-4' />
                    <span>Story Reply</span>
                  </div>
                </SelectItem>
                <SelectItem value='new_follower'>
                  <div className='flex items-center gap-2'>
                    <UserPlus className='h-4 w-4' />
                    <span>New Follower</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Scope Selector (only for comment/story triggers) */}
          {(trigger.type === 'new_comment' ||
            trigger.type === 'story_reply') && (
            <div className='space-y-1.5'>
              <label className='text-xs text-muted-foreground'>Apply To</label>
              <Select
                value={trigger.scope}
                onValueChange={(value: TriggerScope) =>
                  onUpdate({ scope: value })
                }
              >
                <SelectTrigger className='bg-background/50'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all_posts'>All Posts</SelectItem>
                  <SelectItem value='specific_posts'>Specific Posts</SelectItem>
                  <SelectItem value='reels_only'>Reels Only</SelectItem>
                  <SelectItem value='stories_only'>Stories Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Selected Posts (when specific_posts is chosen) */}
          {trigger.scope === 'specific_posts' && (
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <label className='text-xs text-muted-foreground'>
                  Selected Posts
                </label>
                <Button
                  variant='ghost'
                  size='sm'
                  className='h-6 text-xs text-primary'
                >
                  + Add Posts
                </Button>
              </div>

              {trigger.selectedPosts && trigger.selectedPosts.length > 0 ? (
                <div className='flex flex-wrap gap-2'>
                  {trigger.selectedPosts.map(post => (
                    <div
                      key={post.id}
                      className='relative w-12 h-12 rounded-lg overflow-hidden border border-border group'
                    >
                      <Image
                        src={post.thumbnail || '/placeholder.svg'}
                        alt=''
                        fill
                        className='object-cover'
                      />
                      <div className='absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
                        {postTypeIcons[post.postType]}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='border border-dashed border-border rounded-lg p-4 text-center'>
                  <p className='text-xs text-muted-foreground'>
                    No posts selected
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    Click "Add Posts" to choose
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Validation indicator */}
        <div className='flex items-center gap-1.5 mt-4 pt-3 border-t border-border'>
          <CheckCircle2 className='h-3.5 w-3.5 text-emerald-500' />
          <span className='text-xs text-emerald-500'>Configured</span>
        </div>
      </CardContent>
    </Card>
  );
}
