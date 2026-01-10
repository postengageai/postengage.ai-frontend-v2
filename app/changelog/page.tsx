import { LandingHeader } from '@/components/landing/landing-header';
import { LandingFooter } from '@/components/landing/landing-footer';
import { PageHeader } from '@/components/marketing/page-header';
import { Badge } from '@/components/ui/badge';

export default function ChangelogPage() {
  const changelog = [
    {
      version: '0.4.0',
      date: 'January 8, 2026',
      title: 'Voice Training Improvements',
      type: 'improvement',
      changes: [
        'Improved AI voice matching accuracy by 40%',
        'Added ability to provide negative examples (what NOT to say)',
        'Better handling of emoji and casual language patterns',
      ],
      whyItMatters:
        "Your AI responses now sound even more like you. The voice training system learns nuances that matter — like when you use emojis and when you don't.",
    },
    {
      version: '0.3.2',
      date: 'January 3, 2026',
      title: 'Credit Usage Dashboard',
      type: 'feature',
      changes: [
        'New credit usage analytics in dashboard',
        'Daily/weekly/monthly usage breakdowns',
        'Projected usage estimates',
      ],
    },
    {
      version: '0.3.1',
      date: 'December 28, 2025',
      title: 'Bug Fixes & Stability',
      type: 'fix',
      changes: [
        'Fixed issue where some Instagram comments were missed during high-traffic periods',
        'Improved reconnection handling when Instagram token expires',
        'Reduced response latency by 200ms on average',
      ],
      whyItMatters:
        'Reliability is non-negotiable. These fixes ensure PostEngageAI catches every comment, every time.',
    },
    {
      version: '0.3.0',
      date: 'December 20, 2025',
      title: 'Auto DM Launch',
      type: 'feature',
      changes: [
        'Trigger-based DM automation now available',
        'Support for new follower and story mention triggers',
        'Customizable message templates with AI enhancement',
      ],
      whyItMatters:
        'DMs are where relationships deepen. Now you can welcome every new follower personally — at scale.',
    },
    {
      version: '0.2.0',
      date: 'December 10, 2025',
      title: 'Activity Feed',
      type: 'feature',
      changes: [
        'Real-time activity feed showing AI actions',
        'Filter by action type (comment reply, DM)',
        'View original comment and AI response side-by-side',
      ],
    },
    {
      version: '0.1.0',
      date: 'December 1, 2025',
      title: 'Initial Launch',
      type: 'feature',
      changes: [
        'Instagram comment auto-reply',
        'Basic voice training',
        'Credit-based billing',
        'Dashboard with key metrics',
      ],
    },
  ];

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'feature':
        return (
          <Badge className='bg-primary/20 text-primary border-primary/30'>
            New Feature
          </Badge>
        );
      case 'improvement':
        return (
          <Badge className='bg-blue-500/20 text-blue-400 border-blue-500/30'>
            Improvement
          </Badge>
        );
      case 'fix':
        return (
          <Badge className='bg-amber-500/20 text-amber-400 border-amber-500/30'>
            Bug Fix
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className='min-h-screen bg-background text-foreground'>
      <LandingHeader />

      <main className='pt-32 pb-20'>
        {/* Hero */}
        <section className='px-4 sm:px-6'>
          <PageHeader
            badge='Changelog'
            title="What's new in PostEngageAI"
            description='A running log of improvements, fixes, and new features. We ship often.'
          />
        </section>

        {/* Changelog */}
        <section className='mt-20 px-4 sm:px-6'>
          <div className='mx-auto max-w-3xl'>
            <div className='relative'>
              {/* Timeline line */}
              <div className='absolute left-0 top-0 bottom-0 w-px bg-border md:left-20' />

              <div className='space-y-12'>
                {changelog.map((entry, index) => (
                  <div key={index} className='relative pl-8 md:pl-32'>
                    {/* Timeline dot */}
                    <div className='absolute left-0 top-2 h-2 w-2 rounded-full bg-primary md:left-20 -translate-x-0.5' />

                    {/* Date (desktop) */}
                    <div className='hidden md:block absolute left-0 top-0 w-16 text-right'>
                      <span className='text-xs text-muted-foreground font-mono'>
                        {entry.version}
                      </span>
                    </div>

                    {/* Content */}
                    <div className='rounded-xl border border-border bg-card p-6'>
                      <div className='flex flex-wrap items-center gap-3 mb-4'>
                        {getTypeBadge(entry.type)}
                        <span className='text-sm text-muted-foreground'>
                          {entry.date}
                        </span>
                        <span className='md:hidden text-xs font-mono text-muted-foreground'>
                          v{entry.version}
                        </span>
                      </div>

                      <h3 className='text-xl font-semibold mb-4'>
                        {entry.title}
                      </h3>

                      <ul className='space-y-2 mb-4'>
                        {entry.changes.map((change, changeIndex) => (
                          <li
                            key={changeIndex}
                            className='flex gap-2 text-sm text-muted-foreground'
                          >
                            <span className='text-primary'>•</span>
                            {change}
                          </li>
                        ))}
                      </ul>

                      {entry.whyItMatters && (
                        <div className='mt-4 pt-4 border-t border-border'>
                          <div className='text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2'>
                            Why this matters
                          </div>
                          <p className='text-sm text-muted-foreground'>
                            {entry.whyItMatters}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Subscribe */}
        <section className='mt-32 px-4 sm:px-6'>
          <div className='mx-auto max-w-xl text-center'>
            <h2 className='text-xl font-bold mb-4'>Stay updated</h2>
            <p className='text-sm text-muted-foreground'>
              Follow us on{' '}
              <a href='#' className='text-primary hover:underline'>
                Twitter
              </a>{' '}
              for the latest updates, or check back here regularly. We ship
              often.
            </p>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
