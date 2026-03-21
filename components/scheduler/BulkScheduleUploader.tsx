'use client';

import { useState, useCallback, useRef } from 'react';
import { Upload, Download, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useBulkSchedule } from '@/lib/hooks';
import { useToast } from '@/components/ui/use-toast';
import type {
  CreateScheduledPostDto,
  ScheduledPostMediaType,
} from '@/lib/api/scheduler';

// ── Types ─────────────────────────────────────────────────────────────────────

interface ParsedRow {
  readonly index: number;
  readonly raw: Record<string, string>;
  readonly parsed?: CreateScheduledPostDto;
  readonly error?: string;
}

// ── CSV helpers ───────────────────────────────────────────────────────────────

const TEMPLATE_HEADERS = [
  'media_type',
  'caption',
  'media_urls',
  'hashtags',
  'scheduled_at',
  'timezone',
  'save_as_draft',
] as const;

const MEDIA_TYPES: ScheduledPostMediaType[] = [
  'IMAGE',
  'VIDEO',
  'REEL',
  'STORY',
  'CAROUSEL',
];

function downloadTemplate(): void {
  const sample = [
    TEMPLATE_HEADERS.join(','),
    'IMAGE,"My caption here","https://example.com/image.jpg","#instagram #marketing","2026-04-01T10:00:00Z","UTC","false"',
    'VIDEO,"Video caption","https://example.com/video.mp4","#video","2026-04-02T14:00:00Z","UTC","false"',
  ].join('\n');
  const blob = new Blob([sample], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'bulk-schedule-template.csv';
  a.click();
  URL.revokeObjectURL(url);
}

function parseCSV(text: string): ParsedRow[] {
  const lines = text.split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
  return lines.slice(1, 101).map((line, idx) => {
    const raw: Record<string, string> = {};
    // Simple CSV parse — quoted fields with commas not supported for brevity
    const values = line.split(',').map(v => v.replace(/"/g, '').trim());
    headers.forEach((h, i) => {
      raw[h] = values[i] ?? '';
    });

    const mediaType = raw[
      'media_type'
    ]?.toUpperCase() as ScheduledPostMediaType;
    if (!MEDIA_TYPES.includes(mediaType)) {
      return {
        index: idx + 1,
        raw,
        error: `Invalid media_type: "${raw['media_type']}"`,
      };
    }
    const caption = raw['caption'] ?? '';
    if (!caption) {
      return { index: idx + 1, raw, error: 'Caption is required' };
    }
    const mediaUrls = raw['media_urls'] ? [raw['media_urls']] : [];
    if (mediaUrls.length === 0) {
      return {
        index: idx + 1,
        raw,
        error: 'At least one media_url is required',
      };
    }
    const scheduledAt = raw['scheduled_at'] ?? '';
    if (!scheduledAt || isNaN(Date.parse(scheduledAt))) {
      return {
        index: idx + 1,
        raw,
        error: `Invalid scheduled_at: "${scheduledAt}"`,
      };
    }

    const parsed: CreateScheduledPostDto = {
      media_type: mediaType,
      caption,
      media_urls: mediaUrls,
      hashtags: raw['hashtags']
        ? raw['hashtags'].split(' ').filter(Boolean)
        : [],
      scheduled_at: scheduledAt,
      timezone: raw['timezone'] || 'UTC',
      save_as_draft: raw['save_as_draft']?.toLowerCase() === 'true',
    };
    return { index: idx + 1, raw, parsed };
  });
}

// ── Preview table ─────────────────────────────────────────────────────────────

interface PreviewTableProps {
  readonly rows: ParsedRow[];
}

function PreviewTable({ rows }: PreviewTableProps) {
  const valid = rows.filter(r => r.parsed);
  const invalid = rows.filter(r => r.error);

  return (
    <div className='space-y-3'>
      <div className='flex items-center gap-3 text-xs'>
        <span className='flex items-center gap-1 text-success'>
          <CheckCircle className='h-3 w-3' />
          {valid.length} valid
        </span>
        {invalid.length > 0 && (
          <span className='flex items-center gap-1 text-destructive'>
            <AlertTriangle className='h-3 w-3' />
            {invalid.length} errors
          </span>
        )}
      </div>
      <div className='max-h-48 overflow-y-auto rounded-md border text-xs'>
        <table className='w-full'>
          <thead className='bg-muted/50 sticky top-0'>
            <tr>
              <th className='text-left px-2 py-1.5 font-medium text-muted-foreground w-8'>
                #
              </th>
              <th className='text-left px-2 py-1.5 font-medium text-muted-foreground'>
                Type
              </th>
              <th className='text-left px-2 py-1.5 font-medium text-muted-foreground'>
                Caption
              </th>
              <th className='text-left px-2 py-1.5 font-medium text-muted-foreground'>
                Scheduled
              </th>
              <th className='text-left px-2 py-1.5 font-medium text-muted-foreground'>
                Status
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-border'>
            {rows.map(row => (
              <tr
                key={row.index}
                className={cn(row.error ? 'bg-destructive/5' : '')}
              >
                <td className='px-2 py-1.5 text-muted-foreground'>
                  {row.index}
                </td>
                <td className='px-2 py-1.5'>{row.raw['media_type'] || '—'}</td>
                <td className='px-2 py-1.5 max-w-[160px] truncate'>
                  {row.raw['caption'] || '—'}
                </td>
                <td className='px-2 py-1.5 whitespace-nowrap'>
                  {row.raw['scheduled_at'] || '—'}
                </td>
                <td className='px-2 py-1.5'>
                  {row.error ? (
                    <span className='text-destructive text-[10px]'>
                      {row.error}
                    </span>
                  ) : (
                    <CheckCircle className='h-3 w-3 text-success' />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function BulkScheduleUploader() {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const bulkSchedule = useBulkSchedule();

  const processFile = useCallback(
    (file: File) => {
      if (!file.name.endsWith('.csv')) {
        toast({
          title: 'Invalid file',
          description: 'Please upload a CSV file',
          variant: 'destructive',
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = e => {
        const text = e.target?.result;
        if (typeof text === 'string') {
          setRows(parseCSV(text));
        }
      };
      reader.readAsText(file);
    },
    [toast]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const validRows = rows.filter(r => r.parsed);

  const handleSubmit = () => {
    const posts = validRows.map(r => r.parsed!);
    bulkSchedule.mutate(posts, {
      onSuccess: result => {
        toast({
          title: 'Bulk scheduled',
          description: `${result.data.created} posts scheduled${result.data.failed > 0 ? `, ${result.data.failed} failed` : ''}`,
        });
        setRows([]);
      },
      onError: () => {
        toast({
          title: 'Error',
          description: 'Bulk scheduling failed',
          variant: 'destructive',
        });
      },
    });
  };

  return (
    <Card>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-sm font-semibold'>Bulk Schedule</CardTitle>
          <Button
            variant='ghost'
            size='sm'
            className='h-7 text-xs gap-1.5'
            onClick={downloadTemplate}
          >
            <Download className='h-3 w-3' />
            Template CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Drop zone */}
        {rows.length === 0 && (
          <div
            onDrop={handleDrop}
            onDragOver={e => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onClick={() => fileRef.current?.click()}
            className={cn(
              'border-2 border-dashed rounded-xl py-10 text-center cursor-pointer transition-colors',
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50 hover:bg-muted/30'
            )}
          >
            <Upload className='h-8 w-8 text-muted-foreground mx-auto mb-2' />
            <p className='text-sm font-medium text-foreground'>Drop CSV here</p>
            <p className='text-xs text-muted-foreground mt-1'>
              or click to browse · max 100 rows
            </p>
            <input
              ref={fileRef}
              type='file'
              accept='.csv'
              className='hidden'
              onChange={handleFileChange}
            />
          </div>
        )}

        {/* Preview */}
        {rows.length > 0 && (
          <>
            <PreviewTable rows={rows} />
            <div className='flex items-center gap-2'>
              <Button
                size='sm'
                onClick={handleSubmit}
                disabled={validRows.length === 0 || bulkSchedule.isPending}
                className='h-8 text-xs'
              >
                {bulkSchedule.isPending
                  ? 'Scheduling…'
                  : `Schedule ${validRows.length} post${validRows.length !== 1 ? 's' : ''}`}
              </Button>
              <Button
                variant='ghost'
                size='sm'
                className='h-8 text-xs gap-1'
                onClick={() => setRows([])}
              >
                <X className='h-3 w-3' />
                Clear
              </Button>
              <Badge variant='outline' className='ml-auto text-xs'>
                {validRows.length} / {rows.length} valid
              </Badge>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
