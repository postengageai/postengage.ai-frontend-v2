import { Link2, Sliders, Sparkles, Coffee } from 'lucide-react';

export function HowItWorksSection() {
  const steps = [
    {
      icon: Link2,
      step: '01',
      title: 'Connect Instagram',
      description:
        'Secure OAuth connection. We never store your password. Takes 30 seconds.',
    },
    {
      icon: Sliders,
      step: '02',
      title: 'Set Your Voice',
      description:
        'Answer a few questions about your tone and style. Our AI learns how you communicate.',
    },
    {
      icon: Sparkles,
      step: '03',
      title: 'Activate Automation',
      description:
        'Choose which posts to monitor. Set DM triggers. Review or auto-approve replies.',
    },
    {
      icon: Coffee,
      step: '04',
      title: 'Relax & Grow',
      description:
        'Watch engagement happen automatically. Check analytics. Focus on creating content.',
    },
  ];

  return (
    <section
      id='how-it-works'
      className='border-t border-border bg-secondary/10 py-20 sm:py-32'
    >
      <div className='mx-auto max-w-6xl px-4 sm:px-6'>
        <div className='text-center'>
          <p className='text-sm font-medium text-primary'>How It Works</p>
          <h2 className='mt-2 text-3xl font-bold tracking-tight sm:text-4xl'>
            From setup to autopilot in 5 minutes
          </h2>
          <p className='mx-auto mt-4 max-w-2xl text-muted-foreground'>
            No complex configurations. No learning curve. Just connect and let
            AI handle the rest.
          </p>
        </div>

        <div className='relative mt-16'>
          {/* Connection line */}
          <div className='absolute left-8 top-0 hidden h-full w-px bg-gradient-to-b from-primary/50 via-primary/20 to-transparent lg:left-1/2 lg:block' />

          <div className='space-y-12 lg:space-y-0'>
            {steps.map((step, i) => (
              <div
                key={i}
                className='relative lg:grid lg:grid-cols-2 lg:gap-12'
              >
                {/* Content - alternating sides */}
                <div
                  className={`${i % 2 === 0 ? 'lg:text-right' : 'lg:col-start-2'}`}
                >
                  <div
                    className={`flex items-start gap-4 ${i % 2 === 0 ? 'lg:flex-row-reverse' : ''}`}
                  >
                    <div className='flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-border bg-card'>
                      <step.icon className='h-6 w-6 text-primary' />
                    </div>
                    <div>
                      <span className='font-mono text-sm text-primary'>
                        {step.step}
                      </span>
                      <h3 className='mt-1 text-xl font-semibold'>
                        {step.title}
                      </h3>
                      <p className='mt-2 text-muted-foreground'>
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Timeline dot */}
                <div className='absolute left-8 top-6 hidden h-4 w-4 -translate-x-1/2 rounded-full border-2 border-primary bg-background lg:left-1/2 lg:block' />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
