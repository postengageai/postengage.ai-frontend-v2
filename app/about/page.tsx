import { LandingHeader } from '@/components/landing/landing-header';
import { LandingFooter } from '@/components/landing/landing-footer';
import { PageHeader } from '@/components/marketing/page-header';

export default function AboutPage() {
  return (
    <div className='min-h-screen bg-background text-foreground'>
      <LandingHeader />

      <main className='pt-32 pb-20'>
        {/* Hero */}
        <section className='px-4 sm:px-6'>
          <PageHeader
            badge='About'
            title='Why we built PostEngageAI'
            description='The story behind our obsession with authentic engagement.'
          />
        </section>

        {/* Founder Story */}
        <section className='mt-20 px-4 sm:px-6'>
          <div className='mx-auto max-w-2xl'>
            <div className='prose prose-invert prose-lg'>
              <p className='text-xl text-muted-foreground leading-relaxed'>
                I've been a creator. I've managed brands. I've seen the same
                pattern everywhere: engagement is the lifeblood of growth, but
                it's also the first thing to slip when life gets busy.
              </p>

              <div className='my-12 border-l-2 border-primary pl-6'>
                <p className='text-lg italic text-muted-foreground'>
                  "Every unanswered comment is a fan who stopped believing you
                  care."
                </p>
              </div>

              <p className='text-muted-foreground leading-relaxed'>
                The existing tools felt wrong. Template-based. Robotic. They
                saved time but killed authenticity. Followers could tell.
                Engagement rates dropped. Trust eroded.
              </p>

              <p className='text-muted-foreground leading-relaxed'>
                I wanted something different. Automation that doesn't feel
                automated. AI that learns your voice instead of replacing it.
                Technology that amplifies you, not replaces you.
              </p>

              <p className='text-muted-foreground leading-relaxed'>
                That's why PostEngageAI exists.
              </p>
            </div>
          </div>
        </section>

        {/* Philosophy */}
        <section className='mt-32 px-4 sm:px-6'>
          <div className='mx-auto max-w-4xl'>
            <h2 className='text-2xl font-bold text-center mb-12'>
              What we believe
            </h2>

            <div className='grid gap-8 md:grid-cols-3'>
              {[
                {
                  title: 'Automation should feel human',
                  description:
                    "If your audience can tell it's automated, we've failed. Every response should pass the 'would I say this?' test.",
                },
                {
                  title: 'Control belongs to creators',
                  description:
                    'You decide the rules. You set the tone. You approve the voice. We just execute it at scale.',
                },
                {
                  title: 'Trust is earned, not assumed',
                  description:
                    "We use official APIs. We don't store passwords. We're transparent about what we do. Your account safety is non-negotiable.",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className='rounded-xl border border-border bg-card p-6'
                >
                  <h3 className='text-lg font-semibold mb-3'>{item.title}</h3>
                  <p className='text-sm text-muted-foreground'>
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* The Problem We Solve */}
        <section className='mt-32 px-4 sm:px-6'>
          <div className='mx-auto max-w-2xl'>
            <h2 className='text-2xl font-bold mb-8'>
              The problem we understand deeply
            </h2>

            <div className='space-y-6 text-muted-foreground'>
              <p>
                Creators are trapped in a paradox. The more successful they
                become, the less time they have to do what made them successful:
                connecting with their audience.
              </p>

              <p>
                Comments pile up. DMs go unread. Followers feel ignored. The
                algorithm notices. Engagement drops. Growth stalls. The creator
                burns out.
              </p>

              <p>
                Hiring help doesn't solve it. VAs don't know your voice.
                Agencies are expensive. Templates feel fake. The authenticity
                that built your audience slowly disappears.
              </p>

              <p className='text-foreground font-medium'>
                PostEngageAI breaks this cycle. You stay authentic. Your
                audience feels heard. You get your life back.
              </p>
            </div>
          </div>
        </section>

        {/* Vision */}
        <section className='mt-32 px-4 sm:px-6'>
          <div className='mx-auto max-w-3xl text-center'>
            <div className='rounded-2xl border border-primary/30 bg-primary/5 p-12'>
              <h2 className='text-2xl font-bold mb-6'>
                Our belief about the future
              </h2>
              <p className='text-lg text-muted-foreground'>
                We believe the best creators will be those who master the art of
                scale without losing their soul. AI won't replace human
                connection — it will enable more of it. PostEngageAI is built
                for that future.
              </p>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
