/**
 * User's current credit balance
 */
export interface CreditBalance {
  user_id: string;
  balance: number;
  currency: string;
  plan: string;
  monthly_allocation: number;
  reset_date: string;
  usage_percentage: number;
  status: 'active' | 'low' | 'exhausted';
}

/**
 * Individual credit transaction record
 */
export interface CreditTransaction {
  id: string;
  user_id: string;
  type: 'allocation' | 'purchase' | 'usage' | 'refund' | 'adjustment';
  amount: number;
  balance_before: number;
  balance_after: number;
  description: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

/**
 * Credit usage breakdown by feature
 */
export interface UsageBreakdown {
  period: string;
  total_used: number;
  breakdown: Array<{
    feature: string;
    credits_used: number;
    percentage: number;
    count: number;
  }>;
}
