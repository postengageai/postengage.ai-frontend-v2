'use client';

import { Brain } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ContinuousLearningDashboardProps {
  voiceDnaId: string;
}

export function ContinuousLearningDashboard({
  voiceDnaId: _voiceDnaId,
}: ContinuousLearningDashboardProps) {
  return (
    <Card>
      <CardHeader className='pb-3'>
        <CardTitle className='text-base font-semibold flex items-center gap-2'>
          <Brain className='h-4 w-4' />
          Continuous Learning
          <Badge variant='secondary' className='text-xs ml-auto'>
            Coming Soon
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className='py-8 text-center'>
        <Brain className='h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40' />
        <p className='text-sm text-muted-foreground'>
          Continuous learning analytics will be available soon. Your bot is
          already learning from every interaction.
        </p>
      </CardContent>
    </Card>
  );
}
