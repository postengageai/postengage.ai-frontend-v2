/**
 * Google Identity Services (GSI) loader and initializer.
 *
 * Lazily loads the GSI script the first time it's needed and caches
 * the resulting `google.accounts.id` client for subsequent calls.
 */

/* ─── GSI type declarations ─────────────────────────────────────────────────── */

interface GoogleCredentialResponse {
  credential: string; // The id_token JWT
  select_by: string;
}

interface GoogleIdConfiguration {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
  context?: string;
  ux_mode?: 'popup' | 'redirect';
}

interface GoogleAccountsId {
  initialize: (config: GoogleIdConfiguration) => void;
  prompt: (
    notification?: (n: { isNotDisplayed: () => boolean }) => void
  ) => void;
  renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
  revoke: (hint: string, callback: () => void) => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: GoogleAccountsId;
      };
    };
  }
}

/* ─── Script loader ─────────────────────────────────────────────────────────── */

const GSI_SCRIPT_URL = 'https://accounts.google.com/gsi/client';

let loadPromise: Promise<void> | null = null;

/**
 * Load the Google Identity Services script exactly once.
 * Returns a promise that resolves when `window.google.accounts.id` is ready.
 */
function loadGsiScript(): Promise<void> {
  if (loadPromise) return loadPromise;

  loadPromise = new Promise<void>((resolve, reject) => {
    // Already loaded (e.g. via a <script> tag in _document)
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = GSI_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      loadPromise = null; // allow retry
      reject(new Error('Failed to load Google Identity Services script'));
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}

/* ─── Public API ────────────────────────────────────────────────────────────── */

/**
 * Load the GSI library, initialize it with the app's client ID, and trigger
 * the One Tap / popup flow. Returns the raw `id_token` (JWT) on success.
 *
 * @throws {Error} If the script fails to load or the user cancels.
 */
export async function promptGoogleSignIn(): Promise<string> {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error('NEXT_PUBLIC_GOOGLE_CLIENT_ID is not configured');
  }

  await loadGsiScript();

  const google = window.google;
  if (!google?.accounts?.id) {
    throw new Error('Google Identity Services failed to initialize');
  }

  return new Promise<string>((resolve, reject) => {
    google.accounts.id.initialize({
      client_id: clientId,
      callback: (response: GoogleCredentialResponse) => {
        if (response.credential) {
          resolve(response.credential);
        } else {
          reject(new Error('No credential received from Google'));
        }
      },
      cancel_on_tap_outside: true,
      ux_mode: 'popup',
    });

    // Trigger the prompt
    google.accounts.id.prompt(notification => {
      if (notification.isNotDisplayed()) {
        // One Tap couldn't be shown — fall back to a direct OAuth popup.
        // This happens when cookies are blocked, user dismissed previously, etc.
        reject(
          new Error(
            'Google Sign-In popup could not be displayed. Please allow popups and try again.'
          )
        );
      }
    });
  });
}
