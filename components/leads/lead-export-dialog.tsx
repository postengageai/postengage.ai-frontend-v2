'use client';

import { useState } from 'react';
import { FileDown, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { leadsApi } from '@/lib/api/leads';
import { useToast } from '@/hooks/use-toast';

interface LeadExportDialogProps {
  disabled?: boolean;
  filters?: Record<string, unknown>;
}

export function LeadExportDialog({
  disabled = false,
  filters,
}: LeadExportDialogProps) {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<'CSV' | 'JSON'>('CSV');
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const result = await leadsApi.exportLeads({
        format,
        filters,
      });

      // Handle CSV export
      if (format === 'CSV' && result.data.csv) {
        const blob = new Blob([result.data.csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
      // Handle JSON export
      else if (format === 'JSON' && result.data) {
        const jsonString = JSON.stringify(result.data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `leads-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }

      toast({
        title: 'Success',
        description: `${result.data.count} leads exported as ${format}`,
      });

      setOpen(false);
    } catch (_error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to export leads',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={disabled} variant='outline'>
          <FileDown className='h-4 w-4 mr-2' />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Leads</DialogTitle>
          <DialogDescription>
            Choose a format to export your leads data
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <RadioGroup
            value={format}
            onValueChange={val => setFormat(val as 'CSV' | 'JSON')}
          >
            <div className='flex items-center space-x-2'>
              <RadioGroupItem value='CSV' id='csv' />
              <Label htmlFor='csv' className='cursor-pointer flex-1'>
                CSV Format
                <p className='text-xs text-muted-foreground mt-1'>
                  Compatible with Excel and Google Sheets
                </p>
              </Label>
            </div>

            <div className='flex items-center space-x-2'>
              <RadioGroupItem value='JSON' id='json' />
              <Label htmlFor='json' className='cursor-pointer flex-1'>
                JSON Format
                <p className='text-xs text-muted-foreground mt-1'>
                  Full data structure with metadata
                </p>
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className='flex gap-2 justify-end'>
          <Button
            variant='outline'
            onClick={() => setOpen(false)}
            disabled={isExporting}
          >
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting && <Loader2 className='h-4 w-4 mr-2 animate-spin' />}
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
