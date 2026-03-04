/**
 * User's current credit balance
 */
export interface CreditBalance {
  available_credits: number;
}

/**
 * Individual credit transaction record
 */
export interface CreditTransaction {
  id: string;
  user_id: string;
  transaction_type: string; // 'allocation' | 'purchase' | 'usage' | 'refund' | 'adjustment';
  credit_amount: number;
  balance_before?: number;
  balance_after: number;
  description: string;
  status: string;
  credit_package_id?: string;
  order_id?: string;
  automation_id?: string;
  reference_id?: string;
  operation_id?: string;
  failure_reason?: string;
  processed_at?: string;
  cancelled_at?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at?: string;
}

/**
 * Credit usage breakdown
 */
export interface UsageBreakdown {
  from: string;
  to: string;
  totals: {
    purchases: number;
    consumption: number;
    adjustments: number;
  };
  daily: Array<{
    date: string;
    purchases: number;
    consumption: number;
    adjustments: number;
  }>;
  total_transactions: number;
}

export interface Invoice {
  _id: string; // Changed from id to _id to match component
  id?: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  date: string;
  pdf_url?: string;
  invoice_number: string;
  period_start?: string;
  period_end?: string;

  // Added fields based on usage
  paid_at?: string;
  created_at: string;
  package_name?: string;
  payment_provider: PaymentProvider;
  credits_purchased: number;
  refund_amount?: number;
  payment_id?: string;
  tax_amount?: number;
  billing_name?: string;
  billing_email?: string;
  billing_address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
  refunded_at?: string;
  refund_reason?: string;
}

export type InvoiceStatus =
  | 'succeeded'
  | 'pending'
  | 'failed'
  | 'refunded'
  | 'partially_refunded'
  | 'paid'
  | 'open'
  | 'void'
  | 'uncollectible';

export type PaymentProvider = 'stripe' | 'paypal' | 'razorpay';

export type DateRange = '7d' | '30d' | '90d' | '12m' | string;

export interface CreditTransactionsResponse {
  data: CreditTransaction[];
  meta: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
