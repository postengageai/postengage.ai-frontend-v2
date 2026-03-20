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

// Fallback packs shown before the API responds.
// These mirror the INR packages from credit-packages.config.ts on the backend.
// API values always take precedence at runtime.
// Savings % calculated from Starter per-credit rate — no hardcoded strings.
const _fallbackPacks = [
  { id: 'starter_in', name: 'Starter', credits: 650,  price: 749,  currency: 'INR', popular: false, badge: undefined as string | undefined },
  { id: 'growth_in',  name: 'Growth',  credits: 3500, price: 3299, currency: 'INR', popular: true,  badge: 'Most Popular' },
  { id: 'agency_in',  name: 'Agency',  credits: 10000,price: 8299, currency: 'INR', popular: false, badge: 'Best Value' },
];

const _starterRatePerCredit = _fallbackPacks[0].price / _fallbackPacks[0].credits;

export const CREDIT_PACKS = _fallbackPacks.map(p => {
  const ratePerCredit = p.price / p.credits;
  const savingsPct = Math.round((1 - ratePerCredit / _starterRatePerCredit) * 100);
  const aiActions = calculateActions(p.credits, true);
  return {
    ...p,
    description:
      p.name === 'Starter'
        ? `Try it out — ~${aiActions} AI-powered replies to get started.`
        : p.name === 'Growth'
          ? `Best for active creators — ~${aiActions} AI-powered replies per month.`
          : `For power users and agencies — ~${aiActions} AI-powered replies.`,
    savings: savingsPct > 0 ? `Save ${savingsPct}%` : '',
    approx_actions: aiActions,
  };
});

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
