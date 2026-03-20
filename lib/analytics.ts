/**
 * Unified analytics wrapper — PostHog + GA4 + GTM dataLayer.
 *
 * Usage:
 *   import { analytics } from '@/lib/analytics';
 *   analytics.track('bot_first_reply', { bot_id: '...' });
 *   analytics.identify(userId, { email, plan });
 */

import posthog from 'posthog-js';
import Clarity from '@microsoft/clarity';
import { sendGAEvent, pushToDataLayer } from '@/lib/gtag';

// ─── Event catalogue ─────────────────────────────────────────────────────────

export type AnalyticsEvent =
  // ── Auth ──────────────────────────────────────────────────────────────────
  | {
      name: 'user_signed_up';
      properties: { has_ref_code: boolean };
    }
  | {
      name: 'user_logged_in';
      properties: { method: 'email' | 'oauth' };
    }
  | {
      name: 'user_login_failed';
      properties: { reason: string };
    }
  | {
      name: 'user_logged_out';
      properties: Record<string, never>;
    }
  | {
      name: 'password_reset_requested';
      properties: Record<string, never>;
    }
  | {
      name: '2fa_completed';
      properties: Record<string, never>;
    }
  // ── Onboarding ────────────────────────────────────────────────────────────
  | {
      name: 'onboarding_step_completed';
      properties: { step: string; step_index: number };
    }
  | { name: 'onboarding_wizard_dismissed'; properties: { step: string } }
  | {
      name: 'onboarding_wizard_completed';
      properties: Record<string, never>;
    }
  // ── Automations ───────────────────────────────────────────────────────────
  | {
      name: 'automation_created';
      properties: { automation_id: string; trigger_type?: string };
    }
  | {
      name: 'automation_toggled';
      properties: { automation_id: string; enabled: boolean };
    }
  | {
      name: 'automation_deleted';
      properties: { automation_id: string; automation_name: string };
    }
  | {
      name: 'automation_viewed';
      properties: { automation_id: string };
    }
  // ── Leads ─────────────────────────────────────────────────────────────────
  | {
      name: 'lead_card_clicked';
      properties: { lead_id: string; intent: string; username?: string };
    }
  | {
      name: 'lead_added_manually';
      properties: { platform?: string };
    }
  | {
      name: 'leads_exported';
      properties: { total_count: number; format: string };
    }
  | {
      name: 'lead_tag_filtered';
      properties: { tag: string };
    }
  // ── Intelligence / Bots ───────────────────────────────────────────────────
  | {
      name: 'bot_created';
      properties: { bot_id: string; bot_name?: string };
    }
  | {
      name: 'bot_deleted';
      properties: { bot_id: string; bot_name?: string };
    }
  | {
      name: 'bot_first_reply';
      properties: { bot_id: string; bot_name?: string };
    }
  | {
      name: 'tune_up_rating_submitted';
      properties: { rating: 'good' | 'bad'; bot_id?: string };
    }
  | {
      name: 'ab_test_variant_started';
      properties: { bot_id: string; variant: 'A' | 'B' };
    }
  // ── Voice DNA / Brand Voice ───────────────────────────────────────────────
  | {
      name: 'voice_dna_analyzed';
      properties: { voice_dna_id: string; samples: number };
    }
  | {
      name: 'brand_voice_created';
      properties: { brand_voice_id: string; name?: string };
    }
  // ── Credits ───────────────────────────────────────────────────────────────
  | {
      name: 'credits_purchased';
      properties: { package_id: string; credits: number; amount_usd?: number };
    }
  | {
      name: 'buy_credits_page_viewed';
      properties: Record<string, never>;
    }
  // ── Support ───────────────────────────────────────────────────────────────
  | {
      name: 'support_ticket_created';
      properties: { ticket_id: string; category: string };
    }
  | {
      name: 'support_ticket_viewed';
      properties: { ticket_id: string; status: string };
    }
  | {
      name: 'support_message_sent';
      properties: { ticket_id: string };
    }
  // ── Settings ──────────────────────────────────────────────────────────────
  | {
      name: 'social_account_connected';
      properties: { platform: string };
    }
  | {
      name: 'social_account_disconnected';
      properties: { platform: string };
    }
  | {
      name: 'profile_updated';
      properties: { updated_fields: string[] };
    }
  | {
      name: '2fa_enabled';
      properties: Record<string, never>;
    }
  | {
      name: '2fa_disabled';
      properties: Record<string, never>;
    }
  // ── Misc / Waitlist ───────────────────────────────────────────────────────
  | {
      name: 'whatsapp_waitlist_joined';
      properties: Record<string, never>;
    }
  | {
      name: 'affiliate_page_viewed';
      properties: Record<string, never>;
    };

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
   * Fires to PostHog + Microsoft Clarity simultaneously.
   * Call this once per session when the user object is available.
   */
  identify(
    userId: string,
    traits?: { email?: string; name?: string; plan?: string }
  ) {
    if (typeof window === 'undefined') return;
    init();

    // PostHog
    posthog.identify(userId, traits);

    // Microsoft Clarity — identify(customId, sessionId?, pageId?, friendlyName?)
    // friendlyName shows as a human-readable label in the Clarity dashboard
    try {
      const friendlyName = traits?.name ?? traits?.email ?? userId;
      Clarity.identify(userId, undefined, undefined, friendlyName);
      // Tag email separately so it's searchable in Clarity filters
      if (traits?.email) Clarity.setTag('email', traits.email);
      if (traits?.plan) Clarity.setTag('plan', traits.plan);
    } catch {
      // Clarity may not be initialised yet — safe to swallow
    }

    // GTM dataLayer — push user context for GA4 user_id linking
    pushToDataLayer({
      event: 'user_identified',
      user_id: userId,
      ...(traits?.email ? { user_email: traits.email } : {}),
      ...(traits?.plan ? { user_plan: traits.plan } : {}),
    });
  },

  /**
   * Track a typed event — fires to PostHog, GA4, and GTM dataLayer.
   */
  track<E extends AnalyticsEvent>(
    name: E['name'],
    properties: E['properties']
  ) {
    if (typeof window === 'undefined') return;
    init();

    // PostHog
    posthog.capture(name, properties as Record<string, unknown>);

    // GA4
    sendGAEvent({
      action: name,
      category: 'app',
      label: name,
    });

    // GTM dataLayer
    pushToDataLayer({
      event: name,
      ...(properties as Record<string, unknown>),
    });
  },

  /**
   * Reset identity on logout.
   */
  reset() {
    if (typeof window === 'undefined') return;
    posthog.reset();
  },
};
