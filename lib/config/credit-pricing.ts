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
    description:
      'Start Your Growth Engine. Automate ~190 interactions and never miss a lead.',
    credits: 500,
    price: 149,
    currency: 'INR',
    popular: false,
    savings: '0%',
  },
  {
    id: 'pro',
    name: 'Pro Pack',
    description:
      'Scale Your Presence. Handle 4x more volume and turn engagement into revenue.',
    credits: 2800,
    price: 699,
    currency: 'INR',
    popular: true,
    savings: '15%',
  },
  {
    id: 'business',
    name: 'Business Pack',
    description:
      'Dominate Your Niche. Maximum power for agencies & brands at our best rate.',
    credits: 15000,
    price: 2999,
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
  // Standard AI cost (5) + Infrastructure cost (1) = 6 credits per reply
  const averageAiCost = 6;
  return Math.floor(credits / averageAiCost);
}
