'use client';

import { useState, useEffect } from 'react';
import {
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  X,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { IntelligenceApi } from '@/lib/api/intelligence';
import { VoiceDnaApi } from '@/lib/api/voice-dna';
import type { HotLead } from '@/lib/types/intelligence';

const TUNEUP_STORAGE_KEY = 'voice_tuneup_last_done';
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

interface VoiceTuneUpBannerProps {
  voiceDnaId: string;
  voiceDnaCreatedAt: string;
}

type Rating = 'good' | 'bad' | null;

export function VoiceTuneUpBanner({
  voiceDnaId,
  voiceDnaCreatedAt,
}: VoiceTuneUpBannerProps) {
  const [showBanner, setShowBanner] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [leads, setLeads] = useState<HotLead[]>([]);
  const [ratings, setRatings] = useState<Record<string, Rating>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    const createdAt = new Date(voiceDnaCreatedAt).getTime();
    const now = Date.now();
    if (now - createdAt < ONE_WEEK_MS) return;

    try {
      const lastDone = localStorage.getItem(
        `${TUNEUP_STORAGE_KEY}_${voiceDnaId}`
      );
      if (lastDone && now - Number(lastDone) < ONE_WEEK_MS) return;
    } catch {
      // ignore
    }

    setShowBanner(true);
  }, [voiceDnaId, voiceDnaCreatedAt]);

  const handleOpenTuneUp = async () => {
    setIsOpen(true);
    setIsLoading(true);
    setIsDone(false);
    try {
      const res = await IntelligenceApi.getHotLeads({ limit: 8 });
      const withBotReply = (res.data.data ?? []).filter(l => l.bot_reply);
      const sample = withBotReply.slice(0, 6);
      setLeads(sample);
      const initial: Record<string, Rating> = {};
      sample.forEach(l => {
        initial[l.id] = null;
      });
      setRatings(initial);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  };

  const handleRate = (id: string, rating: 'good' | 'bad') => {
    setRatings(prev => ({
      ...prev,
      [id]: prev[id] === rating ? null : rating,
    }));
  };

  const handleSubmit = async () => {
    const ratedLeads = leads.filter(l => ratings[l.id] !== null);
    if (ratedLeads.length === 0) return;

    setIsSubmitting(true);
    try {
      const samples = ratedLeads.map(l => ({
        log_id: l.id,
        rating: ratings[l.id] as 'good' | 'bad',
        original_text: l.bot_reply!,
        context_text: l.message_text,
      }));

      await VoiceDnaApi.rateSamples(voiceDnaId, samples);

      try {
        localStorage.setItem(
          `${TUNEUP_STORAGE_KEY}_${voiceDnaId}`,
          String(Date.now())
        );
      } catch {
        // ignore
      }

      setIsDone(true);
      setTimeout(() => {
        setIsOpen(false);
        setShowBanner(false);
      }, 2000);
    } catch {
      setIsOpen(false);
      setShowBanner(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const ratedCount = Object.values(ratings).filter(v => v !== null).length;

  if (!showBanner) return null;

  return (
    <>
      {/* Banner strip */}
      <div className='flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 px-4 py-3'>
        <div className='flex items-center gap-2.5 min-w-0'>
          <div className='h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/60 flex items-center justify-center shrink-0'>
            <Sparkles className='h-4 w-4 text-amber-600 dark:text-amber-400' />
          </div>
          <div className='min-w-0'>
            <p className='text-sm font-medium text-amber-900 dark:text-amber-200'>
              Time for your weekly Voice Tune-up!
            </p>
            <p className='text-xs text-amber-700 dark:text-amber-400'>
              Rate a few recent bot replies to sharpen your voice over time.
            </p>
          </div>
        </div>
        <div className='flex items-center gap-2 shrink-0'>
          <Button
            size='sm'
            variant='outline'
            className='h-8 text-xs border-amber-300 text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/40'
            onClick={handleOpenTuneUp}
          >
            <Sparkles className='h-3 w-3 mr-1.5' />
            Start Tune-up
          </Button>
          <Button
            variant='ghost'
            size='icon'
            className='h-7 w-7 text-amber-500 hover:text-amber-700 hover:bg-amber-100'
            onClick={() => setShowBanner(false)}
          >
            <X className='h-3.5 w-3.5' />
          </Button>
        </div>
      </div>

      {/* Dialog */}
      <Dialog open={isOpen} onOpenChange={v => !isSubmitting && setIsOpen(v)}>
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <Sparkles className='h-5 w-5 text-amber-500' />
              Weekly Voice Tune-up
            </DialogTitle>
            <DialogDescription>
              Rate these recent bot replies — thumbs up if it sounds like you,
              thumbs down if it does not. Your feedback trains your Voice DNA.
            </DialogDescription>
          </DialogHeader>

          {isDone ? (
            <div className='flex flex-col items-center justify-center py-10 gap-3'>
              <CheckCircle2 className='h-12 w-12 text-green-500' />
              <p className='text-sm font-medium text-foreground'>
                Voice Tune-up complete!
              </p>
              <p className='text-xs text-muted-foreground'>
                Thanks — your feedback is already training your voice.
              </p>
            </div>
          ) : isLoading ? (
            <div className='flex items-center justify-center py-10 gap-2 text-sm text-muted-foreground'>
              <Loader2 className='h-5 w-5 animate-spin' />
              Loading recent replies...
            </div>
          ) : leads.length === 0 ? (
            <div className='py-8 text-center space-y-2'>
              <p className='text-sm text-muted-foreground'>
                No bot replies with hot leads found yet.
              </p>
              <p className='text-xs text-muted-foreground'>
                Come back once your bot has handled some conversations!
              </p>
            </div>
          ) : (
            <>
              <ScrollArea className='max-h-[360px] pr-2'>
                <div className='space-y-3'>
                  {leads.map(lead => {
                    const rating = ratings[lead.id];
                    return (
                      <div
                        key={lead.id}
                        className={cn(
                          'rounded-lg border p-3 space-y-2 transition-colors',
                          rating === 'good'
                            ? 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/30'
                            : rating === 'bad'
                              ? 'border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/30'
                              : 'border-border'
                        )}
                      >
                        <p className='text-xs text-muted-foreground'>
                          <span className='font-medium text-foreground'>
                            User:
                          </span>{' '}
                          {lead.message_text}
                        </p>
                        <p className='text-sm'>
                          <span className='text-xs font-medium text-foreground'>
                            Bot:
                          </span>{' '}
                          {lead.bot_reply}
                        </p>
                        <div className='flex items-center gap-2 pt-0.5'>
                          <button
                            onClick={() => handleRate(lead.id, 'good')}
                            className={cn(
                              'flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium border transition-colors',
                              rating === 'good'
                                ? 'bg-green-600 border-green-600 text-white'
                                : 'border-border hover:border-green-400 hover:text-green-600'
                            )}
                          >
                            <ThumbsUp className='h-3 w-3' />
                            Sounds like me
                          </button>
                          <button
                            onClick={() => handleRate(lead.id, 'bad')}
                            className={cn(
                              'flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium border transition-colors',
                              rating === 'bad'
                                ? 'bg-red-500 border-red-500 text-white'
                                : 'border-border hover:border-red-400 hover:text-red-500'
                            )}
                          >
                            <ThumbsDown className='h-3 w-3' />
                            Off-brand
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>

              <div className='flex items-center justify-between pt-2 border-t'>
                <p className='text-xs text-muted-foreground'>
                  {ratedCount} of {leads.length} rated
                </p>
                <div className='flex gap-2'>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => setIsOpen(false)}
                    disabled={isSubmitting}
                  >
                    Skip
                  </Button>
                  <Button
                    size='sm'
                    onClick={handleSubmit}
                    disabled={ratedCount === 0 || isSubmitting}
                    className='gap-1.5'
                  >
                    {isSubmitting && (
                      <Loader2 className='h-4 w-4 animate-spin' />
                    )}
                    Submit Ratings
                    {ratedCount > 0 && (
                      <Badge variant='secondary' className='ml-0.5 text-xs'>
                        {ratedCount}
                      </Badge>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
