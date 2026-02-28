'use client';

import { useState } from 'react';
import { Dna, PenTool, SkipForward, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AutoInferWizard } from './auto-infer-wizard';

type VoiceSetupOption = 'auto' | 'manual' | 'skip' | null;

interface VoiceSetupStepProps {
  botId: string;
  socialAccountId: string;
  brandVoiceId?: string;
  onComplete: (voiceDnaId?: string) => void;
  onSkip: () => void;
}

export function VoiceSetupStep({
  botId,
  socialAccountId,
  brandVoiceId,
  onComplete,
  onSkip,
}: VoiceSetupStepProps) {
  const [selectedOption, setSelectedOption] = useState<VoiceSetupOption>(null);

  if (selectedOption === 'auto') {
    return (
      <AutoInferWizard
        botId={botId}
        socialAccountId={socialAccountId}
        brandVoiceId={brandVoiceId}
        source='onboarding'
        onComplete={voiceDnaId => onComplete(voiceDnaId)}
        onSkip={() => setSelectedOption(null)}
      />
    );
  }

  return (
    <div className='space-y-6'>
      <div className='text-center space-y-2'>
        <div className='h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto'>
          <Dna className='h-6 w-6 text-primary' />
        </div>
        <h2 className='text-xl font-semibold'>Set Up Your Voice</h2>
        <p className='text-sm text-muted-foreground max-w-md mx-auto'>
          Your bot can sound just like you. Choose how to set up your voice
          profile.
        </p>
      </div>

      <div className='grid gap-3 sm:grid-cols-3 max-w-2xl mx-auto'>
        {/* Option A: Auto-detect */}
        <Card
          className='cursor-pointer transition-all hover:border-primary/50 hover:shadow-sm'
          onClick={() => setSelectedOption('auto')}
        >
          <CardContent className='pt-6 pb-4 text-center space-y-3'>
            <div className='h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mx-auto'>
              <Sparkles className='h-5 w-5 text-green-600' />
            </div>
            <div>
              <p className='text-sm font-medium'>Auto-detect my voice</p>
              <p className='text-xs text-muted-foreground mt-1'>
                We analyze your posts to learn your style
              </p>
            </div>
            <Button size='sm' className='w-full'>
              Recommended
            </Button>
          </CardContent>
        </Card>

        {/* Option B: Manual */}
        <Card
          className='cursor-pointer transition-all hover:border-primary/50 hover:shadow-sm'
          onClick={() => {
            onComplete(undefined);
          }}
        >
          <CardContent className='pt-6 pb-4 text-center space-y-3'>
            <div className='h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mx-auto'>
              <PenTool className='h-5 w-5 text-blue-600' />
            </div>
            <div>
              <p className='text-sm font-medium'>Configure manually</p>
              <p className='text-xs text-muted-foreground mt-1'>
                Select a brand voice and add examples
              </p>
            </div>
            <Button size='sm' variant='outline' className='w-full'>
              Choose
            </Button>
          </CardContent>
        </Card>

        {/* Option C: Skip */}
        <Card
          className='cursor-pointer transition-all hover:border-primary/50 hover:shadow-sm'
          onClick={onSkip}
        >
          <CardContent className='pt-6 pb-4 text-center space-y-3'>
            <div className='h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto'>
              <SkipForward className='h-5 w-5 text-gray-600' />
            </div>
            <div>
              <p className='text-sm font-medium'>Skip for now</p>
              <p className='text-xs text-muted-foreground mt-1'>
                Use default voice settings
              </p>
            </div>
            <Button size='sm' variant='ghost' className='w-full'>
              Skip
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
