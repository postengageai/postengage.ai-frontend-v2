/**
 * Google Analytics 4 / GTM helper.
 * Mirrors the landing page lib/gtag.ts so the same events fire
 * whether the user is on the marketing site or inside the app.
 */

export type GAEvent = {
  action: string;
  category: string;
  label: string;
  value?: number;
};

// Extend Window with gtag + dataLayer
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js' | 'set',
      target: string | Date,
      params?: Record<string, unknown>
    ) => void;
    dataLayer: Record<string, unknown>[];
  }
}

/** Send a named event to GA4 via the global gtag() function. */
export function sendGAEvent({ action, category, label, value }: GAEvent): void {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    ...(value !== undefined ? { value } : {}),
  });
}

/** Push an arbitrary object into the GTM dataLayer. */
export function pushToDataLayer(data: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(data);
}
