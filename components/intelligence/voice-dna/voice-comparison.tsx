'use client';

import { Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface VoiceComparisonProps {
  voiceDnaId: string;
}

const GENERIC_REPLY =
  "Thank you for your message! I'd be happy to help. What do you need assistance with?";
const USER_MESSAGE =
  'Hey, I love your content! Can you help me with something?';

export function VoiceComparison({
  voiceDnaId: _voiceDnaId,
}: VoiceComparisonProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-base font-semibold flex items-center gap-2'>
          <Sparkles className='h-4 w-4' />
          Voice Comparison
          <Badge variant='secondary' className='text-xs ml-auto'>
            Coming Soon
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* User message */}
        <div className='flex justify-center'>
          <div className='rounded-xl bg-muted px-4 py-2.5 max-w-[90%] text-center'>
            <p className='text-[10px] text-muted-foreground mb-1'>User says:</p>
            <p className='text-sm'>{USER_MESSAGE}</p>
          </div>
        </div>

        {/* Side-by-side replies */}
        <div className='grid gap-3 sm:grid-cols-2'>
          {/* Without Voice DNA */}
          <div className='rounded-lg border p-4 space-y-2'>
            <p className='text-xs font-medium text-muted-foreground'>
              Without Voice DNA
            </p>
            <div className='rounded-md bg-muted/50 p-3'>
              <p className='text-sm text-muted-foreground'>{GENERIC_REPLY}</p>
            </div>
          </div>

          {/* With Voice DNA */}
          <div className='rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-2'>
            <p className='text-xs font-medium text-primary'>With Voice DNA</p>
            <div className='rounded-md bg-primary/10 p-3 flex items-center justify-center min-h-[60px]'>
              <p className='text-sm text-muted-foreground italic text-center'>
                Live voice comparison coming soon
              </p>
            </div>
          </div>
        </div>

        <p className='text-xs text-center text-muted-foreground'>
          The bot sounds more like you with Voice DNA
        </p>
      </CardContent>
    </Card>
  );
}
