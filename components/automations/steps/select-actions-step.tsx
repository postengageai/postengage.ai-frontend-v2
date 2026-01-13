'use client';

import { Plus, MessageSquare, Mail, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import type {
  ActionConfig,
  ActionType,
  ReplyCommentPayload,
  PrivateReplyPayload,
} from '@/lib/types/automation-builder';
import { ACTION_CREDIT_COSTS } from '@/lib/types/automation-builder';

interface SelectActionsStepProps {
  actions: ActionConfig[];
  onChange: (actions: ActionConfig[]) => void;
}

export function SelectActionsStep({
  actions,
  onChange,
}: SelectActionsStepProps) {
  const availableActions = [
    {
      id: 'REPLY_COMMENT' as ActionType,
      name: 'Reply to Comment',
      icon: MessageSquare,
      description: 'Post a public reply',
    },
    {
      id: 'PRIVATE_REPLY' as ActionType,
      name: 'Send Private Reply',
      icon: Mail,
      description: 'Send a private message',
    },
  ];

  const addAction = (type: ActionType) => {
    const basePayload: ReplyCommentPayload | PrivateReplyPayload =
      type === 'REPLY_COMMENT'
        ? { text: '', use_ai: false, ai_tone: 'friendly' }
        : { text: '' };

    const creditCost = ACTION_CREDIT_COSTS[type]?.base || 2;

    const newAction: ActionConfig = {
      id: `action_${Date.now()}`,
      action_type: type,
      execution_order: actions.length + 1,
      delay_seconds: 0,
      action_payload: basePayload,
      status: 'ACTIVE',
      credit_cost: creditCost,
    };
    onChange([...actions, newAction]);
  };

  const removeAction = (id: string) => {
    onChange(actions.filter(a => a.id !== id));
  };

  const updateAction = (id: string, updates: Partial<ActionConfig>) => {
    onChange(actions.map(a => (a.id === id ? { ...a, ...updates } : a)));
  };

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-2xl font-semibold'>Configure actions</h2>
        <p className='text-muted-foreground mt-2'>
          What should happen when triggered?
        </p>
      </div>

      {actions.length === 0 ? (
        <div className='space-y-4'>
          <p className='text-sm text-muted-foreground'>
            Choose an action to get started:
          </p>
          <div className='grid gap-3'>
            {availableActions.map(action => (
              <Card
                key={action.id}
                className='p-4 cursor-pointer hover:border-primary/50 transition-all'
                onClick={() => addAction(action.id)}
              >
                <div className='flex items-center gap-3'>
                  <div className='w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0'>
                    <action.icon className='h-5 w-5 text-muted-foreground' />
                  </div>
                  <div className='flex-1'>
                    <h3 className='font-medium'>{action.name}</h3>
                    <p className='text-sm text-muted-foreground'>
                      {action.description}
                    </p>
                  </div>
                  <Plus className='h-5 w-5 text-muted-foreground' />
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className='space-y-4'>
          {actions.map((action, index) => (
            <Card key={action.id} className='p-4'>
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <Badge variant='secondary'>#{index + 1}</Badge>
                    <span className='font-medium'>
                      {action.action_type === 'REPLY_COMMENT'
                        ? 'Reply to Comment'
                        : 'Send Private Reply'}
                    </span>
                    <Badge variant='outline' className='text-xs'>
                      {action.credit_cost} credits
                    </Badge>
                  </div>
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={() => removeAction(action.id)}
                  >
                    <X className='h-4 w-4' />
                  </Button>
                </div>

                {action.action_type === 'REPLY_COMMENT' && (
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <Label
                        htmlFor={`ai-${action.id}`}
                        className='flex items-center gap-2'
                      >
                        <Sparkles className='h-4 w-4 text-primary' />
                        Use AI to generate replies
                      </Label>
                      <Switch
                        id={`ai-${action.id}`}
                        checked={
                          (action.action_payload as ReplyCommentPayload).use_ai
                        }
                        onCheckedChange={checked => {
                          const payload =
                            action.action_payload as ReplyCommentPayload;
                          updateAction(action.id, {
                            action_payload: { ...payload, use_ai: checked },
                            credit_cost: checked
                              ? ACTION_CREDIT_COSTS.REPLY_COMMENT.base +
                                ACTION_CREDIT_COSTS.REPLY_COMMENT.ai_addon
                              : ACTION_CREDIT_COSTS.REPLY_COMMENT.base,
                          });
                        }}
                      />
                    </div>

                    {!(action.action_payload as ReplyCommentPayload).use_ai && (
                      <div>
                        <Label>Reply message</Label>
                        <Textarea
                          placeholder='Thank you for your comment! {{commenter_name}}'
                          value={
                            (action.action_payload as ReplyCommentPayload).text
                          }
                          onChange={e => {
                            const payload =
                              action.action_payload as ReplyCommentPayload;
                            updateAction(action.id, {
                              action_payload: {
                                ...payload,
                                text: e.target.value,
                              },
                            });
                          }}
                          rows={3}
                          className='mt-1'
                        />
                        <p className='text-xs text-muted-foreground mt-1'>
                          Use {'{{commenter_name}}' + ' for personalization'}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {action.action_type === 'PRIVATE_REPLY' && (
                  <div>
                    <Label>Private message</Label>
                    <Textarea
                      placeholder='Hi {{commenter_name}}, thanks for reaching out!'
                      value={
                        (action.action_payload as PrivateReplyPayload).text
                      }
                      onChange={e => {
                        const payload =
                          action.action_payload as PrivateReplyPayload;
                        updateAction(action.id, {
                          action_payload: { ...payload, text: e.target.value },
                        });
                      }}
                      rows={4}
                      className='mt-1'
                    />
                    <p className='text-xs text-muted-foreground mt-1'>
                      Max 250 words. Use{' '}
                      {'{{commenter_name}}' + ' for personalization'}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          ))}

          <div className='flex gap-2'>
            {availableActions.map(action => (
              <Button
                key={action.id}
                onClick={() => addAction(action.id)}
                variant='outline'
                size='sm'
              >
                <Plus className='h-4 w-4 mr-2' />
                Add {action.name}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
