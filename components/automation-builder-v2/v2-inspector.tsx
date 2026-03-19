'use client';

import { useState, KeyboardEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  X,
  Sparkles,
  Settings2,
  FlaskConical,
  Info,
  Plus,
  Loader2,
  Bot as BotIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { getNodeDef } from './node-definitions';
import { MediaSelectorModal } from '@/components/automations/media-selector-modal';
import type {
  FlowNode,
  NewCommentConfig,
  DmReceivedConfig,
  StoryReplyConfig,
  MentionConfig,
  NewFollowerConfig,
  KeywordMatchConfig,
  FollowerCountConfig,
  ReplyCommentConfig,
  PrivateReplyConfig,
  SendDmConfig,
} from './types';
import { usePricing } from '@/hooks/use-pricing';
import type { Bot } from '@/lib/types/intelligence';
import type { Media } from '@/lib/api/media';

interface V2InspectorProps {
  node: FlowNode;
  bots: Bot[];
  selectedBotId: string | undefined;
  onSelectBot: (botId: string) => void;
  onUpdateConfig: (nodeId: string, config: Partial<FlowNode['config']>) => void;
  onClose: () => void;
}

type InspectorTab = 'config' | 'ai' | 'test';

export function V2Inspector({
  node,
  bots,
  selectedBotId,
  onSelectBot,
  onUpdateConfig,
  onClose,
}: V2InspectorProps) {
  const [activeTab, setActiveTab] = useState<InspectorTab>('config');
  const def = getNodeDef(node.definitionId);
  const Icon = def.icon;

  const update = (patch: Partial<FlowNode['config']>) => {
    onUpdateConfig(node.id, patch);
  };

  // Show AI tab only for action nodes that have use_ai_reply
  const showAiTab = node.category === 'action';

  const tabs: { id: InspectorTab; label: string; icon: React.ElementType }[] = [
    { id: 'config', label: 'Config', icon: Settings2 },
    ...(showAiTab
      ? [{ id: 'ai' as const, label: 'AI Settings', icon: Sparkles }]
      : []),
    { id: 'test', label: 'Test', icon: FlaskConical },
  ];

  return (
    <aside className='flex h-full w-full flex-shrink-0 flex-col border-l border-white/10 bg-[#0d0d1a] md:w-[300px]'>
      {/* Inspector header */}
      <div className='flex items-center justify-between border-b border-white/10 px-4 py-3'>
        <div className='flex items-center gap-2'>
          <div
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-lg',
              def.iconBg
            )}
          >
            <Icon className={cn('h-3.5 w-3.5', def.iconColor)} />
          </div>
          <div>
            <p className='text-sm font-semibold text-white'>{def.label}</p>
            <p
              className={cn(
                'text-[10px] uppercase tracking-widest font-bold',
                def.headerText
              )}
            >
              {node.category}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className='rounded p-1 text-slate-500 hover:bg-white/5 hover:text-white'
        >
          <X className='h-4 w-4' />
        </button>
      </div>

      {/* Tabs */}
      <div className='flex border-b border-white/10'>
        {tabs.map(tab => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors',
                activeTab === tab.id
                  ? 'border-b-2 border-violet-500 text-white'
                  : 'text-slate-500 hover:text-slate-300'
              )}
            >
              <TabIcon className='h-3.5 w-3.5' />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className='flex-1 overflow-y-auto'>
        {activeTab === 'config' && (
          <NodeConfigForm node={node} update={update} />
        )}
        {activeTab === 'ai' && showAiTab && (
          <AiSettingsPanel
            node={node}
            bots={bots}
            selectedBotId={selectedBotId}
            onSelectBot={onSelectBot}
            update={update}
          />
        )}
        {activeTab === 'test' && <NodeTestPanel node={node} />}
      </div>
    </aside>
  );
}

// ── Config forms dispatch ───────────────────────────────────────────────────

function NodeConfigForm({
  node,
  update,
}: {
  node: FlowNode;
  update: (patch: Partial<FlowNode['config']>) => void;
}) {
  switch (node.definitionId) {
    case 'new_comment':
      return (
        <NewCommentForm
          config={node.config as NewCommentConfig}
          update={update}
        />
      );
    case 'dm_received':
    case 'story_reply':
    case 'mention':
    case 'new_follower':
      return (
        <SimpleTriggerForm
          config={
            node.config as
              | DmReceivedConfig
              | StoryReplyConfig
              | MentionConfig
              | NewFollowerConfig
          }
          update={update}
        />
      );
    case 'keyword_match':
      return (
        <KeywordMatchForm
          config={node.config as KeywordMatchConfig}
          update={update}
        />
      );
    case 'follower_count':
      return (
        <FollowerCountForm
          config={node.config as FollowerCountConfig}
          update={update}
        />
      );
    case 'reply_comment':
      return (
        <ReplyCommentForm
          config={node.config as ReplyCommentConfig}
          update={update}
        />
      );
    case 'private_reply':
      return (
        <PrivateReplyForm
          config={node.config as PrivateReplyConfig}
          update={update}
        />
      );
    case 'send_dm':
      return (
        <SendDmForm config={node.config as SendDmConfig} update={update} />
      );
    default:
      return (
        <div className='flex h-32 items-center justify-center p-4'>
          <p className='text-sm text-slate-600'>No configuration available.</p>
        </div>
      );
  }
}

// ── Trigger forms ──────────────────────────────────────────────────────────

/** New Comment trigger — with scope & media picker */
function NewCommentForm({
  config,
  update,
}: {
  config: NewCommentConfig;
  update: (p: Partial<NewCommentConfig>) => void;
}) {
  const [isMediaOpen, setIsMediaOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<Media[]>([]);
  const { data: pricingData } = usePricing();
  const maxCooldownHours =
    pricingData?.app_limits?.bot.max_cooldown_hours ?? 168;

  const handleMediaSelect = (media: Media[]) => {
    setSelectedMedia(media);
    update({ content_ids: media.map(m => m.id) });
  };

  const handleScopeChange = (val: string) => {
    const newFilter = val as 'all' | 'specific';
    if (newFilter === 'all') {
      setSelectedMedia([]);
      update({ postFilter: 'all', content_ids: [] });
    } else {
      update({ postFilter: 'specific' });
    }
  };

  return (
    <div className='space-y-5 p-4'>
      <FormField label='Platform'>
        <div className='flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-slate-300'>
          <span>Instagram</span>
        </div>
      </FormField>

      <FormField label='Apply to'>
        <Select value={config.postFilter} onValueChange={handleScopeChange}>
          <SelectTrigger className={inputCls}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className='border-white/10 bg-[#1a1a2e] text-slate-200'>
            <SelectItem value='all'>All posts &amp; reels</SelectItem>
            <SelectItem value='specific'>Specific posts</SelectItem>
          </SelectContent>
        </Select>
      </FormField>

      {config.postFilter === 'specific' && (
        <div className='rounded-lg border border-white/10 bg-white/5 p-3'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-slate-200'>
                Selected Posts
              </p>
              <p className='text-xs text-slate-500'>
                {config.content_ids.length === 0
                  ? 'No posts selected'
                  : `${config.content_ids.length} post${config.content_ids.length !== 1 ? 's' : ''} selected`}
              </p>
            </div>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setIsMediaOpen(true)}
              className='h-7 gap-1.5 border-white/10 bg-transparent text-xs text-slate-300 hover:bg-white/5'
            >
              <Plus className='h-3 w-3' />
              Select
            </Button>
          </div>

          {isLoading && (
            <div className='mt-3 flex h-12 items-center justify-center'>
              <Loader2 className='h-4 w-4 animate-spin text-violet-400' />
            </div>
          )}

          {!isLoading && selectedMedia.length > 0 && (
            <div className='mt-3 flex flex-wrap gap-2'>
              {selectedMedia.map(m => (
                <div
                  key={m.id}
                  className='group relative h-14 w-14 overflow-hidden rounded-md border border-white/10'
                >
                  <Image
                    src={m.thumbnail_url || m.url}
                    alt='Post'
                    width={56}
                    height={56}
                    className='h-full w-full object-cover'
                    unoptimized
                  />
                  <button
                    onClick={() => {
                      const next = selectedMedia.filter(x => x.id !== m.id);
                      setSelectedMedia(next);
                      update({ content_ids: next.map(x => x.id) });
                    }}
                    className='absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100'
                  >
                    <X className='h-2.5 w-2.5' />
                  </button>
                </div>
              ))}
            </div>
          )}

          {config.content_ids.length === 0 && (
            <p className='mt-2 text-xs text-amber-400'>
              Select at least one post to continue
            </p>
          )}
        </div>
      )}

      <FormField label='Cooldown per user (hours)'>
        <Input
          type='number'
          min={0}
          max={maxCooldownHours}
          value={config.cooldownHours}
          onChange={e => update({ cooldownHours: Number(e.target.value) })}
          className={inputCls}
        />
        <p className='mt-1 text-[11px] text-slate-600'>
          0 = no cooldown. Max {maxCooldownHours} h.
        </p>
      </FormField>

      {isMediaOpen && (
        <MediaSelectorModal
          open={isMediaOpen}
          onOpenChange={val => {
            setIsMediaOpen(val);
            setIsLoading(false);
          }}
          selectedIds={config.content_ids}
          initialMedia={selectedMedia}
          onSelect={handleMediaSelect}
          socialAccountId={config.social_account_id}
        />
      )}
    </div>
  );
}

/** Shared trigger form for dm_received / story_reply / mention / new_follower */
function SimpleTriggerForm({
  config,
  update,
}: {
  config:
    | DmReceivedConfig
    | StoryReplyConfig
    | MentionConfig
    | NewFollowerConfig;
  update: (p: Partial<typeof config>) => void;
}) {
  const { data: pricingData } = usePricing();
  const maxCooldownHours =
    pricingData?.app_limits?.bot.max_cooldown_hours ?? 168;

  return (
    <div className='space-y-5 p-4'>
      <FormField label='Platform'>
        <div className='flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-slate-300'>
          <span>Instagram</span>
        </div>
      </FormField>

      <FormField label='Cooldown per user (hours)'>
        <Input
          type='number'
          min={0}
          max={maxCooldownHours}
          value={config.cooldownHours}
          onChange={e =>
            update({ cooldownHours: Number(e.target.value) } as Partial<
              typeof config
            >)
          }
          className={inputCls}
        />
        <p className='mt-1 text-[11px] text-slate-600'>0 = no cooldown.</p>
      </FormField>
    </div>
  );
}

// ── Condition forms ─────────────────────────────────────────────────────────

function KeywordMatchForm({
  config,
  update,
}: {
  config: KeywordMatchConfig;
  update: (p: Partial<KeywordMatchConfig>) => void;
}) {
  const [input, setInput] = useState('');

  const addKeyword = (raw: string) => {
    const trimmed = raw.trim().toLowerCase();
    if (trimmed && !config.keywords.includes(trimmed)) {
      update({ keywords: [...config.keywords, trimmed] });
    }
  };

  const removeKeyword = (kw: string) => {
    update({ keywords: config.keywords.filter(k => k !== kw) });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addKeyword(input);
      setInput('');
    } else if (e.key === 'Backspace' && !input && config.keywords.length > 0) {
      update({ keywords: config.keywords.slice(0, -1) });
    }
  };

  const MATCH_MODES: {
    value: KeywordMatchConfig['matchMode'];
    label: string;
  }[] = [
    { value: 'any', label: 'Contains Any' },
    { value: 'all', label: 'Contains All' },
    { value: 'exact', label: 'Exact Match' },
    { value: 'none', label: 'Contains None' },
  ];

  return (
    <div className='space-y-5 p-4'>
      <FormField label='Match mode'>
        <Select
          value={config.matchMode}
          onValueChange={v =>
            update({ matchMode: v as KeywordMatchConfig['matchMode'] })
          }
        >
          <SelectTrigger className={inputCls}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className='border-white/10 bg-[#1a1a2e] text-slate-200'>
            {MATCH_MODES.map(m => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <FormField label='Keywords'>
        <div className='flex min-h-10 flex-wrap gap-1.5 rounded-lg border border-white/10 bg-white/5 p-2 focus-within:border-violet-500/50'>
          {config.keywords.map(kw => (
            <span
              key={kw}
              className='flex items-center gap-1 rounded-full bg-violet-500/20 px-2 py-0.5 text-[11px] text-violet-300'
            >
              {kw}
              <button onClick={() => removeKeyword(kw)}>
                <X className='h-3 w-3' />
              </button>
            </span>
          ))}
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              if (input.trim()) {
                addKeyword(input);
                setInput('');
              }
            }}
            placeholder={
              config.keywords.length === 0 ? 'Type and press Enter…' : ''
            }
            className='min-w-[100px] flex-1 bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-600'
          />
        </div>
        <p className='mt-1 text-[11px] text-slate-600'>
          Enter to add · Backspace to remove last
        </p>
      </FormField>
    </div>
  );
}

function FollowerCountForm({
  config,
  update,
}: {
  config: FollowerCountConfig;
  update: (p: Partial<FollowerCountConfig>) => void;
}) {
  return (
    <div className='space-y-5 p-4'>
      <FormField label='Operator'>
        <Select
          value={config.operator}
          onValueChange={v =>
            update({ operator: v as FollowerCountConfig['operator'] })
          }
        >
          <SelectTrigger className={inputCls}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className='border-white/10 bg-[#1a1a2e] text-slate-200'>
            <SelectItem value='greater_than'>Greater than</SelectItem>
            <SelectItem value='less_than'>Less than</SelectItem>
            <SelectItem value='equals'>Equals</SelectItem>
          </SelectContent>
        </Select>
      </FormField>

      <FormField label='Follower threshold'>
        <Input
          type='number'
          min={0}
          value={config.threshold}
          onChange={e => update({ threshold: Number(e.target.value) })}
          className={inputCls}
        />
      </FormField>

      <div className='rounded-lg border border-violet-500/20 bg-violet-500/5 p-3'>
        <div className='flex items-start gap-2'>
          <Info className='mt-0.5 h-4 w-4 flex-shrink-0 text-violet-400' />
          <p className='text-[11px] text-slate-400'>
            The automation only continues for users who meet this follower count
            condition.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Action forms ────────────────────────────────────────────────────────────

function ReplyCommentForm({
  config,
  update,
}: {
  config: ReplyCommentConfig;
  update: (p: Partial<ReplyCommentConfig>) => void;
}) {
  return (
    <ActionMessageForm
      config={config}
      update={update}
      placeholder='Enter reply message…'
    />
  );
}

function PrivateReplyForm({
  config,
  update,
}: {
  config: PrivateReplyConfig;
  update: (p: Partial<PrivateReplyConfig>) => void;
}) {
  return (
    <ActionMessageForm
      config={config}
      update={update}
      placeholder='Enter private DM message…'
    />
  );
}

/** Shared text message form used by reply_comment and private_reply */
function ActionMessageForm({
  config,
  update,
  placeholder,
}: {
  config: ReplyCommentConfig | PrivateReplyConfig;
  update: (p: Partial<ReplyCommentConfig | PrivateReplyConfig>) => void;
  placeholder: string;
}) {
  const { data: pricingData } = usePricing();
  const maxDelaySeconds =
    pricingData?.app_limits?.bot.max_reply_delay_seconds ?? 3600;

  return (
    <div className='space-y-5 p-4'>
      {/* AI toggle */}
      <div className='flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2.5'>
        <div>
          <p className='text-sm font-medium text-slate-200'>
            Auto-generate with AI
          </p>
          <p className='text-[11px] text-slate-500'>AI Reply Active</p>
        </div>
        <Switch
          checked={config.use_ai_reply}
          onCheckedChange={v => update({ use_ai_reply: v })}
        />
      </div>

      {config.use_ai_reply && (
        <div className='flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3'>
          <div className='flex h-8 w-8 items-center justify-center rounded-full bg-primary/10'>
            <Sparkles className='h-4 w-4 text-primary' />
          </div>
          <div>
            <p className='text-xs font-semibold text-foreground'>
              AI Reply Active
            </p>
            <p className='text-[11px] text-slate-500'>
              AI will generate the response
            </p>
          </div>
        </div>
      )}

      <FormField label={config.use_ai_reply ? 'Fallback Message' : 'Message'}>
        <Textarea
          value={config.text}
          onChange={e => update({ text: e.target.value })}
          placeholder={
            config.use_ai_reply
              ? 'Enter a fallback message in case AI fails…'
              : placeholder
          }
          rows={5}
          className={cn(inputCls, 'resize-none')}
        />
        {config.use_ai_reply && (
          <p className='mt-1 text-[11px] text-slate-600'>
            Sent if AI cannot generate a response.
          </p>
        )}
      </FormField>

      <FormField label='Delay (seconds)'>
        <Input
          type='number'
          min={0}
          max={maxDelaySeconds}
          value={config.delay_seconds}
          onChange={e => update({ delay_seconds: Number(e.target.value) })}
          className={inputCls}
        />
      </FormField>
    </div>
  );
}

/** Send DM — supports text and media tabs, mirrors InstagramDmAction */
function SendDmForm({
  config,
  update,
}: {
  config: SendDmConfig;
  update: (p: Partial<SendDmConfig>) => void;
}) {
  const { data: pricingData } = usePricing();
  const maxDelaySeconds =
    pricingData?.app_limits?.bot.max_reply_delay_seconds ?? 3600;

  return (
    <div className='space-y-4 p-4'>
      <Tabs
        value={config.messageKind}
        onValueChange={val =>
          update({ messageKind: val as 'text' | 'media', text: config.text })
        }
      >
        <TabsList className='mb-3 grid w-full grid-cols-2 bg-white/5'>
          <TabsTrigger value='text' className='text-xs'>
            Text Message
          </TabsTrigger>
          <TabsTrigger value='media' className='text-xs'>
            Media Message
          </TabsTrigger>
        </TabsList>

        <TabsContent value='text' className='mt-0 space-y-4'>
          {/* AI toggle */}
          <div className='flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2.5'>
            <div>
              <p className='text-sm font-medium text-slate-200'>
                Auto-generate with AI
              </p>
              <p className='text-[11px] text-slate-500'>
                AI personalises each DM
              </p>
            </div>
            <Switch
              checked={config.use_ai_reply}
              onCheckedChange={v => update({ use_ai_reply: v })}
            />
          </div>

          {config.use_ai_reply && (
            <div className='flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3'>
              <div className='flex h-8 w-8 items-center justify-center rounded-full bg-primary/10'>
                <Sparkles className='h-4 w-4 text-primary' />
              </div>
              <p className='text-xs text-slate-300'>
                AI will generate personalised replies
              </p>
            </div>
          )}

          <FormField
            label={config.use_ai_reply ? 'Fallback Message' : 'Message'}
          >
            <Textarea
              value={config.text}
              onChange={e => update({ text: e.target.value })}
              placeholder={
                config.use_ai_reply
                  ? 'Enter a fallback message in case AI fails…'
                  : 'Enter DM message…'
              }
              rows={5}
              className={cn(inputCls, 'resize-none')}
            />
            {config.use_ai_reply && (
              <p className='mt-1 text-[11px] text-slate-600'>
                Sent if AI cannot generate a response.
              </p>
            )}
          </FormField>
        </TabsContent>

        <TabsContent value='media' className='mt-0 space-y-3'>
          <div className='rounded-lg border border-white/10 bg-white/5 p-3'>
            {config.mediaUrl ? (
              <div className='relative overflow-hidden rounded-md'>
                {config.mediaType === 'image' && (
                  <div className='relative h-40 w-full'>
                    <Image
                      src={config.mediaUrl}
                      alt='DM attachment'
                      fill
                      className='object-cover'
                      unoptimized
                    />
                  </div>
                )}
                {config.mediaType === 'video' && (
                  <video
                    src={config.mediaUrl}
                    className='h-40 w-full bg-black'
                    controls
                  />
                )}
                <button
                  onClick={() =>
                    update({ mediaUrl: undefined, mediaType: undefined })
                  }
                  className='absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white'
                >
                  <X className='h-3.5 w-3.5' />
                </button>
              </div>
            ) : (
              <p className='text-center text-xs text-slate-600'>
                Media upload via the full media picker (open in the wizard) will
                be supported here soon.
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <FormField label='Delay (seconds)'>
        <Input
          type='number'
          min={0}
          max={maxDelaySeconds}
          value={config.delay_seconds}
          onChange={e => update({ delay_seconds: Number(e.target.value) })}
          className={inputCls}
        />
      </FormField>

      <div className='flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2.5'>
        <div>
          <p className='text-sm font-medium text-slate-200'>
            Send once per user
          </p>
          <p className='text-[11px] text-slate-500'>Prevent duplicate DMs</p>
        </div>
        <Switch
          checked={config.sendOnce}
          onCheckedChange={v => update({ sendOnce: v })}
        />
      </div>
    </div>
  );
}

// ── AI Settings tab ─────────────────────────────────────────────────────────

function AiSettingsPanel({
  node,
  bots,
  selectedBotId,
  onSelectBot,
  update,
}: {
  node: FlowNode;
  bots: Bot[];
  selectedBotId: string | undefined;
  onSelectBot: (id: string) => void;
  update: (p: Partial<FlowNode['config']>) => void;
}) {
  const config = node.config as
    | ReplyCommentConfig
    | PrivateReplyConfig
    | SendDmConfig;
  const hasAi = config.use_ai_reply;

  return (
    <div className='space-y-5 p-4'>
      {/* AI toggle */}
      <div className='flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2.5'>
        <div>
          <p className='text-sm font-medium text-slate-200'>
            Enable AI Replies
          </p>
          <p className='text-[11px] text-slate-500'>
            Use AI to personalise each response
          </p>
        </div>
        <Switch
          checked={hasAi}
          onCheckedChange={v => update({ use_ai_reply: v })}
        />
      </div>

      {hasAi && (
        <>
          {/* Bot selector */}
          <FormField label='Select AI Bot'>
            <Select value={selectedBotId} onValueChange={onSelectBot}>
              <SelectTrigger className={inputCls}>
                <SelectValue placeholder='Select a bot…' />
              </SelectTrigger>
              <SelectContent className='border-white/10 bg-[#1a1a2e] text-slate-200'>
                {bots.map(bot => (
                  <SelectItem key={bot._id} value={bot._id}>
                    {bot.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {bots.length === 0 && (
              <p className='mt-1.5 text-xs text-red-400'>
                No bots found. Please create one first.
              </p>
            )}
          </FormField>

          {/* Bot management links */}
          <div className='flex gap-3 text-xs'>
            <Link
              href='/dashboard/intelligence/bots'
              className='text-primary hover:underline'
            >
              Manage bots
            </Link>
            <span className='text-slate-600'>·</span>
            <Link
              href='/dashboard/intelligence/brand-voices'
              className='text-primary hover:underline'
            >
              Brand voices
            </Link>
          </div>

          <div className='rounded-lg border border-amber-500/20 bg-amber-500/5 p-3'>
            <div className='flex items-start gap-2'>
              <BotIcon className='mt-0.5 h-4 w-4 flex-shrink-0 text-amber-400' />
              <p className='text-[11px] text-amber-300'>
                AI replies consume credits per execution. A fallback message is
                required in the Config tab.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Test tab ─────────────────────────────────────────────────────────────────

function NodeTestPanel({ node }: { node: FlowNode }) {
  return (
    <div className='p-4'>
      <div className='rounded-xl border border-white/10 bg-white/5 p-6 text-center'>
        <FlaskConical className='mx-auto mb-3 h-8 w-8 text-slate-600' />
        <p className='mb-1 text-sm font-medium text-slate-300'>
          Test this node
        </p>
        <p className='mb-4 text-xs text-slate-500'>
          Send a test payload to verify your configuration before going live.
        </p>
        <Button
          size='sm'
          className='gap-2 bg-violet-600 text-white hover:bg-violet-700'
          disabled
        >
          <FlaskConical className='h-3.5 w-3.5' />
          Run Test
        </Button>
        <p className='mt-3 text-[10px] text-slate-600'>
          Live testing coming soon.
        </p>
      </div>

      <div className='mt-4 space-y-1'>
        <p className='text-xs font-semibold uppercase tracking-widest text-slate-600'>
          Node ID
        </p>
        <code className='block rounded bg-white/5 px-2 py-1.5 text-[11px] text-slate-400'>
          {node.id}
        </code>
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className='mb-1.5 block text-xs font-semibold text-slate-400'>
        {label}
      </Label>
      {children}
    </div>
  );
}

const inputCls =
  'border-white/10 bg-white/5 text-slate-200 placeholder:text-slate-600 focus:border-violet-500/60 focus:ring-violet-500/20';
