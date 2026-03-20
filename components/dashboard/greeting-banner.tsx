'use client';

import { useMemo } from 'react';
import { MessageSquare, Clock, Flame, Users } from 'lucide-react';
import type { DashboardImpact } from '@/lib/api/dashboard';

interface GreetingBannerProps {
  username?: string;
  impact?: DashboardImpact;
  topIntentToday?: string | null;
  uniquePeopleEngaged?: number;
}

export function GreetingBanner({
  username,
  impact,
  topIntentToday,
  uniquePeopleEngaged = 0,
}: GreetingBannerProps) {
  const hour = new Date().getHours();

  const timeOfDay = useMemo(() => {
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  }, [hour]);

  const repliesHandled = impact?.replies_handled_today ?? 0;
  const hoursSaved = impact?.hours_saved_today ?? 0;
  const hotLeads = impact?.hot_leads_today ?? 0;

  const greeting = useMemo(() => {
    const name = username ? `, ${username}` : '';
    if (repliesHandled === 0) {
      return `Good ${timeOfDay}${name}. Your bot is ready and waiting for the first message.`;
    }
    if (timeOfDay === 'morning') {
      return `Good morning${name}. Your bot already sent ${repliesHandled} ${repliesHandled === 1 ? 'reply' : 'replies'} while you slept.`;
    }
    if (timeOfDay === 'evening' || timeOfDay === 'night') {
      const saved =
        hoursSaved >= 1
          ? `~${hoursSaved}h saved`
          : `~${Math.round(hoursSaved * 60)}m saved`;
      return `Wrapping up${name}: ${repliesHandled} auto-replies today, ${saved}.${hotLeads > 0 ? ` ${hotLeads} hot lead${hotLeads > 1 ? 's' : ''} detected.` : ''}`;
    }
    return `Your bot is having a good day${name} — ${repliesHandled} conversations handled${hotLeads > 0 ? `, ${hotLeads} new lead${hotLeads > 1 ? 's' : ''}` : ''}.`;
  }, [username, timeOfDay, repliesHandled, hoursSaved, hotLeads]);

  const subText = useMemo(() => {
    if (topIntentToday) {
      const label = topIntentToday.replace(/_/g, ' ');
      return `Top question today: "${label}"`;
    }
    if (uniquePeopleEngaged > 0) {
      return `${uniquePeopleEngaged} unique people reached this month`;
    }
    return null;
  }, [topIntentToday, uniquePeopleEngaged]);

  return (
    <div className='space-y-3'>
      {/* Main greeting */}
      <div>
        <h1 className='text-xl sm:text-2xl font-bold text-foreground tracking-tight'>
          {greeting}
        </h1>
        {subText && (
          <p className='text-sm text-muted-foreground mt-1'>{subText}</p>
        )}
      </div>

      {/* Stat pills — only show when there's activity */}
      {repliesHandled > 0 && (
        <div className='flex flex-wrap gap-2'>
          <StatPill
            icon={<MessageSquare className='h-3.5 w-3.5' />}
            label={`${repliesHandled} ${repliesHandled === 1 ? 'reply' : 'replies'} today`}
            color='blue'
          />
          {hoursSaved > 0 && (
            <StatPill
              icon={<Clock className='h-3.5 w-3.5' />}
              label={`${hoursSaved >= 1 ? `~${hoursSaved}h` : `~${Math.round(hoursSaved * 60)}m`} saved`}
              color='violet'
            />
          )}
          {hotLeads > 0 && (
            <StatPill
              icon={<Flame className='h-3.5 w-3.5' />}
              label={`${hotLeads} hot lead${hotLeads > 1 ? 's' : ''}`}
              color='orange'
            />
          )}
          {uniquePeopleEngaged > 0 && (
            <StatPill
              icon={<Users className='h-3.5 w-3.5' />}
              label={`${uniquePeopleEngaged} people this month`}
              color='green'
            />
          )}
        </div>
      )}
    </div>
  );
}

type PillColor = 'blue' | 'violet' | 'orange' | 'green';

const colorMap: Record<PillColor, string> = {
  blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  violet: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  green: 'bg-green-500/10 text-green-400 border-green-500/20',
};

function StatPill({
  icon,
  label,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  color: PillColor;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${colorMap[color]}`}
    >
      {icon}
      {label}
    </span>
  );
}
