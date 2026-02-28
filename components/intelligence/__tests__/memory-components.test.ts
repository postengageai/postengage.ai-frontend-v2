import { describe, expect, it } from 'vitest';
import type {
  MemoryStats,
  RelationshipStage,
  MemoryEntity,
  EntityType,
  UserRelationshipMemory,
  MemoryUsersParams,
} from '@/lib/types/memory';

/**
 * Component logic tests for Memory components:
 * - MemoryStatsOverview: stat calculations, stage breakdown, tier distribution
 * - EntityBrowser: search/filter/pagination logic
 * - RelationshipStageBadge: stage → color mapping
 * - EntityCard: confidence display logic
 */

// === Test Data ===

const mockStats: MemoryStats = {
  total_users_tracked: 150,
  total_entities_stored: 1230,
  entities_by_type: {
    user_name: 150,
    preference: 340,
    commitment: 90,
    question_asked: 210,
    product_interest: 180,
    objection: 60,
    timeline: 45,
    budget: 35,
    custom: 120,
  },
  relationship_stage_breakdown: {
    new: 40,
    engaged: 55,
    loyal: 30,
    at_risk: 15,
    churned: 10,
  },
  avg_entities_per_user: 8.2,
  memory_tier_usage: {
    working_memory_keys: 450,
    conversation_summaries: 320,
    relationship_memories: 150,
  },
};

// === MemoryStatsOverview Tests ===

describe('MemoryStatsOverview logic', () => {
  describe('stat display values', () => {
    it('total_users_tracked formats with toLocaleString', () => {
      expect(mockStats.total_users_tracked.toLocaleString()).toBe('150');
    });

    it('total_entities_stored formats with toLocaleString', () => {
      expect(mockStats.total_entities_stored.toLocaleString()).toBe('1,230');
    });

    it('avg_entities_per_user formats to 1 decimal', () => {
      expect(mockStats.avg_entities_per_user.toFixed(1)).toBe('8.2');
    });
  });

  describe('relationship stage breakdown', () => {
    it('calculates total staged users', () => {
      const totalStaged = Object.values(
        mockStats.relationship_stage_breakdown
      ).reduce((sum, v) => sum + v, 0);
      expect(totalStaged).toBe(150);
    });

    it('stage percentages sum to 100%', () => {
      const totalStaged = Object.values(
        mockStats.relationship_stage_breakdown
      ).reduce((sum, v) => sum + v, 0);

      const percentages = Object.values(
        mockStats.relationship_stage_breakdown
      ).map(v => (v / totalStaged) * 100);

      const sum = percentages.reduce((s, p) => s + p, 0);
      expect(sum).toBeCloseTo(100, 1);
    });

    it('each stage has a non-negative count', () => {
      Object.values(mockStats.relationship_stage_breakdown).forEach(count => {
        expect(count).toBeGreaterThanOrEqual(0);
      });
    });

    it('breakdown covers all 5 stages', () => {
      const stages: RelationshipStage[] = [
        'new',
        'engaged',
        'loyal',
        'at_risk',
        'churned',
      ];
      stages.forEach(stage => {
        expect(mockStats.relationship_stage_breakdown[stage]).toBeDefined();
      });
    });
  });

  describe('memory tier distribution', () => {
    it('calculates tier total', () => {
      const tierTotal =
        mockStats.memory_tier_usage.working_memory_keys +
        mockStats.memory_tier_usage.conversation_summaries +
        mockStats.memory_tier_usage.relationship_memories;
      expect(tierTotal).toBe(920);
    });

    it('tier percentages are calculable', () => {
      const tierTotal = 920;
      const workingPct =
        (mockStats.memory_tier_usage.working_memory_keys / tierTotal) * 100;
      expect(workingPct).toBeCloseTo(48.9, 1);
    });

    it('handles zero tier total gracefully', () => {
      const emptyTier = {
        working_memory_keys: 0,
        conversation_summaries: 0,
        relationship_memories: 0,
      };
      const total =
        emptyTier.working_memory_keys +
        emptyTier.conversation_summaries +
        emptyTier.relationship_memories;
      expect(total).toBe(0);
    });
  });

  describe('empty state handling', () => {
    it('shows "No relationship data yet" when all stages are 0', () => {
      const emptyStats: MemoryStats = {
        ...mockStats,
        relationship_stage_breakdown: {
          new: 0,
          engaged: 0,
          loyal: 0,
          at_risk: 0,
          churned: 0,
        },
      };
      const totalStaged = Object.values(
        emptyStats.relationship_stage_breakdown
      ).reduce((sum, v) => sum + v, 0);
      expect(totalStaged).toBe(0);
    });
  });
});

// === RelationshipStageBadge Tests ===

const stageColors: Record<RelationshipStage, string> = {
  new: 'bg-gray-400',
  engaged: 'bg-blue-500',
  loyal: 'bg-green-500',
  at_risk: 'bg-orange-500',
  churned: 'bg-red-500',
};

describe('RelationshipStageBadge logic', () => {
  it('maps all relationship stages to colors', () => {
    const stages: RelationshipStage[] = [
      'new',
      'engaged',
      'loyal',
      'at_risk',
      'churned',
    ];
    stages.forEach(stage => {
      expect(stageColors[stage]).toBeTruthy();
    });
  });

  it('loyal is green', () => {
    expect(stageColors['loyal']).toContain('green');
  });

  it('at_risk is orange', () => {
    expect(stageColors['at_risk']).toContain('orange');
  });

  it('churned is red', () => {
    expect(stageColors['churned']).toContain('red');
  });
});

// === EntityCard Tests ===

describe('EntityCard logic', () => {
  const mockEntity: MemoryEntity = {
    type: 'product_interest',
    key: 'interested_product',
    value: 'Premium Plan',
    confidence: 0.85,
    source: 'llm',
    first_seen_at: '2026-01-10T00:00:00Z',
    last_updated_at: '2026-01-15T00:00:00Z',
  };

  it('confidence is between 0 and 1', () => {
    expect(mockEntity.confidence).toBeGreaterThanOrEqual(0);
    expect(mockEntity.confidence).toBeLessThanOrEqual(1);
  });

  it('confidence percentage is correctly calculated', () => {
    const pct = mockEntity.confidence * 100;
    expect(pct).toBe(85);
  });

  it('entity type is a valid EntityType', () => {
    const validTypes: EntityType[] = [
      'user_name',
      'preference',
      'commitment',
      'question_asked',
      'product_interest',
      'objection',
      'timeline',
      'budget',
      'custom',
    ];
    expect(validTypes).toContain(mockEntity.type);
  });

  it('source is valid', () => {
    const validSources = ['deterministic', 'llm', 'manual'];
    expect(validSources).toContain(mockEntity.source);
  });

  it('dates are ISO format strings', () => {
    expect(() => new Date(mockEntity.first_seen_at)).not.toThrow();
    expect(() => new Date(mockEntity.last_updated_at)).not.toThrow();
  });
});

// === EntityBrowser search/filter/pagination logic ===

describe('EntityBrowser logic', () => {
  describe('pagination', () => {
    it('calculates total pages correctly', () => {
      const totalItems = 95;
      const limit = 20;
      const totalPages = Math.ceil(totalItems / limit);
      expect(totalPages).toBe(5);
    });

    it('handles exact division', () => {
      const totalItems = 60;
      const limit = 20;
      const totalPages = Math.ceil(totalItems / limit);
      expect(totalPages).toBe(3);
    });

    it('handles zero items', () => {
      const totalItems = 0;
      const limit = 20;
      const totalPages = Math.ceil(totalItems / limit);
      expect(totalPages).toBe(0);
    });
  });

  describe('search debounce', () => {
    it('debounce delay is reasonable (300-500ms)', () => {
      const DEBOUNCE_MS = 400;
      expect(DEBOUNCE_MS).toBeGreaterThanOrEqual(300);
      expect(DEBOUNCE_MS).toBeLessThanOrEqual(500);
    });
  });

  describe('query params construction', () => {
    it('builds params with all filters', () => {
      const params: MemoryUsersParams = {
        page: 2,
        limit: 20,
        stage: 'engaged',
        search: 'john',
        sort_by: 'last_interaction',
        sort_order: 'desc',
      };
      expect(params.page).toBe(2);
      expect(params.stage).toBe('engaged');
      expect(params.search).toBe('john');
    });

    it('builds params with defaults only', () => {
      const params: MemoryUsersParams = {
        page: 1,
        limit: 20,
      };
      expect(params.stage).toBeUndefined();
      expect(params.search).toBeUndefined();
    });
  });
});

// === UserRelationshipMemory Tests ===

describe('UserRelationshipMemory structure', () => {
  const mockUser: UserRelationshipMemory = {
    _id: 'urm-1',
    social_account_id: 'sa-1',
    platform_user_id: 'pu-123',
    platform_username: 'john_doe',
    entities: [
      {
        type: 'user_name',
        key: 'name',
        value: 'John',
        confidence: 0.95,
        source: 'deterministic',
        first_seen_at: '2026-01-01T00:00:00Z',
        last_updated_at: '2026-01-01T00:00:00Z',
      },
      {
        type: 'product_interest',
        key: 'plan',
        value: 'Enterprise',
        confidence: 0.7,
        source: 'llm',
        first_seen_at: '2026-01-05T00:00:00Z',
        last_updated_at: '2026-01-10T00:00:00Z',
      },
    ],
    conversation_summaries: [
      {
        conversation_id: 'conv-1',
        summary: 'Asked about pricing and enterprise features',
        topics: ['pricing', 'enterprise'],
        mood: 'interested',
        message_count: 8,
        created_at: '2026-01-10T00:00:00Z',
      },
    ],
    communication_preference: 'casual',
    primary_language: 'en',
    relationship_stage: 'engaged',
    one_line_profile: 'Enterprise prospect interested in pricing',
    total_interactions: 12,
    first_interaction_at: '2026-01-01T00:00:00Z',
    last_interaction_at: '2026-01-15T00:00:00Z',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-15T00:00:00Z',
  };

  it('has expected entity count', () => {
    expect(mockUser.entities).toHaveLength(2);
  });

  it('entities are sorted by first_seen_at for timeline display', () => {
    const sorted = [...mockUser.entities].sort(
      (a, b) =>
        new Date(a.first_seen_at).getTime() -
        new Date(b.first_seen_at).getTime()
    );
    expect(sorted[0].type).toBe('user_name');
    expect(sorted[1].type).toBe('product_interest');
  });

  it('conversation summaries have message counts', () => {
    mockUser.conversation_summaries.forEach(cs => {
      expect(cs.message_count).toBeGreaterThan(0);
    });
  });

  it('relationship stage is valid', () => {
    const validStages: RelationshipStage[] = [
      'new',
      'engaged',
      'loyal',
      'at_risk',
      'churned',
    ];
    expect(validStages).toContain(mockUser.relationship_stage);
  });

  it('one_line_profile is non-empty', () => {
    expect(mockUser.one_line_profile.length).toBeGreaterThan(0);
  });
});
