'use client';

import { useState } from 'react';
import {
  Sparkles,
  Send,
  Loader2,
  Clock,
  Zap,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { parseApiError } from '@/lib/http/errors';
import { VoiceDnaApi } from '@/lib/api/voice-dna';

interface TestResult {
  reply: string;
  confidence: number;
  latency_ms: number;
  model: string;
  message: string;
}

interface SampleReplyGeneratorProps {
  voiceDnaId: string;
}

const PRESET_MESSAGES = [
  { label: 'Casual greeting', text: "Hey! What's up?" },
  { label: 'Product question', text: 'What do you guys actually do?' },
  { label: 'Pricing', text: 'How much does it cost?' },
  { label: 'Compliment', text: 'Loving your content! 🔥' },
  { label: 'More info', text: 'Can you tell me more about this?' },
  { label: 'Hinglish', text: 'Yaar kya scene hai? Kuch naya aaya kya?' },
];

function ConfidenceBadge({ confidence }: { confidence: number }) {
  const pct = Math.round(confidence * 100);
  const color =
    pct >= 70
      ? 'bg-green-50 text-green-700 border-green-300'
      : pct >= 50
        ? 'bg-yellow-50 text-yellow-700 border-yellow-300'
        : 'bg-red-50 text-red-700 border-red-300';
  return (
    <Badge variant='outline' className={`text-xs ${color}`}>
      {pct}% confident
    </Badge>
  );
}

export function SampleReplyGenerator({
  voiceDnaId,
}: SampleReplyGeneratorProps) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  /** Total messages sent in this session — reflects backend Redis context depth */
  const [contextDepth, setContextDepth] = useState(0);
  const { toast } = useToast();

  const handleGenerate = async (text?: string) => {
    const input = (text ?? message).trim();
    if (!input) return;

    setIsLoading(true);
    try {
      const response = await VoiceDnaApi.testVoice(voiceDnaId, {
        message: input,
        platform: 'instagram',
      });

      if (response?.data) {
        setResults(prev => [
          { ...response.data, message: input },
          ...prev.slice(0, 4), // keep last 5 visible
        ]);
        setContextDepth(prev => prev + 1);
        if (!text) setMessage('');
      }
    } catch (error) {
      const err = parseApiError(error);
      toast({
        variant: 'destructive',
        title: err.title,
        description: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearContext = async () => {
    setIsClearing(true);
    try {
      await VoiceDnaApi.clearTestContext(voiceDnaId);
      setResults([]);
      setContextDepth(0);
      toast({
        title: 'New conversation started',
        description:
          'Context cleared — the bot will start fresh on your next message.',
      });
    } catch (error) {
      const err = parseApiError(error);
      toast({
        variant: 'destructive',
        title: err.title,
        description: err.message,
      });
    } finally {
      setIsClearing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleGenerate();
    }
  };

  return (
    <div className='space-y-4'>
      {/* Input card */}
      <Card>
        <CardHeader className='pb-3'>
          <div className='flex items-start justify-between gap-2'>
            <div>
              <CardTitle className='text-base font-semibold flex items-center gap-2'>
                <Sparkles className='h-4 w-4' />
                Test Your Voice
              </CardTitle>
              <CardDescription>
                Send test messages to see how your bot replies. Context is
                remembered across messages — just like a real DM thread.
              </CardDescription>
            </div>

            {/* New Conversation button — only visible once context is active */}
            {contextDepth > 0 && (
              <Button
                variant='ghost'
                size='sm'
                onClick={() => void handleClearContext()}
                disabled={isClearing || isLoading}
                className='shrink-0 gap-1.5 text-muted-foreground hover:text-destructive'
              >
                {isClearing ? (
                  <Loader2 className='h-3.5 w-3.5 animate-spin' />
                ) : (
                  <Trash2 className='h-3.5 w-3.5' />
                )}
                New conversation
              </Button>
            )}
          </div>

          {/* Live context depth indicator */}
          {contextDepth > 0 && (
            <div className='flex items-center gap-1.5 mt-1'>
              <div className='h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse' />
              <span className='text-[11px] text-muted-foreground'>
                {contextDepth} message{contextDepth !== 1 ? 's' : ''} in context
              </span>
            </div>
          )}
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* Preset chips */}
          <div className='flex flex-wrap gap-2'>
            {PRESET_MESSAGES.map(preset => (
              <button
                key={preset.label}
                onClick={() => void handleGenerate(preset.text)}
                disabled={isLoading || isClearing}
                className='text-xs px-2.5 py-1 rounded-full border border-border bg-muted/40 hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className='flex gap-2 items-end'>
            <Textarea
              placeholder='Type a test message... (Enter to send)'
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={2}
              className='resize-none flex-1'
              disabled={isLoading || isClearing}
            />
            <Button
              onClick={() => void handleGenerate()}
              disabled={isLoading || isClearing || !message.trim()}
              size='icon'
              className='shrink-0 h-10 w-10'
            >
              {isLoading ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                <Send className='h-4 w-4' />
              )}
            </Button>
          </div>

          {isLoading && (
            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
              <Loader2 className='h-3.5 w-3.5 animate-spin' />
              Generating reply in your voice...
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <div className='space-y-3'>
          {results.map((result, i) => (
            <Card
              key={i}
              className={i === 0 ? 'border-primary/30 bg-primary/5' : ''}
            >
              <CardContent className='pt-4 space-y-3'>
                {/* User message */}
                <div className='rounded-md bg-muted/50 px-3 py-2'>
                  <p className='text-[11px] text-muted-foreground mb-1'>
                    Test message
                  </p>
                  <p className='text-sm'>{result.message}</p>
                </div>

                {/* Bot reply */}
                <div className='rounded-md border px-3 py-2'>
                  <p className='text-[11px] text-muted-foreground mb-1 flex items-center gap-1'>
                    <Sparkles className='h-3 w-3' /> Bot reply
                    {i === 0 && (
                      <Badge
                        className='ml-1 text-[10px] h-4 px-1.5'
                        variant='secondary'
                      >
                        Latest
                      </Badge>
                    )}
                  </p>
                  <p className='text-sm font-medium'>{result.reply}</p>
                </div>

                {/* Meta */}
                <div className='flex items-center gap-2 flex-wrap'>
                  <ConfidenceBadge confidence={result.confidence} />
                  <Badge variant='outline' className='text-[10px] gap-1'>
                    <Clock className='h-2.5 w-2.5' />
                    {result.latency_ms}ms
                  </Badge>
                  <Badge variant='outline' className='text-[10px] gap-1'>
                    <Zap className='h-2.5 w-2.5' />
                    {result.model}
                  </Badge>
                  <button
                    onClick={() => void handleGenerate(result.message)}
                    disabled={isLoading || isClearing}
                    className='ml-auto flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40'
                  >
                    <RotateCcw className='h-3 w-3' />
                    Regenerate
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty state — only shown before first test */}
      {results.length === 0 && !isLoading && (
        <div className='flex flex-col items-center justify-center py-8 text-center text-muted-foreground'>
          <Sparkles className='h-8 w-8 mb-3 opacity-30' />
          <p className='text-sm'>
            Pick a preset or type your own message above to see how your bot
            would reply.
          </p>
        </div>
      )}
    </div>
  );
}
