import type React from 'react';
import Link from 'next/link';
import { Zap, MessageCircle, Brain, Target, CheckCircle } from 'lucide-react';

const PRODUCT_FEATURES = [
  {
    icon: MessageCircle,
    text: 'Auto-replies to every DM and comment',
  },
  {
    icon: Brain,
    text: 'Voice DNA — replies that sound like you',
  },
  {
    icon: Target,
    text: 'Lead capture built into every conversation',
  },
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='min-h-screen bg-background flex'>
      {/* ── Left panel — product context (desktop only) ─────────────────── */}
      <div className='hidden lg:flex lg:w-[44%] xl:w-[42%] shrink-0 relative flex-col overflow-hidden border-r border-border/50'>
        {/* Grid background */}
        <div className='absolute inset-0 bg-grid-faint' />
        {/* Radial glow from top */}
        <div className='absolute inset-0 bg-hero-radial' />
        {/* Accent blob */}
        <div className='absolute -top-32 left-1/2 -translate-x-1/2 w-[400px] h-[300px] bg-primary/6 blur-3xl rounded-full pointer-events-none' />

        {/* Logo */}
        <div className='relative z-10 p-8'>
          <Link href='/' className='flex items-center gap-2.5 w-fit'>
            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/30'>
              <Zap className='h-4 w-4 text-primary-foreground' />
            </div>
            <span className='text-base font-semibold text-foreground'>
              PostEngage.ai
            </span>
          </Link>
        </div>

        {/* Main content */}
        <div className='relative z-10 flex-1 flex flex-col justify-center px-10 xl:px-14 pb-10'>
          {/* Badge */}
          <div className='inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/80 bg-card/40 text-xs text-muted-foreground w-fit mb-8'>
            <span className='relative flex h-1.5 w-1.5'>
              <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75' />
              <span className='relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500' />
            </span>
            AI-Powered Instagram Automation
          </div>

          {/* Headline */}
          <h2 className='text-4xl xl:text-[2.75rem] font-bold leading-[1.1] tracking-tight mb-5'>
            Replies that sound
            <br />
            <span className='text-gradient-indigo'>exactly like you.</span>
          </h2>

          <p className='text-muted-foreground leading-relaxed mb-10 max-w-sm'>
            Connect your Instagram and let PostEngage.ai handle every DM and
            comment — in your exact voice, around the clock.
          </p>

          {/* Feature list */}
          <div className='space-y-3'>
            {PRODUCT_FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className='flex items-center gap-3'>
                <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10'>
                  <Icon className='h-4 w-4 text-primary' />
                </div>
                <span className='text-sm text-foreground/80'>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Trust footer */}
        <div className='relative z-10 px-10 xl:px-14 pb-8'>
          <div className='flex items-center gap-2 text-xs text-muted-foreground'>
            <CheckCircle className='h-3.5 w-3.5 text-green-500' />
            Trusted by 2,400+ creators worldwide
          </div>
        </div>
      </div>

      {/* ── Right panel — auth form ─────────────────────────────────────── */}
      <div className='flex-1 flex flex-col min-h-screen'>
        {/* Mobile logo (hidden on desktop since left panel handles it) */}
        <header className='lg:hidden p-6 border-b border-border/50'>
          <Link href='/' className='flex items-center gap-2 w-fit'>
            <div className='flex h-7 w-7 items-center justify-center rounded-lg bg-primary'>
              <Zap className='h-3.5 w-3.5 text-primary-foreground' />
            </div>
            <span className='text-sm font-semibold'>PostEngage.ai</span>
          </Link>
        </header>

        {/* Form area */}
        <main className='flex-1 flex items-center justify-center px-4 py-12'>
          {children}
        </main>

        {/* Footer */}
        <footer className='px-6 py-5 text-center border-t border-border/30'>
          <p className='text-xs text-muted-foreground'>
            <Link
              href='https://postengage.ai/privacy'
              className='hover:text-foreground transition-colors'
            >
              Privacy
            </Link>
            <span className='mx-2 opacity-40'>·</span>
            <Link
              href='https://postengage.ai/terms'
              className='hover:text-foreground transition-colors'
            >
              Terms
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
}
