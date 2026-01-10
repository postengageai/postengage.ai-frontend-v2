import { LandingHeader } from '@/components/landing/landing-header';
import { LandingFooter } from '@/components/landing/landing-footer';
import { PageHeader } from '@/components/marketing/page-header';
import { Button } from '@/components/ui/button';
import { Check, Coins, MessageCircle, Send, HelpCircle } from 'lucide-react';
import Link from 'next/link';

export default function PricingPage() {
  const creditPacks = [
    { credits: 100, price: 9, popular: false },
    { credits: 500, price: 39, popular: true },
    { credits: 1000, price: 69, popular: false },
  ];

  const usageExamples = [
    {
      persona: 'Micro-influencer',
      followers: '10K',
      commentsPerDay: '20-30',
      creditsPerMonth: '~150',
      recommendation: '100 credits/month',
    },
    {
      persona: 'Growing Creator',
      followers: '50K',
      commentsPerDay: '50-100',
      creditsPerMonth: '~400',
      recommendation: '500 credits/month',
    },
    {
      persona: 'Brand / Agency',
      followers: '100K+',
      commentsPerDay: '100-200',
      creditsPerMonth: '~800',
      recommendation: '1000 credits/month',
    },
  ];

  return (
    <div className='min-h-screen bg-background text-foreground'>
      <LandingHeader />

      <main className='pt-32 pb-20'>
        {/* Hero */}
        <section className='px-4 sm:px-6'>
          <PageHeader
            badge='Pricing'
            title='Pay for what you use'
            description='No subscriptions. No commitments. Buy credits when you need them, use them at your own pace.'
          />
        </section>

        {/* What is a Credit */}
        <section className='mt-20 px-4 sm:px-6'>
          <div className='mx-auto max-w-3xl'>
            <div className='rounded-2xl border border-border bg-card p-8'>
              <div className='flex items-center gap-3 mb-6'>
                <Coins className='h-6 w-6 text-primary' />
                <h2 className='text-xl font-semibold'>What's a credit?</h2>
              </div>
              <p className='text-muted-foreground mb-6'>
                Think of credits like stamps. Each action PostEngageAI takes on
                your behalf costs a small number of credits. Simple actions cost
                less. Complex ones cost more.
              </p>

              <div className='grid gap-4 sm:grid-cols-2'>
                <div className='flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3'>
                  <MessageCircle className='h-5 w-5 text-muted-foreground' />
                  <div>
                    <div className='font-medium'>Comment Reply</div>
                    <div className='text-sm text-muted-foreground'>
                      ~0.5 credits
                    </div>
                  </div>
                </div>
                <div className='flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3'>
                  <Send className='h-5 w-5 text-muted-foreground' />
                  <div>
                    <div className='font-medium'>Auto DM</div>
                    <div className='text-sm text-muted-foreground'>
                      ~1 credit
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Credit Packs */}
        <section className='mt-20 px-4 sm:px-6'>
          <div className='mx-auto max-w-5xl'>
            <h2 className='text-2xl font-bold text-center mb-12'>
              Credit packs
            </h2>

            <div className='grid gap-6 md:grid-cols-3'>
              {creditPacks.map((pack, index) => (
                <div
                  key={index}
                  className={`relative rounded-2xl border p-8 ${
                    pack.popular
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-card'
                  }`}
                >
                  {pack.popular && (
                    <div className='absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground'>
                      Most Popular
                    </div>
                  )}

                  <div className='text-center'>
                    <div className='text-4xl font-bold'>{pack.credits}</div>
                    <div className='text-muted-foreground'>credits</div>

                    <div className='mt-6'>
                      <span className='text-3xl font-bold'>${pack.price}</span>
                    </div>
                    <div className='text-sm text-muted-foreground mt-1'>
                      ${(pack.price / pack.credits).toFixed(2)} per credit
                    </div>

                    <Button
                      className='w-full mt-8'
                      variant={pack.popular ? 'default' : 'outline'}
                      asChild
                    >
                      <Link href='/signup'>Buy Credits</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Credits */}
        <section className='mt-32 px-4 sm:px-6'>
          <div className='mx-auto max-w-3xl'>
            <h2 className='text-2xl font-bold text-center mb-6'>
              Why credits instead of subscriptions?
            </h2>
            <p className='text-center text-muted-foreground mb-12'>
              We believe in fair, transparent pricing that puts you in control.
            </p>

            <div className='grid gap-6 sm:grid-cols-2'>
              {[
                {
                  title: 'No waste',
                  description:
                    'Only pay for actions taken. Slow month? Use fewer credits.',
                },
                {
                  title: 'No commitment',
                  description:
                    "Credits don't expire. Use them whenever you need.",
                },
                {
                  title: 'Full control',
                  description:
                    'See exactly what each action costs. No surprises.',
                },
                {
                  title: 'Scale freely',
                  description: "Busy period? Buy more. Quiet time? Don't.",
                },
              ].map((item, index) => (
                <div key={index} className='flex gap-3'>
                  <Check className='h-5 w-5 text-primary flex-shrink-0 mt-0.5' />
                  <div>
                    <div className='font-medium'>{item.title}</div>
                    <div className='text-sm text-muted-foreground'>
                      {item.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Usage Examples */}
        <section className='mt-32 px-4 sm:px-6'>
          <div className='mx-auto max-w-4xl'>
            <h2 className='text-2xl font-bold text-center mb-6'>
              How many credits do I need?
            </h2>
            <p className='text-center text-muted-foreground mb-12'>
              Here's what typical usage looks like for different creator sizes.
            </p>

            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead>
                  <tr className='border-b border-border text-left'>
                    <th className='pb-4 font-medium'>Creator Type</th>
                    <th className='pb-4 font-medium'>Followers</th>
                    <th className='pb-4 font-medium'>Daily Comments</th>
                    <th className='pb-4 font-medium'>Monthly Credits</th>
                    <th className='pb-4 font-medium'>Recommended</th>
                  </tr>
                </thead>
                <tbody className='text-sm'>
                  {usageExamples.map((example, index) => (
                    <tr key={index} className='border-b border-border/50'>
                      <td className='py-4'>{example.persona}</td>
                      <td className='py-4 text-muted-foreground'>
                        {example.followers}
                      </td>
                      <td className='py-4 text-muted-foreground'>
                        {example.commentsPerDay}
                      </td>
                      <td className='py-4 text-muted-foreground'>
                        {example.creditsPerMonth}
                      </td>
                      <td className='py-4'>
                        <span className='rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary'>
                          {example.recommendation}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className='mt-32 px-4 sm:px-6'>
          <div className='mx-auto max-w-2xl'>
            <h2 className='text-2xl font-bold text-center mb-12'>
              Common questions
            </h2>

            <div className='space-y-6'>
              {[
                {
                  q: 'Do credits expire?',
                  a: 'No. Credits never expire. Use them at your own pace.',
                },
                {
                  q: 'Can I get a refund?',
                  a: 'Credits are non-refundable once purchased, but unused credits stay in your account forever.',
                },
                {
                  q: 'What if I run out of credits?',
                  a: "Automations pause until you add more. You'll get a notification before running low.",
                },
                {
                  q: 'Is there a free trial?',
                  a: 'Yes! New accounts get 20 free credits to test the service.',
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className='rounded-xl border border-border bg-card p-6'
                >
                  <div className='flex items-start gap-3'>
                    <HelpCircle className='h-5 w-5 text-primary flex-shrink-0 mt-0.5' />
                    <div>
                      <div className='font-medium mb-2'>{item.q}</div>
                      <div className='text-sm text-muted-foreground'>
                        {item.a}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className='mt-32 px-4 sm:px-6'>
          <div className='mx-auto max-w-3xl text-center'>
            <h2 className='text-3xl font-bold mb-4'>Ready to get started?</h2>
            <p className='text-muted-foreground mb-8'>
              Start with 20 free credits. Buy more when you're ready.
            </p>
            <Button size='lg' asChild>
              <Link href='/signup'>Buy Credits When You're Ready</Link>
            </Button>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
