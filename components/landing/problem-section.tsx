'use client';

import { Clock, TrendingDown, AlertCircle, Users } from 'lucide-react';

export function ProblemSection() {
  const problems = [
    {
      icon: Clock,
      stat: '3+ hours',
      label: 'daily on comments',
      description: 'Time you could spend creating',
    },
    {
      icon: TrendingDown,
      stat: '70%',
      label: 'drop in reach',
      description: 'When engagement slows down',
    },
    {
      icon: AlertCircle,
      stat: '24 hrs',
      label: 'comment window',
      description: 'After that, algorithm ignores you',
    },
    {
      icon: Users,
      stat: '1 in 4',
      label: 'followers lost',
      description: 'Due to ignored comments',
    },
  ];

  return (
    <section className='py-16 sm:py-24 border-t border-border'>
      <div className='mx-auto max-w-6xl px-4 sm:px-6'>
        <div className='text-center max-w-2xl mx-auto mb-12'>
          <h2 className='text-2xl sm:text-3xl font-bold tracking-tight'>
            The cost of <span className='text-warning'>silence</span>
          </h2>
          <p className='mt-3 text-muted-foreground'>
            Every comment you ignore sends a signal — to followers and
            algorithms.
          </p>
        </div>

        <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-6'>
          {problems.map((problem, i) => (
            <div
              key={i}
              className='group relative rounded-xl border border-border bg-card p-6 hover:border-warning/50 transition-colors'
            >
              <div className='w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center mb-4'>
                <problem.icon className='w-5 h-5 text-warning' />
              </div>
              <div className='text-3xl font-bold text-foreground'>
                {problem.stat}
              </div>
              <div className='text-sm font-medium text-foreground mt-1'>
                {problem.label}
              </div>
              <div className='text-sm text-muted-foreground mt-2'>
                {problem.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
