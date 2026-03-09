'use client';

import { useState, useEffect } from 'react';
import { Instagram, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InstagramOAuthApi } from '@/lib/api/oauth';

interface OnboardingConnectStepProps {
  onComplete: () => void;
}

export function OnboardingConnectStep({
  onComplete,
}: OnboardingConnectStepProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Listen for OAuth success messages from the popup
    const handleOAuthMessage = (data: Record<string, unknown>) => {
      if (!data || !data.type) return;
      if (data.type === 'OAUTH_SUCCESS' && data.platform === 'instagram') {
        setConnected(true);
        setIsConnecting(false);
      } else if (data.type === 'OAUTH_ERROR') {
        setIsConnecting(false);
      }
    };

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel(InstagramOAuthApi.OAUTH_CHANNEL);
      channel.onmessage = (event: MessageEvent) => {
        handleOAuthMessage(event.data);
      };
    } catch {
      // BroadcastChannel not supported
    }

    const handlePostMessage = (event: MessageEvent) => {
      if (event.origin === window.location.origin) {
        handleOAuthMessage(event.data);
      }
    };
    window.addEventListener('message', handlePostMessage);

    return () => {
      window.removeEventListener('message', handlePostMessage);
      try {
        channel?.close();
      } catch {
        // ignore
      }
    };
  }, []);

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      await InstagramOAuthApi.openAuthorization();
    } catch {
      setIsConnecting(false);
    }
  };

  return (
    <div className='space-y-6 text-center'>
      {/* Icon */}
      <div className='flex justify-center'>
        <div className='h-16 w-16 rounded-2xl bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center shadow-md'>
          <Instagram className='h-8 w-8 text-white' />
        </div>
      </div>

      {/* Copy */}
      <div>
        <h2 className='text-xl font-semibold'>Connect your Instagram</h2>
        <p className='text-sm text-muted-foreground mt-2 max-w-sm mx-auto'>
          PostEngage connects to your Instagram Business account to manage
          replies, detect leads, and automate engagement.
        </p>
      </div>

      {/* Action */}
      {connected ? (
        <div className='space-y-4'>
          <div className='flex items-center justify-center gap-2 text-green-600 font-medium'>
            <CheckCircle2 className='h-5 w-5' />
            Instagram connected!
          </div>
          <Button onClick={onComplete} className='gap-2'>
            Continue
            <ArrowRight className='h-4 w-4' />
          </Button>
        </div>
      ) : (
        <div className='space-y-3'>
          <Button
            size='lg'
            className='bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white border-0 gap-2'
            onClick={handleConnect}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <Instagram className='h-4 w-4' />
            )}
            {isConnecting ? 'Opening Instagram…' : 'Connect Instagram'}
          </Button>
          <p className='text-xs text-muted-foreground'>
            A popup will open to authorize access. We never post without your
            permission.
          </p>
        </div>
      )}
    </div>
  );
}
