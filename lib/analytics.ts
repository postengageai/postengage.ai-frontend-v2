/**
 * PostHog analytics wrapper.
 *
 * Usage:
 *   import { analytics } from '@/lib/analytics';
 *   analytics.track('bot_first_reply', { bot_id: '...' });
 *   analytics.identify(userId, { email, plan });
 */

import posthog from 'posthog-js';

// ─── Event catalogue ─────────────────────────────────────────────────────────

export type AnalyticsEvent =
  | {
      name: 'onboarding_step_completed';
      properties: { step: string; step_index: number };
    }
  | { name: 'onboarding_wizard_dismissed'; properties: { step: string } }
  | { name: 'onboarding_wizard_completed'; properties: Record<string, never> }
  | {
      name: 'bot_first_reply';
      properties: { bot_id: string; bot_name?: string };
    }
  | {
      name: 'lead_card_clicked';
      properties: { lead_id: string; intent: string; username?: string };
    }
  | {
      name: 'tune_up_rating_submitted';
      properties: { rating: 'good' | 'bad'; bot_id?: string };
    }
  | { name: 'automation_created'; properties: { automation_id: string } }
  | {
      name: 'automation_toggled';
      properties: { automation_id: string; enabled: boolean };
    }
  | {
      name: 'credits_purchased';
      properties: { package_id: string; credits: number };
    }
  | {
      name: 'voice_dna_analyzed';
      properties: { voice_dna_id: string; samples: number };
    }
  | {
      name: 'ab_test_variant_started';
      properties: { bot_id: string; variant: 'A' | 'B' };
    }
  | { name: 'whatsapp_waitlist_joined'; properties: Record<string, never> };

// ─── Init ─────────────────────────────────────────────────────────────────────

let initialised = false;

function init() {
  if (initialised) return;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host =
    process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com';

  if (!key) return; // no key in dev / env not set — silently skip

  posthog.init(key, {
    api_host: host,
    person_profiles: 'identified_only',
    capture_pageview: true,
    capture_pageleave: true,
    autocapture: false, // manual only — avoids noisy events
    loaded: ph => {
      if (process.env.NODE_ENV === 'development') {
        ph.debug();
      }
    },
  });

  initialised = true;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const analytics = {
  /**
   * Identify a user after login / session restore.
   * Call this once per session when the user object is available.
   */
  identify(
    userId: string,
    traits?: { email?: string; name?: string; plan?: string }
  ) {
    if (typeof window === 'undefined') return;
    init();
    posthog.identify(userId, traits);
  },

  /**
   * Track a typed event.
   */
  track<E extends AnalyticsEvent>(
    name: E['name'],
    properties: E['properties']
  ) {
    if (typeof window === 'undefined') return;
    init();
    posthog.capture(name, properties as Record<string, unknown>);
  },

  /**
   * Reset identity on logout.
   */
  reset() {
    if (typeof window === 'undefined') return;
    posthog.reset();
  },
};
