'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle,
  XCircle,
  Loader2,
  Sparkles,
  FileText,
  MessageSquare,
  Dna,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { VoiceDnaApi } from '@/lib/api/voice-dna';
import { parseApiError } from '@/lib/http/errors';
import type {
  AutoInferResult,
  TriggerAutoInferDto,
  VoiceReview,
} from '@/lib/types/voice-dna';
import { useToast } from '@/hooks/use-toast';
import { socketService } from '@/lib/socket/socket.service';
import { VoiceReviewPanel } from './voice-review-panel';

type WizardStep = 'scanning' | 'analyzing' | 'review' | 'error';

const MIN_SAMPLES = 5;

interface AutoInferWizardProps {
  botId: string;
  socialAccountId: string;
  brandVoiceId?: string;
  source?: 'onboarding' | 'manual_trigger' | 'settings';
  onComplete?: (voiceDnaId: string) => void;
  onSkip?: () => void;
}

const ANALYSIS_MESSAGES = [
  'Analyzing your writing style...',
  'Detecting tone patterns...',
  'Mapping language preferences...',
  'Curating voice examples...',
  'Building your voice fingerprint...',
];

export function AutoInferWizard({
  botId,
  socialAccountId: _socialAccountId,
  brandVoiceId,
  source: _source = 'manual_trigger',
  onComplete,
  onSkip,
}: AutoInferWizardProps) {
  const [step, setStep] = useState<WizardStep>('scanning');
  const [inferResult, setInferResult] = useState<AutoInferResult | null>(null);
  // voice_dna_id for polling/review — set from auto-infer OR hybrid creation
  const [voiceDnaId, setVoiceDnaId] = useState<string | null>(null);
  const [voiceReview, setVoiceReview] = useState<VoiceReview | null>(null);
  const [analysisMessageIndex, setAnalysisMessageIndex] = useState(0);
  const [manualSamples, setManualSamples] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);
  const [isCreatingHybrid, setIsCreatingHybrid] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { toast } = useToast();

  // Start scanning on mount
  useEffect(() => {
    triggerAutoInfer();
  }, []);

  // Cycle analysis status messages
  useEffect(() => {
    if (step !== 'analyzing') return;
    const interval = setInterval(() => {
      setAnalysisMessageIndex(prev => (prev + 1) % ANALYSIS_MESSAGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [step]);

  // Poll for status when analyzing
  useEffect(() => {
    if (step !== 'analyzing' || !voiceDnaId) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await VoiceDnaApi.getVoiceDna(voiceDnaId);
        if (response?.data) {
          if (response.data.status === 'ready') {
            clearInterval(pollInterval);
            await loadReview(voiceDnaId);
          } else if (response.data.status === 'failed') {
            clearInterval(pollInterval);
            setErrorMessage(
              response.data.analysis_error || 'Analysis failed unexpectedly'
            );
            setStep('error');
          }
        }
      } catch {
        // Silent poll failure
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [step, voiceDnaId]);

  // Socket.io listener for instant status updates
  useEffect(() => {
    const handleStatusChange = (data: {
      voice_dna_id: string;
      status: string;
    }) => {
      if (!voiceDnaId || data.voice_dna_id !== voiceDnaId) return;

      if (data.status === 'ready') {
        loadReview(data.voice_dna_id);
      } else if (data.status === 'failed') {
        setErrorMessage('Analysis failed. Please try again.');
        setStep('error');
      }
    };

    socketService.subscribeToVoiceDnaStatus(handleStatusChange);
    return () => {
      socketService.unsubscribeFromVoiceDnaStatus(handleStatusChange);
    };
  }, [voiceDnaId]);

  const triggerAutoInfer = async () => {
    setIsTriggering(true);
    setInferResult(null);
    setVoiceDnaId(null);
    setShowManualInput(false);
    try {
      const dto: TriggerAutoInferDto = {
        bot_id: botId,
        brand_voice_id: brandVoiceId,
      };
      const response = await VoiceDnaApi.triggerAutoInfer(dto);
      if (response?.data) {
        const result = response.data;
        setInferResult(result);

        if (result.status === 'already_exists' && result.voice_dna_id) {
          // Voice DNA already ready — skip straight to review
          setVoiceDnaId(result.voice_dna_id);
          await loadReview(result.voice_dna_id);
          return;
        }

        if (result.status === 'queued' && result.voice_dna_id) {
          // Analysis queued — show analyzing step and poll for completion
          setVoiceDnaId(result.voice_dna_id);
          setStep('analyzing');
          return;
        }

        if (result.status === 'insufficient_samples') {
          // Not enough auto-collected samples — show manual fallback input
          setShowManualInput(true);
          return;
        }

        // status === 'error'
        setErrorMessage(result.message || 'Could not start analysis');
        setStep('error');
      }
    } catch (err) {
      const parsed = parseApiError(err);
      setErrorMessage(
        parsed.message || 'Failed to start voice detection. Please try again.'
      );
      setStep('error');
    } finally {
      setIsTriggering(false);
    }
  };

  /**
   * Called when auto-infer found insufficient samples and the user has typed manual ones.
   * Creates a Voice DNA with source='hybrid' (combining auto + manual) or 'user_configured'.
   */
  const handleStartHybridAnalysis = async () => {
    if (!brandVoiceId) {
      setErrorMessage(
        'No brand voice configured. Please select a brand voice first.'
      );
      setStep('error');
      return;
    }

    const lines = manualSamples
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length >= 10);

    if (lines.length < 3) {
      toast({
        variant: 'destructive',
        title: 'Not enough samples',
        description: 'Please provide at least 3 samples (10+ characters each).',
      });
      return;
    }

    setIsCreatingHybrid(true);
    try {
      const autoSamplesCount = inferResult?.samples_collected ?? 0;
      // hybrid = auto attempted + manual added; user_configured = only manual
      const source = autoSamplesCount > 0 ? 'hybrid' : 'user_configured';

      const response = await VoiceDnaApi.createVoiceDna({
        brand_voice_id: brandVoiceId,
        raw_samples: lines.map(text => ({ text, source: 'manual_input' })),
        source,
      });

      if (response?.data) {
        setVoiceDnaId(response.data._id);
        setStep('analyzing');
      }
    } catch (err) {
      const parsed = parseApiError(err);
      setErrorMessage(
        parsed.message || 'Failed to create Voice DNA. Please try again.'
      );
      setStep('error');
    } finally {
      setIsCreatingHybrid(false);
    }
  };

  const loadReview = useCallback(
    async (id: string) => {
      try {
        const reviewResponse = await VoiceDnaApi.getVoiceReview(id);
        if (reviewResponse?.data) {
          setVoiceReview(reviewResponse.data);
          setStep('review');
        }
      } catch (error) {
        const err = parseApiError(error);
        toast({
          variant: 'destructive',
          title: err.title,
          description: err.message,
        });
        setStep('review');
      }
    },
    [toast]
  );

  const handleApprove = () => {
    const id = voiceDnaId ?? inferResult?.voice_dna_id;
    if (id) {
      toast({
        title: 'Voice DNA Activated',
        description: 'Your bot will now reply in your voice!',
      });
      onComplete?.(id);
    }
  };

  // Derived counts from correct backend field names
  const totalSamples = inferResult?.samples_collected ?? 0;
  const captionCount = inferResult?.caption_samples ?? 0;
  const replyCount = inferResult?.reply_samples ?? 0;
  const hasEnoughSamples = totalSamples >= MIN_SAMPLES;

  // How many valid manual lines typed so far
  const validManualLines = manualSamples
    .split('\n')
    .filter(l => l.trim().length >= 10).length;

  return (
    <div className='space-y-6'>
      {/* Step indicator */}
      <div className='flex items-center gap-3'>
        <StepIndicator
          step={1}
          label='Scan'
          active={step === 'scanning'}
          completed={step !== 'scanning'}
        />
        <div className='h-px flex-1 bg-border' />
        <StepIndicator
          step={2}
          label='Analyze'
          active={step === 'analyzing'}
          completed={step === 'review'}
        />
        <div className='h-px flex-1 bg-border' />
        <StepIndicator
          step={3}
          label='Review'
          active={step === 'review'}
          completed={false}
        />
      </div>

      {/* Step 1: Scanning */}
      {step === 'scanning' && (
        <Card>
          <CardContent className='pt-6 space-y-4'>
            <div className='flex items-center gap-3 mb-4'>
              <div className='h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center'>
                <Sparkles className='h-5 w-5 text-primary' />
              </div>
              <div>
                <h3 className='text-lg font-semibold'>Scanning Your Content</h3>
                <p className='text-sm text-muted-foreground'>
                  Finding samples of your writing style...
                </p>
              </div>
            </div>

            {isTriggering ? (
              <div className='flex items-center gap-2 py-4'>
                <Loader2 className='h-4 w-4 animate-spin' />
                <span className='text-sm'>Scanning sources...</span>
              </div>
            ) : inferResult ? (
              <div className='space-y-3'>
                <SourceRow
                  icon={<FileText className='h-4 w-4' />}
                  label='Instagram Posts'
                  count={captionCount}
                />
                <SourceRow
                  icon={<MessageSquare className='h-4 w-4' />}
                  label='Manual Replies'
                  count={replyCount}
                />

                <div className='flex items-center justify-between pt-2 border-t'>
                  <span className='text-sm font-medium'>Total Samples</span>
                  <Badge variant={hasEnoughSamples ? 'default' : 'destructive'}>
                    {totalSamples} samples
                  </Badge>
                </div>

                {!hasEnoughSamples && (
                  <div className='rounded-md bg-yellow-50 dark:bg-yellow-950/20 p-3 flex items-start gap-2'>
                    <AlertTriangle className='h-4 w-4 text-yellow-600 shrink-0 mt-0.5' />
                    <div className='text-sm'>
                      <p className='font-medium text-yellow-700 dark:text-yellow-400'>
                        Not enough samples found
                      </p>
                      <p className='text-muted-foreground'>
                        We need at least {MIN_SAMPLES} samples. Paste some of
                        your typical replies below and we&apos;ll build your
                        voice fingerprint from those.
                      </p>
                    </div>
                  </div>
                )}

                {showManualInput && (
                  <div className='space-y-2'>
                    <p className='text-xs text-muted-foreground font-medium'>
                      Add your writing samples — one per line, 10+ characters:
                    </p>
                    <Textarea
                      placeholder={`Hey! Thanks for the love, really means a lot 🙏\nGreat question — pricing starts at $29/mo for the starter plan.\nAbsolutely, we ship worldwide! DM us your address.`}
                      value={manualSamples}
                      onChange={e => setManualSamples(e.target.value)}
                      rows={5}
                      className='text-sm font-mono'
                    />
                    <p className='text-xs text-muted-foreground'>
                      {validManualLines} valid sample
                      {validManualLines !== 1 ? 's' : ''} entered (need at least
                      3)
                    </p>
                  </div>
                )}

                <div className='flex gap-2 pt-2'>
                  {hasEnoughSamples ? (
                    <Button onClick={() => setStep('analyzing')}>
                      <Dna className='mr-2 h-4 w-4' />
                      View Analysis
                    </Button>
                  ) : (
                    <Button
                      onClick={handleStartHybridAnalysis}
                      disabled={isCreatingHybrid || validManualLines < 3}
                    >
                      {isCreatingHybrid ? (
                        <>
                          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Dna className='mr-2 h-4 w-4' />
                          {totalSamples > 0
                            ? 'Analyze Hybrid Samples'
                            : 'Analyze My Samples'}
                        </>
                      )}
                    </Button>
                  )}
                  {onSkip && (
                    <Button variant='ghost' onClick={onSkip}>
                      Skip for now
                    </Button>
                  )}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Analyzing */}
      {step === 'analyzing' && (
        <Card>
          <CardContent className='pt-6'>
            <div className='flex flex-col items-center text-center py-8 space-y-4'>
              <div className='relative'>
                <div className='h-20 w-20 rounded-full border-4 border-primary/20 flex items-center justify-center'>
                  <Dna className='h-10 w-10 text-primary animate-pulse' />
                </div>
                <div className='absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin' />
              </div>

              <div className='space-y-2'>
                <h3 className='text-lg font-semibold'>
                  Building Your Voice DNA
                </h3>
                <p className='text-sm text-muted-foreground max-w-sm'>
                  {ANALYSIS_MESSAGES[analysisMessageIndex]}
                </p>
              </div>

              <p className='text-xs text-muted-foreground'>
                Usually takes 30–60 seconds
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Review */}
      {step === 'review' && (
        <div className='space-y-4'>
          {voiceReview ? (
            <>
              <VoiceReviewPanel review={voiceReview} />
              <div className='flex gap-2'>
                <Button onClick={handleApprove}>
                  <CheckCircle className='mr-2 h-4 w-4' />
                  Looks Good!
                </Button>
                {onSkip && (
                  <Button variant='outline' onClick={onSkip}>
                    I&apos;ll configure manually later
                  </Button>
                )}
              </div>
            </>
          ) : (
            <Card>
              <CardContent className='py-8 text-center'>
                <CheckCircle className='h-10 w-10 text-green-500 mx-auto mb-3' />
                <h3 className='text-lg font-semibold'>Analysis Complete</h3>
                <p className='text-sm text-muted-foreground mb-4'>
                  Your Voice DNA has been generated.
                </p>
                <Button onClick={handleApprove}>
                  <ArrowRight className='mr-2 h-4 w-4' />
                  Continue
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Error State */}
      {step === 'error' && (
        <Card className='border-destructive/50'>
          <CardContent className='pt-6'>
            <div className='flex flex-col items-center text-center py-6 space-y-4'>
              <XCircle className='h-12 w-12 text-destructive' />
              <div className='space-y-2'>
                <h3 className='text-lg font-semibold'>Something went wrong</h3>
                <p className='text-sm text-muted-foreground max-w-sm'>
                  {errorMessage}
                </p>
              </div>
              <div className='flex gap-2'>
                <Button onClick={triggerAutoInfer}>Try Again</Button>
                {onSkip && (
                  <Button variant='outline' onClick={onSkip}>
                    Configure Manually
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// --- Sub-components ---

function StepIndicator({
  step,
  label,
  active,
  completed,
}: {
  step: number;
  label: string;
  active: boolean;
  completed: boolean;
}) {
  return (
    <div className='flex items-center gap-2'>
      <div
        className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
          completed
            ? 'bg-primary text-primary-foreground'
            : active
              ? 'bg-primary/20 text-primary border-2 border-primary'
              : 'bg-muted text-muted-foreground'
        }`}
      >
        {completed ? <CheckCircle className='h-4 w-4' /> : step}
      </div>
      <span
        className={`text-sm ${active ? 'font-medium' : 'text-muted-foreground'}`}
      >
        {label}
      </span>
    </div>
  );
}

function SourceRow({
  icon,
  label,
  count,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
}) {
  return (
    <div className='flex items-center justify-between py-2'>
      <div className='flex items-center gap-2'>
        {count > 0 ? (
          <CheckCircle className='h-4 w-4 text-green-500' />
        ) : (
          <XCircle className='h-4 w-4 text-muted-foreground' />
        )}
        <span className='flex items-center gap-1.5 text-sm'>
          {icon}
          {label}
        </span>
      </div>
      <span className='text-sm text-muted-foreground'>
        {count > 0 ? `Found ${count}` : 'None found'}
      </span>
    </div>
  );
}
