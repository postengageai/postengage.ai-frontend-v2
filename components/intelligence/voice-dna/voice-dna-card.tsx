'use client';

import Link from 'next/link';
import { MoreHorizontal, RefreshCw, Trash, Eye } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import type {
  VoiceDna,
  VoiceDnaStatus,
  VoiceDnaSource,
} from '@/lib/types/voice-dna';

interface VoiceDnaCardProps {
  voiceDna: VoiceDna;
  brandVoiceName?: string;
  onReanalyze?: (id: string) => void;
  onDelete?: (id: string) => void;
}

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

const SOURCE_LABELS: Record<VoiceDnaSource, string> = {
  user_configured: 'Manual',
  auto_inferred: 'Auto-Inferred',
  hybrid: 'Hybrid',
};

export function VoiceDnaCard({
  voiceDna,
  brandVoiceName,
  onReanalyze,
  onDelete,
}: VoiceDnaCardProps) {
  const statusConfig = STATUS_CONFIG[voiceDna.status];
  const toneMarkers = voiceDna.fingerprint?.tone_markers;

  return (
    <Card className='group hover:shadow-md transition-shadow'>
      <CardHeader className='flex flex-row items-start justify-between space-y-0 pb-2'>
        <div className='space-y-1'>
          <CardTitle className='text-lg'>
            {brandVoiceName || 'Voice DNA'}
          </CardTitle>
          <CardDescription className='flex items-center gap-2'>
            <Badge variant={statusConfig.variant} className='text-xs'>
              {voiceDna.status === 'analyzing' && (
                <RefreshCw className='mr-1 h-3 w-3 animate-spin' />
              )}
              {statusConfig.label}
            </Badge>
            <Badge variant='outline' className='text-xs'>
              {SOURCE_LABELS[voiceDna.source]}
            </Badge>
          </CardDescription>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/intelligence/voice-dna/${voiceDna._id}`}>
                <Eye className='mr-2 h-4 w-4' /> View Details
              </Link>
            </DropdownMenuItem>
            {voiceDna.status === 'ready' && onReanalyze && (
              <DropdownMenuItem onClick={() => onReanalyze(voiceDna._id)}>
                <RefreshCw className='mr-2 h-4 w-4' /> Re-analyze
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem
                className='text-destructive focus:text-destructive'
                onClick={() => onDelete(voiceDna._id)}
              >
                <Trash className='mr-2 h-4 w-4' /> Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className='space-y-4 mt-2'>
          {/* Language */}
          {voiceDna.fingerprint && (
            <div className='flex justify-between items-center text-sm'>
              <span className='text-muted-foreground'>Language</span>
              <span className='font-medium capitalize'>
                {voiceDna.fingerprint.language_patterns.primary_language}
              </span>
            </div>
          )}

          {/* Tone Markers as mini progress bars */}
          {toneMarkers && (
            <div className='space-y-2'>
              <span className='text-xs text-muted-foreground'>
                Tone Profile
              </span>
              <div className='grid grid-cols-2 gap-2'>
                {Object.entries(toneMarkers).map(([key, value]) => (
                  <div key={key} className='space-y-1'>
                    <div className='flex justify-between text-xs'>
                      <span className='text-muted-foreground capitalize'>
                        {key.replace('_', ' ')}
                      </span>
                      <span>{value}/10</span>
                    </div>
                    <Progress value={value * 10} className='h-1.5' />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Emoji preview */}
          {voiceDna.fingerprint?.style_metrics.emoji_patterns &&
            voiceDna.fingerprint.style_metrics.emoji_patterns.length > 0 && (
              <div className='flex justify-between items-center text-sm'>
                <span className='text-muted-foreground'>Top Emojis</span>
                <span className='text-lg'>
                  {voiceDna.fingerprint.style_metrics.emoji_patterns
                    .slice(0, 5)
                    .join(' ')}
                </span>
              </div>
            )}

          {/* Few-shot count */}
          <div className='flex justify-between items-center text-sm'>
            <span className='text-muted-foreground'>Examples</span>
            <span className='font-medium'>
              {voiceDna.few_shot_examples.length} few-shot
            </span>
          </div>

          {/* View button */}
          <div className='pt-2'>
            <Link href={`/dashboard/intelligence/voice-dna/${voiceDna._id}`}>
              <Button variant='outline' className='w-full'>
                View Details
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
