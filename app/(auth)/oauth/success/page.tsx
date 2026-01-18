'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle2,
  Instagram,
  Zap,
  LayoutDashboard,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';

function OAuthSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showAnimation, setShowAnimation] = useState(false);

  const id = searchParams.get('id');
  const platform = searchParams.get('platform') || 'instagram';
  const username = searchParams.get('username') || '';
  // We might not have avatar URL from params, so use placeholder
  const avatarUrl = searchParams.get('avatar');

  useEffect(() => {
    // Redirect if missing critical data
    if (!id || !username) {
      router.push(
        '/oauth/error?error=MISSING_DATA&description=Authentication%20successful%20but%20account%20data%20is%20missing'
      );
      return;
    }

    // Trigger success animation on mount
    const timer = setTimeout(() => setShowAnimation(true), 100);
    return () => clearTimeout(timer);
  }, [id, username, router]);

  if (!id || !username) {
    return null; // Or a loading spinner while redirecting
  }

  const handleDashboardClick = () => {
    // Close the popup window if it was opened as one, otherwise redirect
    if (window.opener) {
      window.opener.postMessage(
        { type: 'OAUTH_SUCCESS', platform, id, username },
        '*'
      );
      window.close();
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className='flex min-h-screen flex-col items-center justify-center p-4'>
      <div className='w-full max-w-md space-y-6'>
        {/* Success Icon with Animation */}
        <div className='flex justify-center'>
          <div
            className={cn(
              'relative flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 transition-all duration-500',
              showAnimation ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
            )}
          >
            {/* Pulse Ring */}
            <div className='absolute inset-0 animate-ping rounded-full bg-green-500/20' />
            <CheckCircle2 className='h-10 w-10 text-green-500' />
          </div>
        </div>

        {/* Primary Heading */}
        <div className='space-y-2 text-center'>
          <h1 className='text-2xl font-semibold text-foreground'>
            {platform === 'instagram' ? 'Instagram' : 'Account'} Connected
            Successfully
          </h1>
          <p className='text-muted-foreground'>
            Your account{' '}
            <span className='font-medium text-foreground'>{username}</span> is
            now securely connected and ready to use.
          </p>
        </div>

        {/* Connected Account Card */}
        <Card className='overflow-hidden'>
          <CardContent className='p-0'>
            <div className='flex items-center gap-4 p-6'>
              {/* Avatar with Platform Badge */}
              <div className='relative'>
                <Image
                  src={
                    avatarUrl ||
                    '/placeholder.svg?height=64&width=64&query=profile'
                  }
                  alt={username}
                  width={64}
                  height={64}
                  className='rounded-full border-2 border-border'
                />
                <div className='absolute -bottom-1 -right-1 rounded-full bg-background p-1'>
                  {platform === 'instagram' && (
                    <Instagram className='h-4 w-4 text-pink-500' />
                  )}
                </div>
              </div>

              {/* Account Info */}
              <div className='flex-1 space-y-1'>
                <div className='flex items-center gap-2'>
                  <h3 className='font-semibold'>{username}</h3>
                  <Badge
                    variant='secondary'
                    className='bg-green-500/10 text-green-600 hover:bg-green-500/20'
                  >
                    Active
                  </Badge>
                </div>
                <p className='text-xs text-muted-foreground'>
                  Connected just now
                </p>
              </div>
            </div>

            <Separator />

            {/* Features List */}
            <div className='bg-muted/50 p-4'>
              <ul className='space-y-2'>
                <li className='flex items-center gap-2 text-sm text-muted-foreground'>
                  <Zap className='h-4 w-4 text-amber-500' />
                  <span>Automation features enabled</span>
                </li>
                <li className='flex items-center gap-2 text-sm text-muted-foreground'>
                  <Shield className='h-4 w-4 text-blue-500' />
                  <span>Secure connection established</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className='grid gap-3'>
          <Button size='lg' className='w-full' onClick={handleDashboardClick}>
            <LayoutDashboard className='mr-2 h-4 w-4' />
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function OAuthSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className='flex min-h-screen items-center justify-center'>
          <div className='h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent' />
        </div>
      }
    >
      <OAuthSuccessContent />
    </Suspense>
  );
}
