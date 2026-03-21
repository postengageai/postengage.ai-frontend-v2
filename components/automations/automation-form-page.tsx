'use client';

import Image from 'next/image';
import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronRight,
  ImageIcon,
  Loader2,
  MessageCircle,
  Mail,
  MessageSquare,
  Send,
  Plus,
  Trash2,
  Tag,
  X,
  Sparkles,
  Info,
  Bot as BotIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  SocialAccountsApi,
  type SocialAccount,
} from '@/lib/api/social-accounts';
import { IntelligenceApi } from '@/lib/api/intelligence';
import type { Bot } from '@/lib/types/intelligence';
import { MediaSelectorModal } from './media-selector-modal';
import type { Media } from '@/lib/api/media';
import { parseApiError } from '@/lib/http/errors';
import {
  AutomationPlatform,
  AutomationTriggerType,
  AutomationTriggerSource,
  AutomationTriggerScope,
  AutomationActionType,
  AutomationConditionType,
  AutomationConditionOperator,
  AutomationConditionKeywordMode,
  AutomationConditionSource,
  AutomationStatus,
  type AutomationTriggerTypeType,
  type AutomationTriggerScopeType,
  type AutomationActionTypeType,
  type AutomationConditionKeywordModeType,
} from '@/lib/constants/automations';
import type {
  CreateAutomationRequest,
  AutomationActionPayload,
  SendDmPayload,
  ReplyCommentPayload,
  PrivateReplyPayload,
} from '@/lib/api/automations';
import type { AutomationFormData } from './automation-wizard';

// ─── Re-export the apiToFormData helper so edit page can use it ────────────
export type { AutomationFormData };

// ─────────────────────────────────────────────────────────────────────────────
//  Inline action editors (replaces the big InstagramCommentAction/DmAction)
// ─────────────────────────────────────────────────────────────────────────────

function CommentActionEditor({
  actionType,
  payload,
  onUpdate,
  bots,
  botId,
  onBotChange,
}: {
  actionType: AutomationActionTypeType;
  payload: ReplyCommentPayload | PrivateReplyPayload;
  onUpdate: (p: ReplyCommentPayload | PrivateReplyPayload) => void;
  bots: Bot[];
  botId?: string;
  onBotChange: (id: string | undefined) => void;
}) {
  const uid = `ai-${actionType}`;
  return (
    <div className='space-y-4'>
      {/* AI toggle row */}
      <div className='flex items-center justify-between rounded-lg border border-border bg-card/60 px-4 py-3'>
        <div className='flex items-center gap-2.5'>
          <Sparkles className='h-4 w-4 text-primary' />
          <div>
            <p className='text-sm font-medium'>Auto-generate with AI</p>
            <p className='text-xs text-muted-foreground'>
              Let your bot craft the perfect reply
            </p>
          </div>
        </div>
        <Switch
          id={uid}
          checked={!!payload.use_ai_reply}
          onCheckedChange={checked =>
            onUpdate({ ...payload, use_ai_reply: checked })
          }
        />
      </div>

      {/* Bot selector */}
      {payload.use_ai_reply && bots.length > 0 && (
        <div className='space-y-1.5'>
          <Label className='text-xs text-muted-foreground'>AI Bot</Label>
          <Select
            value={botId ?? ''}
            onValueChange={v => onBotChange(v || undefined)}
          >
            <SelectTrigger className='h-9'>
              <SelectValue placeholder='Select a bot…' />
            </SelectTrigger>
            <SelectContent>
              {bots.map(b => (
                <SelectItem key={b._id} value={b._id}>
                  <span className='flex items-center gap-2'>
                    <BotIcon className='h-3.5 w-3.5 text-muted-foreground' />
                    {b.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Message textarea */}
      <div className='space-y-1.5'>
        <Label className='text-xs text-muted-foreground'>
          {payload.use_ai_reply ? 'Fallback message (if AI fails)' : 'Message'}
        </Label>
        <Textarea
          placeholder={
            payload.use_ai_reply
              ? 'Fallback text in case AI cannot respond…'
              : actionType === AutomationActionType.REPLY_COMMENT
                ? 'Enter the comment reply…'
                : 'Enter the private DM message…'
          }
          value={payload.text || ''}
          onChange={e => onUpdate({ ...payload, text: e.target.value })}
          rows={4}
          className='resize-none text-sm'
        />
      </div>
    </div>
  );
}

function DmActionEditor({
  payload,
  onUpdate,
  bots,
  botId,
  onBotChange,
  socialAccountId,
}: {
  payload: SendDmPayload;
  onUpdate: (p: SendDmPayload) => void;
  bots: Bot[];
  botId?: string;
  onBotChange: (id: string | undefined) => void;
  socialAccountId?: string;
}) {
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const isText = payload.message?.type === 'text' || !payload.message;
  const mediaUrl =
    (payload.message as { payload?: { url?: string } })?.payload?.url ?? '';
  const uid = 'ai-dm';
  return (
    <div className='space-y-4'>
      {/* AI toggle */}
      <div className='flex items-center justify-between rounded-lg border border-border bg-card/60 px-4 py-3'>
        <div className='flex items-center gap-2.5'>
          <Sparkles className='h-4 w-4 text-primary' />
          <div>
            <p className='text-sm font-medium'>Auto-generate with AI</p>
            <p className='text-xs text-muted-foreground'>
              Let your bot craft the perfect reply
            </p>
          </div>
        </div>
        <Switch
          id={uid}
          checked={!!payload.use_ai_reply}
          onCheckedChange={checked => {
            if (checked) {
              onUpdate({
                ...payload,
                use_ai_reply: true,
                message: {
                  type: 'text',
                  text: (payload.message as { text?: string })?.text ?? '',
                },
              } as SendDmPayload);
            } else {
              onUpdate({ ...payload, use_ai_reply: false });
            }
          }}
        />
      </div>

      {/* Bot selector */}
      {payload.use_ai_reply && bots.length > 0 && (
        <div className='space-y-1.5'>
          <Label className='text-xs text-muted-foreground'>AI Bot</Label>
          <Select
            value={botId ?? ''}
            onValueChange={v => onBotChange(v || undefined)}
          >
            <SelectTrigger className='h-9'>
              <SelectValue placeholder='Select a bot…' />
            </SelectTrigger>
            <SelectContent>
              {bots.map(b => (
                <SelectItem key={b._id} value={b._id}>
                  <span className='flex items-center gap-2'>
                    <BotIcon className='h-3.5 w-3.5 text-muted-foreground' />
                    {b.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Message content — text or media */}
      {!payload.use_ai_reply && (
        <div className='space-y-3'>
          {/* Type tabs */}
          <div className='flex gap-2'>
            {(['text', 'media'] as const).map(t => (
              <button
                key={t}
                onClick={() => {
                  if (t === 'text') {
                    onUpdate({
                      ...payload,
                      message: { type: 'text', text: '' },
                    } as SendDmPayload);
                  } else {
                    onUpdate({
                      ...payload,
                      use_ai_reply: false,
                      message: {
                        type: 'image',
                        payload: { url: '', is_reusable: true },
                      },
                    } as SendDmPayload);
                  }
                }}
                className={cn(
                  'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                  (t === 'text' ? isText : !isText)
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {t === 'text' ? 'Text message' : 'Media message'}
              </button>
            ))}
          </div>

          {isText ? (
            <Textarea
              placeholder='Enter DM reply…'
              value={(payload.message as { text?: string })?.text || ''}
              onChange={e =>
                onUpdate({
                  ...payload,
                  message: { type: 'text', text: e.target.value },
                } as SendDmPayload)
              }
              rows={4}
              className='resize-none text-sm'
            />
          ) : (
            <div className='space-y-2'>
              {mediaUrl ? (
                <div className='relative w-full overflow-hidden rounded-lg border border-border'>
                  {/* Preview */}
                  <div className='flex items-center gap-3 p-3'>
                    <div className='relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted'>
                      {mediaUrl.match(/\.(mp4|mov|webm)$/i) ? (
                        <div className='flex h-full w-full items-center justify-center text-2xl'>
                          🎬
                        </div>
                      ) : (
                        <Image
                          src={mediaUrl}
                          alt='Selected media'
                          fill
                          className='object-cover'
                          unoptimized
                        />
                      )}
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='truncate text-xs text-muted-foreground'>
                        {mediaUrl}
                      </p>
                    </div>
                    <button
                      type='button'
                      onClick={() =>
                        onUpdate({
                          ...payload,
                          message: {
                            type: 'image',
                            payload: { url: '', is_reusable: true },
                          },
                        } as SendDmPayload)
                      }
                      className='shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground'
                    >
                      <X className='h-4 w-4' />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type='button'
                  onClick={() => setMediaPickerOpen(true)}
                  className='flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/30 py-6 text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted/50'
                >
                  <ImageIcon className='h-8 w-8 opacity-40' />
                  <span className='text-xs font-medium'>
                    Click to select from your Instagram media
                  </span>
                </button>
              )}

              <Button
                type='button'
                variant='outline'
                size='sm'
                className='w-full gap-2 text-xs'
                onClick={() => setMediaPickerOpen(true)}
              >
                <ImageIcon className='h-3.5 w-3.5' />
                {mediaUrl ? 'Change media' : 'Browse library'}
              </Button>

              {/* Media picker modal */}
              {mediaPickerOpen && socialAccountId && (
                <MediaSelectorModal
                  open={mediaPickerOpen}
                  onOpenChange={setMediaPickerOpen}
                  selectedIds={mediaUrl ? [] : []}
                  onSelect={selected => {
                    const picked = selected[0];
                    if (picked) {
                      onUpdate({
                        ...payload,
                        message: {
                          type: picked.mime_type.startsWith('video')
                            ? 'video'
                            : 'image',
                          payload: { url: picked.url, is_reusable: true },
                        },
                      } as SendDmPayload);
                    }
                    setMediaPickerOpen(false);
                  }}
                  socialAccountId={socialAccountId}
                />
              )}

              {!socialAccountId && (
                <p className='text-center text-xs text-muted-foreground'>
                  Connect an Instagram account to browse media.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Fallback when AI enabled */}
      {payload.use_ai_reply && (
        <div className='space-y-1.5'>
          <Label className='text-xs text-muted-foreground'>
            Fallback message (if AI fails)
          </Label>
          <Textarea
            placeholder='Enter a fallback message…'
            value={(payload.message as { text?: string })?.text || ''}
            onChange={e =>
              onUpdate({
                ...payload,
                message: { type: 'text', text: e.target.value },
              } as SendDmPayload)
            }
            rows={3}
            className='resize-none text-sm'
          />
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Section wrapper
// ─────────────────────────────────────────────────────────────────────────────

function Section({
  number,
  title,
  subtitle,
  isComplete,
  children,
}: {
  number: number;
  title: string;
  subtitle: string;
  isComplete?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className='relative flex gap-5'>
      {/* Left spine */}
      <div className='flex flex-col items-center pt-0.5'>
        <div
          className={cn(
            'flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors',
            isComplete
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground'
          )}
        >
          {isComplete ? <Check className='h-3.5 w-3.5' /> : number}
        </div>
        {/* connector line */}
        <div className='mt-2 w-px flex-1 bg-border/60' />
      </div>

      {/* Content */}
      <div className='min-w-0 flex-1 pb-10'>
        <div className='mb-4'>
          <h2 className='text-base font-semibold text-foreground'>{title}</h2>
          <p className='mt-0.5 text-sm text-muted-foreground'>{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Keyword mode options
// ─────────────────────────────────────────────────────────────────────────────
const MATCH_MODES = [
  {
    value: AutomationConditionKeywordMode.ANY,
    label: 'Match any keyword',
    description: 'Fires if at least one keyword is present',
  },
  {
    value: AutomationConditionKeywordMode.ALL,
    label: 'Match all keywords',
    description: 'Every keyword must be present',
  },
  {
    value: AutomationConditionKeywordMode.EXACT,
    label: 'Exact match',
    description: 'Message must match exactly',
  },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
//  Main Component
// ─────────────────────────────────────────────────────────────────────────────

interface AutomationFormPageProps {
  initialData?: AutomationFormData;
  onComplete: (payload: CreateAutomationRequest) => Promise<void>;
  onCancel: () => void;
  isEditMode?: boolean;
}

export function AutomationFormPage({
  initialData,
  onComplete,
  onCancel,
  isEditMode = false,
}: AutomationFormPageProps) {
  const { toast } = useToast();
  const nameRef = useRef<HTMLInputElement>(null);

  // ── Core form state ──────────────────────────────────────────────────────
  const [formData, setFormData] = useState<AutomationFormData>(
    initialData ?? {
      platform: AutomationPlatform.INSTAGRAM,
      social_account_id: '',
      actions: [],
    }
  );
  const [isSaving, setIsSaving] = useState(false);

  // ── Remote data ──────────────────────────────────────────────────────────
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [bots, setBots] = useState<Bot[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<Media[]>(
    initialData?.selected_media ?? []
  );
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

  // ── UI state ─────────────────────────────────────────────────────────────
  const [keywordsEnabled, setKeywordsEnabled] = useState(
    !!(
      initialData?.condition &&
      (initialData.condition.condition_value?.length ?? 0) > 0
    )
  );
  const [keywordInput, setKeywordInput] = useState('');
  const [detailsOpen, setDetailsOpen] = useState(
    !!(initialData?.description || (initialData?.labels ?? []).length > 0)
  );
  const [labelInput, setLabelInput] = useState('');

  // Sync if initialData changes (edit mode load)
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setSelectedMedia(initialData.selected_media ?? []);
      setKeywordsEnabled(
        !!(
          initialData.condition &&
          (initialData.condition.condition_value?.length ?? 0) > 0
        )
      );
      setDetailsOpen(
        !!(initialData.description || (initialData.labels ?? []).length > 0)
      );
    }
  }, [initialData]);

  // Fetch connected accounts
  useEffect(() => {
    SocialAccountsApi.list({ status: 'connected' })
      .then(r => setAccounts(r.data ?? []))
      .catch(() => void 0)
      .finally(() => setAccountsLoading(false));
  }, []);

  // Fetch bots when account changes
  useEffect(() => {
    if (!formData.social_account_id) {
      setBots([]);
      return;
    }
    IntelligenceApi.getBots({ social_account_id: formData.social_account_id })
      .then(r => setBots(r.data ?? []))
      .catch(() => void 0);
  }, [formData.social_account_id]);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const update = (patch: Partial<AutomationFormData>) =>
    setFormData(prev => ({ ...prev, ...patch }));

  const selectAccount = (account: SocialAccount) => {
    setFormData({
      platform:
        account.platform === 'facebook'
          ? AutomationPlatform.FACEBOOK
          : AutomationPlatform.INSTAGRAM,
      social_account_id: account.id,
      social_account_name: account.username,
      actions: [],
    });
  };

  const selectTrigger = (type: AutomationTriggerTypeType) => {
    const source =
      type === AutomationTriggerType.DM_RECEIVED
        ? AutomationTriggerSource.DIRECT_MESSAGE
        : AutomationTriggerSource.POST;
    update({
      trigger_type: type,
      trigger_source: source,
      trigger_scope:
        type === AutomationTriggerType.NEW_COMMENT
          ? AutomationTriggerScope.ALL
          : undefined,
      content_ids: [],
      selected_media: [],
      condition: null,
      actions: [],
    });
    setSelectedMedia([]);
    setKeywordsEnabled(false);
  };

  // Keywords
  const keywords = formData.condition?.condition_value ?? [];
  const keywordMode =
    formData.condition?.condition_keyword_mode ??
    AutomationConditionKeywordMode.ANY;

  const addKeyword = (raw: string) => {
    const k = raw.trim().toLowerCase();
    if (!k || keywords.includes(k)) return;
    const next = [...keywords, k];
    update({
      condition: {
        condition_type: AutomationConditionType.KEYWORD,
        condition_operator: AutomationConditionOperator.CONTAINS,
        condition_keyword_mode: keywordMode,
        condition_source:
          formData.trigger_type === AutomationTriggerType.NEW_COMMENT
            ? AutomationConditionSource.COMMENT_TEXT
            : AutomationConditionSource.DM_TEXT,
        condition_value: next,
        status: 'active',
      },
    });
    setKeywordInput('');
  };

  const removeKeyword = (k: string) => {
    const next = keywords.filter(x => x !== k);
    update({
      condition:
        next.length === 0
          ? null
          : {
              ...formData.condition!,
              condition_value: next,
            },
    });
    if (next.length === 0) setKeywordsEnabled(false);
  };

  const setKeywordMatchMode = (mode: AutomationConditionKeywordModeType) => {
    if (!formData.condition) return;
    update({
      condition: { ...formData.condition, condition_keyword_mode: mode },
    });
  };

  const handleKeywordKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addKeyword(keywordInput);
    } else if (e.key === 'Backspace' && !keywordInput && keywords.length > 0) {
      removeKeyword(keywords[keywords.length - 1]);
    }
  };

  // Actions
  const getAvailableActionTypes = () =>
    formData.trigger_type === AutomationTriggerType.NEW_COMMENT
      ? [
          {
            type: AutomationActionType.REPLY_COMMENT,
            label: 'Reply to comment',
            icon: MessageSquare,
            description: 'Post a public reply on the comment',
          },
          {
            type: AutomationActionType.PRIVATE_REPLY,
            label: 'Send private DM',
            icon: Mail,
            description: 'Send a private message to the commenter',
          },
        ]
      : [
          {
            type: AutomationActionType.SEND_DM,
            label: 'Send DM reply',
            icon: Send,
            description: 'Reply to the direct message',
          },
        ];

  const addAction = (type: AutomationActionTypeType) => {
    const payload: AutomationActionPayload =
      type === AutomationActionType.SEND_DM
        ? ({ message: { type: 'text', text: '' } } as SendDmPayload)
        : ({ text: '' } as ReplyCommentPayload | PrivateReplyPayload);

    update({
      actions: [
        ...formData.actions,
        {
          action_type: type,
          execution_order: formData.actions.length + 1,
          delay_seconds: formData.actions.length === 0 ? 2 : 5,
          status: 'active',
          action_payload: payload,
          bot_id: undefined,
          bot_name: undefined,
        },
      ],
    });
  };

  const removeAction = (idx: number) =>
    update({
      actions: formData.actions
        .filter((_, i) => i !== idx)
        .map((a, i) => ({ ...a, execution_order: i + 1 })),
    });

  const updateAction = (
    idx: number,
    patch: Partial<(typeof formData.actions)[number]>
  ) =>
    update({
      actions: formData.actions.map((a, i) =>
        i === idx ? { ...a, ...patch } : a
      ),
    });

  // Media (specific posts)
  const handleMediaSelect = (media: Media[]) => {
    setSelectedMedia(media);
    update({ content_ids: media.map(m => m.id), selected_media: media });
  };

  const removePost = (id: string) => {
    const next = selectedMedia.filter(m => m.id !== id);
    setSelectedMedia(next);
    const nextIds = next.map(m => m.id);
    update({
      content_ids: nextIds,
      selected_media: next,
      ...(nextIds.length === 0
        ? { trigger_scope: AutomationTriggerScope.ALL }
        : {}),
    });
  };

  // Labels
  const labels = formData.labels ?? [];
  const addLabel = () => {
    const t = labelInput.trim().toLowerCase();
    if (!t || labels.includes(t)) {
      setLabelInput('');
      return;
    }
    update({ labels: [...labels, t] });
    setLabelInput('');
  };

  const removeLabel = (l: string) =>
    update({ labels: labels.filter(x => x !== l) });

  // ── Completion state ─────────────────────────────────────────────────────
  const sec1Done = !!formData.social_account_id;
  const sec2Done = !!formData.trigger_type;
  const sec3Done = !keywordsEnabled || keywords.length > 0;
  const sec4Done = formData.actions.length > 0;
  const canSubmit =
    sec1Done && sec2Done && sec3Done && sec4Done && !!formData.name?.trim();

  // ── Submit ───────────────────────────────────────────────────────────────
  const submit = async (asDraft: boolean) => {
    if (
      !formData.platform ||
      !formData.social_account_id ||
      !formData.trigger_type
    )
      return;
    setIsSaving(true);
    try {
      const payload: CreateAutomationRequest = {
        name: formData.name?.trim() || 'New Automation',
        description: formData.description,
        social_account_id: formData.social_account_id,
        platform: formData.platform,
        status: asDraft ? AutomationStatus.DRAFT : AutomationStatus.ACTIVE,
        trigger: {
          trigger_type: formData.trigger_type,
          trigger_source:
            formData.trigger_source ??
            (formData.trigger_type === AutomationTriggerType.DM_RECEIVED
              ? AutomationTriggerSource.DIRECT_MESSAGE
              : AutomationTriggerSource.POST),
          ...(formData.trigger_type === AutomationTriggerType.NEW_COMMENT
            ? {
                trigger_scope:
                  formData.trigger_scope ?? AutomationTriggerScope.ALL,
                content_ids: formData.content_ids,
                trigger_config: { include_reply_to_comments: true },
              }
            : {}),
        },
        conditions: formData.condition
          ? [
              {
                condition_type: formData.condition.condition_type,
                condition_operator: formData.condition.condition_operator,
                condition_keyword_mode:
                  formData.condition.condition_keyword_mode,
                condition_source: formData.condition.condition_source,
                condition_value: formData.condition.condition_value,
                status: AutomationStatus.ACTIVE,
              },
            ]
          : [],
        actions: formData.actions.map(a => ({
          action_type: a.action_type,
          execution_order: a.execution_order,
          delay_seconds: a.delay_seconds,
          status: a.status as 'active' | 'inactive',
          action_payload: a.action_payload,
          ...(a.bot_id ? { bot_id: a.bot_id } : {}),
        })),
      };
      await onComplete(payload);
    } catch (err) {
      const e = parseApiError(err);
      toast({ title: e.title, description: e.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  //  Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className='flex h-full flex-col bg-background'>
      {/* ── Sticky top bar ── */}
      <header className='sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur sm:px-6'>
        <button
          onClick={onCancel}
          className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
        >
          <ArrowLeft className='h-4 w-4' />
        </button>

        {/* Inline name */}
        <input
          ref={nameRef}
          value={formData.name ?? ''}
          onChange={e => update({ name: e.target.value })}
          placeholder='Automation name…'
          className='min-w-0 flex-1 bg-transparent text-sm font-semibold text-foreground outline-none placeholder:text-muted-foreground/60 sm:text-base'
          spellCheck={false}
        />

        {/* Status pill */}
        {isEditMode && (
          <Badge
            variant='outline'
            className={cn(
              'hidden shrink-0 text-xs sm:flex',
              formData.status === AutomationStatus.ACTIVE
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500'
                : 'border-amber-500/30 bg-amber-500/10 text-amber-500'
            )}
          >
            {formData.status ?? 'draft'}
          </Badge>
        )}

        <div className='flex flex-shrink-0 items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            disabled={isSaving}
            onClick={() => void submit(true)}
            className='hidden sm:flex'
          >
            Save draft
          </Button>
          <Button
            size='sm'
            disabled={isSaving || !canSubmit}
            onClick={() => void submit(false)}
            className='gap-1.5'
          >
            {isSaving && <Loader2 className='h-3.5 w-3.5 animate-spin' />}
            {isEditMode ? 'Save changes' : 'Activate'}
          </Button>
        </div>
      </header>

      {/* ── Scrollable body ── */}
      <div className='flex-1 overflow-y-auto'>
        <div className='mx-auto max-w-2xl px-4 py-8 sm:px-6'>
          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              SECTION 1 — Connected Account
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <Section
            number={1}
            title='Connected account'
            subtitle='Choose the social account this automation runs on'
            isComplete={sec1Done}
          >
            {accountsLoading ? (
              <div className='flex h-20 items-center justify-center'>
                <Loader2 className='h-5 w-5 animate-spin text-muted-foreground' />
              </div>
            ) : accounts.length === 0 ? (
              <div className='rounded-xl border-2 border-dashed border-border p-6 text-center'>
                <p className='mb-3 text-sm text-muted-foreground'>
                  No connected accounts found
                </p>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={() =>
                    (window.location.href =
                      '/dashboard/settings/social-accounts')
                  }
                >
                  Connect an account
                </Button>
              </div>
            ) : (
              <div className='space-y-2'>
                {accounts.map(account => {
                  const selected = formData.social_account_id === account.id;
                  return (
                    <button
                      key={account.id}
                      onClick={() => selectAccount(account)}
                      className={cn(
                        'group flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all',
                        selected
                          ? 'border-primary bg-primary/5'
                          : 'border-border bg-card hover:border-primary/40'
                      )}
                    >
                      <Avatar className='h-10 w-10 border border-border'>
                        <AvatarImage
                          src={account.avatar?.url}
                          alt={account.username}
                        />
                        <AvatarFallback>
                          {account.username?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className='min-w-0 flex-1'>
                        <p className='truncate text-sm font-semibold text-foreground'>
                          @{account.username}
                        </p>
                        <p className='text-xs capitalize text-muted-foreground'>
                          {account.platform}
                        </p>
                      </div>
                      <div
                        className={cn(
                          'flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors',
                          selected
                            ? 'border-primary bg-primary'
                            : 'border-border'
                        )}
                      >
                        {selected && <Check className='h-3 w-3 text-white' />}
                      </div>
                    </button>
                  );
                })}
                <button
                  onClick={() =>
                    (window.location.href =
                      '/dashboard/settings/social-accounts')
                  }
                  className='flex w-full items-center gap-2 rounded-xl border-2 border-dashed border-border px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground'
                >
                  <Plus className='h-4 w-4' />
                  Add another account
                </button>
              </div>
            )}
          </Section>

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              SECTION 2 — Trigger
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <Section
            number={2}
            title='When should this run?'
            subtitle='Pick the event that fires this automation'
            isComplete={sec2Done}
          >
            <div className='space-y-3'>
              {/* Trigger cards */}
              <div className='grid grid-cols-2 gap-3'>
                {[
                  {
                    type: AutomationTriggerType.NEW_COMMENT as AutomationTriggerTypeType,
                    label: 'New Comment',
                    description: 'Someone comments on your posts or reels',
                    icon: MessageCircle,
                    badge: 'Popular',
                  },
                  {
                    type: AutomationTriggerType.DM_RECEIVED as AutomationTriggerTypeType,
                    label: 'Direct Message',
                    description: 'Someone sends you a DM',
                    icon: Mail,
                    badge: null,
                  },
                ].map(({ type, label, description, icon: Icon, badge }) => {
                  const active = formData.trigger_type === type;
                  return (
                    <button
                      key={type}
                      onClick={() => sec1Done && selectTrigger(type)}
                      disabled={!sec1Done}
                      className={cn(
                        'relative flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-all',
                        active
                          ? 'border-primary bg-primary/5'
                          : sec1Done
                            ? 'border-border bg-card hover:border-primary/40'
                            : 'cursor-not-allowed border-border bg-card opacity-40'
                      )}
                    >
                      {badge && (
                        <span className='absolute right-3 top-3 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary'>
                          {badge}
                        </span>
                      )}
                      <div
                        className={cn(
                          'flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
                          active
                            ? 'bg-primary/15 text-primary'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        <Icon className='h-4.5 w-4.5 h-5 w-5' />
                      </div>
                      <div>
                        <p className='text-sm font-semibold text-foreground'>
                          {label}
                        </p>
                        <p className='mt-0.5 text-xs leading-snug text-muted-foreground'>
                          {description}
                        </p>
                      </div>
                      {active && (
                        <div className='absolute bottom-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary'>
                          <Check className='h-3 w-3 text-white' />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Scope — only for new_comment */}
              {formData.trigger_type === AutomationTriggerType.NEW_COMMENT && (
                <div className='rounded-xl border border-border bg-card/50 p-4'>
                  <p className='mb-3 text-sm font-medium text-foreground'>
                    Which posts?
                  </p>
                  <div className='flex gap-3'>
                    {[
                      {
                        value: AutomationTriggerScope.ALL,
                        label: 'All posts & reels',
                      },
                      {
                        value: AutomationTriggerScope.SPECIFIC,
                        label: 'Specific posts',
                      },
                    ].map(({ value, label }) => {
                      const active =
                        (formData.trigger_scope ??
                          AutomationTriggerScope.ALL) === value;
                      return (
                        <button
                          key={value}
                          onClick={() => {
                            update({
                              trigger_scope:
                                value as AutomationTriggerScopeType,
                            });
                            if (value === AutomationTriggerScope.ALL) {
                              setSelectedMedia([]);
                              update({
                                content_ids: [],
                                selected_media: [],
                                trigger_scope: AutomationTriggerScope.ALL,
                              });
                            }
                          }}
                          className={cn(
                            'flex flex-1 items-center justify-center rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors',
                            active
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'
                          )}
                        >
                          {active && <Check className='mr-1.5 h-3.5 w-3.5' />}
                          {label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Specific posts grid */}
                  {formData.trigger_scope ===
                    AutomationTriggerScope.SPECIFIC && (
                    <div className='mt-3'>
                      <div className='flex flex-wrap gap-2'>
                        {selectedMedia.map(m => (
                          <div
                            key={m.id}
                            className='group relative h-16 w-16 overflow-hidden rounded-lg border border-border'
                          >
                            <Image
                              src={m.thumbnail_url || m.url}
                              alt='post'
                              width={64}
                              height={64}
                              className='h-full w-full object-cover'
                              unoptimized
                            />
                            <button
                              onClick={() => removePost(m.id)}
                              className='absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100'
                            >
                              <X className='h-4 w-4 text-white' />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => setIsMediaModalOpen(true)}
                          className='flex h-16 w-16 items-center justify-center rounded-lg border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary'
                        >
                          <Plus className='h-5 w-5' />
                        </button>
                      </div>
                      {selectedMedia.length === 0 && (
                        <p className='mt-2 text-xs text-amber-500'>
                          Select at least one post to target
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </Section>

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              SECTION 3 — Keyword Filter (optional)
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <Section
            number={3}
            title='Filter messages'
            subtitle='Optionally restrict this automation to messages containing certain keywords'
            isComplete={sec3Done}
          >
            {/* Skip / Enable toggle */}
            <div className='mb-4 flex gap-2'>
              {[
                {
                  value: false,
                  label: 'All messages',
                  description: 'Respond to everything',
                },
                {
                  value: true,
                  label: 'Keyword match',
                  description: 'Only matching words',
                },
              ].map(({ value, label, description }) => {
                const active = keywordsEnabled === value;
                return (
                  <button
                    key={String(value)}
                    onClick={() => {
                      setKeywordsEnabled(value);
                      if (!value) update({ condition: null });
                    }}
                    disabled={!sec2Done}
                    className={cn(
                      'flex flex-1 flex-col items-start rounded-xl border px-4 py-3 text-left transition-all',
                      active
                        ? 'border-primary bg-primary/5'
                        : sec2Done
                          ? 'border-border bg-card hover:border-primary/30'
                          : 'cursor-not-allowed border-border opacity-40'
                    )}
                  >
                    <p className='text-sm font-medium text-foreground'>
                      {label}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      {description}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Keyword inputs */}
            {keywordsEnabled && (
              <div className='space-y-4'>
                {/* keyword chip input */}
                <div
                  onClick={() => document.getElementById('kw-input')?.focus()}
                  className='flex min-h-[44px] cursor-text flex-wrap items-center gap-1.5 rounded-lg border border-input bg-background px-3 py-2 ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2'
                >
                  {keywords.map(k => (
                    <Badge
                      key={k}
                      variant='secondary'
                      className='gap-1 bg-primary/10 text-primary'
                    >
                      {k}
                      <button
                        type='button'
                        onClick={() => removeKeyword(k)}
                        className='ml-0.5 rounded hover:bg-primary/20'
                      >
                        <X className='h-3 w-3' />
                      </button>
                    </Badge>
                  ))}
                  <input
                    id='kw-input'
                    value={keywordInput}
                    onChange={e => setKeywordInput(e.target.value)}
                    onKeyDown={handleKeywordKeyDown}
                    onBlur={() =>
                      keywordInput.trim() && addKeyword(keywordInput)
                    }
                    placeholder={
                      keywords.length === 0
                        ? 'Type keyword and press Enter…'
                        : ''
                    }
                    className='min-w-[140px] flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground'
                  />
                </div>

                {/* Match mode */}
                <div className='space-y-1.5'>
                  <Label className='text-xs text-muted-foreground'>
                    Match mode
                  </Label>
                  <div className='grid grid-cols-3 gap-2'>
                    {MATCH_MODES.map(({ value, label, description }) => {
                      const active = keywordMode === value;
                      return (
                        <button
                          key={value}
                          onClick={() => setKeywordMatchMode(value)}
                          className={cn(
                            'rounded-lg border px-3 py-2.5 text-left text-xs transition-colors',
                            active
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border text-muted-foreground hover:border-primary/30'
                          )}
                        >
                          <p className='font-medium'>{label}</p>
                          <p className='mt-0.5 leading-tight opacity-70'>
                            {description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </Section>

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              SECTION 4 — Actions
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <Section
            number={4}
            title='What should happen?'
            subtitle='Define up to 2 actions that fire when the trigger matches'
            isComplete={sec4Done}
          >
            {!sec2Done ? (
              <div className='flex items-center gap-2 rounded-lg border border-border/50 bg-muted/30 px-4 py-3 text-sm text-muted-foreground'>
                <Info className='h-4 w-4 shrink-0' />
                Choose a trigger above to see available actions
              </div>
            ) : (
              <div className='space-y-3'>
                {formData.actions.map((action, idx) => {
                  const actionMeta = getAvailableActionTypes().find(
                    a => a.type === action.action_type
                  );
                  const ActionIcon = actionMeta?.icon ?? MessageSquare;
                  return (
                    <div
                      key={idx}
                      className='overflow-hidden rounded-xl border border-border bg-card'
                    >
                      {/* Action header */}
                      <div className='flex items-center gap-3 border-b border-border/60 bg-muted/30 px-4 py-3'>
                        <div className='flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary'>
                          {idx + 1}
                        </div>
                        <div className='flex min-w-0 flex-1 items-center gap-2'>
                          <ActionIcon className='h-4 w-4 shrink-0 text-muted-foreground' />
                          <span className='text-sm font-medium text-foreground'>
                            {actionMeta?.label ?? action.action_type}
                          </span>
                        </div>

                        {/* delay */}
                        <div className='hidden items-center gap-1.5 sm:flex'>
                          <span className='text-xs text-muted-foreground'>
                            Delay
                          </span>
                          <Select
                            value={String(action.delay_seconds)}
                            onValueChange={v =>
                              updateAction(idx, { delay_seconds: Number(v) })
                            }
                          >
                            <SelectTrigger className='h-7 w-24 text-xs'>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[0, 2, 5, 10, 30, 60].map(s => (
                                <SelectItem
                                  key={s}
                                  value={String(s)}
                                  className='text-xs'
                                >
                                  {s === 0 ? 'instant' : `${s}s`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <button
                          onClick={() => removeAction(idx)}
                          className='flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive'
                        >
                          <Trash2 className='h-3.5 w-3.5' />
                        </button>
                      </div>

                      {/* Action body */}
                      <div className='p-4'>
                        {action.action_type === AutomationActionType.SEND_DM ? (
                          <DmActionEditor
                            payload={action.action_payload as SendDmPayload}
                            onUpdate={p =>
                              updateAction(idx, { action_payload: p })
                            }
                            bots={bots}
                            botId={action.bot_id}
                            onBotChange={id =>
                              updateAction(idx, { bot_id: id })
                            }
                            socialAccountId={formData.social_account_id}
                          />
                        ) : (
                          <CommentActionEditor
                            actionType={action.action_type}
                            payload={
                              action.action_payload as
                                | ReplyCommentPayload
                                | PrivateReplyPayload
                            }
                            onUpdate={p =>
                              updateAction(idx, { action_payload: p })
                            }
                            bots={bots}
                            botId={action.bot_id}
                            onBotChange={id =>
                              updateAction(idx, { bot_id: id })
                            }
                          />
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Add action */}
                {formData.actions.length < 2 && (
                  <div className='space-y-2'>
                    {getAvailableActionTypes()
                      .filter(
                        a =>
                          !formData.actions.find(x => x.action_type === a.type)
                      )
                      .map(({ type, label, icon: Icon, description }) => (
                        <button
                          key={type}
                          onClick={() => addAction(type)}
                          className='flex w-full items-center gap-3 rounded-xl border-2 border-dashed border-border px-4 py-3 text-left transition-colors hover:border-primary/40 hover:bg-primary/5'
                        >
                          <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-muted'>
                            <Icon className='h-4 w-4 text-muted-foreground' />
                          </div>
                          <div className='min-w-0 flex-1'>
                            <p className='text-sm font-medium text-foreground'>
                              {label}
                            </p>
                            <p className='text-xs text-muted-foreground'>
                              {description}
                            </p>
                          </div>
                          <Plus className='h-4 w-4 shrink-0 text-muted-foreground' />
                        </button>
                      ))}
                  </div>
                )}
              </div>
            )}
          </Section>

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              SECTION 5 — Details (collapsible)
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <div className='relative flex gap-5'>
            <div className='flex flex-col items-center pt-0.5'>
              <div className='flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground'>
                5
              </div>
            </div>
            <div className='min-w-0 flex-1 pb-10'>
              <button
                onClick={() => setDetailsOpen(o => !o)}
                className='mb-4 flex w-full items-center justify-between text-left'
              >
                <div>
                  <h2 className='text-base font-semibold text-foreground'>
                    Extra details
                  </h2>
                  <p className='mt-0.5 text-sm text-muted-foreground'>
                    Description and labels — optional, helps organise
                  </p>
                </div>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 shrink-0 text-muted-foreground transition-transform',
                    detailsOpen && 'rotate-180'
                  )}
                />
              </button>

              {detailsOpen && (
                <div className='space-y-5'>
                  {/* Description */}
                  <div className='space-y-1.5'>
                    <Label className='text-sm font-medium'>Description</Label>
                    <Textarea
                      placeholder='Briefly describe what this automation does…'
                      value={formData.description ?? ''}
                      onChange={e => {
                        if (e.target.value.length <= 500)
                          update({ description: e.target.value });
                      }}
                      rows={3}
                      className='resize-none text-sm'
                    />
                    <p className='text-right text-xs text-muted-foreground'>
                      {(formData.description ?? '').length}/500
                    </p>
                  </div>

                  {/* Labels */}
                  <div className='space-y-1.5'>
                    <Label className='flex items-center gap-1.5 text-sm font-medium'>
                      <Tag className='h-3.5 w-3.5' />
                      Labels
                    </Label>
                    <div
                      onClick={() =>
                        document.getElementById('label-input')?.focus()
                      }
                      className='flex min-h-[44px] cursor-text flex-wrap items-center gap-1.5 rounded-lg border border-input bg-background px-3 py-2 ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2'
                    >
                      {labels.map(l => (
                        <Badge
                          key={l}
                          variant='secondary'
                          className='gap-1 bg-primary/10 text-primary'
                        >
                          {l}
                          <button
                            type='button'
                            onClick={() => removeLabel(l)}
                            className='ml-0.5 rounded hover:bg-primary/20'
                          >
                            <X className='h-3 w-3' />
                          </button>
                        </Badge>
                      ))}
                      <input
                        id='label-input'
                        value={labelInput}
                        onChange={e => setLabelInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addLabel();
                          } else if (
                            e.key === 'Backspace' &&
                            !labelInput &&
                            labels.length > 0
                          )
                            removeLabel(labels[labels.length - 1]);
                        }}
                        onBlur={addLabel}
                        placeholder={
                          labels.length === 0
                            ? 'Add label and press Enter…'
                            : ''
                        }
                        className='min-w-[140px] flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground'
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Bottom actions ── */}
          <div className='flex items-center justify-between border-t border-border pt-6'>
            <Button
              variant='ghost'
              onClick={onCancel}
              className='text-muted-foreground'
            >
              Cancel
            </Button>
            <div className='flex gap-2'>
              <Button
                variant='outline'
                disabled={isSaving}
                onClick={() => void submit(true)}
              >
                Save as draft
              </Button>
              <Button
                disabled={isSaving || !canSubmit}
                onClick={() => void submit(false)}
                className='gap-1.5'
              >
                {isSaving && <Loader2 className='h-3.5 w-3.5 animate-spin' />}
                {isEditMode ? 'Save changes' : 'Activate automation'}
                {!isSaving && <ChevronRight className='h-4 w-4' />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Media selector modal ── */}
      {isMediaModalOpen && formData.social_account_id && (
        <MediaSelectorModal
          open={isMediaModalOpen}
          onOpenChange={v => setIsMediaModalOpen(v)}
          onSelect={handleMediaSelect}
          socialAccountId={formData.social_account_id}
          selectedIds={selectedMedia.map(m => m.id)}
        />
      )}
    </div>
  );
}
