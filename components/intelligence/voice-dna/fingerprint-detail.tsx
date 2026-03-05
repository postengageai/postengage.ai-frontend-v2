'use client';

import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { FingerprintRadar } from './fingerprint-radar';
import type {
  VoiceDnaFingerprint,
  VoiceDnaSource,
} from '@/lib/types/voice-dna';

interface FingerprintDetailProps {
  fingerprint: VoiceDnaFingerprint;
  source?: VoiceDnaSource;
}

export function FingerprintDetail({
  fingerprint,
  source = 'user_configured',
}: FingerprintDetailProps) {
  return (
    <div className='space-y-6'>
      {/* Tone Markers — Radar Chart */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className='flex items-center justify-between w-full text-sm font-medium py-2'>
          Tone Markers
          <ChevronDown className='h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180' />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <FingerprintRadar fingerprint={fingerprint} source={source} />
          <div className='grid grid-cols-2 gap-3 mt-4'>
            {Object.entries(fingerprint.tone_markers).map(([key, value]) => (
              <div key={key} className='space-y-1'>
                <div className='flex justify-between text-xs'>
                  <span className='text-muted-foreground capitalize'>
                    {key.replace(/_/g, ' ')}
                  </span>
                  <span className='font-medium'>{value}/10</span>
                </div>
                <Progress value={value * 10} className='h-1.5' />
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Style Metrics */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className='flex items-center justify-between w-full text-sm font-medium py-2'>
          Style Metrics
          <ChevronDown className='h-4 w-4' />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className='space-y-3 pt-2'>
            <div className='flex justify-between items-center text-sm'>
              <span className='text-muted-foreground'>Avg Sentence Length</span>
              <span className='font-medium'>
                {fingerprint.style_metrics.avg_sentence_length.toFixed(1)} words
              </span>
            </div>
            <div className='flex justify-between items-center text-sm'>
              <span className='text-muted-foreground'>Vocabulary</span>
              <Badge variant='outline' className='capitalize'>
                {fingerprint.style_metrics.vocabulary_complexity}
              </Badge>
            </div>
            <div className='flex justify-between items-center text-sm'>
              <span className='text-muted-foreground'>Emoji Frequency</span>
              <div className='flex items-center gap-2'>
                <Progress
                  value={(fingerprint.style_metrics.emoji_frequency / 5) * 100}
                  className='h-1.5 w-16'
                />
                <span className='font-medium text-xs'>
                  {fingerprint.style_metrics.emoji_frequency.toFixed(1)}/msg
                </span>
              </div>
            </div>
            {fingerprint.style_metrics.emoji_patterns.length > 0 && (
              <div className='flex justify-between items-center text-sm'>
                <span className='text-muted-foreground'>Top Emojis</span>
                <span className='text-lg'>
                  {fingerprint.style_metrics.emoji_patterns
                    .slice(0, 8)
                    .join(' ')}
                </span>
              </div>
            )}
            <div className='flex gap-2 flex-wrap'>
              {fingerprint.style_metrics.punctuation_style
                .exclamation_frequency > 0.3 && (
                <Badge variant='secondary' className='text-xs'>
                  Exclamations!
                </Badge>
              )}
              {fingerprint.style_metrics.punctuation_style.ellipsis_usage && (
                <Badge variant='secondary' className='text-xs'>
                  Uses ellipsis...
                </Badge>
              )}
              {fingerprint.style_metrics.punctuation_style.caps_emphasis && (
                <Badge variant='secondary' className='text-xs'>
                  CAPS emphasis
                </Badge>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Language Patterns */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className='flex items-center justify-between w-full text-sm font-medium py-2'>
          Language Patterns
          <ChevronDown className='h-4 w-4' />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className='space-y-3 pt-2'>
            <div className='flex justify-between items-center text-sm'>
              <span className='text-muted-foreground'>Primary Language</span>
              <Badge variant='outline' className='capitalize'>
                {fingerprint.language_patterns.primary_language}
              </Badge>
            </div>
            <div className='flex justify-between items-center text-sm'>
              <span className='text-muted-foreground'>Code Switching</span>
              <div className='flex items-center gap-2'>
                <Progress
                  value={
                    fingerprint.language_patterns.code_switching_frequency * 100
                  }
                  className='h-1.5 w-16'
                />
                <span className='font-medium text-xs'>
                  {(
                    fingerprint.language_patterns.code_switching_frequency * 100
                  ).toFixed(0)}
                  %
                </span>
              </div>
            </div>
            {fingerprint.language_patterns.slang_patterns.length > 0 && (
              <div>
                <span className='text-xs text-muted-foreground'>
                  Slang Patterns
                </span>
                <div className='flex gap-1 flex-wrap mt-1'>
                  {fingerprint.language_patterns.slang_patterns.map(slang => (
                    <Badge key={slang} variant='secondary' className='text-xs'>
                      {slang}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {fingerprint.language_patterns.filler_words.length > 0 && (
              <div>
                <span className='text-xs text-muted-foreground'>
                  Filler Words
                </span>
                <div className='flex gap-1 flex-wrap mt-1'>
                  {fingerprint.language_patterns.filler_words.map(word => (
                    <Badge key={word} variant='outline' className='text-xs'>
                      {word}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Structural Patterns */}
      <Collapsible>
        <CollapsibleTrigger className='flex items-center justify-between w-full text-sm font-medium py-2'>
          Structural Patterns
          <ChevronDown className='h-4 w-4' />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className='space-y-3 pt-2'>
            <div className='flex justify-between items-center text-sm'>
              <span className='text-muted-foreground'>Response Style</span>
              <Badge variant='outline' className='capitalize'>
                {fingerprint.structural_patterns.question_response_style.replace(
                  /_/g,
                  ' '
                )}
              </Badge>
            </div>
            {fingerprint.structural_patterns.starts_with_patterns.length >
              0 && (
              <div>
                <span className='text-xs text-muted-foreground'>
                  Common Openers
                </span>
                <div className='flex gap-1 flex-wrap mt-1'>
                  {fingerprint.structural_patterns.starts_with_patterns.map(
                    (pattern, i) => (
                      <Badge key={i} variant='secondary' className='text-xs'>
                        &ldquo;{pattern}&rdquo;
                      </Badge>
                    )
                  )}
                </div>
              </div>
            )}
            {fingerprint.structural_patterns.ends_with_patterns.length > 0 && (
              <div>
                <span className='text-xs text-muted-foreground'>
                  Common Closers
                </span>
                <div className='flex gap-1 flex-wrap mt-1'>
                  {fingerprint.structural_patterns.ends_with_patterns.map(
                    (pattern, i) => (
                      <Badge key={i} variant='secondary' className='text-xs'>
                        &ldquo;{pattern}&rdquo;
                      </Badge>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
