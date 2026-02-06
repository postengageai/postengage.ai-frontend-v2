export interface Referral {
  _id: string;
  referrer_id: string;
  referral_code: string;
  status: 'active' | 'inactive' | 'expired';
  credit_bonus_amount: number;
  usage_count: number;
  created_at: string;
  updated_at: string;
  expired_at?: string | null;
  notes?: string;
}

export interface ReferralUsage {
  _id: string;
  referral_id: string;
  referrer_id: string;
  referred_user_id: string;
  bonus_amount: number;
  created_at: string;
  updated_at: string;
}

export interface CreateReferralRequest {
  referral_code: string;
  credit_bonus_amount?: number;
  notes?: string;
}
