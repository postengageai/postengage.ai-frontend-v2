'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
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
      payload = { text: '' };
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

  const hasAiEnabled = actions.some(action => {
    const payload = action.action_payload as
      | ReplyCommentPayload
      | PrivateReplyPayload
      | SendDmPayload;
    return 'use_ai_reply' in payload && Boolean(payload.use_ai_reply);
  });

  return (
    <div>
      <div className='mb-8 flex items-start justify-between gap-4'>
        <div>
          <h2 className='mb-1 text-2xl font-bold text-foreground'>
            Configure Actions
          </h2>
          <p className='text-muted-foreground'>
            Choose what happens when the automation triggers
          </p>
        </div>

        {/* Add Action button — visible when there's room */}
        {actions.length < 2 && (
          <div className='hidden sm:flex flex-shrink-0 gap-2'>
            {availableActions.map(action => {
              const isAdded = actions.some(a => a.action_type === action.type);
              if (isAdded) return null;
              const Icon = action.icon;
              return (
                <Button
                  key={action.type}
                  variant='outline'
                  size='sm'
                  onClick={() => addAction(action.type)}
                  className='gap-1.5'
                >
                  <Icon className='h-3.5 w-3.5' />
                  <Plus className='h-3 w-3' />
                  {action.label}
                </Button>
              );
            })}
          </div>
        )}
      </div>

      {/* Empty state */}
      {actions.length === 0 && (
        <div className='mb-6'>
          <div className='rounded-xl border-2 border-dashed border-border p-10 text-center'>
            <div className='mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted'>
              <Plus className='h-7 w-7 text-muted-foreground' />
            </div>
            <h3 className='mb-1 font-semibold text-foreground'>
              No actions yet
            </h3>
            <p className='mb-4 text-sm text-muted-foreground'>
              Add at least one action to continue
            </p>
            {/* Mobile add buttons */}
            <div className='flex flex-wrap justify-center gap-2'>
              {availableActions.map(action => {
                const Icon = action.icon;
                return (
                  <Button
                    key={action.type}
                    variant='outline'
                    size='sm'
                    onClick={() => addAction(action.type)}
                    className='gap-1.5'
                  >
                    <Icon className='h-4 w-4' />
                    {action.label}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Mobile add buttons when actions exist */}
      {actions.length > 0 && actions.length < 2 && (
        <div className='mb-4 flex flex-wrap gap-2 sm:hidden'>
          {availableActions.map(action => {
            const isAdded = actions.some(a => a.action_type === action.type);
            if (isAdded) return null;
            const Icon = action.icon;
            return (
              <Button
                key={action.type}
                variant='outline'
                size='sm'
                onClick={() => addAction(action.type)}
                className='gap-1.5'
              >
                <Icon className='h-3.5 w-3.5' />
                <Plus className='h-3 w-3' />
                {action.label}
              </Button>
            );
          })}
        </div>
      )}

      {/* Action Cards */}
      {actions.length > 0 && (
        <div className='space-y-4'>
          {actions.map((action, index) => {
            const actionPayload = action.action_payload as
              | ReplyCommentPayload
              | PrivateReplyPayload
              | SendDmPayload;
            const hasAi =
              'use_ai_reply' in actionPayload &&
              Boolean(actionPayload.use_ai_reply);

            let creditCost = 0;
            if (hasAi) {
              const isByom = userConfig?.mode === LlmConfigMode.BYOM;
              const infraCost = CREDIT_COSTS.BYOM_INFRA;
              if (isByom) {
                creditCost = infraCost;
              } else {
                const selectedBot = bots.find(b => b._id === selectedBotId);
                const hasKnowledge =
                  selectedBot?.knowledge_sources &&
                  selectedBot.knowledge_sources.length > 0;
                const aiTierCost = hasKnowledge
                  ? CREDIT_COSTS.AI_KNOWLEDGE
                  : CREDIT_COSTS.AI_STANDARD;
                creditCost = infraCost + aiTierCost;
              }
            }

            return (
              <Card
                key={index}
                className='overflow-hidden border-border transition-all hover:border-primary/40'
              >
                {/* Card Header */}
                <div className='flex items-center justify-between border-b border-border bg-muted/30 px-5 py-3.5'>
                  <div className='flex items-center gap-3'>
                    <div className='flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-white'>
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
                        {hasAi ? (
                          <>
                            <BotIcon className='h-3 w-3 text-primary' />
                            <span className='text-primary'>
                              AI · {creditCost} credit
                              {creditCost !== 1 ? 's' : ''}
                            </span>
                          </>
                        ) : (
                          <Badge
                            variant='secondary'
                            className='h-4 bg-muted px-1.5 text-[10px] text-muted-foreground'
                          >
                            Free
                          </Badge>
                        )}
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

                {/* Card Body */}
                <div className='p-5'>
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
                  ) : action.action_type ===
                      AutomationActionType.REPLY_COMMENT ||
                    action.action_type ===
                      AutomationActionType.PRIVATE_REPLY ? (
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
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* AI Bot Configuration */}
      {hasAiEnabled && (
        <div className='mt-6 rounded-xl border border-primary/20 bg-primary/5 p-5'>
          <div className='mb-3 flex items-center gap-2'>
            <BotIcon className='h-5 w-5 text-primary' />
            <h3 className='font-semibold text-primary'>AI Bot Configuration</h3>
          </div>
          <p className='mb-4 text-sm text-muted-foreground'>
            Select which bot handles AI-powered responses for this automation.
          </p>

          <div className='max-w-sm'>
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
                Using bot{' '}
                <span className='font-medium'>
                  {bots.find(b => b._id === selectedBotId)?.name}
                </span>
              </p>
            )}
            <div className='mt-3 flex gap-3 text-xs'>
              <Link
                href='/dashboard/intelligence/bots'
                className='text-primary hover:underline'
              >
                Manage bots
              </Link>
              <span className='text-muted-foreground'>·</span>
              <Link
                href='/dashboard/intelligence/brand-voices'
                className='text-primary hover:underline'
              >
                Brand voices
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className='mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between'>
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
          disabled={actions.length === 0}
          className='w-full sm:w-auto'
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
