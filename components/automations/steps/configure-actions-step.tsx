'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import {
  ChevronLeft,
  Plus,
  Trash2,
  MessageSquare,
  Mail,
  Send,
  Image as ImageIcon,
  FileText,
  X,
  type LucideIcon,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { AutomationFormData } from '../automation-wizard';
import {
  AutomationActionType,
  type AutomationActionTypeType,
} from '@/lib/constants/automations';
import { MediaPickerDialog } from '@/components/media/media-picker-dialog';

interface ConfigureActionsStepProps {
  formData: AutomationFormData;
  updateFormData: (data: Partial<AutomationFormData>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

export function ConfigureActionsStep({
  formData,
  updateFormData,
  nextStep,
  prevStep,
}: ConfigureActionsStepProps) {
  const [actions, setActions] = useState(formData.actions || []);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [activeActionIndex, setActiveActionIndex] = useState<number | null>(
    null
  );

  const getAvailableActions = (): {
    type: AutomationActionTypeType;
    label: string;
    icon: LucideIcon;
    description: string;
  }[] => {
    if (formData.trigger_type === 'new_comment') {
      return [
        {
          type: AutomationActionType.REPLY_COMMENT,
          label: 'Reply to Comment',
          icon: MessageSquare,
          description: 'Post a public reply to the comment',
        },
        {
          type: AutomationActionType.PRIVATE_REPLY,
          label: 'Send Private Reply (DM)',
          icon: Mail,
          description: 'Send a private message to the commenter',
        },
      ];
    } else {
      return [
        {
          type: AutomationActionType.SEND_DM,
          label: 'Send DM Reply',
          icon: Send,
          description: 'Reply to the direct message',
        },
      ];
    }
  };

  const addAction = (type: AutomationActionTypeType) => {
    const newAction = {
      action_type: type,
      execution_order: actions.length + 1,
      delay_seconds: actions.length === 0 ? 2 : 5,
      status: 'active' as const,
      action_payload: {
        text: '',
        message: {
          type: 'text' as const,
          text: '',
        },
      },
    };
    setActions([...actions, newAction]);
  };

  const removeAction = (index: number) => {
    const newActions = actions
      .filter((_, i) => i !== index)
      .map((action, i) => ({
        ...action,
        execution_order: i + 1,
      }));
    setActions(newActions);
  };

  const updateAction = (index: number, updates: any) => {
    const newActions = [...actions];
    newActions[index] = { ...newActions[index], ...updates };
    setActions(newActions);
  };

  const handleNext = () => {
    updateFormData({ actions });
    nextStep();
  };

  const availableActions = getAvailableActions();

  return (
    <div>
      <h2 className='mb-2 text-xl font-bold text-foreground sm:text-2xl'>
        Configure Actions
      </h2>
      <p className='mb-6 text-sm text-muted-foreground sm:mb-8 sm:text-base'>
        Choose what happens when the automation triggers
      </p>

      {actions.length < 2 && (
        <div className='mb-6'>
          <Label className='mb-3 block text-sm font-medium'>Add Action</Label>
          <div className='grid gap-3 sm:grid-cols-2'>
            {availableActions.map(action => {
              const Icon = action.icon;
              const isAdded = actions.some(a => a.action_type === action.type);
              return (
                <button
                  key={action.type}
                  onClick={() => addAction(action.type)}
                  disabled={isAdded}
                  className='flex items-start gap-3 rounded-lg border-2 border-border bg-card p-3 text-left transition-all hover:border-primary hover:bg-card/80 disabled:cursor-not-allowed disabled:opacity-50 sm:p-4'
                >
                  <div className='rounded-lg bg-primary/10 p-2'>
                    <Icon className='h-4 w-4 text-primary sm:h-5 sm:w-5' />
                  </div>
                  <div className='flex-1'>
                    <div className='flex flex-wrap items-center gap-2'>
                      <p className='text-sm font-medium text-foreground sm:text-base'>
                        {action.label}
                      </p>
                      <Badge
                        variant='secondary'
                        className='bg-primary/10 text-primary text-xs'
                      >
                        2 credits
                      </Badge>
                    </div>
                    <p className='mt-1 text-xs text-muted-foreground'>
                      {action.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {actions.length > 0 && (
        <div className='space-y-4'>
          {actions.map((action, index) => (
            <Card key={index} className='p-4 sm:p-6'>
              <div className='mb-4 flex items-start justify-between gap-3 sm:items-center'>
                <div className='flex items-center gap-2 sm:gap-3'>
                  <div className='flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary sm:h-8 sm:w-8 sm:text-sm'>
                    {action.execution_order}
                  </div>
                  <div>
                    <p className='text-sm font-semibold text-foreground sm:text-base'>
                      {action.action_type ===
                        AutomationActionType.REPLY_COMMENT &&
                        'Reply to Comment'}
                      {action.action_type ===
                        AutomationActionType.PRIVATE_REPLY &&
                        'Send Private Reply'}
                      {action.action_type === AutomationActionType.SEND_DM &&
                        'Send DM Reply'}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      {action.delay_seconds}s delay
                    </p>
                  </div>
                </div>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => removeAction(index)}
                  className='text-destructive hover:text-destructive'
                >
                  <Trash2 className='h-4 w-4' />
                </Button>
              </div>

              <div className='space-y-4'>
                {action.action_type === AutomationActionType.SEND_DM ? (
                  <Tabs
                    value={
                      action.action_payload.message?.type === 'text' ||
                      !action.action_payload.message
                        ? 'text'
                        : 'media'
                    }
                    onValueChange={val => {
                      if (val === 'text') {
                        updateAction(index, {
                          action_payload: {
                            ...action.action_payload,
                            message: {
                              type: 'text',
                              text: action.action_payload.text || '',
                            },
                          },
                        });
                      } else {
                        // Switch to media
                        // Try to restore previous media if available
                        const type: 'image' | 'video' | 'file' =
                          action.action_payload.attachment_type || 'image';
                        if (
                          action.action_payload.attachment_url &&
                          !action.action_payload.attachment_type
                        ) {
                          // Infer type if missing but url exists
                          // This is a fallback; usually attachment_type is set
                        }

                        updateAction(index, {
                          action_payload: {
                            ...action.action_payload,
                            message: {
                              type: type,
                              payload: {
                                url: action.action_payload.attachment_url || '',
                                is_reusable: true,
                              },
                            },
                          },
                        });
                      }
                    }}
                    className='w-full'
                  >
                    <TabsList className='grid w-full grid-cols-2 mb-4'>
                      <TabsTrigger value='text'>Text Message</TabsTrigger>
                      <TabsTrigger value='media'>Media Message</TabsTrigger>
                    </TabsList>
                    <TabsContent value='text' className='mt-0'>
                      <div>
                        <Label
                          htmlFor={`action-text-${index}`}
                          className='mb-2 block text-sm font-medium'
                        >
                          Message
                        </Label>
                        <Textarea
                          id={`action-text-${index}`}
                          placeholder='Enter DM message...'
                          value={action.action_payload.text}
                          onChange={e =>
                            updateAction(index, {
                              action_payload: {
                                ...action.action_payload,
                                text: e.target.value,
                                message: {
                                  type: 'text',
                                  text: e.target.value,
                                },
                              },
                            })
                          }
                          rows={3}
                        />
                        <p className='mt-1 text-xs text-muted-foreground'>
                          Variables: {'{{commenter_name}}'},{' '}
                          {'{{comment_text}}'}, {'{{post_content}}'}
                        </p>
                      </div>
                    </TabsContent>
                    <TabsContent value='media' className='mt-0'>
                      <div className='space-y-4 rounded-md border border-border bg-muted/30 p-4'>
                        <Label className='block text-sm font-medium'>
                          Attachment
                        </Label>
                        <div className='grid gap-4 sm:grid-cols-3'>
                          <div className='sm:col-span-3'>
                            {action.action_payload.attachment_url ? (
                              <div className='relative mt-2 overflow-hidden rounded-md border border-border bg-background'>
                                {action.action_payload.attachment_type ===
                                  'image' && (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={action.action_payload.attachment_url}
                                    alt='Attachment preview'
                                    className='h-48 w-full object-cover'
                                  />
                                )}
                                {action.action_payload.attachment_type ===
                                  'video' && (
                                  <video
                                    src={action.action_payload.attachment_url}
                                    className='h-48 w-full bg-black'
                                    controls
                                  />
                                )}
                                {(!action.action_payload.attachment_type ||
                                  action.action_payload.attachment_type ===
                                    'file') && (
                                  <div className='flex h-48 flex-col items-center justify-center gap-3 bg-muted/30 p-4 transition-colors hover:bg-muted/50'>
                                    <div className='rounded-full bg-primary/10 p-4'>
                                      <FileText className='h-8 w-8 text-primary' />
                                    </div>
                                    <div className='px-4 text-center'>
                                      <p className='line-clamp-2 text-sm font-medium'>
                                        {action.action_payload
                                          .attachment_name || 'Attached File'}
                                      </p>
                                    </div>
                                  </div>
                                )}
                                <button
                                  onClick={() =>
                                    updateAction(index, {
                                      action_payload: {
                                        ...action.action_payload,
                                        attachment_url: undefined,
                                        attachment_type: undefined,
                                        attachment_name: undefined,
                                        // When removing media, we stay in media mode but empty?
                                        // Or should we allow clearing it?
                                        // Let's just clear the payload but keep message type media (waiting for selection)
                                        message: {
                                          type: 'image', // default
                                          payload: {
                                            url: '',
                                            is_reusable: true,
                                          },
                                        },
                                      },
                                    })
                                  }
                                  className='absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white transition-colors hover:bg-black/70'
                                  title='Remove attachment'
                                >
                                  <X className='h-4 w-4' />
                                </button>
                              </div>
                            ) : (
                              <Button
                                variant='outline'
                                type='button'
                                className='mt-2 h-auto w-full flex-col gap-2 border-dashed py-8 hover:border-primary hover:bg-primary/5'
                                onClick={() => {
                                  setActiveActionIndex(index);
                                  setPickerOpen(true);
                                }}
                              >
                                <div className='rounded-full bg-muted p-3 group-hover:bg-primary/10'>
                                  <ImageIcon className='h-6 w-6 text-muted-foreground group-hover:text-primary' />
                                </div>
                                <div className='flex flex-col gap-0.5'>
                                  <span className='text-sm font-medium'>
                                    Select Attachment
                                  </span>
                                  <span className='text-xs text-muted-foreground'>
                                    Image or Video
                                  </span>
                                </div>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                ) : (
                  <div>
                    <Label
                      htmlFor={`action-text-${index}`}
                      className='mb-2 block text-sm font-medium'
                    >
                      Message
                    </Label>
                    <Textarea
                      id={`action-text-${index}`}
                      placeholder={`Enter ${action.action_type === AutomationActionType.REPLY_COMMENT ? 'reply' : 'DM'} message...`}
                      value={action.action_payload.text}
                      onChange={e =>
                        updateAction(index, {
                          action_payload: {
                            ...action.action_payload,
                            text: e.target.value,
                            message: {
                              type: 'text',
                              text: e.target.value,
                            },
                          },
                        })
                      }
                      rows={3}
                    />
                    <p className='mt-1 text-xs text-muted-foreground'>
                      Variables: {'{{commenter_name}}'}, {'{{comment_text}}'},{' '}
                      {'{{post_content}}'}
                    </p>
                  </div>
                )}

                <div>
                  <Label className='mb-2 block text-sm font-medium'>
                    Delay: {action.delay_seconds} seconds
                  </Label>
                  <Slider
                    value={[action.delay_seconds]}
                    onValueChange={([value]) =>
                      updateAction(index, { delay_seconds: value })
                    }
                    min={1}
                    max={30}
                    step={1}
                    className='w-full'
                  />
                  <p className='mt-1 text-xs text-muted-foreground'>
                    Recommended: {index === 0 ? '2-5' : '5-10'} seconds to
                    appear natural
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {actions.length === 0 && (
        <div className='rounded-lg border-2 border-dashed border-border p-12 text-center'>
          <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted'>
            <Plus className='h-8 w-8 text-muted-foreground' />
          </div>
          <h3 className='mb-2 text-lg font-semibold text-foreground'>
            No actions yet
          </h3>
          <p className='text-sm text-muted-foreground'>
            Add at least one action to continue
          </p>
        </div>
      )}

      <div className='mt-6 flex flex-col-reverse gap-3 sm:mt-8 sm:flex-row sm:justify-between'>
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
          disabled={actions.length === 0}
          className='w-full sm:w-auto'
        >
          Continue
        </Button>
      </div>

      <MediaPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={media => {
          if (activeActionIndex !== null) {
            // Determine type based on mime_type
            let type: 'image' | 'video' | 'file' = 'file';
            if (media.mime_type.startsWith('image/')) type = 'image';
            else if (media.mime_type.startsWith('video/')) type = 'video';

            const newMessage = {
              type: type as 'image' | 'video' | 'file',
              payload: {
                url: media.url,
                is_reusable: true,
              },
            };

            updateAction(activeActionIndex, {
              action_payload: {
                ...actions[activeActionIndex].action_payload,
                attachment_url: media.url,
                attachment_type: type,
                attachment_name: media.name,
                message: newMessage,
              },
            });
          }
        }}
      />
    </div>
  );
}
