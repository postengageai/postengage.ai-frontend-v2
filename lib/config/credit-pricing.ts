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
  AI_STANDARD: 8, // Standard AI response
  AI_KNOWLEDGE: 12, // With knowledge base context
  AI_FULL_CONTEXT: 18, // Full conversation history + knowledge

  // BYOM (Infrastructure Cost)
  BYOM_INFRA: 1, // Using own API key
} as const;

export const CREDIT_PACKS = [
  {
    id: 'starter',
    name: 'Starter Pack',
    description:
      'Start Your Growth Engine. Power ~55 AI replies — perfect for getting started.',
    credits: 500,
    price: 199,
    currency: 'INR',
    popular: false,
    savings: '0%',
  },
  {
    id: 'pro',
    name: 'Pro Pack',
    description:
      'Scale Your Presence. Power ~300 AI replies and turn engagement into revenue.',
    credits: 2800,
    price: 999,
    currency: 'INR',
    popular: true,
    savings: '15%',
  },
  {
    id: 'business',
    name: 'Business Pack',
    description:
      'Dominate Your Niche. Power ~1,650 AI replies — built for agencies & brands.',
    credits: 15000,
    price: 3999,
    currency: 'INR',
    popular: false,
    savings: '35%',
  },
] as const;

/**
 * Calculate actions from credits based on average action cost
 * Most users use a mix of free manual actions and paid AI actions
 * We assume mostly AI usage for estimation
 */
export function calculateActions(credits: number, withAI = true): number {
  if (!withAI) return Infinity; // Manual actions are free
  // Standard AI cost (8) + Infrastructure cost (1) = 9 credits per reply
  const averageAiCost = 9;
  return Math.floor(credits / averageAiCost);
}
