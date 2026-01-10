import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';

function ResetPasswordLoading() {
  return (
    <div className='w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-lg'>
      <div className='text-center py-8'>
        <Loader2 className='h-12 w-12 animate-spin text-primary mx-auto mb-4' />
        <p className='text-muted-foreground'>Loading...</p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordLoading />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
