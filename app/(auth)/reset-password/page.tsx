import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen bg-background flex items-center justify-center'>
          <Loader2 className='h-8 w-8 animate-spin text-primary' />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
