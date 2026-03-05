'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { IntelligenceApi } from '@/lib/api/intelligence';
import {
  type Bot,
  type UserLlmConfig,
  LlmConfigMode,
} from '@/lib/types/intelligence';
import { CREDIT_COSTS } from '@/lib/config/credit-pricing';
import {
  ChevronLeft,
  Plus,
  Trash2,
  MessageSquare,
  Mail,
  Send,
  Clock,
  Bot as BotIcon,
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
  const [bots, setBots] = useState<Bot[]>([]);
  const [userConfig, setUserConfig] = useState<UserLlmConfig | null>(null);
  const [selectedBotId, setSelectedBotId] = useState<string | undefined>(
    formData.bot_id
  );
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [botsResponse, configResponse] = await Promise.all([
          IntelligenceApi.getBots(
            formData.social_account_id
              ? { social_account_id: formData.social_account_id }
              : undefined
          ),
          IntelligenceApi.getUserConfig(),
        ]);
        setBots(botsResponse.data || []);
        setUserConfig(configResponse.data);
      } catch (_error) {
        // failed to fetch data
      }
    };

    if (formData.social_account_id) {
      fetchData();
    } else {
      setBots([]);
    }
  }, [formData.social_account_id]);

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
    const useAi = actions.some(action => {
      const payload = action.action_payload as
        | ReplyCommentPayload
        | PrivateReplyPayload
        | SendDmPayload;

      return 'use_ai_reply' in payload && Boolean(payload.use_ai_reply);
    });

    if (useAi) {
      const missingFallback = actions.filter(action => {
        const payload = action.action_payload as
          | ReplyCommentPayload
          | PrivateReplyPayload
          | SendDmPayload;

        if (!('use_ai_reply' in payload) || !payload.use_ai_reply) {
          return false;
        }

        if (action.action_type === AutomationActionType.SEND_DM) {
          const dmPayload = payload as SendDmPayload;
          const message =
            dmPayload.message && dmPayload.message.type === 'text'
              ? dmPayload.message
              : null;

          return !message || !message.text || !message.text.trim();
        }

        const textPayload = payload as
          | ReplyCommentPayload
          | PrivateReplyPayload;
        return !textPayload.text || !textPayload.text.trim();
      });

      if (missingFallback.length > 0) {
        toast({
          title: 'Fallback message required',
          description:
            'When AI replies are enabled, each action must have a fallback message.',
          variant: 'destructive',
        });
        return;
      }
    }

    if (useAi && !selectedBotId) {
      toast({
        title: 'Bot Required',
        description: 'Please select an AI Bot to handle the automated replies.',
        variant: 'destructive',
      });
      return;
    }

    updateFormData({
      actions,
      bot_id: selectedBotId,
      bot_name: bots.find(b => b._id === selectedBotId)?.name,
    });
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
                        Free
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
                    <div className='flex items-center justify-between text-xs text-muted-foreground'>
                      <div className='flex items-center gap-1.5'>
                        <Clock className='h-3 w-3' />
                        <span>{action.delay_seconds}s delay</span>
                      </div>
                      <div className='flex items-center gap-1.5'>
                        {(() => {
                          const payload = action.action_payload as
                            | ReplyCommentPayload
                            | PrivateReplyPayload
                            | SendDmPayload;
                          const hasAi =
                            'use_ai_reply' in payload &&
                            Boolean(payload.use_ai_reply);

                          if (hasAi) {
                            const selectedBot = bots.find(
                              bot => bot._id === selectedBotId
                            );

                            // Calculate credit cost
                            let creditCost = 0;
                            const isByom =
                              userConfig?.mode === LlmConfigMode.BYOM;
                            const infraCost = CREDIT_COSTS.BYOM_INFRA;

                            if (isByom) {
                              creditCost = infraCost;
                            } else {
                              // Platform mode: Infra + AI Tier
                              const hasKnowledge =
                                selectedBot?.knowledge_sources &&
                                selectedBot.knowledge_sources.length > 0;

                              const aiTierCost = hasKnowledge
                                ? CREDIT_COSTS.AI_KNOWLEDGE
                                : CREDIT_COSTS.AI_STANDARD;

                              creditCost = infraCost + aiTierCost;
                            }

                            return (
                              <>
                                <Badge
                                  variant='secondary'
                                  className='bg-primary/10 text-[10px] text-primary h-5 px-1.5'
                                >
                                  {creditCost} credits
                                </Badge>
                                <BotIcon className='h-3 w-3 text-primary ml-1' />
                                <span className='font-medium text-primary'>
                                  AI
                                  {selectedBot ? ` · ${selectedBot.name}` : ''}
                                  {isByom && ' (BYOM)'}
                                </span>
                              </>
                            );
                          }

                          return (
                            <Badge
                              variant='secondary'
                              className='bg-muted text-[10px] text-muted-foreground h-5 px-1.5'
                            >
                              Free
                            </Badge>
                          );
                        })()}
                      </div>
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

      {actions.some(action => {
        const payload = action.action_payload as
          | ReplyCommentPayload
          | PrivateReplyPayload
          | SendDmPayload;

        return 'use_ai_reply' in payload && Boolean(payload.use_ai_reply);
      }) && (
        <div className='mt-6 rounded-lg border border-primary/20 bg-primary/5 p-4'>
          <div className='mb-2 flex items-center gap-2'>
            <BotIcon className='h-5 w-5 text-primary' />
            <h3 className='font-semibold text-primary'>AI Configuration</h3>
          </div>
          <p className='mb-4 text-sm text-muted-foreground'>
            You have enabled AI replies. Select which bot should handle these
            responses.
          </p>

          <div className='max-w-md'>
            <Label className='mb-2 block text-sm font-medium'>
              Select AI Bot
            </Label>
            <Select value={selectedBotId} onValueChange={setSelectedBotId}>
              <SelectTrigger>
                <SelectValue placeholder='Select a bot...' />
              </SelectTrigger>
              <SelectContent>
                {bots.map(bot => (
                  <SelectItem key={bot._id} value={bot._id}>
                    {bot.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {bots.length === 0 && (
              <p className='mt-2 text-xs text-destructive'>
                No bots found. Please create a bot first.
              </p>
            )}
            {selectedBotId && (
              <p className='mt-2 text-xs text-muted-foreground'>
                Responses will use bot{' '}
                <span className='font-medium'>
                  {bots.find(b => b._id === selectedBotId)?.name}
                </span>
                {bots.find(b => b._id === selectedBotId)?.brand_voice_id
                  ? ' with its configured brand voice.'
                  : ' with your default brand voice.'}
              </p>
            )}
            <div className='mt-3 flex flex-wrap gap-3 text-xs'>
              <Link
                href='/dashboard/intelligence/bots'
                className='text-primary hover:underline'
              >
                Manage bots
              </Link>
              <span className='text-muted-foreground'>•</span>
              <Link
                href='/dashboard/intelligence/brand-voices'
                className='text-primary hover:underline'
              >
                Manage brand voices
              </Link>
            </div>
          </div>
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
