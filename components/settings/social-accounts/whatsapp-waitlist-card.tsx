'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, MessageCircle, CheckCircle2, Users } from 'lucide-react';
import { WaitlistApi } from '@/lib/api/waitlist';

export function WhatsAppWaitlistCard() {
  const [joined, setJoined] = useState(false);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await WaitlistApi.getStatus('whatsapp');
        setJoined(res.data.joined);
        setTotal(res.data.total);
      } catch {
        // silent — not critical
      } finally {
        setIsLoading(false);
      }
    };
    fetchStatus();
  }, []);

  const handleJoin = async () => {
    try {
      setIsJoining(true);
      const res = await WaitlistApi.join('whatsapp');
      setJoined(res.data.joined);
      setTotal(res.data.total);
    } catch {
      // Might already be joined — re-fetch status
      try {
        const status = await WaitlistApi.getStatus('whatsapp');
        setJoined(status.data.joined);
        setTotal(status.data.total);
      } catch {
        // silent
      }
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <Card className='border-dashed border-2 border-green-200 bg-green-50/30 dark:border-green-800 dark:bg-green-950/20'>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <CardTitle className='flex items-center gap-2 text-base'>
            <div className='h-8 w-8 rounded-full bg-[#25D366] flex items-center justify-center'>
              <MessageCircle className='h-4 w-4 text-white' />
            </div>
            WhatsApp Business
          </CardTitle>
          <Badge
            variant='outline'
            className='text-xs border-green-300 text-green-700 bg-green-50 dark:border-green-700 dark:text-green-400 dark:bg-green-950/40'
          >
            Coming Soon
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <p className='text-sm text-muted-foreground mb-4'>
          Automate your WhatsApp Business conversations — reply to inquiries,
          qualify leads, and nurture customers at scale. Join the waitlist to be
          first in line.
        </p>

        {isLoading ? (
          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
            <Loader2 className='h-4 w-4 animate-spin' />
            Loading…
          </div>
        ) : joined ? (
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2 text-sm text-green-700 dark:text-green-400 font-medium'>
              <CheckCircle2 className='h-4 w-4' />
              You&apos;re on the waitlist!
            </div>
            {total > 0 && (
              <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                <Users className='h-3 w-3' />
                {total.toLocaleString()} waiting
              </div>
            )}
          </div>
        ) : (
          <div className='flex items-center justify-between gap-3'>
            <Button
              size='sm'
              className='bg-[#25D366] hover:bg-[#1ebe5d] text-white border-0'
              onClick={handleJoin}
              disabled={isJoining}
            >
              {isJoining ? (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              ) : (
                <MessageCircle className='mr-2 h-4 w-4' />
              )}
              Join Waitlist
            </Button>
            {total > 0 && (
              <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                <Users className='h-3 w-3' />
                {total.toLocaleString()} already waiting
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
