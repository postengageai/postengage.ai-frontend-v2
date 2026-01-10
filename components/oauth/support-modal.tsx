'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Check, ExternalLink, HelpCircle } from 'lucide-react';
import { useState } from 'react';

interface SupportModalProps {
  errorCode: string;
  supportReference: string;
  timestamp: string;
  documentationUrl?: string;
}

export function SupportModal({
  errorCode,
  supportReference,
  timestamp,
  documentationUrl,
}: SupportModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = async (value: string, field: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatTimestamp = (ts: string) => {
    return new Date(ts).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short',
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='outline' size='sm'>
          <HelpCircle className='mr-2 h-4 w-4' />
          Contact Support
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Need help?</DialogTitle>
          <DialogDescription>
            Share these details with our support team for faster assistance.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          {/* Error Code */}
          <div className='space-y-2'>
            <label className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>
              Error Code
            </label>
            <div className='flex items-center gap-2'>
              <code className='flex-1 rounded-md bg-muted px-3 py-2 text-sm font-mono'>
                {errorCode}
              </code>
              <Button
                variant='ghost'
                size='icon'
                className='h-9 w-9'
                onClick={() => handleCopy(errorCode, 'code')}
              >
                {copiedField === 'code' ? (
                  <Check className='h-4 w-4 text-green-500' />
                ) : (
                  <Copy className='h-4 w-4' />
                )}
              </Button>
            </div>
          </div>

          {/* Reference ID */}
          <div className='space-y-2'>
            <label className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>
              Reference ID
            </label>
            <div className='flex items-center gap-2'>
              <code className='flex-1 rounded-md bg-muted px-3 py-2 text-sm font-mono'>
                {supportReference}
              </code>
              <Button
                variant='ghost'
                size='icon'
                className='h-9 w-9'
                onClick={() => handleCopy(supportReference, 'reference')}
              >
                {copiedField === 'reference' ? (
                  <Check className='h-4 w-4 text-green-500' />
                ) : (
                  <Copy className='h-4 w-4' />
                )}
              </Button>
            </div>
          </div>

          {/* Timestamp */}
          <div className='space-y-2'>
            <label className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>
              Time
            </label>
            <div className='rounded-md bg-muted px-3 py-2 text-sm'>
              {formatTimestamp(timestamp)}
            </div>
          </div>

          {/* Documentation Link */}
          {documentationUrl && (
            <Button variant='outline' className='w-full bg-transparent' asChild>
              <a
                href={documentationUrl}
                target='_blank'
                rel='noopener noreferrer'
              >
                <ExternalLink className='mr-2 h-4 w-4' />
                View Documentation
              </a>
            </Button>
          )}
        </div>

        {/* Contact Support Button */}
        <Button className='w-full' asChild>
          <a href='mailto:support@postengage.ai'>Email Support Team</a>
        </Button>
      </DialogContent>
    </Dialog>
  );
}
