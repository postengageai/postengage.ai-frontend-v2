import type {
  AutomationBuilder,
  BuilderUIState,
  DmTemplate,
} from '@/lib/types/automation-builder';

export const mockDmTemplates: DmTemplate[] = [
  {
    id: 'tpl_1',
    name: 'Welcome Message',
    content:
      "Hey {{username}}! Thanks for engaging with our content. We'd love to connect with you!",
    variables: ['username'],
  },
  {
    id: 'tpl_2',
    name: 'Product Inquiry',
    content:
      "Hi {{username}}! Thanks for your interest. Here's more info about {{product_name}}: {{product_link}}",
    variables: ['username', 'product_name', 'product_link'],
  },
  {
    id: 'tpl_3',
    name: 'Discount Offer',
    content:
      "Hey {{username}}! As a thank you for your comment, here's an exclusive 15% off code: ENGAGE15",
    variables: ['username'],
  },
];

export const mockAutomation: AutomationBuilder = {
  id: 'auto_abc123',
  name: 'Welcome New Commenters',
  description: 'Automatically reply and DM users who comment on our posts',
  platform: 'instagram',
  status: 'active',
  executionMode: 'real_time',

  trigger: {
    id: 'trg_1',
    type: 'new_comment',
    scope: 'all_posts',
    selectedPosts: [],
  },

  conditions: {
    id: 'cond_1',
    enabled: true,
    logic: 'and',
    conditions: [
      {
        id: 'c_1',
        field: 'comment_text',
        operator: 'contains',
        value: 'price',
        caseSensitive: false,
      },
      {
        id: 'c_2',
        field: 'follower_count',
        operator: 'contains',
        value: '100',
        caseSensitive: false,
      },
    ],
  },

  actions: [
    {
      id: 'act_1',
      type: 'reply_comment',
      order: 1,
      enabled: true,
      creditCost: 1,
      config: {
        useAI: true,
        aiTone: 'friendly',
        aiContext:
          'We sell handmade jewelry. Be helpful and encourage them to check our bio link.',
        replyTemplates: [
          'Thanks for your interest! Check our bio for the full catalog.',
          'Great question! DM us for details.',
        ],
      },
    },
    {
      id: 'act_2',
      type: 'send_dm',
      order: 2,
      enabled: true,
      creditCost: 2,
      config: {
        dmTemplates: [mockDmTemplates[0], mockDmTemplates[2]],
        sendOnlyOnce: true,
        delay: 30,
      },
    },
  ],

  statistics: {
    totalExecutions: 1247,
    successfulExecutions: 1198,
    failedExecutions: 49,
    totalCreditsUsed: 3594,
    avgExecutionTime: 850,
    lastExecutionAt: '2024-01-15T14:32:00Z',
    trend: {
      executionsChange: 12.5,
      period: 'week',
    },
  },

  rateLimit: {
    maxPerHour: 60,
    maxPerDay: 500,
    currentHourUsage: 23,
    currentDayUsage: 156,
    cooldownMinutes: 1,
  },

  estimatedCreditCost: 3,

  createdAt: '2024-01-01T10:00:00Z',
  updatedAt: '2024-01-15T14:32:00Z',
};

export const mockEmptyAutomation: AutomationBuilder = {
  id: 'auto_new',
  name: 'Untitled Automation',
  platform: 'instagram',
  status: 'draft',
  executionMode: 'real_time',

  trigger: {
    id: 'trg_new',
    type: 'new_comment',
    scope: 'all_posts',
  },

  conditions: {
    id: 'cond_new',
    enabled: false,
    logic: 'and',
    conditions: [],
  },

  actions: [],

  statistics: {
    totalExecutions: 0,
    successfulExecutions: 0,
    failedExecutions: 0,
    totalCreditsUsed: 0,
    avgExecutionTime: 0,
    lastExecutionAt: null,
    trend: {
      executionsChange: 0,
      period: 'week',
    },
  },

  rateLimit: {
    maxPerHour: 60,
    maxPerDay: 500,
    currentHourUsage: 0,
    currentDayUsage: 0,
    cooldownMinutes: 1,
  },

  estimatedCreditCost: 0,

  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const mockBuilderUIState: BuilderUIState = {
  selectedBlock: null,
  isDirty: false,
  isSaving: false,
  lastSavedAt: null,
  validationErrors: [],
  expandedPanels: ['trigger', 'conditions', 'actions'],
};

// Helper to get trigger type label
export function getTriggerTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    new_comment: 'New Comment',
    keyword_mention: 'Keyword Mention',
    new_dm: 'New DM',
    story_reply: 'Story Reply',
    new_follower: 'New Follower',
  };
  return labels[type] || type;
}

// Helper to get action type label
export function getActionTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    reply_comment: 'Reply to Comment',
    send_dm: 'Send DM',
    like_comment: 'Like Comment',
    hide_comment: 'Hide Comment',
    add_tag: 'Add Tag',
  };
  return labels[type] || type;
}

// Helper to get scope label
export function getScopeLabel(scope: string): string {
  const labels: Record<string, string> = {
    all_posts: 'All Posts',
    specific_posts: 'Specific Posts',
    reels_only: 'Reels Only',
    stories_only: 'Stories Only',
  };
  return labels[scope] || scope;
}
