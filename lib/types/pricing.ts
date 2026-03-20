export interface CreditPackage {
  id: string;
  name: string;
  description: string;
  credits: number | null;
  price: number | null;
  currency: string;
  popular: boolean;
  savings: string;
  approx_actions: number | null;
  /** Display badge, e.g. "Most Popular" or "Best Value" */
  badge?: string;
  /** True for the Enterprise tier — no payment flow, shows Contact Sales CTA */
  is_enterprise?: boolean;
  /** CTA label, e.g. "Buy Now" or "Contact Sales" */
  cta?: string;
  /** Credits hint for Enterprise, e.g. "50,000+ credits" */
  credits_hint?: string;
  /** Feature list for Enterprise card */
  features?: string[];
}

export interface CreditCosts {
  REPLY_COMMENT: number;
  PRIVATE_REPLY: number;
  SEND_DM: number;
  AI_REPLY_COMMENT: number;
  AI_PRIVATE_REPLY: number;
  AI_SEND_DM: number;
}

export interface AppBotLimits {
  default_max_replies_per_hour: number;
  default_max_replies_per_day: number;
  default_reply_delay_min_seconds: number;
  default_reply_delay_max_seconds: number;
  max_reply_delay_seconds: number;
  max_cooldown_hours: number;
  max_replies_per_hour_cap: number;
  max_replies_per_day_cap: number;
}

export interface AppKnowledgeLimits {
  max_file_size_mb: number;
  supported_file_types: string[];
}

export interface AppLimits {
  bot: AppBotLimits;
  knowledge: AppKnowledgeLimits;
}

export interface PricingResponse {
  costs: CreditCosts;
  packs: CreditPackage[];
  /** App-level limits and bot defaults sourced from backend env config */
  app_limits?: AppLimits;
  location: {
    country: string;
    country_code: string;
    currency: string;
  } | null;
}
