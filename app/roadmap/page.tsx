import { LandingHeader } from '@/components/landing/landing-header';
import { LandingFooter } from '@/components/landing/landing-footer';
import { PageHeader } from '@/components/marketing/page-header';
import { Circle, CircleDot, CircleDashed } from 'lucide-react';

export default function RoadmapPage() {
  const roadmapSections = [
    {
      title: 'Now',
      subtitle: 'Currently available',
      icon: CircleDot,
      iconColor: 'text-green-500',
      items: [
        {
          title: 'Instagram Comment Auto-Reply',
          description: 'AI-powered responses that match your voice.',
        },
        {
          title: 'Instagram Auto DM',
          description:
            'Trigger-based direct messages for new followers and story mentions.',
        },
        {
          title: 'Voice Training',
          description: 'Teach the AI your tone through examples.',
        },
        {
          title: 'Credit-Based Billing',
          description: 'Pay only for what you use. No subscriptions.',
        },
        {
          title: 'Activity Dashboard',
          description: 'See what PostEngageAI is doing on your behalf.',
        },
      ],
    },
    {
      title: 'Next',
      subtitle: 'Actively building',
      icon: Circle,
      iconColor: 'text-primary',
      items: [
        {
          title: 'Advanced Analytics',
          description:
            'Deeper insights into engagement patterns and response effectiveness.',
        },
        {
          title: 'Comment Filtering',
          description: 'Smarter rules for which comments to reply to.',
        },
        {
          title: 'Team Access',
          description: 'Invite collaborators to manage automations.',
        },
        {
          title: 'API Access',
          description: 'Programmatic control for power users and agencies.',
        },
      ],
    },
    {
      title: 'Later',
      subtitle: 'Exploring',
      icon: CircleDashed,
      iconColor: 'text-muted-foreground',
      items: [
        {
          title: 'TikTok Integration',
          description: 'Exploring comment automation for TikTok creators.',
        },
        {
          title: 'Twitter/X Support',
          description: 'Investigating reply automation for Twitter threads.',
        },
        {
          title: 'LinkedIn Engagement',
          description: 'Considering professional network automation.',
        },
        {
          title: 'Multi-Account Management',
          description: 'Agency-grade features for managing multiple brands.',
        },
      ],
    },
  ];

  return (
    <div className='min-h-screen bg-background text-foreground'>
      <LandingHeader />

      <main className='pt-32 pb-20'>
        {/* Hero */}
        <section className='px-4 sm:px-6'>
          <PageHeader
            badge='Roadmap'
            title="Where we're headed"
            description="A transparent look at what we're building. No promises, no deadlines — just honest direction."
          />
        </section>

        {/* Note */}
        <section className='mt-12 px-4 sm:px-6'>
          <div className='mx-auto max-w-2xl'>
            <div className='rounded-xl border border-border bg-muted/30 p-6 text-center'>
              <p className='text-sm text-muted-foreground'>
                This roadmap reflects our current thinking. Priorities shift
                based on user feedback and technical constraints. Want to
                influence what we build next?{' '}
                <a
                  href='mailto:postengage.ai@gmail.com'
                  className='text-primary hover:underline'
                >
                  Tell us what matters to you
                </a>
                .
              </p>
            </div>
          </div>
        </section>

        {/* Roadmap */}
        <section className='mt-20 px-4 sm:px-6'>
          <div className='mx-auto max-w-4xl'>
            <div className='space-y-16'>
              {roadmapSections.map((section, sectionIndex) => (
                <div key={sectionIndex}>
                  {/* Section Header */}
                  <div className='flex items-center gap-3 mb-8'>
                    <section.icon className={`h-6 w-6 ${section.iconColor}`} />
                    <div>
                      <h2 className='text-2xl font-bold'>{section.title}</h2>
                      <p className='text-sm text-muted-foreground'>
                        {section.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Items */}
                  <div className='grid gap-4 sm:grid-cols-2'>
                    {section.items.map((item, itemIndex) => (
                      <div
                        key={itemIndex}
                        className={`rounded-xl border p-6 ${
                          sectionIndex === 0
                            ? 'border-green-500/30 bg-green-500/5'
                            : sectionIndex === 1
                              ? 'border-primary/30 bg-primary/5'
                              : 'border-border bg-card'
                        }`}
                      >
                        <h3 className='font-semibold mb-2'>{item.title}</h3>
                        <p className='text-sm text-muted-foreground'>
                          {item.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Principles */}
        <section className='mt-32 px-4 sm:px-6'>
          <div className='mx-auto max-w-3xl'>
            <h2 className='text-2xl font-bold text-center mb-12'>
              How we prioritize
            </h2>

            <div className='grid gap-6 sm:grid-cols-2'>
              {[
                {
                  title: 'Reliability first',
                  description:
                    "We won't ship features that compromise stability. Your automation needs to work every time.",
                },
                {
                  title: 'User-driven',
                  description:
                    'The most requested features move up. We listen more than we assume.',
                },
                {
                  title: 'Platform-safe',
                  description:
                    "We only build what's compliant with platform policies. No shortcuts.",
                },
                {
                  title: 'Depth over breadth',
                  description:
                    "We'd rather do two things exceptionally than ten things poorly.",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className='rounded-xl border border-border bg-card p-6'
                >
                  <h3 className='font-semibold mb-2'>{item.title}</h3>
                  <p className='text-sm text-muted-foreground'>
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
