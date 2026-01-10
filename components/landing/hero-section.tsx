'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, MessageCircle, Heart, Send, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

export function HeroSection() {
  const [ignoredCount, setIgnoredCount] = useState(2847);
  const [showReply, setShowReply] = useState(false);

  // Simulate comments being ignored in real-time
  useEffect(() => {
    const interval = setInterval(() => {
      setIgnoredCount(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Show AI reply animation
  useEffect(() => {
    const timeout = setTimeout(() => setShowReply(true), 1500);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <section className='relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-24'>
      {/* Subtle radial gradient */}
      <div className='pointer-events-none absolute inset-0'>
        <div className='absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-primary/8 via-primary/3 to-transparent rounded-full blur-3xl' />
      </div>

      <div className='relative mx-auto max-w-6xl px-4 sm:px-6'>
        {/* Live counter badge */}
        <div className='flex justify-center mb-8'>
          <div className='inline-flex items-center gap-3 rounded-full border border-warning/30 bg-warning/5 px-4 py-2'>
            <span className='relative flex h-2 w-2'>
              <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-warning opacity-75'></span>
              <span className='relative inline-flex rounded-full h-2 w-2 bg-warning'></span>
            </span>
            <span className='text-sm text-warning'>
              <span className='font-mono font-bold'>
                {ignoredCount.toLocaleString()}
              </span>{' '}
              comments ignored by creators today
            </span>
          </div>
        </div>

        <div className='grid lg:grid-cols-2 gap-12 lg:gap-16 items-center'>
          {/* Left: Copy */}
          <div className='text-center lg:text-left'>
            <h1 className='text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]'>
              <span className='text-muted-foreground'>Stop ignoring</span>
              <br />
              <span className='text-foreground'>your comments.</span>
            </h1>

            <p className='mt-6 text-lg sm:text-xl text-muted-foreground max-w-lg mx-auto lg:mx-0'>
              Every unanswered comment is a lost follower, a missed sale, a
              dying algorithm.
              <span className='text-foreground font-medium'>
                {' '}
                PostEngageAI replies in your voice — automatically.
              </span>
            </p>

            <div className='mt-8 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start'>
              <Button
                size='lg'
                className='min-w-[200px] h-12 text-base'
                asChild
              >
                <Link href='/signup'>
                  Start Replying Now
                  <ArrowRight className='ml-2 h-4 w-4' />
                </Link>
              </Button>
              <span className='text-sm text-muted-foreground'>
                50 free replies • No credit card
              </span>
            </div>

            {/* Social proof strip */}
            <div className='mt-10 pt-8 border-t border-border'>
              <div className='flex items-center gap-6 justify-center lg:justify-start flex-wrap'>
                <div className='flex -space-x-2'>
                  {[1, 2, 3, 4, 5].map(i => (
                    <div
                      key={i}
                      className='w-8 h-8 rounded-full border-2 border-background bg-secondary'
                    />
                  ))}
                </div>
                <div className='text-sm'>
                  <span className='font-semibold text-foreground'>2,400+</span>
                  <span className='text-muted-foreground'>
                    {' '}
                    creators saving{' '}
                  </span>
                  <span className='font-semibold text-foreground'>
                    47 hours/month
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Instagram-like demo */}
          <div className='relative'>
            {/* Phone frame */}
            <div className='relative mx-auto max-w-[320px] lg:max-w-[360px]'>
              <div className='rounded-[2.5rem] border border-border bg-card p-2 shadow-2xl shadow-black/20'>
                <div className='rounded-[2rem] overflow-hidden bg-background'>
                  {/* Instagram post header */}
                  <div className='flex items-center gap-3 p-3 border-b border-border'>
                    <div className='w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60' />
                    <div className='flex-1'>
                      <p className='text-sm font-semibold'>your_brand</p>
                    </div>
                  </div>

                  {/* Post image placeholder */}
                  <div className='aspect-square bg-secondary/50 flex items-center justify-center'>
                    <div className='text-center p-4'>
                      <div className='w-16 h-16 mx-auto mb-3 rounded-xl bg-primary/10 flex items-center justify-center'>
                        <Heart className='w-8 h-8 text-primary' />
                      </div>
                      <p className='text-sm text-muted-foreground'>
                        Your latest post
                      </p>
                    </div>
                  </div>

                  {/* Engagement bar */}
                  <div className='flex items-center gap-4 p-3 border-b border-border'>
                    <Heart className='w-6 h-6' />
                    <MessageCircle className='w-6 h-6' />
                    <Send className='w-6 h-6' />
                  </div>

                  {/* Comments section */}
                  <div className='p-3 space-y-3 min-h-[180px]'>
                    {/* Incoming comment */}
                    <div className='flex gap-2'>
                      <div className='w-7 h-7 rounded-full bg-secondary shrink-0' />
                      <div>
                        <p className='text-sm'>
                          <span className='font-semibold'>@sarah_creates</span>
                          <span className='text-muted-foreground ml-2'>
                            Omg love this! Where did you get that? 😍
                          </span>
                        </p>
                        <p className='text-xs text-muted-foreground mt-0.5 flex items-center gap-2'>
                          <Clock className='w-3 h-3' /> 2s ago
                        </p>
                      </div>
                    </div>

                    {/* AI Reply - animated */}
                    <div
                      className={`flex gap-2 transition-all duration-500 ${
                        showReply
                          ? 'opacity-100 translate-y-0'
                          : 'opacity-0 translate-y-2'
                      }`}
                    >
                      <div className='w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary/60 shrink-0 flex items-center justify-center'>
                        <span className='text-[10px] text-white font-bold'>
                          AI
                        </span>
                      </div>
                      <div className='flex-1'>
                        <div className='bg-primary/10 rounded-xl rounded-tl-none p-2.5'>
                          <p className='text-sm'>
                            <span className='font-semibold text-primary'>
                              your_brand
                            </span>
                            <span className='text-foreground ml-2'>
                              Thank you Sarah! 💕 It's from the new collection -
                              link in bio! DM me if you need help picking a size
                              🛍️
                            </span>
                          </p>
                        </div>
                        <div className='flex items-center gap-2 mt-1'>
                          <span className='text-[10px] px-1.5 py-0.5 rounded bg-success/10 text-success font-medium'>
                            Replied by AI
                          </span>
                          <span className='text-xs text-muted-foreground'>
                            just now
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating notification */}
              <div
                className={`absolute -right-4 top-20 bg-card border border-border rounded-lg p-3 shadow-lg transition-all duration-700 ${showReply ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}
              >
                <div className='flex items-center gap-2'>
                  <div className='w-8 h-8 rounded-full bg-success/10 flex items-center justify-center'>
                    <MessageCircle className='w-4 h-4 text-success' />
                  </div>
                  <div>
                    <p className='text-xs font-medium'>Comment Handled</p>
                    <p className='text-[10px] text-muted-foreground'>
                      In your voice
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
