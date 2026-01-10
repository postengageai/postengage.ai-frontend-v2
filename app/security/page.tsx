import { LandingHeader } from '@/components/landing/landing-header';
import { LandingFooter } from '@/components/landing/landing-footer';
import { PageHeader } from '@/components/marketing/page-header';
import { Shield, Lock, Eye, Server, Key, RefreshCw } from 'lucide-react';

export default function SecurityPage() {
  const securityPrinciples = [
    {
      icon: Key,
      title: 'Official API Access Only',
      description:
        "We connect to Instagram exclusively through Meta's official APIs. No screen scraping. No unofficial methods. This protects your account from violations.",
    },
    {
      icon: Lock,
      title: 'No Password Storage',
      description:
        'We never ask for or store your Instagram password. Authentication happens directly with Meta using OAuth. We only receive access tokens.',
    },
    {
      icon: Eye,
      title: 'Your Data Stays Yours',
      description:
        "We don't sell, share, or monetize your data. Period. Your comments, messages, and engagement patterns are used only to power your automations.",
    },
    {
      icon: RefreshCw,
      title: 'Disconnect Anytime',
      description:
        'One click disconnects your Instagram account. When you disconnect, we immediately revoke our access and delete cached content.',
    },
    {
      icon: Shield,
      title: 'User-Controlled Automation',
      description:
        'You define every rule. You approve the voice. You control when and how the AI responds. We never take action without your configured permission.',
    },
    {
      icon: Server,
      title: 'Secure Infrastructure',
      description:
        'All data is encrypted in transit and at rest. We use industry-standard security practices and regularly audit our systems.',
    },
  ];

  return (
    <div className='min-h-screen bg-background text-foreground'>
      <LandingHeader />

      <main className='pt-32 pb-20'>
        {/* Hero */}
        <section className='px-4 sm:px-6'>
          <PageHeader
            badge='Security'
            title='Your trust is our foundation'
            description="We understand you're giving us access to your audience. Here's exactly how we protect that responsibility."
          />
        </section>

        {/* Commitment */}
        <section className='mt-20 px-4 sm:px-6'>
          <div className='mx-auto max-w-3xl'>
            <div className='rounded-2xl border border-primary/30 bg-primary/5 p-8 text-center'>
              <Shield className='h-12 w-12 text-primary mx-auto mb-6' />
              <h2 className='text-2xl font-bold mb-4'>
                Our Security Commitment
              </h2>
              <p className='text-muted-foreground'>
                Security isn't an afterthought at PostEngageAI — it's a core
                product feature. We've built every system with your account
                safety as the primary concern.
              </p>
            </div>
          </div>
        </section>

        {/* Security Principles */}
        <section className='mt-20 px-4 sm:px-6'>
          <div className='mx-auto max-w-5xl'>
            <h2 className='text-2xl font-bold text-center mb-12'>
              How we keep you safe
            </h2>

            <div className='grid gap-6 md:grid-cols-2'>
              {securityPrinciples.map((principle, index) => (
                <div
                  key={index}
                  className='rounded-xl border border-border bg-card p-6'
                >
                  <div className='flex items-start gap-4'>
                    <div className='flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center'>
                      <principle.icon className='h-5 w-5 text-primary' />
                    </div>
                    <div>
                      <h3 className='font-semibold mb-2'>{principle.title}</h3>
                      <p className='text-sm text-muted-foreground'>
                        {principle.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Instagram Compliance */}
        <section className='mt-32 px-4 sm:px-6'>
          <div className='mx-auto max-w-3xl'>
            <h2 className='text-2xl font-bold text-center mb-6'>
              Instagram / Meta Compliance
            </h2>
            <p className='text-center text-muted-foreground mb-12'>
              We operate strictly within Meta's Platform Terms and Developer
              Policies.
            </p>

            <div className='space-y-4'>
              {[
                'We use official Instagram Graph API and Messaging API',
                'All required permissions are clearly disclosed during connection',
                'We comply with rate limits and usage policies',
                'User data handling follows Meta Platform Terms',
                'We respond to data deletion requests within 7 days',
              ].map((item, index) => (
                <div
                  key={index}
                  className='flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3'
                >
                  <Shield className='h-4 w-4 text-green-500 flex-shrink-0' />
                  <span className='text-sm'>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What We Never Do */}
        <section className='mt-32 px-4 sm:px-6'>
          <div className='mx-auto max-w-3xl'>
            <h2 className='text-2xl font-bold text-center mb-12'>
              What we never do
            </h2>

            <div className='grid gap-4 sm:grid-cols-2'>
              {[
                'Sell or share your data',
                'Store your Instagram password',
                'Post without your permission',
                "Access DMs you haven't configured",
                'Use unofficial or scraped APIs',
                'Share data with third-party advertisers',
              ].map((item, index) => (
                <div
                  key={index}
                  className='flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3'
                >
                  <span className='text-red-500 font-bold'>✕</span>
                  <span className='text-sm'>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className='mt-32 px-4 sm:px-6'>
          <div className='mx-auto max-w-xl text-center'>
            <h2 className='text-xl font-bold mb-4'>Security questions?</h2>
            <p className='text-sm text-muted-foreground mb-4'>
              We're happy to answer any questions about how we handle your data
              and protect your account.
            </p>
            <a
              href='mailto:postengage.ai@gmail.com'
              className='text-primary hover:underline'
            >
              postengage.ai@gmail.com
            </a>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
