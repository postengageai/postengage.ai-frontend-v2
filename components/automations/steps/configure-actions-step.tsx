'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
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
  Clock,
  type LucideIcon,
} from 'lucide-react';
import type { AutomationFormData } from '../automation-wizard';
import {
  AutomationActionType,
  type AutomationActionTypeType,
} from '@/lib/constants/automations';
import {
  AutomationActionPayload,
  SendDmPayload,
  ReplyCommentPayload,
  PrivateReplyPayload,
} from '@/lib/api/automations';
import { InstagramCommentAction, InstagramDmAction } from './actions/instagram';

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
    }
    return [
      {
        type: AutomationActionType.SEND_DM,
        label: 'Send DM Reply',
        icon: Send,
        description: 'Reply to the direct message',
      },
    ];
  };

  const addAction = (type: AutomationActionTypeType) => {
    let payload: AutomationActionPayload;

    if (type === AutomationActionType.SEND_DM) {
      payload = {
        message: {
          type: 'text',
          text: '',
        },
      };
    } else {
      // REPLY_COMMENT or PRIVATE_REPLY
      payload = {
        text: '',
      };
    }

    const newAction = {
      action_type: type,
      execution_order: actions.length + 1,
      delay_seconds: actions.length === 0 ? 2 : 5,
      status: 'active' as const,
      action_payload: payload,
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

  const updateAction = (
    index: number,
    updates: Partial<AutomationFormData['actions'][0]>
  ) => {
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
                  className='group flex items-start gap-3 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50'
                >
                  <div className='rounded-lg bg-primary/10 p-2 transition-colors group-hover:bg-primary group-hover:text-primary-foreground'>
                    <Icon className='h-5 w-5 text-primary group-hover:text-primary-foreground' />
                  </div>
                  <div className='flex-1'>
                    <div className='flex flex-wrap items-center gap-2'>
                      <p className='font-semibold text-foreground'>
                        {action.label}
                      </p>
                      <Badge
                        variant='secondary'
                        className='bg-primary/10 text-xs text-primary'
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
            <Card
              key={index}
              className='overflow-hidden border-border transition-all hover:border-primary/50'
            >
              <div className='flex items-center justify-between border-b bg-muted/30 px-6 py-4'>
                <div className='flex items-center gap-3'>
                  <div className='flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary'>
                    {action.execution_order}
                  </div>
                  <div>
                    <p className='font-semibold text-foreground'>
                      {action.action_type ===
                        AutomationActionType.REPLY_COMMENT &&
                        'Reply to Comment'}
                      {action.action_type ===
                        AutomationActionType.PRIVATE_REPLY &&
                        'Send Private Reply'}
                      {action.action_type === AutomationActionType.SEND_DM &&
                        'Send DM Reply'}
                    </p>
                    <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                      <Clock className='h-3 w-3' />
                      <span>{action.delay_seconds}s delay</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => removeAction(index)}
                  className='h-8 w-8 text-muted-foreground hover:text-destructive'
                >
                  <Trash2 className='h-4 w-4' />
                </Button>
              </div>

              <div className='space-y-6 p-6'>
                {action.action_type === AutomationActionType.SEND_DM ? (
                  <InstagramDmAction
                    payload={action.action_payload as SendDmPayload}
                    onUpdate={updates =>
                      updateAction(index, {
                        action_payload: {
                          ...action.action_payload,
                          ...updates,
                        } as SendDmPayload,
                      })
                    }
                  />
                ) : action.action_type === AutomationActionType.REPLY_COMMENT ||
                  action.action_type === AutomationActionType.PRIVATE_REPLY ? (
                  <InstagramCommentAction
                    actionType={action.action_type}
                    payload={
                      action.action_payload as
                        | ReplyCommentPayload
                        | PrivateReplyPayload
                    }
                    onUpdate={updates =>
                      updateAction(index, {
                        action_payload: {
                          ...action.action_payload,
                          ...updates,
                        } as ReplyCommentPayload | PrivateReplyPayload,
                      })
                    }
                  />
                ) : null}

                <div className='space-y-3 rounded-lg border bg-card/50 p-4'>
                  <div className='flex items-center justify-between'>
                    <Label className='text-sm font-medium'>
                      Response Delay
                    </Label>
                    <span className='text-xs font-medium text-muted-foreground'>
                      {action.delay_seconds}s
                    </span>
                  </div>
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
                  <p className='text-xs text-muted-foreground'>
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
