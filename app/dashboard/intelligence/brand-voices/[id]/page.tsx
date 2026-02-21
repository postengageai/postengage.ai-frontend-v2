'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { IntelligenceApi } from '@/lib/api/intelligence';
import { BrandVoice } from '@/lib/types/intelligence';
import { BrandVoiceForm } from '@/components/intelligence/brand-voice-form';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditBrandVoicePage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [voice, setVoice] = useState<BrandVoice | null>(null);
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

      <BrandVoiceForm initialData={voice} />
    </div>
  );
}
