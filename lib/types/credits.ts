export interface CreditBalance {
  available_credits: number;
}

export interface CreditTransaction {
  _id: string;
  user_id: string;
  credit_package_id: string | null;
  order_id: string | null;
  automation_id: string | null;
  transaction_type: 'consumption' | 'purchase' | 'adjustment';
  status: 'completed' | 'cancelled' | 'pending';
  credit_amount: number;
  balance_before: number;
  balance_after: number;
  description: string;
  reference_id: string | null;
  operation_id: string | null;
  failure_reason: string | null;
  processed_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreditUsage {
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

export type DateRange = '7d' | '30d' | 'custom';

export type PaymentProvider = 'stripe' | 'razorpay' | 'paypal';

export type InvoiceStatus =
  | 'succeeded'
  | 'pending'
  | 'failed'
  | 'refunded'
  | 'partially_refunded';

export interface Invoice {
  _id: string;
  invoice_number: string;
  user_id: string;
  order_id: string;
  payment_provider: PaymentProvider;
  payment_id: string; // Provider's payment/transaction ID
  status: InvoiceStatus;
  amount: number;
  currency: string;
  credits_purchased: number;
  package_name: string;
  tax_amount?: number;
  discount_amount?: number;
  billing_email: string;
  billing_name?: string;
  billing_address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
  refund_amount?: number;
  refund_reason?: string;
  refunded_at?: string;
  paid_at?: string;
  created_at: string;
  updated_at: string;
}
