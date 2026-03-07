'use client';

import { useState, useEffect } from 'react';
import { Loader2, Sparkles, PenTool, GitMerge, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { IntelligenceApi } from '@/lib/api/intelligence';
import { VoiceDnaApi } from '@/lib/api/voice-dna';
import type { BrandVoice, Bot } from '@/lib/types/intelligence';
import type { CreateVoiceDnaDto, AutoInferResult } from '@/lib/types/voice-dna';
import { useToast } from '@/hooks/use-toast';
import { parseApiError } from '@/lib/http/errors';

type CreationMode = 'manual' | 'auto' | 'hybrid';

interface VoiceDnaCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (dto: CreateVoiceDnaDto) => Promise<void>;
  preSelectedBrandVoiceId?: string;
}

const MIN_SAMPLES = 5;
const MIN_MANUAL_SAMPLES = 3;

const MODE_OPTIONS: {
  id: CreationMode;
  icon: React.ReactNode;
  title: string;
  description: string;
}[] = [
  {
    id: 'manual',
    icon: <PenTool className='h-5 w-5' />,
    title: 'Manual',
    description: 'Paste your writing samples',
  },
  {
    id: 'auto',
    icon: <Sparkles className='h-5 w-5' />,
    title: 'Auto-Detect',
    description: 'We scan your posts & replies',
  },
  {
    id: 'hybrid',
    icon: <GitMerge className='h-5 w-5' />,
    title: 'Hybrid',
    description: 'Auto + your own samples',
  },
];

export function VoiceDnaCreateDialog({
  open,
  onOpenChange,
  onSubmit,
  preSelectedBrandVoiceId,
}: VoiceDnaCreateDialogProps) {
  const { toast } = useToast();
  const [mode, setMode] = useState<CreationMode>('manual');
  const [brandVoices, setBrandVoices] = useState<BrandVoice[]>([]);
  const [bots, setBots] = useState<Bot[]>([]);
  const [selectedBrandVoiceId, setSelectedBrandVoiceId] = useState(
    preSelectedBrandVoiceId || ''
  );
  const [selectedBotId, setSelectedBotId] = useState('');
  const [rawSamplesText, setRawSamplesText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Auto-infer state
  const [autoResult, setAutoResult] = useState<AutoInferResult | null>(null);
  const [isTriggering, setIsTriggering] = useState(false);
  const [_, setAutoTriggered] = useState(false);

  useEffect(() => {
    if (open) {
      fetchData();
      if (preSelectedBrandVoiceId) {
        setSelectedBrandVoiceId(preSelectedBrandVoiceId);
      }
      // Reset state
      setMode('manual');
      setAutoResult(null);
      setAutoTriggered(false);
      setRawSamplesText('');
    }
  }, [open, preSelectedBrandVoiceId]);

  const fetchData = async () => {
    setIsLoadingData(true);
    try {
      const [bvRes, botsRes] = await Promise.all([
        IntelligenceApi.getBrandVoices(),
        IntelligenceApi.getBots(),
      ]);
      if (bvRes?.data) setBrandVoices(bvRes.data);
      if (botsRes?.data) setBots(botsRes.data);
    } catch {
      // Silently fail — fields still usable
    } finally {
      setIsLoadingData(false);
    }
  };

  // Parse samples: split by double newlines
  const parseSamples = (text: string): string[] =>
    text
      .split(/\n\s*\n/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

  const samples = parseSamples(rawSamplesText);
  const sampleCount = samples.length;
  const sampleProgress = Math.min((sampleCount / MIN_SAMPLES) * 100, 100);
  const hasEnoughSamples = sampleCount >= MIN_MANUAL_SAMPLES;

  // Trigger auto-scan when bot selected in auto/hybrid mode
  const handleTriggerAutoScan = async () => {
    if (!selectedBotId) return;
    setIsTriggering(true);
    setAutoResult(null);
    try {
      const res = await VoiceDnaApi.triggerAutoInfer({
        bot_id: selectedBotId,
        brand_voice_id: selectedBrandVoiceId || undefined,
      });
      if (res?.data) {
        setAutoResult(res.data);
        setAutoTriggered(true);
      }
    } catch (err) {
      const parsed = parseApiError(err);
      toast({
        variant: 'destructive',
        title: 'Scan failed',
        description: parsed.message,
      });
    } finally {
      setIsTriggering(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedBrandVoiceId) return;

    setIsSubmitting(true);
    try {
      if (mode === 'auto') {
        // For auto mode, just navigate to the detail page — analysis already queued
        if (autoResult?.voice_dna_id) {
          onOpenChange(false);
          // The parent page will refresh and show the new card
          window.location.href = `/dashboard/intelligence/voice-dna/${autoResult.voice_dna_id}`;
        } else {
          toast({
            variant: 'destructive',
            title: 'No Voice DNA created',
            description:
              'The auto-scan did not find enough samples. Switch to Manual or Hybrid mode.',
          });
        }
        return;
      }

      // Manual or Hybrid: create via samples API
      const source = mode === 'hybrid' ? 'hybrid' : 'user_configured';
      await onSubmit({
        brand_voice_id: selectedBrandVoiceId,
        raw_samples: samples.map(text => ({
          text,
          source: 'manual_input',
        })),
        source,
      });

      // Reset form
      setRawSamplesText('');
      setSelectedBrandVoiceId('');
      setSelectedBotId('');
      setAutoResult(null);
      setAutoTriggered(false);
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = () => {
    if (!selectedBrandVoiceId) return false;
    if (mode === 'auto')
      return (
        autoResult?.status === 'queued' ||
        autoResult?.status === 'already_exists'
      );
    return hasEnoughSamples;
  };

  const getSubmitLabel = () => {
    if (isSubmitting) return 'Creating...';
    if (mode === 'auto') return 'View Analysis';
    if (mode === 'hybrid') return 'Create Hybrid DNA';
    return 'Create & Analyze';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-xl flex flex-col max-h-[90vh] p-0 gap-0'>
        {/* Sticky header — never scrolls away */}
        <DialogHeader className='px-6 pt-6 pb-4 shrink-0 border-b'>
          <DialogTitle>Create Voice DNA</DialogTitle>
          <DialogDescription>
            Choose how you want to capture your unique writing style.
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable body */}
        <div className='flex-1 overflow-y-auto px-6 py-5'>
          <div className='space-y-5'>
            {/* Mode Selector */}
            <div className='grid grid-cols-3 gap-2'>
              {MODE_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  type='button'
                  onClick={() => {
                    setMode(opt.id);
                    setAutoResult(null);
                    setAutoTriggered(false);
                  }}
                  className={cn(
                    'relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 text-center transition-all duration-200 cursor-pointer',
                    mode === opt.id
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border hover:border-border/80 hover:bg-muted/40 text-muted-foreground'
                  )}
                >
                  {mode === opt.id && (
                    <span className='absolute top-2 right-2 h-4 w-4 rounded-full bg-primary flex items-center justify-center'>
                      <Check className='h-2.5 w-2.5 text-primary-foreground' />
                    </span>
                  )}
                  <span
                    className={cn(
                      'p-2 rounded-lg',
                      mode === opt.id ? 'bg-primary/10' : 'bg-muted'
                    )}
                  >
                    {opt.icon}
                  </span>
                  <div>
                    <p className='text-xs font-semibold'>{opt.title}</p>
                    <p className='text-[10px] leading-tight mt-0.5 text-muted-foreground'>
                      {opt.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Brand Voice Selection */}
            <div className='space-y-2'>
              <Label>Brand Voice</Label>
              <Select
                value={selectedBrandVoiceId}
                onValueChange={setSelectedBrandVoiceId}
                disabled={isLoadingData}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select a brand voice...' />
                </SelectTrigger>
                <SelectContent>
                  {brandVoices.map(bv => (
                    <SelectItem key={bv._id} value={bv._id}>
                      {bv.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Bot Selection (for auto + hybrid) */}
            {(mode === 'auto' || mode === 'hybrid') && (
              <div className='space-y-2'>
                <Label>Bot to scan</Label>
                <p className='text-xs text-muted-foreground'>
                  {mode === 'auto'
                    ? "We'll scan this bot's Instagram posts and past replies to detect your writing style automatically."
                    : "We'll auto-scan this bot and combine the results with the samples you provide below."}
                </p>
                <div className='flex gap-2'>
                  <Select
                    value={selectedBotId}
                    onValueChange={val => {
                      setSelectedBotId(val);
                      setAutoResult(null);
                      setAutoTriggered(false);
                    }}
                    disabled={isLoadingData}
                  >
                    <SelectTrigger className='flex-1'>
                      <SelectValue placeholder='Select a bot...' />
                    </SelectTrigger>
                    <SelectContent>
                      {bots.map(b => (
                        <SelectItem key={b._id} value={b._id}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={handleTriggerAutoScan}
                    disabled={!selectedBotId || isTriggering}
                    className='shrink-0'
                  >
                    {isTriggering ? (
                      <Loader2 className='h-4 w-4 animate-spin' />
                    ) : (
                      <Sparkles className='h-4 w-4' />
                    )}
                    <span className='ml-1.5 hidden sm:inline'>Scan</span>
                  </Button>
                </div>

                {/* Auto-scan result */}
                {autoResult && (
                  <div
                    className={cn(
                      'rounded-lg border p-3 text-sm space-y-1',
                      autoResult.status === 'queued' ||
                        autoResult.status === 'already_exists'
                        ? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30'
                        : 'border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950/30'
                    )}
                  >
                    <div className='flex items-center gap-2 font-medium'>
                      {autoResult.status === 'queued' ||
                      autoResult.status === 'already_exists' ? (
                        <Check className='h-4 w-4 text-green-600' />
                      ) : (
                        <Sparkles className='h-4 w-4 text-yellow-600' />
                      )}
                      {autoResult.status === 'queued'
                        ? 'Analysis queued successfully'
                        : autoResult.status === 'already_exists'
                          ? 'Voice DNA already exists'
                          : `Found ${autoResult.samples_collected} samples — need ${MIN_SAMPLES} minimum`}
                    </div>
                    {(autoResult.caption_samples > 0 ||
                      autoResult.reply_samples > 0) && (
                      <p className='text-xs text-muted-foreground'>
                        {autoResult.caption_samples} Instagram posts ·{' '}
                        {autoResult.reply_samples} manual replies
                      </p>
                    )}
                    {autoResult.status === 'insufficient_samples' &&
                      mode === 'auto' && (
                        <p className='text-xs text-muted-foreground'>
                          Switch to <strong>Hybrid</strong> mode to add manual
                          samples and proceed.
                        </p>
                      )}
                  </div>
                )}

                {bots.length === 0 && !isLoadingData && (
                  <p className='text-xs text-muted-foreground bg-muted/50 rounded-lg p-3'>
                    No bots found. Create a bot first to use Auto-Detect or
                    Hybrid mode.
                  </p>
                )}
              </div>
            )}

            {/* Writing Samples (manual + hybrid) */}
            {(mode === 'manual' || mode === 'hybrid') && (
              <div className='space-y-2'>
                <Label>
                  {mode === 'hybrid'
                    ? 'Additional Writing Samples (optional)'
                    : 'Writing Samples'}
                </Label>
                <p className='text-xs text-muted-foreground'>
                  {mode === 'hybrid'
                    ? 'Add extra samples to boost accuracy. Separate each sample with a blank line.'
                    : 'Paste your writing samples below. Separate each sample with a blank line.'}
                </p>
                <Textarea
                  placeholder={`Sample 1: Hey bro! Thanks for checking out our page 🙏\n\nSample 2: Great question! Pricing starts at $29/mo...\n\nSample 3: Appreciate the love! We ship worldwide 🌍`}
                  value={rawSamplesText}
                  onChange={e => setRawSamplesText(e.target.value)}
                  rows={5}
                  className='font-mono text-sm resize-y min-h-[100px] max-h-[220px]'
                />

                {/* Sample Counter */}
                <div className='space-y-1.5'>
                  <div className='flex justify-between text-xs'>
                    <span className='text-muted-foreground'>
                      Samples detected
                    </span>
                    <span
                      className={
                        hasEnoughSamples
                          ? 'text-green-600 font-medium'
                          : 'text-orange-500 font-medium'
                      }
                    >
                      {sampleCount} / {MIN_MANUAL_SAMPLES} minimum
                      {mode === 'hybrid' && sampleCount === 0 && ' (optional)'}
                    </span>
                  </div>
                  <Progress
                    value={sampleProgress}
                    className={`h-1.5 ${
                      hasEnoughSamples
                        ? '[&>div]:bg-green-500'
                        : '[&>div]:bg-orange-400'
                    }`}
                  />
                  {mode === 'manual' &&
                    !hasEnoughSamples &&
                    sampleCount > 0 && (
                      <p className='text-xs text-orange-500'>
                        Add {MIN_MANUAL_SAMPLES - sampleCount} more sample
                        {MIN_MANUAL_SAMPLES - sampleCount > 1 ? 's' : ''} to
                        continue
                      </p>
                    )}
                </div>
              </div>
            )}
          </div>
        </div>
        {/* end scrollable body */}

        {/* Sticky footer — always visible */}
        <DialogFooter className='px-6 py-4 shrink-0 border-t gap-2'>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit() || isSubmitting}
          >
            {isSubmitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            {getSubmitLabel()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
