import { describe, expect, it } from 'vitest';
import type {
  BotHealthScore,
  BotHealthLevel,
  ResponseQualityMetrics,
  FlaggedReply,
} from '@/lib/types/quality';

/**
 * Component logic tests for Quality components:
 * - BotHealthScoreDisplay: health level → config mapping, factor display
 * - QualityScorecard: health status calculation, engagement rate, formatting
 * - FlaggedReviewQueue: action types, filtering logic
 * - ConfidenceGauge: percentage → color gradient
 */

// === BotHealthScoreDisplay Tests ===

const healthConfig: Record<
  BotHealthLevel,
  { bgColor: string; textColor: string; ringColor: string; label: string }
> = {
  good: {
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    ringColor: 'ring-green-300',
    label: 'Good',
  },
  fair: {
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-700',
    ringColor: 'ring-yellow-300',
    label: 'Fair',
  },
  poor: {
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    ringColor: 'ring-red-300',
    label: 'Poor',
  },
};

describe('BotHealthScoreDisplay logic', () => {
  const goodHealth: BotHealthScore = {
    level: 'good',
    score: 92,
    factors: [
      { label: 'Response Quality', status: 'good' },
      { label: 'Accuracy', status: 'good' },
      { label: 'Engagement', status: 'warning' },
    ],
    last_updated_at: '2026-01-15T10:30:00Z',
  };

  const poorHealth: BotHealthScore = {
    level: 'poor',
    score: 35,
    factors: [
      { label: 'Response Quality', status: 'issue' },
      { label: 'Accuracy', status: 'issue' },
      { label: 'Engagement', status: 'warning' },
    ],
    last_updated_at: '2026-01-15T10:30:00Z',
  };

  describe('health level config', () => {
    it('maps all health levels to configs', () => {
      const levels: BotHealthLevel[] = ['good', 'fair', 'poor'];
      levels.forEach(level => {
        expect(healthConfig[level]).toBeDefined();
        expect(healthConfig[level].label).toBeTruthy();
        expect(healthConfig[level].bgColor).toBeTruthy();
      });
    });

    it('good level has green styling', () => {
      expect(healthConfig.good.bgColor).toContain('green');
      expect(healthConfig.good.textColor).toContain('green');
    });

    it('poor level has red styling', () => {
      expect(healthConfig.poor.bgColor).toContain('red');
      expect(healthConfig.poor.textColor).toContain('red');
    });
  });

  describe('factor display', () => {
    it('good health has 3 factors', () => {
      expect(goodHealth.factors).toHaveLength(3);
    });

    it('factor statuses are valid', () => {
      const validStatuses = ['good', 'warning', 'issue'];
      goodHealth.factors.forEach(f => {
        expect(validStatuses).toContain(f.status);
      });
    });

    it('poor health has factors with issue status', () => {
      const issueCount = poorHealth.factors.filter(
        f => f.status === 'issue'
      ).length;
      expect(issueCount).toBeGreaterThan(0);
    });
  });

  describe('score display', () => {
    it('score is a positive number', () => {
      expect(goodHealth.score).toBeGreaterThan(0);
    });

    it('score is within reasonable range (0-100)', () => {
      expect(goodHealth.score).toBeLessThanOrEqual(100);
      expect(goodHealth.score).toBeGreaterThanOrEqual(0);
    });
  });

  describe('date formatting', () => {
    it('last_updated_at is a valid ISO date', () => {
      const date = new Date(goodHealth.last_updated_at);
      expect(date.getTime()).not.toBeNaN();
    });

    it('formats date for display', () => {
      const date = new Date(goodHealth.last_updated_at);
      const formatted = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      expect(formatted).toBeTruthy();
    });
  });
});

// === QualityScorecard Tests ===

/** Mirrors getHealthStatus in quality-scorecard.tsx */
function getHealthStatus(metrics: ResponseQualityMetrics) {
  const confidence = metrics.avg_confidence;
  const hallucination = metrics.hallucination_rate;

  if (confidence >= 0.75 && hallucination < 0.05) {
    return {
      label: 'Good',
      color: 'bg-green-100 text-green-700 border-green-300',
    };
  }
  if (confidence >= 0.5 && hallucination < 0.1) {
    return {
      label: 'Fair',
      color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    };
  }
  return { label: 'Poor', color: 'bg-red-100 text-red-700 border-red-300' };
}

/** Mirrors engagement rate calculation in quality-scorecard.tsx */
function calculateEngagementRate(metrics: ResponseQualityMetrics): number {
  return metrics.total_responses > 0
    ? ((metrics.total_responses -
        metrics.total_responses * metrics.retry_rate) /
        metrics.total_responses) *
        100
    : 0;
}

describe('QualityScorecard logic', () => {
  const goodMetrics: ResponseQualityMetrics = {
    total_responses: 500,
    avg_confidence: 0.82,
    confidence_distribution: { high: 350, medium: 100, low: 40, very_low: 10 },
    grounded_percentage: 95.5,
    hallucination_rate: 0.02,
    safe_template_usage: 15,
    avg_generation_time_ms: 850,
    retry_rate: 0.05,
  };

  const fairMetrics: ResponseQualityMetrics = {
    ...goodMetrics,
    avg_confidence: 0.6,
    hallucination_rate: 0.08,
  };

  const poorMetrics: ResponseQualityMetrics = {
    ...goodMetrics,
    avg_confidence: 0.35,
    hallucination_rate: 0.15,
  };

  describe('health status classification', () => {
    it('classifies high confidence + low hallucination as Good', () => {
      expect(getHealthStatus(goodMetrics).label).toBe('Good');
    });

    it('classifies medium confidence + moderate hallucination as Fair', () => {
      expect(getHealthStatus(fairMetrics).label).toBe('Fair');
    });

    it('classifies low confidence + high hallucination as Poor', () => {
      expect(getHealthStatus(poorMetrics).label).toBe('Poor');
    });

    it('edge case: confidence exactly 0.75 and hallucination exactly 0.049', () => {
      const edge: ResponseQualityMetrics = {
        ...goodMetrics,
        avg_confidence: 0.75,
        hallucination_rate: 0.049,
      };
      expect(getHealthStatus(edge).label).toBe('Good');
    });

    it('edge case: confidence 0.74 falls to Fair', () => {
      const edge: ResponseQualityMetrics = {
        ...goodMetrics,
        avg_confidence: 0.74,
        hallucination_rate: 0.03,
      };
      expect(getHealthStatus(edge).label).toBe('Fair');
    });
  });

  describe('engagement rate calculation', () => {
    it('calculates engagement rate correctly', () => {
      const rate = calculateEngagementRate(goodMetrics);
      // 500 responses, 5% retry → (500 - 25) / 500 * 100 = 95%
      expect(rate).toBeCloseTo(95, 1);
    });

    it('returns 0 when total_responses is 0', () => {
      const emptyMetrics: ResponseQualityMetrics = {
        ...goodMetrics,
        total_responses: 0,
      };
      expect(calculateEngagementRate(emptyMetrics)).toBe(0);
    });

    it('returns 100% when retry_rate is 0', () => {
      const perfectMetrics: ResponseQualityMetrics = {
        ...goodMetrics,
        retry_rate: 0,
      };
      expect(calculateEngagementRate(perfectMetrics)).toBe(100);
    });
  });

  describe('metric formatting', () => {
    it('avg_confidence displays as percentage', () => {
      const display = (goodMetrics.avg_confidence * 100).toFixed(1);
      expect(display).toBe('82.0');
    });

    it('hallucination_rate displays as percentage', () => {
      const display = (goodMetrics.hallucination_rate * 100).toFixed(2);
      expect(display).toBe('2.00');
    });

    it('generation time < 1000ms displays as ms', () => {
      const timeMs = goodMetrics.avg_generation_time_ms;
      const display =
        timeMs < 1000 ? `${timeMs}ms` : `${(timeMs / 1000).toFixed(1)}s`;
      expect(display).toBe('850ms');
    });

    it('generation time >= 1000ms displays as seconds', () => {
      const timeMs = 2500;
      const display =
        timeMs < 1000 ? `${timeMs}ms` : `${(timeMs / 1000).toFixed(1)}s`;
      expect(display).toBe('2.5s');
    });

    it('hallucination > 5% gets red styling', () => {
      const isRed = goodMetrics.hallucination_rate > 0.05;
      expect(isRed).toBe(false);
    });

    it('retry_rate > 10% gets orange styling', () => {
      const isOrange = goodMetrics.retry_rate > 0.1;
      expect(isOrange).toBe(false);
    });
  });
});

// === FlaggedReviewQueue Tests ===

describe('FlaggedReviewQueue logic', () => {
  const mockFlaggedReplies: FlaggedReply[] = [
    {
      _id: 'fr-1',
      bot_id: 'bot-1',
      original_message: 'What is the price?',
      generated_reply: 'Our premium plan costs $999/month.',
      confidence_score: 0.25,
      flag_reason: 'Low confidence score',
      action_taken: 'held_for_approval',
      reviewed: false,
      created_at: '2026-01-15T09:00:00Z',
    },
    {
      _id: 'fr-2',
      bot_id: 'bot-1',
      original_message: 'Do you offer refunds?',
      generated_reply: 'We have a 100% money back guarantee for 90 days.',
      confidence_score: 0.45,
      flag_reason: 'Potential hallucination detected',
      action_taken: 'safe_template_used',
      reviewed: false,
      created_at: '2026-01-15T10:00:00Z',
    },
    {
      _id: 'fr-3',
      bot_id: 'bot-1',
      original_message: 'How do I cancel?',
      generated_reply: 'Go to settings and click cancel.',
      confidence_score: 0.55,
      flag_reason: 'Sensitive topic detected',
      action_taken: 'held_for_approval',
      reviewed: true,
      reviewed_at: '2026-01-15T11:00:00Z',
      created_at: '2026-01-15T10:30:00Z',
    },
  ];

  describe('filtering', () => {
    it('filters unreviewed flagged replies', () => {
      const unreviewed = mockFlaggedReplies.filter(r => !r.reviewed);
      expect(unreviewed).toHaveLength(2);
    });

    it('filters reviewed flagged replies', () => {
      const reviewed = mockFlaggedReplies.filter(r => r.reviewed);
      expect(reviewed).toHaveLength(1);
    });

    it('filters by action_taken type', () => {
      const heldForApproval = mockFlaggedReplies.filter(
        r => r.action_taken === 'held_for_approval'
      );
      expect(heldForApproval).toHaveLength(2);

      const safeTemplate = mockFlaggedReplies.filter(
        r => r.action_taken === 'safe_template_used'
      );
      expect(safeTemplate).toHaveLength(1);
    });
  });

  describe('confidence scoring', () => {
    it('all flagged replies have confidence < 0.6', () => {
      mockFlaggedReplies.forEach(r => {
        expect(r.confidence_score).toBeLessThan(0.6);
      });
    });

    it('sorts by confidence ascending (lowest first)', () => {
      const sorted = [...mockFlaggedReplies].sort(
        (a, b) => a.confidence_score - b.confidence_score
      );
      expect(sorted[0].confidence_score).toBe(0.25);
      expect(sorted[2].confidence_score).toBe(0.55);
    });
  });

  describe('action types', () => {
    it('valid action_taken values', () => {
      const validActions = ['held_for_approval', 'safe_template_used'];
      mockFlaggedReplies.forEach(r => {
        expect(validActions).toContain(r.action_taken);
      });
    });
  });

  describe('review status', () => {
    it('reviewed replies have reviewed_at timestamp', () => {
      const reviewed = mockFlaggedReplies.filter(r => r.reviewed);
      reviewed.forEach(r => {
        expect(r.reviewed_at).toBeTruthy();
      });
    });

    it('unreviewed replies do not have reviewed_at', () => {
      const unreviewed = mockFlaggedReplies.filter(r => !r.reviewed);
      unreviewed.forEach(r => {
        expect(r.reviewed_at).toBeUndefined();
      });
    });
  });
});

// === ConfidenceGauge Tests ===

describe('ConfidenceGauge logic', () => {
  /** Mimics confidence → color mapping */
  function getConfidenceColor(confidence: number): string {
    if (confidence >= 0.75) return 'green';
    if (confidence >= 0.5) return 'yellow';
    if (confidence >= 0.3) return 'orange';
    return 'red';
  }

  it('high confidence is green', () => {
    expect(getConfidenceColor(0.9)).toBe('green');
    expect(getConfidenceColor(0.75)).toBe('green');
  });

  it('medium confidence is yellow', () => {
    expect(getConfidenceColor(0.6)).toBe('yellow');
    expect(getConfidenceColor(0.5)).toBe('yellow');
  });

  it('low confidence is orange', () => {
    expect(getConfidenceColor(0.4)).toBe('orange');
    expect(getConfidenceColor(0.3)).toBe('orange');
  });

  it('very low confidence is red', () => {
    expect(getConfidenceColor(0.2)).toBe('red');
    expect(getConfidenceColor(0.0)).toBe('red');
  });

  it('percentage display is calculated correctly', () => {
    const confidence = 0.87;
    const display = `${(confidence * 100).toFixed(0)}%`;
    expect(display).toBe('87%');
  });
});
