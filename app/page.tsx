import Link from 'next/link';
import {
  Zap,
  ArrowRight,
  MessageCircle,
  Brain,
  Calendar,
  BarChart3,
  CheckCircle,
  Target,
  Wand2,
  Bot,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

// ─── Gradient text helper ───────────────────────────────────────────────────

function GradientText({ children }: { children: React.ReactNode }) {
  return <span className='text-gradient-indigo'>{children}</span>;
}

// ─── Section label (like CodeMouse's "— LIVE PREVIEW") ─────────────────────

function SectionLabel({ children }: { children: string }) {
  return (
    <div className='flex items-center gap-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-4'>
      <span className='h-px w-4 bg-primary/60' />
      {children}
    </div>
  );
}

// ─── Feature card ───────────────────────────────────────────────────────────

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className='group rounded-xl border border-border bg-card p-6 hover:border-primary/30 hover:bg-card/80 transition-all duration-200'>
      <div className='mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary group-hover:bg-primary/15 transition-colors'>
        {icon}
      </div>
      <h3 className='mb-2 text-sm font-semibold text-foreground'>{title}</h3>
      <p className='text-sm leading-relaxed text-muted-foreground'>
        {description}
      </p>
    </div>
  );
}

// ─── Mock automation preview ────────────────────────────────────────────────

function AutomationPreview() {
  return (
    <div className='mx-auto max-w-3xl rounded-xl border border-border bg-card overflow-hidden shadow-2xl shadow-black/40'>
      {/* Browser chrome */}
      <div className='flex items-center gap-2 border-b border-border bg-card/60 px-4 py-3'>
        <div className='flex gap-1.5'>
          <div className='h-3 w-3 rounded-full bg-red-500/70' />
          <div className='h-3 w-3 rounded-full bg-yellow-500/70' />
          <div className='h-3 w-3 rounded-full bg-green-500/70' />
        </div>
        <div className='ml-3 flex-1 rounded-md border border-border/60 bg-background/60 px-3 py-1 text-xs text-muted-foreground font-mono'>
          postengage.ai — Automation Live
        </div>
        <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
          <span className='relative flex h-2 w-2'>
            <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75' />
            <span className='relative inline-flex h-2 w-2 rounded-full bg-green-500' />
          </span>
          Active
        </div>
      </div>

      {/* Content */}
      <div className='grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border/50'>
        {/* Left: DM thread */}
        <div className='p-5 space-y-3'>
          <p className='text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4'>
            Instagram DM
          </p>

          {/* Incoming message */}
          <div className='flex items-end gap-2'>
            <div className='h-7 w-7 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0'>
              A
            </div>
            <div className='rounded-2xl rounded-bl-sm bg-secondary/60 px-3 py-2 text-sm max-w-[80%]'>
              Hey! How do I join your coaching program? 💭
            </div>
          </div>

          {/* Outgoing auto-reply */}
          <div className='flex items-end gap-2 flex-row-reverse'>
            <div className='h-7 w-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0'>
              <Zap className='h-3.5 w-3.5 text-primary' />
            </div>
            <div className='rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-sm text-primary-foreground max-w-[80%]'>
              Of course! 🙌 My 8-week program is open now — grab your spot here:{' '}
              <span className='underline opacity-80'>postengage.ai/course</span>{' '}
              Let me know if you have Qs! 💙
            </div>
          </div>

          <div className='flex items-center gap-1.5 text-xs text-muted-foreground pt-1'>
            <CheckCircle className='h-3 w-3 text-green-500' />
            Delivered in 847ms
          </div>
        </div>

        {/* Right: Intelligence panel */}
        <div className='p-5 space-y-4'>
          <p className='text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4'>
            AI Analysis
          </p>

          {/* Trigger */}
          <div className='rounded-lg border border-border/60 bg-background/40 p-3 space-y-1.5'>
            <div className='flex items-center justify-between'>
              <span className='text-xs font-medium text-muted-foreground'>
                Trigger detected
              </span>
              <span className='text-xs px-1.5 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/25 text-orange-400'>
                keyword
              </span>
            </div>
            <p className='text-xs font-mono text-foreground'>
              &ldquo;coaching program&rdquo;
            </p>
          </div>

          {/* Voice DNA match */}
          <div className='rounded-lg border border-border/60 bg-background/40 p-3 space-y-2'>
            <div className='flex items-center justify-between'>
              <span className='text-xs font-medium text-muted-foreground'>
                Voice DNA match
              </span>
              <span className='text-xs font-semibold text-primary'>94%</span>
            </div>
            <div className='h-1.5 rounded-full bg-secondary overflow-hidden'>
              <div
                className='h-full rounded-full bg-primary'
                style={{ width: '94%' }}
              />
            </div>
            <p className='text-xs text-muted-foreground'>
              Tone · Emojis · Sentence length · Warmth
            </p>
          </div>

          {/* Status */}
          <div className='flex items-center gap-2 text-xs text-green-400'>
            <CheckCircle className='h-3.5 w-3.5' />
            <span>Auto-reply sent · No human intervention needed</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const features = [
    {
      icon: <Bot className='h-5 w-5' />,
      title: 'Auto-DM on Trigger Words',
      description:
        'Set keywords like "price", "link", or "join" — PostEngage instantly replies to every DM that matches, 24/7.',
    },
    {
      icon: <Brain className='h-5 w-5' />,
      title: 'Voice DNA Technology',
      description:
        'Our AI learns your exact tone, emoji style, and sentence patterns. Every reply sounds like you wrote it personally.',
    },
    {
      icon: <MessageCircle className='h-5 w-5' />,
      title: 'Smart Comment Replies',
      description:
        'Automatically respond to comments on your posts with context-aware replies that drive engagement.',
    },
    {
      icon: <Target className='h-5 w-5' />,
      title: 'Lead Capture',
      description:
        'Convert followers into leads by collecting emails and phone numbers automatically inside DM conversations.',
    },
    {
      icon: <Calendar className='h-5 w-5' />,
      title: 'Content Scheduling',
      description:
        'Plan and schedule posts at peak engagement times. Never miss the algorithm window again.',
    },
    {
      icon: <BarChart3 className='h-5 w-5' />,
      title: 'Growth Analytics',
      description:
        'Track reply rates, engagement lift, leads generated, and automation performance in one dashboard.',
    },
  ];

  const steps = [
    {
      num: '01',
      title: 'Connect Instagram',
      description:
        'Link your Instagram account in one click. No complex setup, no API tokens.',
    },
    {
      num: '02',
      title: 'Build Your Voice DNA',
      description:
        'PostEngage analyzes your existing content and learns your unique writing style automatically.',
    },
    {
      num: '03',
      title: 'Set Your Automations',
      description:
        'Define trigger keywords, build DM flows, and set comment reply rules — visually, in minutes.',
    },
    {
      num: '04',
      title: 'Watch It Work',
      description:
        'Your bot replies to every message in your voice, around the clock. You focus on creating.',
    },
  ];

  const stats = [
    { value: '2,400+', label: 'Active creators' },
    { value: '47 hrs', label: 'Saved per month' },
    { value: '<10ms', label: 'Reply latency' },
    { value: '99.9%', label: 'Uptime SLA' },
  ];

  return (
    <div className='min-h-screen bg-background text-foreground'>
      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <nav className='sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl'>
        <div className='mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6'>
          <Link href='/' className='flex items-center gap-2.5'>
            <div className='flex h-7 w-7 items-center justify-center rounded-lg bg-primary'>
              <Zap className='h-3.5 w-3.5 text-primary-foreground' />
            </div>
            <span className='text-sm font-semibold'>PostEngage.ai</span>
          </Link>

          <div className='hidden md:flex items-center gap-6 text-sm text-muted-foreground'>
            <Link
              href='#features'
              className='hover:text-foreground transition-colors'
            >
              Features
            </Link>
            <Link
              href='#how-it-works'
              className='hover:text-foreground transition-colors'
            >
              How it works
            </Link>
            <Link
              href='/dashboard/credits/buy'
              className='hover:text-foreground transition-colors'
            >
              Pricing
            </Link>
          </div>

          <div className='flex items-center gap-2'>
            <Link
              href='/login'
              className='hidden sm:block text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5'
            >
              Sign in
            </Link>
            <Link href='/signup'>
              <button className='flex items-center gap-1.5 rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors'>
                Get started
                <ArrowRight className='h-3.5 w-3.5' />
              </button>
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* ── Hero ───────────────────────────────────────────────────────── */}
        <section className='relative overflow-hidden pt-24 pb-20'>
          {/* Grid background */}
          <div className='absolute inset-0 bg-grid-faint' />
          {/* Radial glow */}
          <div className='absolute inset-0 bg-hero-radial' />
          {/* Top blur blob */}
          <div className='absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 blur-3xl rounded-full pointer-events-none' />

          <div className='relative mx-auto max-w-4xl px-4 sm:px-6 text-center'>
            {/* Badge */}
            <div className='inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground mb-10'>
              <span className='relative flex h-2 w-2'>
                <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75' />
                <span className='relative inline-flex h-2 w-2 rounded-full bg-green-500' />
              </span>
              Now with Voice DNA — replies that sound exactly like you
              <ChevronRight className='h-3.5 w-3.5' />
            </div>

            {/* Headline */}
            <h1 className='text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] mb-6'>
              Instagram automation
              <br />
              <GradientText>that never sleeps.</GradientText>
            </h1>

            <p className='text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed'>
              PostEngage.ai replies to every DM and comment in your exact voice
              — automatically. Built for creators who scale without losing the
              personal touch.
            </p>

            {/* CTAs */}
            <div className='flex flex-col sm:flex-row items-center justify-center gap-3 mb-12'>
              <Link href='/signup'>
                <button className='flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25'>
                  <Sparkles className='h-4 w-4' />
                  Start for free
                </button>
              </Link>
              <Link href='#preview'>
                <button className='flex items-center gap-2 rounded-lg border border-border bg-card/50 px-6 py-3 text-sm font-medium text-foreground hover:bg-card transition-colors'>
                  See it in action
                </button>
              </Link>
            </div>

            {/* Feature pills */}
            <div className='flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground'>
              {[
                'No credit card required',
                'Auto-DM on trigger words',
                'Voice DNA technology',
                'Works 24/7',
              ].map(f => (
                <span key={f} className='flex items-center gap-1.5'>
                  <CheckCircle className='h-3.5 w-3.5 text-green-500' />
                  {f}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Stats ──────────────────────────────────────────────────────── */}
        <section className='border-y border-border/50 bg-card/30'>
          <div className='mx-auto max-w-6xl px-4 sm:px-6'>
            <div className='grid grid-cols-2 md:grid-cols-4 divide-x divide-border/50'>
              {stats.map(({ value, label }) => (
                <div key={label} className='py-8 text-center'>
                  <div className='text-3xl font-bold text-foreground mb-1'>
                    {value}
                  </div>
                  <div className='text-sm text-muted-foreground'>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Live Preview ───────────────────────────────────────────────── */}
        <section id='preview' className='py-24 px-4 sm:px-6'>
          <div className='mx-auto max-w-6xl'>
            <div className='text-center mb-12'>
              <SectionLabel>Live Preview</SectionLabel>
              <h2 className='text-3xl sm:text-4xl font-bold mb-4'>
                What a real automation looks like
              </h2>
              <p className='text-muted-foreground max-w-xl mx-auto'>
                Structured, on-brand, and delivered instantly — not a generic
                bot reply, but a message that&apos;s genuinely yours.
              </p>
            </div>
            <AutomationPreview />
          </div>
        </section>

        {/* ── Features ───────────────────────────────────────────────────── */}
        <section id='features' className='py-24 px-4 sm:px-6 bg-card/20'>
          <div className='mx-auto max-w-6xl'>
            <div className='text-center mb-16'>
              <SectionLabel>Capabilities</SectionLabel>
              <h2 className='text-3xl sm:text-4xl font-bold mb-4'>
                Built for serious creators
              </h2>
              <p className='text-muted-foreground max-w-xl mx-auto'>
                Not just a chatbot. A full automation platform that integrates
                into your workflow and compounds over time.
              </p>
            </div>

            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
              {features.map(f => (
                <FeatureCard key={f.title} {...f} />
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ───────────────────────────────────────────────── */}
        <section id='how-it-works' className='py-24 px-4 sm:px-6'>
          <div className='mx-auto max-w-6xl'>
            <div className='text-center mb-16'>
              <SectionLabel>Integration</SectionLabel>
              <h2 className='text-3xl sm:text-4xl font-bold mb-4'>
                Up and running in four steps
              </h2>
              <p className='text-muted-foreground max-w-xl mx-auto'>
                No YAML, no config files, no pipeline changes. Connect and
                automate in minutes.
              </p>
            </div>

            <div className='relative'>
              {/* Connecting line */}
              <div className='absolute left-[19px] top-6 bottom-6 w-px bg-gradient-to-b from-primary/60 via-primary/20 to-transparent hidden md:block' />

              <div className='space-y-8'>
                {steps.map(({ num, title, description }) => (
                  <div key={num} className='flex gap-6 group'>
                    <div className='relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-xs font-bold text-primary group-hover:bg-primary/20 transition-colors'>
                      {num}
                    </div>
                    <div className='pt-1.5 max-w-xl'>
                      <h3 className='font-semibold mb-1'>{title}</h3>
                      <p className='text-sm text-muted-foreground leading-relaxed'>
                        {description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Voice DNA spotlight ─────────────────────────────────────────── */}
        <section className='py-24 px-4 sm:px-6 bg-card/20'>
          <div className='mx-auto max-w-6xl'>
            <div className='rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background overflow-hidden'>
              <div className='grid md:grid-cols-2 gap-0'>
                <div className='p-10 lg:p-14'>
                  <div className='inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-xs font-medium text-primary mb-6'>
                    <Brain className='h-3.5 w-3.5' />
                    Voice DNA Technology
                  </div>
                  <h2 className='text-3xl font-bold mb-4'>
                    Replies that sound
                    <br />
                    <GradientText>exactly like you.</GradientText>
                  </h2>
                  <p className='text-muted-foreground leading-relaxed mb-8'>
                    Our AI studies your writing: your emoji patterns, sentence
                    length, tone, even the slang you use. Every automated reply
                    passes through Voice DNA before it&apos;s sent.
                  </p>
                  <div className='space-y-3'>
                    {[
                      'Learns from your existing Instagram content',
                      'Matches tone, warmth & directness',
                      'Auto-refines from every interaction',
                      'Up to 30 curated example replies',
                    ].map(item => (
                      <div
                        key={item}
                        className='flex items-center gap-2.5 text-sm'
                      >
                        <CheckCircle className='h-4 w-4 text-primary shrink-0' />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className='flex items-center justify-center p-10 lg:p-14 border-t md:border-t-0 md:border-l border-border/40'>
                  <div className='w-full max-w-xs space-y-3'>
                    {[
                      { label: 'Tone match', pct: 94, color: 'bg-primary' },
                      {
                        label: 'Emoji style',
                        pct: 88,
                        color: 'bg-purple-500',
                      },
                      { label: 'Warmth', pct: 97, color: 'bg-green-500' },
                      {
                        label: 'Directness',
                        pct: 82,
                        color: 'bg-blue-500',
                      },
                    ].map(({ label, pct, color }) => (
                      <div key={label}>
                        <div className='flex justify-between text-xs mb-1.5'>
                          <span className='text-muted-foreground'>{label}</span>
                          <span className='font-semibold tabular-nums'>
                            {pct}%
                          </span>
                        </div>
                        <div className='h-1.5 rounded-full bg-secondary overflow-hidden'>
                          <div
                            className={`h-full rounded-full ${color} transition-all`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    ))}

                    <div className='pt-4 border-t border-border/50 flex items-center gap-2 text-xs text-muted-foreground'>
                      <Wand2 className='h-3.5 w-3.5 text-primary' />
                      Auto-refines every 50 interactions
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ────────────────────────────────────────────────────────── */}
        <section className='relative overflow-hidden py-28 px-4 sm:px-6'>
          <div className='absolute inset-0 bg-grid-faint opacity-50' />
          <div className='absolute inset-0 bg-hero-radial' />
          <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[200px] bg-primary/8 blur-3xl rounded-full pointer-events-none' />

          <div className='relative mx-auto max-w-2xl text-center'>
            <h2 className='text-4xl sm:text-5xl font-bold mb-4'>
              Start growing today.
            </h2>
            <p className='text-xl text-muted-foreground mb-10'>
              <GradientText>Your audience is waiting.</GradientText>
            </p>
            <p className='text-muted-foreground mb-10 max-w-md mx-auto'>
              Set up your first automation in under 5 minutes. The first 1,000
              replies are on us.
            </p>
            <div className='flex flex-col sm:flex-row items-center justify-center gap-3'>
              <Link href='/signup'>
                <button className='flex items-center gap-2 rounded-lg bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30'>
                  <Sparkles className='h-4 w-4' />
                  Get started free
                </button>
              </Link>
              <Link href='/login'>
                <button className='flex items-center gap-2 rounded-lg border border-border bg-card/50 px-7 py-3.5 text-sm font-medium hover:bg-card transition-colors'>
                  Sign in
                </button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className='border-t border-border/50 bg-card/20'>
        <div className='mx-auto max-w-6xl px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4'>
          <div className='flex items-center gap-2.5'>
            <div className='flex h-6 w-6 items-center justify-center rounded-md bg-primary'>
              <Zap className='h-3 w-3 text-primary-foreground' />
            </div>
            <span className='text-sm font-semibold'>PostEngage.ai</span>
            <span className='text-xs text-muted-foreground ml-2'>© 2025</span>
          </div>

          <div className='flex items-center gap-6 text-xs text-muted-foreground'>
            <Link
              href='https://postengage.ai/privacy'
              className='hover:text-foreground transition-colors'
            >
              Privacy
            </Link>
            <Link
              href='https://postengage.ai/terms'
              className='hover:text-foreground transition-colors'
            >
              Terms
            </Link>
            <Link
              href='/dashboard'
              className='hover:text-foreground transition-colors'
            >
              Dashboard
            </Link>
            <Link
              href='/login'
              className='hover:text-foreground transition-colors'
            >
              Sign in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
