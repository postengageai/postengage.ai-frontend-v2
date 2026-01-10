'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AutomationCard } from '@/components/dashboard/automation-card';
import { Plus, Bot, ArrowRight } from 'lucide-react';
import type { Automation } from '@/lib/types/dashboard';

interface AutomationsSectionProps {
  automations: Automation[];
  onToggleAutomation: (id: string) => void;
}

export function AutomationsSection({
  automations,
  onToggleAutomation,
}: AutomationsSectionProps) {
  const hasAutomations = automations.length > 0;

  return (
    <section>
      <div className='flex items-center justify-between mb-4'>
        <div>
          <h2 className='text-lg font-semibold'>Your Automations</h2>
          <p className='text-sm text-muted-foreground'>
            {hasAutomations
              ? `${automations.filter(a => a.status === 'running').length} of ${automations.length} active`
              : 'Create automations to engage automatically'}
          </p>
        </div>
        {hasAutomations && (
          <Button size='sm' asChild>
            <Link href='/dashboard/automations/new'>
              <Plus className='mr-2 h-4 w-4' />
              New Automation
            </Link>
          </Button>
        )}
      </div>

      {hasAutomations ? (
        <div className='space-y-3'>
          {automations.map(automation => (
            <AutomationCard
              key={automation.id}
              automation={automation}
              onToggle={onToggleAutomation}
            />
          ))}
        </div>
      ) : (
        <EmptyAutomationsState />
      )}
    </section>
  );
}

function EmptyAutomationsState() {
  return (
    <div className='rounded-xl border border-dashed border-border bg-card/50 p-8 text-center'>
      <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10'>
        <Bot className='h-6 w-6 text-primary' />
      </div>
      <h3 className='mt-4 font-semibold'>No automations yet</h3>
      <p className='mt-1 text-sm text-muted-foreground max-w-sm mx-auto'>
        Create your first automation to start engaging with your audience
        automatically.
      </p>

      {/* Progress-oriented steps */}
      <div className='mt-6 flex flex-col sm:flex-row items-center justify-center gap-2 text-xs text-muted-foreground'>
        <span className='flex items-center gap-1.5'>
          <span className='flex h-5 w-5 items-center justify-center rounded-full bg-success text-success-foreground text-[10px] font-bold'>
            1
          </span>
          Connect Instagram
        </span>
        <ArrowRight className='h-3 w-3 hidden sm:block' />
        <span className='flex items-center gap-1.5'>
          <span className='flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold'>
            2
          </span>
          Create automation
        </span>
        <ArrowRight className='h-3 w-3 hidden sm:block' />
        <span className='flex items-center gap-1.5'>
          <span className='flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-muted-foreground text-[10px] font-bold'>
            3
          </span>
          Watch it work
        </span>
      </div>

      <Button className='mt-6' asChild>
        <Link href='/dashboard/automations/new'>
          <Plus className='mr-2 h-4 w-4' />
          Create Your First Automation
        </Link>
      </Button>
    </div>
  );
}
