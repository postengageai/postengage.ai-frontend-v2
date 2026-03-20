'use client';

import { useState } from 'react';
import { Download, Loader2, Info } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LeadsApi } from '@/lib/api/leads';
import type { ExportLeadsParams } from '@/lib/types/leads';
import type { SocialPlatform } from '@/lib/types/settings';
import { toast } from 'sonner';

const PLATFORMS: { value: SocialPlatform | 'all'; label: string }[] = [
  { value: 'all', label: 'All Platforms' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'twitter', label: 'Twitter / X' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'tiktok', label: 'TikTok' },
];

interface ExportLeadsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalLeads?: number;
  activeFilters?: {
    platform?: SocialPlatform | 'all';
    tags?: string[];
    search?: string;
  };
}

export function ExportLeadsDialog({
  open,
  onOpenChange,
  totalLeads = 0,
  activeFilters,
}: ExportLeadsDialogProps) {
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [platform, setPlatform] = useState<SocialPlatform | 'all'>(
    activeFilters?.platform ?? 'all'
  );
  const [search, setSearch] = useState(activeFilters?.search ?? '');
  const [maxLeads, setMaxLeads] = useState('');
  const [exporting, setExporting] = useState(false);

  const estimatedCount = maxLeads
    ? Math.min(parseInt(maxLeads) || 0, totalLeads)
    : totalLeads;

  const handleExport = async () => {
    setExporting(true);
    try {
      const params: ExportLeadsParams = {
        format,
        platform: platform === 'all' ? undefined : platform,
        search: search || undefined,
        limit: maxLeads ? parseInt(maxLeads) || undefined : undefined,
        tags: activeFilters?.tags?.length ? activeFilters.tags : undefined,
      };

      const blob = await LeadsApi.exportLeads(params);
      const ext = format === 'csv' ? 'csv' : 'json';
      const filename = `leads-export-${new Date().toISOString().split('T')[0]}.${ext}`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`Exported ${estimatedCount} leads as ${ext.toUpperCase()}`);
      onOpenChange(false);
    } catch {
      toast.error('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Download className='h-4 w-4' />
            Export Leads
          </DialogTitle>
          <DialogDescription>
            Download your leads data in your preferred format.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-5 py-2'>
          {/* Format */}
          <div className='space-y-2'>
            <Label className='text-sm font-medium'>Format</Label>
            <RadioGroup
              value={format}
              onValueChange={val => setFormat(val as 'csv' | 'json')}
              className='flex gap-4'
            >
              <div className='flex items-center space-x-2'>
                <RadioGroupItem value='csv' id='format-csv' />
                <Label
                  htmlFor='format-csv'
                  className='cursor-pointer font-normal'
                >
                  CSV
                </Label>
              </div>
              <div className='flex items-center space-x-2'>
                <RadioGroupItem value='json' id='format-json' />
                <Label
                  htmlFor='format-json'
                  className='cursor-pointer font-normal'
                >
                  JSON
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Filter by platform */}
          <div className='space-y-1.5'>
            <Label className='text-sm font-medium'>Filter by Platform</Label>
            <Select
              value={platform}
              onValueChange={val => setPlatform(val as SocialPlatform | 'all')}
            >
              <SelectTrigger>
                <SelectValue placeholder='All Platforms' />
              </SelectTrigger>
              <SelectContent>
                {PLATFORMS.map(p => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search */}
          <div className='space-y-1.5'>
            <Label className='text-sm font-medium'>Search</Label>
            <Input
              placeholder='Filter by name or username…'
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Max leads */}
          <div className='space-y-1.5'>
            <Label className='text-sm font-medium'>Max Leads</Label>
            <Input
              type='number'
              placeholder={`All (${totalLeads})`}
              value={maxLeads}
              onChange={e => setMaxLeads(e.target.value)}
              min={1}
              max={totalLeads}
            />
          </div>

          {/* Estimate info box */}
          <div className='flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800/50 dark:bg-blue-900/20'>
            <Info className='mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400' />
            <p className='text-sm text-blue-700 dark:text-blue-300'>
              Estimated export size:{' '}
              <span className='font-semibold'>~{estimatedCount} leads</span>
            </p>
          </div>
        </div>

        <DialogFooter className='gap-2'>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={exporting}
          >
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={exporting}>
            {exporting ? (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            ) : (
              <Download className='mr-2 h-4 w-4' />
            )}
            Export Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
