import { httpClient, SuccessResponse } from '../http/client';

const BASE = '/api/v1/affiliates';

export interface Affiliate {
  id: string;
  code: string;
  status: 'active' | 'paused' | 'suspended';
  referral_url: string;
  click_count: number;
  referred_count: number;
  /** Total credits earned from referrals (each referral awards 1–6 credits randomly) */
  credits_earned: number;
  created_at: string;
  updated_at: string;
}

export interface JoinAffiliateDto {
  // No fields needed — the program is free to join
}

export const AffiliateApi = {
  /** POST /affiliates/join — opt into the affiliate program */
  join: (dto: JoinAffiliateDto = {}) =>
    httpClient.post<SuccessResponse<Affiliate>>(`${BASE}/join`, dto),

  /** GET /affiliates/me — get caller's affiliate stats */
  getMyAffiliate: () =>
    httpClient.get<SuccessResponse<Affiliate>>(`${BASE}/me`),

  /** POST /affiliates/track/:code — record a referral link click (public) */
  trackClick: (code: string) =>
    httpClient.post<SuccessResponse<{ code: string }>>(`${BASE}/track/${code}`, {}),
};
