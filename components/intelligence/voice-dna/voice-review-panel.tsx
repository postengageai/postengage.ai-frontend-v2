'use client';

import { useState } from 'react';
import {
  Globe,
  Palette,
  PenTool,
  Smile,
  Lightbulb,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import type { VoiceReview } from '@/lib/types/voice-dna';
import { VoiceDnaApi } from '@/lib/api/voice-dna';
import { FingerprintRadar } from './fingerprint-radar';

interface VoiceReviewPanelProps {
  review: VoiceReview;
  showFingerprint?: boolean;
  onGenerateNewSample?: () => void;
}

const CONFIDENCE_CONFIG = {
  high: {
    label: 'High Confidence',
    className: 'bg-green-50 text-green-700 border-green-300',
  },
  medium: {
    label: 'Medium Confidence',
    className: 'bg-yellow-50 text-yellow-700 border-yellow-300',
  },
  low: {
    label: 'Low Confidence',
    className: 'bg-red-50 text-red-700 border-red-300',
  },
};

const SUMMARY_CARDS = [
  {
    key: 'language_description' as const,
    icon: Globe,
    label: 'Language',
    color: 'text-blue-500',
  },
  {
    key: 'tone_description' as const,
    icon: Palette,
    label: 'Tone',
    color: 'text-purple-500',
  },
  {
    key: 'style_description' as const,
    icon: PenTool,
    label: 'Style',
    color: 'text-emerald-500',
  },
  {
    key: 'emoji_description' as const,
    icon: Smile,
    label: 'Emoji',
    color: 'text-orange-500',
  },
];

export function VoiceReviewPanel({
  review,
  showFingerprint = true,
}: VoiceReviewPanelProps) {
  const [sampleReply, setSampleReply] = useState(review.sample_generated_reply);
  const [isGenerating, setIsGenerating] = useState(false);
  const [fingerprintOpen, setFingerprintOpen] = useState(false);

  const confidenceConfig = CONFIDENCE_CONFIG[review.confidence_level];

  const handleGenerateSample = async () => {
    setIsGenerating(true);
    try {
      const response = await VoiceDnaApi.generateSampleReply({
        voice_dna_id: review.voice_dna._id,
        user_message:
          'Hey, I love your content! Can you help me with something?',
      });
      if (response?.data) {
        setSampleReply({
          context: response.data.user_message,
          reply: response.data.generated_reply,
        });
      }
    } catch {
      // Keep existing sample on failure
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className='space-y-4'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-semibold'>Your Voice DNA</h3>
        <div className='flex items-center gap-2'>
          <Badge variant='outline' className={confidenceConfig.className}>
            {confidenceConfig.label}
          </Badge>
          <Badge variant='outline'>
            {review.voice_dna.source === 'auto_inferred'
              ? 'Auto-Inferred'
              : review.voice_dna.source === 'hybrid'
                ? 'Hybrid'
                : 'Manual'}
          </Badge>
        </div>
      </div>

      {/* Summary Cards */}
      <div className='grid gap-3 sm:grid-cols-2'>
        {SUMMARY_CARDS.map(({ key, icon: Icon, label, color }) => (
          <Card key={key}>
            <CardContent className='p-4'>
              <div className='flex items-start gap-3'>
                <div
                  className={`h-8 w-8 rounded-md bg-muted flex items-center justify-center shrink-0 ${color}`}
                >
                  <Icon className='h-4 w-4' />
                </div>
                <div>
                  <p className='text-xs font-medium text-muted-foreground'>
                    {label}
                  </p>
                  <p className='text-sm mt-0.5'>{review.summary[key]}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Overall Summary */}
      <Card className='bg-primary/5 border-primary/20'>
        <CardContent className='p-4'>
          <p className='text-sm leading-relaxed'>{review.summary.overall}</p>
        </CardContent>
      </Card>

      {/* Sample Reply Preview */}
      <Card>
        <CardHeader className='pb-3'>
          <div className='flex items-center justify-between'>
            <CardTitle className='text-sm font-medium'>
              How your bot would reply
            </CardTitle>
            <Button
              variant='ghost'
              size='sm'
              onClick={handleGenerateSample}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <Loader2 className='h-3.5 w-3.5 mr-1 animate-spin' />
              ) : (
                <RefreshCw className='h-3.5 w-3.5 mr-1' />
              )}
              New Sample
            </Button>
          </div>
        </CardHeader>
        <CardContent className='space-y-3'>
          {/* User message */}
          <div className='flex justify-end'>
            <div className='rounded-xl rounded-tr-sm bg-muted px-4 py-2.5 max-w-[80%]'>
              <p className='text-sm'>{sampleReply.context}</p>
            </div>
          </div>
          {/* Bot reply */}
          <div className='flex justify-start'>
            <div className='rounded-xl rounded-tl-sm bg-primary/10 px-4 py-2.5 max-w-[80%]'>
              <p className='text-sm'>{sampleReply.reply}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fingerprint (Collapsible) */}
      {showFingerprint && review.voice_dna.fingerprint && (
        <Collapsible open={fingerprintOpen} onOpenChange={setFingerprintOpen}>
          <CollapsibleTrigger asChild>
            <Button variant='outline' className='w-full justify-between'>
              <span className='text-sm'>Fingerprint Details</span>
              <span className='text-xs text-muted-foreground'>
                {fingerprintOpen ? 'Hide' : 'Show'}
              </span>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className='pt-3'>
            <Card>
              <CardContent className='pt-4'>
                <FingerprintRadar
                  fingerprint={review.voice_dna.fingerprint}
                  source={review.voice_dna.source}
                />
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Recommended Adjustments */}
      {review.recommended_adjustments &&
        review.recommended_adjustments.length > 0 && (
          <Card className='border-yellow-200 bg-yellow-50/50 dark:bg-yellow-950/10'>
            <CardContent className='p-4'>
              <div className='flex items-start gap-2'>
                <Lightbulb className='h-4 w-4 text-yellow-600 shrink-0 mt-0.5' />
                <div className='space-y-1'>
                  <p className='text-sm font-medium text-yellow-700 dark:text-yellow-400'>
                    Suggested Adjustments
                  </p>
                  <ul className='text-sm text-muted-foreground space-y-1'>
                    {review.recommended_adjustments.map((adj, i) => (
                      <li key={i} className='flex items-start gap-1.5'>
                        <span className='text-yellow-500 mt-1'>&#8226;</span>
                        {adj}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
