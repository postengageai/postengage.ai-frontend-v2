/**
 * Credit Pricing Configuration
 * Based on actual backend pricing structure
 */

export const CREDIT_COSTS = {
  // Manual Actions (Free)
  REPLY_COMMENT: 0,
  PRIVATE_REPLY: 0,
  SEND_DM: 0,

  // AI Actions (Tiered)
  AI_STANDARD: 5, // Standard AI response
  AI_KNOWLEDGE: 8, // With knowledge base context
  AI_FULL_CONTEXT: 12, // Full conversation history + knowledge

  // BYOM (Infrastructure Cost)
  BYOM_INFRA: 1, // Using own API key
} as const;

export const CREDIT_PACKS = [
  {
    id: 'starter',
    name: 'Starter Pack',
    description: 'Perfect for getting started',
    credits: 500,
    price: 499,
    currency: 'INR',
    popular: false,
    savings: '0%',
  },
  {
    id: 'pro',
    name: 'Pro Pack',
    description: 'For growing creators',
    credits: 2000,
    price: 1499,
    currency: 'INR',
    popular: true,
    savings: '25%',
  },
  {
    id: 'business',
    name: 'Business Pack',
    description: 'For power users & agencies',
    credits: 10000,
    price: 5999,
    currency: 'INR',
    popular: false,
    savings: '40%',
  },
] as const;

/**
 * Calculate actions from credits based on average action cost
 * Most users use a mix of free manual actions and paid AI actions
 * We assume mostly AI usage for estimation
 */
export function calculateActions(credits: number, withAI = true): number {
  if (!withAI) return Infinity; // Manual actions are free
  const averageAiCost = 5; // Standard tier
  return Math.floor(credits / averageAiCost);
}
