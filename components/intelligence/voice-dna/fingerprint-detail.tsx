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
            <div className='space-y-1'>
              <div className='flex justify-between text-xs'>
                <span className='text-muted-foreground capitalize'>Humor</span>
                <span className='font-medium'>
                  {fingerprint.humor_level}/10
                </span>
              </div>
              <Progress
                value={fingerprint.humor_level * 10}
                className='h-1.5'
              />
            </div>
            <div className='space-y-1'>
              <div className='flex justify-between text-xs'>
                <span className='text-muted-foreground capitalize'>
                  Directness
                </span>
                <span className='font-medium'>{fingerprint.directness}/10</span>
              </div>
              <Progress value={fingerprint.directness * 10} className='h-1.5' />
            </div>
            <div className='space-y-1'>
              <div className='flex justify-between text-xs'>
                <span className='text-muted-foreground capitalize'>Warmth</span>
                <span className='font-medium'>{fingerprint.warmth}/10</span>
              </div>
              <Progress value={fingerprint.warmth * 10} className='h-1.5' />
            </div>
            <div className='space-y-1'>
              <div className='flex justify-between text-xs'>
                <span className='text-muted-foreground capitalize'>
                  Assertiveness
                </span>
                <span className='font-medium'>
                  {fingerprint.assertiveness}/10
                </span>
              </div>
              <Progress
                value={fingerprint.assertiveness * 10}
                className='h-1.5'
              />
            </div>
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
                {fingerprint.avg_sentence_length.toFixed(1)} words
              </span>
            </div>
            <div className='flex justify-between items-center text-sm'>
              <span className='text-muted-foreground'>Vocabulary</span>
              <Badge variant='outline' className='capitalize'>
                {fingerprint.vocabulary_complexity}
              </Badge>
            </div>
            <div className='flex justify-between items-center text-sm'>
              <span className='text-muted-foreground'>Emoji Frequency</span>
              <div className='flex items-center gap-2'>
                <Progress
                  value={(fingerprint.emoji_frequency / 5) * 100}
                  className='h-1.5 w-16'
                />
                <span className='font-medium text-xs'>
                  {fingerprint.emoji_frequency.toFixed(1)}/msg
                </span>
              </div>
            </div>
            {fingerprint.emoji_patterns.length > 0 && (
              <div className='flex justify-between items-center text-sm'>
                <span className='text-muted-foreground'>Top Emojis</span>
                <span className='text-lg'>
                  {fingerprint.emoji_patterns.slice(0, 8).join(' ')}
                </span>
              </div>
            )}
            <div className='flex gap-2 flex-wrap'>
              {fingerprint.punctuation_style.uses_exclamation && (
                <Badge variant='secondary' className='text-xs'>
                  Exclamations!
                </Badge>
              )}
              {fingerprint.punctuation_style.uses_ellipsis && (
                <Badge variant='secondary' className='text-xs'>
                  Uses ellipsis...
                </Badge>
              )}
              {fingerprint.punctuation_style.uses_caps_for_emphasis && (
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
                {fingerprint.primary_language}
              </Badge>
            </div>
            <div className='flex justify-between items-center text-sm'>
              <span className='text-muted-foreground'>Code Switching</span>
              <div className='flex items-center gap-2'>
                <Progress
                  value={fingerprint.code_switching_frequency * 100}
                  className='h-1.5 w-16'
                />
                <span className='font-medium text-xs'>
                  {(fingerprint.code_switching_frequency * 100).toFixed(0)}%
                </span>
              </div>
            </div>
            {fingerprint.slang_patterns.length > 0 && (
              <div>
                <span className='text-xs text-muted-foreground'>
                  Slang Patterns
                </span>
                <div className='flex gap-1 flex-wrap mt-1'>
                  {fingerprint.slang_patterns.map(slang => (
                    <Badge key={slang} variant='secondary' className='text-xs'>
                      {slang}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {fingerprint.filler_words.length > 0 && (
              <div>
                <span className='text-xs text-muted-foreground'>
                  Filler Words
                </span>
                <div className='flex gap-1 flex-wrap mt-1'>
                  {fingerprint.filler_words.map(word => (
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
                {fingerprint.question_response_style.replace(/_/g, ' ')}
              </Badge>
            </div>
            {fingerprint.starts_with_patterns.length > 0 && (
              <div>
                <span className='text-xs text-muted-foreground'>
                  Common Openers
                </span>
                <div className='flex gap-1 flex-wrap mt-1'>
                  {fingerprint.starts_with_patterns.map((pattern, i) => (
                    <Badge key={i} variant='secondary' className='text-xs'>
                      &ldquo;{pattern}&rdquo;
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {fingerprint.ends_with_patterns.length > 0 && (
              <div>
                <span className='text-xs text-muted-foreground'>
                  Common Closers
                </span>
                <div className='flex gap-1 flex-wrap mt-1'>
                  {fingerprint.ends_with_patterns.map((pattern, i) => (
                    <Badge key={i} variant='secondary' className='text-xs'>
                      &ldquo;{pattern}&rdquo;
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
