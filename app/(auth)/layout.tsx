import type React from 'react';
import Link from 'next/link';
import { Zap } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='min-h-screen bg-background flex flex-col'>
      {/* Header */}
      <header className='p-6'>
        <Link href='/' className='flex items-center gap-2 w-fit'>
          <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-primary'>
            <Zap className='h-4 w-4 text-primary-foreground' />
          </div>
          <span className='text-lg font-semibold text-foreground'>
            PostEngageAI
          </span>
        </Link>
      </header>

      {/* Content */}
      <main className='flex-1 flex items-center justify-center px-4 pb-16'>
        {children}
      </main>

      {/* Footer */}
      <footer className='p-6 text-center'>
        <p className='text-sm text-muted-foreground'>
          <Link
            href='/privacy'
            className='hover:text-foreground transition-colors'
          >
            Privacy
          </Link>
          <span className='mx-2'>·</span>
          <Link
            href='/terms'
            className='hover:text-foreground transition-colors'
          >
            Terms
          </Link>
        </p>
      </footer>
    </div>
  );
}
