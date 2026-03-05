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
import type {
  AutoInferResult,
  TriggerAutoInferDto,
  VoiceReview,
} from '@/lib/types/voice-dna';
import { useToast } from '@/hooks/use-toast';
import { socketService } from '@/lib/socket/socket.service';
import { VoiceReviewPanel } from './voice-review-panel';

type WizardStep = 'scanning' | 'analyzing' | 'review' | 'error';

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
  socialAccountId,
  brandVoiceId,
  source = 'manual_trigger',
  onComplete,
  onSkip,
}: AutoInferWizardProps) {
  const [step, setStep] = useState<WizardStep>('scanning');
  const [inferResult, setInferResult] = useState<AutoInferResult | null>(null);
  const [voiceReview, setVoiceReview] = useState<VoiceReview | null>(null);
  const [analysisMessageIndex, setAnalysisMessageIndex] = useState(0);
  const [manualSamples, setManualSamples] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);
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
    if (step !== 'analyzing' || !inferResult?.voice_dna_id) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await VoiceDnaApi.getVoiceDna(
          inferResult.voice_dna_id
        );
        if (response?.data) {
          if (response.data.status === 'ready') {
            clearInterval(pollInterval);
            await loadReview(inferResult.voice_dna_id);
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
  }, [step, inferResult?.voice_dna_id]);

  // Socket.io listener for instant status updates
  useEffect(() => {
    const handleStatusChange = (data: {
      voice_dna_id: string;
      status: string;
    }) => {
      if (data.voice_dna_id !== inferResult?.voice_dna_id) return;

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
  }, [inferResult?.voice_dna_id]);

  const triggerAutoInfer = async () => {
    setIsTriggering(true);
    try {
      const dto: TriggerAutoInferDto = {
        bot_id: botId,
        social_account_id: socialAccountId,
        brand_voice_id: brandVoiceId,
        source,
      };
      const response = await VoiceDnaApi.triggerAutoInfer(dto);
      if (response?.data) {
        setInferResult(response.data);

        if (response.data.samples_found.total < 5) {
          setShowManualInput(true);
        }

        if (
          response.data.status === 'analyzing' ||
          response.data.status === 'queued'
        ) {
          setStep('analyzing');
        } else if (response.data.status === 'ready') {
          await loadReview(response.data.voice_dna_id);
        } else if (response.data.status === 'failed') {
          setErrorMessage('Could not start analysis');
          setStep('error');
        }
      }
    } catch {
      setErrorMessage('Failed to start voice detection. Please try again.');
      setStep('error');
    } finally {
      setIsTriggering(false);
    }
  };

  const loadReview = useCallback(
    async (voiceDnaId: string) => {
      try {
        const reviewResponse = await VoiceDnaApi.getVoiceReview(voiceDnaId);
        if (reviewResponse?.data) {
          setVoiceReview(reviewResponse.data);
          setStep('review');
        }
      } catch {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load voice review',
        });
        setStep('review');
      }
    },
    [toast]
  );

  const handleApprove = () => {
    if (inferResult?.voice_dna_id) {
      toast({
        title: 'Voice DNA Activated',
        description: 'Your bot will now reply in your voice!',
      });
      onComplete?.(inferResult.voice_dna_id);
    }
  };

  const handleStartAnalysis = () => {
    setStep('analyzing');
  };

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
                  count={inferResult.samples_found.instagram_posts}
                />
                <SourceRow
                  icon={<MessageSquare className='h-4 w-4' />}
                  label='Manual Replies'
                  count={inferResult.samples_found.manual_replies}
                />

                <div className='flex items-center justify-between pt-2 border-t'>
                  <span className='text-sm font-medium'>Total Samples</span>
                  <Badge
                    variant={
                      inferResult.samples_found.total >= 5
                        ? 'default'
                        : 'destructive'
                    }
                  >
                    {inferResult.samples_found.total} samples
                  </Badge>
                </div>

                {inferResult.samples_found.total < 5 && (
                  <div className='rounded-md bg-yellow-50 dark:bg-yellow-950/20 p-3 flex items-start gap-2'>
                    <AlertTriangle className='h-4 w-4 text-yellow-600 shrink-0 mt-0.5' />
                    <div className='text-sm'>
                      <p className='font-medium text-yellow-700 dark:text-yellow-400'>
                        Not enough samples
                      </p>
                      <p className='text-muted-foreground'>
                        We need at least 5 samples for accurate voice detection.
                        Paste some of your typical replies below.
                      </p>
                    </div>
                  </div>
                )}

                {showManualInput && (
                  <div className='space-y-2'>
                    <Textarea
                      placeholder='Paste a few example replies you would typically send (one per line)...'
                      value={manualSamples}
                      onChange={e => setManualSamples(e.target.value)}
                      rows={4}
                      className='text-sm'
                    />
                  </div>
                )}

                <div className='flex gap-2 pt-2'>
                  <Button
                    onClick={handleStartAnalysis}
                    disabled={
                      inferResult.samples_found.total < 5 &&
                      !manualSamples.trim()
                    }
                  >
                    <Dna className='mr-2 h-4 w-4' />
                    Start Analysis
                  </Button>
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
                Usually takes 30-60 seconds
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
        className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium ${
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
