'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  DollarSign,
  UserPlus,
  Gift,
  Heart,
  AtSign,
  HelpCircle,
  MessageCircle,
  Mail,
  Sparkles,
  Loader2,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  AutomationsApi,
  type CreateAutomationRequest,
} from '@/lib/api/automations';
import {
  AutomationTriggerType,
  AutomationTriggerSource,
  AutomationTriggerScope,
  AutomationActionType,
  AutomationPlatform,
  AutomationStatus,
  AutomationConditionType,
  AutomationConditionOperator,
  AutomationConditionKeywordMode,
  AutomationConditionSource,
} from '@/lib/constants/automations';
import { useSocialAccounts } from '@/lib/hooks';
import { toast } from '@/hooks/use-toast';
import { parseApiError } from '@/lib/http/errors';
import { analytics } from '@/lib/analytics';

// ─── Template definitions ───────────────────────────────────────────────────

interface AutomationTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  iconBg: string;
  triggerLabel: string;
  actionLabel: string;
  build: (socialAccountId: string) => CreateAutomationRequest;
}

const TEMPLATES: AutomationTemplate[] = [
  {
    id: 'price-inquiry',
    name: 'Price Inquiry Responder',
    description:
      'Automatically reply when someone asks about pricing, costs, or rates in comments.',
    icon: DollarSign,
    iconBg: 'from-emerald-500 to-teal-600',
    triggerLabel: 'Keyword Match',
    actionLabel: 'AI Reply',
    build: socialAccountId => ({
      name: 'Price Inquiry Responder',
      description:
        'Responds to comments asking about pricing with AI-generated replies.',
      social_account_id: socialAccountId,
      platform: AutomationPlatform.INSTAGRAM,
      status: AutomationStatus.DRAFT,
      trigger: {
        trigger_type: AutomationTriggerType.NEW_COMMENT,
        trigger_source: AutomationTriggerSource.POST,
        trigger_scope: AutomationTriggerScope.ALL,
      },
      conditions: [
        {
          condition_type: AutomationConditionType.KEYWORD,
          condition_operator: AutomationConditionOperator.CONTAINS,
          condition_keyword_mode: AutomationConditionKeywordMode.ANY,
          condition_source: AutomationConditionSource.COMMENT_TEXT,
          condition_value: ['price', 'cost', 'how much', 'rate', 'pricing'],
        },
      ],
      actions: [
        {
          action_type: AutomationActionType.REPLY_COMMENT,
          execution_order: 1,
          action_payload: {
            text: '',
            use_ai_reply: true,
          },
        },
      ],
    }),
  },
  {
    id: 'welcome-followers',
    name: 'Welcome New Followers',
    description:
      'Send a warm welcome DM to every new follower to start building relationships.',
    icon: UserPlus,
    iconBg: 'from-blue-500 to-indigo-600',
    triggerLabel: 'New Follow',
    actionLabel: 'Send DM',
    build: socialAccountId => ({
      name: 'Welcome New Followers',
      description: 'Sends a personalized welcome DM to new followers.',
      social_account_id: socialAccountId,
      platform: AutomationPlatform.INSTAGRAM,
      status: AutomationStatus.DRAFT,
      trigger: {
        trigger_type: AutomationTriggerType.MESSAGING_REFERRAL,
        trigger_source: AutomationTriggerSource.DIRECT_MESSAGE,
        trigger_scope: AutomationTriggerScope.ALL,
      },
      conditions: [],
      actions: [
        {
          action_type: AutomationActionType.SEND_DM,
          execution_order: 1,
          action_payload: {
            message: {
              type: 'text' as const,
              text: "Hey! Thanks for following! I'm excited to have you here. Feel free to reach out if you have any questions!",
            },
          },
        },
      ],
    }),
  },
  {
    id: 'lead-magnet',
    name: 'Lead Magnet Delivery',
    description:
      'Deliver free guides, ebooks, or downloads via DM when users comment trigger words.',
    icon: Gift,
    iconBg: 'from-violet-500 to-purple-600',
    triggerLabel: 'Keyword Match',
    actionLabel: 'Send DM',
    build: socialAccountId => ({
      name: 'Lead Magnet Delivery',
      description:
        'Sends a DM with download link when users comment keywords like "free" or "guide".',
      social_account_id: socialAccountId,
      platform: AutomationPlatform.INSTAGRAM,
      status: AutomationStatus.DRAFT,
      trigger: {
        trigger_type: AutomationTriggerType.NEW_COMMENT,
        trigger_source: AutomationTriggerSource.POST,
        trigger_scope: AutomationTriggerScope.ALL,
      },
      conditions: [
        {
          condition_type: AutomationConditionType.KEYWORD,
          condition_operator: AutomationConditionOperator.CONTAINS,
          condition_keyword_mode: AutomationConditionKeywordMode.ANY,
          condition_source: AutomationConditionSource.COMMENT_TEXT,
          condition_value: ['free', 'guide', 'download', 'ebook'],
        },
      ],
      actions: [
        {
          action_type: AutomationActionType.SEND_DM,
          execution_order: 1,
          action_payload: {
            message: {
              type: 'text' as const,
              text: "Thanks for your interest! Here's your free resource: [Add your link here]. Enjoy!",
            },
          },
        },
      ],
    }),
  },
  {
    id: 'comment-thank-you',
    name: 'Comment Thank You',
    description:
      'Automatically thank anyone who comments on your posts to boost engagement.',
    icon: Heart,
    iconBg: 'from-pink-500 to-rose-600',
    triggerLabel: 'Any Comment',
    actionLabel: 'Reply Comment',
    build: socialAccountId => ({
      name: 'Comment Thank You',
      description:
        'Replies to every comment with a personalized thank-you message using AI.',
      social_account_id: socialAccountId,
      platform: AutomationPlatform.INSTAGRAM,
      status: AutomationStatus.DRAFT,
      trigger: {
        trigger_type: AutomationTriggerType.NEW_COMMENT,
        trigger_source: AutomationTriggerSource.POST,
        trigger_scope: AutomationTriggerScope.ALL,
      },
      conditions: [],
      actions: [
        {
          action_type: AutomationActionType.REPLY_COMMENT,
          execution_order: 1,
          action_payload: {
            text: '',
            use_ai_reply: true,
          },
        },
      ],
    }),
  },
  {
    id: 'story-mention',
    name: 'Story Mention Reply',
    description:
      'Send a thank-you DM whenever someone mentions you in their story.',
    icon: AtSign,
    iconBg: 'from-orange-500 to-amber-600',
    triggerLabel: 'Story Mention',
    actionLabel: 'Send DM',
    build: socialAccountId => ({
      name: 'Story Mention Reply',
      description:
        'Sends a thank-you DM when someone mentions you in their Instagram story.',
      social_account_id: socialAccountId,
      platform: AutomationPlatform.INSTAGRAM,
      status: AutomationStatus.DRAFT,
      trigger: {
        trigger_type: AutomationTriggerType.STORY_MENTION,
        trigger_source: AutomationTriggerSource.STORY,
        trigger_scope: AutomationTriggerScope.ALL,
      },
      conditions: [],
      actions: [
        {
          action_type: AutomationActionType.SEND_DM,
          execution_order: 1,
          action_payload: {
            message: {
              type: 'text' as const,
              text: "Thanks so much for the mention! Really appreciate you sharing this. You're awesome!",
            },
          },
        },
      ],
    }),
  },
  {
    id: 'faq-responder',
    name: 'FAQ Auto-Responder',
    description:
      'Answer common questions about hours, location, shipping, and returns using AI.',
    icon: HelpCircle,
    iconBg: 'from-cyan-500 to-sky-600',
    triggerLabel: 'Keyword Match',
    actionLabel: 'AI Reply',
    build: socialAccountId => ({
      name: 'FAQ Auto-Responder',
      description:
        'Uses AI to answer common questions about hours, location, shipping, and returns.',
      social_account_id: socialAccountId,
      platform: AutomationPlatform.INSTAGRAM,
      status: AutomationStatus.DRAFT,
      trigger: {
        trigger_type: AutomationTriggerType.NEW_COMMENT,
        trigger_source: AutomationTriggerSource.POST,
        trigger_scope: AutomationTriggerScope.ALL,
      },
      conditions: [
        {
          condition_type: AutomationConditionType.KEYWORD,
          condition_operator: AutomationConditionOperator.CONTAINS,
          condition_keyword_mode: AutomationConditionKeywordMode.ANY,
          condition_source: AutomationConditionSource.COMMENT_TEXT,
          condition_value: ['hours', 'location', 'shipping', 'return'],
        },
      ],
      actions: [
        {
          action_type: AutomationActionType.REPLY_COMMENT,
          execution_order: 1,
          action_payload: {
            text: '',
            use_ai_reply: true,
          },
        },
      ],
    }),
  },
];

// ─── Template Card ──────────────────────────────────────────────────────────

function TemplateCard({
  template,
  onUse,
  isCreating,
}: {
  template: AutomationTemplate;
  onUse: (template: AutomationTemplate) => void;
  isCreating: boolean;
}) {
  const Icon = template.icon;

  return (
    <div className='group rounded-2xl border border-border bg-card transition-all duration-200 hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20'>
      <div className='p-4 sm:p-5'>
        {/* Icon + Name */}
        <div className='flex items-start gap-3'>
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br',
              template.iconBg
            )}
          >
            <Icon className='h-5 w-5 text-white' />
          </div>
          <div className='min-w-0 flex-1'>
            <h4 className='text-[14px] font-semibold leading-snug sm:text-[15px]'>
              {template.name}
            </h4>
            <p className='mt-1 text-xs text-muted-foreground leading-relaxed line-clamp-2'>
              {template.description}
            </p>
          </div>
        </div>

        {/* Trigger + Action pills */}
        <div className='mt-3 flex flex-wrap items-center gap-1.5 pl-[52px]'>
          <span className='inline-flex items-center gap-1 rounded-lg border border-border/60 bg-muted/30 px-2 py-0.5 text-[11px] text-muted-foreground'>
            <MessageCircle className='h-3 w-3' />
            {template.triggerLabel}
          </span>
          <ArrowRight className='h-3 w-3 text-muted-foreground/50' />
          <span className='inline-flex items-center gap-1 rounded-lg border border-border/60 bg-muted/30 px-2 py-0.5 text-[11px] text-muted-foreground'>
            {template.actionLabel === 'Send DM' ? (
              <Mail className='h-3 w-3' />
            ) : (
              <Sparkles className='h-3 w-3' />
            )}
            {template.actionLabel}
          </span>
        </div>

        {/* Use Template button */}
        <div className='mt-4 pl-[52px]'>
          <Button
            size='sm'
            disabled={isCreating}
            onClick={() => onUse(template)}
            className='h-8 gap-1.5 text-xs w-full sm:w-auto'
          >
            {isCreating ? (
              <Loader2 className='h-3.5 w-3.5 animate-spin' />
            ) : (
              <Zap className='h-3.5 w-3.5' />
            )}
            Use This Template
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Templates Gallery ──────────────────────────────────────────────────────

export function AutomationTemplatesGallery({
  variant = 'section',
}: {
  /** 'section' renders with a heading; 'inline' renders cards only */
  variant?: 'section' | 'inline';
}) {
  const router = useRouter();
  const { data: socialAccounts } = useSocialAccounts();
  const [creatingId, setCreatingId] = useState<string | null>(null);

  const handleUseTemplate = async (template: AutomationTemplate) => {
    const accounts = socialAccounts ?? [];
    const primaryAccount =
      accounts.find(a => a.is_primary && a.is_active) ??
      accounts.find(a => a.is_active) ??
      accounts[0];

    if (!primaryAccount) {
      toast({
        variant: 'destructive',
        title: 'No connected account',
        description:
          'Connect an Instagram account first before creating an automation.',
      });
      return;
    }

    setCreatingId(template.id);
    try {
      const request = template.build(primaryAccount.id);
      const res = await AutomationsApi.create(request);
      analytics.track('automation_created', {
        automation_id: res.data?.id ?? '',
        trigger_type: `template:${template.id}`,
      });
      toast({
        title: 'Template applied!',
        description: `"${template.name}" has been created as a draft. Customize it and activate when ready.`,
      });
      if (res.data?.id) {
        router.push(`/dashboard/automations/${res.data.id}/edit`);
      }
    } catch (err) {
      const e = parseApiError(err);
      toast({
        variant: 'destructive',
        title: e.title,
        description: e.message,
      });
    } finally {
      setCreatingId(null);
    }
  };

  const cards = (
    <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
      {TEMPLATES.map(template => (
        <TemplateCard
          key={template.id}
          template={template}
          onUse={handleUseTemplate}
          isCreating={creatingId === template.id}
        />
      ))}
    </div>
  );

  if (variant === 'inline') return cards;

  return (
    <div className='space-y-4'>
      <div>
        <h2 className='text-lg font-bold leading-tight sm:text-xl'>
          Quick-Start Templates
        </h2>
        <p className='mt-1 text-sm text-muted-foreground'>
          Clone a pre-built automation in one click, then customize it to match
          your brand.
        </p>
      </div>
      {cards}
    </div>
  );
}
