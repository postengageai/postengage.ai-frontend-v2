'use client';

import { Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SampleReplyGeneratorProps {
  voiceDnaId: string;
}

export function SampleReplyGenerator({
  voiceDnaId: _voiceDnaId,
}: SampleReplyGeneratorProps) {
  return (
    <Card>
      <CardHeader className='pb-3'>
        <CardTitle className='text-base font-semibold flex items-center gap-2'>
          <Sparkles className='h-4 w-4' />
          Test Your Voice
          <Badge variant='secondary' className='text-xs ml-auto'>
            Coming Soon
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className='py-8 text-center'>
        <Sparkles className='h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40' />
        <p className='text-sm text-muted-foreground'>
          Voice testing will be available soon. You&apos;ll be able to send a
          test message and see how your bot would reply in your voice.
        </p>
      </CardContent>
    </Card>
  );
}
