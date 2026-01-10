import { LandingHeader } from '@/components/landing/landing-header';
import { LandingFooter } from '@/components/landing/landing-footer';
import { PageHeader } from '@/components/marketing/page-header';
import { Button } from '@/components/ui/button';
import { Shield, Clock, Fingerprint } from 'lucide-react';
import Link from 'next/link';

export default function ProductPage() {
  return (
    <div className='min-h-screen bg-background text-foreground'>
      <LandingHeader />

      <main className='pt-32 pb-20'>
        {/* Hero */}
        <section className='px-4 sm:px-6'>
          <PageHeader
            badge='The Product'
            title='Engagement that sounds like you'
            description='PostEngageAI helps creators and businesses respond to Instagram comments and DMs automatically — using AI that learns your voice, not generic templates.'
          />

          <div className='mt-10 flex justify-center gap-4'>
            <Button size='lg' asChild>
              <Link href='/signup'>Start Engaging Smarter</Link>
            </Button>
            <Button size='lg' variant='outline' asChild>
              <Link href='/features'>See Features</Link>
            </Button>
          </div>
        </section>

        {/* Problem → Outcome */}
        <section className='mt-32 px-4 sm:px-6'>
          <div className='mx-auto max-w-4xl'>
            <div className='grid gap-12 md:grid-cols-2'>
              <div className='rounded-2xl border border-border bg-muted/30 p-8'>
                <div className='mb-4 text-sm font-medium text-muted-foreground uppercase tracking-wider'>
                  The Problem
                </div>
                <h3 className='text-2xl font-semibold mb-4'>
                  Your audience grows. Your time doesn't.
                </h3>
                <p className='text-muted-foreground'>
                  Every unanswered comment is a missed connection. Every ignored
                  DM is a lost opportunity. But you can't be online 24/7 — and
                  hiring a VA means losing your authentic voice.
                </p>
              </div>

              <div className='rounded-2xl border border-primary/50 bg-primary/5 p-8'>
                <div className='mb-4 text-sm font-medium text-primary uppercase tracking-wider'>
                  The Outcome
                </div>
                <h3 className='text-2xl font-semibold mb-4'>
                  Engage everyone. Sound like yourself.
                </h3>
                <p className='text-muted-foreground'>
                  PostEngageAI responds on your behalf with your personality,
                  your tone, your way of speaking. Your audience feels heard.
                  You get your time back.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className='mt-32 px-4 sm:px-6'>
          <div className='mx-auto max-w-4xl'>
            <h2 className='text-3xl font-bold text-center mb-16'>
              How it works
            </h2>

            <div className='space-y-8'>
              {[
                {
                  step: '01',
                  title: 'Connect your Instagram',
                  description:
                    "Secure OAuth connection through Meta's official API. We never store your password.",
                },
                {
                  step: '02',
                  title: 'Teach it your voice',
                  description:
                    'Share a few example responses. The AI learns your tone, humor, and communication style.',
                },
                {
                  step: '03',
                  title: 'Set your rules',
                  description:
                    'Define when to reply, what to ignore, and when to escalate to you personally.',
                },
                {
                  step: '04',
                  title: 'Watch it work',
                  description:
                    'The AI engages your audience naturally. Review activity anytime from your dashboard.',
                },
              ].map((item, index) => (
                <div key={index} className='flex gap-6 items-start'>
                  <div className='flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-mono text-sm font-medium'>
                    {item.step}
                  </div>
                  <div>
                    <h3 className='text-xl font-semibold mb-2'>{item.title}</h3>
                    <p className='text-muted-foreground'>{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What Makes Us Different */}
        <section className='mt-32 px-4 sm:px-6'>
          <div className='mx-auto max-w-5xl'>
            <h2 className='text-3xl font-bold text-center mb-6'>
              Not another chatbot
            </h2>
            <p className='text-center text-muted-foreground max-w-2xl mx-auto mb-16'>
              Unlike generic automation tools, PostEngageAI is built
              specifically for creators who care about authenticity.
            </p>

            <div className='grid gap-6 md:grid-cols-3'>
              {[
                {
                  icon: Fingerprint,
                  title: 'Your Voice, Not Ours',
                  description:
                    'AI that adapts to how you actually talk — not corporate templates.',
                },
                {
                  icon: Clock,
                  title: 'Human-Like Timing',
                  description:
                    'Responses with natural delays. No one suspects automation.',
                },
                {
                  icon: Shield,
                  title: 'Meta Compliant',
                  description:
                    'Built on official APIs. Your account stays safe.',
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className='rounded-xl border border-border bg-card p-6'
                >
                  <item.icon className='h-8 w-8 text-primary mb-4' />
                  <h3 className='text-lg font-semibold mb-2'>{item.title}</h3>
                  <p className='text-sm text-muted-foreground'>
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className='mt-32 px-4 sm:px-6'>
          <div className='mx-auto max-w-3xl text-center'>
            <h2 className='text-3xl font-bold mb-6'>Built on trust</h2>
            <p className='text-muted-foreground mb-12'>
              We take your account security seriously. PostEngageAI is designed
              with safety-first principles.
            </p>

            <div className='grid gap-4 sm:grid-cols-2'>
              {[
                'We never post without your permission',
                'You control every automation rule',
                'Official Meta API integration only',
                'Your data is never sold',
                'Disconnect anytime with one click',
                'Credit-based usage for full control',
              ].map((item, index) => (
                <div
                  key={index}
                  className='flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3 text-left'
                >
                  <Shield className='h-4 w-4 text-primary flex-shrink-0' />
                  <span className='text-sm'>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className='mt-32 px-4 sm:px-6'>
          <div className='mx-auto max-w-3xl text-center'>
            <h2 className='text-3xl font-bold mb-4'>
              Ready to engage smarter?
            </h2>
            <p className='text-muted-foreground mb-8'>
              Start with free credits. No commitment required.
            </p>
            <Button size='lg' asChild>
              <Link href='/signup'>Start Engaging Smarter</Link>
            </Button>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
