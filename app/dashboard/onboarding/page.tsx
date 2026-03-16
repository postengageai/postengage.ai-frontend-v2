'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Instagram,
  Zap,
  Rocket,
  CheckCircle2,
  MessageCircle,
  Mail,
  ArrowRight,
  Loader2,
  ChevronLeft,
  Sparkles,
  Check,
  Tag,
  X,
  Plus,
  Images,
} from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MediaSelectorModal } from '@/components/automations/media-selector-modal';
import type { Media } from '@/lib/api/media';
import { SocialAccountsApi, SocialAccount } from '@/lib/api/social-accounts';
import { OnboardingConnectStep } from '@/components/onboarding/onboarding-connect-step';
import { automationsApi } from '@/lib/api/automations';
import { completeOnboarding } from '@/lib/api/user';
import { useUserActions, useUser } from '@/lib/user/store';
import { analytics } from '@/lib/analytics';
import {
  AutomationTriggerType,
  AutomationTriggerSource,
  AutomationTriggerScope,
  AutomationActionType,
  AutomationConditionType,
  AutomationConditionOperator,
  AutomationConditionKeywordMode,
} from '@/lib/constants/automations';
import { Skeleton } from '@/components/ui/skeleton';

// ─── Step definitions ─────────────────────────────────────────────────────────

const STEPS = [
  { id: 'connect', label: 'Connect', icon: Instagram },
  { id: 'automate', label: 'Automate', icon: Zap },
  { id: 'launch', label: 'Launch', icon: Rocket },
] as const;

type StepId = (typeof STEPS)[number]['id'];

// ─── Step Indicator ───────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: StepId }) {
  const currentIdx = STEPS.findIndex(s => s.id === current);
  return (
    <div className='flex items-center justify-center gap-0 mb-10'>
      {STEPS.map((step, idx) => {
        const done = idx < currentIdx;
        const active = idx === currentIdx;
        const Icon = step.icon;
        return (
          <div key={step.id} className='flex items-center'>
            <div className='flex flex-col items-center gap-1.5'>
              <div
                className={cn(
                  'h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all duration-300',
                  done
                    ? 'bg-primary border-primary text-primary-foreground'
                    : active
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'bg-muted border-border text-muted-foreground'
                )}
              >
                {done ? (
                  <CheckCircle2 className='h-4.5 w-4.5' />
                ) : (
                  <Icon className='h-4 w-4' />
                )}
              </div>
              <span
                className={cn(
                  'text-[11px] font-medium hidden sm:block',
                  active ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={cn(
                  'h-0.5 w-16 sm:w-24 mx-2 mt-[-18px] sm:mt-[-20px] transition-all',
                  idx < currentIdx ? 'bg-primary' : 'bg-border'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Automation builder types ─────────────────────────────────────────────────

type TriggerChoice = 'comment' | 'dm';

interface AutomationDraft {
  name: string;
  trigger: TriggerChoice;
  replyText: string;
  keywords: string[]; // optional keyword filter
  sendDmToo: boolean; // for comment trigger: also send a DM
  dmText: string;
}

const DEFAULT_DRAFT: AutomationDraft = {
  name: 'My First Automation',
  trigger: 'comment',
  replyText: '',
  keywords: [],
  sendDmToo: false,
  dmText: '',
};

// ─── Step 2: Automate ─────────────────────────────────────────────────────────

function AutomateStep({
  socialAccount,
  onComplete,
  onBack,
}: {
  socialAccount: SocialAccount;
  onComplete: () => void;
  onBack: () => void;
}) {
  const [draft, setDraft] = useState<AutomationDraft>(DEFAULT_DRAFT);
  const [keyword, setKeyword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Post scope (comment trigger only)
  const [scope, setScope] = useState<'all' | 'specific'>('all');
  const [selectedMedia, setSelectedMedia] = useState<Media[]>([]);
  const [mediaModalOpen, setMediaModalOpen] = useState(false);

  const set = (patch: Partial<AutomationDraft>) =>
    setDraft(d => ({ ...d, ...patch }));

  const addKeyword = () => {
    const kw = keyword.trim().toLowerCase();
    if (kw && !draft.keywords.includes(kw))
      set({ keywords: [...draft.keywords, kw] });
    setKeyword('');
  };

  const removeKeyword = (kw: string) =>
    set({ keywords: draft.keywords.filter(k => k !== kw) });

  const isValid =
    draft.replyText.trim().length >= 2 &&
    (!draft.sendDmToo || draft.dmText.trim().length >= 2) &&
    (draft.trigger !== 'comment' ||
      scope === 'all' ||
      selectedMedia.length > 0);

  const handleCreate = async () => {
    if (!isValid) return;
    setSaving(true);
    setError(null);
    try {
      const isComment = draft.trigger === 'comment';

      const actions: Parameters<typeof automationsApi.create>[0]['actions'] =
        [];

      // Primary action
      if (isComment) {
        actions.push({
          action_type: AutomationActionType.REPLY_COMMENT,
          execution_order: 1,
          action_payload: { text: draft.replyText, use_ai_reply: false },
        });
        if (draft.sendDmToo && draft.dmText.trim()) {
          actions.push({
            action_type: AutomationActionType.SEND_DM,
            execution_order: 2,
            action_payload: {
              message: { type: 'text' as const, text: draft.dmText },
              use_ai_reply: false,
            },
          });
        }
      } else {
        actions.push({
          action_type: AutomationActionType.SEND_DM,
          execution_order: 1,
          action_payload: {
            message: { type: 'text' as const, text: draft.replyText },
            use_ai_reply: false,
          },
        });
      }

      // Keyword conditions
      const conditions: Parameters<
        typeof automationsApi.create
      >[0]['conditions'] = [];
      if (draft.keywords.length > 0) {
        conditions.push({
          condition_type: AutomationConditionType.KEYWORD,
          condition_operator: AutomationConditionOperator.CONTAINS,
          condition_keyword_mode: AutomationConditionKeywordMode.ANY,
          condition_value: draft.keywords,
        });
      }

      await automationsApi.create({
        name: draft.name,
        social_account_id: socialAccount.id,
        platform: 'instagram',
        status: 'active',
        trigger: {
          trigger_type: isComment
            ? AutomationTriggerType.NEW_COMMENT
            : AutomationTriggerType.DM_RECEIVED,
          trigger_source: isComment
            ? AutomationTriggerSource.POST
            : AutomationTriggerSource.DIRECT_MESSAGE,
          ...(isComment && {
            trigger_scope:
              scope === 'specific'
                ? AutomationTriggerScope.SPECIFIC
                : AutomationTriggerScope.ALL,
            ...(scope === 'specific' &&
              selectedMedia.length > 0 && {
                content_ids: selectedMedia.map(m => m.id),
              }),
          }),
        },
        conditions,
        actions,
      });

      analytics.track('automation_created', { automation_id: '' });
      onComplete();
    } catch (e: unknown) {
      setError(
        (e instanceof Error ? e.message : null) ??
          'Failed to create automation. You can set it up later from the Automations page.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className='space-y-6'>
      {/* Section: Trigger */}
      <div>
        <Label className='text-sm font-semibold text-foreground mb-3 block'>
          When should this run?
        </Label>
        <div className='grid grid-cols-2 gap-3'>
          {[
            {
              value: 'comment' as const,
              icon: MessageCircle,
              label: 'New Comment',
              desc: 'Reply when someone comments on your posts',
            },
            {
              value: 'dm' as const,
              icon: Mail,
              label: 'Direct Message',
              desc: 'Reply when someone sends you a DM',
            },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => {
                set({ trigger: opt.value });
                if (opt.value === 'dm') {
                  setScope('all');
                  setSelectedMedia([]);
                }
              }}
              className={cn(
                'relative flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-all',
                draft.trigger === opt.value
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card hover:border-primary/40'
              )}
            >
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-lg',
                  draft.trigger === opt.value
                    ? 'bg-primary text-white'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                <opt.icon className='h-4 w-4' />
              </div>
              <div>
                <p className='text-sm font-semibold'>{opt.label}</p>
                <p className='text-xs text-muted-foreground mt-0.5 leading-snug'>
                  {opt.desc}
                </p>
              </div>
              {draft.trigger === opt.value && (
                <div className='absolute top-3 right-3 h-5 w-5 flex items-center justify-center rounded-full bg-primary text-white'>
                  <Check className='h-3 w-3' />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Section: Apply to (comment trigger only) */}
      {draft.trigger === 'comment' && (
        <div>
          <div className='flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-4'>
            <Label className='text-sm font-semibold text-foreground min-w-[68px]'>
              Apply to
            </Label>
            <Select
              value={scope}
              onValueChange={v => {
                const next = v as 'all' | 'specific';
                setScope(next);
                if (next === 'all') setSelectedMedia([]);
              }}
            >
              <SelectTrigger className='sm:w-52'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All posts &amp; reels</SelectItem>
                <SelectItem value='specific'>Specific posts</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Specific posts picker */}
          {scope === 'specific' && (
            <div className='mt-3 rounded-xl border border-border bg-card/50 p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-foreground'>
                    {selectedMedia.length === 0
                      ? 'No posts selected yet'
                      : `${selectedMedia.length} post${selectedMedia.length !== 1 ? 's' : ''} selected`}
                  </p>
                  <p className='text-xs text-muted-foreground mt-0.5'>
                    Pick which posts this automation monitors
                  </p>
                </div>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setMediaModalOpen(true)}
                  className='gap-1.5 shrink-0'
                >
                  <Plus className='h-3.5 w-3.5' />
                  Select Posts
                </Button>
              </div>

              {selectedMedia.length > 0 && (
                <div className='mt-3 flex flex-wrap gap-2'>
                  {selectedMedia.map(media => (
                    <div
                      key={media.id}
                      className='group relative h-16 w-16 overflow-hidden rounded-lg border border-border'
                    >
                      <Image
                        src={media.thumbnail_url || media.url}
                        alt='Selected post'
                        width={64}
                        height={64}
                        className='h-full w-full object-cover'
                        unoptimized
                      />
                      <button
                        onClick={() =>
                          setSelectedMedia(prev =>
                            prev.filter(m => m.id !== media.id)
                          )
                        }
                        className='absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-white opacity-0 transition-opacity group-hover:opacity-100'
                      >
                        <X className='h-3 w-3' />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {selectedMedia.length === 0 && (
                <div
                  className='mt-3 flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border py-6 cursor-pointer hover:border-primary/50 transition-colors'
                  onClick={() => setMediaModalOpen(true)}
                >
                  <Images className='h-8 w-8 text-muted-foreground/40' />
                  <p className='text-xs text-amber-500 font-medium'>
                    Select at least one post to continue
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Section: Reply message */}
      <div>
        <div className='flex items-center justify-between mb-2'>
          <Label
            htmlFor='reply-text'
            className='text-sm font-semibold text-foreground'
          >
            {draft.trigger === 'comment' ? 'Comment reply' : 'DM reply'}
          </Label>
          <span className='text-[11px] text-success font-medium flex items-center gap-1'>
            <Sparkles className='h-3 w-3' /> FREE — 0 credits
          </span>
        </div>
        <Textarea
          id='reply-text'
          placeholder={
            draft.trigger === 'comment'
              ? 'e.g. Thanks for your comment! Check your DMs 👇'
              : 'e.g. Hey! Thanks for reaching out. How can I help you? 😊'
          }
          value={draft.replyText}
          onChange={e => set({ replyText: e.target.value })}
          className='resize-none h-20 text-sm'
          maxLength={500}
        />
        <p className='text-[11px] text-muted-foreground mt-1 text-right'>
          {draft.replyText.length}/500
        </p>
      </div>

      {/* For comment: also send DM */}
      {draft.trigger === 'comment' && (
        <div className='rounded-xl border border-border bg-muted/20 p-4 space-y-3'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium'>Also send a DM?</p>
              <p className='text-xs text-muted-foreground'>
                Slide into their DMs after replying to the comment
              </p>
            </div>
            <button
              onClick={() => set({ sendDmToo: !draft.sendDmToo })}
              className={cn(
                'relative h-6 w-11 rounded-full transition-colors',
                draft.sendDmToo ? 'bg-primary' : 'bg-muted-foreground/30'
              )}
            >
              <span
                className={cn(
                  'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all',
                  draft.sendDmToo ? 'left-[22px]' : 'left-0.5'
                )}
              />
            </button>
          </div>
          {draft.sendDmToo && (
            <Textarea
              placeholder='e.g. Hey! I just replied to your comment. Here is the link you asked about: postengage.ai 🚀'
              value={draft.dmText}
              onChange={e => set({ dmText: e.target.value })}
              className='resize-none h-20 text-sm'
              maxLength={500}
            />
          )}
        </div>
      )}

      {/* Section: Keywords (optional) */}
      <div>
        <div className='flex items-center justify-between mb-2'>
          <Label className='text-sm font-semibold text-foreground'>
            Keyword filter{' '}
            <span className='font-normal text-muted-foreground'>
              (optional)
            </span>
          </Label>
        </div>
        <p className='text-xs text-muted-foreground mb-3'>
          Only trigger when the message contains one of these keywords. Leave
          empty to trigger on everything.
        </p>
        <div className='flex gap-2'>
          <div className='flex-1 relative'>
            <Tag className='absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground' />
            <Input
              placeholder='e.g. price, link, info'
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addKeyword();
                }
              }}
              className='pl-8 h-9 text-sm'
            />
          </div>
          <Button
            size='sm'
            variant='outline'
            onClick={addKeyword}
            disabled={!keyword.trim()}
            className='h-9'
          >
            Add
          </Button>
        </div>
        {draft.keywords.length > 0 && (
          <div className='flex flex-wrap gap-1.5 mt-3'>
            {draft.keywords.map(kw => (
              <Badge
                key={kw}
                variant='secondary'
                className='gap-1 pr-1.5 text-xs'
              >
                {kw}
                <button
                  onClick={() => removeKeyword(kw)}
                  className='ml-0.5 hover:text-destructive transition-colors'
                >
                  <X className='h-3 w-3' />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Section: Name */}
      <div>
        <Label
          htmlFor='auto-name'
          className='text-sm font-semibold text-foreground mb-2 block'
        >
          Automation name
        </Label>
        <Input
          id='auto-name'
          value={draft.name}
          onChange={e => set({ name: e.target.value })}
          className='h-9 text-sm'
          maxLength={60}
        />
      </div>

      {/* Error */}
      {error && (
        <p className='text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2'>
          {error}
        </p>
      )}

      {/* Actions */}
      <div className='flex items-center justify-between pt-2'>
        <Button variant='ghost' size='sm' onClick={onBack} disabled={saving}>
          <ChevronLeft className='mr-1 h-4 w-4' /> Back
        </Button>
        <div className='flex gap-3'>
          {error && (
            <Button
              variant='ghost'
              size='sm'
              onClick={onComplete}
              disabled={saving}
            >
              Skip for now
            </Button>
          )}
          <Button
            onClick={handleCreate}
            disabled={!isValid || saving}
            className='gap-2'
          >
            {saving ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <Zap className='h-4 w-4' />
            )}
            {saving ? 'Creating…' : 'Create & Launch →'}
          </Button>
        </div>
      </div>

      {/* Media picker modal (specific posts) */}
      <MediaSelectorModal
        open={mediaModalOpen}
        onOpenChange={setMediaModalOpen}
        selectedIds={selectedMedia.map(m => m.id)}
        initialMedia={selectedMedia}
        onSelect={setSelectedMedia}
        socialAccountId={socialAccount.id}
      />
    </div>
  );
}

// ─── Step 3: Launch celebration ───────────────────────────────────────────────

function LaunchStep({
  onFinish,
  accountUsername,
}: {
  onFinish: () => void;
  accountUsername?: string;
}) {
  const perks = [
    {
      icon: Zap,
      iconClass: 'text-yellow-500',
      text: 'Your automation is active and running',
    },
    {
      icon: MessageCircle,
      iconClass: 'text-blue-400',
      text: 'Replies go out instantly — 24/7',
    },
    {
      icon: Sparkles,
      iconClass: 'text-violet-400',
      text: '500 free credits to power AI replies later',
    },
    {
      icon: ArrowRight,
      iconClass: 'text-primary',
      text: 'Track performance in your dashboard',
    },
  ];

  return (
    <div className='text-center py-4 space-y-6'>
      {/* Rocket icon — animated */}
      <div className='flex items-center justify-center'>
        <div className='animate-bounce flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10'>
          <Rocket className='h-8 w-8 text-primary' />
        </div>
      </div>

      <div>
        <h2 className='text-2xl font-bold text-foreground'>
          You&apos;re live!
        </h2>
        {accountUsername && (
          <p className='text-sm text-muted-foreground mt-1'>
            @{accountUsername} is now on autopilot
          </p>
        )}
      </div>

      {/* What's set up */}
      <div className='rounded-xl border border-border bg-card/50 p-5 text-left space-y-3 max-w-sm mx-auto'>
        {perks.map((p, i) => (
          <div key={i} className='flex items-center gap-3'>
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted ${p.iconClass}`}
            >
              <p.icon className='h-3.5 w-3.5' />
            </div>
            <p className='text-sm text-foreground'>{p.text}</p>
          </div>
        ))}
      </div>

      {/* What's next hint */}
      <div className='rounded-xl border border-primary/20 bg-primary/5 p-4 max-w-sm mx-auto'>
        <div className='flex items-start gap-2.5'>
          <Sparkles className='h-4 w-4 text-primary/70 shrink-0 mt-0.5' />
          <p className='text-xs text-primary/80 font-medium text-left'>
            Want smarter replies? Add an AI bot from your dashboard to handle
            complex questions automatically.
          </p>
        </div>
      </div>

      <Button onClick={onFinish} size='lg' className='gap-2 px-8'>
        Open Dashboard
        <ArrowRight className='h-4 w-4' />
      </Button>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const { updateUser } = useUserActions();
  const user = useUser();
  const [step, setStep] = useState<StepId>('connect');
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);

  // If the user has already completed onboarding, redirect them away immediately.
  // This prevents the wizard from re-appearing on every login when
  // onboarding_completed_at is already set in the backend.
  useEffect(() => {
    if (user?.onboarding_completed_at) {
      router.replace('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    SocialAccountsApi.list()
      .then(r => {
        const accs = r?.data ?? [];
        setAccounts(accs);
        if (accs.length > 0) setStep('automate');
      })
      .catch(() => void 0)
      .finally(() => setLoading(false));
  }, []);

  const handleConnectComplete = async () => {
    try {
      const r = await SocialAccountsApi.list();
      setAccounts(r?.data ?? []);
    } catch {
      void 0;
    }
    analytics.track('onboarding_step_completed', { step: 'connect' });
    setStep('automate');
  };

  const handleAutomateComplete = () => {
    analytics.track('onboarding_step_completed', { step: 'automate' });
    setStep('launch');
  };

  const handleFinish = async () => {
    analytics.track('onboarding_wizard_completed', {});
    try {
      const r = await completeOnboarding();
      if (r?.data) updateUser(r.data);
      localStorage.setItem('onboarding_complete', 'true');
    } catch {
      localStorage.setItem('onboarding_complete', 'true');
    }
    router.push('/dashboard');
    router.refresh();
  };

  // Don't render anything while we know the user has completed onboarding —
  // the useEffect redirect will fire, but returning null prevents any content flash.
  if (user?.onboarding_completed_at) {
    return null;
  }

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center p-6'>
        <div className='w-full max-w-xl space-y-4'>
          <Skeleton className='h-12 w-full' />
          <Skeleton className='h-64 w-full' />
        </div>
      </div>
    );
  }

  const primaryAccount = accounts[0];

  const stepTitles: Record<StepId, { title: string; sub: string }> = {
    connect: {
      title: 'Connect your Instagram',
      sub: 'Link your account to start automating',
    },
    automate: {
      title: 'Set up your first automation',
      sub: 'Takes 30 seconds · 100% free · no AI credits needed',
    },
    launch: { title: "You're all set!", sub: '' },
  };

  const { title, sub } = stepTitles[step];

  return (
    <div className='min-h-screen bg-background flex flex-col items-center justify-start p-4 sm:p-8 pt-10'>
      <div className='w-full max-w-2xl'>
        {/* Step indicator */}
        <StepIndicator current={step} />

        {/* Card */}
        <div className='rounded-2xl border border-border bg-card shadow-sm overflow-hidden'>
          {/* Header */}
          {step !== 'launch' && (
            <div className='border-b border-border bg-muted/20 px-6 sm:px-8 py-5'>
              <h1 className='text-lg font-bold text-foreground'>{title}</h1>
              {sub && (
                <p className='text-sm text-muted-foreground mt-0.5'>{sub}</p>
              )}
            </div>
          )}

          {/* Body */}
          <div className='p-6 sm:p-8'>
            {step === 'connect' && (
              <OnboardingConnectStep onComplete={handleConnectComplete} />
            )}

            {step === 'automate' && primaryAccount && (
              <AutomateStep
                socialAccount={primaryAccount}
                onComplete={handleAutomateComplete}
                onBack={() => setStep('connect')}
              />
            )}

            {step === 'launch' && (
              <LaunchStep
                onFinish={handleFinish}
                accountUsername={primaryAccount?.username}
              />
            )}
          </div>
        </div>

        {/* Skip link */}
        {step !== 'launch' && (
          <div className='text-center mt-5'>
            <button
              className='text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline transition-colors'
              onClick={handleFinish}
            >
              Skip setup — go straight to dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
