import { Suspense } from 'react';
import { OAuthErrorContent } from '@/components/oauth/oauth-error-content';

export default function OAuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className='flex min-h-screen items-center justify-center'>
          <div className='h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent' />
        </div>
      }
    >
      <OAuthErrorContent />
    </Suspense>
  );
}
