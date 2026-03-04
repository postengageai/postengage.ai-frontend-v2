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

export interface CreditCosts {
  [key: string]: number;
}

export interface UserLocation {
  country: string;
  country_code: string;
  currency: string;
}

export interface PricingResponse {
  costs: CreditCosts;
  packs: CreditPackage[];
  location: UserLocation | null;
}

// Keeping Plan interface for backward compatibility if needed,
// but marked as deprecated or mapped to CreditPackage
export interface Plan extends CreditPackage {
  // Mapping old fields to new ones where possible or optional
  slug?: string;
  price_monthly?: number;
  price_yearly?: number;
  features?: string[];
  limits?: {
    social_accounts: number;
    automations: number;
    monthly_credits: number;
    bots: number;
    knowledge_sources: number;
  };
  is_popular?: boolean;
  is_active?: boolean;
}
