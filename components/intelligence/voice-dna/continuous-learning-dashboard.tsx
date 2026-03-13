'use client';

import { useState } from 'react';
import {
  Brain,
  TrendingUp,
  MessageSquareHeart,
  ThumbsDown,
  ChevronDown,
  ChevronUp,
  Zap,
  Clock,
  CheckCircle,
  PenLine,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type {
  VoiceDna,
  FewShotExample,
  NegativeExample,
} from '@/lib/types/voice-dna';

const REFINEMENT_THRESHOLD = 50;

interface ContinuousLearningDashboardProps {
  voiceDna: VoiceDna;
}

export function ContinuousLearningDashboard({
  voiceDna,
}: ContinuousLearningDashboardProps) {
  const [showGoodExamples, setShowGoodExamples] = useState(false);
  const [showAvoidExamples, setShowAvoidExamples] = useState(false);

  const signalsProcessed = voiceDna.feedback_signals_processed;
  const refinementCount = voiceDna.auto_refinement_count;
  const signalsSinceLast = signalsProcessed % REFINEMENT_THRESHOLD;
  const progressPercent = Math.round(
    (signalsSinceLast / REFINEMENT_THRESHOLD) * 100
  );

  const creatorEditedExamples = voiceDna.few_shot_examples.filter(e =>
    e.tags.includes('creator_edited')
  );
  const aiApprovedExamples = voiceDna.few_shot_examples.filter(e =>
    e.tags.includes('ai_approved')
  );
  const creatorRejectedExamples = voiceDna.negative_examples.filter(e =>
    e.tags.includes('creator_rejected')
  );

  const lastFeedbackAt = voiceDna.last_feedback_at
    ? new Date(voiceDna.last_feedback_at).toLocaleDateString()
    : null;

  return (
    <div className='space-y-6'>
      {/* ── Stats Grid ─────────────────────────────────────────────────── */}
      <div className='grid gap-4 grid-cols-2 md:grid-cols-4'>
        <Card>
          <CardContent className='pt-5 pb-4'>
            <div className='flex items-center gap-2 text-muted-foreground mb-1'>
              <Zap className='h-4 w-4' />
              <span className='text-xs font-medium'>Feedback Signals</span>
            </div>
            <div className='text-2xl font-bold'>{signalsProcessed}</div>
            <p className='text-xs text-muted-foreground mt-1'>
              Total interactions learned from
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-5 pb-4'>
            <div className='flex items-center gap-2 text-muted-foreground mb-1'>
              <TrendingUp className='h-4 w-4' />
              <span className='text-xs font-medium'>Auto-Refinements</span>
            </div>
            <div className='text-2xl font-bold'>{refinementCount}</div>
            <p className='text-xs text-muted-foreground mt-1'>
              Times voice was auto-tuned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-5 pb-4'>
            <div className='flex items-center gap-2 text-muted-foreground mb-1'>
              <MessageSquareHeart className='h-4 w-4' />
              <span className='text-xs font-medium'>Good Examples</span>
            </div>
            <div className='text-2xl font-bold'>
              {voiceDna.few_shot_examples.length}
            </div>
            <p className='text-xs text-muted-foreground mt-1'>
              Replies to mimic
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-5 pb-4'>
            <div className='flex items-center gap-2 text-muted-foreground mb-1'>
              <ThumbsDown className='h-4 w-4' />
              <span className='text-xs font-medium'>Avoid Examples</span>
            </div>
            <div className='text-2xl font-bold'>
              {voiceDna.negative_examples.length}
            </div>
            <p className='text-xs text-muted-foreground mt-1'>
              Replies to avoid
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Progress to Next Refinement ────────────────────────────────── */}
      <Card>
        <CardHeader className='pb-3'>
          <div className='flex items-center justify-between'>
            <CardTitle className='text-base font-semibold flex items-center gap-2'>
              <Brain className='h-4 w-4' />
              Next Auto-Refinement
            </CardTitle>
            <span className='text-sm font-semibold text-primary tabular-nums'>
              {signalsSinceLast} / {REFINEMENT_THRESHOLD}
            </span>
          </div>
          <CardDescription>
            Voice DNA auto-refines every {REFINEMENT_THRESHOLD} feedback signals
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-3'>
          <Progress value={progressPercent} className='h-2.5' />
          <div className='flex items-center justify-between text-xs text-muted-foreground'>
            <span>
              {REFINEMENT_THRESHOLD - signalsSinceLast} signals until next
              refinement
            </span>
            {lastFeedbackAt && (
              <span className='flex items-center gap-1'>
                <Clock className='h-3 w-3' />
                Last signal {lastFeedbackAt}
              </span>
            )}
          </div>
          {refinementCount > 0 && (
            <p className='text-xs text-muted-foreground'>
              ✓ Voice has been auto-refined {refinementCount}{' '}
              {refinementCount === 1 ? 'time' : 'times'} — your bot is getting
              smarter!
            </p>
          )}
        </CardContent>
      </Card>

      {/* ── Learning Signal Breakdown ──────────────────────────────────── */}
      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='text-base font-semibold'>
            Learning Signal Breakdown
          </CardTitle>
          <CardDescription>
            Examples organised by how they were learned
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid gap-3 grid-cols-1 sm:grid-cols-3'>
            <div className='flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-800/50'>
              <PenLine className='h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0' />
              <div className='min-w-0'>
                <div className='text-lg font-bold text-blue-700 dark:text-blue-300'>
                  {creatorEditedExamples.length}
                </div>
                <div className='text-xs text-blue-600/70 dark:text-blue-400/70'>
                  You edited
                </div>
              </div>
            </div>

            <div className='flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200/50 dark:border-green-800/50'>
              <CheckCircle className='h-4 w-4 text-green-600 dark:text-green-400 shrink-0' />
              <div className='min-w-0'>
                <div className='text-lg font-bold text-green-700 dark:text-green-300'>
                  {aiApprovedExamples.length}
                </div>
                <div className='text-xs text-green-600/70 dark:text-green-400/70'>
                  AI approved
                </div>
              </div>
            </div>

            <div className='flex items-center gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200/50 dark:border-red-800/50'>
              <ThumbsDown className='h-4 w-4 text-red-600 dark:text-red-400 shrink-0' />
              <div className='min-w-0'>
                <div className='text-lg font-bold text-red-700 dark:text-red-300'>
                  {creatorRejectedExamples.length}
                </div>
                <div className='text-xs text-red-600/70 dark:text-red-400/70'>
                  You rejected
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Good Reply Examples (collapsible) ─────────────────────────── */}
      {voiceDna.few_shot_examples.length > 0 && (
        <Card>
          <CardHeader className='pb-3'>
            <button
              className='flex items-center justify-between w-full text-left'
              onClick={() => setShowGoodExamples(prev => !prev)}
            >
              <div>
                <CardTitle className='text-base font-semibold flex items-center gap-2'>
                  <MessageSquareHeart className='h-4 w-4 text-green-500' />
                  Good Reply Examples ({voiceDna.few_shot_examples.length})
                </CardTitle>
                <CardDescription className='mt-0.5'>
                  Replies the bot uses as style reference
                </CardDescription>
              </div>
              {showGoodExamples ? (
                <ChevronUp className='h-4 w-4 text-muted-foreground shrink-0' />
              ) : (
                <ChevronDown className='h-4 w-4 text-muted-foreground shrink-0' />
              )}
            </button>
          </CardHeader>
          {showGoodExamples && (
            <CardContent className='space-y-3 pt-0'>
              {voiceDna.few_shot_examples.map((example, index) => (
                <ExampleCard key={index} example={example} variant='good' />
              ))}
            </CardContent>
          )}
        </Card>
      )}

      {/* ── Avoid Examples (collapsible) ──────────────────────────────── */}
      {voiceDna.negative_examples.length > 0 && (
        <Card>
          <CardHeader className='pb-3'>
            <button
              className='flex items-center justify-between w-full text-left'
              onClick={() => setShowAvoidExamples(prev => !prev)}
            >
              <div>
                <CardTitle className='text-base font-semibold flex items-center gap-2'>
                  <ThumbsDown className='h-4 w-4 text-red-500' />
                  Avoid Examples ({voiceDna.negative_examples.length})
                </CardTitle>
                <CardDescription className='mt-0.5'>
                  Reply styles the bot will avoid
                </CardDescription>
              </div>
              {showAvoidExamples ? (
                <ChevronUp className='h-4 w-4 text-muted-foreground shrink-0' />
              ) : (
                <ChevronDown className='h-4 w-4 text-muted-foreground shrink-0' />
              )}
            </button>
          </CardHeader>
          {showAvoidExamples && (
            <CardContent className='space-y-3 pt-0'>
              {voiceDna.negative_examples.map((example, index) => (
                <ExampleCard key={index} example={example} variant='avoid' />
              ))}
            </CardContent>
          )}
        </Card>
      )}

      {/* ── Empty State ────────────────────────────────────────────────── */}
      {signalsProcessed === 0 && (
        <Card className='border-dashed'>
          <CardContent className='py-8 text-center'>
            <Brain className='h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40' />
            <p className='text-sm font-medium mb-1'>No feedback signals yet</p>
            <p className='text-sm text-muted-foreground max-w-sm mx-auto'>
              As your bot replies to DMs, interactions will appear here.
              Approve, edit, or reject replies in the Intelligence Logs to train
              your voice.
            </p>
          </CardContent>
        </Card>
      )}

      {/* ── How it Works ───────────────────────────────────────────────── */}
      <Card className='bg-muted/30'>
        <CardHeader className='pb-3'>
          <CardTitle className='text-sm font-semibold text-muted-foreground uppercase tracking-wide'>
            How Continuous Learning Works
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-2.5'>
          <div className='flex gap-3 text-sm'>
            <PenLine className='h-4 w-4 text-blue-500 shrink-0 mt-0.5' />
            <span>
              <span className='font-medium'>You edit a reply</span> — strongest
              signal. Saved as a high-quality style example the bot will mimic.
            </span>
          </div>
          <div className='flex gap-3 text-sm'>
            <ThumbsDown className='h-4 w-4 text-red-500 shrink-0 mt-0.5' />
            <span>
              <span className='font-medium'>You reject a reply</span> — saved as
              a negative example your bot will actively avoid.
            </span>
          </div>
          <div className='flex gap-3 text-sm'>
            <CheckCircle className='h-4 w-4 text-green-500 shrink-0 mt-0.5' />
            <span>
              <span className='font-medium'>You approve a reply</span> — weak
              positive signal, periodically sampled as a good style example.
            </span>
          </div>
          <div className='flex gap-3 text-sm pt-2 border-t'>
            <TrendingUp className='h-4 w-4 text-primary shrink-0 mt-0.5' />
            <span>
              After every{' '}
              <span className='font-medium'>
                {REFINEMENT_THRESHOLD} signals
              </span>
              , your Voice DNA auto-refines using the latest examples (up to 30
              good, 15 avoid).
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Helper: individual example card ────────────────────────────────────────

interface ExampleCardProps {
  example: FewShotExample | NegativeExample;
  variant: 'good' | 'avoid';
}

function ExampleCard({ example, variant }: ExampleCardProps) {
  return (
    <div
      className={`p-3 rounded-lg border text-sm space-y-2 ${
        variant === 'good'
          ? 'bg-green-50/50 dark:bg-green-950/20 border-green-200/40 dark:border-green-800/40'
          : 'bg-red-50/50 dark:bg-red-950/20 border-red-200/40 dark:border-red-800/40'
      }`}
    >
      {example.context && (
        <p className='text-muted-foreground text-xs'>{example.context}</p>
      )}
      <p className='font-medium'>&ldquo;{example.reply}&rdquo;</p>
      {example.tags.length > 0 && (
        <div className='flex flex-wrap gap-1'>
          {example.tags.map(tag => (
            <Badge
              key={tag}
              variant='secondary'
              className='text-xs px-1.5 py-0'
            >
              {tag.replace(/_/g, ' ')}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
