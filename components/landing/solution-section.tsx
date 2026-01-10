'use client';

import { Check, Sparkles, MessageCircle, Send, Brain } from 'lucide-react';
import { useState } from 'react';

export function SolutionSection() {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: MessageCircle,
      title: 'Smart Comment Replies',
      description:
        'AI reads context, tone, and intent. Replies like you would — because it learned from you.',
      demo: {
        comment: "Is this still available? What's the price?",
        reply:
          "Hey! Yes it's available 🙌 Check the link in my bio for pricing, or DM me and I'll send it directly!",
      },
    },
    {
      icon: Send,
      title: 'Trigger-Based DMs',
      description:
        'Someone comments a keyword? Auto-send a personalized DM with your lead magnet or offer.',
      demo: {
        comment: 'I need this! How do I get started?',
        reply: 'Just sent you a DM with the full guide! Check your requests 📩',
      },
    },
    {
      icon: Brain,
      title: 'Your Voice, Preserved',
      description:
        "Uses your emojis, your slang, your tone. Followers can't tell it's not you.",
      demo: {
        comment: 'This is so helpful thank you!!',
        reply:
          "Ahh you're so welcome! 💕 Means everything that this helped you. More coming soon!",
      },
    },
  ];

  return (
    <section className='py-16 sm:py-24 bg-secondary/30'>
      <div className='mx-auto max-w-6xl px-4 sm:px-6'>
        <div className='text-center max-w-2xl mx-auto mb-12'>
          <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 text-success text-sm font-medium mb-4'>
            <Sparkles className='w-4 h-4' />
            The Solution
          </div>
          <h2 className='text-2xl sm:text-3xl font-bold tracking-tight'>
            AI that <span className='text-primary'>sounds like you</span>
          </h2>
          <p className='mt-3 text-muted-foreground'>
            Not generic. Not robotic. Trained on your style.
          </p>
        </div>

        <div className='grid lg:grid-cols-2 gap-8 lg:gap-12 items-start'>
          {/* Feature list */}
          <div className='space-y-4'>
            {features.map((feature, i) => (
              <button
                key={i}
                onClick={() => setActiveFeature(i)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  activeFeature === i
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card hover:border-primary/50'
                }`}
              >
                <div className='flex items-start gap-4'>
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      activeFeature === i ? 'bg-primary/20' : 'bg-secondary'
                    }`}
                  >
                    <feature.icon
                      className={`w-5 h-5 ${activeFeature === i ? 'text-primary' : 'text-muted-foreground'}`}
                    />
                  </div>
                  <div>
                    <h3 className='font-semibold'>{feature.title}</h3>
                    <p className='text-sm text-muted-foreground mt-1'>
                      {feature.description}
                    </p>
                  </div>
                  {activeFeature === i && (
                    <Check className='w-5 h-5 text-primary ml-auto shrink-0' />
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Demo preview */}
          <div className='relative'>
            <div className='rounded-xl border border-border bg-card p-6 sticky top-24'>
              <div className='text-xs text-muted-foreground uppercase tracking-wider mb-4'>
                Live Preview
              </div>

              {/* Comment */}
              <div className='flex gap-3 mb-4'>
                <div className='w-8 h-8 rounded-full bg-secondary shrink-0' />
                <div className='flex-1'>
                  <p className='text-sm font-medium'>@potential_customer</p>
                  <p className='text-sm text-muted-foreground mt-1'>
                    "{features[activeFeature].demo.comment}"
                  </p>
                </div>
              </div>

              {/* AI Reply */}
              <div className='flex gap-3 ml-6'>
                <div className='w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 shrink-0 flex items-center justify-center'>
                  <Sparkles className='w-4 h-4 text-white' />
                </div>
                <div className='flex-1'>
                  <div className='flex items-center gap-2'>
                    <p className='text-sm font-medium'>@your_brand</p>
                    <span className='text-[10px] px-1.5 py-0.5 rounded bg-success/10 text-success font-medium'>
                      AI Reply
                    </span>
                  </div>
                  <p className='text-sm mt-1'>
                    "{features[activeFeature].demo.reply}"
                  </p>
                </div>
              </div>

              <div className='mt-6 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground'>
                <span>Response time: 4 seconds</span>
                <span className='text-success'>1 credit used</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
