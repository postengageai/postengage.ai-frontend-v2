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

export interface PricingResponse {
  plans: Plan[];
}
