'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Dna } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { IntelligenceApi } from '@/lib/api/intelligence';
import { VoiceDnaApi } from '@/lib/api/voice-dna';
import { BrandVoice } from '@/lib/types/intelligence';
import type { VoiceDna } from '@/lib/types/voice-dna';
import { BrandVoiceForm } from '@/components/intelligence/brand-voice-form';
import { FingerprintRadar } from '@/components/intelligence/voice-dna/fingerprint-radar';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditBrandVoicePage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [voice, setVoice] = useState<BrandVoice | null>(null);
  const [linkedVoiceDna, setLinkedVoiceDna] = useState<VoiceDna | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const voiceId = params.id as string;

  useEffect(() => {
    if (voiceId) {
      fetchVoice();
    }
  }, [voiceId]);

  const fetchVoice = async () => {
    try {
      const response = await IntelligenceApi.getBrandVoice(voiceId);
      if (response && response.data) {
        setVoice(response.data);
      }
      // Also fetch linked Voice DNA
      try {
        const dnaResponse = await VoiceDnaApi.getVoiceDnaByBrandVoice(voiceId);
        if (dnaResponse?.data) {
          setLinkedVoiceDna(dnaResponse.data);
        }
      } catch {
        // No Voice DNA linked — that's fine
      }
    } catch (_error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load brand voice details',
      });
      router.push('/dashboard/intelligence/brand-voices');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className='p-6 space-y-6'>
        <Skeleton className='h-8 w-32' />
        <Skeleton className='h-[600px] w-full' />
      </div>
    );
  }

  if (!voice) return null;

  return (
    <div className='max-w-6xl mx-auto space-y-8 py-8 px-4 sm:px-6 lg:px-8'>
      <div className='flex items-center gap-4'>
        <Button variant='ghost' size='icon' onClick={() => router.back()}>
          <ArrowLeft className='h-4 w-4' />
        </Button>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>
            Edit Brand Voice
          </h1>
          <p className='text-muted-foreground'>
            Update your AI's personality settings.
          </p>
        </div>
      </div>

      {/* Voice DNA Section */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='flex items-center gap-2'>
                <Dna className='h-5 w-5' />
                Voice DNA
              </CardTitle>
              <CardDescription>
                AI-analyzed writing style fingerprint for this brand voice
              </CardDescription>
            </div>
            {linkedVoiceDna ? (
              <Link
                href={`/dashboard/intelligence/voice-dna/${linkedVoiceDna._id}`}
              >
                <Button variant='outline' size='sm'>
                  View Voice DNA
                </Button>
              </Link>
            ) : (
              <Link
                href={`/dashboard/intelligence/voice-dna?create=true&brand_voice_id=${voiceId}`}
              >
                <Button size='sm'>
                  <Dna className='mr-2 h-4 w-4' />
                  Generate Voice DNA
                </Button>
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {linkedVoiceDna ? (
            <div className='space-y-3'>
              <div className='flex items-center gap-2'>
                <Badge
                  variant={
                    linkedVoiceDna.status === 'ready' ? 'default' : 'secondary'
                  }
                  className={
                    linkedVoiceDna.status === 'ready' ? 'bg-green-600' : ''
                  }
                >
                  {linkedVoiceDna.status}
                </Badge>
                <span className='text-sm text-muted-foreground'>
                  {linkedVoiceDna.few_shot_examples.length} examples
                </span>
              </div>
              {linkedVoiceDna.fingerprint && (
                <FingerprintRadar
                  fingerprint={linkedVoiceDna.fingerprint}
                  source={linkedVoiceDna.source}
                  className='max-w-sm mx-auto'
                />
              )}
            </div>
          ) : (
            <div className='text-center py-6 text-muted-foreground'>
              <Dna className='h-8 w-8 mx-auto mb-2 opacity-40' />
              <p className='text-sm'>
                No Voice DNA generated yet. Create one to teach your bot your
                unique writing style.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <BrandVoiceForm initialData={voice} />
    </div>
  );
}
