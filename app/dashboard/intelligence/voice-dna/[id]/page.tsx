'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  RefreshCw,
  Trash,
  Loader2,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { VoiceDnaApi } from '@/lib/api/voice-dna';
import { IntelligenceApi } from '@/lib/api/intelligence';
import { FingerprintRadar } from '@/components/intelligence/voice-dna/fingerprint-radar';
import { FingerprintDetail } from '@/components/intelligence/voice-dna/fingerprint-detail';
import { FewShotManager } from '@/components/intelligence/voice-dna/few-shot-manager';
import { NegativeExamples } from '@/components/intelligence/voice-dna/negative-examples';
import type { VoiceDna, VoiceDnaStatus } from '@/lib/types/voice-dna';

const STATUS_CONFIG: Record<
  VoiceDnaStatus,
  {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  }
> = {
  pending: { label: 'Pending', variant: 'outline' },
  analyzing: { label: 'Analyzing', variant: 'secondary' },
  ready: { label: 'Ready', variant: 'default' },
  failed: { label: 'Failed', variant: 'destructive' },
  stale: { label: 'Stale', variant: 'outline' },
};

const SOURCE_LABELS: Record<string, string> = {
  user_configured: 'Manual',
  auto_inferred: 'Auto-Inferred',
  hybrid: 'Hybrid',
};

export default function VoiceDnaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const id = params.id as string;

  const [voiceDna, setVoiceDna] = useState<VoiceDna | null>(null);
  const [brandVoiceName, setBrandVoiceName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isReanalyzing, setIsReanalyzing] = useState(false);

  useEffect(() => {
    fetchVoiceDna();
  }, [id]);

  // Poll for status updates when analyzing
  useEffect(() => {
    if (voiceDna?.status === 'analyzing' || voiceDna?.status === 'pending') {
      const interval = setInterval(async () => {
        try {
          const response = await VoiceDnaApi.getVoiceDna(id);
          if (response?.data) {
            setVoiceDna(response.data);
            if (
              response.data.status !== 'analyzing' &&
              response.data.status !== 'pending'
            ) {
              clearInterval(interval);
              if (response.data.status === 'ready') {
                toast({
                  title: 'Analysis Complete',
                  description: 'Your Voice DNA is ready!',
                });
              }
            }
          }
        } catch {
          // Silently fail on poll
        }
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [voiceDna?.status, id, toast]);

  const fetchVoiceDna = async () => {
    try {
      const response = await VoiceDnaApi.getVoiceDna(id);
      if (response?.data) {
        setVoiceDna(response.data);
        // Fetch brand voice name
        try {
          const bvResponse = await IntelligenceApi.getBrandVoice(
            response.data.brand_voice_id
          );
          if (bvResponse?.data) {
            setBrandVoiceName(bvResponse.data.name);
          }
        } catch {
          // Brand voice might not exist
        }
      }
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load Voice DNA',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReanalyze = async () => {
    setIsReanalyzing(true);
    try {
      const response = await VoiceDnaApi.reanalyzeVoiceDna(id);
      if (response?.data) {
        setVoiceDna(response.data);
        toast({
          title: 'Re-analysis Started',
          description:
            'Analyzing your writing style with the latest samples...',
        });
      }
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to trigger re-analysis',
      });
    } finally {
      setIsReanalyzing(false);
    }
  };

  const handleDelete = async () => {
    try {
      await VoiceDnaApi.deleteVoiceDna(id);
      toast({ title: 'Deleted', description: 'Voice DNA has been removed.' });
      router.push('/dashboard/intelligence/voice-dna');
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete Voice DNA',
      });
    }
  };

  const handleAddFewShot = async (dto: {
    context: string;
    reply: string;
    tags?: string[];
  }) => {
    const response = await VoiceDnaApi.addFewShotExample(id, dto);
    if (response?.data) setVoiceDna(response.data);
  };

  const handleDeleteFewShot = async (index: number) => {
    const response = await VoiceDnaApi.deleteFewShotExample(id, index);
    if (response?.data) setVoiceDna(response.data);
  };

  const handleAddNegative = async (dto: {
    reply: string;
    reason: string;
    tags?: string[];
  }) => {
    const response = await VoiceDnaApi.addNegativeExample(id, dto);
    if (response?.data) setVoiceDna(response.data);
  };

  const handleDeleteNegative = async (index: number) => {
    const response = await VoiceDnaApi.deleteNegativeExample(id, index);
    if (response?.data) setVoiceDna(response.data);
  };

  if (isLoading) {
    return (
      <div className='p-6 space-y-6'>
        <Skeleton className='h-8 w-64' />
        <Skeleton className='h-4 w-48' />
        <div className='grid gap-6 md:grid-cols-2'>
          <Skeleton className='h-80' />
          <Skeleton className='h-80' />
        </div>
      </div>
    );
  }

  if (!voiceDna) {
    return (
      <div className='p-6'>
        <div className='text-center py-12'>
          <AlertTriangle className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
          <h3 className='text-lg font-medium'>Voice DNA not found</h3>
          <p className='text-muted-foreground mt-2 mb-4'>
            This Voice DNA record may have been deleted.
          </p>
          <Link href='/dashboard/intelligence/voice-dna'>
            <Button variant='outline'>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to Voice DNA
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[voiceDna.status];
  const isAnalyzing =
    voiceDna.status === 'analyzing' || voiceDna.status === 'pending';

  return (
    <div className='p-6 space-y-6'>
      {/* Breadcrumb */}
      <div className='flex items-center gap-2 text-sm text-muted-foreground'>
        <Link
          href='/dashboard/intelligence/voice-dna'
          className='hover:text-foreground transition-colors'
        >
          Voice DNA
        </Link>
        <ChevronRight className='h-3.5 w-3.5' />
        <span className='text-foreground'>{brandVoiceName || 'Details'}</span>
      </div>

      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <div className='space-y-1'>
          <h1 className='text-3xl font-bold tracking-tight'>
            {brandVoiceName || 'Voice DNA'}
          </h1>
          <div className='flex items-center gap-2'>
            <Badge variant={statusConfig.variant}>
              {isAnalyzing && <Loader2 className='mr-1 h-3 w-3 animate-spin' />}
              {statusConfig.label}
            </Badge>
            <Badge variant='outline'>{SOURCE_LABELS[voiceDna.source]}</Badge>
            <span className='text-sm text-muted-foreground'>
              Updated {new Date(voiceDna.updated_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          {/* Advanced Toggle */}
          <div className='flex items-center gap-2 mr-4'>
            <Switch
              id='advanced-mode'
              checked={showAdvanced}
              onCheckedChange={setShowAdvanced}
            />
            <Label htmlFor='advanced-mode' className='text-sm'>
              Advanced
            </Label>
          </div>

          <Button
            variant='outline'
            onClick={handleReanalyze}
            disabled={isReanalyzing || isAnalyzing}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isReanalyzing ? 'animate-spin' : ''}`}
            />
            Re-analyze
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant='destructive' size='icon'>
                <Trash className='h-4 w-4' />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Voice DNA</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this Voice DNA and all its
                  examples. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Status-specific banners */}
      {voiceDna.status === 'failed' && (
        <Card className='border-destructive/50 bg-destructive/5'>
          <CardContent className='flex items-center gap-3 py-4'>
            <AlertTriangle className='h-5 w-5 text-destructive shrink-0' />
            <div className='flex-1'>
              <p className='text-sm font-medium text-destructive'>
                Analysis Failed
              </p>
              <p className='text-sm text-muted-foreground'>
                {voiceDna.analysis_error ||
                  'An unknown error occurred during analysis.'}
              </p>
            </div>
            <Button
              size='sm'
              onClick={handleReanalyze}
              disabled={isReanalyzing}
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {voiceDna.status === 'stale' && (
        <Card className='border-orange-300/50 bg-orange-50/50 dark:bg-orange-950/20'>
          <CardContent className='flex items-center gap-3 py-4'>
            <AlertTriangle className='h-5 w-5 text-orange-500 shrink-0' />
            <div className='flex-1'>
              <p className='text-sm font-medium text-orange-700 dark:text-orange-400'>
                Voice DNA is Stale
              </p>
              <p className='text-sm text-muted-foreground'>
                New samples are available. Re-analyze to update your voice
                fingerprint.
              </p>
            </div>
            <Button
              size='sm'
              onClick={handleReanalyze}
              disabled={isReanalyzing}
            >
              Update
            </Button>
          </CardContent>
        </Card>
      )}

      {isAnalyzing && (
        <Card>
          <CardContent className='flex items-center gap-3 py-6'>
            <Loader2 className='h-6 w-6 animate-spin text-primary shrink-0' />
            <div>
              <p className='text-sm font-medium'>Analysis in Progress</p>
              <p className='text-sm text-muted-foreground'>
                Analyzing your writing style... This usually takes 30-60
                seconds.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content — Tabs */}
      {voiceDna.status === 'ready' && voiceDna.fingerprint && (
        <Tabs defaultValue='overview' className='space-y-6'>
          <TabsList>
            <TabsTrigger value='overview'>Overview</TabsTrigger>
            <TabsTrigger value='examples'>
              Examples ({voiceDna.few_shot_examples.length})
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value='overview' className='space-y-6'>
            <div className='grid gap-6 md:grid-cols-2'>
              {/* Radar Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg'>Tone Profile</CardTitle>
                  <CardDescription>
                    Your voice personality across 4 dimensions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FingerprintRadar
                    fingerprint={voiceDna.fingerprint}
                    source={voiceDna.source}
                  />
                </CardContent>
              </Card>

              {/* Quick Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg'>Voice Summary</CardTitle>
                  <CardDescription>
                    Key characteristics of your writing style
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='flex justify-between items-center text-sm'>
                    <span className='text-muted-foreground'>Language</span>
                    <Badge variant='outline' className='capitalize'>
                      {voiceDna.fingerprint.language_patterns.primary_language}
                    </Badge>
                  </div>
                  <div className='flex justify-between items-center text-sm'>
                    <span className='text-muted-foreground'>Vocabulary</span>
                    <Badge variant='outline' className='capitalize'>
                      {voiceDna.fingerprint.style_metrics.vocabulary_complexity}
                    </Badge>
                  </div>
                  <div className='flex justify-between items-center text-sm'>
                    <span className='text-muted-foreground'>Avg Sentence</span>
                    <span className='font-medium'>
                      {voiceDna.fingerprint.style_metrics.avg_sentence_length.toFixed(
                        1
                      )}{' '}
                      words
                    </span>
                  </div>
                  <div className='flex justify-between items-center text-sm'>
                    <span className='text-muted-foreground'>
                      Response Style
                    </span>
                    <Badge variant='secondary' className='capitalize text-xs'>
                      {voiceDna.fingerprint.structural_patterns.question_response_style.replace(
                        /_/g,
                        ' '
                      )}
                    </Badge>
                  </div>
                  {voiceDna.fingerprint.style_metrics.emoji_patterns.length >
                    0 && (
                    <div className='flex justify-between items-center text-sm'>
                      <span className='text-muted-foreground'>Top Emojis</span>
                      <span className='text-lg'>
                        {voiceDna.fingerprint.style_metrics.emoji_patterns
                          .slice(0, 5)
                          .join(' ')}
                      </span>
                    </div>
                  )}
                  <div className='flex justify-between items-center text-sm'>
                    <span className='text-muted-foreground'>
                      Few-Shot Examples
                    </span>
                    <span className='font-medium'>
                      {voiceDna.few_shot_examples.length}
                    </span>
                  </div>
                  <div className='flex justify-between items-center text-sm'>
                    <span className='text-muted-foreground'>
                      Feedback Processed
                    </span>
                    <span className='font-medium'>
                      {voiceDna.feedback_signals_processed}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Advanced: Full Fingerprint Detail */}
            {showAdvanced && (
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg'>
                    Full Fingerprint Breakdown
                  </CardTitle>
                  <CardDescription>
                    Detailed analysis of your writing patterns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FingerprintDetail
                    fingerprint={voiceDna.fingerprint}
                    source={voiceDna.source}
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Examples Tab */}
          <TabsContent value='examples' className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>Few-Shot Examples</CardTitle>
                <CardDescription>
                  Teach your bot your style with real conversation examples
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FewShotManager
                  examples={voiceDna.few_shot_examples}
                  onAdd={handleAddFewShot}
                  onDelete={handleDeleteFewShot}
                />
              </CardContent>
            </Card>

            {/* Advanced: Negative Examples */}
            {showAdvanced && (
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg'>Negative Examples</CardTitle>
                  <CardDescription>
                    Define what your bot should NOT sound like
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <NegativeExamples
                    examples={voiceDna.negative_examples}
                    onAdd={handleAddNegative}
                    onDelete={handleDeleteNegative}
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Show examples tab even when not ready (for pending/failed/stale) */}
      {voiceDna.status !== 'ready' && voiceDna.few_shot_examples.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Few-Shot Examples</CardTitle>
          </CardHeader>
          <CardContent>
            <FewShotManager
              examples={voiceDna.few_shot_examples}
              onAdd={handleAddFewShot}
              onDelete={handleDeleteFewShot}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
