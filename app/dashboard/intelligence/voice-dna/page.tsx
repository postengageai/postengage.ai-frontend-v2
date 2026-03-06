'use client';

import { useState, useEffect } from 'react';
import { Plus, Dna } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { parseApiError } from '@/lib/http/errors';
import { VoiceDnaCard } from '@/components/intelligence/voice-dna/voice-dna-card';
import { VoiceDnaCreateDialog } from '@/components/intelligence/voice-dna/voice-dna-create-dialog';
import { VoiceDnaApi } from '@/lib/api/voice-dna';
import { IntelligenceApi } from '@/lib/api/intelligence';
import type { VoiceDna } from '@/lib/types/voice-dna';
import type { BrandVoice } from '@/lib/types/intelligence';

export default function VoiceDnaPage() {
  const [voiceDnaList, setVoiceDnaList] = useState<VoiceDna[]>([]);
  const [brandVoices, setBrandVoices] = useState<BrandVoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [voiceDnaResponse, brandVoiceResponse] = await Promise.all([
        VoiceDnaApi.listVoiceDna(),
        IntelligenceApi.getBrandVoices(),
      ]);

      if (voiceDnaResponse?.data) {
        setVoiceDnaList(voiceDnaResponse.data);
      }
      if (brandVoiceResponse?.data) {
        setBrandVoices(brandVoiceResponse.data);
      }
    } catch (_error) {
      const err = parseApiError(_error);
      toast({
        variant: 'destructive',
        title: err.title,
        description: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getBrandVoiceName = (brandVoiceId: string): string => {
    const bv = brandVoices.find(b => b._id === brandVoiceId);
    return bv?.name || 'Unknown Brand Voice';
  };

  const handleCreate = async (dto: {
    brand_voice_id: string;
    raw_samples: { text: string; source: string }[];
  }) => {
    try {
      const response = await VoiceDnaApi.createVoiceDna(dto);
      if (response?.data) {
        setVoiceDnaList(prev => [...prev, response.data]);
        toast({
          title: 'Voice DNA Created',
          description:
            "Analysis has been queued. You'll be notified when it's ready.",
        });
      }
    } catch (_error) {
      const err = parseApiError(_error);
      toast({
        variant: 'destructive',
        title: err.title,
        description: err.message,
      });
      throw new Error('Failed to create');
    }
  };

  const handleReanalyze = async (id: string) => {
    try {
      const response = await VoiceDnaApi.reanalyzeVoiceDna(id);
      if (response?.data) {
        setVoiceDnaList(prev =>
          prev.map(v => (v._id === id ? response.data : v))
        );
        toast({
          title: 'Re-analysis Started',
          description:
            'Voice DNA is being re-analyzed with the latest samples.',
        });
      }
    } catch (_error) {
      const err = parseApiError(_error);
      toast({
        variant: 'destructive',
        title: err.title,
        description: err.message,
      });
    }
  };

  if (isLoading) {
    return (
      <div className='p-6 space-y-6'>
        <div className='flex justify-between items-center'>
          <Skeleton className='h-8 w-40' />
          <Skeleton className='h-10 w-40' />
        </div>
        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className='h-64 w-full' />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className='p-6 space-y-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Voice DNA</h1>
          <p className='text-muted-foreground mt-2'>
            Analyze and manage your unique writing style fingerprints for
            AI-powered responses.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className='mr-2 h-4 w-4' />
          Create Voice DNA
        </Button>
      </div>

      {voiceDnaList.length === 0 ? (
        <div className='text-center py-12 border rounded-lg bg-muted/10'>
          <Dna className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
          <h3 className='text-lg font-medium'>No Voice DNA created yet</h3>
          <p className='text-muted-foreground mt-2 mb-6 max-w-md mx-auto'>
            Create a Voice DNA to teach your bots how to write like you. Provide
            writing samples and we&apos;ll analyze your unique style.
          </p>
          <Button onClick={() => setIsCreateOpen(true)}>
            Create Your First Voice DNA
          </Button>
        </div>
      ) : (
        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {voiceDnaList.map(voiceDna => (
            <VoiceDnaCard
              key={voiceDna._id}
              voiceDna={voiceDna}
              brandVoiceName={getBrandVoiceName(voiceDna.brand_voice_id)}
              onReanalyze={handleReanalyze}
            />
          ))}
        </div>
      )}

      <VoiceDnaCreateDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreate}
      />
    </div>
  );
}
