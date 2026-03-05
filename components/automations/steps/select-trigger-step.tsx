'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
      // Only set scope for comment triggers
      ...(trigger === AutomationTriggerType.NEW_COMMENT && {
        trigger_scope: AutomationTriggerScope.ALL,
      }),
      content_ids: [],
      selected_media: [],
    });
  };

  const handleScopeChange = (newScope: AutomationTriggerScopeType) => {
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
    // If no media selected, revert to "all" scope
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

  // Validate: if specific scope selected, must have at least 1 post
  const canContinue =
    selectedTrigger &&
    (selectedTrigger !== AutomationTriggerType.NEW_COMMENT ||
      scope === AutomationTriggerScope.ALL ||
      selectedMediaIds.length > 0);

  return (
    <div>
      <h2 className='mb-2 text-xl font-bold text-foreground sm:text-2xl'>
        Choose Trigger
      </h2>
      <p className='mb-6 text-sm text-muted-foreground sm:mb-8 sm:text-base'>
        When should this automation run?
      </p>

      <div className='grid gap-4 md:grid-cols-2'>
        {/* New Comment Trigger */}
        <button
          onClick={() => handleSelectTrigger(AutomationTriggerType.NEW_COMMENT)}
          className='group relative overflow-hidden rounded-lg border-2 border-border bg-card p-4 text-left transition-all hover:border-primary hover:bg-card/80 sm:p-6'
          style={{
            borderColor:
              selectedTrigger === AutomationTriggerType.NEW_COMMENT
                ? 'hsl(var(--primary))'
                : undefined,
            backgroundColor:
              selectedTrigger === AutomationTriggerType.NEW_COMMENT
                ? 'hsl(var(--primary) / 0.05)'
                : undefined,
          }}
        >
          <div className='flex items-start gap-3 sm:gap-4'>
            <div
              className='rounded-lg p-2 sm:p-3'
              style={{
                background:
                  selectedTrigger === AutomationTriggerType.NEW_COMMENT
                    ? 'hsl(var(--primary) / 0.1)'
                    : 'hsl(var(--muted))',
              }}
            >
              <MessageCircle
                className='h-6 w-6 sm:h-8 sm:w-8'
                style={{
                  color:
                    selectedTrigger === AutomationTriggerType.NEW_COMMENT
                      ? 'hsl(var(--primary))'
                      : 'hsl(var(--muted-foreground))',
                }}
              />
            </div>
            <div className='flex-1'>
              <h3 className='text-base font-semibold text-foreground sm:text-lg'>
                New Comment
              </h3>
              <p className='mt-1 text-xs text-muted-foreground sm:text-sm'>
                Triggers when someone comments on your posts or reels
              </p>
              <div className='mt-3 flex flex-wrap gap-2 sm:mt-4'>
                <Badge
                  variant='secondary'
                  className='bg-primary/10 text-primary text-xs'
                >
                  Posts
                </Badge>
                <Badge
                  variant='secondary'
                  className='bg-primary/10 text-primary text-xs'
                >
                  Reels
                </Badge>
              </div>
            </div>
          </div>
          {selectedTrigger === AutomationTriggerType.NEW_COMMENT && (
            <div className='absolute right-3 top-3 rounded-full bg-primary p-1 sm:right-4 sm:top-4'>
              <Check className='h-3 w-3 text-white sm:h-4 sm:w-4' />
            </div>
          )}
        </button>

        {/* DM Received Trigger */}
        <button
          onClick={() => handleSelectTrigger(AutomationTriggerType.DM_RECEIVED)}
          className='group relative overflow-hidden rounded-lg border-2 border-border bg-card p-4 text-left transition-all hover:border-primary hover:bg-card/80 sm:p-6'
          style={{
            borderColor:
              selectedTrigger === AutomationTriggerType.DM_RECEIVED
                ? 'hsl(var(--primary))'
                : undefined,
            backgroundColor:
              selectedTrigger === AutomationTriggerType.DM_RECEIVED
                ? 'hsl(var(--primary) / 0.05)'
                : undefined,
          }}
        >
          <div className='flex items-start gap-3 sm:gap-4'>
            <div
              className='rounded-lg p-2 sm:p-3'
              style={{
                background:
                  selectedTrigger === AutomationTriggerType.DM_RECEIVED
                    ? 'hsl(var(--primary) / 0.1)'
                    : 'hsl(var(--muted))',
              }}
            >
              <Mail
                className='h-6 w-6 sm:h-8 sm:w-8'
                style={{
                  color:
                    selectedTrigger === AutomationTriggerType.DM_RECEIVED
                      ? 'hsl(var(--primary))'
                      : 'hsl(var(--muted-foreground))',
                }}
              />
            </div>
            <div className='flex-1'>
              <h3 className='text-base font-semibold text-foreground sm:text-lg'>
                DM Received
              </h3>
              <p className='mt-1 text-xs text-muted-foreground sm:text-sm'>
                Triggers when you receive a direct message
              </p>
              <div className='mt-3 flex gap-2 sm:mt-4'>
                <Badge
                  variant='secondary'
                  className='bg-primary/10 text-primary text-xs'
                >
                  Direct Messages
                </Badge>
              </div>
            </div>
          </div>
          {selectedTrigger === AutomationTriggerType.DM_RECEIVED && (
            <div className='absolute right-3 top-3 rounded-full bg-primary p-1 sm:right-4 sm:top-4'>
              <Check className='h-3 w-3 text-white sm:h-4 sm:w-4' />
            </div>
          )}
        </button>

        {/* Story Reply Trigger */}
        <button
          onClick={() => handleSelectTrigger(AutomationTriggerType.STORY_REPLY)}
          className='group relative overflow-hidden rounded-lg border-2 border-border bg-card p-4 text-left transition-all hover:border-primary hover:bg-card/80 sm:p-6'
          style={{
            borderColor:
              selectedTrigger === AutomationTriggerType.STORY_REPLY
                ? 'hsl(var(--primary))'
                : undefined,
            backgroundColor:
              selectedTrigger === AutomationTriggerType.STORY_REPLY
                ? 'hsl(var(--primary) / 0.05)'
                : undefined,
          }}
        >
          <div className='flex items-start gap-3 sm:gap-4'>
            <div
              className='rounded-lg p-2 sm:p-3'
              style={{
                background:
                  selectedTrigger === AutomationTriggerType.STORY_REPLY
                    ? 'hsl(var(--primary) / 0.1)'
                    : 'hsl(var(--muted))',
              }}
            >
              <ImageIcon
                className='h-6 w-6 sm:h-8 sm:w-8'
                style={{
                  color:
                    selectedTrigger === AutomationTriggerType.STORY_REPLY
                      ? 'hsl(var(--primary))'
                      : 'hsl(var(--muted-foreground))',
                }}
              />
            </div>
            <div className='flex-1'>
              <h3 className='text-base font-semibold text-foreground sm:text-lg'>
                Story Reply
              </h3>
              <p className='mt-1 text-xs text-muted-foreground sm:text-sm'>
                Triggers when someone replies to your story
              </p>
              <div className='mt-3 flex gap-2 sm:mt-4'>
                <Badge
                  variant='secondary'
                  className='bg-primary/10 text-primary text-xs'
                >
                  Stories
                </Badge>
              </div>
            </div>
          </div>
          {selectedTrigger === AutomationTriggerType.STORY_REPLY && (
            <div className='absolute right-3 top-3 rounded-full bg-primary p-1 sm:right-4 sm:top-4'>
              <Check className='h-3 w-3 text-white sm:h-4 sm:w-4' />
            </div>
          )}
        </button>

        {/* Mention Trigger */}
        <button
          onClick={() => handleSelectTrigger(AutomationTriggerType.MENTION)}
          className='group relative overflow-hidden rounded-lg border-2 border-border bg-card p-4 text-left transition-all hover:border-primary hover:bg-card/80 sm:p-6'
          style={{
            borderColor:
              selectedTrigger === AutomationTriggerType.MENTION
                ? 'hsl(var(--primary))'
                : undefined,
            backgroundColor:
              selectedTrigger === AutomationTriggerType.MENTION
                ? 'hsl(var(--primary) / 0.05)'
                : undefined,
          }}
        >
          <div className='flex items-start gap-3 sm:gap-4'>
            <div
              className='rounded-lg p-2 sm:p-3'
              style={{
                background:
                  selectedTrigger === AutomationTriggerType.MENTION
                    ? 'hsl(var(--primary) / 0.1)'
                    : 'hsl(var(--muted))',
              }}
            >
              <AtSign
                className='h-6 w-6 sm:h-8 sm:w-8'
                style={{
                  color:
                    selectedTrigger === AutomationTriggerType.MENTION
                      ? 'hsl(var(--primary))'
                      : 'hsl(var(--muted-foreground))',
                }}
              />
            </div>
            <div className='flex-1'>
              <h3 className='text-base font-semibold text-foreground sm:text-lg'>
                Mention
              </h3>
              <p className='mt-1 text-xs text-muted-foreground sm:text-sm'>
                Triggers when someone mentions your account
              </p>
              <div className='mt-3 flex gap-2 sm:mt-4'>
                <Badge
                  variant='secondary'
                  className='bg-primary/10 text-primary text-xs'
                >
                  Mentions
                </Badge>
              </div>
            </div>
          </div>
          {selectedTrigger === AutomationTriggerType.MENTION && (
            <div className='absolute right-3 top-3 rounded-full bg-primary p-1 sm:right-4 sm:top-4'>
              <Check className='h-3 w-3 text-white sm:h-4 sm:w-4' />
            </div>
          )}
        </button>

        {/* New Follower Trigger */}
        <button
          onClick={() =>
            handleSelectTrigger(AutomationTriggerType.NEW_FOLLOWER)
          }
          className='group relative overflow-hidden rounded-lg border-2 border-border bg-card p-4 text-left transition-all hover:border-primary hover:bg-card/80 sm:p-6'
          style={{
            borderColor:
              selectedTrigger === AutomationTriggerType.NEW_FOLLOWER
                ? 'hsl(var(--primary))'
                : undefined,
            backgroundColor:
              selectedTrigger === AutomationTriggerType.NEW_FOLLOWER
                ? 'hsl(var(--primary) / 0.05)'
                : undefined,
          }}
        >
          <div className='flex items-start gap-3 sm:gap-4'>
            <div
              className='rounded-lg p-2 sm:p-3'
              style={{
                background:
                  selectedTrigger === AutomationTriggerType.NEW_FOLLOWER
                    ? 'hsl(var(--primary) / 0.1)'
                    : 'hsl(var(--muted))',
              }}
            >
              <UserPlus
                className='h-6 w-6 sm:h-8 sm:w-8'
                style={{
                  color:
                    selectedTrigger === AutomationTriggerType.NEW_FOLLOWER
                      ? 'hsl(var(--primary))'
                      : 'hsl(var(--muted-foreground))',
                }}
              />
            </div>
            <div className='flex-1'>
              <h3 className='text-base font-semibold text-foreground sm:text-lg'>
                New Follower
              </h3>
              <p className='mt-1 text-xs text-muted-foreground sm:text-sm'>
                Triggers when someone follows your account
              </p>
              <div className='mt-3 flex gap-2 sm:mt-4'>
                <Badge
                  variant='secondary'
                  className='bg-primary/10 text-primary text-xs'
                >
                  Followers
                </Badge>
              </div>
            </div>
          </div>
          {selectedTrigger === AutomationTriggerType.NEW_FOLLOWER && (
            <div className='absolute right-3 top-3 rounded-full bg-primary p-1 sm:right-4 sm:top-4'>
              <Check className='h-3 w-3 text-white sm:h-4 sm:w-4' />
            </div>
          )}
        </button>
      </div>

      {/* Scope Selection for New Comment */}
      {selectedTrigger === AutomationTriggerType.NEW_COMMENT && (
        <div className='mt-6'>
          <h3 className='mb-3 text-sm font-medium text-foreground'>Apply to</h3>
          <div className='grid gap-3 md:grid-cols-2'>
            <button
              onClick={() => handleScopeChange(AutomationTriggerScope.ALL)}
              className='rounded-lg border-2 p-3 text-left transition-all hover:border-primary sm:p-4'
              style={{
                borderColor:
                  scope === AutomationTriggerScope.ALL
                    ? 'hsl(var(--primary))'
                    : undefined,
                backgroundColor:
                  scope === AutomationTriggerScope.ALL
                    ? 'hsl(var(--primary) / 0.05)'
                    : undefined,
              }}
            >
              <h4 className='text-sm font-medium text-foreground sm:text-base'>
                All Posts & Reels
              </h4>
              <p className='mt-1 text-xs text-muted-foreground sm:text-sm'>
                Trigger on all your content
              </p>
              {scope === AutomationTriggerScope.ALL && (
                <div className='ml-auto text-primary absolute top-3 right-3'>
                  <Check className='h-4 w-4' />
                </div>
              )}
            </button>
            <button
              onClick={() => handleScopeChange(AutomationTriggerScope.SPECIFIC)}
              className='rounded-lg border-2 p-3 text-left transition-all hover:border-primary sm:p-4'
              style={{
                borderColor:
                  scope === AutomationTriggerScope.SPECIFIC
                    ? 'hsl(var(--primary))'
                    : undefined,
                backgroundColor:
                  scope === AutomationTriggerScope.SPECIFIC
                    ? 'hsl(var(--primary) / 0.05)'
                    : undefined,
              }}
            >
              <div className='flex items-center gap-2'>
                <ImageIcon className='h-4 w-4 text-muted-foreground' />
                <h4 className='text-sm font-medium text-foreground sm:text-base'>
                  Specific Posts
                </h4>
              </div>
              <p className='mt-1 text-xs text-muted-foreground sm:text-sm'>
                Choose which posts to monitor
              </p>
              {scope === AutomationTriggerScope.SPECIFIC && (
                <div className='ml-auto text-primary absolute top-3 right-3'>
                  <Check className='h-4 w-4' />
                </div>
              )}
            </button>
          </div>

          {scope === AutomationTriggerScope.SPECIFIC && (
            <div className='mt-4 rounded-lg border border-border bg-card/50 p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <h4 className='text-sm font-medium text-foreground'>
                    Selected Posts
                  </h4>
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
                  className='gap-1'
                >
                  <Plus className='h-4 w-4' />
                  <span className='hidden sm:inline'>Select Posts</span>
                  <span className='sm:hidden'>Select</span>
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
                      media?.thumbnail_url ||
                      media?.url ||
                      `/instagram-post.png?height=80&width=80&query=instagram+post+${id}`;

                    return (
                      <div
                        key={id}
                        className='group relative h-16 w-16 overflow-hidden rounded-md border border-border sm:h-20 sm:w-20'
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
      )}

      <div className='mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:justify-between'>
        <Button
          variant='outline'
          onClick={prevStep}
          className='w-full sm:w-auto bg-transparent'
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

      {/* Media Selector Modal */}
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
