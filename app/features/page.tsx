import { LandingHeader } from '@/components/landing/landing-header';
import { LandingFooter } from '@/components/landing/landing-footer';
import { PageHeader } from '@/components/marketing/page-header';
import { Button } from '@/components/ui/button';
import {
  MessageCircle,
  Send,
  Sparkles,
  Clock,
  Sliders,
  Coins,
} from 'lucide-react';
import Link from 'next/link';

export default function FeaturesPage() {
  const features = [
    {
      icon: MessageCircle,
      title: 'Instagram Comment Auto-Reply',
      problem:
        'Comments pile up faster than you can respond. Each one left hanging is a fan who feels ignored.',
      solution:
        'PostEngageAI reads every comment and crafts responses that sound like you — thoughtful, personal, on-brand.',
      example: {
        comment: 'Love this! Where did you get that jacket?',
        reply:
          "Thank you! It's from Zara's fall collection. The quality is insane for the price 🙌",
      },
      matters:
        'Fans feel seen. Engagement metrics climb. You stay focused on creating.',
    },
    {
      icon: Send,
      title: 'Instagram Auto DM',
      problem:
        'New followers slip through the cracks. Leads go cold before you can reach out.',
      solution:
        'Set up trigger-based DMs that welcome new followers, respond to story mentions, or nurture interested prospects — automatically.',
      example: {
        trigger: 'New follower',
        dm: "Hey! Thanks for the follow. I share weekly tips on [topic] — anything specific you're hoping to learn?",
      },
      matters: 'Build relationships at scale without copy-paste fatigue.',
    },
    {
      icon: Sparkles,
      title: 'AI-Powered Responses',
      problem:
        "Generic templates feel robotic. Followers can tell when it's not really you.",
      solution:
        'Our AI learns from examples you provide — your tone, your humor, your way of expressing gratitude or excitement.',
      example: null,
      matters:
        "Every response feels authentically you, because it's trained on you.",
    },
    {
      icon: Clock,
      title: 'Human-Like Timing',
      problem:
        "Instant replies scream 'bot'. Followers get suspicious. Instagram might too.",
      solution:
        'PostEngageAI adds natural delays — varying response times that mimic real human behavior.',
      example: null,
      matters:
        "Automation that's invisible. Your audience never suspects a thing.",
    },
    {
      icon: Sliders,
      title: 'AI Tone Control',
      problem:
        "Different contexts need different energy. A thank-you isn't a product pitch.",
      solution:
        "Fine-tune your AI's personality. Professional for business inquiries. Casual for fan interactions. You decide.",
      example: null,
      matters: 'One tool, multiple voices — all authentically yours.',
    },
    {
      icon: Coins,
      title: 'Credit-Based Usage',
      problem:
        "Unlimited plans encourage waste. Subscriptions charge you even when you're not using them.",
      solution:
        'Pay only for what you use. Each action costs credits. Buy more when you need them. No monthly commitment.',
      example: null,
      matters: 'Full control over your spending. Scale up or down freely.',
    },
  ];

  return (
    <div className='min-h-screen bg-background text-foreground'>
      <LandingHeader />

      <main className='pt-32 pb-20'>
        {/* Hero */}
        <section className='px-4 sm:px-6'>
          <PageHeader
            badge='Features'
            title="Everything you need. Nothing you don't."
            description='PostEngageAI focuses on doing two things exceptionally well: comment replies and DMs. No bloat. No complexity. Just results.'
          />
        </section>

        {/* Features */}
        <section className='mt-24 px-4 sm:px-6'>
          <div className='mx-auto max-w-4xl space-y-24'>
            {features.map((feature, index) => (
              <div key={index} className='relative'>
                {/* Feature Header */}
                <div className='flex items-start gap-4 mb-8'>
                  <div className='flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center'>
                    <feature.icon className='h-6 w-6 text-primary' />
                  </div>
                  <div>
                    <h2 className='text-2xl font-bold'>{feature.title}</h2>
                  </div>
                </div>

                {/* Problem → Solution → Why It Matters */}
                <div className='grid gap-6 md:grid-cols-3'>
                  <div className='rounded-xl border border-border bg-muted/30 p-6'>
                    <div className='text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3'>
                      The Problem
                    </div>
                    <p className='text-sm'>{feature.problem}</p>
                  </div>

                  <div className='rounded-xl border border-border bg-card p-6'>
                    <div className='text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3'>
                      What We Do
                    </div>
                    <p className='text-sm'>{feature.solution}</p>
                  </div>

                  <div className='rounded-xl border border-primary/30 bg-primary/5 p-6'>
                    <div className='text-xs font-medium text-primary uppercase tracking-wider mb-3'>
                      Why It Matters
                    </div>
                    <p className='text-sm'>{feature.matters}</p>
                  </div>
                </div>

                {/* Example (if applicable) */}
                {feature.example && (
                  <div className='mt-6 rounded-xl border border-border bg-muted/20 p-6'>
                    <div className='text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4'>
                      Example
                    </div>
                    {'comment' in feature.example ? (
                      <div className='space-y-3'>
                        <div className='flex gap-3'>
                          <div className='w-8 h-8 rounded-full bg-muted flex-shrink-0' />
                          <div className='rounded-2xl rounded-tl-sm bg-muted px-4 py-2 text-sm'>
                            {feature.example.comment}
                          </div>
                        </div>
                        <div className='flex gap-3 justify-end'>
                          <div className='rounded-2xl rounded-tr-sm bg-primary/20 px-4 py-2 text-sm'>
                            {feature.example.reply}
                          </div>
                          <div className='w-8 h-8 rounded-full bg-primary/30 flex-shrink-0' />
                        </div>
                      </div>
                    ) : (
                      <div className='space-y-3'>
                        <div className='text-xs text-muted-foreground'>
                          Trigger: {feature.example.trigger}
                        </div>
                        <div className='flex gap-3 justify-end'>
                          <div className='rounded-2xl rounded-tr-sm bg-primary/20 px-4 py-2 text-sm max-w-md'>
                            {feature.example.dm}
                          </div>
                          <div className='w-8 h-8 rounded-full bg-primary/30 flex-shrink-0' />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Inline CTA */}
                {index === 0 && (
                  <div className='mt-6'>
                    <Link
                      href='/signup'
                      className='text-sm text-primary hover:underline'
                    >
                      See how this works →
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Safety Section */}
        <section className='mt-32 px-4 sm:px-6'>
          <div className='mx-auto max-w-3xl text-center'>
            <h2 className='text-2xl font-bold mb-4'>Safety-first automation</h2>
            <p className='text-muted-foreground mb-8'>
              Every feature is built with your account safety in mind. Official
              APIs only. Human-like behavior. You stay in control at all times.
            </p>
            <Button variant='outline' asChild>
              <Link href='/security'>Learn about our security practices</Link>
            </Button>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
