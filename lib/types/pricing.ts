export interface CreditPackage {
  id: string;
  name: string;
  description: string;
  credits: number;
  price: number;
  currency: string;
  popular: boolean;
  savings: string;
  approx_actions: number;
}

export interface CreditCosts {
  REPLY_COMMENT: number;
  PRIVATE_REPLY: number;
  SEND_DM: number;
  AI_REPLY_COMMENT: number;
  AI_PRIVATE_REPLY: number;
  AI_SEND_DM: number;
}

export interface PricingResponse {
  costs: CreditCosts;
  packs: CreditPackage[];
  location: {
    country: string;
    country_code: string;
    currency: string;
  } | null;
}
