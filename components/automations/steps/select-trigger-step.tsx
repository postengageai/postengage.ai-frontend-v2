'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  MessageCircle,
  Mail,
  ChevronLeft,
  ImageIcon,
  Plus,
  X,
  Check,
  Loader2,
  AtSign,
  UserPlus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MediaSelectorModal } from '../media-selector-modal';
import type { AutomationFormData } from '../automation-wizard';
import type { Media } from '@/lib/api/media';
import { InstagramMediaApi } from '@/lib/api/instagram/media';
import {
  AutomationTriggerType,
  type AutomationTriggerTypeType,
  AutomationTriggerScope,
  type AutomationTriggerScopeType,
  AutomationTriggerSource,
  type AutomationTriggerSourceType,
} from '@/lib/constants/automations';

interface SelectTriggerStepProps {
  formData: AutomationFormData;
  updateFormData: (data: Partial<AutomationFormData>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const TRIGGERS = [
  {
    type: AutomationTriggerType.NEW_COMMENT,
    label: 'New Comment',
    icon: MessageCircle,
    description: 'Someone comments on your posts or reels',
    badge: 'Most Popular',
  },
  {
    type: AutomationTriggerType.DM_RECEIVED,
    label: 'Direct Message',
    icon: Mail,
    description: 'Someone sends you a direct message',
    badge: null,
  },
  {
    type: AutomationTriggerType.STORY_REPLY,
    label: 'Story Reply',
    icon: ImageIcon,
    description: 'Someone replies to your story',
    badge: null,
  },
  {
    type: AutomationTriggerType.MENTION,
    label: 'Mention',
    icon: AtSign,
    description: 'Someone mentions your account in a post',
    badge: null,
  },
  {
    type: AutomationTriggerType.NEW_FOLLOWER,
    label: 'New Follower',
    icon: UserPlus,
    description: 'Someone starts following your account',
    badge: null,
  },
] as const;

export function SelectTriggerStep({
  formData,
  updateFormData,
  nextStep,
  prevStep,
}: SelectTriggerStepProps) {
  const [selectedTrigger, setSelectedTrigger] =
    useState<AutomationTriggerTypeType | null>(formData.trigger_type || null);
  const [scope, setScope] = useState<AutomationTriggerScopeType>(
    formData.trigger_scope || AutomationTriggerScope.ALL
  );
  const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>(
    formData.content_ids || []
  );
  const [selectedMedia, setSelectedMedia] = useState<Media[]>(
    formData.selected_media || []
  );
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [isSelectedMediaLoading, setIsSelectedMediaLoading] = useState(false);

  useEffect(() => {
    const loadSelectedMedia = async () => {
      if (
        !formData.social_account_id ||
        !formData.content_ids ||
        formData.content_ids.length === 0 ||
        selectedMedia.length > 0
      ) {
        return;
      }

      setIsSelectedMediaLoading(true);

      try {
        const responses = await Promise.all(
          formData.content_ids.map(id =>
            InstagramMediaApi.getMedia(id, {
              social_account_id: formData.social_account_id as string,
            })
          )
        );

        const mappedMedia: Media[] = responses.map(response => {
          const item = response.data;
          return {
            id: item.id,
            name: item.caption || 'Instagram Media',
            url: item.media_url || item.permalink || '',
            thumbnail_url: item.thumbnail_url || item.media_url,
            mime_type:
              item.media_type === 'VIDEO' || item.media_type === 'REELS'
                ? 'video/mp4'
                : 'image/jpeg',
            size: 0,
            description: item.caption,
            created_at: item.timestamp,
            updated_at: item.timestamp,
          };
        });

        setSelectedMedia(mappedMedia);
        setSelectedMediaIds(formData.content_ids);
        updateFormData({ selected_media: mappedMedia });
      } catch (_error) {
        void 0;
      } finally {
        setIsSelectedMediaLoading(false);
      }
    };

    loadSelectedMedia();
  }, [
    formData.content_ids,
    formData.social_account_id,
    selectedMedia.length,
    updateFormData,
  ]);

  const handleSelectTrigger = (trigger: AutomationTriggerTypeType) => {
    setSelectedTrigger(trigger);
    setScope(AutomationTriggerScope.ALL);
    setSelectedMediaIds([]);
    setSelectedMedia([]);

    let source: AutomationTriggerSourceType = AutomationTriggerSource.POST;
    if (trigger === AutomationTriggerType.DM_RECEIVED) {
      source = AutomationTriggerSource.DIRECT_MESSAGE;
    } else if (trigger === AutomationTriggerType.STORY_REPLY) {
      source = AutomationTriggerSource.STORY;
    } else if (trigger === AutomationTriggerType.NEW_FOLLOWER) {
      source = AutomationTriggerSource.PROFILE;
    }

    updateFormData({
      trigger_type: trigger,
      trigger_source: source,
      ...(trigger === AutomationTriggerType.NEW_COMMENT && {
        trigger_scope: AutomationTriggerScope.ALL,
      }),
      content_ids: [],
      selected_media: [],
    });
  };

  const handleScopeChange = (value: string) => {
    const newScope = value as AutomationTriggerScopeType;
    setScope(newScope);
    if (newScope === AutomationTriggerScope.ALL) {
      setSelectedMediaIds([]);
      setSelectedMedia([]);
      updateFormData({
        trigger_scope: AutomationTriggerScope.ALL,
        content_ids: [],
        selected_media: [],
      });
    } else {
      updateFormData({ trigger_scope: AutomationTriggerScope.SPECIFIC });
    }
  };

  const handleMediaSelect = (media: Media[]) => {
    const ids = media.map(m => m.id);
    setSelectedMediaIds(ids);
    setSelectedMedia(media);
    updateFormData({ content_ids: ids, selected_media: media });
  };

  const removeMedia = (id: string) => {
    const newIds = selectedMediaIds.filter(i => i !== id);
    const newMedia = selectedMedia.filter(m => m.id !== id);
    setSelectedMediaIds(newIds);
    setSelectedMedia(newMedia);
    updateFormData({ content_ids: newIds, selected_media: newMedia });
    if (newIds.length === 0) {
      setScope(AutomationTriggerScope.ALL);
      updateFormData({
        trigger_scope: AutomationTriggerScope.ALL,
        content_ids: [],
        selected_media: [],
      });
    }
  };

  const handleNext = () => {
    if (selectedTrigger) {
      const isCommentTrigger =
        selectedTrigger === AutomationTriggerType.NEW_COMMENT;
      updateFormData({
        trigger_type: selectedTrigger,
        trigger_source:
          selectedTrigger === AutomationTriggerType.NEW_COMMENT
            ? AutomationTriggerSource.POST
            : selectedTrigger === AutomationTriggerType.DM_RECEIVED
              ? AutomationTriggerSource.DIRECT_MESSAGE
              : selectedTrigger === AutomationTriggerType.STORY_REPLY
                ? AutomationTriggerSource.STORY
                : selectedTrigger === AutomationTriggerType.NEW_FOLLOWER
                  ? AutomationTriggerSource.PROFILE
                  : AutomationTriggerSource.POST,
        ...(isCommentTrigger && {
          trigger_scope: scope,
          content_ids: selectedMediaIds,
          selected_media: selectedMedia,
        }),
      });
      nextStep();
    }
  };

  const canContinue =
    selectedTrigger &&
    (selectedTrigger !== AutomationTriggerType.NEW_COMMENT ||
      scope === AutomationTriggerScope.ALL ||
      selectedMediaIds.length > 0);

  return (
    <div>
      <h2 className='mb-2 text-2xl font-bold text-foreground'>
        Choose Trigger
      </h2>
      <p className='mb-8 text-muted-foreground'>
        When should this automation run?
      </p>

      {/* Trigger Cards — horizontal compact grid */}
      <div className='mb-8 grid gap-3 sm:grid-cols-2'>
        {TRIGGERS.map(trigger => {
          const Icon = trigger.icon;
          const isSelected = selectedTrigger === trigger.type;

          return (
            <button
              key={trigger.type}
              onClick={() => handleSelectTrigger(trigger.type)}
              className={cn(
                'group relative flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all hover:border-primary/60',
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card'
              )}
            >
              <div
                className={cn(
                  'flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
                  isSelected
                    ? 'bg-primary text-white'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                <Icon className='h-4 w-4' />
              </div>
              <div className='flex-1 min-w-0'>
                <div className='flex flex-wrap items-center gap-1.5'>
                  <p className='font-semibold text-foreground text-sm'>
                    {trigger.label}
                  </p>
                  {trigger.badge && (
                    <Badge className='bg-primary/10 text-[10px] text-primary px-1.5 py-0'>
                      {trigger.badge}
                    </Badge>
                  )}
                </div>
                <p className='mt-0.5 text-xs text-muted-foreground'>
                  {trigger.description}
                </p>
              </div>
              {isSelected && (
                <div className='flex-shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white'>
                  <Check className='h-3 w-3' />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Trigger Configuration (only for New Comment) */}
      {selectedTrigger === AutomationTriggerType.NEW_COMMENT && (
        <div className='mb-8 rounded-xl border border-border bg-card/50 p-5'>
          <h3 className='mb-4 text-sm font-semibold text-foreground'>
            Trigger Configuration
          </h3>

          <div className='space-y-4'>
            {/* Apply to */}
            <div className='flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-4'>
              <label className='min-w-[80px] text-sm text-muted-foreground'>
                Apply to
              </label>
              <Select value={scope} onValueChange={handleScopeChange}>
                <SelectTrigger className='sm:w-56'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={AutomationTriggerScope.ALL}>
                    All posts & reels
                  </SelectItem>
                  <SelectItem value={AutomationTriggerScope.SPECIFIC}>
                    Specific posts
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Specific Posts Picker */}
            {scope === AutomationTriggerScope.SPECIFIC && (
              <div className='rounded-lg border border-border bg-background p-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-foreground'>
                      Selected Posts
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      {selectedMediaIds.length === 0
                        ? 'No posts selected yet'
                        : `${selectedMediaIds.length} post${selectedMediaIds.length !== 1 ? 's' : ''} selected`}
                    </p>
                  </div>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setIsMediaModalOpen(true)}
                    className='gap-1.5'
                  >
                    <Plus className='h-3.5 w-3.5' />
                    Select Posts
                  </Button>
                </div>

                {isSelectedMediaLoading && selectedMediaIds.length > 0 && (
                  <div className='mt-3 flex h-16 items-center justify-center'>
                    <Loader2 className='h-5 w-5 animate-spin text-primary' />
                  </div>
                )}

                {!isSelectedMediaLoading && selectedMediaIds.length > 0 && (
                  <div className='mt-3 flex flex-wrap gap-2'>
                    {selectedMediaIds.map(id => {
                      const media = selectedMedia.find(m => m.id === id);
                      const thumbnailUrl =
                        media?.thumbnail_url || media?.url || '';
                      return (
                        <div
                          key={id}
                          className='group relative h-16 w-16 overflow-hidden rounded-md border border-border'
                        >
                          <Image
                            src={thumbnailUrl}
                            alt='Selected post'
                            width={80}
                            height={80}
                            className='h-full w-full object-cover'
                          />
                          <button
                            onClick={() => removeMedia(id)}
                            className='absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-white opacity-0 transition-opacity group-hover:opacity-100'
                          >
                            <X className='h-3 w-3' />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {scope === AutomationTriggerScope.SPECIFIC &&
                  selectedMediaIds.length === 0 && (
                    <p className='mt-3 text-xs text-amber-500'>
                      Please select at least one post to continue
                    </p>
                  )}
              </div>
            )}
          </div>
        </div>
      )}

      <div className='flex flex-col gap-3 sm:flex-row sm:justify-between'>
        <Button
          variant='outline'
          onClick={prevStep}
          className='w-full bg-transparent sm:w-auto'
        >
          <ChevronLeft className='mr-2 h-4 w-4' />
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!canContinue}
          className='w-full sm:w-auto'
        >
          Continue
        </Button>
      </div>

      <MediaSelectorModal
        open={isMediaModalOpen}
        onOpenChange={setIsMediaModalOpen}
        selectedIds={selectedMediaIds}
        initialMedia={selectedMedia}
        onSelect={handleMediaSelect}
        socialAccountId={formData.social_account_id}
      />
    </div>
  );
}
