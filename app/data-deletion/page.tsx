import { LandingHeader } from '@/components/landing/landing-header';
import { LandingFooter } from '@/components/landing/landing-footer';
import { PageHeader } from '@/components/marketing/page-header';
import { Mail, Clock, Trash2, CheckCircle } from 'lucide-react';

export default function DataDeletionPage() {
  return (
    <div className='min-h-screen bg-background text-foreground'>
      <LandingHeader />

      <main className='pt-32 pb-20'>
        {/* Hero */}
        <section className='px-4 sm:px-6'>
          <PageHeader
            title='Data Deletion Instructions'
            description='How to request deletion of your data from PostEngageAI.'
          />
        </section>

        {/* Content */}
        <section className='mt-16 px-4 sm:px-6'>
          <div className='mx-auto max-w-2xl'>
            {/* What Can Be Deleted */}
            <div className='rounded-xl border border-border bg-card p-8 mb-8'>
              <div className='flex items-center gap-3 mb-6'>
                <Trash2 className='h-6 w-6 text-primary' />
                <h2 className='text-xl font-semibold'>
                  What data can be deleted?
                </h2>
              </div>
              <ul className='space-y-3 text-muted-foreground'>
                <li className='flex items-start gap-2'>
                  <CheckCircle className='h-4 w-4 text-green-500 mt-0.5 flex-shrink-0' />
                  Your PostEngageAI account and profile information
                </li>
                <li className='flex items-start gap-2'>
                  <CheckCircle className='h-4 w-4 text-green-500 mt-0.5 flex-shrink-0' />
                  Connected Instagram account data
                </li>
                <li className='flex items-start gap-2'>
                  <CheckCircle className='h-4 w-4 text-green-500 mt-0.5 flex-shrink-0' />
                  AI voice training data and preferences
                </li>
                <li className='flex items-start gap-2'>
                  <CheckCircle className='h-4 w-4 text-green-500 mt-0.5 flex-shrink-0' />
                  Automation rules and configurations
                </li>
                <li className='flex items-start gap-2'>
                  <CheckCircle className='h-4 w-4 text-green-500 mt-0.5 flex-shrink-0' />
                  Activity logs and usage history
                </li>
              </ul>
            </div>

            {/* How to Request */}
            <div className='rounded-xl border border-border bg-card p-8 mb-8'>
              <div className='flex items-center gap-3 mb-6'>
                <Mail className='h-6 w-6 text-primary' />
                <h2 className='text-xl font-semibold'>
                  How to request deletion
                </h2>
              </div>
              <p className='text-muted-foreground mb-6'>
                Send an email to request data deletion:
              </p>

              <div className='rounded-lg bg-muted/50 p-6 font-mono text-sm'>
                <p>
                  <strong className='text-foreground'>To:</strong>{' '}
                  postengage.ai@gmail.com
                </p>
                <p className='mt-2'>
                  <strong className='text-foreground'>Subject:</strong> Data
                  Deletion Request
                </p>
                <p className='mt-4'>
                  <strong className='text-foreground'>Include:</strong>
                </p>
                <ul className='mt-2 space-y-1 text-muted-foreground'>
                  <li>• Your registered email address</li>
                  <li>• Your Instagram username</li>
                </ul>
              </div>
            </div>

            {/* Processing Time */}
            <div className='rounded-xl border border-border bg-card p-8 mb-8'>
              <div className='flex items-center gap-3 mb-6'>
                <Clock className='h-6 w-6 text-primary' />
                <h2 className='text-xl font-semibold'>Processing time</h2>
              </div>
              <p className='text-muted-foreground'>
                We will process your data deletion request within{' '}
                <strong className='text-foreground'>7 business days</strong>.
                You will receive a confirmation email once the deletion is
                complete.
              </p>
            </div>

            {/* After Deletion */}
            <div className='rounded-xl border border-amber-500/30 bg-amber-500/5 p-8'>
              <h2 className='text-xl font-semibold mb-4'>
                What happens after deletion?
              </h2>
              <ul className='space-y-3 text-muted-foreground'>
                <li>
                  • Your account will be permanently deleted and cannot be
                  recovered
                </li>
                <li>• All Instagram access tokens will be revoked</li>
                <li>• Automation will stop immediately</li>
                <li>• Remaining credits will be forfeited (non-refundable)</li>
                <li>
                  • You can create a new account anytime if you wish to return
                </li>
              </ul>
            </div>

            {/* Quick Disconnect Note */}
            <div className='mt-8 text-center'>
              <p className='text-sm text-muted-foreground'>
                <strong className='text-foreground'>
                  Just want to disconnect Instagram?
                </strong>
                <br />
                You can disconnect your Instagram account from the Settings page
                without deleting your entire account.
              </p>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
