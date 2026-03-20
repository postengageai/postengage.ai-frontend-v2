/**
 * Centralised query key factory.
 *
 * Keeping keys in one place means:
 *  - No typos across pages
 *  - Easy targeted invalidation (e.g. invalidateQueries({ queryKey: leads.all }))
 *  - IDE auto-complete everywhere
 */

export const queryKeys = {
  // ── Auth / User ────────────────────────────────────────────────────────────
  user: {
    all: ['user'] as const,
    profile: () => [...queryKeys.user.all, 'profile'] as const,
  },

  // ── Dashboard ──────────────────────────────────────────────────────────────
  dashboard: {
    all: ['dashboard'] as const,
    stats: () => [...queryKeys.dashboard.all, 'stats'] as const,
    health: () => [...queryKeys.dashboard.all, 'health'] as const,
    conversationChart: (days: number) =>
      [...queryKeys.dashboard.all, 'conversation-chart', days] as const,
  },

  // ── Leads ──────────────────────────────────────────────────────────────────
  leads: {
    all: ['leads'] as const,
    lists: () => [...queryKeys.leads.all, 'list'] as const,
    list: (params: Record<string, unknown>) =>
      [...queryKeys.leads.lists(), params] as const,
    detail: (id: string) => [...queryKeys.leads.all, 'detail', id] as const,
    tags: () => [...queryKeys.leads.all, 'tags'] as const,
  },

  // ── Bots / Intelligence ────────────────────────────────────────────────────
  bots: {
    all: ['bots'] as const,
    lists: () => [...queryKeys.bots.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.bots.all, 'detail', id] as const,
  },

  brandVoices: {
    all: ['brand-voices'] as const,
    lists: () => [...queryKeys.brandVoices.all, 'list'] as const,
    detail: (id: string) =>
      [...queryKeys.brandVoices.all, 'detail', id] as const,
  },

  // ── Social Accounts ────────────────────────────────────────────────────────
  socialAccounts: {
    all: ['social-accounts'] as const,
    list: (params?: Record<string, unknown>) =>
      [...queryKeys.socialAccounts.all, 'list', params ?? {}] as const,
  },

  // ── Credits ────────────────────────────────────────────────────────────────
  credits: {
    all: ['credits'] as const,
    balance: () => [...queryKeys.credits.all, 'balance'] as const,
  },

  // ── Automations ────────────────────────────────────────────────────────────
  automations: {
    all: ['automations'] as const,
    lists: () => [...queryKeys.automations.all, 'list'] as const,
    detail: (id: string) =>
      [...queryKeys.automations.all, 'detail', id] as const,
  },

  // ── Notifications ──────────────────────────────────────────────────────────
  notifications: {
    all: ['notifications'] as const,
    list: () => [...queryKeys.notifications.all, 'list'] as const,
  },
} as const;
