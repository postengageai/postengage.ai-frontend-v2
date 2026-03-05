'use client';

import { useState } from 'react';
import {
  SlidersHorizontal,
  Plus,
  Trash2,
  Loader2,
  RefreshCw,
  Save,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { VoiceDnaApi } from '@/lib/api/voice-dna';
import type { VoiceDna, AdjustVoiceDto } from '@/lib/types/voice-dna';
import { useToast } from '@/hooks/use-toast';

interface VoiceAdjustmentPanelProps {
  voiceDna: VoiceDna;
  onUpdate?: (updated: VoiceDna) => void;
  onClose?: () => void;
}

interface PendingFewShot {
  context: string;
  reply: string;
}

interface PendingNegative {
  reply: string;
  reason: string;
}

export function VoiceAdjustmentPanel({
  voiceDna,
  onUpdate,
  onClose,
}: VoiceAdjustmentPanelProps) {
  const { toast } = useToast();

  // Tone sliders
  const [humor, setHumor] = useState(
    voiceDna.fingerprint?.tone_markers.humor_level ?? 5
  );
  const [directness, setDirectness] = useState(
    voiceDna.fingerprint?.tone_markers.directness ?? 5
  );
  const [warmth, setWarmth] = useState(
    voiceDna.fingerprint?.tone_markers.warmth ?? 5
  );
  const [assertiveness, setAssertiveness] = useState(
    voiceDna.fingerprint?.tone_markers.assertiveness ?? 5
  );

  // Pending examples
  const [newFewShots, setNewFewShots] = useState<PendingFewShot[]>([]);
  const [newNegatives, setNewNegatives] = useState<PendingNegative[]>([]);

  // New example inputs
  const [fewShotContext, setFewShotContext] = useState('');
  const [fewShotReply, setFewShotReply] = useState('');
  const [negativeReply, setNegativeReply] = useState('');
  const [negativeReason, setNegativeReason] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [isSavingAndReanalyzing, setIsSavingAndReanalyzing] = useState(false);

  const addFewShot = () => {
    if (!fewShotContext.trim() || !fewShotReply.trim()) return;
    setNewFewShots(prev => [
      ...prev,
      { context: fewShotContext, reply: fewShotReply },
    ]);
    setFewShotContext('');
    setFewShotReply('');
  };

  const addNegative = () => {
    if (!negativeReply.trim() || !negativeReason.trim()) return;
    setNewNegatives(prev => [
      ...prev,
      { reply: negativeReply, reason: negativeReason },
    ]);
    setNegativeReply('');
    setNegativeReason('');
  };

  const buildDto = (triggerReanalysis: boolean): AdjustVoiceDto => {
    const dto: AdjustVoiceDto = {
      trigger_reanalysis: triggerReanalysis,
    };

    // Tone adjustments (only if changed)
    const orig = voiceDna.fingerprint?.tone_markers;
    if (orig) {
      const toneChanges: Partial<{
        humor_level: number;
        directness: number;
        warmth: number;
        assertiveness: number;
      }> = {};
      if (humor !== orig.humor_level) toneChanges.humor_level = humor;
      if (directness !== orig.directness) toneChanges.directness = directness;
      if (warmth !== orig.warmth) toneChanges.warmth = warmth;
      if (assertiveness !== orig.assertiveness)
        toneChanges.assertiveness = assertiveness;
      if (Object.keys(toneChanges).length > 0) dto.adjust_tone = toneChanges;
    }

    if (newFewShots.length > 0) dto.add_few_shot = newFewShots;
    if (newNegatives.length > 0) dto.add_negative = newNegatives;

    return dto;
  };

  const handleSave = async (reanalyze: boolean) => {
    if (reanalyze) {
      setIsSavingAndReanalyzing(true);
    } else {
      setIsSaving(true);
    }

    try {
      const dto = buildDto(reanalyze);
      const response = await VoiceDnaApi.adjustVoice(voiceDna._id, dto);
      if (response?.data) {
        onUpdate?.(response.data);
        toast({
          title: reanalyze ? 'Saved & Re-analyzing' : 'Adjustments Saved',
          description: reanalyze
            ? 'Your voice is being re-analyzed with the new settings.'
            : 'Voice adjustments saved successfully.',
        });
        setNewFewShots([]);
        setNewNegatives([]);
      }
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save adjustments',
      });
    } finally {
      setIsSaving(false);
      setIsSavingAndReanalyzing(false);
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-semibold flex items-center gap-2'>
          <SlidersHorizontal className='h-5 w-5' />
          Adjust Voice
        </h3>
      </div>

      {/* Tone Sliders */}
      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='text-sm font-medium'>
            Tone Adjustments
          </CardTitle>
          <CardDescription>Fine-tune how your bot sounds</CardDescription>
        </CardHeader>
        <CardContent className='space-y-5'>
          <ToneSlider label='Humor' value={humor} onChange={setHumor} />
          <ToneSlider
            label='Directness'
            value={directness}
            onChange={setDirectness}
          />
          <ToneSlider label='Warmth' value={warmth} onChange={setWarmth} />
          <ToneSlider
            label='Assertiveness'
            value={assertiveness}
            onChange={setAssertiveness}
          />
        </CardContent>
      </Card>

      {/* Add Few-Shot Examples */}
      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='text-sm font-medium'>Add Examples</CardTitle>
          <CardDescription>Show your bot how you would reply</CardDescription>
        </CardHeader>
        <CardContent className='space-y-3'>
          <div className='space-y-2'>
            <Input
              placeholder='User message (context)...'
              value={fewShotContext}
              onChange={e => setFewShotContext(e.target.value)}
              className='text-sm'
            />
            <Textarea
              placeholder='Your ideal reply...'
              value={fewShotReply}
              onChange={e => setFewShotReply(e.target.value)}
              rows={2}
              className='text-sm'
            />
            <Button
              size='sm'
              variant='outline'
              onClick={addFewShot}
              disabled={!fewShotContext.trim() || !fewShotReply.trim()}
            >
              <Plus className='h-3.5 w-3.5 mr-1' />
              Add Example
            </Button>
          </div>

          {newFewShots.length > 0 && (
            <div className='space-y-2 pt-2'>
              <p className='text-xs text-muted-foreground'>
                Pending ({newFewShots.length}):
              </p>
              {newFewShots.map((fs, i) => (
                <div
                  key={i}
                  className='flex items-start justify-between gap-2 rounded-md border p-2'
                >
                  <div className='flex-1 min-w-0'>
                    <p className='text-[10px] text-muted-foreground'>
                      Context: {fs.context}
                    </p>
                    <p className='text-xs truncate'>Reply: {fs.reply}</p>
                  </div>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-6 w-6 shrink-0'
                    onClick={() =>
                      setNewFewShots(prev => prev.filter((_, idx) => idx !== i))
                    }
                  >
                    <Trash2 className='h-3 w-3' />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Negative Examples */}
      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='text-sm font-medium'>
            Negative Examples
          </CardTitle>
          <CardDescription>What your bot should NOT say</CardDescription>
        </CardHeader>
        <CardContent className='space-y-3'>
          <div className='space-y-2'>
            <Textarea
              placeholder='Reply your bot should avoid...'
              value={negativeReply}
              onChange={e => setNegativeReply(e.target.value)}
              rows={2}
              className='text-sm'
            />
            <Input
              placeholder='Why is this bad? (reason)...'
              value={negativeReason}
              onChange={e => setNegativeReason(e.target.value)}
              className='text-sm'
            />
            <Button
              size='sm'
              variant='outline'
              onClick={addNegative}
              disabled={!negativeReply.trim() || !negativeReason.trim()}
            >
              <Plus className='h-3.5 w-3.5 mr-1' />
              Add Negative
            </Button>
          </div>

          {newNegatives.length > 0 && (
            <div className='space-y-2 pt-2'>
              <p className='text-xs text-muted-foreground'>
                Pending ({newNegatives.length}):
              </p>
              {newNegatives.map((neg, i) => (
                <div
                  key={i}
                  className='flex items-start justify-between gap-2 rounded-md border p-2'
                >
                  <div className='flex-1 min-w-0'>
                    <p className='text-xs truncate'>{neg.reply}</p>
                    <p className='text-[10px] text-muted-foreground'>
                      Reason: {neg.reason}
                    </p>
                  </div>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-6 w-6 shrink-0'
                    onClick={() =>
                      setNewNegatives(prev =>
                        prev.filter((_, idx) => idx !== i)
                      )
                    }
                  >
                    <Trash2 className='h-3 w-3' />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Actions */}
      <div className='flex gap-2'>
        <Button onClick={() => handleSave(false)} disabled={isSaving}>
          {isSaving ? (
            <Loader2 className='h-4 w-4 mr-2 animate-spin' />
          ) : (
            <Save className='h-4 w-4 mr-2' />
          )}
          Save Adjustments
        </Button>
        <Button
          variant='secondary'
          onClick={() => handleSave(true)}
          disabled={isSavingAndReanalyzing}
        >
          {isSavingAndReanalyzing ? (
            <Loader2 className='h-4 w-4 mr-2 animate-spin' />
          ) : (
            <RefreshCw className='h-4 w-4 mr-2' />
          )}
          Save & Re-analyze
        </Button>
        {onClose && (
          <Button variant='ghost' onClick={onClose}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}

// --- Sub-component ---

function ToneSlider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className='space-y-2'>
      <div className='flex items-center justify-between'>
        <Label className='text-sm'>{label}</Label>
        <span className='text-sm font-medium'>{value}/10</span>
      </div>
      <Slider
        min={0}
        max={10}
        step={1}
        value={[value]}
        onValueChange={vals => onChange(vals[0])}
      />
    </div>
  );
}
