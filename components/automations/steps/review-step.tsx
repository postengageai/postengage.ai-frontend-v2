'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  ChevronLeft,
  Check,
  Instagram,
  MessageCircle,
  Mail,
  Pencil,
  Rocket,
  ImageIcon,
  AtSign,
  UserPlus,
  Bot as BotIcon,
  Tag,
} from 'lucide-react';
import type { AutomationFormData } from '../automation-wizard';
import {
  AutomationPlatform,
  AutomationTriggerType,
  AutomationStatus,
  AutomationTriggerScope,
  AutomationActionType,
} from '@/lib/constants/automations';
import { IntelligenceApi } from '@/lib/api/intelligence';
import { CREDIT_COSTS } from '@/lib/config/credit-pricing';
import type { Bot, UserLlmConfig } from '@/lib/types/intelligence';
import { LlmConfigMode } from '@/lib/types/intelligence';
import type {
  ReplyCommentPayload,
  PrivateReplyPayload,
  SendDmPayload,
} from '@/lib/api/automations';

interface ReviewStepProps {
  formData: AutomationFormData;
  updateFormData: (data: Partial<AutomationFormData>) => void;
  prevStep: () => void;
  onComplete: (isDraft: boolean) => void;
  goToStep: (step: number) => void;
  isEditMode?: boolean;
}

function getTriggerLabel(type?: string) {
  switch (type) {
    case AutomationTriggerType.NEW_COMMENT:
      return 'New Comment';
    case AutomationTriggerType.DM_RECEIVED:
      return 'DM Received';
    case AutomationTriggerType.STORY_REPLY:
      return 'Story Reply';
    case AutomationTriggerType.MENTION:
      return 'Mention';
    case AutomationTriggerType.NEW_FOLLOWER:
      return 'New Follower';
    default:
      return type || '—';
  }
}

function getTriggerIcon(type?: string) {
  switch (type) {
    case AutomationTriggerType.NEW_COMMENT:
      return MessageCircle;
    case AutomationTriggerType.DM_RECEIVED:
      return Mail;
    case AutomationTriggerType.STORY_REPLY:
      return ImageIcon;
    case AutomationTriggerType.MENTION:
      return AtSign;
    case AutomationTriggerType.NEW_FOLLOWER:
      return UserPlus;
    default:
      return MessageCircle;
  }
}

function getActionLabel(type: string) {
  switch (type) {
    case AutomationActionType.REPLY_COMMENT:
      return 'Reply to Comment';
    case AutomationActionType.PRIVATE_REPLY:
      return 'Send Private Reply';
    case AutomationActionType.SEND_DM:
      return 'Send DM Reply';
    default:
      return type;
  }
}

export function ReviewStep({
  formData,
  updateFormData,
  prevStep,
  onComplete,
  goToStep,
  isEditMode = false,
}: ReviewStepProps) {
  const [isLoading, setIsLoading] = useState(false);
  /** Map of bot._id → Bot for per-action cost/label lookup. */
  const [botsMap, setBotsMap] = useState<Record<string, Bot>>({});
  const [userConfig, setUserConfig] = useState<UserLlmConfig | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const hasAnyAi = formData.actions?.some(action => {
          const p = action.action_payload as
            | ReplyCommentPayload
            | PrivateReplyPayload
            | SendDmPayload;
          return 'use_ai_reply' in p && Boolean(p.use_ai_reply);
        });

        const promises: Promise<unknown>[] = [IntelligenceApi.getUserConfig()];
        if (hasAnyAi) {
          promises.push(
            IntelligenceApi.getBots({
              social_account_id: formData.social_account_id,
            })
          );
        }
        const [configRes, botsRes] = await Promise.all(promises);
        setUserConfig((configRes as { data: UserLlmConfig }).data);
        if (botsRes) {
          const bots: Bot[] = (botsRes as { data: Bot[] }).data || [];
          setBotsMap(Object.fromEntries(bots.map(b => [b._id, b])));
        }
      } catch (_err) {
        // non-critical
      }
    };
    fetchData();
  }, [formData.actions, formData.social_account_id]);

  const handleSave = async (isDraft: boolean) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      updateFormData({
        status: isDraft ? AutomationStatus.DRAFT : AutomationStatus.ACTIVE,
      });
      await onComplete(isDraft);
    } finally {
      setIsLoading(false);
    }
  };

  /** Per-action credit cost using that action's own bot. */
  const getActionCreditCost = (
    action: AutomationFormData['actions'][0]
  ): number => {
    const payload = action.action_payload as
      | ReplyCommentPayload
      | PrivateReplyPayload
      | SendDmPayload;
    const hasAi = 'use_ai_reply' in payload && Boolean(payload.use_ai_reply);
    if (!hasAi) return 0;
    const isByom = userConfig?.mode === LlmConfigMode.BYOM;
    const infraCost = CREDIT_COSTS.BYOM_INFRA;
    if (isByom) return infraCost;
    const bot = action.bot_id ? botsMap[action.bot_id] : undefined;
    const hasKnowledge =
      bot?.knowledge_sources && bot.knowledge_sources.length > 0;
    const aiTierCost = hasKnowledge
      ? CREDIT_COSTS.AI_KNOWLEDGE
      : CREDIT_COSTS.AI_STANDARD;
    return infraCost + aiTierCost;
  };

  const totalCredits = (formData.actions || []).reduce(
    (sum, action) => sum + getActionCreditCost(action),
    0
  );
  const TriggerIcon = getTriggerIcon(formData.trigger_type);

  const allValid =
    formData.name?.trim() &&
    formData.trigger_type &&
    formData.actions.length > 0;

  return (
    <div>
      <h2 className='mb-2 text-2xl font-bold text-foreground'>
        {isEditMode ? 'Review & Save Changes' : 'Review & Launch'}
      </h2>
      <p className='mb-8 text-muted-foreground'>
        {isEditMode
          ? 'Review your changes before saving'
          : 'Everything looks good? Launch your automation.'}
      </p>

      <div className='grid gap-6 lg:grid-cols-[1fr_280px]'>
        {/* Left: Summary Sections */}
        <div className='space-y-3'>
          {/* Platform & Account */}
          {!isEditMode && (
            <SummarySection
              title='Platform & Account'
              stepId={1}
              goToStep={goToStep}
            >
              <div className='flex flex-wrap items-center gap-3 text-sm'>
                <div className='flex items-center gap-1.5'>
                  <Instagram className='h-4 w-4 text-muted-foreground' />
                  <Badge
                    variant='secondary'
                    className='bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  >
                    {formData.platform === AutomationPlatform.INSTAGRAM
                      ? 'Instagram'
                      : 'Facebook'}
                  </Badge>
                </div>
                {formData.social_account_name && (
                  <span className='text-muted-foreground'>
                    @{formData.social_account_name}
                  </span>
                )}
              </div>
            </SummarySection>
          )}

          {/* Trigger */}
          <SummarySection title='Trigger' stepId={3} goToStep={goToStep}>
            <div className='flex flex-wrap items-center gap-2 text-sm'>
              <div className='flex items-center gap-1.5'>
                <TriggerIcon className='h-4 w-4 text-muted-foreground' />
                <Badge variant='secondary'>
                  {getTriggerLabel(formData.trigger_type)}
                </Badge>
              </div>
              {formData.trigger_type === AutomationTriggerType.NEW_COMMENT &&
                formData.trigger_scope && (
                  <Badge variant='outline' className='text-xs'>
                    {formData.trigger_scope === AutomationTriggerScope.ALL
                      ? 'All Posts'
                      : `${formData.content_ids?.length || 0} specific post(s)`}
                  </Badge>
                )}
            </div>
          </SummarySection>

          {/* Conditions */}
          <SummarySection title='Conditions' stepId={4} goToStep={goToStep}>
            {formData.condition &&
            formData.condition.condition_value.length > 0 ? (
              <div className='flex flex-wrap items-center gap-2'>
                <span className='text-xs text-muted-foreground'>
                  {formData.condition.condition_keyword_mode} of:
                </span>
                {formData.condition.condition_value.slice(0, 4).map(kw => (
                  <Badge key={kw} variant='outline' className='text-xs'>
                    {kw}
                  </Badge>
                ))}
                {formData.condition.condition_value.length > 4 && (
                  <Badge variant='outline' className='text-xs'>
                    +{formData.condition.condition_value.length - 4} more
                  </Badge>
                )}
              </div>
            ) : (
              <p className='text-sm text-muted-foreground'>
                None — triggers on all{' '}
                {formData.trigger_type === AutomationTriggerType.NEW_COMMENT
                  ? 'comments'
                  : 'DMs'}
              </p>
            )}
          </SummarySection>

          {/* Actions */}
          <SummarySection title='Actions' stepId={5} goToStep={goToStep}>
            <div className='space-y-2'>
              {formData.actions.map((action, i) => {
                const payload = action.action_payload as
                  | ReplyCommentPayload
                  | PrivateReplyPayload
                  | SendDmPayload;
                const hasAi =
                  'use_ai_reply' in payload && Boolean(payload.use_ai_reply);
                const actionCost = getActionCreditCost(action);
                const botName =
                  action.bot_name ||
                  (action.bot_id ? botsMap[action.bot_id]?.name : undefined);
                return (
                  <div
                    key={i}
                    className='flex flex-wrap items-center gap-2 text-sm'
                  >
                    <div className='flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary'>
                      {i + 1}
                    </div>
                    <span className='text-foreground'>
                      {getActionLabel(action.action_type)}
                    </span>
                    {hasAi ? (
                      <Badge
                        variant='secondary'
                        className='bg-primary/10 text-xs text-primary'
                      >
                        <BotIcon className='mr-1 h-3 w-3' />
                        {botName ? botName : 'AI'} · {actionCost} cr
                      </Badge>
                    ) : (
                      <Badge
                        variant='secondary'
                        className='bg-muted text-xs text-muted-foreground'
                      >
                        Free
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </SummarySection>

          {/* Metadata */}
          <SummarySection title='Metadata' stepId={6} goToStep={goToStep}>
            <div className='space-y-1.5 text-sm'>
              <p className='font-medium text-foreground'>
                {formData.name || (
                  <span className='text-muted-foreground'>No name set</span>
                )}
              </p>
              {formData.description && (
                <p className='text-muted-foreground'>{formData.description}</p>
              )}
              {formData.labels && formData.labels.length > 0 && (
                <div className='flex flex-wrap gap-1.5 pt-1'>
                  <Tag className='h-3.5 w-3.5 text-muted-foreground' />
                  {formData.labels.map(label => (
                    <Badge key={label} variant='outline' className='text-xs'>
                      {label}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </SummarySection>
        </div>

        {/* Right: Launch / Save Panel */}
        <div className='space-y-4'>
          <Card className='border-primary/20 bg-primary/5 p-5'>
            {allValid ? (
              <div className='mb-4 flex items-center gap-2 rounded-lg bg-green-500/10 px-3 py-2'>
                <Check className='h-4 w-4 text-green-600' />
                <p className='text-sm font-medium text-green-700 dark:text-green-400'>
                  All steps complete
                </p>
              </div>
            ) : (
              <div className='mb-4 rounded-lg bg-amber-500/10 px-3 py-2'>
                <p className='text-sm font-medium text-amber-700 dark:text-amber-400'>
                  Some steps need attention
                </p>
              </div>
            )}

            <h3 className='mb-1 font-semibold text-foreground'>
              {isEditMode ? 'Save Changes' : 'Ready to launch'}
            </h3>
            <p className='mb-4 text-xs text-muted-foreground'>
              {isEditMode
                ? 'Save your changes or keep as draft'
                : 'Activate now or save as draft to finish later'}
            </p>

            {/* Mini stats */}
            <div className='mb-5 grid grid-cols-2 gap-2 text-center'>
              <div className='rounded-lg bg-background/70 p-2'>
                <p className='text-lg font-bold text-foreground'>
                  {formData.condition?.condition_value?.length || 0}
                </p>
                <p className='text-xs text-muted-foreground'>Keywords</p>
              </div>
              <div className='rounded-lg bg-background/70 p-2'>
                <p className='text-lg font-bold text-foreground'>
                  {formData.actions.length}
                </p>
                <p className='text-xs text-muted-foreground'>Actions</p>
              </div>
            </div>

            <div className='space-y-2'>
              <Button
                onClick={() => handleSave(false)}
                disabled={!formData.name?.trim() || isLoading}
                className='w-full gap-2'
              >
                {isLoading ? (
                  'Processing...'
                ) : (
                  <>
                    <Rocket className='h-4 w-4' />
                    {isEditMode ? 'Save Changes' : 'Save & Activate'}
                  </>
                )}
              </Button>
              <Button
                variant='outline'
                onClick={() => handleSave(true)}
                disabled={!formData.name?.trim() || isLoading}
                className='w-full bg-transparent'
              >
                {isLoading ? 'Saving...' : 'Save as Draft'}
              </Button>
            </div>
          </Card>

          {totalCredits > 0 && (
            <div className='rounded-xl border border-border bg-card p-4 text-center'>
              <p className='text-xs text-muted-foreground'>
                Cost per execution
              </p>
              <p className='text-2xl font-bold text-foreground'>
                {totalCredits}{' '}
                <span className='text-sm font-normal text-muted-foreground'>
                  credits
                </span>
              </p>
            </div>
          )}
        </div>
      </div>

      <div className='mt-8'>
        <Button variant='outline' onClick={prevStep} className='bg-transparent'>
          <ChevronLeft className='mr-2 h-4 w-4' />
          Back
        </Button>
      </div>
    </div>
  );
}

// Helper component for each summary section
function SummarySection({
  title,
  stepId,
  goToStep,
  children,
}: {
  title: string;
  stepId: number;
  goToStep: (step: number) => void;
  children: React.ReactNode;
}) {
  return (
    <Card className='p-4'>
      <div className='mb-3 flex items-center justify-between'>
        <h3 className='text-sm font-semibold text-foreground'>{title}</h3>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => goToStep(stepId)}
          className='h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground'
        >
          <Pencil className='h-3 w-3' />
          Edit
        </Button>
      </div>
      {children}
    </Card>
  );
}
