'use client';

import { useState } from 'react';
import { Loader2, Plus, X, Save, BrainCircuit, SnowflakeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { VoiceDnaApi } from '@/lib/api/voice-dna';
import type {
  VoiceDna,
  UpdateVoiceDnaDto,
  VoiceDnaCustomExampleDto,
} from '@/lib/types/voice-dna';

interface VoiceDnaSettingsPanelProps {
  voiceDna: VoiceDna;
  onSaved: (updatedId: string) => void;
  onClose: () => void;
}

// ── Slider row ─────────────────────────────────────────────────────────────

interface SliderRowProps {
  label: string;
  description: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  lowLabel?: string;
  highLabel?: string;
}

function SliderRow({
  label,
  description,
  value,
  onChange,
  min = 1,
  max = 5,
  lowLabel = 'Low',
  highLabel = 'High',
}: SliderRowProps) {
  return (
    <div className='space-y-2'>
      <div className='flex items-center justify-between'>
        <div>
          <Label className='text-sm font-medium'>{label}</Label>
          <p className='text-xs text-muted-foreground'>{description}</p>
        </div>
        <Badge variant='outline' className='tabular-nums'>
          {value}/{max}
        </Badge>
      </div>
      <Slider
        min={min}
        max={max}
        step={1}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        className='w-full'
      />
      <div className='flex justify-between text-xs text-muted-foreground'>
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );
}

// ── Defaults from existing fingerprint (map 0–10 scale back to 1–5) ────────

function fingerprintToSlider(value: number | undefined, defaultVal = 3): number {
  if (value === undefined) return defaultVal;
  return Math.max(1, Math.min(5, Math.round(value / 2)));
}

function emojiFrequencyToIntensity(freq: number | undefined): number {
  if (freq === undefined) return 3;
  // freq is 0–1; map to 1–5
  return Math.max(1, Math.min(5, Math.round(freq * 4) + 1));
}

// ── Main component ─────────────────────────────────────────────────────────

export function VoiceDnaSettingsPanel({
  voiceDna,
  onSaved,
  onClose,
}: VoiceDnaSettingsPanelProps) {
  const { toast } = useToast();
  const fp = voiceDna.fingerprint;

  // Learning mode toggle — default to whatever is saved, or true if not set yet
  const [learningMode, setLearningMode] = useState<boolean>(
    voiceDna.learning_mode_enabled ?? true
  );

  // Tone sliders (1–5 scale)
  const [humor, setHumor] = useState(fingerprintToSlider(fp?.humor_level));
  const [warmth, setWarmth] = useState(fingerprintToSlider(fp?.warmth));
  const [directness, setDirectness] = useState(fingerprintToSlider(fp?.directness));
  const [assertiveness, setAssertiveness] = useState(fingerprintToSlider(fp?.assertiveness));
  const [emojiIntensity, setEmojiIntensity] = useState(
    emojiFrequencyToIntensity(fp?.emoji_frequency)
  );

  // Language & vocabulary
  const [vocabulary, setVocabulary] = useState<
    'simple' | 'moderate' | 'advanced' | ''
  >(fp?.vocabulary_complexity ?? '');
  const [language, setLanguage] = useState(fp?.primary_language ?? '');

  // Sample injection
  const [newSample, setNewSample] = useState('');
  const [customNegativeInput, setCustomNegativeInput] = useState('');
  const [customNegatives, setCustomNegatives] = useState<string[]>([]);

  // Custom examples
  const [exampleContext, setExampleContext] = useState('');
  const [exampleReply, setExampleReply] = useState('');
  const [customExamples, setCustomExamples] = useState<VoiceDnaCustomExampleDto[]>([]);

  const [isSaving, setIsSaving] = useState(false);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const addCustomNegative = () => {
    const trimmed = customNegativeInput.trim();
    if (!trimmed) return;
    setCustomNegatives((prev) => [...prev, trimmed]);
    setCustomNegativeInput('');
  };

  const removeCustomNegative = (index: number) => {
    setCustomNegatives((prev) => prev.filter((_, i) => i !== index));
  };

  const addCustomExample = () => {
    if (exampleContext.trim().length < 10 || exampleReply.trim().length < 5) {
      toast({
        variant: 'destructive',
        title: 'Too short',
        description: 'Context needs at least 10 characters, reply at least 5.',
      });
      return;
    }
    setCustomExamples((prev) => [
      ...prev,
      { context: exampleContext.trim(), reply: exampleReply.trim() },
    ]);
    setExampleContext('');
    setExampleReply('');
  };

  const removeCustomExample = (index: number) => {
    setCustomExamples((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const dto: UpdateVoiceDnaDto = {
        learning_mode_enabled: learningMode,
        humor_level: humor,
        warmth,
        directness,
        assertiveness,
        emoji_intensity: emojiIntensity,
        ...(vocabulary ? { vocabulary_complexity: vocabulary } : {}),
        ...(language.trim() ? { primary_language: language.trim() } : {}),
        ...(newSample.trim().length >= 20 ? { new_sample: newSample.trim() } : {}),
        ...(customExamples.length > 0 ? { custom_examples: customExamples } : {}),
        ...(customNegatives.length > 0 ? { custom_negatives: customNegatives } : {}),
      };

      await VoiceDnaApi.updateSettings(voiceDna._id, dto);

      toast({
        title: 'Voice DNA Updated',
        description: 'Your tone settings have been saved.',
      });
      onSaved(voiceDna._id);
    } catch {
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: 'Could not save Voice DNA settings. Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className='space-y-7'>
      {/* ── Learning Mode Toggle ──────────────────────────────────────── */}
      <section>
        <div
          className={`rounded-xl border p-4 transition-colors ${
            learningMode
              ? 'border-emerald-200 bg-emerald-50/60 dark:border-emerald-800 dark:bg-emerald-950/30'
              : 'border-slate-200 bg-slate-50/60 dark:border-slate-700 dark:bg-slate-900/30'
          }`}
        >
          <div className='flex items-start justify-between gap-3'>
            <div className='flex items-start gap-3'>
              <div
                className={`mt-0.5 rounded-md p-1.5 ${
                  learningMode
                    ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-400'
                    : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                }`}
              >
                {learningMode ? (
                  <BrainCircuit className='h-4 w-4' />
                ) : (
                  <SnowflakeIcon className='h-4 w-4' />
                )}
              </div>
              <div>
                <p className='text-sm font-semibold leading-tight'>
                  {learningMode ? 'Learning Mode: On' : 'Learning Mode: Off'}
                </p>
                <p className='text-xs text-muted-foreground mt-0.5'>
                  {learningMode
                    ? 'Your AI improves automatically from every interaction — edits, approvals, and live replies.'
                    : 'Voice DNA is frozen. No new data is ingested. Turn back on to resume learning.'}
                </p>
              </div>
            </div>
            <Switch
              checked={learningMode}
              onCheckedChange={setLearningMode}
              aria-label='Toggle learning mode'
              className='mt-0.5 shrink-0'
            />
          </div>
        </div>
      </section>

      {/* ── Tone Sliders ──────────────────────────────────────────────── */}
      <section className='space-y-5'>
        <div>
          <h3 className='text-sm font-semibold'>Tone Profile</h3>
          <p className='text-xs text-muted-foreground mt-0.5'>
            Adjust how your bot speaks. Changes apply from the next reply.
          </p>
        </div>

        <SliderRow
          label='Humor'
          description='How often the bot makes light of things'
          value={humor}
          onChange={setHumor}
          lowLabel='Serious'
          highLabel='Playful'
        />
        <SliderRow
          label='Warmth'
          description='How warm and encouraging the tone feels'
          value={warmth}
          onChange={setWarmth}
          lowLabel='Cool & neutral'
          highLabel='Warm & caring'
        />
        <SliderRow
          label='Directness'
          description='How straight-to-the-point the bot is'
          value={directness}
          onChange={setDirectness}
          lowLabel='Soft & indirect'
          highLabel='Direct & blunt'
        />
        <SliderRow
          label='Assertiveness'
          description='How confidently the bot makes statements'
          value={assertiveness}
          onChange={setAssertiveness}
          lowLabel='Tentative'
          highLabel='Confident'
        />
        <SliderRow
          label='Emoji Intensity'
          description='How many emojis appear in replies'
          value={emojiIntensity}
          onChange={setEmojiIntensity}
          lowLabel='Minimal'
          highLabel='Heavy'
        />
      </section>

      {/* ── Language & Vocabulary ─────────────────────────────────────── */}
      <section className='space-y-4'>
        <h3 className='text-sm font-semibold'>Language & Vocabulary</h3>

        <div className='space-y-1.5'>
          <Label className='text-sm'>Vocabulary complexity</Label>
          <Select
            value={vocabulary}
            onValueChange={(v) =>
              setVocabulary(v as 'simple' | 'moderate' | 'advanced')
            }
          >
            <SelectTrigger>
              <SelectValue placeholder='Keep current' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='simple'>Simple — easy, everyday words</SelectItem>
              <SelectItem value='moderate'>Moderate — balanced vocabulary</SelectItem>
              <SelectItem value='advanced'>Advanced — richer, more varied</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='space-y-1.5'>
          <Label className='text-sm'>Primary language</Label>
          <Input
            placeholder='e.g. en, hi, es'
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            maxLength={20}
          />
          <p className='text-xs text-muted-foreground'>
            Use ISO 639-1 code (e.g. en, hi, es, fr)
          </p>
        </div>
      </section>

      {/* ── Add a Sample Reply ────────────────────────────────────────── */}
      <section className='space-y-3'>
        <div>
          <h3 className='text-sm font-semibold'>Add a Sample Reply</h3>
          <p className='text-xs text-muted-foreground mt-0.5'>
            A real message you would send — added to your training pool.
          </p>
        </div>
        <Textarea
          placeholder='Paste a reply you would write to a DM or comment…'
          value={newSample}
          onChange={(e) => setNewSample(e.target.value)}
          rows={3}
          maxLength={500}
        />
        <p className='text-xs text-muted-foreground text-right'>
          {newSample.length}/500
          {newSample.trim().length > 0 && newSample.trim().length < 20 && (
            <span className='text-destructive ml-2'>Min 20 characters</span>
          )}
        </p>
      </section>

      {/* ── Custom Examples ───────────────────────────────────────────── */}
      <section className='space-y-3'>
        <div>
          <h3 className='text-sm font-semibold'>Custom Examples</h3>
          <p className='text-xs text-muted-foreground mt-0.5'>
            Add context + reply pairs to directly shape response style.
          </p>
        </div>

        <div className='space-y-2'>
          <Input
            placeholder='Context (e.g. "Someone asks about pricing")'
            value={exampleContext}
            onChange={(e) => setExampleContext(e.target.value)}
            maxLength={500}
          />
          <Textarea
            placeholder='Your ideal reply…'
            value={exampleReply}
            onChange={(e) => setExampleReply(e.target.value)}
            rows={2}
            maxLength={500}
          />
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={addCustomExample}
            disabled={
              exampleContext.trim().length < 10 || exampleReply.trim().length < 5
            }
          >
            <Plus className='h-3.5 w-3.5 mr-1.5' />
            Add Example
          </Button>
        </div>

        {customExamples.length > 0 && (
          <div className='space-y-2'>
            {customExamples.map((ex, i) => (
              <div
                key={i}
                className='rounded-lg border bg-muted/30 p-3 text-sm space-y-1 relative pr-8'
              >
                <p className='text-xs text-muted-foreground'>{ex.context}</p>
                <p className='font-medium'>&ldquo;{ex.reply}&rdquo;</p>
                <button
                  type='button'
                  onClick={() => removeCustomExample(i)}
                  className='absolute top-2 right-2 text-muted-foreground hover:text-foreground'
                  aria-label='Remove'
                >
                  <X className='h-3.5 w-3.5' />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Custom Negatives ─────────────────────────────────────────── */}
      <section className='space-y-3'>
        <div>
          <h3 className='text-sm font-semibold'>Negative Phrases</h3>
          <p className='text-xs text-muted-foreground mt-0.5'>
            Phrases or styles the bot should avoid.
          </p>
        </div>

        <div className='flex gap-2'>
          <Input
            placeholder='e.g. "No worries at all!" or formal closings'
            value={customNegativeInput}
            onChange={(e) => setCustomNegativeInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addCustomNegative();
              }
            }}
            maxLength={500}
          />
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={addCustomNegative}
            disabled={!customNegativeInput.trim()}
          >
            <Plus className='h-3.5 w-3.5' />
          </Button>
        </div>

        {customNegatives.length > 0 && (
          <div className='flex flex-wrap gap-2'>
            {customNegatives.map((neg, i) => (
              <Badge key={i} variant='secondary' className='gap-1 pr-1'>
                <span className='max-w-[200px] truncate'>{neg}</span>
                <button
                  type='button'
                  onClick={() => removeCustomNegative(i)}
                  className='ml-0.5 hover:text-destructive'
                  aria-label='Remove'
                >
                  <X className='h-3 w-3' />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </section>

      {/* ── Footer actions ────────────────────────────────────────────── */}
      <div className='flex items-center justify-end gap-2 pt-2 border-t'>
        <Button variant='ghost' size='sm' onClick={onClose} disabled={isSaving}>
          Cancel
        </Button>
        <Button size='sm' onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
          ) : (
            <Save className='mr-2 h-4 w-4' />
          )}
          Save Changes
        </Button>
      </div>
    </div>
  );
}
