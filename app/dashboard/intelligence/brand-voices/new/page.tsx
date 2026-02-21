'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BrandVoiceForm } from '@/components/intelligence/brand-voice-form';

export default function NewBrandVoicePage() {
  const router = useRouter();

  return (
    <div className='max-w-6xl mx-auto space-y-8 py-8 px-4 sm:px-6 lg:px-8'>
      <div className='flex items-center gap-4'>
        <Button variant='ghost' size='icon' onClick={() => router.back()}>
          <ArrowLeft className='h-4 w-4' />
        </Button>
        <div>
          <h2 className='text-3xl font-bold tracking-tight'>
            Create Brand Voice
          </h2>
          <p className='text-muted-foreground'>
            Define a new personality for your AI bots.
          </p>
        </div>
      </div>

      <BrandVoiceForm />
    </div>
  );
}
