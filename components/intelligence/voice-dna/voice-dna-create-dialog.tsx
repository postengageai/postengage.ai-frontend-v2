'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
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
import { IntelligenceApi } from '@/lib/api/intelligence';
import type { BrandVoice } from '@/lib/types/intelligence';
import type { CreateVoiceDnaDto } from '@/lib/types/voice-dna';

interface VoiceDnaCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (dto: CreateVoiceDnaDto) => Promise<void>;
  preSelectedBrandVoiceId?: string;
}

const MIN_SAMPLES = 5;

export function VoiceDnaCreateDialog({
  open,
  onOpenChange,
  onSubmit,
  preSelectedBrandVoiceId,
}: VoiceDnaCreateDialogProps) {
  const [brandVoices, setBrandVoices] = useState<BrandVoice[]>([]);
  const [selectedBrandVoiceId, setSelectedBrandVoiceId] = useState(
    preSelectedBrandVoiceId || ''
  );
  const [rawSamplesText, setRawSamplesText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingBrandVoices, setIsLoadingBrandVoices] = useState(false);

  useEffect(() => {
    if (open) {
      fetchBrandVoices();
      if (preSelectedBrandVoiceId) {
        setSelectedBrandVoiceId(preSelectedBrandVoiceId);
      }
    }
  }, [open, preSelectedBrandVoiceId]);

  const fetchBrandVoices = async () => {
    setIsLoadingBrandVoices(true);
    try {
      const response = await IntelligenceApi.getBrandVoices();
      if (response?.data) {
        setBrandVoices(response.data);
      }
    } catch {
      // Silently fail — user can still type brand voice ID
    } finally {
      setIsLoadingBrandVoices(false);
    }
  };

  // Parse samples: split by double newlines or by numbered lines
  const parseSamples = (text: string): string[] => {
    return text
      .split(/\n\s*\n/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
  };

  const samples = parseSamples(rawSamplesText);
  const sampleCount = samples.length;
  const sampleProgress = Math.min((sampleCount / MIN_SAMPLES) * 100, 100);
  const hasEnoughSamples = sampleCount >= MIN_SAMPLES;

  const handleSubmit = async () => {
    if (!selectedBrandVoiceId || !hasEnoughSamples) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        brand_voice_id: selectedBrandVoiceId,
        raw_samples: samples.map(text => ({
          text,
          source: 'manual_input',
        })),
      });
      // Reset form
      setRawSamplesText('');
      setSelectedBrandVoiceId('');
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>Create Voice DNA</DialogTitle>
          <DialogDescription>
            Select a brand voice and provide writing samples. We&apos;ll analyze
            your style to generate a unique voice fingerprint.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-5 py-4'>
          {/* Brand Voice Selection */}
          <div className='space-y-2'>
            <Label>Brand Voice</Label>
            <Select
              value={selectedBrandVoiceId}
              onValueChange={setSelectedBrandVoiceId}
              disabled={isLoadingBrandVoices}
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

          {/* Raw Samples */}
          <div className='space-y-2'>
            <Label>Writing Samples</Label>
            <p className='text-xs text-muted-foreground'>
              Paste your writing samples below. Separate each sample with a
              blank line.
            </p>
            <Textarea
              placeholder={`Sample 1: Hey bro! Thanks for checking out our page...\n\nSample 2: Great question! The pricing starts at...\n\nSample 3: Appreciate the love! We ship worldwide...`}
              value={rawSamplesText}
              onChange={e => setRawSamplesText(e.target.value)}
              rows={8}
              className='font-mono text-sm'
            />
          </div>

          {/* Sample Counter */}
          <div className='space-y-2'>
            <div className='flex justify-between text-sm'>
              <span className='text-muted-foreground'>Samples detected</span>
              <span
                className={
                  hasEnoughSamples
                    ? 'text-green-600 font-medium'
                    : 'text-orange-500 font-medium'
                }
              >
                {sampleCount} / {MIN_SAMPLES} minimum
              </span>
            </div>
            <Progress
              value={sampleProgress}
              className={`h-2 ${hasEnoughSamples ? '[&>div]:bg-green-500' : '[&>div]:bg-orange-400'}`}
            />
            {!hasEnoughSamples && sampleCount > 0 && (
              <p className='text-xs text-orange-500'>
                Add {MIN_SAMPLES - sampleCount} more sample
                {MIN_SAMPLES - sampleCount > 1 ? 's' : ''} for best results
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              !selectedBrandVoiceId || !hasEnoughSamples || isSubmitting
            }
          >
            {isSubmitting ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Creating...
              </>
            ) : (
              'Create & Analyze'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
