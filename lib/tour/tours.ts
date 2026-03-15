import type { DriveStep } from 'driver.js';

export type TourPageKey =
  | 'dashboard'
  | 'automations'
  | 'leads'
  | 'bots'
  | 'brand-voices'
  | 'voice-dna'
  | 'credits'
  | 'settings';

export interface TourDefinition {
  key: TourPageKey;
  title: string;
  steps: DriveStep[];
}

export const PAGE_TOURS: Record<TourPageKey, TourDefinition> = {
  dashboard: {
    key: 'dashboard',
    title: 'Dashboard Tour',
    steps: [
      {
        element: '[data-tour="sidebar-nav"]',
        popover: {
          title: '👋 Welcome to PostEngageAI!',
          description:
            'This is your main navigation. Jump between Automations, Leads, Intelligence, and Settings from here.',
          side: 'right',
          align: 'start',
        },
      },
      {
        element: '[data-tour="dashboard-stats"]',
        popover: {
          title: '📊 Your Performance at a Glance',
          description:
            'See how your bots are performing — total replies sent, leads captured, and engagement rates.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '[data-tour="sidebar-automations"]',
        popover: {
          title: '⚡ Automations',
          description:
            'Create and manage Instagram automations here. Set triggers and let your bots handle replies automatically.',
          side: 'right',
          align: 'start',
        },
      },
      {
        element: '[data-tour="sidebar-intelligence"]',
        popover: {
          title: '🤖 Intelligence Hub',
          description:
            'Configure your AI bots, brand voices, and Voice DNA. This is where your AI gets its personality.',
          side: 'right',
          align: 'start',
        },
      },
      {
        element: '[data-tour="sidebar-credits"]',
        popover: {
          title: '💳 Credits',
          description:
            'AI replies consume credits. Monitor your balance here and top up when needed.',
          side: 'right',
          align: 'end',
        },
      },
    ],
  },

  automations: {
    key: 'automations',
    title: 'Automations Tour',
    steps: [
      {
        element: '[data-tour="automations-header"]',
        popover: {
          title: '⚡ Automations',
          description:
            'Automations are the rules that trigger your AI bots. Each automation watches for a specific event on Instagram.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '[data-tour="create-automation-btn"]',
        popover: {
          title: '✨ Create Your First Automation',
          description:
            'Click here to create a new automation. You can trigger on comments, mentions, DMs, and more.',
          side: 'bottom',
          align: 'end',
        },
      },
      {
        element: '[data-tour="automations-list"]',
        popover: {
          title: '📋 Your Automations',
          description:
            'All your automations live here. Toggle them on/off, edit, or view performance stats for each one.',
          side: 'top',
          align: 'start',
        },
      },
    ],
  },

  leads: {
    key: 'leads',
    title: 'Leads Tour',
    steps: [
      {
        element: '[data-tour="leads-header"]',
        popover: {
          title: '👥 Leads',
          description:
            'When your bots interact with Instagram users, they can be captured as leads here.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '[data-tour="leads-table"]',
        popover: {
          title: '📋 Lead Database',
          description:
            'Every captured lead is listed here with their profile info, source, and conversation history.',
          side: 'top',
          align: 'start',
        },
      },
    ],
  },

  bots: {
    key: 'bots',
    title: 'Bots Tour',
    steps: [
      {
        element: '[data-tour="bots-header"]',
        popover: {
          title: '🤖 AI Bots',
          description:
            'Bots are your AI agents that reply to Instagram messages. Each bot has its own personality, brand voice, and behavior settings.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '[data-tour="create-bot-btn"]',
        popover: {
          title: '✨ Create a Bot',
          description:
            'Create your first bot here. Give it a name, connect it to a social account, and assign a brand voice.',
          side: 'bottom',
          align: 'end',
        },
      },
      {
        element: '[data-tour="bots-list"]',
        popover: {
          title: '📋 Your Bots',
          description:
            "Each card shows a bot's name, connected account, and current status. Click a bot to configure it.",
          side: 'top',
          align: 'start',
        },
      },
    ],
  },

  'brand-voices': {
    key: 'brand-voices',
    title: 'Brand Voices Tour',
    steps: [
      {
        element: '[data-tour="brand-voices-header"]',
        popover: {
          title: '🎙️ Brand Voices',
          description:
            'Brand voices define HOW your bot communicates — tone, style, vocabulary, and personality. Assign one to each bot.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '[data-tour="create-brand-voice-btn"]',
        popover: {
          title: '✨ Create a Brand Voice',
          description:
            'Define a new voice here. Write sample messages and guidelines so the AI learns your exact communication style.',
          side: 'bottom',
          align: 'end',
        },
      },
    ],
  },

  'voice-dna': {
    key: 'voice-dna',
    title: 'Voice DNA Tour',
    steps: [
      {
        element: '[data-tour="voice-dna-header"]',
        popover: {
          title: '🧬 Voice DNA',
          description:
            'Voice DNA is your unique writing fingerprint — trained from your actual Instagram replies to make the AI sound exactly like you.',
          side: 'bottom',
          align: 'start',
        },
      },
    ],
  },

  credits: {
    key: 'credits',
    title: 'Credits Tour',
    steps: [
      {
        element: '[data-tour="credits-balance"]',
        popover: {
          title: '💳 Your Credit Balance',
          description:
            'Credits are consumed when your bot sends AI-powered replies. Each reply costs credits based on the model used.',
          side: 'bottom',
          align: 'start',
        },
      },
    ],
  },

  settings: {
    key: 'settings',
    title: 'Settings Tour',
    steps: [
      {
        element: '[data-tour="settings-nav"]',
        popover: {
          title: '⚙️ Settings',
          description:
            'Manage your profile, security, connected social accounts, and app preferences here.',
          side: 'right',
          align: 'start',
        },
      },
      {
        element: '[data-tour="tour-toggle"]',
        popover: {
          title: '🎓 Product Tours',
          description:
            'You can disable product tours from here. Toggle it off to hide the tour button from all pages.',
          side: 'top',
          align: 'start',
        },
      },
    ],
  },
};

export function getPageKeyFromPath(pathname: string): TourPageKey | null {
  if (pathname === '/dashboard') return 'dashboard';
  if (pathname.startsWith('/dashboard/automations')) return 'automations';
  if (pathname.startsWith('/dashboard/leads')) return 'leads';
  if (pathname.startsWith('/dashboard/intelligence/bots')) return 'bots';
  if (pathname.startsWith('/dashboard/intelligence/brand-voices'))
    return 'brand-voices';
  if (pathname.startsWith('/dashboard/intelligence/voice-dna'))
    return 'voice-dna';
  if (pathname.startsWith('/dashboard/credits')) return 'credits';
  if (pathname.startsWith('/dashboard/settings')) return 'settings';
  return null;
}
