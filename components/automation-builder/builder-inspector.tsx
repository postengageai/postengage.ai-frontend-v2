'use client';

import { useState } from 'react';
import {
  X,
  MessageCircle,
  Filter,
  Sparkles,
  Plus,
  Trash2,
  Info,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import type {
  AutomationBuilder,
  TriggerConfig,
  ConditionsConfig,
  ActionConfig,
  SelectedBlock,
} from '@/lib/types/automation-builder';
import {
  getTriggerTypeLabel,
  getActionTypeLabel,
  mockDmTemplates,
} from '@/lib/mock/automation-builder-data';
import { CREDIT_COSTS } from '@/lib/config/credit-pricing';

interface BuilderInspectorProps {
  automation: AutomationBuilder;
  selectedBlock: SelectedBlock;
  onClose: () => void;
  onUpdateTrigger: (updates: Partial<TriggerConfig>) => void;
  onUpdateConditions: (updates: Partial<ConditionsConfig>) => void;
  onUpdateAction: (actionId: string, updates: Partial<ActionConfig>) => void;
}

export function BuilderInspector({
  automation,
  selectedBlock,
  onClose,
  onUpdateTrigger,
  onUpdateConditions,
  onUpdateAction,
}: BuilderInspectorProps) {
  if (!selectedBlock) {
    return (
      <div className='w-80 border-l border-border bg-card/50 flex flex-col h-full'>
        <div className='flex-1 flex items-center justify-center p-6'>
          <div className='text-center'>
            <div className='w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center'>
              <Info className='h-8 w-8 text-muted-foreground' />
            </div>
            <h3 className='font-medium mb-2'>No Block Selected</h3>
            <p className='text-sm text-muted-foreground'>
              Click on a trigger, condition, or action in the canvas to
              configure it
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='w-80 border-l border-border bg-card/50 flex flex-col h-full'>
      {/* Header */}
      <div className='p-4 border-b border-border flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          {selectedBlock.type === 'trigger' && (
            <MessageCircle className='h-4 w-4 text-blue-500' />
          )}
          {selectedBlock.type === 'conditions' && (
            <Filter className='h-4 w-4 text-amber-500' />
          )}
          {selectedBlock.type === 'action' && (
            <Sparkles className='h-4 w-4 text-emerald-500' />
          )}
          <h3 className='font-semibold'>
            {selectedBlock.type === 'trigger' && 'Trigger Settings'}
            {selectedBlock.type === 'conditions' && 'Condition Settings'}
            {selectedBlock.type === 'action' && 'Action Settings'}
          </h3>
        </div>
        <Button
          variant='ghost'
          size='sm'
          className='h-8 w-8 p-0'
          onClick={onClose}
        >
          <X className='h-4 w-4' />
        </Button>
      </div>

      {/* Content */}
      <div className='flex-1 overflow-y-auto p-4'>
        {selectedBlock.type === 'trigger' && (
          <TriggerInspector
            trigger={automation.trigger}
            onUpdate={onUpdateTrigger}
          />
        )}

        {selectedBlock.type === 'conditions' && (
          <ConditionsInspector
            conditions={automation.conditions}
            onUpdate={onUpdateConditions}
          />
        )}

        {selectedBlock.type === 'action' && (
          <ActionInspector
            action={automation.actions.find(a => a.id === selectedBlock.id)!}
            onUpdate={updates => onUpdateAction(selectedBlock.id, updates)}
          />
        )}
      </div>
    </div>
  );
}

// Trigger Inspector
function TriggerInspector({
  trigger,
  onUpdate,
}: {
  trigger: TriggerConfig;
  onUpdate: (updates: Partial<TriggerConfig>) => void;
}) {
  return (
    <div className='space-y-6'>
      <div>
        <Badge
          variant='secondary'
          className='bg-blue-500/10 text-blue-500 border-blue-500/20 mb-4'
        >
          {getTriggerTypeLabel(trigger.type)}
        </Badge>

        <p className='text-sm text-muted-foreground'>
          Configure when this automation should be triggered. The trigger
          determines the starting point of your automation flow.
        </p>
      </div>

      {/* Type-specific settings */}
      {trigger.type === 'new_comment' && (
        <>
          <Alert className='bg-muted/50 border-muted'>
            <Info className='h-4 w-4' />
            <AlertDescription className='text-xs'>
              This automation will run whenever someone comments on your posts.
              Use conditions to filter specific comments.
            </AlertDescription>
          </Alert>

          <div className='space-y-2'>
            <Label className='text-xs text-muted-foreground uppercase tracking-wide'>
              Comment Types
            </Label>
            <div className='space-y-2'>
              <div className='flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border'>
                <span className='text-sm'>Include replies to comments</span>
                <Switch defaultChecked />
              </div>
              <div className='flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border'>
                <span className='text-sm'>Include mentions in comments</span>
                <Switch defaultChecked />
              </div>
            </div>
          </div>
        </>
      )}

      {trigger.type === 'keyword_mention' && (
        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label className='text-xs text-muted-foreground uppercase tracking-wide'>
              Keywords to Monitor
            </Label>
            <Textarea
              placeholder='Enter keywords, one per line...'
              className='bg-background/50 resize-none text-sm'
              rows={4}
            />
            <p className='text-xs text-muted-foreground'>
              The automation triggers when any of these keywords appear
            </p>
          </div>
        </div>
      )}

      {/* Scope settings */}
      <div className='space-y-2'>
        <Label className='text-xs text-muted-foreground uppercase tracking-wide'>
          Post Scope
        </Label>
        <p className='text-xs text-muted-foreground mb-2'>
          Choose which posts this trigger applies to
        </p>

        <Select
          value={trigger.scope}
          onValueChange={value =>
            onUpdate({ scope: value as TriggerConfig['scope'] })
          }
        >
          <SelectTrigger className='bg-background/50'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all_posts'>All Posts</SelectItem>
            <SelectItem value='specific_posts'>Specific Posts Only</SelectItem>
            <SelectItem value='reels_only'>Reels Only</SelectItem>
            <SelectItem value='stories_only'>Stories Only</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

// Conditions Inspector
function ConditionsInspector({
  conditions,
  onUpdate,
}: {
  conditions: ConditionsConfig;
  onUpdate: (updates: Partial<ConditionsConfig>) => void;
}) {
  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <Badge
          variant='secondary'
          className={cn(
            'border',
            conditions.enabled
              ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
              : 'bg-muted text-muted-foreground'
          )}
        >
          {conditions.enabled ? 'Active' : 'Disabled'}
        </Badge>
        <Switch
          checked={conditions.enabled}
          onCheckedChange={checked => onUpdate({ enabled: checked })}
        />
      </div>

      <p className='text-sm text-muted-foreground'>
        Conditions filter which triggers actually execute actions. Without
        conditions, all triggers will run.
      </p>

      {conditions.enabled && (
        <>
          {/* Logic explanation */}
          <Alert className='bg-muted/50 border-muted'>
            <Info className='h-4 w-4' />
            <AlertDescription className='text-xs'>
              {conditions.logic === 'and'
                ? 'ALL conditions must be true for actions to run'
                : 'ANY condition being true will trigger actions'}
            </AlertDescription>
          </Alert>

          {/* Condition tips */}
          <div className='space-y-2'>
            <Label className='text-xs text-muted-foreground uppercase tracking-wide'>
              Pro Tips
            </Label>
            <ul className='space-y-2 text-xs text-muted-foreground'>
              <li className='flex items-start gap-2'>
                <span className='w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0' />
                Use "contains" for flexible keyword matching
              </li>
              <li className='flex items-start gap-2'>
                <span className='w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0' />
                Combine follower count filters to target influencers
              </li>
              <li className='flex items-start gap-2'>
                <span className='w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0' />
                Use regex for advanced pattern matching
              </li>
            </ul>
          </div>

          {/* Common condition templates */}
          <div className='space-y-2'>
            <Label className='text-xs text-muted-foreground uppercase tracking-wide'>
              Quick Add
            </Label>
            <div className='flex flex-wrap gap-2'>
              <Button
                variant='outline'
                size='sm'
                className='text-xs h-7 bg-transparent'
              >
                Price inquiry
              </Button>
              <Button
                variant='outline'
                size='sm'
                className='text-xs h-7 bg-transparent'
              >
                Question words
              </Button>
              <Button
                variant='outline'
                size='sm'
                className='text-xs h-7 bg-transparent'
              >
                Verified users
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Action Inspector
function ActionInspector({
  action,
  onUpdate,
}: {
  action: ActionConfig;
  onUpdate: (updates: Partial<ActionConfig>) => void;
}) {
  const [replyText, setReplyText] = useState('');

  const updateConfig = (configUpdates: Partial<ActionConfig['config']>) => {
    onUpdate({ config: { ...action.config, ...configUpdates } });
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <Badge
          variant='secondary'
          className={cn(
            'border',
            action.enabled
              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
              : 'bg-muted text-muted-foreground'
          )}
        >
          {getActionTypeLabel(action.type)}
        </Badge>
        <div className='flex items-center gap-2'>
          <Badge variant='outline' className='text-xs font-mono'>
            {action.creditCost > 0
              ? `${action.creditCost} credit${action.creditCost > 1 ? 's' : ''}`
              : 'Free'}
          </Badge>
          <Switch
            checked={action.enabled}
            onCheckedChange={checked => onUpdate({ enabled: checked })}
            className='data-[state=checked]:bg-emerald-500'
          />
        </div>
      </div>

      {action.enabled && (
        <>
          {/* Reply Comment settings */}
          {action.type === 'reply_comment' && (
            <>
              {/* AI Toggle */}
              <Card className='bg-gradient-to-br from-purple-500/5 to-blue-500/5 border-purple-500/20'>
                <CardContent className='p-4'>
                  <div className='flex items-center justify-between mb-3'>
                    <div className='flex items-center gap-2'>
                      <Sparkles className='h-4 w-4 text-purple-500' />
                      <span className='font-medium text-sm'>
                        AI-Generated Replies
                      </span>
                    </div>
                    <Switch
                      checked={action.config.useAI}
                      onCheckedChange={checked =>
                        onUpdate({
                          creditCost: checked
                            ? CREDIT_COSTS.AI_STANDARD + CREDIT_COSTS.BYOM_INFRA
                            : 0,
                          config: { ...action.config, useAI: checked },
                        })
                      }
                      className='data-[state=checked]:bg-purple-500'
                    />
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    Let AI craft contextual, personalized responses (
                    {CREDIT_COSTS.AI_STANDARD + CREDIT_COSTS.BYOM_INFRA}-
                    {CREDIT_COSTS.AI_FULL_CONTEXT + CREDIT_COSTS.BYOM_INFRA}{' '}
                    credits)
                  </p>
                </CardContent>
              </Card>

              {action.config.useAI ? (
                <>
                  {/* AI Tone */}
                  <div className='space-y-2'>
                    <Label className='text-xs text-muted-foreground uppercase tracking-wide'>
                      Response Tone
                    </Label>
                    <Select
                      value={action.config.aiTone || 'friendly'}
                      onValueChange={value =>
                        updateConfig({
                          aiTone: value as NonNullable<
                            ActionConfig['config']['aiTone']
                          >,
                        })
                      }
                    >
                      <SelectTrigger className='bg-background/50'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='friendly'>
                          Friendly & Warm
                        </SelectItem>
                        <SelectItem value='professional'>
                          Professional
                        </SelectItem>
                        <SelectItem value='casual'>Casual & Fun</SelectItem>
                        <SelectItem value='witty'>Witty & Clever</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* AI Context */}
                  <div className='space-y-2'>
                    <Label className='text-xs text-muted-foreground uppercase tracking-wide'>
                      Context for AI
                    </Label>
                    <Textarea
                      value={action.config.aiContext || ''}
                      onChange={e =>
                        updateConfig({ aiContext: e.target.value })
                      }
                      placeholder='Tell the AI about your business, what you sell, how to respond to common questions...'
                      className='bg-background/50 resize-none text-sm'
                      rows={4}
                    />
                    <p className='text-xs text-muted-foreground'>
                      This helps AI generate more relevant responses
                    </p>
                  </div>
                </>
              ) : (
                <>
                  {/* Manual Templates */}
                  <div className='space-y-2'>
                    <div className='flex items-center justify-between'>
                      <Label className='text-xs text-muted-foreground uppercase tracking-wide'>
                        Reply Templates
                      </Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className='h-3.5 w-3.5 text-muted-foreground' />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className='text-xs'>
                              One template will be randomly selected for each
                              reply
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    {action.config.replyTemplates?.map((template, index) => (
                      <div key={index} className='flex items-start gap-2'>
                        <Textarea
                          value={template}
                          onChange={e => {
                            const updated = [
                              ...(action.config.replyTemplates || []),
                            ];
                            updated[index] = e.target.value;
                            updateConfig({ replyTemplates: updated });
                          }}
                          className='bg-background/50 resize-none text-sm flex-1'
                          rows={2}
                        />
                        <Button
                          variant='ghost'
                          size='sm'
                          className='h-8 w-8 p-0 text-muted-foreground hover:text-destructive'
                          onClick={() => {
                            const updated =
                              action.config.replyTemplates?.filter(
                                (_, i) => i !== index
                              );
                            updateConfig({ replyTemplates: updated });
                          }}
                        >
                          <Trash2 className='h-3.5 w-3.5' />
                        </Button>
                      </div>
                    ))}

                    <div className='flex gap-2'>
                      <Input
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        placeholder='Add a reply template...'
                        className='bg-background/50 text-sm'
                      />
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => {
                          if (replyText.trim()) {
                            updateConfig({
                              replyTemplates: [
                                ...(action.config.replyTemplates || []),
                                replyText.trim(),
                              ],
                            });
                            setReplyText('');
                          }
                        }}
                      >
                        <Plus className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {/* Send DM settings */}
          {action.type === 'send_dm' && (
            <>
              {/* DM Templates */}
              <div className='space-y-2'>
                <Label className='text-xs text-muted-foreground uppercase tracking-wide'>
                  DM Templates
                </Label>
                <p className='text-xs text-muted-foreground mb-2'>
                  Select pre-made templates to send
                </p>

                <div className='space-y-2'>
                  {mockDmTemplates.map(template => {
                    const isSelected = action.config.dmTemplates?.some(
                      t => t.id === template.id
                    );
                    return (
                      <div
                        key={template.id}
                        className={cn(
                          'p-3 rounded-lg border cursor-pointer transition-all',
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-border bg-background/50 hover:border-primary/50'
                        )}
                        onClick={() => {
                          if (isSelected) {
                            updateConfig({
                              dmTemplates: action.config.dmTemplates?.filter(
                                t => t.id !== template.id
                              ),
                            });
                          } else {
                            updateConfig({
                              dmTemplates: [
                                ...(action.config.dmTemplates || []),
                                template,
                              ],
                            });
                          }
                        }}
                      >
                        <p className='text-sm font-medium mb-1'>
                          {template.name}
                        </p>
                        <p className='text-xs text-muted-foreground line-clamp-2'>
                          {template.content}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Send once toggle */}
              <div className='flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border'>
                <div>
                  <p className='text-sm font-medium'>Send only once per user</p>
                  <p className='text-xs text-muted-foreground'>
                    Avoid sending duplicate DMs
                  </p>
                </div>
                <Switch
                  checked={action.config.sendOnlyOnce}
                  onCheckedChange={checked =>
                    updateConfig({ sendOnlyOnce: checked })
                  }
                />
              </div>
            </>
          )}

          {/* Add tag settings */}
          {action.type === 'add_tag' && (
            <div className='space-y-2'>
              <Label className='text-xs text-muted-foreground uppercase tracking-wide'>
                Tag Name
              </Label>
              <Input
                value={action.config.tagName || ''}
                onChange={e => updateConfig({ tagName: e.target.value })}
                placeholder='e.g., interested, hot-lead, customer'
                className='bg-background/50'
              />
              <p className='text-xs text-muted-foreground'>
                Tags help you organize and segment users
              </p>
            </div>
          )}

          {/* Delay settings (common to all actions) */}
          <div className='space-y-3 pt-4 border-t border-border'>
            <div className='flex items-center justify-between'>
              <Label className='text-xs text-muted-foreground uppercase tracking-wide'>
                Response Delay
              </Label>
              <span className='text-sm font-medium'>
                {action.config.delay || 0}s
              </span>
            </div>
            <Slider
              value={[action.config.delay || 0]}
              onValueChange={([value]) => updateConfig({ delay: value })}
              max={120}
              step={5}
              className='w-full'
            />
            <p className='text-xs text-muted-foreground'>
              Adding a small delay makes responses feel more natural and human
            </p>
          </div>

          {/* Rate limit warning */}
          {action.type === 'send_dm' && (
            <Alert className='bg-amber-500/10 border-amber-500/20'>
              <AlertTriangle className='h-4 w-4 text-amber-500' />
              <AlertDescription className='text-xs text-amber-200'>
                Instagram limits DMs. This automation respects platform rate
                limits automatically.
              </AlertDescription>
            </Alert>
          )}
        </>
      )}
    </div>
  );
}
