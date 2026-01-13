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
  type LucideIcon,
} from 'lucide-react';
import type { AutomationFormData } from '../automation-wizard';
import {
  AutomationActionType,
  type AutomationActionTypeType,
} from '@/lib/constants/automations';

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

                {action.action_type === AutomationActionType.SEND_DM && (
                  <div className='space-y-4 rounded-md border border-border bg-muted/30 p-4'>
                    <Label className='block text-sm font-medium'>
                      Attachment (Optional)
                    </Label>

                    <div className='grid gap-4 sm:grid-cols-3'>
                      <div className='sm:col-span-1'>
                        <Label
                          htmlFor={`action-att-type-${index}`}
                          className='mb-1.5 block text-xs text-muted-foreground'
                        >
                          Type
                        </Label>
                        <select
                          id={`action-att-type-${index}`}
                          className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                          value={action.action_payload.attachment_type || ''}
                          onChange={e =>
                            updateAction(index, {
                              action_payload: {
                                ...action.action_payload,
                                attachment_type: e.target.value || undefined,
                              },
                            })
                          }
                        >
                          <option value=''>None</option>
                          <option value='image'>Image</option>
                          <option value='video'>Video</option>
                          <option value='file'>File</option>
                        </select>
                      </div>

                      <div className='sm:col-span-2'>
                        <Label
                          htmlFor={`action-att-url-${index}`}
                          className='mb-1.5 block text-xs text-muted-foreground'
                        >
                          URL
                        </Label>
                        <input
                          id={`action-att-url-${index}`}
                          type='url'
                          placeholder='https://...'
                          className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                          value={action.action_payload.attachment_url || ''}
                          onChange={e =>
                            updateAction(index, {
                              action_payload: {
                                ...action.action_payload,
                                attachment_url: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                    </div>
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
    </div>
  );
}
