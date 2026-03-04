import { Page, Route } from '@playwright/test';

/**
 * PostEngage.ai API Mock Helper
 *
 * Intercepts API calls and returns mock responses matching the API contracts.
 * All mock data shapes match the types defined in lib/types/*.ts
 */

// ─── Standard response wrapper ───
function successResponse<T>(data: T, pagination?: Record<string, unknown>) {
  return {
    success: true,
    data,
    ...(pagination ? { pagination } : {}),
    meta: {
      request_id: `req_${Date.now()}`,
      timestamp: new Date().toISOString(),
    },
  };
}

// ─── Mock Data ───

export const mockUser = {
  id: 'user_001',
  email: 'sanjeev@postengage.ai',
  first_name: 'Sanjeev',
  last_name: 'Sharma',
  avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=SS',
  bio: 'Building PostEngage.ai',
  role: 'admin' as const,
  account_status: 'active' as const,
  email_verified: true,
  plan: 'pro' as const,
  created_at: '2025-01-15T00:00:00Z',
  updated_at: '2026-03-01T00:00:00Z',
};

export const mockDashboardStats = {
  user: {
    id: mockUser.id,
    email: mockUser.email,
    first_name: mockUser.first_name,
    plan: mockUser.plan,
    status: mockUser.account_status,
  },
  metrics: {
    total_accounts: 3,
    total_bots: 2,
    total_automations: 5,
    total_leads: 142,
    unread_notifications: 4,
  },
  credits: {
    balance: 850,
    monthly_allocation: 1000,
    usage_percentage: 15,
    status: 'active' as const,
  },
  recent_activity: {
    last_interaction: '2026-03-03T10:30:00Z',
    today_interactions: 37,
    today_leads: 5,
  },
  social_accounts: [
    {
      id: 'sa_001',
      platform: 'instagram',
      username: 'postengage',
      followers: 12500,
      is_primary: true,
      status: 'active',
    },
    {
      id: 'sa_002',
      platform: 'instagram',
      username: 'webcoderspeed',
      followers: 5200,
      is_primary: false,
      status: 'active',
    },
  ],
  active_automations: 3,
  scheduled_tasks: 1,
  alerts: [
    {
      type: 'info' as const,
      message: 'New feature: Voice DNA is now available!',
    },
  ],
};

export const mockAutomations = [
  {
    id: 'auto_001',
    user_id: 'user_001',
    name: 'Welcome DM on Follow',
    description: 'Send welcome message when someone follows',
    status: 'active' as const,
    triggers: [
      {
        type: 'direct_message' as const,
        platform: 'instagram',
        social_account_id: 'sa_001',
      },
    ],
    actions: [
      {
        type: 'send_message' as const,
        params: { message: 'Thanks for following! 🙌' },
        order: 1,
      },
    ],
    total_runs: 245,
    last_run_at: '2026-03-03T09:45:00Z',
    created_at: '2026-01-20T00:00:00Z',
    updated_at: '2026-03-03T09:45:00Z',
  },
  {
    id: 'auto_002',
    user_id: 'user_001',
    name: 'Comment Auto-Reply',
    description: 'Reply to comments with keyword triggers',
    status: 'active' as const,
    triggers: [
      {
        type: 'comment_received' as const,
        platform: 'instagram',
        social_account_id: 'sa_001',
        conditions: [
          {
            field: 'text',
            operator: 'contains' as const,
            value: 'price',
          },
        ],
      },
    ],
    actions: [
      {
        type: 'send_message' as const,
        params: { message: 'Check our bio for pricing details!' },
        order: 1,
      },
      {
        type: 'capture_lead' as const,
        params: {},
        order: 2,
      },
    ],
    total_runs: 89,
    last_run_at: '2026-03-02T15:30:00Z',
    created_at: '2026-02-10T00:00:00Z',
    updated_at: '2026-03-02T15:30:00Z',
  },
  {
    id: 'auto_003',
    user_id: 'user_001',
    name: 'Story Mention Thank You',
    status: 'inactive' as const,
    triggers: [
      {
        type: 'story_mention' as const,
        platform: 'instagram',
        social_account_id: 'sa_001',
      },
    ],
    actions: [
      {
        type: 'send_message' as const,
        params: { message: 'Thanks for the mention! ❤️' },
        order: 1,
      },
    ],
    total_runs: 12,
    created_at: '2026-02-25T00:00:00Z',
    updated_at: '2026-02-28T00:00:00Z',
  },
];

export const mockLeads = Array.from({ length: 10 }, (_, i) => ({
  id: `lead_${String(i + 1).padStart(3, '0')}`,
  user_id: 'user_001',
  social_account_id: 'sa_001',
  platform: 'instagram',
  platform_user_id: `ig_user_${i + 1}`,
  username: `user_${i + 1}`,
  full_name: `Lead User ${i + 1}`,
  email: i % 3 === 0 ? `lead${i + 1}@example.com` : undefined,
  avatar: `https://api.dicebear.com/7.x/initials/svg?seed=LU${i}`,
  status:
    i % 4 === 0
      ? 'new'
      : i % 4 === 1
        ? 'contacted'
        : i % 4 === 2
          ? 'qualified'
          : 'converted',
  captured_from: 'comment' as const,
  tags: ['instagram', i % 2 === 0 ? 'hot' : 'warm'],
  notes: `Lead captured from automation`,
  created_at: new Date(2026, 1, 15 + i).toISOString(),
  updated_at: new Date(2026, 2, 1 + i).toISOString(),
}));

export const mockNotifications = Array.from({ length: 5 }, (_, i) => ({
  id: `notif_${String(i + 1).padStart(3, '0')}`,
  user_id: 'user_001',
  type: ['automation', 'lead', 'payment', 'social', 'system'][i] as
    | 'automation'
    | 'lead'
    | 'payment'
    | 'social'
    | 'system',
  title: [
    'Automation triggered',
    'New lead captured',
    'Payment received',
    'Account connected',
    'System update',
  ][i],
  message: `Notification message ${i + 1}`,
  is_read: i >= 3,
  created_at: new Date(2026, 2, 3, 10 - i).toISOString(),
  read_at: i >= 3 ? new Date(2026, 2, 3, 11 - i).toISOString() : undefined,
}));

export const mockBots = [
  {
    id: 'bot_001',
    user_id: 'user_001',
    name: 'Sales Bot',
    description: 'Handles product inquiries',
    platform: 'instagram',
    social_account_id: 'sa_001',
    status: 'active' as const,
    behavior: {
      response_style: 'professional',
      tone: 'friendly',
      language: 'en',
      max_response_length: 500,
      cta_aggressiveness: 'MODERATE' as const,
    },
    knowledge_sources: [],
    quality_score: 87,
    total_interactions: 320,
    created_at: '2026-01-10T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'bot_002',
    user_id: 'user_001',
    name: 'Support Bot',
    description: 'Answers FAQs',
    platform: 'instagram',
    social_account_id: 'sa_002',
    status: 'training' as const,
    behavior: {
      response_style: 'helpful',
      tone: 'empathetic',
      language: 'en',
      max_response_length: 300,
      cta_aggressiveness: 'LOW' as const,
    },
    knowledge_sources: [
      {
        id: 'ks_001',
        source_type: 'text' as const,
        content: 'Our refund policy...',
        title: 'Refund Policy',
        status: 'ready' as const,
        created_at: '2026-02-01T00:00:00Z',
      },
    ],
    quality_score: 72,
    total_interactions: 45,
    created_at: '2026-02-15T00:00:00Z',
    updated_at: '2026-03-02T00:00:00Z',
  },
];

export const mockCreditBalance = {
  user_id: 'user_001',
  balance: 850,
  currency: 'USD',
  plan: 'pro',
  monthly_allocation: 1000,
  reset_date: '2026-04-01T00:00:00Z',
  usage_percentage: 15,
  status: 'active' as const,
};

export const mockJobs = [
  {
    job_id: 'job_001',
    status: 'completed' as const,
    type: 'export_leads' as const,
    progress: 100,
    result: { export_url: '/exports/leads_2026_03.csv', record_count: 142 },
    created_at: '2026-03-03T08:00:00Z',
    updated_at: '2026-03-03T08:02:00Z',
    completed_at: '2026-03-03T08:02:00Z',
  },
  {
    job_id: 'job_002',
    status: 'processing' as const,
    type: 'export_analytics' as const,
    progress: 65,
    created_at: '2026-03-03T10:00:00Z',
    updated_at: '2026-03-03T10:01:00Z',
  },
];

export const mockSocialAccounts = [
  {
    id: 'sa_001',
    user_id: 'user_001',
    platform: 'instagram',
    platform_user_id: 'ig_12345',
    username: 'postengage',
    display_name: 'PostEngage Official',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=PE',
    bio: 'Social engagement automation',
    followers_count: 12500,
    following_count: 340,
    status: 'active' as const,
    is_verified: false,
    connected_at: '2025-12-01T00:00:00Z',
    last_synced_at: '2026-03-03T10:00:00Z',
    created_at: '2025-12-01T00:00:00Z',
    updated_at: '2026-03-03T10:00:00Z',
  },
];

// ─── Route Handler Setup ───

/**
 * Sets up all API mocks for a page.
 * Call this in beforeEach or at the start of tests.
 */
export async function setupApiMocks(page: Page) {
  // Auth
  await page.route('**/api/auth/me', (route: Route) =>
    route.fulfill({ json: successResponse(mockUser) })
  );
  await page.route('**/api/auth/login', (route: Route) =>
    route.fulfill({ json: successResponse(mockUser) })
  );
  await page.route('**/api/auth/register', (route: Route) =>
    route.fulfill({ json: successResponse(mockUser) })
  );
  await page.route('**/api/auth/logout', (route: Route) =>
    route.fulfill({ json: successResponse({ message: 'Logged out' }) })
  );
  await page.route('**/api/auth/refresh', (route: Route) =>
    route.fulfill({ json: successResponse({ message: 'Token refreshed' }) })
  );

  // Dashboard
  await page.route('**/api/dashboard/stats', (route: Route) =>
    route.fulfill({ json: successResponse(mockDashboardStats) })
  );

  // Automations
  await page.route('**/api/automations', (route: Route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({
        json: successResponse(mockAutomations, { has_more: false }),
      });
    }
    if (route.request().method() === 'POST') {
      return route.fulfill({
        json: successResponse({ ...mockAutomations[0], id: 'auto_new' }),
      });
    }
    return route.continue();
  });
  await page.route('**/api/automations/*/toggle', (route: Route) =>
    route.fulfill({
      json: successResponse({ ...mockAutomations[0], status: 'inactive' }),
    })
  );
  await page.route('**/api/automations/*', (route: Route) => {
    const id = route.request().url().split('/').pop();
    const auto = mockAutomations.find(a => a.id === id) || mockAutomations[0];
    return route.fulfill({ json: successResponse(auto) });
  });

  // Leads
  await page.route('**/api/leads*', (route: Route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({
        json: successResponse(mockLeads, {
          has_more: false,
          limit: 20,
        }),
      });
    }
    return route.continue();
  });

  // Notifications
  await page.route('**/api/notifications', (route: Route) =>
    route.fulfill({
      json: successResponse(mockNotifications, { has_more: false }),
    })
  );
  await page.route('**/api/notifications/unread-count', (route: Route) =>
    route.fulfill({
      json: successResponse({ unread_count: 3, total_count: 5 }),
    })
  );
  await page.route('**/api/notifications/*/read', (route: Route) =>
    route.fulfill({
      json: successResponse({
        id: 'notif_001',
        is_read: true,
        read_at: new Date().toISOString(),
      }),
    })
  );
  await page.route('**/api/notifications/mark-all-read', (route: Route) =>
    route.fulfill({
      json: successResponse({ marked_count: 3, message: 'All marked as read' }),
    })
  );

  // Intelligence / Bots
  await page.route('**/api/intelligence/bots', (route: Route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({
        json: successResponse(mockBots, { has_more: false }),
      });
    }
    if (route.request().method() === 'POST') {
      return route.fulfill({
        json: successResponse({ ...mockBots[0], id: 'bot_new' }),
      });
    }
    return route.continue();
  });
  await page.route('**/api/intelligence/bots/*', (route: Route) => {
    const parts = route.request().url().split('/');
    const botId = parts[parts.indexOf('bots') + 1];
    const bot = mockBots.find(b => b.id === botId) || mockBots[0];
    return route.fulfill({ json: successResponse(bot) });
  });

  // Credits
  await page.route('**/api/credits/balance', (route: Route) =>
    route.fulfill({ json: successResponse(mockCreditBalance) })
  );
  await page.route('**/api/credits/transactions*', (route: Route) =>
    route.fulfill({ json: successResponse([]) })
  );
  await page.route('**/api/credits/usage*', (route: Route) =>
    route.fulfill({
      json: successResponse({
        period: 'month',
        total_used: 150,
        breakdown: [
          {
            feature: 'bot_responses',
            credits_used: 80,
            percentage: 53,
            count: 80,
          },
          {
            feature: 'automations',
            credits_used: 50,
            percentage: 33,
            count: 25,
          },
          { feature: 'exports', credits_used: 20, percentage: 14, count: 2 },
        ],
      }),
    })
  );

  // Payments / Plans
  await page.route('**/api/payments/plans', (route: Route) =>
    route.fulfill({
      json: successResponse([
        {
          id: 'plan_free',
          name: 'Free',
          slug: 'free',
          description: 'Get started',
          price_monthly: 0,
          price_yearly: 0,
          currency: 'USD',
          features: ['1 social account', '50 credits/mo'],
          limits: {
            social_accounts: 1,
            automations: 2,
            monthly_credits: 50,
            bots: 1,
            knowledge_sources: 3,
          },
          is_popular: false,
          is_active: true,
        },
        {
          id: 'plan_pro',
          name: 'Pro',
          slug: 'pro',
          description: 'For growing businesses',
          price_monthly: 29,
          price_yearly: 290,
          currency: 'USD',
          features: [
            '5 social accounts',
            '1000 credits/mo',
            'Advanced bots',
            'Voice DNA',
          ],
          limits: {
            social_accounts: 5,
            automations: 20,
            monthly_credits: 1000,
            bots: 5,
            knowledge_sources: 20,
          },
          is_popular: true,
          is_active: true,
        },
      ]),
    })
  );

  // Jobs
  await page.route('**/api/jobs', (route: Route) =>
    route.fulfill({
      json: successResponse(mockJobs, {
        page: 1,
        per_page: 20,
        total: 2,
        total_pages: 1,
      }),
    })
  );

  // Social Accounts
  await page.route('**/api/social-accounts*', (route: Route) =>
    route.fulfill({
      json: successResponse(mockSocialAccounts, { has_more: false }),
    })
  );

  // Media
  await page.route('**/api/media*', (route: Route) =>
    route.fulfill({ json: successResponse([]) })
  );

  // Users
  await page.route('**/api/users/profile', (route: Route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({ json: successResponse(mockUser) });
    }
    if (route.request().method() === 'PATCH') {
      return route.fulfill({ json: successResponse(mockUser) });
    }
    return route.continue();
  });
  await page.route('**/api/users/change-password', (route: Route) =>
    route.fulfill({
      json: successResponse({ message: 'Password changed successfully' }),
    })
  );

  // Support
  await page.route('**/api/support', (route: Route) =>
    route.fulfill({
      json: successResponse({
        id: 'ticket_001',
        ticket_number: 'PE-2026-001',
        status: 'open',
      }),
    })
  );

  // Analytics
  await page.route('**/api/analytics/overview*', (route: Route) =>
    route.fulfill({
      json: successResponse({
        period: 'week',
        total_interactions: 523,
        total_leads_captured: 37,
        total_messages_sent: 210,
        total_messages_received: 313,
        response_rate: 67.2,
        avg_response_time_ms: 1200,
        active_automations: 3,
        credits_used: 150,
        comparison: {
          interactions_change: 12.5,
          leads_change: 8.3,
          messages_change: 15.1,
          response_rate_change: 2.1,
        },
      }),
    })
  );
}
