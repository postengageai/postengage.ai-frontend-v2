export interface CreateOrderDto {
  packageId: string;
}

export interface Payment {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  order_id: string;
  provider: string;
  provider_payment_id: string;
  status: string;
  amount: number;
  currency_id: string;
  amount_refunded: number | null;
  paid_at: string | null;
  failed_at: string | null;
  _links?: Record<string, { href: string; method?: string }>;
}

export interface Order {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  credit_package_id: string;
  status: string;
  amount: number;
  currency_id: string;
  payment_provider: string | null;
  total_amount: number;
  tax_rate: number;
  discount_amount: number;
  paid_at: string | null;
  cancelled_at: string | null;
  _links?: Record<string, { href: string; method?: string }>;
}

export interface BackendCreditPackage {
  _id: string;
  name: string;
  description: string;
  credit_amount: number;
  price: number;
  currency_id: string;
  tax_rate: number;
  status: string;
  metadata?: Record<string, unknown>;
  is_featured: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateOrderResponse {
  order_id: string;
  amount: number;
  currency: string;
  key: string;
  package: BackendCreditPackage;
  internal_order_id: string;
}

export interface VerifyPaymentDto {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  new_balance?: number;
  message?: string;
}

export interface PaymentRecord {
  id: string;
  user_id: string;
  credit_package_id: string;
  currency_id: string;
  amount: number;
  total_amount: number;
  status: 'created' | 'paid' | 'failed';
  provider_order_id: string;
  payment_provider: 'razorpay';
  tax_rate: number;
  created_at: string;
  updated_at: string;
}

export interface CreditPackage {
  id: string;
  name: string;
  description: string;
  credits: number;
  price: number;
  currency: string;
  popular: boolean;
  savings: string;
  tax_rate: number;
  approx_actions: number;
}

export interface PackagesResponse {
  costs: Record<string, number>;
  packs: CreditPackage[];
  location: {
    country: string;
    country_code: string;
    currency: string;
  } | null;
}
