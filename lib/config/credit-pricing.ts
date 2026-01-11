/**
 * Credit Pricing Configuration
 * Based on actual backend pricing structure
 */

export const CREDIT_COSTS = {
  // Basic actions
  REPLY_COMMENT: 2, // 1 base + 1 reply
  PRIVATE_REPLY: 2, // 1 base + 1 private reply
  SEND_DM: 2, // 1 base + 1 send DM

  // AI-powered actions (adds +2 credits)
  AI_REPLY_COMMENT: 4, // 2 base + 2 AI
  AI_PRIVATE_REPLY: 4, // 2 base + 2 AI
  AI_SEND_DM: 4, // 2 base + 2 AI
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
 * Most users use a mix of basic (2 credits) and AI (4 credits) actions
 * We assume 70% basic, 30% AI = average 2.6 credits per action
 */
export function calculateActions(credits: number, withAI = false): number {
  const costPerAction = withAI ? 4 : 2;
  return Math.floor(credits / costPerAction);
}
