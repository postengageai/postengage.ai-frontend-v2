export interface CreateOrderDto {
  plan_id: string;
  billing_cycle?: 'monthly' | 'annual';
}

export interface CreateOrderResponse {
  order_id: string;
  amount: number;
  amount_paid: number;
  currency: string;
  receipt: string;
  status: 'created' | 'attempted' | 'paid';
  attempts: number;
  notes: {
    plan_id: string;
    user_id: string;
  };
  created_at: number;
}

export interface VerifyPaymentDto {
  order_id: string;
  payment_id: string;
  signature: string;
}

export interface VerifyPaymentResponse {
  order_id: string;
  payment_id: string;
  status: 'captured' | 'pending' | 'failed';
  amount: number;
  currency: string;
}

export interface PaymentRecord {
  id: string;
  user_id: string;
  order_id: string;
  payment_id: string;
  plan_id: string;
  plan_name: string;
  amount: number;
  currency: string;
  billing_cycle: 'monthly' | 'annual';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  razorpay_order_id: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  created_at: string;
  updated_at: string;
}

export interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  currency: string;
  features: string[];
  limits: {
    social_accounts: number;
    automations: number;
    monthly_credits: number;
    bots: number;
    knowledge_sources: number;
  };
  is_popular: boolean;
  is_active: boolean;
}
