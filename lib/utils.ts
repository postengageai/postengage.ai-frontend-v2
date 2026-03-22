import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Detect user's currency from browser locale.
 * Indian locales (en-IN, hi-IN, etc.) → INR, otherwise USD.
 */
function detectCurrency(): {
  currency: string;
  locale: string;
  symbol: string;
  rate: number;
} {
  if (typeof navigator === 'undefined') {
    return { currency: 'USD', locale: 'en-US', symbol: '$', rate: 1 };
  }
  const lang = navigator.language || 'en-US';
  if (
    lang.endsWith('-IN') ||
    lang.startsWith('hi') ||
    lang.startsWith('ta') ||
    lang.startsWith('te') ||
    lang.startsWith('kn') ||
    lang.startsWith('ml') ||
    lang.startsWith('mr') ||
    lang.startsWith('bn') ||
    lang.startsWith('gu') ||
    lang.startsWith('pa')
  ) {
    return { currency: 'INR', locale: 'en-IN', symbol: '₹', rate: 85 };
  }
  return { currency: 'USD', locale: 'en-US', symbol: '$', rate: 1 };
}

let _currencyInfo: ReturnType<typeof detectCurrency> | null = null;

export function getCurrencyInfo() {
  if (!_currencyInfo) _currencyInfo = detectCurrency();
  return _currencyInfo;
}

/**
 * Format a USD amount into the user's local currency.
 * Converts USD → INR for Indian users automatically.
 */
export function formatCurrency(amountUsd: number): string {
  const info = getCurrencyInfo();
  const localAmount = amountUsd * info.rate;
  return new Intl.NumberFormat(info.locale, {
    style: 'currency',
    currency: info.currency,
    maximumFractionDigits: 0,
  }).format(localAmount);
}

/**
 * Get the currency symbol for display (e.g., "$" or "₹").
 */
export function getCurrencySymbol(): string {
  return getCurrencyInfo().symbol;
}

/**
 * Convert a USD hourly rate to local currency.
 */
export function localRate(usdRate: number): number {
  return Math.round(usdRate * getCurrencyInfo().rate);
}
