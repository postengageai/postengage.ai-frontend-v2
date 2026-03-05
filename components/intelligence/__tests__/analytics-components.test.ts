import { describe, expect, it } from 'vitest';
import type {
  ResponseQualityMetrics,
  DiversityMetrics,
  IntentAnalytics,
} from '@/lib/types/quality';

/**
 * Component logic tests for Analytics components:
 * - ResponseActions: data transformation, filtering zero-value entries, percentage calc
 * - ConfidenceDistribution: bucket mapping, color assignment
 * - IntentBreakdown: distribution totals, trend flattening, color cycling
 * - DiversityChart: target comparison, trend formatting, repeated phrases
 */

// === ResponseActions Tests ===

interface ResponseActionsData {
  auto_replied: number;
  held_for_approval: number;
  escalated: number;
  skipped: number;
  safe_template_used: number;
}

const ACTION_COLORS: Record<string, string> = {
  'Auto Replied': '#22c55e',
  'Held for Approval': '#eab308',
  Escalated: '#f97316',
  Skipped: '#9ca3af',
  'Safe Template': '#3b82f6',
};

/** Mirrors ResponseActions data transformation */
function buildActionData(actions: ResponseActionsData) {
  return [
    { name: 'Auto Replied', value: actions.auto_replied },
    { name: 'Held for Approval', value: actions.held_for_approval },
    { name: 'Escalated', value: actions.escalated },
    { name: 'Skipped', value: actions.skipped },
    { name: 'Safe Template', value: actions.safe_template_used },
  ].filter(d => d.value > 0);
}

describe('ResponseActions logic', () => {
  const mockActions: ResponseActionsData = {
    auto_replied: 320,
    held_for_approval: 45,
    escalated: 20,
    skipped: 10,
    safe_template_used: 5,
  };

  it('transforms actions into chart data', () => {
    const data = buildActionData(mockActions);
    expect(data).toHaveLength(5);
    expect(data[0].name).toBe('Auto Replied');
    expect(data[0].value).toBe(320);
  });

  it('filters out zero-value entries', () => {
    const withZeros: ResponseActionsData = {
      auto_replied: 100,
      held_for_approval: 0,
      escalated: 0,
      skipped: 5,
      safe_template_used: 0,
    };
    const data = buildActionData(withZeros);
    expect(data).toHaveLength(2);
    expect(data.map(d => d.name)).toEqual(['Auto Replied', 'Skipped']);
  });

  it('returns empty array when all actions are zero', () => {
    const allZero: ResponseActionsData = {
      auto_replied: 0,
      held_for_approval: 0,
      escalated: 0,
      skipped: 0,
      safe_template_used: 0,
    };
    const data = buildActionData(allZero);
    expect(data).toHaveLength(0);
  });

  it('calculates total correctly', () => {
    const data = buildActionData(mockActions);
    const total = data.reduce((sum, d) => sum + d.value, 0);
    expect(total).toBe(400);
  });

  it('calculates percentage for each entry', () => {
    const data = buildActionData(mockActions);
    const total = data.reduce((sum, d) => sum + d.value, 0);
    const autoRepliedPct = (320 / total) * 100;
    expect(autoRepliedPct).toBe(80);
  });

  it('provides a color for every action type', () => {
    const data = buildActionData(mockActions);
    data.forEach(d => {
      expect(ACTION_COLORS[d.name]).toBeTruthy();
    });
  });
});

// === ConfidenceDistribution Tests ===

const BUCKET_COLORS = {
  'Very Low (0-30%)': '#ef4444',
  'Low (30-50%)': '#f97316',
  'Medium (50-80%)': '#eab308',
  'High (80-100%)': '#22c55e',
};

/** Mirrors ConfidenceDistribution data transformation */
function buildConfidenceData(quality: ResponseQualityMetrics) {
  return [
    {
      name: 'Very Low (0-30%)',
      count: quality.confidence_distribution.very_low,
      color: BUCKET_COLORS['Very Low (0-30%)'],
    },
    {
      name: 'Low (30-50%)',
      count: quality.confidence_distribution.low,
      color: BUCKET_COLORS['Low (30-50%)'],
    },
    {
      name: 'Medium (50-80%)',
      count: quality.confidence_distribution.medium,
      color: BUCKET_COLORS['Medium (50-80%)'],
    },
    {
      name: 'High (80-100%)',
      count: quality.confidence_distribution.high,
      color: BUCKET_COLORS['High (80-100%)'],
    },
  ];
}

describe('ConfidenceDistribution logic', () => {
  const mockQuality: ResponseQualityMetrics = {
    total_responses: 500,
    avg_confidence: 0.78,
    confidence_distribution: { high: 300, medium: 120, low: 60, very_low: 20 },
    grounded_percentage: 94.0,
    hallucination_rate: 0.03,
    safe_template_usage: 10,
    avg_generation_time_ms: 750,
    retry_rate: 0.04,
  };

  it('creates 4 confidence buckets', () => {
    const data = buildConfidenceData(mockQuality);
    expect(data).toHaveLength(4);
  });

  it('bucket counts sum to total_responses', () => {
    const data = buildConfidenceData(mockQuality);
    const total = data.reduce((sum, d) => sum + d.count, 0);
    expect(total).toBe(mockQuality.total_responses);
  });

  it('buckets ordered from very_low to high', () => {
    const data = buildConfidenceData(mockQuality);
    expect(data[0].name).toContain('Very Low');
    expect(data[3].name).toContain('High');
  });

  it('each bucket has a unique color', () => {
    const data = buildConfidenceData(mockQuality);
    const colors = data.map(d => d.color);
    const uniqueColors = new Set(colors);
    expect(uniqueColors.size).toBe(4);
  });

  it('avg confidence displays as percentage', () => {
    const display = (mockQuality.avg_confidence * 100).toFixed(1);
    expect(display).toBe('78.0');
  });

  it('handles zero total_responses (empty state)', () => {
    const emptyQuality: ResponseQualityMetrics = {
      ...mockQuality,
      total_responses: 0,
      confidence_distribution: { high: 0, medium: 0, low: 0, very_low: 0 },
    };
    expect(emptyQuality.total_responses).toBe(0);
  });
});

// === IntentBreakdown Tests ===

const INTENT_COLORS = [
  '#3b82f6',
  '#22c55e',
  '#f97316',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#eab308',
  '#ef4444',
  '#14b8a6',
  '#6366f1',
];

function getIntentColor(index: number): string {
  return INTENT_COLORS[index % INTENT_COLORS.length];
}

describe('IntentBreakdown logic', () => {
  const mockIntents: IntentAnalytics = {
    intent_distribution: [
      {
        intent: 'pricing_inquiry',
        count: 120,
        percentage: 30,
        avg_confidence: 0.85,
      },
      {
        intent: 'product_question',
        count: 100,
        percentage: 25,
        avg_confidence: 0.78,
      },
      {
        intent: 'support_request',
        count: 80,
        percentage: 20,
        avg_confidence: 0.72,
      },
      {
        intent: 'general_chat',
        count: 60,
        percentage: 15,
        avg_confidence: 0.65,
      },
      { intent: 'complaint', count: 40, percentage: 10, avg_confidence: 0.55 },
    ],
    intent_trend: [
      {
        date: '2026-01-13',
        intents: {
          pricing_inquiry: 20,
          product_question: 15,
          support_request: 12,
        },
      },
      {
        date: '2026-01-14',
        intents: {
          pricing_inquiry: 18,
          product_question: 22,
          support_request: 10,
        },
      },
      {
        date: '2026-01-15',
        intents: {
          pricing_inquiry: 25,
          product_question: 18,
          support_request: 15,
        },
      },
    ],
  };

  describe('distribution', () => {
    it('distribution counts sum to total', () => {
      const total = mockIntents.intent_distribution.reduce(
        (sum, d) => sum + d.count,
        0
      );
      expect(total).toBe(400);
    });

    it('percentages sum to 100', () => {
      const totalPct = mockIntents.intent_distribution.reduce(
        (sum, d) => sum + d.percentage,
        0
      );
      expect(totalPct).toBe(100);
    });

    it('handles empty distribution', () => {
      const empty: IntentAnalytics = {
        intent_distribution: [],
        intent_trend: [],
      };
      expect(empty.intent_distribution.length).toBe(0);
    });
  });

  describe('color cycling', () => {
    it('getIntentColor returns valid colors', () => {
      for (let i = 0; i < 5; i++) {
        expect(getIntentColor(i)).toMatch(/^#[0-9a-f]{6}$/);
      }
    });

    it('colors cycle after 10 intents', () => {
      expect(getIntentColor(0)).toBe(getIntentColor(10));
      expect(getIntentColor(3)).toBe(getIntentColor(13));
    });
  });

  describe('trend data flattening', () => {
    it('flattens trend data for stacked area chart', () => {
      const trendData = mockIntents.intent_trend.map(t => ({
        date: t.date,
        ...t.intents,
      }));
      expect(trendData).toHaveLength(3);
      expect(trendData[0]).toHaveProperty('date');
      expect(trendData[0]).toHaveProperty('pricing_inquiry');
    });

    it('extracts unique intent names', () => {
      const allIntents = [
        ...new Set(mockIntents.intent_distribution.map(d => d.intent)),
      ];
      expect(allIntents).toHaveLength(5);
      expect(allIntents).toContain('pricing_inquiry');
    });
  });
});

// === DiversityChart Tests ===

const DIVERSITY_TARGET = 85;

describe('DiversityChart logic', () => {
  const mockDiversity: DiversityMetrics = {
    unique_reply_percentage: 91.5,
    diversity_score: 0.88,
    most_repeated_phrases: [
      { phrase: 'Happy to help!', count: 15 },
      { phrase: 'Thanks for reaching out', count: 12 },
      { phrase: 'Let me check that for you', count: 8 },
    ],
    diversity_trend: [
      { date: '2026-01-13', score: 88.2 },
      { date: '2026-01-14', score: 90.1 },
      { date: '2026-01-15', score: 91.5 },
    ],
  };

  describe('target comparison', () => {
    it('identifies above-target diversity', () => {
      const aboveTarget =
        mockDiversity.unique_reply_percentage >= DIVERSITY_TARGET;
      expect(aboveTarget).toBe(true);
    });

    it('identifies below-target diversity', () => {
      const lowDiversity: DiversityMetrics = {
        ...mockDiversity,
        unique_reply_percentage: 72.3,
      };
      const aboveTarget =
        lowDiversity.unique_reply_percentage >= DIVERSITY_TARGET;
      expect(aboveTarget).toBe(false);
    });

    it('target boundary at exactly 85%', () => {
      const boundaryDiversity: DiversityMetrics = {
        ...mockDiversity,
        unique_reply_percentage: 85.0,
      };
      expect(
        boundaryDiversity.unique_reply_percentage >= DIVERSITY_TARGET
      ).toBe(true);
    });
  });

  describe('formatting', () => {
    it('unique_reply_percentage formats to 1 decimal', () => {
      expect(mockDiversity.unique_reply_percentage.toFixed(1)).toBe('91.5');
    });

    it('diversity_score formats as percentage', () => {
      expect((mockDiversity.diversity_score * 100).toFixed(1)).toBe('88.0');
    });
  });

  describe('most repeated phrases', () => {
    it('phrases are sorted by count (descending assumed)', () => {
      const phrases = mockDiversity.most_repeated_phrases;
      for (let i = 1; i < phrases.length; i++) {
        expect(phrases[i - 1].count).toBeGreaterThanOrEqual(phrases[i].count);
      }
    });

    it('limits display to top 10', () => {
      const display = mockDiversity.most_repeated_phrases.slice(0, 10);
      expect(display.length).toBeLessThanOrEqual(10);
    });

    it('each phrase has non-zero count', () => {
      mockDiversity.most_repeated_phrases.forEach(p => {
        expect(p.count).toBeGreaterThan(0);
      });
    });
  });

  describe('diversity trend', () => {
    it('trend data has date and score', () => {
      mockDiversity.diversity_trend.forEach(d => {
        expect(d.date).toBeTruthy();
        expect(d.score).toBeGreaterThan(0);
      });
    });

    it('handles empty trend', () => {
      const noTrend: DiversityMetrics = {
        ...mockDiversity,
        diversity_trend: [],
      };
      expect(noTrend.diversity_trend.length).toBe(0);
    });

    it('trend shows improvement', () => {
      const trend = mockDiversity.diversity_trend;
      const first = trend[0].score;
      const last = trend[trend.length - 1].score;
      expect(last).toBeGreaterThan(first);
    });
  });
});
